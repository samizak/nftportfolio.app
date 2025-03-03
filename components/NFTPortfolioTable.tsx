import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Avatar } from "@/components/ui/avatar"

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
]

export default function NFTPortfolioTable() {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>NFT</TableHead>
          <TableHead>Collection</TableHead>
          <TableHead>Floor Price</TableHead>
          <TableHead>Last Price</TableHead>
          <TableHead>Profit/Loss</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {mockData.map((nft) => (
          <TableRow key={nft.id}>
            <TableCell className="flex items-center gap-2">
              <Avatar>
                <img src={nft.image} alt={nft.name} />
              </Avatar>
              {nft.name}
            </TableCell>
            <TableCell>{nft.collection}</TableCell>
            <TableCell>Ξ {nft.floorPrice}</TableCell>
            <TableCell>Ξ {nft.lastPrice}</TableCell>
            <TableCell className={nft.profit > 0 ? "text-green-500" : "text-red-500"}>
              {nft.profit > 0 ? "+" : ""}Ξ {nft.profit}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}