"use client";

import { useState, useEffect, useMemo } from "react";
import { useUser } from "@/context/UserContext";
import { useFormattedEthPrice } from "@/hooks/useEthPriceQuery";
import { fetchWithRetry } from "../lib/fetchWithRetry";
import { CollectionData } from "@/types/nft";
import { useAddressResolver } from "@/hooks/useUserQuery"; // Updated import

export function usePortfolioData(id: string | null) {
  const { setError, setIsLoading } = useUser();
  const { price: ethPrice } = useFormattedEthPrice();
  const [collections, setCollections] = useState<CollectionData[]>([]);
  const [totalNfts, setTotalNfts] = useState(0);
  const [totalValue, setTotalValue] = useState(0);
  const [fetchProgress, setFetchProgress] = useState({
    status: "Initializing...",
    count: 0,
    startTime: 0,
  });
  const [fetchingNFTs, setFetchingNFTs] = useState(false);
  // Add this at the top of your usePortfolioData function
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);
  // Use ENS resolver hook to handle address validation and resolution
  const {
    ethAddress,
    isEnsName,
    isValidAddress,
    isResolving,
    error: resolverError,
  } = useAddressResolver(id);
  // Set error from resolver if present
  useEffect(() => {
    if (resolverError) {
      setError(resolverError);
    }
  }, [resolverError, setError]);
  // Collections fetch effect - only run when we have a valid resolved address
  useEffect(() => {
    if (!ethAddress || !isValidAddress) {
      return;
    }
    const fetchCollectionsAndInfo = async () => {
      // Clear any existing timeout
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      // Set a safety timeout to ensure loading state is reset after 2 minutes
      const newTimeoutId = setTimeout(() => {
        console.log("Safety timeout triggered - resetting loading states");
        setIsLoading(false);
        setFetchingNFTs(false);
      }, 120000); // 2 minutes

      setTimeoutId(newTimeoutId);

      try {
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
        let maxBatches = 50; // Add a safety limit to prevent infinite loops

        do {
          batchCount++;
          setFetchProgress((prev) => ({
            ...prev,
            status: `Fetching NFTs (batch ${batchCount})...`,
            count: _collectionArray.length,
          }));
          // Use the resolved address for API calls
          const url = `/api/nft/by-account?address=${ethAddress}${
            _next ? `&next=${encodeURIComponent(_next)}` : ""
          }&maxPages=5`; // Fetch 5 pages at once (1000 NFTs)

          console.log(`Fetching batch ${batchCount}, URL: ${url}`);

          // Use fetchWithRetry instead of regular fetch
          const response = await fetchWithRetry(url);
          if (!response) {
            console.error("No response received from API");
            break; // Break the loop if no response
          }

          const nftByAccountResponse = await response.json();
          console.log(`Batch ${batchCount} response:`, {
            nftsCount: nftByAccountResponse.nfts?.length || 0,
            next: nftByAccountResponse.next || "none",
          });

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
          // Store the next cursor and check if it's the same as before
          const previousNext = _next;
          _next = nftByAccountResponse.next || "";
          // Break the loop if we get the same cursor twice or if we've reached our batch limit
          if (
            _next === previousNext ||
            _next === "" ||
            batchCount >= maxBatches
          ) {
            console.log(
              `Breaking loop: ${
                _next === previousNext
                  ? "Same cursor"
                  : _next === ""
                  ? "Empty cursor"
                  : "Max batches reached"
              }`
            );
            break;
          }
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
        if (!batchResponse) return;
        const batchData = await batchResponse.json();
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
        // Clear the timeout since we're done
        clearTimeout(newTimeoutId);
        setIsLoading(false);
        setFetchingNFTs(false);
      }
    };
    fetchCollectionsAndInfo();
    // Cleanup function
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [ethAddress, isValidAddress, setError, setIsLoading]);
  const memoizedValues = useMemo(
    () => ({
      collections,
      ethPrice, // This now comes from useFormattedEthPrice
      totalNfts,
      totalValue,
      fetchingNFTs,
      fetchProgress,
      isResolvingENS: isResolving,
      resolvedAddress: ethAddress,
      isValidAddress,
    }),
    [
      collections,
      ethPrice, // Update dependency array
      totalNfts,
      totalValue,
      fetchingNFTs,
      fetchProgress,
      isResolving,
      ethAddress,
      isValidAddress,
    ]
  );

  return memoizedValues;
}
