"use client";

import { useQuery } from "@tanstack/react-query";
import { isAddress } from "ethers";
import { fetchWithRetry } from "@/lib/fetchWithRetry";

interface EnsQueryResult {
  ethAddress: string | null;
  originalInput: string | null;
  isEnsName: boolean;
  isValidAddress: boolean;
  isResolving: boolean;
  error: string | null;
}

export function useEnsQuery(
  input: string | null,
  onError?: (error: string) => void
): EnsQueryResult {
  const {
    data,
    isLoading,
    error,
    isError
  } = useQuery({
    queryKey: ['ens', input],
    queryFn: async (): Promise<{
      ethAddress: string | null;
      isEnsName: boolean;
      isValidAddress: boolean;
    }> => {
      if (!input) {
        return {
          ethAddress: null,
          isEnsName: false,
          isValidAddress: false
        };
      }

      const isEthAddress = isAddress(input);
      const isEnsName = input.toLowerCase().endsWith(".eth");

      if (!isEthAddress && !isEnsName) {
        throw new Error("Invalid Ethereum address or ENS name");
      }

      if (isEthAddress) {
        // Direct Ethereum address
        return {
          ethAddress: input,
          isEnsName: false,
          isValidAddress: true
        };
      } else {
        // ENS name needs resolution
        const resolveResponse = await fetchWithRetry(
          `/api/user/ens/resolve?id=${input}`
        );

        if (!resolveResponse?.ok) {
          throw new Error("Failed to resolve ENS name");
        }

        const resolveJson = await resolveResponse.json();

        if (!resolveJson.address) {
          throw new Error("No address found for this ENS name");
        }

        return {
          ethAddress: resolveJson.address,
          isEnsName: true,
          isValidAddress: true
        };
      }
    },
    enabled: !!input,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2
  });

  // Handle error case
  if (isError && error instanceof Error && onError) {
    onError(error.message);
  }

  return {
    ethAddress: data?.ethAddress || null,
    originalInput: input,
    isEnsName: data?.isEnsName || false,
    isValidAddress: data?.isValidAddress || false,
    isResolving: isLoading,
    error: isError && error instanceof Error ? error.message : null
  };
}