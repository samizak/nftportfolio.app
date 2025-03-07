"use client";

import { useState, useCallback } from "react";
import { fetchWithRetry } from "@/lib/fetchWithRetry";

interface UseFetchApiResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  fetchData: (url: string, options?: RequestInit) => Promise<T | null>;
  reset: () => void;
}

export function useFetchApi<T = any>(): UseFetchApiResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async (url: string, options?: RequestInit): Promise<T | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetchWithRetry(url, options);
      
      if (!response) {
        throw new Error("No response received");
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const jsonData = await response.json();
      setData(jsonData);
      return jsonData;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An error occurred";
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setData(null);
    setLoading(false);
    setError(null);
  }, []);

  return {
    data,
    loading,
    error,
    fetchData,
    reset,
  };
}