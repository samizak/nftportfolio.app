"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { ActivityEvent } from "@/components/activity/ActivityTable";
import ActivityView from "@/components/ActivityView";
import { Loader2 } from "lucide-react";
import { useUserData } from "@/hooks/useUserData";
import { fetchWithRetry } from "@/lib/fetchWithRetry";
import { useAddressResolver } from "@/hooks/useUserQuery";

interface BasePagination {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  limit: number;
}

interface ActivityApiResponse {
  events: ActivityEvent[];
  pagination: BasePagination;
  address?: string;
}

interface SyncStatusResponse {
  address: string;
  status: "syncing" | "idle";
}

const POLLING_INTERVAL = 7000;

export function ActivityClientWrapper({ id }: { id: string }) {
  const router = useRouter();
  const [events, setEvents] = useState<ActivityEvent[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<BasePagination>({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    limit: 25,
  });

  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

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

  const fetchEvents = useCallback(
    async (page: number, address: string, limit: number) => {
      const relativePath = `/api/event/${address}?page=${page}&limit=${limit}`;
      try {
        const response = await fetchWithRetry<ActivityApiResponse>(
          relativePath
        );
        if (response && response.pagination) {
          const sortedEvents = [...response.events].sort(
            (a, b) => Number(b.created_date) - Number(a.created_date)
          );
          return {
            events: sortedEvents,
            pagination: { ...response.pagination, limit },
          };
        } else {
          console.warn("API response missing pagination data:", response);
          return {
            events: [],
            pagination: { currentPage: 1, totalPages: 1, totalItems: 0, limit },
          };
        }
      } catch (err) {
        console.error("Error fetching events:", err);
        throw err instanceof Error
          ? err
          : new Error("Failed to load activity data.");
      }
    },
    []
  );

  const checkSyncStatus = useCallback(async (address: string) => {
    const relativePath = `/api/event/${address}/sync-status`;
    try {
      const response = await fetchWithRetry<SyncStatusResponse>(relativePath);
      if (response) {
        return response.status;
      }
      console.warn("Sync status check failed after retries, assuming idle.");
      return "idle";
    } catch (err) {
      console.error("Error checking sync status:", err);
      return "idle";
    }
  }, []);

  const triggerSync = useCallback(async (address: string) => {
    const relativePath = `/api/event/${address}/sync`;
    try {
      fetchWithRetry(relativePath, { method: "POST" });
    } catch (err) {
      console.error("Error triggering sync:", err);
    }
  }, []);

  useEffect(() => {
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, [ethAddress]);

  useEffect(() => {
    if (!isResolvingAddress && isValidAddress && ethAddress) {
      console.log(`Address ${ethAddress} resolved. Starting initial load.`);
      setIsLoading(true);
      setIsSyncing(false);
      setError(null);
      setEvents([]);
      setPagination((prev) => ({
        ...prev,
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
      }));

      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }

      const initialLoad = async () => {
        try {
          const [initialEventData, initialSyncStatus] = await Promise.all([
            fetchEvents(1, ethAddress, pagination.limit),
            checkSyncStatus(ethAddress),
          ]);

          setEvents(initialEventData.events);
          setPagination(initialEventData.pagination);
          console.log(
            `Initial load complete. Status: ${initialSyncStatus}, Events fetched: ${initialEventData.events.length}`
          );

          if (initialSyncStatus === "syncing") {
            console.log("Sync already in progress. Starting polling.");
            setIsSyncing(true);
          } else {
            if (initialEventData.events.length === 0) {
              console.log(
                "No initial events found and status is idle. Triggering mandatory sync."
              );
              triggerSync(ethAddress);
              setIsSyncing(true);
            } else {
              console.log(
                "Initial events found and status is idle. Triggering optional background sync."
              );
              triggerSync(ethAddress);
              setIsSyncing(false);
            }
          }
        } catch (err) {
          setError(
            err instanceof Error
              ? err.message
              : "An unknown error occurred during initial load."
          );
        } finally {
          setIsLoading(false);
        }
      };

      initialLoad();
    } else if (!isResolvingAddress && (!isValidAddress || !ethAddress)) {
      console.log("Address/ENS is invalid or could not be resolved.");
      setError(resolverError || "Invalid address or ENS name provided.");
      setIsLoading(false);
      setIsSyncing(false);
      setEvents([]);

      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    }

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, [
    ethAddress,
    isValidAddress,
    isResolvingAddress,
    resolverError,
    fetchEvents,
    checkSyncStatus,
    triggerSync,
    pagination.limit,
  ]);

  useEffect(() => {
    if (isSyncing && ethAddress) {
      console.log("Polling effect: isSyncing is true, starting interval.");
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }

      pollingIntervalRef.current = setInterval(async () => {
        console.log("Polling: Checking sync status...");
        const currentStatus = await checkSyncStatus(ethAddress);
        console.log(`Polling: Current status is ${currentStatus}`);

        if (currentStatus === "idle") {
          console.log(
            "Polling: Sync finished. Clearing interval and fetching final data."
          );
          if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
            pollingIntervalRef.current = null;
          }
          setIsSyncing(false);
          setIsLoading(true);
          try {
            const finalEventData = await fetchEvents(
              1,
              ethAddress,
              pagination.limit
            );
            setEvents(finalEventData.events);
            setPagination(finalEventData.pagination);
            setError(null);
            console.log(
              `Polling: Fetched final data. Events: ${finalEventData.events.length}`
            );
          } catch (err) {
            setError(
              err instanceof Error
                ? err.message
                : "Failed to load final activity data after sync."
            );
          } finally {
            setIsLoading(false);
          }
        }
      }, POLLING_INTERVAL);

      return () => {
        console.log("Polling effect cleanup: Clearing interval.");
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
          pollingIntervalRef.current = null;
        }
      };
    } else {
      console.log(
        "Polling effect: isSyncing is false or no ethAddress, ensuring interval is cleared."
      );
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    }
  }, [isSyncing, ethAddress, checkSyncStatus, fetchEvents, pagination.limit]);

  const handlePageChange = useCallback(
    async (newPage: number) => {
      if (
        ethAddress &&
        newPage > 0 &&
        newPage <= pagination.totalPages &&
        newPage !== pagination.currentPage &&
        !isLoading
      ) {
        console.log(`Paginating to page ${newPage}`);
        setIsLoading(true);
        setError(null);
        try {
          const pageData = await fetchEvents(
            newPage,
            ethAddress,
            pagination.limit
          );
          setEvents(pageData.events);
          setPagination(pageData.pagination);
        } catch (err) {
          setError(
            err instanceof Error ? err.message : "Failed to load this page."
          );
        } finally {
          setIsLoading(false);
        }
      }
    },
    [
      ethAddress,
      pagination.totalPages,
      pagination.currentPage,
      pagination.limit,
      isLoading,
      fetchEvents,
    ]
  );

  if (isResolvingAddress) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-3">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <span className="text-muted-foreground">Resolving address...</span>
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
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <span className="text-muted-foreground">Loading profile data...</span>
        </div>
      </div>
    );
  }

  if (userDataError) {
    setError(`Error loading user profile: ${userDataError}`);
  }

  return (
    <>
      <ActivityView
        user={user}
        events={events}
        isLoading={isLoading}
        isSyncing={isSyncing}
        error={error}
        currentPage={pagination.currentPage}
        totalPages={pagination.totalPages}
        totalEvents={pagination.totalItems}
        itemsPerPage={pagination.limit}
        onPageChange={handlePageChange}
      />
    </>
  );
}
