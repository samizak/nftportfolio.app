"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchWithRetry } from "@/lib/fetchWithRetry";
import { useCurrency } from "@/context/CurrencyContext";

interface EthPriceData {
  ethPrice: {
    [currency: string]: number;
  };
  lastUpdated: string;
  isDefault: boolean;
}

export function useEthPriceQuery() {
  const { selectedCurrency } = useCurrency();

  return useQuery<EthPriceData, Error>({
    queryKey: ["ethPrice", selectedCurrency.code],
    queryFn: async () => {
      const response = await fetchWithRetry("/api/market/ethereum-prices");
      if (!response) {
        throw new Error("Failed to fetch ETH price");
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
}

// Helper hook to get the formatted price in the selected currency
export function useFormattedEthPrice() {
  const { data, isLoading, error } = useEthPriceQuery();
  const { selectedCurrency } = useCurrency();

  const currencyCode = selectedCurrency.code.toLowerCase();
  const price = data?.ethPrice?.[currencyCode] || 0;
  const isDefault = data?.isDefault || false;

  return {
    price,
    formattedPrice: `${selectedCurrency.symbol}${price.toLocaleString()}`,
    isLoading,
    error,
    isDefault,
    lastUpdated: data?.lastUpdated ? new Date(data.lastUpdated) : null,
  };
}
