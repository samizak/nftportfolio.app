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

  while (retries < maxRetries) {
    try {
      const response = await fetch(url, options);
      if (!response.ok) {
        throw new Error(`Network response was not ok: ${response.status}`);
      }
      return response;
    } catch (error) {
      retries++;
      console.log(
        `Attempt ${retries}/${maxRetries} failed. Retrying in ${delay}ms...`
      );

      if (retries >= maxRetries) {
        throw error;
      }

      // Wait before retrying
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
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
    // Use the retry mechanism
    const response = await fetchWithRetry(openseaUrl, fetchOptions, 3, 1000);
    const data = await response?.json();

    // Store in cache
    memoryCache[cacheKey] = {
      data,
      timestamp: now,
    };

    // Clean up old cache entries
    cleanupCache();

    return NextResponse.json(data);
  } catch (error) {
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
