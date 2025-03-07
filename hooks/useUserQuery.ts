"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchWithRetry } from "@/lib/fetchWithRetry";
import { UserProfile, EnsData } from "@/types/user";
import { isAddress } from "ethers";
import { useState } from "react";

// Function to resolve an ENS name to an address
async function resolveEnsName(name: string): Promise<string | null> {
  try {
    const resolveResponse = await fetchWithRetry(
      `/api/user/ens/resolve?id=${name}`
    );

    if (!resolveResponse?.ok) {
      throw new Error("Failed to resolve ENS name");
    }

    const resolveJson = await resolveResponse.json();

    if (!resolveJson.address) {
      throw new Error("No address found for this ENS name");
    }

    return resolveJson.address;
  } catch (error) {
    console.error("ENS resolution error:", error);
    throw error;
  }
}

// Function to validate and resolve an address
export function useAddressResolver(inputAddress: string | null) {
  const [isResolvingAddress, setIsResolvingAddress] = useState(false);

  const resolveAddress = async (input: string): Promise<string | null> => {
    if (!input) return null;

    const isEthAddress = isAddress(input);
    const isEnsName = input.toLowerCase().endsWith(".eth");

    if (!isEthAddress && !isEnsName) {
      return null;
    }

    if (isEthAddress) {
      return input;
    }

    // Resolve ENS name
    setIsResolvingAddress(true);
    try {
      const address = await resolveEnsName(input);
      return address;
    } catch (error) {
      console.error("Error resolving address:", error);
      throw error;
    } finally {
      setIsResolvingAddress(false);
    }
  };

  // Query for resolving the address
  const addressQuery = useQuery({
    queryKey: ["resolveAddress", inputAddress],
    queryFn: async () => {
      if (!inputAddress) return null;
      try {
        return await resolveAddress(inputAddress);
      } catch (error) {
        console.error("Address resolution query failed:", error);
        throw error;
      }
    },
    enabled: !!inputAddress,
    retry: 2, // Limit retries for failed resolutions
  });

  return {
    ethAddress: addressQuery.data,
    isEnsName: inputAddress?.toLowerCase().endsWith(".eth") || false,
    isValidAddress: !!addressQuery.data,
    isResolving: isResolvingAddress || addressQuery.isLoading,
    error:
      addressQuery.error instanceof Error ? addressQuery.error.message : null,
    resolveAddress,
  };
}

// Hook for fetching user profile data
export function useUserProfileQuery(address: string | null) {
  const enabled = !!address;

  // ENS data query
  const ensQuery = useQuery({
    queryKey: ["ens", address],
    queryFn: async () => {
      if (!address) throw new Error("No address provided");

      const response = await fetchWithRetry(`/api/user/ens?id=${address}`);
      if (!response) throw new Error("Failed to fetch ENS data");

      return response.json() as Promise<EnsData>;
    },
    enabled,
  });

  // User profile query
  const profileQuery = useQuery({
    queryKey: ["userProfile", address],
    queryFn: async () => {
      if (!address) throw new Error("No address provided");

      const response = await fetchWithRetry(`/api/user/profile?id=${address}`);
      if (!response) throw new Error("Failed to fetch user profile");

      return response.json() as Promise<UserProfile>;
    },
    enabled,
  });

  return {
    ensData: ensQuery.data,
    userData: profileQuery.data,
    isLoading: ensQuery.isLoading || profileQuery.isLoading,
    error: ensQuery.error || profileQuery.error,
    isError: ensQuery.isError || profileQuery.isError,
  };
}
