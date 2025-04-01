"use client";

import { useQuery } from "@tanstack/react-query";
import { isAddress } from "ethers";
import { fetchWithRetry } from "@/lib/fetchWithRetry";

// Define interface for ENS resolve response
interface EnsResolveResponse {
  address: string;
  ensName?: string;
  error?: string;
}

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
  const { data, isLoading, error, isError } = useQuery({
    queryKey: ["ens", input],
    queryFn: async (): Promise<{
      ethAddress: string | null;
      isEnsName: boolean;
      isValidAddress: boolean;
    }> => {
      if (!input) {
        return {
          ethAddress: null,
          isEnsName: false,
          isValidAddress: false,
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
          isValidAddress: true,
        };
      } else {
        // ENS name needs resolution
        const resolveData = await fetchWithRetry<EnsResolveResponse>(
          `/api/ens/resolve/${input}`
        );
        
        // Check for errors in the data
        if (!resolveData || resolveData.error) {
          throw new Error(resolveData?.error || "Failed to resolve ENS name");
        }
        
        if (!resolveData.address) {
          throw new Error("No address found for this ENS name");
        }
        
        return {
          ethAddress: resolveData.address,
          isEnsName: true,
          isValidAddress: true,
        };
      }
    },
    enabled: !!input,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
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
    error: isError && error instanceof Error ? error.message : null,
  };
}
