"use client";

import { useState, useCallback } from "react";

interface LoadingState {
  status: string;
  percentage: number;
  count: number;
  startTime: number;
}

interface UseLoadingStateResult {
  loading: boolean;
  loadingState: LoadingState;
  startLoading: (initialStatus?: string) => void;
  updateLoadingState: (updates: Partial<LoadingState>) => void;
  finishLoading: () => void;
}

export function useLoadingState(initialState?: Partial<LoadingState>): UseLoadingStateResult {
  const [loading, setLoading] = useState(false);
  const [loadingState, setLoadingState] = useState<LoadingState>({
    status: initialState?.status || "Initializing...",
    percentage: initialState?.percentage || 0,
    count: initialState?.count || 0,
    startTime: initialState?.startTime || 0,
  });

  const startLoading = useCallback((initialStatus?: string) => {
    setLoading(true);
    setLoadingState({
      status: initialStatus || "Initializing...",
      percentage: 0,
      count: 0,
      startTime: Date.now(),
    });
  }, []);

  const updateLoadingState = useCallback((updates: Partial<LoadingState>) => {
    setLoadingState(prev => ({
      ...prev,
      ...updates,
    }));
  }, []);

  const finishLoading = useCallback(() => {
    setLoading(false);
  }, []);

  return {
    loading,
    loadingState,
    startLoading,
    updateLoadingState,
    finishLoading,
  };
}