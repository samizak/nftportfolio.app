"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useUser } from "@/context/UserContext";
import { useFormattedEthPrice } from "@/hooks/useEthPriceQuery";
import { fetchWithRetry } from "../lib/fetchWithRetry";
import { CollectionData } from "@/types/nft";
import { useAddressResolver } from "@/hooks/useUserQuery";

// Define expected response type for NFT fetch
type NftApiResponse = { nfts: any[]; nextCursor: string | null };
// Define structure for NFT grouping - include contract address
type NftsByCollection = Record<
  string, // slug
  { count: number; nfts: any[]; contractAddress?: string } // Added contractAddress
>;

// Define structure for the nested API response
interface CollectionInfo {
  collection?: string; // Optional fields based on backend response
  name?: string;
  description?: string;
  image_url?: string;
  banner_image_url?: string;
  owner?: string;
  safelist_status?: string;
  category?: string;
  is_disabled?: boolean;
  is_nsfw?: boolean;
  trait_offers_enabled?: boolean;
  opensea_url?: string;
  twitter_username?: string;
  discord_url?: string;
  contracts?: { address: string; chain: string }[];
  // Add stats if needed, but acknowledge potential inaccuracy
  total_supply?: number;
  num_owners?: number;
  total_volume?: number;
  market_cap?: number;
}

interface CollectionPrice {
  symbol?: string;
  floor_price?: number;
  floor_price_symbol?: string;
  floor_price_usd?: number;
}

type CollectionCacheData =
  | {
      info: CollectionInfo | null;
      price: CollectionPrice | null;
    }
  | {}; // Can be empty object for total failure

type CollectionBatchApiResponse = { data: Record<string, CollectionCacheData> };

export function usePortfolioData(id: string | null) {
  const { setError: setGlobalError } = useUser();
  // Assuming ethPrice might be used elsewhere or for display formatting
  const { price: ethPrice } = useFormattedEthPrice();

  // --- State --- //
  const [allNfts, setAllNfts] = useState<any[]>([]);
  const [collections, setCollections] = useState<CollectionData[]>([]);
  const [totalNfts, setTotalNfts] = useState(0); // Tracks loaded NFTs
  const [totalValue, setTotalValue] = useState(0);
  const [nextNftCursor, setNextNftCursor] = useState<string | null>(null);
  const [hasMoreNfts, setHasMoreNfts] = useState<boolean>(true);

  const [isLoadingInitial, setIsLoadingInitial] = useState<boolean>(true);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const [isProcessingPrices, setIsProcessingPrices] = useState<boolean>(false);

  const [fetchProgress, setFetchProgress] = useState({
    status: "Initializing...",
    count: 0,
    startTime: 0,
  });
  const [hookError, setHookError] = useState<string | null>(null); // Local error state

  // Ref to prevent concurrent fetches
  const isFetchingRef = useRef(false);

  // --- Address Resolution --- //
  const {
    ethAddress,
    isValidAddress,
    isResolving: isResolvingAddress,
    error: resolverError,
  } = useAddressResolver(id);

  // --- Global Error Handling --- //
  useEffect(() => {
    if (resolverError) {
      setGlobalError(resolverError);
      setHookError(resolverError); // Also set local error
      setIsLoadingInitial(false); // Stop initial load if resolver fails
    }
  }, [resolverError, setGlobalError]);

  // --- Helper: Process NFTs and Fetch Prices --- //
  const processNftBatch = useCallback(
    async (nftsToProcess: any[]) => {
      if (nftsToProcess.length === 0) return;

      setIsProcessingPrices(true);
      setFetchProgress((prev) => ({
        ...prev,
        status: "Processing collections...",
      }));

      // 1. Group NFTs, get slugs, AND get contract addresses
      const nftsByCollectionBatch = nftsToProcess.reduce((acc, nft) => {
        const collectionSlug = nft.collection;
        if (!collectionSlug) return acc;
        if (!acc[collectionSlug]) {
          acc[collectionSlug] = {
            count: 0,
            nfts: [],
            // Store the first contract address found for this slug
            contractAddress: nft.contract,
          };
        }
        acc[collectionSlug].count++;
        acc[collectionSlug].nfts.push(nft);
        return acc;
      }, {} as NftsByCollection);

      const newCollectionSlugs = Object.keys(nftsByCollectionBatch);

      if (newCollectionSlugs.length === 0) {
        setIsProcessingPrices(false);
        return;
      }

      // 2. Create/Update Preliminary Collection Data
      setCollections((prevCollections) => {
        const updatedCollections = [...prevCollections];
        newCollectionSlugs.forEach((slug) => {
          const existingIndex = updatedCollections.findIndex(
            (c) => c.collection === slug
          );
          const batchInfo = nftsByCollectionBatch[slug];
          const firstNft = batchInfo.nfts[0];

          if (existingIndex === -1) {
            // New collection
            updatedCollections.push({
              collection: slug,
              name: firstNft?.collection?.name || slug, // Use name from NFT if available
              quantity: batchInfo.count,
              image_url: firstNft?.image_preview_url || "", // Use preview URL
              is_verified: false,
              floor_price: 0,
              total_value: 0,
            });
          } else {
            // Existing collection, update quantity
            updatedCollections[existingIndex] = {
              ...updatedCollections[existingIndex],
              quantity:
                updatedCollections[existingIndex].quantity + batchInfo.count,
              // Keep existing price/value data until updated later
            };
          }
        });
        return updatedCollections;
      });

      // 3. Fetch Prices for *these* Slugs - **MODIFY REQUEST**
      setFetchProgress((prev) => ({
        ...prev,
        status: `Fetching prices for ${newCollectionSlugs.length} collections...`,
      }));

      const BATCH_SIZE = 50;
      const slugBatches: string[][] = [];
      const addressBatches: string[][] = [];

      for (let i = 0; i < newCollectionSlugs.length; i += BATCH_SIZE) {
        const slugBatch = newCollectionSlugs.slice(i, i + BATCH_SIZE);
        slugBatches.push(slugBatch);
        // Create corresponding address batch
        addressBatches.push(
          slugBatch.map(
            (slug) => nftsByCollectionBatch[slug]?.contractAddress || ""
          )
        );
      }

      const pricePromises = slugBatches.map((slugBatch, index) => {
        const addressBatch = addressBatches[index]; // Get corresponding addresses
        // Check if lengths match for safety, though they should
        if (slugBatch.length !== addressBatch.length) {
          console.error("Mismatch between slug and address batch lengths!");
          return Promise.resolve(null); // Skip this batch on error
        }
        return fetchWithRetry<CollectionBatchApiResponse>(
          "/api/collection/batch-collections",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            // Send both slugs and addresses
            body: JSON.stringify({
              collection_slugs: slugBatch,
              contract_addresses: addressBatch,
            }),
          }
        );
      });

      try {
        const priceResults = await Promise.allSettled(pricePromises);

        // Combine results - **MODIFY RESPONSE HANDLING**
        const combinedPriceData = priceResults.reduce((acc, result) => {
          if (result.status === "fulfilled" && result.value?.data) {
            // Add null checks if result.value could be null from fetchWithRetry
            return { ...acc, ...result.value.data };
          }
          if (result.status === "rejected") {
            console.warn(
              "A collection price batch API call failed:",
              result.reason
            );
          }
          return acc;
        }, {} as Record<string, CollectionCacheData>); // Use new type

        // 4. Update Collections State with Prices - **MODIFY DATA ACCESS**
        let valueDelta = 0;
        setCollections((prevCollections) => {
          return prevCollections.map((collection) => {
            if (!newCollectionSlugs.includes(collection.collection)) {
              return collection;
            }

            const slug = collection.collection;
            const cacheResult = combinedPriceData[slug]; // This is CollectionCacheData

            // Check if it's NOT a total failure (empty object indicates failure)
            const isTotalFailure =
              !cacheResult || Object.keys(cacheResult).length === 0;

            if (
              !isTotalFailure &&
              "info" in cacheResult &&
              "price" in cacheResult
            ) {
              // Check structure
              const collectionInfo = cacheResult.info; // Might be null
              const priceInfo = cacheResult.price; // Might be null
              const floorPrice = priceInfo?.floor_price || 0;
              const newTotalValue = floorPrice * collection.quantity;
              valueDelta += newTotalValue - (collection.total_value || 0);

              return {
                ...collection,
                name: collectionInfo?.name || collection.name,
                image_url: collectionInfo?.image_url || collection.image_url,
                is_verified: collectionInfo?.safelist_status === "verified",
                floor_price: floorPrice,
                total_value: newTotalValue,
              };
            } else {
              // Total failure OR unexpected structure from cache
              // Keep preliminary data, ensure value is 0
              console.warn(
                `No valid cache data or total fetch failure for slug: ${slug}`
              );
              return {
                ...collection,
                floor_price: 0,
                total_value: 0,
                is_verified: false, // Reset verification on failure
              };
            }
          });
        });

        setTotalValue((prev) => prev + valueDelta);
        console.log(
          `Updated total value by ${valueDelta} ETH from this batch.`
        );
      } catch (priceError) {
        console.error("Error processing prices:", priceError);
        setFetchProgress((prev) => ({
          ...prev,
          status: "Error fetching some prices.",
        }));
      } finally {
        setIsProcessingPrices(false);
      }
    },
    [] // No external dependencies needed here usually
  );

  // --- Function to Load More NFTs --- //
  const loadMoreNfts = useCallback(async () => {
    if (
      !hasMoreNfts ||
      isLoadingMore ||
      !ethAddress ||
      !nextNftCursor ||
      isFetchingRef.current
    ) {
      return;
    }
    isFetchingRef.current = true;
    setIsLoadingMore(true);
    setHookError(null);
    console.log("Loading more NFTs with cursor:", nextNftCursor);

    try {
      const url = `/api/nft/by-account?address=${ethAddress}&cursor=${nextNftCursor}`;
      const response = await fetchWithRetry<NftApiResponse>(url);

      if (response && Array.isArray(response.nfts)) {
        const newNfts = response.nfts;
        if (newNfts.length > 0) {
          setAllNfts((prev) => [...prev, ...newNfts]);
          setTotalNfts((prev) => prev + newNfts.length);
          // Process this new batch of NFTs (updates collections, fetches prices)
          await processNftBatch(newNfts);
        } else {
          console.log("Received empty NFT array, assuming end of list.");
        }
        setNextNftCursor(response.nextCursor);
        setHasMoreNfts(!!response.nextCursor && newNfts.length > 0); // Also check if last page had items
      } else {
        console.warn("Unexpected response format when loading more NFTs");
        setHasMoreNfts(false); // Stop loading more if format is wrong
      }
    } catch (err) {
      console.error("Error loading more NFTs:", err);
      setHookError(
        err instanceof Error ? err.message : "Failed to load more NFTs"
      );
      setHasMoreNfts(false); // Stop loading on error
    } finally {
      setIsLoadingMore(false);
      isFetchingRef.current = false;
    }
  }, [ethAddress, nextNftCursor, hasMoreNfts, isLoadingMore, processNftBatch]);

  // --- Initial Data Fetch Effect --- //
  useEffect(() => {
    // Only run if we have a valid, resolved address
    if (!ethAddress || !isValidAddress) {
      // If address is invalid from the start, set loading to false
      if (!isResolvingAddress) {
        setIsLoadingInitial(false);
      }
      return;
    }

    // Prevent re-fetching if already fetched for this address (handled by ref)
    if (isFetchingRef.current) return;

    const fetchInitialData = async () => {
      if (isFetchingRef.current) return;
      isFetchingRef.current = true;
      setIsLoadingInitial(true);
      setHookError(null);
      setAllNfts([]); // Reset state for new address
      setCollections([]);
      setTotalNfts(0);
      setTotalValue(0);
      setNextNftCursor(null);
      setHasMoreNfts(true);
      console.log("Starting initial NFT fetch for:", ethAddress);
      setFetchProgress({
        status: "Fetching first page of NFTs...",
        count: 0,
        startTime: Date.now(),
      });

      try {
        const url = `/api/nft/by-account?address=${ethAddress}`;
        const response = await fetchWithRetry<NftApiResponse>(url);

        if (response && Array.isArray(response.nfts)) {
          const initialNfts = response.nfts;
          setAllNfts(initialNfts);
          setTotalNfts(initialNfts.length);
          setNextNftCursor(response.nextCursor);
          setHasMoreNfts(!!response.nextCursor);

          if (initialNfts.length > 0) {
            // Process this first batch (updates collections, fetches prices)
            await processNftBatch(initialNfts);
          } else {
            console.log("No NFTs found on initial fetch.");
            // If no NFTs, no need to process prices
            setIsProcessingPrices(false);
          }
        } else {
          console.warn("No NFTs found or unexpected response on initial fetch");
          setHasMoreNfts(false);
        }
      } catch (err) {
        console.error("Error fetching initial NFTs:", err);
        setHookError(
          err instanceof Error ? err.message : "Failed to fetch initial NFTs"
        );
        setHasMoreNfts(false);
      } finally {
        setIsLoadingInitial(false);
        isFetchingRef.current = false;
      }
    };

    fetchInitialData();

    // Cleanup function to reset fetching ref if component unmounts or address changes mid-fetch
    return () => {
      isFetchingRef.current = false;
    };
  }, [ethAddress, isValidAddress, isResolvingAddress, processNftBatch]); // Rerun if address or validity changes

  // --- Return Value --- //
  return {
    collections, // Array of CollectionData, updated incrementally
    totalNfts, // Number of NFTs loaded so far
    totalValue, // Accumulated value based on loaded prices
    isLoadingInitial, // True only during the very first NFT page load
    isLoadingMore, // True when fetching subsequent NFT pages
    isProcessingPrices, // True when price batches are being fetched/processed
    hasMoreNfts, // True if a nextNftCursor exists
    loadMoreNfts, // Function to trigger loading the next page
    fetchProgress, // Progress status/count
    error: hookError, // Errors specifically from this hook's operations
    // Include ethAddress, isValidAddress, isResolvingAddress if needed by consuming component
    ethAddress,
    isValidAddress,
    isResolvingAddress,
  };
}
