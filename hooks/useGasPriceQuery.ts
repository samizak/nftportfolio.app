"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchWithRetry } from "@/lib/fetchWithRetry";

interface GasPriceData {
  gasPrices: {
    currentGasPrice: number; // Gas price in Gwei
  };
  timestamp: string; // ISO timestamp string
  isDefault: boolean;
}

export function useGasPriceQuery() {
  return useQuery<GasPriceData, Error>({
    queryKey: ["gasPrice"],
    queryFn: async () => {
      const data = await fetchWithRetry<GasPriceData>("/api/market/gas-price");

      if (!data) {
        throw new Error("Failed to fetch gas price after retries");
      }
      if ("error" in data && (data as any).error) {
        throw new Error((data as any).error as string);
      }

      return data;
    },
    refetchInterval: 60 * 1000, // Refetch every 1 minute
    staleTime: 30 * 1000, // Data considered stale after 30 seconds
  });
}

// New Helper hook to get the formatted gas price
export function useFormattedGasPrice() {
  const { data, isLoading, error } = useGasPriceQuery();

  const rawGweiPrice = data?.gasPrices?.currentGasPrice ?? 0;
  const roundedGweiPrice = parseFloat(rawGweiPrice.toFixed(1));
  const isDefault = data?.isDefault || false;

  return {
    rawGwei: rawGweiPrice,
    roundedGwei: roundedGweiPrice,
    isLoading,
    error,
    isDefault,
    timestamp: data?.timestamp ? new Date(data.timestamp) : null,
  };
}
