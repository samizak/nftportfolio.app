import { NextResponse } from "next/server";
import { MongoClient } from "mongodb";

// Cache duration: 15 minutes in milliseconds
const CACHE_DURATION = 15 * 60 * 1000;

// MongoDB connection
let client: MongoClient | null = null;

async function connectToDatabase() {
  if (client) return client;

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("Please define the MONGODB_URI environment variable");
  }

  client = new MongoClient(uri);
  await client.connect();
  return client;
}

async function getCachedData(cacheKey: string) {
  const client = await connectToDatabase();
  const db = client.db("nft-portfolio");
  const cacheCollection = db.collection("cache");

  const cachedEntry = await cacheCollection.findOne({ key: cacheKey });

  if (!cachedEntry) return null;

  const now = Date.now();
  if (now - cachedEntry.timestamp < CACHE_DURATION) {
    return cachedEntry.data;
  }

  // Cache expired, remove it
  await cacheCollection.deleteOne({ key: cacheKey });
  return null;
}

async function setCachedData(cacheKey: string, data: any) {
  const client = await connectToDatabase();
  const db = client.db("nft-portfolio");
  const cacheCollection = db.collection("cache");

  // Create or update cache entry
  await cacheCollection.updateOne(
    { key: cacheKey },
    {
      $set: {
        key: cacheKey,
        data: data,
        timestamp: Date.now(),
      },
    },
    { upsert: true }
  );
}

async function cleanupCache() {
  const client = await connectToDatabase();
  const db = client.db("nft-portfolio");
  const cacheCollection = db.collection("cache");

  const now = Date.now();
  await cacheCollection.deleteMany({
    timestamp: { $lt: now - CACHE_DURATION },
  });
}

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

  // Check MongoDB cache
  try {
    const cachedData = await getCachedData(cacheKey);

    if (cachedData) {
      return NextResponse.json({
        ...cachedData,
        cached: true,
        cachedAt: new Date(cachedData.timestamp).toISOString(),
      });
    }
  } catch (error) {
    console.error("Cache error:", error);
    // Continue with fetch if cache fails
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
      timestamp: Date.now(),
    };

    // Store in MongoDB cache
    try {
      await setCachedData(cacheKey, responseData);
      // Clean up old cache entries
      await cleanupCache();
    } catch (error) {
      console.error("Cache storage error:", error);
      // Continue even if caching fails
    }

    return NextResponse.json(responseData);
  } catch (error: any) {
    console.error("Fetch error:", error);
    return NextResponse.json(
      { error: `Failed to fetch NFTs: ${error.message}` },
      { status: 500 }
    );
  }
}
