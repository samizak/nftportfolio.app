"use client";

import { useState, useEffect, useCallback } from "react";

interface MetaMaskState {
  accounts: string[];
  isConnected: boolean;
  isInstalled: boolean;
  isConnecting: boolean;
  error: string | null;
}

export function useMetaMask() {
  const [state, setState] = useState<MetaMaskState>({
    accounts: [],
    isConnected: false,
    isInstalled: false,
    isConnecting: false,
    error: null,
  });

  useEffect(() => {
    const checkIfMetaMaskIsInstalled = () => {
      const { ethereum } = window as any;
      setState((prev) => ({
        ...prev,
        isInstalled: Boolean(ethereum && ethereum.isMetaMask),
      }));
    };

    checkIfMetaMaskIsInstalled();
  }, []);

  const connectMetaMask = useCallback(async () => {
    const ethereum = (window as any).ethereum;

    if (!ethereum) {
      setState((prev) => ({
        ...prev,
        error: "MetaMask is not installed",
      }));
      return;
    }

    setState((prev) => ({ ...prev, isConnecting: true, error: null }));

    try {
      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });

      setState((prev) => ({
        ...prev,
        accounts,
        isConnected: accounts.length > 0,
        isConnecting: false,
      }));

      return accounts;
    } catch (error: any) {
      setState((prev) => ({
        ...prev,
        error: error.message || "Failed to connect to MetaMask",
        isConnecting: false,
      }));
      return [];
    }
  }, []);

  return {
    ...state,
    connectMetaMask,
  };
}
