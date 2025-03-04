import { NextResponse } from "next/server";

export async function GET(req: any, res: any) {
  const { searchParams } = new URL(req.url);
  const slug = searchParams.get("slug");

  if (!slug) {
    return NextResponse.json(
      { error: "Missing Ethereum address (slug query parameter)" },
      { status: 400 }
    );
  }

  const openseaUrl = `https://api.opensea.io/api/v2/listings/collection/${slug}/best`;

  try {
    const response = await fetch(openseaUrl, {
      method: "GET",
      headers: {
        accept: "application/json",
        "x-api-key": process.env.OPENSEA_API_KEY || "",
      },
    });

    if (!response.ok) {
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

    return NextResponse.json({
      floor_price: floorPrice,
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
