"use client";

import { useEnsQuery } from "./useEnsQuery";

interface EnsResolverResult {
  ethAddress: string | null;
  originalInput: string | null;
  isEnsName: boolean;
  isValidAddress: boolean;
  isResolving: boolean;
  error: string | null;
}

export function useEnsResolver(
  input: string | null,
  setError: (error: string | null) => void
): EnsResolverResult {
  // Use the React Query implementation
  return useEnsQuery(input, (errorMessage) => {
    setError(errorMessage);
  });
}
