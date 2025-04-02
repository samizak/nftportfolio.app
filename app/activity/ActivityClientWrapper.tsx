"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ActivityEvent } from "@/components/activity/ActivityTable";
import ActivityView from "@/components/ActivityView";
import { Loader2 } from "lucide-react";
import { useUserData } from "@/hooks/useUserData";
import { fetchWithRetry } from "@/lib/fetchWithRetry";
import { useAddressResolver } from "@/hooks/useUserQuery";

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

export function ActivityClientWrapper({ id }: { id: string }) {
  const router = useRouter();
  const [events, setEvents] = useState<ActivityEvent[]>([]);
  const [activityLoading, setActivityLoading] = useState<boolean>(false);
  const [activityError, setActivityError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalEvents, setTotalEvents] = useState<number>(0);

  const itemsPerPage = 25;

  const {
    ethAddress,
    isValidAddress,
    isResolving: isResolvingAddress,
    error: resolverError,
  } = useAddressResolver(id);

  const {
    user,
    isLoading: isUserDataLoading,
    error: userDataError,
  } = useUserData(ethAddress);

  useEffect(() => {
    if (userDataError && userDataError.includes("Invalid address")) {
      router.push("/");
    }
  }, [userDataError, router]);

  const fetchActivityPage = useCallback(
    async (page: number, address: string) => {
      setActivityLoading(true);
      setActivityError(null);
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
        setActivityError(
          err instanceof Error ? err.message : "Failed to load activity data."
        );
      } finally {
        setActivityLoading(false);
      }
    },
    [itemsPerPage]
  );

  useEffect(() => {
    if (!isResolvingAddress && isValidAddress && ethAddress) {
      console.log(
        `Resolved address ${ethAddress}, fetching activity page 1...`
      );
      setEvents([]);
      setCurrentPage(1);
      setTotalPages(1);
      setTotalEvents(0);
      setActivityError(null);
      fetchActivityPage(1, ethAddress);
    } else if (!isResolvingAddress && (!isValidAddress || !ethAddress)) {
      console.log("Address/ENS is invalid or could not be resolved.");
      setEvents([]);
      setActivityLoading(false);
      setActivityError(
        resolverError || "Invalid address or ENS name provided."
      );
    }
  }, [
    ethAddress,
    isValidAddress,
    isResolvingAddress,
    resolverError,
    fetchActivityPage,
  ]);

  const handlePageChange = (newPage: number) => {
    if (
      ethAddress &&
      newPage > 0 &&
      newPage <= totalPages &&
      newPage !== currentPage
    ) {
      fetchActivityPage(newPage, ethAddress);
    }
  };

  if (isResolvingAddress) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-3">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span>Resolving ENS name...</span>
        </div>
      </div>
    );
  }

  if ((!isValidAddress || !ethAddress) && !isResolvingAddress) {
    const errorToShow = resolverError || "Invalid address or ENS name.";
    return (
      <div className="p-4 text-center text-red-500">
        Error: {errorToShow} Please check the name or address.
      </div>
    );
  }

  if (isUserDataLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-3">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span>Loading profile data...</span>
        </div>
      </div>
    );
  }

  if (userDataError) {
    return (
      <div className="p-4 text-center text-red-500">
        Error loading user profile: {userDataError || "Unknown error"}
      </div>
    );
  }

  return (
    <>
      <ActivityView
        user={user}
        events={events}
        isLoading={activityLoading}
        error={activityError}
        currentPage={currentPage}
        totalPages={totalPages}
        totalEvents={totalEvents}
        itemsPerPage={itemsPerPage}
        onPageChange={handlePageChange}
      />
    </>
  );
}
