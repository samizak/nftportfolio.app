"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

interface GasPriceContextType {
  gasPrice: number;
  lastUpdated: Date | null;
}

const GasPriceContext = createContext<GasPriceContextType>({
  gasPrice: 0,
  lastUpdated: null,
});

export function GasPriceProvider({ children }: { children: React.ReactNode }) {
  const [gasPrice, setGasPrice] = useState(0);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchGasPrice = async () => {
    try {
      const response = await fetch(`/api/market/gas`);
      const data = await response.json();

      if (data.gasPrices && data.gasPrices.currentGasPrice) {
        setGasPrice(data.gasPrices.currentGasPrice);
        setLastUpdated(new Date(data.lastUpdated));
      }
    } catch (err) {
      console.error("Error fetching gas prices:", err);
    }
  };

  useEffect(() => {
    fetchGasPrice();
    const interval = setInterval(fetchGasPrice, 60 * 1000); // Fetch every minute
    return () => clearInterval(interval);
  }, []);

  return (
    <GasPriceContext.Provider value={{ gasPrice, lastUpdated }}>
      {children}
    </GasPriceContext.Provider>
  );
}

export const useGasPrice = () => useContext(GasPriceContext);
