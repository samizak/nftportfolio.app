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

    const result: any = {};

    cachedCollections.forEach((collection) => {
      if (!result[collection.collection]) {
        result[collection.collection] = {};
      }
      result[collection.collection].info = collection;
    });

    cachedPrices.forEach((price) => {
      if (!result[price.collection]) {
        result[price.collection] = {};
      }
      result[price.collection].price = price;
    });

    if (collectionsToFetch.length > 0) {
      const apiUrl = `https://api.opensea.io/api/v2/collections/batch`;

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-KEY": process.env.OPENSEA_API_KEY || "",
        },
        body: JSON.stringify({ collections: collectionsToFetch }),
      });

      if (!response.ok) {
        const errorText = await response.text();
      } else {
        const data = await response.json();

        if (data.collections && data.collections.length > 0) {
          for (const collection of data.collections) {
            const collectionData = {
              collection: collection.collection,
              name: collection.name,
              description: collection.description,
              image_url: collection.image_url,
              safelist_status: collection.safelist_status,
              timestamp: new Date(),
            };

            await collectionsDb.updateOne(
              { collection: collectionData.collection },
              { $set: collectionData },
              { upsert: true }
            );

            if (!result[collection.collection]) {
              result[collection.collection] = {};
            }
            result[collection.collection].info = collectionData;
          }
        }
      }
    }

    if (pricesToFetch.length > 0) {
      for (const slug of pricesToFetch) {
        try {
          const openseaUrl = `https://api.opensea.io/api/v2/listings/collection/${slug}/best`;

          const response = await fetch(openseaUrl, {
            method: "GET",
            headers: {
              accept: "application/json",
              "X-API-KEY": process.env.OPENSEA_API_KEY || "",
            },
          });

          if (!response.ok) {
            continue;
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

          await priceCache.updateOne(
            { collection: slug },
            { $set: priceData },
            { upsert: true }
          );

          if (!result[slug]) {
            result[slug] = {};
          }
          result[slug].price = priceData;
        } catch (error) {}
      }
    }

    await client.close();

    return NextResponse.json({
      data: result,
      missingCollections: collectionsToFetch,
      missingPrices: pricesToFetch,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
