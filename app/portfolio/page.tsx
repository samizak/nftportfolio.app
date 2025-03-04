"use client";
import PortfolioView from "@/components/PortfolioView";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useUser } from "@/context/UserContext";

interface CollectionData {
  collection: string;
  name: string;
  quantity: number;
  image_url: string;
  is_verified: boolean;
  floor_price?: number;
  total_value?: number;
}

export default function AddressPage() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const {
    userData,
    ensData,
    setUserData,
    setEnsData,
    isLoading,
    setIsLoading,
    error,
    setError,
  } = useUser();
  const [collections, setCollections] = useState<CollectionData[]>([]);
  const [ethPrice, setEthPrice] = useState<number>(0);
  const [totalNfts, setTotalNfts] = useState<number>(0);
  const [totalValue, setTotalValue] = useState<number>(0);

  // Fetch ETH price
  useEffect(() => {
    const fetchEthPrice = async () => {
      try {
        const response = await fetch(
          `/api/fetch-ethereum-price?vs_currencies=usd`
        );
        const data = await response.json();
        setEthPrice(data.ethPrice);
      } catch (error) {
        console.error("Error fetching ETH price:", error);
      }
    };
    fetchEthPrice();
  }, []);

  useEffect(() => {
    const fetchCollectionsAndInfo = async () => {
      try {
        let _collectionArray: any = [];
        let _next = "";

        // Fetch all NFTs
        while (true) {
          const url =
            `/api/get-nft-by-account?address=${id}` +
            (_next ? `&next=${_next}` : "");
          const nftByAccountResponse = await fetch(url).then((response) =>
            response.json()
          );

          _collectionArray.push(nftByAccountResponse.nfts);
          if (!nftByAccountResponse?.next) break;
          _next = nftByAccountResponse.next;
        }

        _collectionArray = _collectionArray.flat();
        setTotalNfts(_collectionArray.length);

        // Calculate collection frequencies
        const nftFreqMap = new Map();
        for (const str of _collectionArray) {
          nftFreqMap.set(
            str.collection,
            (nftFreqMap.get(str.collection) || 0) + 1
          );
        }

        const nftData = Array.from(nftFreqMap, ([collection, count]) => ({
          collection,
          count,
        }));

        // Fetch collection details and floor prices
        let collectionDetails: CollectionData[] = [];
        let totalPortfolioValue = 0;

        for (let collection of nftData) {
          const [collectionInfo, floorPrice] = await Promise.all([
            fetch(
              `/api/get-collection-info?slug=${collection.collection}`
            ).then((res) => res.json()),
            fetch(`/api/get-price?slug=${collection.collection}`).then((res) =>
              res.json()
            ),
          ]);

          const collectionData: CollectionData = {
            collection: collectionInfo.collection,
            name: collectionInfo.name,
            quantity: collection.count,
            image_url: collectionInfo.image_url,
            is_verified: collectionInfo.safelist_status === "verified",
            floor_price: floorPrice.floor_price,
            total_value: floorPrice.floor_price * collection.count,
          };

          // console.log(collectionData);

          totalPortfolioValue += collectionData.total_value || 0;
          collectionDetails.push(collectionData);

          // Update the data in real time
          setTotalValue(totalPortfolioValue);
          setCollections(collectionDetails);
        }
      } catch (error) {
        console.error("Error fetching collection data:", error);
        setError("Failed to fetch collection data");
      }
    };

    if (id) {
      fetchCollectionsAndInfo();
    }
  }, [id, setError]);

  // Fetch user profile and ENS data
  useEffect(() => {
    if (!id) {
      setError("No address provided");
      setIsLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const [userResponse, ensResponse] = await Promise.all([
          fetch(`/api/get-user-profile?id=${id}`),
          fetch(`/api/get-ens?id=${id}`),
        ]);

        if (!userResponse.ok || !ensResponse.ok) {
          throw new Error("Failed to fetch data");
        }

        const [userJson, ensJson] = await Promise.all([
          userResponse.json(),
          ensResponse.json(),
        ]);

        setUserData(userJson);
        setEnsData(ensJson);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id, setUserData, setEnsData, setIsLoading, setError]);

  if (error) {
    return <div className="text-red-500">Error: {error}</div>;
  }

  if (isLoading || !userData || !ensData) {
    return <div>Loading...</div>;
  }

  const user = {
    name: userData.username,
    ethHandle: ensData.ens,
    ethAddress: userData.address,
    avatar: userData.profile_image_url,
  };

  return (
    <PortfolioView
      user={user}
      data={collections}
      ethPrice={ethPrice}
      totalNfts={totalNfts}
      totalValue={totalValue}
    />
  );
}
