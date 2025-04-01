"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchWithRetry } from "@/lib/fetchWithRetry";
import { UserProfile, EnsData } from "@/types/user";
import { isAddress } from "ethers";
import { useState } from "react";

// Function to resolve an ENS name to an address
async function resolveEnsName(name: string): Promise<string | null> {
  try {
    const resolveData = await fetchWithRetry(`/api/ens/resolve?name=${name}`);

    // console.log("ENS resolve data:", resolveData);

    // Since fetchWithRetry now returns the parsed JSON directly
    // we need to check if we have valid data instead of checking response.ok
    if (!resolveData || resolveData.error) {
      throw new Error(resolveData?.error || "Failed to resolve ENS name");
    }

    if (!resolveData.address) {
      throw new Error("No address found for this ENS name");
    }

    return resolveData.address;
  } catch (error) {
    console.error("ENS resolution error:", error);
    throw error;
  }
}

// Function to validate and resolve an address
export function useAddressResolver(inputAddress: string | null) {
  const [isResolvingAddress, setIsResolvingAddress] = useState(false);

  // Immediately check if it's a valid ETH address
  const isDirectEthAddress = inputAddress ? isAddress(inputAddress) : false;
  const isEnsName = inputAddress
    ? inputAddress.toLowerCase().endsWith(".eth")
    : false;

  const resolveAddress = async (input: string): Promise<string | null> => {
    if (!input) return null;

    const isEthAddress = isAddress(input);
    const isEnsName = input.toLowerCase().endsWith(".eth");

    if (!isEthAddress && !isEnsName) {
      return null;
    }

    if (isEthAddress) {
      console.log({ "useUserQuery.ts": input });
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

  // Only use the query for ENS names, not for direct ETH addresses
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
    enabled: !!inputAddress && !isDirectEthAddress, // Skip query for direct ETH addresses
    retry: 2,
  });

  // For direct ETH addresses, return immediately without waiting for the query
  const ethAddress = isDirectEthAddress ? inputAddress : addressQuery.data;

  return {
    ethAddress,
    isEnsName,
    isValidAddress: isDirectEthAddress || !!addressQuery.data,
    isResolving:
      (!isDirectEthAddress && addressQuery.isLoading) || isResolvingAddress,
    error:
      addressQuery.error instanceof Error ? addressQuery.error.message : null,
    resolveAddress,
  };
}

// Hook for fetching user profile data
export function useUserProfileQuery(address: string | null) {
  const enabled = !!address;

  // User profile query
  const profileQuery = useQuery({
    queryKey: ["userProfile", address],
    queryFn: async () => {
      if (!address) throw new Error("No address provided");

      // Corrected endpoint: Use address in the path
      const response = await fetchWithRetry(`/api/user/profile/${address}`);
      if (!response) throw new Error("Failed to fetch user profile");

      // Since fetchWithRetry now returns parsed JSON directly
      return response as UserProfile;
    },
    enabled,
  });

  return {
    userData: profileQuery.data,
    isLoading: profileQuery.isLoading,
    error: profileQuery.error,
    isError: profileQuery.isError,
  };
}
