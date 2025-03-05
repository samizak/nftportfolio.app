"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import UserProfile from "@/components/UserProfile";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { containerClass } from "@/lib/utils";
import { fetchWithRetry } from "@/lib/fetchWithRetry";
import { useUser } from "@/context/UserContext";
import ActivityTable, {
  ActivityEvent,
} from "@/components/activity/ActivityTable";
import ActivitySkeleton from "@/components/activity/ActivitySkeleton";

export default function ActivityPage() {
  const searchParams = useSearchParams();
  const walletId = searchParams.get("id") || "";
  const [events, setEvents] = useState<ActivityEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const {
    userData,
    ensData,
    setUserData,
    setEnsData,
    isLoading,
    setIsLoading,
    setError: setUserError,
  } = useUser();

  useEffect(() => {
    if (!walletId) {
      setError("No wallet address provided");
      setIsLoading(false);
      return;
    }

    fetchUserData();
    fetchActivity();
  }, [walletId]);

  const fetchUserData = async () => {
    try {
      setIsLoading(true);
      setUserError(null);

      // Fetch ENS data
      const ensResponse = await fetchWithRetry(`/api/get-ens?id=${walletId}`);
      if (!ensResponse) return;
      const ensJson = await ensResponse.json();
      setEnsData(ensJson);

      try {
        const userResponse = await fetchWithRetry(
          `/api/get-user-profile?id=${walletId}`
        );
        if (!userResponse) return;
        const userJson = await userResponse.json();

        if (userJson.error) {
          setUserData({
            address: walletId,
            username:
              ensJson?.ens ||
              `${walletId.substring(0, 6)}...${walletId.substring(
                walletId.length - 4
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
          address: walletId,
          username:
            ensJson?.ens ||
            `${walletId.substring(0, 6)}...${walletId.substring(
              walletId.length - 4
            )}`,
          profile_image_url: "",
          banner_image_url: "",
          joined_date: "",
        });
      }
    } catch (err) {
      console.error("Error in data fetching:", err);
      if (err instanceof Error && !err.message.includes("not found")) {
        setUserError(err.message || "An error occurred");
      } else {
        setUserData({
          address: walletId,
          username: `${walletId.substring(0, 6)}...${walletId.substring(
            walletId.length - 4
          )}`,
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

  const fetchActivity = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetchWithRetry(
        `/api/get-events-by-account?address=${walletId}`
      );

      if (!response) {
        throw new Error("Failed to fetch activity data");
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      // console.log(data[6]);

      const formattedEvents: ActivityEvent[] = data.map((event: any) => ({
        id:
          event.transaction?.hash ||
          `event-${Math.random().toString(36).substring(2, 9)}`,
        event_type: event.event_type,
        created_date: new Date(event.timestamp * 1000),
        transaction: event.transaction,
        nft: {
          identifier: event.nft?.identifier,
          name: event.nft?.name,
          collection: event.nft?.collection,
          image_url: event.nft?.image_url,
          display_image_url: event.nft?.display_image_url,
        },
        payment: {
          quantity: event?.payment?.quantity,
          token_address: event?.payment?.token_address,
          decimals: event?.payment?.decimals,
          symbol: event?.payment?.symbol,
        },
        from_account: {
          address:
            event.from_address || "0x0000000000000000000000000000000000000000",
          user: event.from_account?.user,
        },
        to_account: {
          address:
            event.to_address || "0x0000000000000000000000000000000000000000",
          user: event.to_account?.user,
        },
        quantity: parseInt(event.quantity) || 1,
      }));

      setEvents(formattedEvents);
    } catch (err) {
      console.error("Error fetching activity:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load activity data. Please try again later."
      );
    } finally {
      setLoading(false);
    }
  };

  const user = {
    name:
      userData?.username ||
      `${walletId?.substring(0, 6)}...${
        walletId?.substring(walletId?.length - 4) || ""
      }`,
    ethHandle: ensData?.ens || "",
    ethAddress: userData?.address || walletId || "",
    avatar: userData?.profile_image_url || "",
    banner: userData?.banner_image_url || "",
  };

  return (
    <div className="flex flex-col min-h-screen">
      <main className={`${containerClass} p-4 flex-grow pb-20`}>
        <Header user={user} activePage="activity" />

        {isLoading || !userData || !ensData ? (
          <div className="rounded-md border p-8 mb-8">
            <div className="flex flex-col items-center justify-center space-y-4">
              <Loader2 className="h-8 w-8 animate-spin" />
              <p>Loading user profile...</p>
            </div>
          </div>
        ) : (
          <UserProfile user={user} />
        )}

        <h1 className="text-3xl font-bold my-8 text-center">
          Activity History
        </h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6 text-center shadow-sm">
            {error}
          </div>
        )}

        {loading ? (
          <ActivitySkeleton />
        ) : (
          <div className="rounded-lg border shadow-md overflow-hidden">
            {events.length === 0 ? (
              <div className="text-center py-16 bg-muted/20 rounded-lg border border-muted">
                <p className="text-muted-foreground mb-3 text-xl font-medium">
                  No activity found for this wallet
                </p>
                <p className="text-sm text-muted-foreground">
                  Try checking another wallet or come back later
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <ActivityTable events={events} />
              </div>
            )}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
