import { NextResponse } from "next/server";
import { ethers } from "ethers";
import { MongoClient } from "mongodb";

// MongoDB connection
let client: MongoClient | null = null;

async function connectToDatabase() {
  if (client) return client;
  const uri = process.env.MONGODB_URI;
  if (!uri)
    throw new Error("Please define the MONGODB_URI environment variable");
  client = new MongoClient(uri);
  await client.connect();
  return client;
}

// Create provider with retry logic
const createProvider = () => {
  const provider = new ethers.JsonRpcProvider(
    "https://mainnet.infura.io/v3/" + process.env.INFURA_API_KEY
  );

  provider.on("error", (error) => {
    console.error("Provider error:", error);
    provider.destroy();
    return createProvider();
  });

  return provider;
};

const provider = createProvider();

async function resolveWithRetry(
  ensName: string,
  retries = 5
): Promise<string | null> {
  for (let i = 0; i < retries; i++) {
    try {
      const address = await provider.resolveName(ensName);
      return address;
    } catch (error) {
      console.error(`Attempt ${i + 1} failed:`, error);
      if (i < retries - 1) {
        await new Promise((resolve) => setTimeout(resolve, 60 * 1000)); // 1 minute delay
      }
    }
  }
  return null;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const ensName = searchParams.get("id");

  if (!ensName) {
    return NextResponse.json(
      { error: "Missing ENS name (name query parameter)" },
      { status: 400 }
    );
  }

  try {
    // Connect to MongoDB
    const mongoClient = await connectToDatabase();
    const db = mongoClient.db("nft-portfolio");
    const cacheCollection = db.collection("ens-cache");

    // Check cache first
    const cached = await cacheCollection.findOne({
      ensName: ensName.toLowerCase(),
      timestamp: { $gt: new Date(Date.now() - 24 * 60 * 60 * 1000) }, // 24 hour cache
    });

    if (cached) {
      return NextResponse.json({
        ensName,
        address: cached.address,
        cached: true,
      });
    }

    // Resolve ENS with retry logic
    const address = await resolveWithRetry(ensName);

    if (!address) {
      return NextResponse.json(
        { error: "Could not resolve ENS name after multiple attempts" },
        { status: 404 }
      );
    }

    // Update cache
    await cacheCollection.updateOne(
      { ensName: ensName.toLowerCase() },
      {
        $set: {
          ensName: ensName.toLowerCase(),
          address,
          timestamp: new Date(),
        },
      },
      { upsert: true }
    );

    return NextResponse.json({
      ensName,
      address,
      cached: false,
    });
  } catch (error) {
    console.error("ENS resolution error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "An unknown error occurred",
        ensName,
        address: null,
      },
      { status: 500 }
    );
  }
}
