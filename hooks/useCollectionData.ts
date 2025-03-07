"use client";

import { useState, useCallback } from "react";
import { useFetchApi } from "./useFetchApi";
import { CollectionData } from "@/types/nft";

interface UseCollectionDataResult {
  collections: CollectionData[];
  loading: boolean;
  error: string | null;
  fetchCollectionData: (slugs: string[]) => Promise<void>;
}

export function useCollectionData(): UseCollectionDataResult {
  const [collections, setCollections] = useState<CollectionData[]>([]);
  const { loading, error, fetchData } = useFetchApi<{ data: Record<string, any> }>();

  const fetchCollectionData = useCallback(async (slugs: string[]) => {
    if (!slugs.length) {
      setCollections([]);
      return;
    }

    const result = await fetchData("/api/batch-collections", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ collections: slugs }),
    });

    if (result?.data) {
      const collectionDetails = Object.entries(result.data).map(([slug, data]: [string, any]) => ({
        collection: slug,
        name: data.info?.name || slug,
        quantity: data.count || 0,
        image_url: data.info?.image_url || "",
        is_verified: data.info?.safelist_status === "verified",
        floor_price: data.price?.floor_price || 0,
        total_value: (data.price?.floor_price || 0) * (data.count || 0),
      }));

      setCollections(collectionDetails);
    }
  }, [fetchData]);

  return {
    collections,
    loading,
    error,
    fetchCollectionData,
  };
}