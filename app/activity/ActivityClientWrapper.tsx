"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ActivityEvent } from "@/components/activity/ActivityTable";
import ActivityView from "@/components/ActivityView";
import LoadingScreen from "@/components/LoadingScreen";
import { Loader2 } from "lucide-react";
import { useUserData } from "@/hooks/useUserData";
import { usePortfolioData } from "@/hooks/usePortfolioData";

export function ActivityClientWrapper({
  id,
  forceRefresh,
}: {
  id: string;
  forceRefresh: boolean;
}) {
  const router = useRouter();
  const [events, setEvents] = useState<ActivityEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadingProgress, setLoadingProgress] = useState({
    message: "Initializing...",
    percentage: 0,
    currentPage: 0,
    totalPages: 0,
  });

  const {
    user,
    isLoading: isUserLoading,
    isResolvingAddress,
    error: userError,
  } = useUserData(id);

  const { fetchingNFTs, fetchProgress } = usePortfolioData(id);

  useEffect(() => {
    if (userError && userError.includes("Invalid address")) {
      router.push("/");
    }
  }, [userError, router]);

  useEffect(() => {
    let cleanupActivityFetch: (() => void) | undefined;
    const ethAddress = user?.ethAddress;

    if (ethAddress) {
      const performFetch = async () => {
        cleanupActivityFetch = await fetchActivity(ethAddress);
      };
      performFetch();
    }

    return () => {
      cleanupActivityFetch?.();
    };
  }, [user?.ethAddress, router]);

  const fetchActivity = async (address: string) => {
    setLoading(true);
    setError(null);
    setEvents([]);
    setLoadingProgress({
      message: "Connecting to data source...",
      percentage: 0,
      currentPage: 0,
      totalPages: 0,
    });

    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL;

    if (!backendUrl) {
      console.error("Error: NEXT_PUBLIC_BACKEND_API_URL is not defined.");
      setError("Application configuration error: Backend URL is missing.");
      setLoading(false);
      return () => {}; // Return an empty cleanup function
    }

    let eventSource: EventSource | null = null;
    const cleanup = () => {
      if (eventSource) {
        eventSource.close();
        console.log("Closed EventSource for", address);
        eventSource = null;
      }
    };

    try {
      // Construct the relative path first
      let relativePath = `/api/event/by-account?address=${address}&maxPages=20`;

      // Conditionally add forceRefresh parameter if true
      if (forceRefresh) {
        relativePath += `&forceRefresh=true`;
      }

      // Construct the full absolute URL
      const url = `${backendUrl}${relativePath}`;

      console.log("Attempting EventSource connection to:", url);
      eventSource = new EventSource(url);

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (
            data.type === "progress" ||
            data.type === "event" ||
            data.type === "complete"
          ) {
            setLoading(false);
          }

          switch (data.type) {
            case "progress":
              setLoadingProgress((prev) => ({
                message: data.message || prev.message,
                percentage: data.percentage ?? prev.percentage,
                currentPage: data.currentPage ?? prev.currentPage,
                totalPages: data.totalPages ?? prev.totalPages,
              }));
              break;
            case "chunk":
              if (Array.isArray(data.events)) {
                setEvents((currentEvents) => [
                  ...currentEvents,
                  ...(data.events as ActivityEvent[]),
                ]);
              }
              break;
            case "complete":
              console.log("SSE Stream Complete:", data);
              cleanup();
              break;
            case "error":
              console.error("SSE Error:", data);
              setError(data.error || "An error occurred while fetching data");
              setLoading(false);
              cleanup();
              break;
          }
        } catch (parseError) {
          console.error("Error parsing SSE message data:", parseError);
          console.error("Raw SSE event data:", event.data);
          setError("Error processing data stream.");
          setLoading(false);
          cleanup();
        }
      };

      eventSource.onerror = (err) => {
        console.error("EventSource connection error:", err);
        setError("Connection error. Please try again later.");
        setLoading(false);
        cleanup();
      };

      eventSource.onopen = () => {
        console.log(">>> SSE Connection successfully opened (onopen fired).");
        setError(null);
      };
    } catch (err) {
      console.error("Error setting up EventSource:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load activity data. Please try again later."
      );
      setLoading(false);
      cleanup();
    }

    return cleanup;
  };

  console.log(">>> events", events);

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
      {isUserLoading || !user ? (
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
