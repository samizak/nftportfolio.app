import { NextResponse } from "next/server";
import { ethers } from "ethers";

// Create provider with retry logic
const createProvider = () => {
  const provider = new ethers.JsonRpcProvider(
    "https://mainnet.infura.io/v3/" + process.env.INFURA_API_KEY
  );

  provider.on("error", (error) => {
    console.error("Provider error:", error);
    // Attempt to reconnect
    provider.destroy();
    return createProvider();
  });

  return provider;
};

const provider = createProvider();

// Cache ENS lookups to reduce API calls
const ensCache = new Map<string, { name: string | null; timestamp: number }>();
const CACHE_DURATION = 1000 * 60 * 60; // 60 minutes

export async function GET(req: any, res: any) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json(
      { error: "Missing Ethereum address (id query parameter)" },
      { status: 400 }
    );
  }

  // Validate Ethereum address format
  if (!ethers.isAddress(id)) {
    return NextResponse.json(
      { error: "Invalid Ethereum address format" },
      { status: 400 }
    );
  }

  try {
    // Check cache first
    const cached = ensCache.get(id.toLowerCase());
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return NextResponse.json({
        address: id,
        ens: cached.name,
        cached: true,
      });
    }

    // Lookup ENS with timeout
    const ensNamePromise = provider.lookupAddress(id);
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("ENS lookup timeout")), 5000)
    );

    const ensName = await Promise.race([ensNamePromise, timeoutPromise]);

    // Update cache
    ensCache.set(id.toLowerCase(), {
      name: ensName as any,
      timestamp: Date.now(),
    });

    return NextResponse.json({
      address: id,
      ens: ensName,
      cached: false,
    });
  } catch (error) {
    console.error("ENS lookup error:", error);

    // Return cached result if available, even if expired
    const cached = ensCache.get(id.toLowerCase());
    if (cached) {
      return NextResponse.json({
        address: id,
        ens: cached.name,
        cached: true,
        stale: true,
      });
    }

    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "An unknown error occurred",
        address: id,
        ens: null,
      },
      {
        status:
          error instanceof Error && error.message.includes("timeout")
            ? 504
            : 500,
      }
    );
  }
}
