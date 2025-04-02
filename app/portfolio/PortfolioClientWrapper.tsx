"use client";

import { useRouter } from "next/navigation";
import PortfolioView from "@/components/portfolio/PortfolioView";
import { useCurrency } from "@/context/CurrencyContext";
import LoadingScreen from "@/components/LoadingScreen";
import { Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUserData } from "@/hooks/useUserData";
import { usePortfolioData } from "@/hooks/usePortfolioData";
import { useFormattedEthPrice } from "@/hooks/useEthPriceQuery";

export function PortfolioClientWrapper({ id }: { id: string | null }) {
  const router = useRouter();
  const { selectedCurrency } = useCurrency();

  // User data hook
  const {
    user,
    isLoading: isUserLoading,
    isResolvingAddress,
    error: userError,
  } = useUserData(id);

  // Portfolio data hook (Simplified return values)
  const {
    summaryData,
    summaryStatus,
    isLoadingSummary,
    error: portfolioError,
  } = usePortfolioData(id);

  // ETH price hook
  const { price: ethPrice, error: ethPriceError } = useFormattedEthPrice();

  // Combine error states
  const combinedError =
    userError ||
    portfolioError ||
    (ethPriceError
      ? `Failed to load ETH price: ${ethPriceError.message}`
      : null);

  // --- Error Display --- //
  // Show error if combinedError exists AND summary isn't actively loading/polling
  if (
    combinedError &&
    summaryStatus !== "loading" &&
    summaryStatus !== "polling"
  ) {
    const errorMessage = combinedError;
    const isNotFoundError =
      errorMessage?.includes("404") || // User not found
      errorMessage?.includes("not found") || // Portfolio not found
      errorMessage?.includes("Invalid address"); // Explicit invalid address error

    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gradient-to-b from-background to-background/50">
        <div className="relative backdrop-blur-sm bg-card/30 border border-border/50 rounded-xl p-8 max-w-md w-full shadow-lg">
          <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 to-orange-500/10 rounded-xl" />
          <div className="relative">
            <h2 className="text-2xl font-bold text-foreground mb-3">
              {isNotFoundError ? "Portfolio Not Found" : "Something went wrong"}
            </h2>
            <p className="text-muted-foreground mb-6">
              {isNotFoundError
                ? "We couldn't find data for this address. The address might be incorrect or the portfolio is empty."
                : errorMessage || "An unexpected error occurred."}
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
              {!isNotFoundError && (
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

  // --- Loading State Logic --- //
  // Show main loading screen if summary is loading/polling OR address is resolving
  const showMainLoadingScreen =
    (isLoadingSummary || isResolvingAddress) &&
    summaryStatus !== "ready" &&
    summaryStatus !== "error";

  // Determine the message for the loading screen
  let loadingStatusMessage = "Loading...";
  if (isResolvingAddress) {
    loadingStatusMessage = "Resolving address...";
  } else if (summaryStatus === "polling") {
    loadingStatusMessage = "Calculating portfolio summary...";
  } else if (summaryStatus === "loading") {
    loadingStatusMessage = "Fetching portfolio summary...";
  }

  // Show user spinner only if user data is specifically loading
  // and the main loading screen isn't already covering it.
  const showUserSpinner = isUserLoading && !showMainLoadingScreen;

  // --- Main Render Logic --- //
  return (
    <>
      {/* Main Loading Screen (for summary/resolution) */}
      {showMainLoadingScreen && <LoadingScreen status={loadingStatusMessage} />}

      {/* User Profile Loading Spinner (if needed and main loading isn't active) */}
      {showUserSpinner && (
        <div className="fixed inset-0 flex items-center justify-center bg-background/50 z-40">
          <div className="flex flex-col items-center space-y-3">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="text-muted-foreground">
              Loading profile data...
            </span>
          </div>
        </div>
      )}

      {/* Portfolio View (Render when user and summary are ready) */}
      {user &&
        summaryStatus === "ready" &&
        summaryData &&
        !showMainLoadingScreen && (
          <PortfolioView
            user={user}
            summary={summaryData}
            isLoading={isLoadingSummary}
            ethPrice={ethPrice}
            selectedCurrency={selectedCurrency}
          />
        )}
    </>
  );
}
