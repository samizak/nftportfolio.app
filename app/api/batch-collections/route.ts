import { NextResponse } from "next/server";
import { MongoClient } from "mongodb";

export async function POST(req: Request) {
  try {
    const { collections } = await req.json();

    // console.log(`[${new Date().toISOString()}] Batch collections API called with ${collections?.length || 0} collections`);

    if (!collections || !Array.isArray(collections)) {
      // console.log(`[${new Date().toISOString()}] Invalid request format: ${JSON.stringify(collections)}`);
      return NextResponse.json(
        { error: "Invalid request format. Expected array of collection slugs" },
        { status: 400 }
      );
    }

    // Log the collection slugs being requested
    // console.log(`[${new Date().toISOString()}] Collection slugs: ${JSON.stringify(collections)}`);

    // Connect to MongoDB
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

    // console.log(
    //   `[${new Date().toISOString()}] Using cached data for ${
    //     cachedCollections.length
    //   } collections and ${cachedPrices.length} prices`
    // );
    // console.log(
    //   `[${new Date().toISOString()}] Need to fetch ${
    //     collectionsToFetch.length
    //   } collections and ${pricesToFetch.length} prices`
    // );

    // Prepare response object with cached data
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

    // Fetch missing collection data if needed
    if (collectionsToFetch.length > 0) {
      // console.log(
      //   `[${new Date().toISOString()}] Fetching collection data for: ${collectionsToFetch.join(
      //     ", "
      //   )}`
      // );

      // Add more detailed logging for the API request
      const apiUrl = `https://api.opensea.io/api/v2/collections/batch`;
      // console.log(`[${new Date().toISOString()}] Making request to: ${apiUrl}`);

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-KEY": process.env.OPENSEA_API_KEY || "",
        },
        body: JSON.stringify({ collections: collectionsToFetch }),
      });

      // Log the response status and headers
      // console.log(
      //   `[${new Date().toISOString()}] OpenSea API response status: ${
      //     response.status
      //   }`
      // );
      // console.log(
      //   `[${new Date().toISOString()}] OpenSea API response headers: ${JSON.stringify(
      //     Object.fromEntries([...response.headers.entries()])
      //   )}`
      // );

      if (!response.ok) {
        const errorText = await response.text();
        console.error(
          `[${new Date().toISOString()}] OpenSea API error: ${errorText}`
        );
        // Continue with cached data instead of failing completely
      } else {
        const data = await response.json();

        // Log the response data structure
        // console.log(
        //   `[${new Date().toISOString()}] OpenSea API response data structure: ${Object.keys(
        //     data
        //   ).join(", ")}`
        // );
        // console.log(
        //   `[${new Date().toISOString()}] Collections returned: ${
        //     data.collections?.length || 0
        //   }`
        // );

        // Process and store the new collection data
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

            // Store in database
            await collectionsDb.updateOne(
              { collection: collectionData.collection },
              { $set: collectionData },
              { upsert: true }
            );

            // Add to result
            if (!result[collection.collection]) {
              result[collection.collection] = {};
            }
            result[collection.collection].info = collectionData;
          }
        }
      }
    }

    // Fetch missing price data if needed
    if (pricesToFetch.length > 0) {
      // console.log(
      //   `[${new Date().toISOString()}] Fetching price data for: ${pricesToFetch.join(
      //     ", "
      //   )}`
      // );

      for (const slug of pricesToFetch) {
        try {
          const openseaUrl = `https://api.opensea.io/api/v2/listings/collection/${slug}/best`;
          // console.log(
          //   `[${new Date().toISOString()}] Making price request to: ${openseaUrl}`
          // );

          const response = await fetch(openseaUrl, {
            method: "GET",
            headers: {
              accept: "application/json",
              "X-API-KEY": process.env.OPENSEA_API_KEY || "",
            },
          });

          if (!response.ok) {
            console.error(
              `[${new Date().toISOString()}] Error fetching price for ${slug}: ${
                response.status
              }`
            );
            continue;
          }

          const data = await response.json();
          // console.log(
          //   `[${new Date().toISOString()}] Price data for ${slug}:`,
          //   JSON.stringify(data)
          // );

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

          // Add to result
          if (!result[slug]) {
            result[slug] = {};
          }
          result[slug].price = priceData;
        } catch (error) {
          console.error(
            `[${new Date().toISOString()}] Error fetching price for ${slug}:`,
            error
          );
        }
      }
    }

    await client.close();

    return NextResponse.json({
      data: result,
      missingCollections: collectionsToFetch,
      missingPrices: pricesToFetch,
    });
  } catch (error) {
    console.error(
      `[${new Date().toISOString()}] Error in batch collections API:`,
      error
    );
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
