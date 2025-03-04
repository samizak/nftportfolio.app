import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar } from "@/components/ui/avatar";
import { useMemo } from "react";
import Image from "next/image";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface NFTPortfolioTableProps {
  searchQuery: string;
  data?: any[];
  totalValue?: number;
}

export default function NFTPortfolioTable({
  searchQuery,
  data = [],
  totalValue = 0,
}: NFTPortfolioTableProps) {
  const filteredData = useMemo(() => {
    if (!data || data.length === 0) return [];

    return data
      .filter(
        (item) =>
          item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.collection?.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .map((item) => ({
        ...item,
        percentage: totalValue > 0 ? (item.total_value / totalValue) * 100 : 0,
      }))
      .sort((a, b) => b.total_value - a.total_value); // Sort by value descending
  }, [data, searchQuery, totalValue]);

  if (filteredData.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <p className="text-muted-foreground mb-2">
          No collections found matching &quot;{searchQuery}&quot;
        </p>
        <p className="text-sm text-muted-foreground">
          Try adjusting your search term
        </p>
      </div>
    );
  }

  // console.log(filteredData);

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Collection</TableHead>
          <TableHead className="text-right">Quantity</TableHead>
          <TableHead className="text-right">Floor Price</TableHead>
          <TableHead className="text-right">Value (Ξ)</TableHead>
          <TableHead className="text-right">Portfolio (%)</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {filteredData.map((item) => (
          <TableRow key={item.collection}>
            <TableCell className="flex items-center gap-2">
              <Avatar className="h-10 w-10">
                <img
                  src={item.image_url || "https://placehold.co/100?text=NFT"}
                  alt={item.name || "Collection"}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      "https://placehold.co/100?text=NFT";
                  }}
                />
              </Avatar>
              <div className="flex gap-2">
                <div className="font-medium">
                  {item.name || "Unknown Collection"}
                </div>
                {item.is_verified && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <Image
                          className="inline-block cursor-pointer"
                          src="/verified_checkmark.svg"
                          alt="verified"
                          width={14}
                          height={14}
                        />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>This collection is verified</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>
            </TableCell>
            <TableCell className="text-right">{item.quantity}</TableCell>
            <TableCell className="text-right">
              Ξ {item.floor_price?.toFixed(4) || "0.0000"}
            </TableCell>
            <TableCell className="text-right">
              Ξ {item.total_value?.toFixed(2) || "0.00"}
            </TableCell>
            <TableCell className="text-right">
              {item.percentage?.toFixed(1) || "0.0"}%
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
