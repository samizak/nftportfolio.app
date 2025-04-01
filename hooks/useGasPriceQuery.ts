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

// Modify the hook to return default values
export function useGasPriceQuery() {
  // Return default gas price data
  return {
    data: {
      gasPrices: {
        currentGasPrice: 50, // Default gas price in gwei
        timestamp: new Date().toISOString(),
      },
      isDefault: true,
    },
    isLoading: false,
    isError: false,
  };
  
  /* Original implementation commented out
  const { data, error } = useSWR<GasPriceData>(
    "/api/market/gas",
    fetcher,
    {
      refreshInterval: 120000, // 2 minutes
      revalidateOnFocus: false,
      dedupingInterval: 60000, // 1 minute
    }
  );

  return {
    data,
    isLoading: !error && !data,
    isError: error,
  };
  */
}
