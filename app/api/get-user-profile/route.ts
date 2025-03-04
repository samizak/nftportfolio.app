import { NextResponse } from "next/server";

// Cache implementation
type CacheEntry = {
  data: any;
  timestamp: number;
};

const memoryCache: Record<string, CacheEntry> = {};
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

// Fetch with retry functionality
async function fetchWithRetry(
  url: string,
  options: RequestInit,
  maxRetries = 3,
  delay = 1000
) {
  let retries = 0;
  let lastError: Error | null = null;

  while (retries < maxRetries) {
    try {
      const response = await fetch(url, options);

      // If we get a 400 status code, check if it's the "address not found" error
      if (response.status === 400) {
        const errorData = await response.json();

        // Check for the specific error message about address not found
        if (
          errorData.errors &&
          errorData.errors.some(
            (err: string) =>
              err.includes("not found") || err.includes("Address or username")
          )
        ) {
          // Return immediately with the error data - no need to retry
          return { status: 404, data: errorData };
        }
      }

      if (!response.ok) {
        throw new Error(`Network response was not ok: ${response.status}`);
      }

      return { status: 200, response };
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      retries++;
      console.log(
        `Attempt ${retries}/${maxRetries} failed. Retrying in ${delay}ms...`
      );

      if (retries >= maxRetries) {
        break;
      }

      // Wait before retrying
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  // If we've exhausted all retries, throw the last error
  throw lastError || new Error("Failed to fetch after multiple retries");
}

export async function GET(req: any, res: any) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json(
      { error: "Missing Ethereum address (id query parameter)" },
      { status: 400 }
    );
  }

  // Check cache first
  const cacheKey = `user_profile_${id.toLowerCase()}`;
  const now = Date.now();
  const cachedResult = memoryCache[cacheKey];

  if (cachedResult && now - cachedResult.timestamp < CACHE_DURATION) {
    // Return cached data if it's still fresh
    return NextResponse.json({
      ...cachedResult.data,
      cached: true,
      cachedAt: new Date(cachedResult.timestamp).toISOString(),
    });
  }

  const openseaUrl = `https://api.opensea.io/api/v2/accounts/${id}`;
  const fetchOptions = {
    method: "GET",
    headers: {
      accept: "application/json",
      "x-api-key": process.env.OPENSEA_API_KEY || "",
    },
  };

  try {
    // Use the retry mechanism - make sure it returns a response
    const result = await fetchWithRetry(openseaUrl, fetchOptions, 3, 1000);

    console.log(result);

    // Handle 400 error case (address not found)
    if (result.status === 404) {
      return NextResponse.json(
        {
          error: "Address not found",
          details: result.data.errors
            ? result.data.errors[0]
            : "User not found on OpenSea",
        },
        { status: 404 } // Using 404 for not found is more appropriate for the client
      );
    }

    // Check if response exists before trying to parse JSON
    if (!result.response) {
      throw new Error("Failed to fetch data after retries");
    }

    const data = await result.response.json();

    // Store in cache
    memoryCache[cacheKey] = {
      data,
      timestamp: now,
    };

    // Clean up old cache entries
    cleanupCache();

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "An unknown error occurred",
      },
      { status: 500 }
    );
  }
}

// Helper function to remove expired cache entries
function cleanupCache() {
  const now = Date.now();
  Object.keys(memoryCache).forEach((key) => {
    if (now - memoryCache[key].timestamp > CACHE_DURATION) {
      delete memoryCache[key];
    }
  });
}
