"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { UserProfile, EnsData } from "@/types/user";

type UserContextType = {
  userData: UserProfile | null;
  ensData: EnsData | null;
  setUserData: (data: UserProfile) => void;
  setEnsData: (data: EnsData) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  error: string | null;
  setError: (error: string | null) => void;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [userData, setUserData] = useState<UserProfile | null>(null);
  const [ensData, setEnsData] = useState<EnsData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
