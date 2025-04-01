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
  return useQuery<EthPriceData, Error>({
    queryKey: ["ethPrice"],
    queryFn: async () => {
      const data = await fetchWithRetry<EthPriceData>(
        "/api/market/ethereum-prices"
      );
      if (!data) {
        throw new Error("Failed to fetch ETH price after retries");
      }
      if ("error" in data && data.error) {
        throw new Error(data.error as string);
      }
      return data;
    },
    refetchInterval: 60 * 1000,
    staleTime: 30 * 1000,
  });
}

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
