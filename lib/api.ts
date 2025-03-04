import useSWR from "swr";

// Fetcher function for SWR
const fetcher = (url: string) => fetch(url).then((res) => res.json());

// Custom hook for batch fetching collection data
export function useBatchCollections(collections: string[]) {
  const { data, error, isLoading, mutate } = useSWR(
    collections?.length ? "/api/batch-collections" : null,
    () =>
      fetch("/api/batch-collections", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ collections }),
      }).then((res) => res.json()),
    {
      revalidateOnFocus: false,
      dedupingInterval: 300000, // 5 minutes
    }
  );

  return {
    collectionsData: data?.data || {},
    isLoading,
    isError: error,
    refresh: mutate,
  };
}
