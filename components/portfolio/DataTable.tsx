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
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { formatThousandSeparator } from "@/utils/formatters";
import { PackageX } from "lucide-react";

interface DataTableProps {
  data: CollectionData[];
  ethPrice: number;
  totalValue: number;
  selectedCurrency: {
    code: string;
    symbol: string;
  };
  isLoadingMoreNfts: boolean;
  isProcessingPrices: boolean;
  hasMoreNfts: boolean;
  loadMoreNfts: () => void;
}

export function DataTable({
  data,
  ethPrice,
  totalValue,
  selectedCurrency,
  isLoadingMoreNfts,
  isProcessingPrices,
  hasMoreNfts,
  loadMoreNfts,
}: DataTableProps) {
  const [sortConfig, setSortConfig] = useState<{
    key: keyof CollectionData | "portfolioPercentage";
    direction: "ascending" | "descending";
  }>({
    key: "total_value",
    direction: "descending",
  });

  if (!data || !Array.isArray(data)) {
    console.error("DataTable received invalid data:", data);
    return <div>No data available</div>;
  }

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

  if (data.length === 0) {
    return (
      <div className="rounded-md border flex flex-col items-center justify-center min-h-[190px] p-8 text-center">
        <div className="space-y-4">
          <div className="rounded-full bg-muted/50 p-3 w-fit mx-auto">
            <PackageX className="w-8 h-8 text-muted-foreground" />
          </div>
          <div className="space-y-2">
            <p className="text-xl font-semibold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              No NFT collections found
            </p>
            <p className="text-sm text-muted-foreground">
              Try searching for a different wallet address
            </p>
          </div>
        </div>
      </div>
    );
  }

  const sortedData = [...data].sort((a, b) => {
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

    const aValue = a[sortConfig.key as keyof typeof a];
    const bValue = b[sortConfig.key as keyof typeof b];

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

  const requestSort = (key: keyof CollectionData | "portfolioPercentage") => {
    let direction: "ascending" | "descending" = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
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
          {sortedData.map((collection) => (
            <TableRow
              key={collection.collection}
              className="hover:bg-muted/20 transition-colors"
            >
              <TableCell className="w-[40%] py-3 pl-4">
                <div className="flex items-center space-x-3 min-w-0 group">
                  {collection.image_url ? (
                    <div className="relative h-10 w-10 flex-shrink-0 rounded-md overflow-hidden border border-muted transition-all duration-200 group-hover:shadow-md group-hover:scale-105">
                      <Image
                        src={collection.image_url}
                        alt={collection.name}
                        fill
                        sizes="40px"
                        className="object-cover transition-transform duration-300 group-hover:scale-110"
                        unoptimized={collection.image_url.endsWith(".gif")}
                      />
                    </div>
                  ) : (
                    <div className="h-10 w-10 flex-shrink-0 rounded-md bg-gray-200 dark:bg-gray-800 transition-all duration-200 group-hover:shadow-md group-hover:scale-105"></div>
                  )}
                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-1">
                      <a
                        href={`https://opensea.io/collection/${collection.collection}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium truncate max-w-[200px] text-base hover:text-blue-600 transition-colors inline-block"
                      >
                        {collection.name}
                      </a>

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
                    <span className="text-xs text-gray-500 dark:text-gray-400 truncate hover:text-blue-500 transition-colors cursor-pointer">
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
      {hasMoreNfts && (
        <div className="flex justify-center items-center p-4 border-t border-border/40">
          <Button
            variant="outline"
            onClick={loadMoreNfts}
            disabled={isLoadingMoreNfts || isProcessingPrices}
          >
            {isLoadingMoreNfts ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : null}
            Load More NFTs
          </Button>
        </div>
      )}
    </div>
  );
}
