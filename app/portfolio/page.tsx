"use client";
import PortfolioView from "@/components/PortfolioView";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useUser } from "@/context/UserContext";
import { useCurrency } from "@/context/CurrencyContext";
import LoadingScreen from "@/components/LoadingScreen";
import { Loader2 } from "lucide-react";

interface CollectionData {
  collection: string;
  name: string;
  quantity: number;
  image_url: string;
  is_verified: boolean;
  floor_price?: number;
  total_value?: number;
}

export default function AddressPage() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const {
    userData,
    ensData,
    setUserData,
    setEnsData,
    isLoading,
    setIsLoading,
    error,
    setError,
  } = useUser() as any;

  const { selectedCurrency } = useCurrency();

  const [collections, setCollections] = useState<CollectionData[]>([]);
  const [ethPrice, setEthPrice] = useState<number>(0);
  const [totalNfts, setTotalNfts] = useState<number>(0);
  const [totalValue, setTotalValue] = useState<number>(0);
  const [fetchingNFTs, setFetchingNFTs] = useState(false);
  const [fetchProgress, setFetchProgress] = useState({
    status: "Initializing...",
    count: 0,
    startTime: 0,
  });
  // First, let's add a utility function for retrying fetch operations
  const fetchWithRetry = async (
    url: string,
    options?: RequestInit,
    maxRetries = 3,
    delay = 1000
  ) => {
    let retries = 0;

    while (retries < maxRetries) {
      try {
        const response = await fetch(url, options);

        // Special handling for user profile endpoint
        if (url.includes("/api/get-user-profile")) {
          // For 404 responses (address not found), don't retry
          if (response.status === 404) {
            console.log("User profile not found (404), skipping retries");
            return response;
          }

          // For other responses, check if it contains the "not found" error message
          if (!response.ok) {
            const clonedResponse = response.clone();
            try {
              const data = await clonedResponse.json();
              if (
                data.error &&
                (data.error.includes("not found") ||
                  (data.details && data.details.includes("not found")))
              ) {
                console.log("User profile not found error, skipping retries");
                return response;
              }
            } catch (e) {
              // If we can't parse the JSON, continue with normal retry logic
            }
          }
        }

        if (!response.ok) {
          throw new Error(`Network response was not ok: ${response.status}`);
        }

        return response;
      } catch (error) {
        retries++;
        console.log(
          `Attempt ${retries}/${maxRetries} failed. Retrying in ${delay}ms...`
        );

        if (retries >= maxRetries) {
          throw error;
        }

        // Wait before retrying
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }

    throw new Error("Failed to fetch after maximum retries");
  };
  // Update the ETH price fetch to use the retry mechanism
  useEffect(() => {
    (async () => {
      try {
        const response = await fetchWithRetry(`/api/fetch-ethereum-prices`);
        const data = await response?.json();
        setEthPrice(data.ethPrice[selectedCurrency.code.toLowerCase()]);
      } catch (error) {
        console.error("Error fetching ETH price:", error);
      }
    })();
  }, [selectedCurrency]);
  // In your fetchCollectionsAndInfo function
  useEffect(() => {
    const fetchCollectionsAndInfo = async () => {
      try {
        // Add loading state
        setIsLoading(true);
        setFetchingNFTs(true);
        setFetchProgress({
          status: "Initializing connection...",
          count: 0,
          startTime: Date.now(),
        });

        // Fetch NFTs with fewer API calls
        let _collectionArray: any[] = [];
        let _next = "";
        let batchCount = 0;

        do {
          batchCount++;
          setFetchProgress((prev) => ({
            ...prev,
            status: `Fetching NFTs (batch ${batchCount})...`,
            count: _collectionArray.length,
          }));

          // Use the improved API that fetches multiple pages at once
          const url = `/api/get-nft-by-account?address=${id}${
            _next ? `&next=${_next}` : ""
          }&maxPages=5`; // Fetch 5 pages at once (1000 NFTs)

          // Use fetchWithRetry instead of regular fetch
          const response = await fetchWithRetry(url);
          const nftByAccountResponse = await response?.json();

          if (nftByAccountResponse.nfts?.length) {
            _collectionArray = [
              ..._collectionArray,
              ...nftByAccountResponse.nfts,
            ];

            setFetchProgress((prev) => ({
              ...prev,
              count: _collectionArray.length,
            }));
          }

          _next = nftByAccountResponse.next || "";
        } while (_next);

        // Update total NFTs count
        setTotalNfts(_collectionArray.length);
        setFetchProgress((prev) => ({
          ...prev,
          status: "Processing collections...",
          count: _collectionArray.length,
        }));

        // Calculate collection frequencies - optimized with reduce
        const nftFreqMap = _collectionArray.reduce((acc, nft) => {
          if (!nft.collection) return acc;
          acc.set(nft.collection, (acc.get(nft.collection) || 0) + 1);
          return acc;
        }, new Map());

        // Skip further processing if no collections found
        if (nftFreqMap.size === 0) {
          setCollections([]);
          setTotalValue(0);
          setIsLoading(false);
          setFetchingNFTs(false);
          return;
        }

        const nftData = Array.from(nftFreqMap, ([collection, count]) => ({
          collection,
          count,
        }));

        // Extract collection slugs and filter out any undefined/null values
        const collectionSlugs = nftData
          .map((item) => item.collection)
          .filter(Boolean);

        setFetchProgress((prev) => ({
          ...prev,
          status: `Fetching data for ${collectionSlugs.length} collections...`,
        }));

        // Use batch-collections API with error handling and retry
        const batchResponse = await fetchWithRetry("/api/batch-collections", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ collections: collectionSlugs }),
        });

        const batchData = await batchResponse?.json();
        const collectionsData = batchData.data || {};

        // Process collection data - optimized with map and reduce
        const collectionDetails = nftData.map((item) => {
          const collectionSlug = item.collection;
          const collectionInfo = collectionsData[collectionSlug]?.info || {};
          const priceInfo = collectionsData[collectionSlug]?.price || {};
          const floorPrice = priceInfo.floor_price || 0;

          return {
            collection: collectionSlug,
            name: collectionInfo.name || collectionSlug,
            quantity: item.count,
            image_url: collectionInfo.image_url || "",
            is_verified: collectionInfo.safelist_status === "verified",
            floor_price: floorPrice,
            total_value: floorPrice * item.count,
          };
        });

        // Calculate total value in one pass
        const totalPortfolioValue = collectionDetails.reduce(
          (sum, item) => sum + (item.total_value || 0),
          0
        );

        // Update state with all data at once
        setTotalValue(totalPortfolioValue);
        setCollections(collectionDetails);
      } catch (error) {
        console.error("Error fetching collection data:", error);
        setError(
          error instanceof Error
            ? error.message
            : "Failed to fetch collection data"
        );
      } finally {
        setIsLoading(false);
        setFetchingNFTs(false);
      }
    };

    if (id) {
      fetchCollectionsAndInfo();
    } else {
      setIsLoading(false);
    }
  }, [id, setError, setIsLoading]);
  // Also update the user profile and ENS data fetch
  useEffect(() => {
    if (!id) {
      setError("No address provided");
      setIsLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Fetch ENS data first
        const ensResponse = await fetchWithRetry(`/api/get-ens?id=${id}`);
        const ensJson = await ensResponse?.json();
        setEnsData(ensJson);

        // Then fetch user profile data
        try {
          const userResponse = await fetchWithRetry(
            `/api/get-user-profile?id=${id}`
          );
          const userJson = await userResponse?.json();

          // Check if there's an error in the response
          if (userJson.error) {
            console.warn("OpenSea profile not found:", userJson.error);
            // Set minimal user data instead of failing
            setUserData({
              address: id,
              username:
                ensJson?.ens ||
                `${id.substring(0, 6)}...${id.substring(id.length - 4)}`,
              profile_image_url: "",
            });
          } else {
            setUserData(userJson);
          }
        } catch (userError) {
          console.warn("Error fetching user profile:", userError);
          // Set minimal user data on error
          setUserData({
            address: id,
            username:
              ensJson?.ens ||
              `${id.substring(0, 6)}...${id.substring(id.length - 4)}`,
            profile_image_url: "",
          });
        }
      } catch (err) {
        console.error("Error in data fetching:", err);
        // Only set error if it's not a "not found" error
        if (err instanceof Error && !err.message.includes("not found")) {
          setError(err.message || "An error occurred");
        } else {
          // For "not found" errors, set minimal data
          setUserData({
            address: id,
            username: `${id.substring(0, 6)}...${id.substring(id.length - 4)}`,
            profile_image_url: "",
          });
          setEnsData({ ens: "" });
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id, setUserData, setEnsData, setIsLoading, setError]);
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 max-w-md w-full shadow-sm text-center">
          <h2 className="text-xl font-semibold text-red-700 dark:text-red-400 mb-2">
            Something went wrong
          </h2>
          <p className="text-red-600 dark:text-red-300 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="w-24 bg-red-100 hover:bg-red-200 dark:bg-red-800 dark:hover:bg-red-700 text-red-700 dark:text-red-200 px-4 py-2 rounded-md text-sm transition-colors"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }
  // Update the user object creation to handle missing data more gracefully
  const user: any = {
    name:
      userData?.username ||
      `${id?.substring(0, 6)}...${id?.substring(id?.length - 4) || ""}`,
    ethHandle: ensData?.ens || "",
    ethAddress: userData?.address || id || "",
    avatar: userData?.profile_image_url || "",
  };
  return (
    <>
      {fetchingNFTs && (
        <LoadingScreen
          status={fetchProgress.status}
          count={fetchProgress.count}
          startTime={fetchProgress.startTime}
        />
      )}

      {isLoading || !userData || !ensData ? (
        <div className="fixed inset-0 flex items-center justify-center">
          <div className="flex flex-col items-center space-y-3">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span>Loading profile data...</span>
          </div>
        </div>
      ) : (
        <PortfolioView
          user={user}
          data={collections}
          ethPrice={ethPrice}
          totalNfts={totalNfts}
          totalValue={totalValue}
          selectedCurrency={selectedCurrency}
        />
      )}
    </>
  );
}
