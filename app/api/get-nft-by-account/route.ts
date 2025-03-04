import { NextResponse } from "next/server";
import { MongoClient } from "mongodb";

// Simple in-memory cache for development/testing
type CacheEntry = {
  data: any;
  timestamp: number;
};

// Cache structure: { [address_next]: CacheEntry }
const memoryCache: Record<string, CacheEntry> = {};
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

export async function GET(req: any, res: any) {
  const { searchParams } = new URL(req.url);
  const address = searchParams.get("address");
  const next = searchParams.get("next") || "";
  const maxPages = searchParams.get("maxPages") || "5"; // Allow client to control max pages

  if (!address) {
    return NextResponse.json(
      { error: "Missing Ethereum address (address query parameter)" },
      { status: 400 }
    );
  }

  // Create a cache key from address and next cursor
  const cacheKey = `${address.toLowerCase()}_${next}`;
  
  // Check if we have a valid cache entry
  const now = Date.now();
  const cachedResult = memoryCache[cacheKey];
  
  if (cachedResult && (now - cachedResult.timestamp) < CACHE_DURATION) {
    // Return cached data if it's still fresh
    return NextResponse.json({
      ...cachedResult.data,
      cached: true,
      cachedAt: new Date(cachedResult.timestamp).toISOString()
    });
  }

  const openSeaFetchOptions = {
    method: "GET",
    headers: {
      accept: "application/json",
      "x-api-key": process.env.OPENSEA_API_KEY || "",
    },
  };
  
  // Fetch multiple pages at once on the server side
  let allNfts: any = [];
  let currentNext = next || "";
  let pageCount = 0;
  const maxPageCount = parseInt(maxPages, 10);

  try {
    do {
      let url = `https://api.opensea.io/api/v2/chain/ethereum/account/${address}/nfts?limit=200`;
      if (currentNext) {
        url += `&next=${currentNext}`;
      }

      const response = await fetch(url, openSeaFetchOptions);

      if (!response.ok) {
        throw new Error(`Network response was not ok: ${response.status}`);
      }

      const data = await response.json();

      if (data.nfts?.length) {
        allNfts = [...allNfts, ...data.nfts];
      }

      currentNext = data.next || "";
      pageCount++;
    } while (currentNext && pageCount < maxPageCount);

    // Prepare response data
    const responseData = {
      nfts: allNfts,
      next: currentNext, // Return the next cursor for further pagination if needed
      pagesFetched: pageCount,
    };
    
    // Store in cache
    memoryCache[cacheKey] = {
      data: responseData,
      timestamp: now
    };
    
    // Clean up old cache entries (optional but good practice)
    cleanupCache();
    
    return NextResponse.json(responseData);
  } catch (error: any) {
    console.error("Fetch error:", error);
    return NextResponse.json(
      { error: `Failed to fetch NFTs: ${error.message}` },
      { status: 500 }
    );
  }
}

// Helper function to remove expired cache entries
function cleanupCache() {
  const now = Date.now();
  Object.keys(memoryCache).forEach(key => {
    if (now - memoryCache[key].timestamp > CACHE_DURATION) {
      delete memoryCache[key];
    }
  });
}
