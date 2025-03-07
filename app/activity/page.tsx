"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { fetchWithRetry } from "@/lib/fetchWithRetry";
import { useUser } from "@/context/UserContext";
import { ActivityEvent } from "@/components/activity/ActivityTable";
import { useRouter } from "next/navigation";
import { isAddress } from "ethers";
import ActivityView from "@/components/ActivityView";
import LoadingScreen from "@/components/LoadingScreen";
import { usePortfolioData } from "@/hooks/usePortfolioData";
import { Loader2 } from "lucide-react";

export default function ActivityPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const [isValidAddress, setIsValidAddress] = useState<boolean | null>(null);
  const [events, setEvents] = useState<ActivityEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadingProgress, setLoadingProgress] = useState({
    message: "Initializing...",
    percentage: 0,
    currentPage: 0,
    totalPages: 0,
  });

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
    setError: setUserError,
  } = useUser();

  // Add validation for Ethereum address
  useEffect(() => {
    if (id) {
      const isEthAddress = isAddress(id);
      const isEnsName = id.toLowerCase().endsWith(".eth");

      if (!isEthAddress && !isEnsName) {
        console.warn("Invalid Ethereum address or ENS name:", id);
        setIsValidAddress(false);
        router.push("/");
        return;
      }
      setIsValidAddress(true);
    } else {
      setIsValidAddress(false);
      router.push("/");
    }
  }, [id, router]);

  // Modify the existing useEffect to only run if address is valid
  useEffect(() => {
    if (!id || !isValidAddress) {
      return;
    }

    fetchUserData();
    fetchActivity();
  }, [id, isValidAddress]);

  const {
    collections,
    ethPrice,
    totalNfts,
    totalValue,
    fetchingNFTs,
    fetchProgress,
  } = usePortfolioData(isValidAddress ? id : null);

  const fetchUserData = async () => {
    try {
      setIsLoading(true);
      setUserError(null);

      // Fetch ENS data
      const ensResponse = await fetchWithRetry(`/api/user/ens?id=${id}`);
      if (!ensResponse) {
        console.error("No ENS response received");
        setUserError("Failed to fetch ENS data");
        setIsLoading(false);
        return;
      }

      const ensJson = await ensResponse.json();
      setEnsData(ensJson);

      try {
        const userResponse = await fetchWithRetry(`/api/user/profile?id=${id}`);
        if (!userResponse) {
          console.error("No user profile response received");
          setUserError("Failed to fetch user profile");
          setIsLoading(false);
          return;
        }

        const userJson = await userResponse.json();

        if (userJson.error) {
          setUserData({
            address: id || "",
            username:
              ensJson?.ens ||
              `${id?.substring(0, 6)}...${id?.substring(id.length - 4)}`,
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
          address: id || "",
          username:
            ensJson?.ens ||
            `${id?.substring(0, 6)}...${id?.substring(id.length - 4)}`,
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
          address: id || "",
          username: `${id?.substring(0, 6)}...${id?.substring(id.length - 4)}`,
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
    setLoadingProgress({
      message: "Connecting to data source...",
      percentage: 0,
      currentPage: 0,
      totalPages: 20, // Initial estimate
    });

    try {
      // Create SSE connection
      const eventSource = new EventSource(
        `/api/events/by-account?address=${id}&maxPages=20`
      );

      // Handle incoming events
      eventSource.onmessage = (event) => {
        const data = JSON.parse(event.data);

        switch (data.type) {
          case "progress":
            // Update loading state with progress info
            console.log(`Loading: ${data.message}`);
            setLoadingProgress((prev) => ({
              message: data.message || prev.message,
              percentage: data.percentage || prev.percentage,
              currentPage: data.currentPage || prev.currentPage,
              totalPages: data.totalPages || prev.totalPages,
            }));
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
        <ActivityView user={user} events={events} />
      )}
    </>
  );
}
