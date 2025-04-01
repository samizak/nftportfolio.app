"use client";

import { createContext, ReactNode, useContext, useState } from "react";
import { EnsData } from "@/types/user";

interface UserContextType {
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  error: string | null;
  setError: (error: string | null) => void;
  // Add these properties to fix the errors
  userData: any | null;
  setUserData: (data: any) => void;
  ensData: EnsData | null;
  setEnsData: (data: EnsData | null) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Add these state variables
  const [userData, setUserData] = useState<any | null>(null);
  const [ensData, setEnsData] = useState<EnsData | null>(null);

  return (
    <UserContext.Provider
      value={{
        isLoading,
        setIsLoading,
        error,
        setError,
        // Add these properties to the context value
        userData,
        setUserData,
        ensData,
        setEnsData,
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
