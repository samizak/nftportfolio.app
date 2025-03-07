"use client";

import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { UserProfile, EnsData } from "@/types/user";
import { isAddress } from "ethers";
import { fetchWithRetry } from "@/lib/fetchWithRetry";

type UserContextType = {
  userData: UserProfile | null;
  ensData: EnsData | null;
  setUserData: (data: UserProfile) => void;
  setEnsData: (data: EnsData) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  error: string | null;
  setError: (error: string | null) => void;
  resolveAddress: (input: string) => Promise<string | null>;
  isResolvingAddress: boolean;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [userData, setUserData] = useState<UserProfile | null>(null);
  const [ensData, setEnsData] = useState<EnsData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isResolvingAddress, setIsResolvingAddress] = useState(false);

  // Function to resolve an address or ENS name
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
      const resolveResponse = await fetchWithRetry(
        `/api/user/ens/resolve?name=${input}`
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
      setError(error instanceof Error ? error.message : "Failed to resolve ENS name");
      return null;
    } finally {
      setIsResolvingAddress(false);
    }
  };

  return (
    <UserContext.Provider
      value={{
        userData,
        ensData,
        setUserData,
        setEnsData,
        isLoading,
        setIsLoading,
        error,
        setError,
        resolveAddress,
        isResolvingAddress,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}
