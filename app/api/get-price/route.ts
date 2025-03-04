import { NextResponse } from "next/server";
import { MongoClient } from "mongodb";

export async function GET(req: any, res: any) {
  const { searchParams } = new URL(req.url);
  const slug = searchParams.get("slug");

  if (!slug) {
    return NextResponse.json(
      { error: "Missing Ethereum address (slug query parameter)" },
      { status: 400 }
    );
  }

  try {
    // Connect to MongoDB
    const client = new MongoClient(process.env.MONGODB_URI || "");
    await client.connect();
    const database = client.db("nft-portfolio");
    const priceCache = database.collection("price-cache");

    // Check if we have a cached price that's less than 5 minutes old
    const fiveMinutesAgo = new Date();
    fiveMinutesAgo.setMinutes(fiveMinutesAgo.getMinutes() - 5);
    
    const cachedPrice = await priceCache.findOne({
      collection: slug,
      timestamp: { $gt: fiveMinutesAgo }
    });

    // If we have a valid cached price, return it
    if (cachedPrice) {
      await client.close();
      return NextResponse.json({
        floor_price: cachedPrice.floor_price,
        cached: true
      });
    }

    // Otherwise fetch from OpenSea API
    const openseaUrl = `https://api.opensea.io/api/v2/listings/collection/${slug}/best`;
    const response = await fetch(openseaUrl, {
      method: "GET",
      headers: {
        accept: "application/json",
        "x-api-key": process.env.OPENSEA_API_KEY || "",
      },
    });

    if (!response.ok) {
      await client.close();
      return NextResponse.json(
        { error: "Error fetching data from OpenSea" },
        { status: response.status }
      );
    }

    const data = await response.json();
    const floorData = data.listings[0]?.price?.current?.value || 0;

    let floorPrice = 0;
    if (floorData > 0) {
      floorPrice = floorData / Math.pow(10, 18);
    }

    // Store the fresh price in cache
    await priceCache.updateOne(
      { collection: slug },
      { 
        $set: {
          floor_price: floorPrice,
          timestamp: new Date()
        }
      },
      { upsert: true }
    );

    await client.close();
    
    return NextResponse.json({
      floor_price: floorPrice,
      cached: false
    });
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
