"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { CollectionData } from "@/types/nft";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { formatThousandSeparator } from "@/utils/formatters";

interface DataTableProps {
  data: CollectionData[];
  ethPrice: number;
  totalValue: number;
  selectedCurrency: {
    code: string;
    symbol: string;
  };
}

export function DataTable({
  data,
  ethPrice,
  totalValue,
  selectedCurrency,
}: DataTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 25; // Number of items to show per page

  const [sortConfig, setSortConfig] = useState<{
    key: keyof CollectionData | "portfolioPercentage";
    direction: "ascending" | "descending";
  }>({
    key: "total_value",
    direction: "descending",
  });

  // Check if data is valid before sorting
  if (!data || !Array.isArray(data)) {
    console.error("DataTable received invalid data:", data);
    return <div>No data available</div>;
  }

  // Add a loading state when we have a totalValue but no data yet
  if (data.length === 0 && totalValue > 0) {
    return (
      <div className="rounded-md border p-8 text-center">
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-gray-900 dark:border-gray-100"></div>
          <p>Loading NFT collection data...</p>
        </div>
      </div>
    );
  }

  // Show a message when there's no data
  if (data.length === 0) {
    return (
      <div className="rounded-md border p-8 text-center">
        <p className="text-muted-foreground">No NFT collections found</p>
        <p className="text-sm text-muted-foreground mt-2">
          Try searching for a different wallet address
        </p>
      </div>
    );
  }
  const sortedData = [...data].sort((a, b) => {
    // Add debugging for sorting
    if (!a || !b) {
      console.warn("Sorting received undefined items:", { a, b });
      return 0;
    }

    if (sortConfig.key === "portfolioPercentage") {
      const aValue = ((a.total_value || 0) / totalValue) * 100;
      const bValue = ((b.total_value || 0) / totalValue) * 100;
      return sortConfig.direction === "ascending"
        ? aValue - bValue
        : bValue - aValue;
    }

    // Fix for possibly undefined objects
    const aValue = a[sortConfig.key as keyof typeof a];
    const bValue = b[sortConfig.key as keyof typeof b];

    // Log undefined values during sorting
    if (aValue === undefined || bValue === undefined) {
      console.warn(`Undefined values for key ${sortConfig.key}:`, {
        collection: a.collection || b.collection,
        aValue,
        bValue,
      });
    }

    if (aValue === undefined) return 1;
    if (bValue === undefined) return -1;

    if (aValue < bValue) {
      return sortConfig.direction === "ascending" ? -1 : 1;
    }
    if (aValue > bValue) {
      return sortConfig.direction === "ascending" ? 1 : -1;
    }
    return 0;
  });

  // Calculate pagination values
  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, sortedData.length);
  const paginatedData = sortedData.slice(startIndex, endIndex);

  const requestSort = (key: keyof CollectionData | "portfolioPercentage") => {
    let direction: "ascending" | "descending" = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
    // Reset to first page when sorting changes
    setCurrentPage(1);
  };

  const getSortIndicator = (
    key: keyof CollectionData | "portfolioPercentage"
  ) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === "ascending" ? " ↑" : " ↓";
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow className="border-b border-border/40 bg-muted/30 hover:bg-muted/50 transition-colors">
            <TableHead
              className="w-[40%] cursor-pointer py-3.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1 pl-4 h-full my-auto"
              onClick={() => requestSort("name")}
            >
              Collection{" "}
              {getSortIndicator("name") && (
                <span className="text-primary">{getSortIndicator("name")}</span>
              )}
            </TableHead>
            <TableHead
              className="w-[12%] text-right cursor-pointer py-3.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors my-auto"
              onClick={() => requestSort("quantity")}
            >
              Quantity{" "}
              {getSortIndicator("quantity") && (
                <span className="text-primary">
                  {getSortIndicator("quantity")}
                </span>
              )}
            </TableHead>
            <TableHead
              className="w-[16%] text-right cursor-pointer py-3.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors my-auto"
              onClick={() => requestSort("floor_price")}
            >
              Floor Price{" "}
              {getSortIndicator("floor_price") && (
                <span className="text-primary">
                  {getSortIndicator("floor_price")}
                </span>
              )}
            </TableHead>
            <TableHead
              className="w-[16%] text-right cursor-pointer py-3.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors my-auto"
              onClick={() => requestSort("total_value")}
            >
              Value{" "}
              {getSortIndicator("total_value") && (
                <span className="text-primary">
                  {getSortIndicator("total_value")}
                </span>
              )}
            </TableHead>
            <TableHead
              className="w-[16%] text-right cursor-pointer py-3.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors my-auto pr-4"
              onClick={() => requestSort("portfolioPercentage")}
            >
              Portfolio %{" "}
              {getSortIndicator("portfolioPercentage") && (
                <span className="text-primary">
                  {getSortIndicator("portfolioPercentage")}
                </span>
              )}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedData.map((collection) => (
            <TableRow
              key={collection.collection}
              className="hover:bg-muted/20 transition-colors"
            >
              <TableCell className="w-[40%] py-3 pl-4">
                <div className="flex items-center space-x-3 min-w-0">
                  {collection.image_url ? (
                    <div className="relative h-10 w-10 flex-shrink-0 rounded-md overflow-hidden">
                      <Image
                        src={collection.image_url}
                        alt={collection.name}
                        fill
                        sizes="40px"
                        className="object-cover"
                        unoptimized={collection.image_url.endsWith(".gif")}
                      />
                    </div>
                  ) : (
                    <div className="h-10 w-10 flex-shrink-0 rounded-md bg-gray-200 dark:bg-gray-800"></div>
                  )}
                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-1">
                      <span className="font-medium truncate">
                        {collection.name}
                      </span>
                      {collection.is_verified && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              <Image
                                className="inline-block cursor-pointer flex-shrink-0"
                                src="/verified_checkmark.svg"
                                alt="verified"
                                width={18}
                                height={18}
                              />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Verified Collection</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {collection.collection}
                    </span>
                  </div>
                </div>
              </TableCell>
              <TableCell className="w-[12%] text-right py-3 align-middle">
                <Badge variant="outline">{collection.quantity}</Badge>
              </TableCell>
              <TableCell className="w-[16%] text-right py-3 align-middle">
                <div className="space-y-1">
                  <div>
                    {collection.floor_price
                      ? `${collection.floor_price.toFixed(3)} ETH`
                      : "N/A"}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {collection.floor_price
                      ? formatCurrency(
                          collection.floor_price * ethPrice,
                          selectedCurrency.code,
                          selectedCurrency.symbol
                        )
                      : ""}
                  </div>
                </div>
              </TableCell>
              <TableCell className="w-[16%] text-right py-3 align-middle">
                <div className="space-y-1">
                  <div>
                    {collection.total_value
                      ? `${formatThousandSeparator(
                          +collection.total_value.toFixed(3)
                        )} ETH`
                      : "N/A"}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {collection.total_value
                      ? formatCurrency(
                          collection.total_value * ethPrice,
                          selectedCurrency.code,
                          selectedCurrency.symbol
                        )
                      : ""}
                  </div>
                </div>
              </TableCell>
              <TableCell className="w-[16%] text-right py-3 pr-4 align-middle">
                {totalValue > 0
                  ? `${(
                      ((collection.total_value || 0) / totalValue) *
                      100
                    ).toFixed(2)}%`
                  : "0%"}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Pagination controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t">
          <div className="text-sm text-muted-foreground">
            Showing <span className="font-medium">{startIndex + 1}</span> to{" "}
            <span className="font-medium">{endIndex}</span> of{" "}
            <span className="font-medium">{sortedData.length}</span> collections
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
