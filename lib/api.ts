import useSWR from "swr";

// API base URL
const API_BASE_URL = 'http://localhost:3001';

// Updated fetcher function for SWR
const fetcher = (url: string) => {
  // Prepend API base URL if the URL is a relative path
  const apiUrl = url.startsWith('/') ? `${API_BASE_URL}${url}` : url;
  return fetch(apiUrl).then((res) => res.json());
};

// Custom hook for batch fetching collection data
export function useBatchCollections(collections: string[]) {
  const { data, error, isLoading, mutate } = useSWR(
    collections?.length ? "/api/batch-collections" : null,
    () =>
      fetch(`${API_BASE_URL}/api/batch-collections`, {
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
