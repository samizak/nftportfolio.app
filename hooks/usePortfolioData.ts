"use client";

import { useState, useEffect, useMemo } from "react";
import { useUser } from "@/context/UserContext";
import { useFormattedEthPrice } from "@/hooks/useEthPriceQuery";
import { fetchWithRetry } from "../lib/fetchWithRetry";
import { CollectionData } from "@/types/nft";
import { useAddressResolver } from "@/hooks/useUserQuery";

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
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);
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
    console.log("Address resolver state:", {
      ethAddress,
      isValidAddress,
      isResolving,
      resolverError,
    });

    if (!ethAddress || !isValidAddress) {
      console.log("Skipping fetch - invalid or missing address");
      return;
    }

    let newTimeoutId: NodeJS.Timeout | null = null;

    const fetchCollectionsAndInfo = async () => {
      console.log("Starting collection fetch for address:", ethAddress);
      // Clear any existing timeout
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      // Set a safety timeout to ensure loading state is reset after 2 minutes
      newTimeoutId = setTimeout(() => {
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

        // Create a new EventSource for SSE connection
        const url = `/api/event/by-account?address=${ethAddress}`;
        console.log(`Setting up SSE connection to: ${url}`);

        // Fetch NFTs in batches
        let nfts: any[] = [];
        let cursor = null;
        let totalProcessed = 0;

        // Initial fetch from the new API endpoint
        setFetchProgress((prev) => ({
          ...prev,
          status: "Fetching NFTs...",
        }));

        try {
          const response = await fetchWithRetry(
            `/api/nft/by-account?address=${ethAddress}`
          );
          if (!response) {
            throw new Error("No response received from API");
          }

          if (response.nfts) {
            nfts = response.nfts;
            cursor = response.next_cursor;
            totalProcessed = nfts.length;

            setFetchProgress((prev) => ({
              ...prev,
              status: `Fetched ${totalProcessed} NFTs...`,
              count: totalProcessed,
            }));
          }
        } catch (error) {
          console.error("Error fetching NFTs:", error);
          // Continue with event processing even if direct NFT fetch fails
        }

        // Process events via SSE to enhance the data
        setFetchProgress((prev) => ({
          ...prev,
          status: "Processing transaction history...",
        }));

        // For the demo, skip the events part if it's too complex
        // Event processing can be added later

        // Update total NFTs count
        console.log(`Total NFTs found: ${nfts.length}`);
        setTotalNfts(nfts.length);

        if (nfts.length === 0) {
          console.log("No NFTs found, skipping collection processing");
          setCollections([]);
          setTotalValue(0);
          setFetchingNFTs(false);
          setIsLoading(false);
          return;
        }

        setFetchProgress((prev) => ({
          ...prev,
          status: "Processing collections...",
          count: nfts.length,
        }));

        // Group NFTs by collection
        const nftsByCollection = nfts.reduce((acc, nft) => {
          const collection = nft.collection;
          if (!collection) return acc;

          if (!acc[collection]) {
            acc[collection] = { count: 0, nfts: [] };
          }

          acc[collection].count++;
          acc[collection].nfts.push(nft);
          return acc;
        }, {});

        const collectionSlugs = Object.keys(nftsByCollection);
        console.log(`Found ${collectionSlugs.length} unique collections`);

        if (collectionSlugs.length === 0) {
          setCollections([]);
          setTotalValue(0);
          setFetchingNFTs(false);
          setIsLoading(false);
          return;
        }

        setFetchProgress((prev) => ({
          ...prev,
          status: `Fetching data for ${collectionSlugs.length} collections...`,
        }));

        // --- Batching Logic --- //
        const BATCH_SIZE = 50;
        const batches = [];
        for (let i = 0; i < collectionSlugs.length; i += BATCH_SIZE) {
          batches.push(collectionSlugs.slice(i, i + BATCH_SIZE));
        }

        console.log(
          `Split into ${batches.length} batches of size ${BATCH_SIZE}`
        );

        // Fetch batches concurrently
        const batchPromises = batches.map((batch, index) => {
          console.log(`Fetching batch ${index + 1} of ${batches.length}...`);
          return fetchWithRetry<{ data: Record<string, any> }>(
            "/api/collection/batch-collections",
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ collection_slugs: batch }),
            }
          );
        });

        // Wait for all batch requests to complete
        const batchResults = await Promise.all(batchPromises);

        // Combine results from all batches
        const combinedCollectionsData = batchResults.reduce((acc, result) => {
          if (result && result.data) {
            return { ...acc, ...result.data };
          }
          return acc;
        }, {} as Record<string, any>);
        // --- End Batching Logic --- //

        const collectionsData = combinedCollectionsData;

        // --- ENHANCED PROCESSING (Merge Cache Hits with Preliminary Data) --- //
        // We use the preliminary data structure (already set in state)
        // and update it with data from cache hits.

        let calculatedTotalValue = 0;

        const finalCollectionDetails = collectionSlugs.map((slug) => {
          const preliminaryData = collections.find(
            (c) => c.collection === slug
          ) || {
            // Fallback in case preliminary data isn't found (should not happen)
            collection: slug,
            name: slug,
            quantity: nftsByCollection[slug]?.count || 0,
            image_url: "",
            is_verified: false,
            floor_price: 0,
            total_value: 0,
          };

          const cachedData = collectionsData[slug];
          const hasCacheHit =
            cachedData &&
            Object.keys(cachedData).length > 0 &&
            (cachedData.info || cachedData.price);

          if (hasCacheHit) {
            // Cache Hit: Use data from Redis
            const collectionInfo = cachedData.info || {};
            const priceInfo = cachedData.price || {};
            const floorPrice = priceInfo.floor_price || 0;
            const count = preliminaryData.quantity; // Use count from preliminary data
            const totalValue = floorPrice * count;
            calculatedTotalValue += totalValue; // Add to total value

            return {
              ...preliminaryData, // Start with preliminary data
              name: collectionInfo.name || preliminaryData.name, // Prefer cached name
              image_url: collectionInfo.image_url || preliminaryData.image_url, // Prefer cached image
              is_verified: collectionInfo.safelist_status === "verified",
              floor_price: floorPrice,
              total_value: totalValue,
            };
          } else {
            // Cache Miss: Return preliminary data with 0 value
            return {
              ...preliminaryData,
              floor_price: 0,
              total_value: 0,
              is_verified: false, // Ensure verified is false for misses
            };
          }
        });

        console.log(
          `Total portfolio value from cached data: ${calculatedTotalValue} ETH`
        );
        setTotalValue(calculatedTotalValue);
        setCollections(finalCollectionDetails); // SET FINAL MERGED COLLECTIONS

        console.log(
          "Background collection processing finished using cache data."
        );
      } catch (error) {
        console.error("Error during portfolio data fetch/processing:", error);
        setError(
          error instanceof Error
            ? error.message
            : "Failed to fetch collection data"
        );
      } finally {
        // Clear the timeout since we're done
        if (newTimeoutId) {
          clearTimeout(newTimeoutId);
        }
        setTimeoutId(null);
        setIsLoading(false);
        setFetchingNFTs(false);
        console.log("Fetch process completed");
      }
    };

    console.log("Initiating fetch collections process");
    fetchCollectionsAndInfo();

    // Cleanup function
    return () => {
      if (newTimeoutId) {
        clearTimeout(newTimeoutId);
        console.log("Cleanup: cleared timeout");
      }
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
