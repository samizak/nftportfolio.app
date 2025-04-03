import { API_CONFIG } from "./config"; // Import API_CONFIG

// Remove hardcoded API_BASE_URL
// const API_BASE_URL = "http://localhost:3001";

export async function fetchWithRetry<T = unknown>(
  url: string,
  options?: RequestInit,
  retries = 3,
  backoff = 300
): Promise<T | null> {
  // Prepend API base URL from config if the URL is a relative path
  const apiUrl =
    url.startsWith("/") && !url.startsWith(API_CONFIG.BASE_URL)
      ? `${API_CONFIG.BASE_URL}${url}` // Use API_CONFIG.BASE_URL
      : url;

  // console.log(apiUrl);

  try {
    const response = await fetch(apiUrl, options);

    if (response.status === 400) {
      // Log the error but don't throw - this helps with debugging
      console.warn(
        `400 Bad Request for ${url}`,
        await response
          .clone()
          .text()
          .catch(() => "Could not read response body")
      );
    }

    if (!response.ok) {
      // Handle 429 Too Many Requests - Trigger retry
      if (response.status === 429) {
        console.warn(`429 Too Many Requests for ${url}. Retrying...`);
        throw new Error(`Retry triggered for status: ${response.status}`); // Throw generic error to trigger catch block
      }
      // Handle 404 Not Found - Log and throw fatal error (no retry)
      if (response.status === 404) {
        console.warn(`404 Not Found for ${url}`);
        // Potentially return null or a specific error shape instead of throwing if needed
        throw new Error(`HTTP error! status: ${response.status} (Not Found)`);
      }
      // Handle other non-OK statuses - Throw fatal error (no retry)
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const clonedResponse = response.clone();
    const responseData = await clonedResponse.json().catch((err) => {
      console.warn("Could not parse response as JSON:", err);
      return null;
    });

    return responseData as T;
  } catch (error) {
    if (retries > 0) {
      await new Promise((resolve) => setTimeout(resolve, backoff));
      return fetchWithRetry<T>(apiUrl, options, retries - 1, backoff * 1.5);
    }
    throw error;
  }
}
