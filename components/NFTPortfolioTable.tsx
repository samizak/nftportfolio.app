import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar } from "@/components/ui/avatar";
import { useMemo, useState } from "react";
import Image from "next/image";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ChevronUpIcon, ChevronDownIcon } from "@radix-ui/react-icons";
import { formatThousandSeparator } from "@/utils/formatters";

interface NFTPortfolioTableProps {
  searchQuery: string;
  data?: any[];
  totalValue?: number;
}

type SortColumn =
  | "name"
  | "quantity"
  | "floor_price"
  | "total_value"
  | "percentage";
type SortDirection = "asc" | "desc";

export default function NFTPortfolioTable({
  searchQuery,
  data = [],
  totalValue = 0,
}: NFTPortfolioTableProps) {
  const [sortColumn, setSortColumn] = useState<SortColumn>("percentage");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  const handleSort = (column: SortColumn) => {
    if (column === sortColumn) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("desc");
    }
  };

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
      .sort((a, b) => {
        if (sortColumn === "name") {
          return sortDirection === "asc"
            ? a.name?.localeCompare(b.name || "")
            : b.name?.localeCompare(a.name || "");
        }
        return sortDirection === "asc"
          ? (a[sortColumn] || 0) - (b[sortColumn] || 0)
          : (b[sortColumn] || 0) - (a[sortColumn] || 0);
      });
  }, [data, searchQuery, totalValue, sortColumn, sortDirection]);

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

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead
            onClick={() => handleSort("name")}
            className="cursor-pointer"
          >
            <div className="flex items-center">
              Collection
              {sortColumn === "name" && (
                <span className="ml-1">
                  {sortDirection === "asc" ? (
                    <ChevronUpIcon />
                  ) : (
                    <ChevronDownIcon />
                  )}
                </span>
              )}
            </div>
          </TableHead>
          <TableHead
            onClick={() => handleSort("quantity")}
            className="text-right cursor-pointer"
          >
            <div className="flex items-center justify-end">
              Quantity
              {sortColumn === "quantity" && (
                <span className="ml-1">
                  {sortDirection === "asc" ? (
                    <ChevronUpIcon />
                  ) : (
                    <ChevronDownIcon />
                  )}
                </span>
              )}
            </div>
          </TableHead>
          <TableHead
            onClick={() => handleSort("floor_price")}
            className="text-right cursor-pointer"
          >
            <div className="flex items-center justify-end">
              Floor Price
              {sortColumn === "floor_price" && (
                <span className="ml-1">
                  {sortDirection === "asc" ? (
                    <ChevronUpIcon />
                  ) : (
                    <ChevronDownIcon />
                  )}
                </span>
              )}
            </div>
          </TableHead>
          <TableHead
            onClick={() => handleSort("total_value")}
            className="text-right cursor-pointer"
          >
            <div className="flex items-center justify-end">
              Value (Ξ)
              {sortColumn === "total_value" && (
                <span className="ml-1">
                  {sortDirection === "asc" ? (
                    <ChevronUpIcon />
                  ) : (
                    <ChevronDownIcon />
                  )}
                </span>
              )}
            </div>
          </TableHead>
          <TableHead
            onClick={() => handleSort("percentage")}
            className="text-right cursor-pointer"
          >
            <div className="flex items-center justify-end">
              Portfolio (%)
              {sortColumn === "percentage" && (
                <span className="ml-1">
                  {sortDirection === "asc" ? (
                    <ChevronUpIcon />
                  ) : (
                    <ChevronDownIcon />
                  )}
                </span>
              )}
            </div>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {filteredData.map((item) => (
          <TableRow key={item.collection}>
            <TableCell className="flex items-center gap-2">
              <Avatar className="h-10 w-10 flex-shrink-0">
                <img
                  src={item.image_url || "https://placehold.co/100?text=NFT"}
                  alt={item.name || "Collection"}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      "https://placehold.co/100?text=NFT";
                  }}
                />
              </Avatar>
              <div className="flex gap-2 items-center">
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
            <TableCell className="text-right">
              {formatThousandSeparator(item.quantity)}
            </TableCell>
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
