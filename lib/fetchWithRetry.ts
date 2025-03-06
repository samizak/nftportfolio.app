export async function fetchWithRetry(
  url: string,
  options: RequestInit = {},
  retries = 3,
  delay = 1000
): Promise<Response | null> {
  try {
    const response = await fetch(url, options);
    
    // If it's a 404, don't retry
    if (response.status === 404) {
      throw new Error("404 - No NFTs found for this address");
    }

    if (!response.ok) {
      if (retries > 0) {
        await new Promise(resolve => setTimeout(resolve, delay));
        return fetchWithRetry(url, options, retries - 1, delay * 1.5);
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response;
  } catch (error) {
    if (error instanceof Error && error.message.includes("404")) {
      throw error; // Don't retry 404s
    }
    if (retries > 0) {
      await new Promise(resolve => setTimeout(resolve, delay));
      return fetchWithRetry(url, options, retries - 1, delay * 1.5);
    }
    throw error;
  }
}
