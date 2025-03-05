import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const walletAddress = searchParams.get("address");

    if (!walletAddress) {
      return NextResponse.json(
        { error: "Wallet address is required" },
        { status: 400 }
      );
    }

    const response = await fetch(
      `https://api.opensea.io/api/v2/events/accounts/${walletAddress}?chain=ethereum&event_type=sale&event_type=cancel&event_type=transfer&limit=50`,
      {
        headers: {
          Accept: "application/json",
          "X-API-KEY": process.env.OPENSEA_API_KEY || "",
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("OpenSea API error:", response.status, errorData);
      return NextResponse.json(
        {
          error: "Failed to fetch data from OpenSea",
          status: response.status,
          details: errorData,
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    const res = data.asset_events.map((e: any) => {
      return {
        event_type: e.event_type,
        transaction: e.transaction,
        from_address: e.from_address,
        to_address: e.to_address,
        quantity: e.quantity,
        nft: e.nft,
        timestamp: e.event_timestamp,
      };
    });
    // console.log(res);
    return NextResponse.json(res);
  } catch (error) {
    console.error("Error fetching OpenSea events:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
