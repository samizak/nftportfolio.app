"use client";

import PortfolioView from "@/components/PortfolioView";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useUser } from "@/context/UserContext";
import { useCurrency } from "@/context/CurrencyContext";
import LoadingScreen from "@/components/LoadingScreen";
import { Loader2 } from "lucide-react";
import { usePortfolioData } from "@/hooks/usePortfolioData";
import { fetchWithRetry } from "@/lib/fetchWithRetry";
import { ArrowLeft } from "lucide-react"; // Add this import
import { Button } from "@/components/ui/button"; // Add this import
import { useRouter } from "next/navigation"; // Add this import
import { isAddress } from "ethers"; // Add this import

export default function AddressPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const { selectedCurrency } = useCurrency();
  const [isValidAddress, setIsValidAddress] = useState<boolean | null>(null);

  // Add validation for Ethereum address
  useEffect(() => {
    // Check if id exists and is a valid Ethereum address or ENS name
    if (id) {
      const isEthAddress = isAddress(id);
      const isEnsName = id?.toLowerCase().endsWith(".eth");

      if (!isEthAddress && !isEnsName) {
        console.warn("Invalid Ethereum address or ENS name:", id);
        setIsValidAddress(false);
        router.push("/");
      } else {
        setIsValidAddress(true);
      }
    } else {
      setIsValidAddress(false);
      router.push("/");
    }
  }, [id, router]);

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

  // Use the new hook only if address is valid
  const {
    collections,
    ethPrice,
    totalNfts,
    totalValue,
    fetchingNFTs,
    fetchProgress,
  } = usePortfolioData(isValidAddress ? id : null);

  // Modify the user profile and ENS data fetch effect
  useEffect(() => {
    if (!id || !isValidAddress) {
      return;
    }

    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const ensResponse = await fetchWithRetry(`/api/get-ens?id=${id}`);
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
            `/api/get-user-profile?id=${id}`
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
              address: id,
              username:
                ensJson?.ens ||
                `${id.substring(0, 6)}...${id.substring(id.length - 4)}`,
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
            address: id,
            username:
              ensJson?.ens ||
              `${id.substring(0, 6)}...${id.substring(id.length - 4)}`,
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
            address: id,
            username: `${id.substring(0, 6)}...${id.substring(id.length - 4)}`,
            profile_image_url: "",
            banner_image_url: "",
            joined_date: "",
          });
          setEnsData({
            ens: "",
            address: "",
          });
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id, isValidAddress, setUserData, setEnsData, setIsLoading, setError]);

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
      `${id?.substring(0, 6)}...${id?.substring(id?.length - 4) || ""}`,
    ethHandle: ensData?.ens || "",
    ethAddress: userData?.address || id || "",
    avatar: userData?.profile_image_url || "",
    banner: userData?.banner_image_url || "",
  };

  return (
    <>
      {fetchingNFTs && (
        <LoadingScreen
          status={fetchProgress.status}
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
