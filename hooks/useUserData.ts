"use client";

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
    ensData,
    userData,
    isLoading,
    error: profileError,
  } = useUserProfileQuery(ethAddress || null);

  if (resolverError) {
    setError(resolverError);
  } else if (profileError instanceof Error) {
    setError(profileError.message);
  }

  const user =
    userData && ethAddress
      ? {
          name: userData.username || formatAddress(ethAddress),
          ethHandle: ensData?.ens || "",
          ethAddress: ethAddress,
          avatar: userData.profile_image_url || "",
          banner: userData.banner_image_url || "",
        }
      : null;

  return {
    user,
    isLoading,
    isResolvingAddress: isResolving,
    error:
      resolverError ||
      (profileError instanceof Error ? profileError.message : null),
  };
}

function formatAddress(address: string): string {
  if (!address) return "";
  return `${address.substring(0, 6)}...${address.substring(
    address.length - 4
  )}`;
}
