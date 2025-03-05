export async function fetchWithRetry(
  url: string,
  options?: RequestInit,
  maxRetries = 3,
  delay = 1000
): Promise<Response | null> {
  let lastError: Error | null = null;

  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(url, options);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response;
    } catch (error) {
      lastError = error as Error;
      if (i < maxRetries - 1) {
        await new Promise((resolve) =>
          setTimeout(resolve, delay * Math.pow(2, i))
        );
      }
    }
  }

  console.error("Fetch failed after retries:", lastError);
  return null;
}
