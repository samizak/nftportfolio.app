import { NextResponse } from "next/server";

export async function GET(req: any, res: any) {
  const { searchParams } = new URL(req.url);
  const address = searchParams.get("address");
  const next = searchParams.get("next");

  if (!address) {
    return NextResponse.json(
      { error: "Missing Ethereum address (address query parameter)" },
      { status: 400 }
    );
  }

  const openSeaFetchOptions = {
    method: "GET",
    headers: {
      accept: "application/json",
      "x-api-key": process.env.OPENSEA_API_KEY || "",
    },
  };

  let url = `https://api.opensea.io/api/v2/chain/ethereum/account/${address}/nfts?limit=200`;
  if (next) {
    url += `&next=${next}`;
  }
  const nftByAccountResponse = await fetch(url, openSeaFetchOptions)
    .then((res) => {
      if (!res.ok) throw new Error("Network response was not ok");
      return res.json();
    })
    .then((data) => data)
    .catch((error) => console.error("Fetch error:", error));

  return NextResponse.json(nftByAccountResponse);
}
