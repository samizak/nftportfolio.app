"use client";

import PortfolioView from "@/components/portfolio/PortfolioView";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useUser } from "@/context/UserContext";
import { useCurrency } from "@/context/CurrencyContext";
import LoadingScreen from "@/components/LoadingScreen";
import { Loader2 } from "lucide-react";
import { usePortfolioData } from "@/hooks/usePortfolioData";
import { fetchWithRetry } from "@/lib/fetchWithRetry";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { isAddress } from "ethers";

export default function AddressPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const { selectedCurrency } = useCurrency();
  const [isValidAddress, setIsValidAddress] = useState<boolean | null>(null);
  const [ethAddress, setEthAddress] = useState<string | null>(null);
  const [isResolvingENS, setIsResolvingENS] = useState<boolean>(false);

  const {
    userData,
    ensData,
    setUserData,
    setEnsData,
    isLoading,
    setIsLoading,
    error,
    setError,
  } = useUser();
  // Validate and resolve address if needed
  useEffect(() => {
    const validateAndResolveAddress = async () => {
      if (!id) {
        setIsValidAddress(false);
        router.push("/");
        return;
      }

      const isEthAddress = isAddress(id);
      const isEnsName = id.toLowerCase().endsWith(".eth");

      if (!isEthAddress && !isEnsName) {
        console.warn("Invalid Ethereum address or ENS name:", id);
        setIsValidAddress(false);
        router.push("/");
        return;
      }

      if (isEthAddress) {
        // Direct Ethereum address
        setEthAddress(id);
        setIsValidAddress(true);
      } else if (isEnsName) {
        // ENS name needs resolution
        setIsResolvingENS(true);
        try {
          const resolveResponse = await fetchWithRetry(
            `/api/user/ens/resolve?id=${id}`
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
          setIsValidAddress(false);
        } finally {
          setIsResolvingENS(false);
        }
      }
    };

    validateAndResolveAddress();
  }, [id, router, setError]);
  // Use the portfolio data hook with ethAddress
  const {
    collections,
    ethPrice,
    totalNfts,
    totalValue,
    fetchingNFTs,
    fetchProgress,
  } = usePortfolioData(isValidAddress && ethAddress ? ethAddress : null);
  // Fetch user profile and ENS data using ethAddress
  useEffect(() => {
    if (!ethAddress || !isValidAddress) {
      return;
    }
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const ensResponse = await fetchWithRetry(
          `/api/user/ens?id=${ethAddress}`
        );
        if (!ensResponse) {
          console.error("No ENS response received");
          setError("Failed to fetch ENS data");
          setIsLoading(false);
          return;
        }
        const ensJson = await ensResponse.json();
        setEnsData(ensJson);
        try {
          const userResponse = await fetchWithRetry(
            `/api/user/profile?id=${ethAddress}`
          );
          if (!userResponse) {
            console.error("No user profile response received");
            setError("Failed to fetch user profile");
            setIsLoading(false);
            return;
          }
          const userJson = await userResponse.json();
          if (userJson.error) {
            setUserData({
              address: ethAddress,
              username:
                ensJson?.ens ||
                `${ethAddress.substring(0, 6)}...${ethAddress.substring(
                  ethAddress.length - 4
                )}`,
              profile_image_url: "",
              banner_image_url: "",
              joined_date: "",
            });
          } else {
            setUserData(userJson);
          }
        } catch (userError) {
          console.warn("Error fetching user profile:", userError);
          setUserData({
            address: ethAddress,
            username:
              ensJson?.ens ||
              `${ethAddress.substring(0, 6)}...${ethAddress.substring(
                ethAddress.length - 4
              )}`,
            profile_image_url: "",
            banner_image_url: "",
            joined_date: "",
          });
        }
      } catch (err) {
        console.error("Error in data fetching:", err);
        if (err instanceof Error && !err.message.includes("not found")) {
          setError(err.message || "An error occurred");
        } else {
          setUserData({
            address: ethAddress,
            username: `${ethAddress.substring(0, 6)}...${ethAddress.substring(
              ethAddress.length - 4
            )}`,
            profile_image_url: "",
            banner_image_url: "",
            joined_date: "",
          });
          setEnsData({
            ens: "",
            address: ethAddress,
          });
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [
    ethAddress,
    isValidAddress,
    setUserData,
    setEnsData,
    setIsLoading,
    setError,
  ]);
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gradient-to-b from-background to-background/50">
        <div className="relative backdrop-blur-sm bg-card/30 border border-border/50 rounded-xl p-8 max-w-md w-full shadow-lg">
          <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 to-orange-500/10 rounded-xl" />
          <div className="relative">
            <h2 className="text-2xl font-bold text-foreground mb-3">
              {error.includes("404")
                ? "Portfolio Not Found"
                : "Something went wrong"}
            </h2>
            <p className="text-muted-foreground mb-6">
              {error.includes("404")
                ? "We couldn't find any NFTs for this address. The address might be incorrect or doesn't own any NFTs."
                : error}
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
              {!error.includes("404") && (
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
  const user = {
    name:
      userData?.username ||
      (ethAddress
        ? `${ethAddress.substring(0, 6)}...${ethAddress.substring(
            ethAddress.length - 4
          )}`
        : ""),
    ethHandle: ensData?.ens || (id?.toLowerCase().endsWith(".eth") ? id : ""),
    ethAddress: userData?.address || ethAddress || "",
    avatar: userData?.profile_image_url || "",
    banner: userData?.banner_image_url || "",
  };
  return (
    <>
      {(fetchingNFTs || isResolvingENS) && (
        <LoadingScreen
          status={
            isResolvingENS ? "Resolving ENS name..." : fetchProgress.status
          }
          count={fetchProgress.count}
          startTime={fetchProgress.startTime}
        />
      )}

      {isLoading || !userData || !ensData ? (
        <div className="fixed inset-0 flex items-center justify-center">
          <div className="flex flex-col items-center space-y-3">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span>Loading profile data...</span>
          </div>
        </div>
      ) : (
        <PortfolioView
          user={user}
          data={collections}
          ethPrice={ethPrice}
          totalNfts={totalNfts}
          totalValue={totalValue}
          selectedCurrency={selectedCurrency}
        />
      )}
    </>
  );
}
