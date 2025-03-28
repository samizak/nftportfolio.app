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

  const {
    collections,
    fetchingNFTs,
    fetchProgress,
    resolvedAddress,
    isValidAddress,
  } = usePortfolioData(id);

  useEffect(() => {
    if (userError && userError.includes("Invalid address")) {
      router.push("/");
    }
  }, [userError, router]);

  useEffect(() => {
    if (!resolvedAddress || !isValidAddress) {
      return;
    }
    fetchActivity(resolvedAddress);
  }, [resolvedAddress, isValidAddress]);

  const fetchActivity = async (address: string) => {
    setLoading(true);
    setError(null);
    setEvents([]);
    setLoadingProgress({
      message: "Connecting to data source...",
      percentage: 0,
      currentPage: 0,
      totalPages: 20,
    });
    try {
      const eventSource = new EventSource(
        `/api/events/by-account?address=${address}&maxPages=20` +
          (forceRefresh && `&refresh=true`)
      );

      eventSource.onmessage = (event) => {
        const data = JSON.parse(event.data);
        switch (data.type) {
          case "progress":
            setLoadingProgress((prev) => ({
              message: data.message || prev.message,
              percentage: data.percentage || prev.percentage,
              currentPage: data.currentPage || prev.currentPage,
              totalPages: data.totalPages || prev.totalPages,
            }));
            break;
          case "chunk":
            setEvents((currentEvents) => [...currentEvents, ...data.events]);
            break;
          case "complete":
            setLoading(false);
            eventSource.close();
            break;
          case "error":
            setError(data.error || "An error occurred while fetching data");
            setLoading(false);
            eventSource.close();
            break;
        }
      };

      eventSource.onerror = () => {
        setError("Connection error. Please try again later.");
        setLoading(false);
        eventSource.close();
      };

      return () => {
        eventSource.close();
      };
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load activity data. Please try again later."
      );
      setLoading(false);
    }
  };

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
