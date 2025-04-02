"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useUser } from "@/context/UserContext";
import { fetchWithRetry } from "../lib/fetchWithRetry";
import { useAddressResolver } from "@/hooks/useUserQuery";

// --- NEW TYPE DEFINITIONS (Based on User Guide) --- //

// For individual NFTs list endpoint
interface NftApiResponse {
  nfts: any[]; // Assuming 'any' for now, can be refined if NFT structure is known
  nextCursor: string | null;
}

// For Summary endpoint response data
export interface CollectionBreakdown {
  slug: string;
  name: string;
  nftCount: number;
  totalValueEth: number;
  totalValueUsd: number;
  imageUrl?: string;
  floorPriceEth?: number; // Make optional as it might be missing/null
}

export interface PortfolioSummaryData {
  totalValueEth: number;
  totalValueUsd: number;
  nftCount: number;
  collectionCount: number;
  breakdown: CollectionBreakdown[];
  calculatedAt: string; // ISO String or Timestamp
  cacheStatus?: "hit" | "miss" | "revalidated";
  // Add other fields if provided by the backend
}

// For the overall Summary endpoint response structure
interface SummaryApiResponse {
  status: "ready" | "calculating" | "error";
  data: PortfolioSummaryData | null;
  message?: string;
  progress?: PortfolioProgress | null; // Add optional progress field
}

// Define the structure for the progress object
interface PortfolioProgress {
  step: string;
  nftCount?: number;
  collectionCount?: number;
  processedCollections?: number;
  // Add other potential progress fields if needed
}

// For internal state tracking of the summary process
type SummaryStatus = "idle" | "loading" | "polling" | "ready" | "error";

// --- CONSTANTS --- //
const POLLING_INTERVAL = 7000; // 7 seconds (adjust as needed)
const MAX_POLLING_ATTEMPTS = 15; // Safety limit for polling

// --- HOOK --- //

export function usePortfolioData(id: string | null) {
  const { setError: setGlobalError } = useUser();

  // --- State --- //

  // Summary State
  const [summaryData, setSummaryData] = useState<PortfolioSummaryData | null>(
    null
  );
  const [summaryStatus, setSummaryStatus] = useState<SummaryStatus>("idle");
  const [summaryProgress, setSummaryProgress] =
    useState<PortfolioProgress | null>(null); // State for progress
  const [isLoadingSummary, setIsLoadingSummary] = useState<boolean>(false); // Tracks initial load and polling

  // Individual NFT List State
  const [individualNfts, setIndividualNfts] = useState<any[]>([]);
  const [nftCursor, setNftCursor] = useState<string | null>(null);
  const [hasMoreIndividualNfts, setHasMoreIndividualNfts] =
    useState<boolean>(true);
  const [isLoadingInitialNfts, setIsLoadingInitialNfts] =
    useState<boolean>(false);
  const [isLoadingMoreNfts, setIsLoadingMoreNfts] = useState<boolean>(false);

  // General State
  const [hookError, setHookError] = useState<string | null>(null);
  const pollingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pollingAttemptsRef = useRef<number>(0);
  const isFetchingNftsRef = useRef(false); // For preventing concurrent NFT fetches

  // Address Resolution
  const {
    ethAddress,
    isValidAddress,
    isResolving: isResolvingAddress,
    error: resolverError,
  } = useAddressResolver(id);

  // --- Helper: Clear Polling Timeout --- //
  const clearPolling = useCallback(() => {
    if (pollingTimeoutRef.current) {
      clearTimeout(pollingTimeoutRef.current);
      pollingTimeoutRef.current = null;
    }
    pollingAttemptsRef.current = 0; // Reset attempts
  }, []);

  // --- Function to Fetch Portfolio Summary (Handles Polling) --- //
  const fetchPortfolioSummary = useCallback(
    async (address: string, isPolling = false) => {
      if (!isPolling) {
        console.log(`Fetching portfolio summary for ${address}...`);
        setHookError(null); // Clear previous errors on new request
        setSummaryStatus("loading");
        setIsLoadingSummary(true);
        pollingAttemptsRef.current = 0; // Reset polling attempts for new request
      }

      // Safety check for polling attempts
      if (isPolling) {
        pollingAttemptsRef.current += 1;
        console.log(`Polling summary attempt: ${pollingAttemptsRef.current}`);
        if (pollingAttemptsRef.current > MAX_POLLING_ATTEMPTS) {
          console.error("Max polling attempts reached.");
          setHookError("Portfolio calculation timed out.");
          setSummaryStatus("error");
          setIsLoadingSummary(false);
          clearPolling();
          return;
        }
      }

      try {
        const result = await fetchWithRetry<SummaryApiResponse>(
          `/api/portfolio/summary/${address}`
        );

        if (!result) {
          throw new Error("No response from summary endpoint.");
        }

        console.log("Summary API Response:", result);

        // Handle based on status
        if (result.status === "ready" && result.data) {
          setSummaryData(result.data);
          setSummaryStatus("ready");
          setSummaryProgress(null); // Reset progress
          setIsLoadingSummary(false);
          clearPolling();
          console.log("Portfolio summary loaded.", result.data);
        } else if (result.status === "calculating") {
          setSummaryStatus("polling");
          setSummaryProgress(result.progress || null); // Set progress state
          setIsLoadingSummary(true); // Keep loading true while polling
          // Schedule next poll
          clearPolling(); // Clear previous timeout just in case
          pollingTimeoutRef.current = setTimeout(() => {
            fetchPortfolioSummary(address, true); // Poll again
          }, POLLING_INTERVAL);
          console.log(
            `Portfolio calculating, polling again in ${
              POLLING_INTERVAL / 1000
            }s (Attempt: ${pollingAttemptsRef.current})`
          );
        } else {
          // Handle 'error' status from backend or other unexpected cases
          const errorMsg =
            result.message || "Failed to load portfolio summary.";
          console.error("Error from summary API:", errorMsg, result);
          setHookError(errorMsg);
          setSummaryStatus("error");
          setSummaryProgress(null); // Reset progress on error
          setIsLoadingSummary(false);
          clearPolling();
        }
      } catch (err) {
        console.error("Fetch error getting summary:", err);
        const errorMsg =
          err instanceof Error
            ? err.message
            : "An unknown error occurred fetching summary";
        setHookError(errorMsg);
        setSummaryStatus("error");
        setSummaryProgress(null); // Reset progress on fetch error
        setIsLoadingSummary(false);
        clearPolling();
      }
    },
    [clearPolling] // Dependency on the stable clearPolling function
  );

  // --- Function to Fetch Initial Page of Individual NFTs --- //
  const fetchInitialIndividualNfts = useCallback(async (address: string) => {
    if (isFetchingNftsRef.current) return;
    isFetchingNftsRef.current = true;
    setIsLoadingInitialNfts(true);
    setIndividualNfts([]); // Clear previous NFTs
    setNftCursor(null);
    setHasMoreIndividualNfts(true); // Assume more initially
    console.log("Fetching initial page of individual NFTs...");

    try {
      const url = `/api/nft/by-account?address=${address}`;
      const response = await fetchWithRetry<NftApiResponse>(url);

      if (response && Array.isArray(response.nfts)) {
        setIndividualNfts(response.nfts);
        setNftCursor(response.nextCursor);
        setHasMoreIndividualNfts(!!response.nextCursor);
        console.log(`Fetched ${response.nfts.length} initial NFTs.`);
      } else {
        console.warn("No initial NFTs found or unexpected response format.");
        setIndividualNfts([]);
        setHasMoreIndividualNfts(false);
      }
    } catch (err) {
      console.error("Error fetching initial individual NFTs:", err);
      // Append to existing hookError if summary already failed, otherwise set it
      const errorMsg =
        err instanceof Error ? err.message : "Failed to fetch NFTs";
      setHookError((prev) => (prev ? `${prev}; ${errorMsg}` : errorMsg));
      setIndividualNfts([]);
      setHasMoreIndividualNfts(false);
    } finally {
      isFetchingNftsRef.current = false;
      setIsLoadingInitialNfts(false);
    }
  }, []); // No external dependencies needed

  // --- Function to Load More Individual NFTs --- //
  const loadMoreIndividualNfts = useCallback(async () => {
    if (
      !hasMoreIndividualNfts ||
      isLoadingMoreNfts ||
      !ethAddress ||
      !nftCursor ||
      isFetchingNftsRef.current
    ) {
      return;
    }
    isFetchingNftsRef.current = true;
    setIsLoadingMoreNfts(true);
    console.log("Loading more individual NFTs with cursor:", nftCursor);

    try {
      const url = `/api/nft/by-account?address=${ethAddress}&cursor=${nftCursor}`;
      const response = await fetchWithRetry<NftApiResponse>(url);

      if (response && Array.isArray(response.nfts)) {
        setIndividualNfts((prevNfts) => [...prevNfts, ...response.nfts]);
        setNftCursor(response.nextCursor);
        setHasMoreIndividualNfts(!!response.nextCursor);
        console.log(`Fetched ${response.nfts.length} more NFTs.`);
      } else {
        console.warn("No more NFTs found or unexpected response format.");
        setHasMoreIndividualNfts(false);
        setNftCursor(null);
      }
    } catch (err) {
      console.error("Error loading more individual NFTs:", err);
      const errorMsg =
        err instanceof Error ? err.message : "Failed to load more NFTs";
      setHookError((prev) => (prev ? `${prev}; ${errorMsg}` : errorMsg));
      // Consider if we should stop trying to load more on error
      setHasMoreIndividualNfts(false);
    } finally {
      isFetchingNftsRef.current = false;
      setIsLoadingMoreNfts(false);
    }
  }, [ethAddress, nftCursor, hasMoreIndividualNfts, isLoadingMoreNfts]);

  // --- Effect to Handle Address Resolution Errors --- //
  useEffect(() => {
    if (resolverError) {
      setGlobalError(resolverError);
      setHookError(resolverError);
      setSummaryStatus("error");
      setIsLoadingSummary(false);
      setIsLoadingInitialNfts(false);
      clearPolling();
    }
  }, [resolverError, setGlobalError, clearPolling]);

  // --- Effect to Trigger Initial Fetches on Address Change --- //
  useEffect(() => {
    // Clear previous state and timeouts
    setSummaryData(null);
    setSummaryStatus("idle");
    setIsLoadingSummary(false);
    setIndividualNfts([]);
    setNftCursor(null);
    setHasMoreIndividualNfts(true);
    setIsLoadingInitialNfts(false);
    setIsLoadingMoreNfts(false);
    setHookError(null);
    clearPolling();
    isFetchingNftsRef.current = false;

    if (ethAddress && isValidAddress && !isResolvingAddress) {
      fetchPortfolioSummary(ethAddress); // Start summary fetch (will set loading state)
      fetchInitialIndividualNfts(ethAddress); // Start initial NFT fetch (will set loading state)
    } else if (!isResolvingAddress && !isValidAddress && id) {
      // Handle invalid resolved address explicitly
      setHookError(`Invalid address or ENS name: ${id}`);
      setSummaryStatus("error");
    } else {
      // Set loading states false if not fetching (e.g., during resolution or if address is null)
      setIsLoadingSummary(false);
      setIsLoadingInitialNfts(false);
    }

    // Cleanup function for address changes / unmount
    return () => {
      clearPolling();
    };
  }, [
    ethAddress,
    isValidAddress,
    isResolvingAddress,
    id,
    fetchPortfolioSummary,
    fetchInitialIndividualNfts,
    clearPolling,
  ]);

  // --- Return Value --- //
  return {
    // Summary Data & Status
    summaryData,
    summaryStatus,
    summaryProgress, // Include progress here
    // Individual NFT Data & Status
    individualNfts,
    hasMoreIndividualNfts,
    // Combined Loading State
    isLoading: isLoadingSummary || isLoadingInitialNfts || isResolvingAddress, // Added isResolvingAddress
    // Specific Loading States
    isLoadingSummary,
    isLoadingInitialNfts,
    isLoadingMoreNfts,
    isResolvingAddress, // Keep this as well
    // Combined Error State
    error: hookError || resolverError,
    // Functions
    fetchPortfolioSummary: () => {
      if (ethAddress) fetchPortfolioSummary(ethAddress);
    },
    loadMoreIndividualNfts,
  };
}
