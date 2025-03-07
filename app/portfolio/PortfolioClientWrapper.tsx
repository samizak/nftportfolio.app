"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import PortfolioView from "@/components/portfolio/PortfolioView";
import { useCurrency } from "@/context/CurrencyContext";
import LoadingScreen from "@/components/LoadingScreen";
import { Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUserData } from "@/hooks/useUserData";
import { usePortfolioData } from "@/hooks/usePortfolioData";

export function PortfolioClientWrapper({ id }: { id: string | null }) {
  const router = useRouter();
  const { selectedCurrency } = useCurrency();

  // Use the existing hooks for user data and portfolio data
  const {
    user,
    isLoading: isUserLoading,
    isResolvingAddress,
    error: userError,
  } = useUserData(id);

  const {
    collections,
    ethPrice,
    totalNfts,
    totalValue,
    fetchingNFTs,
    fetchProgress,
  } = usePortfolioData(id);

  // Remove this console.log that might be causing unnecessary renders
  // console.log(fetchingNFTs, isResolvingAddress);
  if (userError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gradient-to-b from-background to-background/50">
        <div className="relative backdrop-blur-sm bg-card/30 border border-border/50 rounded-xl p-8 max-w-md w-full shadow-lg">
          <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 to-orange-500/10 rounded-xl" />
          <div className="relative">
            <h2 className="text-2xl font-bold text-foreground mb-3">
              {userError.includes("404")
                ? "Portfolio Not Found"
                : "Something went wrong"}
            </h2>
            <p className="text-muted-foreground mb-6">
              {userError.includes("404")
                ? "We couldn't find any NFTs for this address. The address might be incorrect or doesn't own any NFTs."
                : userError}
            </p>
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="gap-2"
                onClick={() => router.push("/")}
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Home
              </Button>
              {!userError.includes("404") && (
                <Button
                  onClick={() => window.location.reload()}
                  className="bg-primary/90 hover:bg-primary"
                >
                  Try again
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {(fetchingNFTs || isResolvingAddress) && (
        <LoadingScreen
          status={
            isResolvingAddress ? "Resolving ENS name..." : fetchProgress.status
          }
          count={fetchProgress.count}
          startTime={fetchProgress.startTime}
        />
      )}

      {isUserLoading ? (
        <div className="fixed inset-0 flex items-center justify-center">
          <div className="flex flex-col items-center space-y-3">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span>Loading profile data...</span>
          </div>
        </div>
      ) : (
        user && (
          <PortfolioView
            user={user}
            data={collections}
            ethPrice={ethPrice}
            totalNfts={totalNfts}
            totalValue={totalValue}
            selectedCurrency={selectedCurrency}
          />
        )
      )}
    </>
  );
}
