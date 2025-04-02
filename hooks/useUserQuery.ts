"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchWithRetry } from "@/lib/fetchWithRetry";
import { UserProfile, EnsData } from "@/types/user";
import { isAddress } from "ethers";
import { useState } from "react";

// Function to resolve an ENS name to an address
async function resolveEnsName(name: string): Promise<string | null> {
  try {
    const resolveData = await fetchWithRetry<{
      address?: string;
      error?: string;
    }>(`/api/ens/resolve/${name}`);

    // Check for backend-reported errors (like not found)
    if (resolveData?.error) {
      console.warn(`ENS resolution failed for ${name}: ${resolveData.error}`);
      return null; // Return null for known resolution failures (e.g., 404)
    }

    if (resolveData?.address) {
      return resolveData.address;
    }

    // Handle cases where response is unexpected but not an explicit error
    console.warn(
      `Unexpected response structure for ENS resolution of ${name}:`,
      resolveData
    );
    return null;
  } catch (error: any) {
    // Distinguish between fetch errors and actual resolution failures captured above
    // If fetchWithRetry threw (e.g., 500 error), rethrow it.
    // Otherwise, resolution failure was handled (returned null).
    if (error.message.startsWith("HTTP error!")) {
      console.error(`ENS resolution HTTP error for ${name}:`, error);
      throw error; // Rethrow actual HTTP/network errors
    }
    // Log other unexpected errors during the try block
    console.error(`Unexpected error during ENS resolution for ${name}:`, error);
    return null; // Treat other errors as resolution failure
  }
}

// Function to validate and resolve an address
export function useAddressResolver(inputAddress: string | null) {
  const [isResolvingAddress, setIsResolvingAddress] = useState(false);

  const isDirectEthAddress = inputAddress ? isAddress(inputAddress) : false;
  const isEnsName = inputAddress
    ? inputAddress.toLowerCase().endsWith(".eth")
    : false;

  const resolveAddress = async (input: string): Promise<string | null> => {
    if (!input) return null;

    const isEthAddress = isAddress(input);
    const isEns = input.toLowerCase().endsWith(".eth");

    if (!isEthAddress && !isEns) {
      // Neither valid address nor ENS pattern
      return null;
    }

    if (isEthAddress) {
      // It's already a valid address
      return input;
    }

    // --- Resolve ENS name --- //
    setIsResolvingAddress(true);
    try {
      const address = await resolveEnsName(input);
      // resolveEnsName now returns null on failure instead of throwing for 404s
      return address;
    } catch (error) {
      // This catch block now mainly handles unexpected/network errors from resolveEnsName
      console.error(`Error resolving ENS ${input}:`, error);
      throw error; // Rethrow to let react-query handle it as an error state
    } finally {
      setIsResolvingAddress(false);
    }
  };

  const addressQuery = useQuery({
    queryKey: ["resolveAddress", inputAddress],
    queryFn: async () => {
      if (!inputAddress) return null;
      // No need for try-catch here, react-query handles errors thrown by resolveAddress
      return await resolveAddress(inputAddress);
    },
    enabled: !!inputAddress && !isDirectEthAddress,
    retry: 2,
    // Consider adding staleTime or gcTime if needed
  });

  // Determine final ethAddress
  const ethAddress = isDirectEthAddress ? inputAddress : addressQuery.data;
  // Determine if the input was valid (either direct address or resolved ENS)
  const isValid =
    isDirectEthAddress || (addressQuery.isSuccess && !!addressQuery.data);
  // Error is only relevant if it wasn't a direct address and the query failed
  const queryError =
    !isDirectEthAddress && addressQuery.isError
      ? addressQuery.error instanceof Error
        ? addressQuery.error.message
        : "Failed to resolve ENS"
      : null;

  return {
    ethAddress: ethAddress ?? null, // Ensure ethAddress is null if resolution fails
    isEnsName,
    isValidAddress: isValid,
    isResolving:
      (!isDirectEthAddress && addressQuery.isLoading) || isResolvingAddress,
    error: queryError,
    resolveAddress, // Expose resolveAddress if needed externally (unlikely)
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
