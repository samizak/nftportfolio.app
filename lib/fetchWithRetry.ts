export async function fetchWithRetry(
  url: string,
  options: RequestInit = {},
  retries = 3,
  delay = 1000
): Promise<Response | null> {
  try {
    const response = await fetch(url, options);

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
      if (response.status === 404) {
        console.warn("404 - No NFTs found for this address");
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response;
  } catch (error) {
    if (retries > 0) {
      console.log(`Retrying ${url} (${retries} attempts left)...`);
      await new Promise((resolve) => setTimeout(resolve, delay));
      return fetchWithRetry(url, options, retries - 1, delay * 1.5);
    }
    throw error;
  }
}
