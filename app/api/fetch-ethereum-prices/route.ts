import { NextResponse } from "next/server";

const DEFAULT_CURRENCIES = "usd,eur,gbp,jpy,aud,cad,cny";
// Cache setup
const priceCache = {
  data: null as any,
  timestamp: 0,
};
const CACHE_DURATION = 1000 * 60 * 5; // 5 minutes

export async function GET(req: any, res: any) {
  try {
    // Check cache first
    const currentTime = Date.now();
    if (
      priceCache.data &&
      currentTime - priceCache.timestamp < CACHE_DURATION
    ) {
      return NextResponse.json({
        ethPrice: priceCache.data,
        cached: true,
        cachedAt: new Date(priceCache.timestamp).toISOString(),
      });
    }

    console.log("Cache miss or expired, fetching fresh data from CoinGecko");

    const coingeckoFetchOptions = {
      method: "GET",
      headers: {
        accept: "application/json",
        "x-cg-api-key": process.env.COINGECKO_API_KEY || "",
      },
    };

    // Log API key presence (not the actual key)
    console.log(`API Key present: ${!!process.env.COINGECKO_API_KEY}`);

    // Fetch with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // Increased timeout to 10s
    const apiUrl = `https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=${DEFAULT_CURRENCIES}`;
    console.log(`Fetching from: ${apiUrl}`);

    const response = await fetch(apiUrl, {
      ...coingeckoFetchOptions,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.error(`API responded with status: ${response.status}`);
      console.error(`Response text: ${await response.text()}`);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log(
      "API response received:",
      JSON.stringify(data).substring(0, 100) + "..."
    );

    const prices = data.ethereum;

    if (!prices) {
      console.error("No ethereum prices in response:", data);
      throw new Error(`No price data found in response`);
    }

    // Update cache
    priceCache.data = prices;
    priceCache.timestamp = currentTime;

    return NextResponse.json({
      ethPrice: prices,
      cached: false,
    });
  } catch (error) {
    // More detailed error logging
    console.error("Price fetch error details:", error);
    if (error instanceof Error) {
      console.error("Error name:", error.name);
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }

    // Return cached data if available, even if expired
    if (priceCache.data) {
      console.log("Returning stale cached data due to fetch error");
      return NextResponse.json({
        ethPrice: priceCache.data,
        cached: true,
        cachedAt: new Date(priceCache.timestamp).toISOString(),
        stale: true,
      });
    }

    return NextResponse.json(
      {
        error: "Failed to fetch ETH prices",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
