"use client";

import { useState, useEffect } from "react";
import { useUser } from "@/context/UserContext";
import { useCurrency } from "@/context/CurrencyContext";
import { fetchWithRetry } from "../lib/fetchWithRetry";
import { CollectionData } from "@/types/nft";

export function usePortfolioData(id: string | null) {
  const { selectedCurrency } = useCurrency();
  const { setError, setIsLoading } = useUser();
  const [collections, setCollections] = useState<CollectionData[]>([]);
  const [ethPrice, setEthPrice] = useState(0);
  const [totalNfts, setTotalNfts] = useState(0);
  const [totalValue, setTotalValue] = useState(0);
  const [fetchProgress, setFetchProgress] = useState({
    status: "Initializing...",
    count: 0,
    startTime: 0,
  });
  const [fetchingNFTs, setFetchingNFTs] = useState(false);

  // ETH price fetch effect
  useEffect(() => {
    (async () => {
      try {
        const response = await fetchWithRetry(`/api/fetch-ethereum-prices`);
        if (!response) return;
        const data = await response.json();
        setEthPrice(data.ethPrice[selectedCurrency.code.toLowerCase()]);
      } catch (error) {
        console.error("Error fetching ETH price:", error);
      }
    })();
  }, [selectedCurrency]);

  // Collections fetch effect
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
          if (!response) return;
          const nftByAccountResponse = await response.json();

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

  return {
    collections,
    ethPrice,
    totalNfts,
    totalValue,
    fetchingNFTs,
    fetchProgress,
  };
}
