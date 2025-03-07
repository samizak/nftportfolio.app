"use client";

import { useState, useEffect } from "react";
import { useUser } from "@/context/UserContext";
import { useEnsResolver } from "@/hooks/useEnsResolver";
import { fetchWithRetry } from "@/lib/fetchWithRetry";

interface UserDataResult {
  user: {
    name: string;
    ethHandle: string;
    ethAddress: string;
    avatar: string;
    banner: string;
  } | null;
  isLoading: boolean;
  isResolvingAddress: boolean;
  error: string | null;
}

export function useUserData(inputAddress: string | null): UserDataResult {
  const {
    userData,
    ensData,
    setUserData,
    setEnsData,
    isLoading,
    setIsLoading,
    error,
    setError,
  } = useUser();

  const {
    ethAddress,
    isEnsName,
    isValidAddress,
    isResolving,
    error: resolverError,
  } = useEnsResolver(inputAddress, setError);

  // Fetch user data when we have a valid address
  useEffect(() => {
    if (!ethAddress || !isValidAddress) {
      return;
    }

    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const ensResponse = await fetchWithRetry(
          `/api/user/ens?id=${ethAddress}`
        );
        if (!ensResponse) {
          console.error("No ENS response received");
          setError("Failed to fetch ENS data");
          setIsLoading(false);
          return;
        }

        const ensJson = await ensResponse.json();
        setEnsData(ensJson);

        try {
          const userResponse = await fetchWithRetry(
            `/api/user/profile?id=${ethAddress}`
          );
          if (!userResponse) {
            console.error("No user profile response received");
            setError("Failed to fetch user profile");
            setIsLoading(false);
            return;
          }

          const userJson = await userResponse.json();

          if (userJson.error) {
            setUserData(createDefaultUserData(ethAddress, ensJson?.ens));
          } else {
            setUserData(userJson);
          }
        } catch (userError) {
          console.warn("Error fetching user profile:", userError);
          setUserData(createDefaultUserData(ethAddress, ensJson?.ens));
        }
      } catch (err) {
        console.error("Error in data fetching:", err);
        if (err instanceof Error && !err.message.includes("not found")) {
          setError(err.message || "An error occurred");
        } else {
          setUserData(createDefaultUserData(ethAddress));
          setEnsData({ ens: "", address: ethAddress });
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [
    ethAddress,
    isValidAddress,
    setUserData,
    setEnsData,
    setIsLoading,
    setError,
  ]);

  // Set error from resolver if present
  useEffect(() => {
    if (resolverError) {
      setError(resolverError);
    }
  }, [resolverError, setError]);

  // Create user object
  const user = userData && {
    name: userData.username || formatAddress(ethAddress),
    ethHandle:
      ensData?.ens ||
      (inputAddress?.toLowerCase().endsWith(".eth") ? inputAddress : ""),
    ethAddress: userData.address || ethAddress || "",
    avatar: userData.profile_image_url || "",
    banner: userData.banner_image_url || "",
  };

  return {
    user,
    isLoading: isLoading || isResolving,
    isResolvingAddress: isResolving,
    error,
  };
}

// Helper functions
function formatAddress(address: string | null): string {
  if (!address) return "";
  return `${address.substring(0, 6)}...${address.substring(
    address.length - 4
  )}`;
}

function createDefaultUserData(id: string, ens?: string) {
  return {
    address: id,
    username: ens || formatAddress(id),
    profile_image_url: "",
    banner_image_url: "",
    website: "",
    social_media_accounts: [],
    bio: "",
    joined_date: "",
  };
}
