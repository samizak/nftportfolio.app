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
    const collections = database.collection("collections");

    // Check if collection exists in MongoDB and is less than 7 days old
    const existingCollection = await collections.findOne({ collection: slug });
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // If collection exists and data is fresh (less than 7 days old), return it
    if (existingCollection && existingCollection.timestamp > sevenDaysAgo) {
      await client.close();
      return NextResponse.json(existingCollection);
    }

    // Otherwise, fetch from OpenSea API
    const openseaUrl = `https://api.opensea.io/api/v2/collections/${slug}`;
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
    const collectionData = {
      collection: data.collection,
      name: data.name,
      description: data.description,
      image_url: data.image_url,
      safelist_status: data.safelist_status,
      timestamp: new Date(),
    };

    // Update MongoDB with fresh data
    await collections.updateOne(
      { collection: collectionData.collection },
      { $set: collectionData },
      { upsert: true }
    );

    await client.close();
    console.log("Collection info saved to MongoDB:", collectionData.name);

    return NextResponse.json(collectionData);
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
