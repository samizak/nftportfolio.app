import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Avatar } from "@/components/ui/avatar"
import { useMemo } from "react"

interface NFT {
  id: number;
  name: string;
  collection: string;
  image: string;
  floorPrice: number;
  profit: number;
}

interface CollectionData {
  collection: string;
  image: string;
  quantity: number;
  floorPrice: number;
  profit: number;
  value: number;
  percentage: number;
}

interface NFTPortfolioTableProps {
  searchQuery: string;
}

export default function NFTPortfolioTable({ searchQuery }: NFTPortfolioTableProps) {
  const mockData = [
    {
      id: 1,
      name: "Bored Ape #1234",
      collection: "BAYC",
      image: "https://placehold.co/400",
      floorPrice: 30.5,
      lastPrice: 35.2,
      profit: 15.4,
    },
    {
      id: 2,
      name: "Doodle #5678",
      collection: "Doodles",
      image: "https://placehold.co/400",
      floorPrice: 8.2,
      lastPrice: 10.1,
      profit: -2.3,
    },
    {
      id: 3,
      name: "Azuki #4231",
      collection: "Azuki",
      image: "https://placehold.co/400",
      floorPrice: 12.8,
      lastPrice: 14.5,
      profit: 1.7,
    },
    {
      id: 4,
      name: "CloneX #9876",
      collection: "CloneX",
      image: "https://placehold.co/400",
      floorPrice: 5.4,
      lastPrice: 6.2,
      profit: 0.8,
    },
    {
      id: 5,
      name: "Moonbird #3456",
      collection: "Moonbirds",
      image: "https://placehold.co/400",
      floorPrice: 7.9,
      lastPrice: 6.5,
      profit: -1.4,
    },
    {
      id: 6,
      name: "CryptoPunk #7890",
      collection: "CryptoPunks",
      image: "https://placehold.co/400",
      floorPrice: 65.2,
      lastPrice: 70.1,
      profit: 4.9,
    },
    {
      id: 7,
      name: "Pudgy Penguin #2345",
      collection: "Pudgy Penguins",
      image: "https://placehold.co/400",
      floorPrice: 4.2,
      lastPrice: 5.8,
      profit: 1.6,
    },
    {
      id: 8,
      name: "World of Women #6789",
      collection: "WoW",
      image: "https://placehold.co/400",
      floorPrice: 3.1,
      lastPrice: 2.8,
      profit: -0.3,
    },
    {
      id: 9,
      name: "Cool Cat #1122",
      collection: "Cool Cats",
      image: "https://placehold.co/400",
      floorPrice: 2.5,
      lastPrice: 3.2,
      profit: 0.7,
    },
    {
      id: 10,
      name: "Meebits #3344",
      collection: "Meebits",
      image: "https://placehold.co/400",
      floorPrice: 4.8,
      lastPrice: 4.2,
      profit: -0.6,
    },
    {
      id: 11,
      name: "Degen Toonz #5566",
      collection: "Degen Toonz",
      image: "https://placehold.co/400",
      floorPrice: 1.2,
      lastPrice: 1.8,
      profit: 0.6,
    },
    {
      id: 12,
      name: "Invisible Friends #7788",
      collection: "Invisible Friends",
      image: "https://placehold.co/400",
      floorPrice: 2.7,
      lastPrice: 3.5,
      profit: 0.8,
    },
    {
      id: 13,
      name: "Bored Ape #5432",
      collection: "BAYC",
      image: "https://placehold.co/400",
      floorPrice: 30.5,
      lastPrice: 28.7,
      profit: -1.8,
    },
    {
      id: 14,
      name: "Mutant Ape #9988",
      collection: "MAYC",
      image: "https://placehold.co/400",
      floorPrice: 15.3,
      lastPrice: 17.2,
      profit: 1.9,
    },
    {
      id: 15,
      name: "Goblintown #7766",
      collection: "Goblintown",
      image: "https://placehold.co/400",
      floorPrice: 0.8,
      lastPrice: 0.5,
      profit: -0.3,
    },
    {
      id: 16,
      name: "Doodle #1357",
      collection: "Doodles",
      image: "https://placehold.co/400",
      floorPrice: 8.2,
      lastPrice: 9.5,
      profit: 1.3,
    },
    {
      id: 17,
      name: "Otherdeed #2468",
      collection: "Otherside",
      image: "https://placehold.co/400",
      floorPrice: 1.9,
      lastPrice: 2.3,
      profit: 0.4,
    },
    {
      id: 18,
      name: "VeeFriends #3579",
      collection: "VeeFriends",
      image: "https://placehold.co/400",
      floorPrice: 5.6,
      lastPrice: 4.8,
      profit: -0.8,
    },
    {
      id: 19,
      name: "Cryptoadz #4680",
      collection: "Cryptoadz",
      image: "https://placehold.co/400",
      floorPrice: 3.4,
      lastPrice: 4.1,
      profit: 0.7,
    },
    {
      id: 20,
      name: "RTFKT Clone #5791",
      collection: "RTFKT",
      image: "https://placehold.co/400",
      floorPrice: 4.7,
      lastPrice: 5.3,
      profit: 0.6,
    }
  ]
  // Group NFTs by collection and calculate aggregated values
  const collectionData = useMemo(() => {
    // Group NFTs by collection
    const collections: Record<string, NFT[]> = {};
    mockData.forEach(nft => {
      if (!collections[nft.collection]) {
        collections[nft.collection] = [];
      }
      collections[nft.collection].push(nft);
    });
  // Calculate total portfolio value
    const totalValue = Object.values(collections).reduce((total, nfts) => {
      return total + nfts.length * nfts[0].floorPrice;
    }, 0);
  // Create collection data array
    return Object.entries(collections).map(([collection, nfts]): CollectionData => {
      const value = nfts.length * nfts[0].floorPrice;
      return {
        collection,
        image: nfts[0].image, // Use the first NFT's image as collection image
        quantity: nfts.length,
        floorPrice: nfts[0].floorPrice,
        profit: nfts.reduce((sum, nft) => sum + nft.profit, 0),
        value,
        percentage: (value / totalValue) * 100
      };
    });
  }, [mockData]);
  // Filter collections based on search query
  const filteredData = collectionData.filter(item =>
    item.collection.toLowerCase().includes(searchQuery.toLowerCase())
  );
  if (filteredData.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <p className="text-muted-foreground mb-2">No collections found matching &quot;{searchQuery}&quot;</p>
        <p className="text-sm text-muted-foreground">Try adjusting your search term</p>
      </div>
    );
  }
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Collection</TableHead>
          <TableHead>Quantity</TableHead>
          <TableHead>Floor Price</TableHead>
          <TableHead>Value (Ξ)</TableHead>
          <TableHead>Portfolio (%)</TableHead>
          <TableHead>Profit/Loss</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {filteredData.map((item) => (
          <TableRow key={item.collection}>
            <TableCell className="flex items-center gap-2">
              <Avatar>
                <img src={item.image || ''} alt={item.collection} />
              </Avatar>
              {item.collection}
            </TableCell>
            <TableCell>{item.quantity}</TableCell>
            <TableCell>Ξ {item.floorPrice.toFixed(2)}</TableCell>
            <TableCell>Ξ {item.value.toFixed(2)}</TableCell>
            <TableCell>{item.percentage.toFixed(1)}%</TableCell>
            <TableCell className={item.profit > 0 ? "text-green-500" : "text-red-500"}>
              {item.profit > 0 ? "+" : ""}Ξ {item.profit.toFixed(2)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}