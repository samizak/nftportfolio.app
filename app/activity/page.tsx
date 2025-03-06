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
import { useRouter } from "next/navigation";
import { isAddress } from "ethers";

export default function ActivityPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const walletId = searchParams.get("id") || "";
  const [isValidAddress, setIsValidAddress] = useState<boolean | null>(null);
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

  // Add validation for Ethereum address
  useEffect(() => {
    if (walletId) {
      const isEthAddress = isAddress(walletId);
      const isEnsName = walletId.toLowerCase().endsWith(".eth");

      if (!isEthAddress && !isEnsName) {
        console.warn("Invalid Ethereum address or ENS name:", walletId);
        setIsValidAddress(false);
        router.push("/");
        return;
      }
      setIsValidAddress(true);
    } else {
      setIsValidAddress(false);
      router.push("/");
    }
  }, [walletId, router]);

  // Modify the existing useEffect to only run if address is valid
  useEffect(() => {
    if (!walletId || !isValidAddress) {
      return;
    }

    fetchUserData();
    fetchActivity();
  }, [walletId, isValidAddress]);

  const fetchUserData = async () => {
    try {
      setIsLoading(true);
      setUserError(null);

      // Fetch ENS data
      const ensResponse = await fetchWithRetry(`/api/get-ens?id=${walletId}`);
      if (!ensResponse) {
        console.error("No ENS response received");
        setUserError("Failed to fetch ENS data");
        setIsLoading(false);
        return;
      }

      const ensJson = await ensResponse.json();
      setEnsData(ensJson);

      try {
        const userResponse = await fetchWithRetry(
          `/api/get-user-profile?id=${walletId}`
        );
        if (!userResponse) {
          console.error("No user profile response received");
          setUserError("Failed to fetch user profile");
          setIsLoading(false);
          return;
        }

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

  // In your activity page or component where you fetch events

  const fetchActivity = async () => {
    setLoading(true);
    setError(null);
    setEvents([]);

    try {
      // Create SSE connection
      const eventSource = new EventSource(
        `/api/get-events-by-account?address=${walletId}&maxPages=20`
      );

      // Handle incoming events
      eventSource.onmessage = (event) => {
        const data = JSON.parse(event.data);

        switch (data.type) {
          case "progress":
            // Update loading state with progress info
            console.log(`Loading: ${data.message}`);
            break;

          case "chunk":
            // Append new events to the existing list
            setEvents((currentEvents) => [...currentEvents, ...data.events]);
            break;

          case "complete":
            // All data has been received
            setLoading(false);
            console.log(
              `Completed: ${data.totalEvents} events across ${data.totalPages} pages`
            );

            eventSource.close();
            break;

          case "error":
            // Handle errors
            setError(data.error || "An error occurred while fetching data");
            setLoading(false);
            eventSource.close();
            break;
        }
      };

      // Handle connection errors
      eventSource.onerror = () => {
        setError("Connection error. Please try again later.");
        setLoading(false);
        eventSource.close();
      };

      // Clean up function to close connection if component unmounts
      return () => {
        eventSource.close();
      };
    } catch (err) {
      console.error("Error setting up SSE:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load activity data. Please try again later."
      );
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

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6 text-center shadow-sm">
            {error}
          </div>
        )}

        {loading ? (
          <ActivitySkeleton />
        ) : (
          <div className="overflow-hidden">
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
