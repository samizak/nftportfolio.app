"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useCurrency } from "./CurrencyContext";

interface EthPriceContextType {
  ethPrice: number;
  lastUpdated: Date | null;
}

const EthPriceContext = createContext<EthPriceContextType>({
  ethPrice: 0,
  lastUpdated: null,
});

export function EthPriceProvider({ children }: { children: React.ReactNode }) {
  const [ethPrice, setEthPrice] = useState(0);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const { selectedCurrency } = useCurrency();

  const fetchEthPrice = async () => {
    try {
      const response = await fetch("/api/market/ethereum-prices");
      const data = await response.json();

      if (data.ethPrice) {
        setEthPrice(data.ethPrice[selectedCurrency.code.toLowerCase()]);
        setLastUpdated(new Date(data.lastUpdated));
      }
    } catch (error) {
      console.error("Failed to fetch ETH price:", error);
    }
  };

  useEffect(() => {
    fetchEthPrice();
    const interval = setInterval(fetchEthPrice, 1 * 60 * 1000); // Fetch every 1 minutes
    return () => clearInterval(interval);
  }, [selectedCurrency]);

  return (
    <EthPriceContext.Provider value={{ ethPrice, lastUpdated }}>
      {children}
    </EthPriceContext.Provider>
  );
}

export const useEthPrice = () => useContext(EthPriceContext);
