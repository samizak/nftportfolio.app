import { NextResponse } from "next/server";
import { MongoClient } from "mongodb";

export async function POST(req: Request) {
  try {
    const { collections } = await req.json();

    if (!collections || !Array.isArray(collections)) {
      return NextResponse.json(
        { error: "Invalid request format. Expected array of collection slugs" },
        { status: 400 }
      );
    }

    const client = new MongoClient(process.env.MONGODB_URI || "");
    await client.connect();
    const database = client.db("nft-portfolio");
    const collectionsDb = database.collection("collections");
    const priceCache = database.collection("price-cache");

    const fiveMinutesAgo = new Date();
    fiveMinutesAgo.setMinutes(fiveMinutesAgo.getMinutes() - 5);

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Get all cached data first
    const cachedCollections = await collectionsDb
      .find({
        collection: { $in: collections },
        timestamp: { $gt: sevenDaysAgo },
      })
      .toArray();

    const cachedPrices = await priceCache
      .find({
        collection: { $in: collections },
        timestamp: { $gt: fiveMinutesAgo },
      })
      .toArray();

    // Determine which collections need fresh data
    const cachedCollectionSlugs = new Set(
      cachedCollections.map((c) => c.collection)
    );
    const cachedPriceSlugs = new Set(cachedPrices.map((c) => c.collection));

    const collectionsToFetch = collections.filter(
      (slug) => !cachedCollectionSlugs.has(slug)
    );
    const pricesToFetch = collections.filter(
      (slug) => !cachedPriceSlugs.has(slug)
    );

    // Prepare response object with cached data - MOVED THIS UP
    const result: any = {};

    // Add cached collection data
    cachedCollections.forEach((collection) => {
      if (!result[collection.collection]) {
        result[collection.collection] = {};
      }
      result[collection.collection].info = collection;
    });

    // Add cached price data
    cachedPrices.forEach((price) => {
      if (!result[price.collection]) {
        result[price.collection] = {};
      }
      result[price.collection].price = price;
    });

    // Fetch missing collection data
    const newCollectionData = await Promise.all(
      collectionsToFetch.map(async (slug) => {
        try {
          const openseaUrl = `https://api.opensea.io/api/v2/collections/${slug}`;
          const response = await fetch(openseaUrl, {
            method: "GET",
            headers: {
              accept: "application/json",
              "x-api-key": process.env.OPENSEA_API_KEY || "",
            },
          });

          if (!response.ok) {
            return null;
          }

          const data = await response.json();
          const collectionData = {
            collection: data.collection,
            name: data.name,
            description: data.description,
            image_url: data.image_url,
            safelist_status: data.safelist_status,
            timestamp: new Date(),
          };

          // Store in database
          await collectionsDb.updateOne(
            { collection: collectionData.collection },
            { $set: collectionData },
            { upsert: true }
          );

          return collectionData;
        } catch (error) {
          console.error(`Error fetching collection ${slug}:`, error);
          return null;
        }
      })
    );

    // Fetch missing price data
    const newPriceData = await Promise.all(
      pricesToFetch.map(async (slug) => {
        try {
          const openseaUrl = `https://api.opensea.io/api/v2/listings/collection/${slug}/best`;
          const response = await fetch(openseaUrl, {
            method: "GET",
            headers: {
              accept: "application/json",
              "x-api-key": process.env.OPENSEA_API_KEY || "",
            },
          });

          if (!response.ok) {
            return null;
          }

          const data = await response.json();
          const floorData = data.listings[0]?.price?.current?.value || 0;

          let floorPrice = 0;
          if (floorData > 0) {
            floorPrice = floorData / Math.pow(10, 18);
          }

          const priceData = {
            collection: slug,
            floor_price: floorPrice,
            timestamp: new Date(),
          };

          // Store in database
          await priceCache.updateOne(
            { collection: slug },
            { $set: priceData },
            { upsert: true }
          );

          return priceData;
        } catch (error) {
          console.error(`Error fetching price for ${slug}:`, error);
          return null;
        }
      })
    );

    // Add new collection data to result
    newCollectionData.filter(Boolean).forEach((collection: any) => {
      if (!result[collection.collection]) {
        result[collection.collection] = {};
      }
      result[collection.collection].info = collection;
    });

    // Add new price data to result
    newPriceData.filter(Boolean).forEach((price: any) => {
      if (!result[price.collection]) {
        result[price.collection] = {};
      }
      result[price.collection].price = price;
    });

    await client.close();

    return NextResponse.json({
      data: result,
      missingCollections: collectionsToFetch,
      missingPrices: pricesToFetch,
    });
  } catch (error) {
    console.error("Batch collections error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "An unknown error occurred",
      },
      { status: 500 }
    );
  }
}
