"use client";

import { useState, useEffect } from "react";
import { isAddress } from "ethers";
import { fetchWithRetry } from "@/lib/fetchWithRetry";

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
  const [ethAddress, setEthAddress] = useState<string | null>(null);
  const [isValidAddress, setIsValidAddress] = useState<boolean | null>(null);
  const [isResolving, setIsResolving] = useState<boolean>(false);
  const [errorState, setErrorState] = useState<string | null>(null);
  const [isEnsName, setIsEnsName] = useState<boolean>(false);

  useEffect(() => {
    const validateAndResolveAddress = async () => {
      if (!input) {
        setIsValidAddress(false);
        setEthAddress(null);
        return;
      }

      const isEthAddress = isAddress(input);
      const isEnsName = input.toLowerCase().endsWith(".eth");

      setIsEnsName(isEnsName);

      if (!isEthAddress && !isEnsName) {
        setIsValidAddress(false);
        setEthAddress(null);
        setError("Invalid Ethereum address or ENS name");
        setErrorState("Invalid Ethereum address or ENS name");
        return;
      }

      if (isEthAddress) {
        // Direct Ethereum address
        setEthAddress(input);
        setIsValidAddress(true);
        setError(null);
        setErrorState(null);
      } else if (isEnsName) {
        // ENS name needs resolution
        setIsResolving(true);
        setError(null);
        setErrorState(null);

        try {
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

          setEthAddress(resolveJson.address);
          setIsValidAddress(true);
        } catch (error) {
          console.error("ENS resolution error:", error);
          setError(
            error instanceof Error
              ? error.message
              : "Failed to resolve ENS name"
          );
          setErrorState(
            error instanceof Error
              ? error.message
              : "Failed to resolve ENS name"
          );
          setIsValidAddress(false);
        } finally {
          setIsResolving(false);
        }
      }
    };

    validateAndResolveAddress();
  }, [input, setError]);

  return {
    ethAddress,
    originalInput: input,
    isEnsName,
    isValidAddress: !!isValidAddress,
    isResolving,
    error: errorState,
  };
}
