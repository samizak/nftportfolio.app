"use client";

import { useState, useEffect, useCallback } from "react";
import { BrowserProvider, JsonRpcSigner, Provider } from "ethers";

// Add ethereum property to window type
declare global {
  interface Window {
    ethereum?: any;
  }
}

interface Web3ProviderState {
  provider: BrowserProvider | null;
  signer: JsonRpcSigner | null;
  chainId: number | null;
  error: string | null;
}

export function useWeb3Provider() {
  const [state, setState] = useState<Web3ProviderState>({
    provider: null,
    signer: null,
    chainId: null,
    error: null,
  });

  const initializeProvider = useCallback(async () => {
    if (typeof window === 'undefined' || !window.ethereum) {
      setState(prev => ({ ...prev, error: "No ethereum provider found" }));
      return;
    }

    try {
      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const network = await provider.getNetwork();

      setState({
        provider,
        signer,
        chainId: Number(network.chainId),
        error: null,
      });
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : "Failed to initialize Web3 provider"
      }));
    }
  }, []);

  useEffect(() => {
    initializeProvider();
  }, [initializeProvider]);

  return {
    ...state,
    initializeProvider,
  };
}