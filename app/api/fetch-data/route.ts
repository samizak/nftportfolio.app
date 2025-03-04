import { NextResponse } from "next/server";

export async function GET(req: any, res: any) {
  const { searchParams } = new URL(req.url);
  const address = searchParams.get("address");

  if (!address) {
    return NextResponse.json(
      { error: "Missing Ethereum address (id query parameter)" },
      { status: 400 }
    );
  }

  const nftFreqMap = new Map();

  const openSeaFetchOptions = {
    method: "GET",
    headers: {
      accept: "application/json",
      "x-api-key": process.env.OPENSEA_API_KEY || "",
    },
  };
  const coingeckoFetchOptions = {
    method: "GET",
    headers: {
      accept: "application/json",
      "x-cg-pro-api-key": "CG-jGgLXA4aqxvHmmZSG6LYhLnZ",
    },
  };

  let data = [];
  let _next = "";
  while (true) {
    const nftByAccountResponse = await fetch(
      `https://api.opensea.io/api/v2/chain/ethereum/account/${address}/nfts?limit=200&next=${_next}`,
      openSeaFetchOptions
    )
      .then((res) => {
        if (!res.ok) throw new Error("Network response was not ok");
        return res.json();
      })
      .then((data) => data)
      .catch((error) => console.error("Fetch error:", error));

    data.push(nftByAccountResponse.nfts);

    if (!nftByAccountResponse?.next) break;
    _next = nftByAccountResponse.next;
  }
  data = data.flat();

  for (const str of data) {
    nftFreqMap.set(str.collection, (nftFreqMap.get(str.collection) || 0) + 1);
  }
  const nftData = Array.from(nftFreqMap, ([collection, count]) => ({
    collection,
    count,
  }));

  let arr: any = [];
  for (const data of nftData) {
    const getCollectionResponse = await fetch(
      `https://api.opensea.io/api/v2/collections/${data.collection}`,
      openSeaFetchOptions
    )
      .then((res) => res.json())
      .catch((err) => console.error(err));

    const res = {
      collection: getCollectionResponse.collection,
      name: getCollectionResponse.name,
      image_url: getCollectionResponse.image_url,
      is_verified: getCollectionResponse.safelist_status == "verified",
    };

    arr.push(res);
  }

  let totalNftCount = 0;
  let index = 0;
  for (const arrData of arr) {
    const nftCount = nftData.find(
      (o) => o.collection == arrData.collection
    )?.count;
    arr[index]["count"] = nftCount;
    totalNftCount += nftCount;
    index++;
  }

  const ethPrice = await fetch(
    "https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd",
    coingeckoFetchOptions
  )
    .then((res) => res.json())
    .catch((err) => console.error(err));

  let index2 = 0;
  for (const val of arr) {
    const nftListings = await fetch(
      `https://api.opensea.io/api/v2/listings/collection/${val.collection}/best`,
      openSeaFetchOptions
    )
      .then((res) => res.json())
      .catch((err) => console.error(err));

    const floorData = nftListings.listings[0]?.price?.current?.value || 0;
    let floorPrice = 0;
    if (floorData > 0) {
      floorPrice = floorData / Math.pow(10, 18);
    }

    arr[index2]["floor_price"] = floorPrice;
    arr[index2]["total_value"] = floorPrice * arr[index2].count;
    index2++;
  }
  console.log(arr);

  const totalPortfolioValue = arr.reduce(
    (sum: any, item: { total_value: any }) => sum + item.total_value,
    0
  );

  return NextResponse.json({
    length: totalNftCount,
    ethPrice: ethPrice.ethereum.usd,
    totalPortfolioValue: totalPortfolioValue,
    data: arr,
  });
}
