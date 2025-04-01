"use client";

import { useEffect } from "react";
import { useUser } from "@/context/UserContext";
import { useAddressResolver, useUserProfileQuery } from "./useUserQuery";

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
  const { setError } = useUser();

  const {
    ethAddress,
    isEnsName,
    isValidAddress,
    isResolving,
    error: resolverError,
  } = useAddressResolver(inputAddress);

  const {
    userData,
    isLoading: isProfileLoading,
    error: profileError,
  } = useUserProfileQuery(ethAddress || null);

  useEffect(() => {
    if (resolverError) {
      setError(resolverError);
    }
  }, [resolverError, setError]);

  useEffect(() => {
    if (profileError instanceof Error) {
      setError(profileError.message);
    }
  }, [profileError, setError]);

  const user =
    userData && ethAddress && isValidAddress
      ? {
          name: userData.username || formatAddress(ethAddress),
          ethHandle: isEnsName && inputAddress ? inputAddress : "",
          ethAddress: ethAddress,
          avatar: userData.profile_image_url || "",
          banner: userData.banner_image_url || "",
        }
      : null;

  const finalError =
    resolverError ||
    (profileError instanceof Error ? profileError.message : null);

  const isLoading = isResolving || isProfileLoading;

  return {
    user,
    isLoading,
    isResolvingAddress: isResolving,
    error: finalError,
  };
}

function formatAddress(address: string): string {
  if (!address) return "";
  return `${address.substring(0, 6)}...${address.substring(
    address.length - 4
  )}`;
}
