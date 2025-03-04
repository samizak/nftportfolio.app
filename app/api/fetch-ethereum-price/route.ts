import { NextResponse } from "next/server";

// Cache setup
const priceCache = new Map<string, { price: number; timestamp: number }>();
const CACHE_DURATION = 1000 * 60 * 5; // 5 minutes

export async function GET(req: any, res: any) {
  const { searchParams } = new URL(req.url);
  const vs_currency = searchParams.get("vs_currencies");

  try {
    // Check cache first
    const cached = priceCache.get("ethereum");
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return NextResponse.json({
        ethPrice: cached.price,
        cached: true,
      });
    }

    const coingeckoFetchOptions = {
      method: "GET",
      headers: {
        accept: "application/json",
        "x-cg-pro-api-key": process.env.COINGECKO_API_KEY || "",
      },
    };

    // Fetch with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=${vs_currency}`,
      {
        ...coingeckoFetchOptions,
        signal: controller.signal,
      }
    );

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    // console.log(data);
    const price = data.ethereum.usd;

    // Update cache
    priceCache.set("ethereum", {
      price,
      timestamp: Date.now(),
    });

    return NextResponse.json({
      ethPrice: price,
      cached: false,
    });
  } catch (error) {
    console.error("Price fetch error:", error);

    // Return cached result if available, even if expired
    const cached = priceCache.get("ethereum");
    if (cached) {
      return NextResponse.json({
        ethPrice: cached.price,
        cached: true,
      });
    }

    return NextResponse.json(
      { error: "Failed to fetch ETH price" },
      { status: 500 }
    );
  }
}
