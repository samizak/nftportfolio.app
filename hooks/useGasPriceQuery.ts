"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchWithRetry } from "@/lib/fetchWithRetry";

interface GasPriceData {
  gasPrices: {
    currentGasPrice: number;
    timestamp: string;
  };
  isDefault: boolean;
}

export function useGasPriceQuery() {
  const query = useQuery<GasPriceData>({
    queryKey: ["gasPrice"],
    queryFn: async () => {
      const response = await fetchWithRetry("/api/market/gas");
      if (!response) {
        throw new Error("Failed to fetch gas price");
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      return data;
    },
    refetchInterval: 60 * 1000, // Refetch every minute
    staleTime: 30 * 1000, // Consider data stale after 30 seconds
  });
  return {
    ...query,
    lastUpdated: query.data?.gasPrices?.timestamp
      ? new Date(query.data.gasPrices.timestamp)
      : null,
  };
}
