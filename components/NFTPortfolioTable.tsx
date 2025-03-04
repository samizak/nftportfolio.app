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
import { Button } from "@/components/ui/button";
import { formatThousandSeparator } from "@/utils/formatters";

// Add this utility function to format dollar values
const formatDollarValue = (
  ethValue: number,
  ethPrice: number,
  currency: string
): string => {
  const dollarValue = ethValue * ethPrice;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
  }).format(dollarValue);
};

interface NFTPortfolioTableProps {
  searchQuery: string;
  data?: any[];
  totalValue?: number;
  ethPrice?: number;
  selectedCurrency?: { code: string; symbol: string };
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
  ethPrice = 0,
  selectedCurrency = { code: "USD", symbol: "$" },
}: NFTPortfolioTableProps) {
  const [sortColumn, setSortColumn] = useState<SortColumn>("percentage");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 25;

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

    const filtered = data
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

    // Calculate pagination
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filtered.slice(startIndex, endIndex);
  }, [data, searchQuery, totalValue, sortColumn, sortDirection, currentPage]);

  const totalPages = Math.ceil((data?.length || 0) / itemsPerPage);

  // Check if there's no data initially
  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <p className="text-muted-foreground mb-2">
          No NFTs found in this portfolio
        </p>
        <p className="text-sm text-muted-foreground">
          This wallet doesn't appear to have any NFT collections
        </p>
      </div>
    );
  }

  // Check if there are no results after filtering
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
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <Table className="w-full table-fixed">
          <TableHeader>
            <TableRow>
              <TableHead
                onClick={() => handleSort("name")}
                className="cursor-pointer w-[40%]"
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
                className="text-right cursor-pointer w-[12%]"
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
                className="text-right cursor-pointer w-[16%]"
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
                className="text-right cursor-pointer w-[16%]"
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
                className="text-right cursor-pointer w-[16%]"
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
                <TableCell className="w-[40%]">
                  <div className="flex items-center gap-2 truncate">
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
                    <div className="flex gap-2 items-center min-w-0">
                      <div className="font-medium truncate">
                        {item.name || "Unknown Collection"}
                      </div>
                      {item.is_verified && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              <Image
                                className="inline-block cursor-pointer flex-shrink-0"
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
                  </div>
                </TableCell>
                <TableCell className="text-right w-[12%]">
                  {formatThousandSeparator(item.quantity)}
                </TableCell>
                <TableCell className="text-right w-[16%]">
                  <div>
                    Ξ {item.floor_price?.toFixed(4) || "0.0000"}
                    {ethPrice > 0 && item.floor_price > 0 && (
                      <div className="text-xs text-muted-foreground">
                        {formatDollarValue(
                          item.floor_price,
                          ethPrice,
                          selectedCurrency.code
                        )}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-right w-[16%]">
                  <div>
                    Ξ {item.total_value?.toFixed(2) || "0.00"}
                    {ethPrice > 0 && item.total_value > 0 && (
                      <div className="text-xs text-muted-foreground">
                        {formatDollarValue(
                          item.total_value,
                          ethPrice,
                          selectedCurrency.code
                        )}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-right w-[16%]">
                  {item.percentage?.toFixed(1) || "0.0"}%
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 py-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
