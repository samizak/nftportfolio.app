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

export default function AddressPage() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const { selectedCurrency } = useCurrency();
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

  // Use the new hook
  const {
    collections,
    ethPrice,
    totalNfts,
    totalValue,
    fetchingNFTs,
    fetchProgress,
  } = usePortfolioData(id);

  // Keep the user profile and ENS data fetch effect
  useEffect(() => {
    if (!id) {
      setError("No address provided");
      setIsLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const ensResponse = await fetchWithRetry(`/api/get-ens?id=${id}`);
        if (!ensResponse) return;
        const ensJson = await ensResponse.json();
        setEnsData(ensJson);

        try {
          const userResponse = await fetchWithRetry(
            `/api/get-user-profile?id=${id}`
          );
          if (!userResponse) return;
          const userJson = await userResponse.json();

          if (userJson.error) {
            // console.warn("OpenSea profile not found:", userJson.error);
            setUserData({
              address: id,
              username:
                ensJson?.ens ||
                `${id.substring(0, 6)}...${id.substring(id.length - 4)}`,
              profile_image_url: "",
              banner_image_url: "",
              website: "",
              social_media_accounts: [],
              bio: "",
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
            website: "",
            social_media_accounts: [],
            bio: "",
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
            website: "",
            social_media_accounts: [],
            bio: "",
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
  }, [id, setUserData, setEnsData, setIsLoading, setError]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 max-w-md w-full shadow-sm text-center">
          <h2 className="text-xl font-semibold text-red-700 dark:text-red-400 mb-2">
            Something went wrong
          </h2>
          <p className="text-red-600 dark:text-red-300 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="w-24 bg-red-100 hover:bg-red-200 dark:bg-red-800 dark:hover:bg-red-700 text-red-700 dark:text-red-200 px-4 py-2 rounded-md text-sm transition-colors"
          >
            Try again
          </button>
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
