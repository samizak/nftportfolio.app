"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ActivityEvent } from "@/components/activity/ActivityTable";
import ActivityView from "@/components/ActivityView";
import LoadingScreen from "@/components/LoadingScreen";
import { Loader2 } from "lucide-react";
import { useUserData } from "@/hooks/useUserData";
import { usePortfolioData } from "@/hooks/usePortfolioData";
import { fetchWithRetry } from "@/lib/fetchWithRetry";

interface ActivityApiResponse {
  events: ActivityEvent[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    // include limit if needed
  };
  address?: string; // Optional address field
}

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
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalEvents, setTotalEvents] = useState<number>(0);

  const itemsPerPage = 25;

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

  const fetchActivityPage = useCallback(
    async (page: number, address: string) => {
      setLoading(true);
      setError(null);
      setEvents([]);

      const relativePath = `/api/event/by-account/${address}?page=${page}&limit=${itemsPerPage}`;

      try {
        const response = await fetchWithRetry<ActivityApiResponse>(
          relativePath
        );

        if (response && response.pagination) {
          // Sort events by created_date (descending - latest first)
          const sortedEvents = [...response.events].sort(
            (a, b) => Number(b.created_date) - Number(a.created_date)
          );
          setEvents(sortedEvents); // Set the sorted events

          setCurrentPage(response.pagination.currentPage);
          setTotalPages(response.pagination.totalPages);
          setTotalEvents(response.pagination.totalItems);
        } else {
          console.warn("API response missing pagination data:", response);
          setEvents([]);
          setCurrentPage(1);
          setTotalPages(1);
          setTotalEvents(0);
        }
      } catch (err) {
        console.error("Error fetching activity page:", err);
        setError(
          err instanceof Error ? err.message : "Failed to load activity data."
        );
      } finally {
        setLoading(false);
      }
    },
    [itemsPerPage]
  );

  useEffect(() => {
    if (id) {
      setEvents([]);
      setCurrentPage(1);
      setTotalPages(1);
      setTotalEvents(0);
      setError(null);
      fetchActivityPage(1, id);
    } else {
      setEvents([]);
      setCurrentPage(1);
      setTotalPages(1);
      setTotalEvents(0);
      setError("No wallet address provided.");
      setLoading(false);
    }
  }, [id, fetchActivityPage]);

  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= totalPages && newPage !== currentPage) {
      fetchActivityPage(newPage, id);
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
        <ActivityView
          user={user}
          events={events}
          isLoading={loading}
          error={error}
          currentPage={currentPage}
          totalPages={totalPages}
          totalEvents={totalEvents}
          itemsPerPage={itemsPerPage}
          onPageChange={handlePageChange}
        />
      )}
    </>
  );
}
