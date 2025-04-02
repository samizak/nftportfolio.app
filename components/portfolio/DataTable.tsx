"use client";

import React, { useState, useMemo } from "react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import Image from "next/image";
import { Loader2, PackageX, BadgeCheck } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { CollectionBreakdown } from "@/hooks/usePortfolioData";
import { formatThousandSeparator } from "@/utils/formatters";

interface DataTableProps {
  data: CollectionBreakdown[];
  ethPrice: number;
  totalValue: number;
  selectedCurrency: {
    code: string;
    symbol: string;
  };
  isLoading: boolean;
}

type CollectionSortKey =
  | keyof CollectionBreakdown
  | "portfolioPercentage"
  | "name"
  | "value"
  | "floorPriceEth";

export function DataTable({
  data,
  ethPrice,
  totalValue,
  selectedCurrency,
  isLoading,
}: DataTableProps) {
  const [sortConfig, setSortConfig] = useState<{
    key: CollectionSortKey;
    direction: "ascending" | "descending";
  }>({
    key: "totalValueEth",
    direction: "descending",
  });

  const sortedData = useMemo(() => {
    if (!data) return [];
    return [...data].sort((a, b) => {
      if (!a || !b) return 0;

      let aValue: number | string | undefined;
      let bValue: number | string | undefined;
      const key = sortConfig.key;

      if (key === "portfolioPercentage") {
        aValue =
          totalValue > 0 ? ((a.totalValueEth || 0) / totalValue) * 100 : 0;
        bValue =
          totalValue > 0 ? ((b.totalValueEth || 0) / totalValue) * 100 : 0;
      } else if (key === "name") {
        aValue = a.name?.toLowerCase() || "";
        bValue = b.name?.toLowerCase() || "";
      } else if (key === "value") {
        aValue = a.totalValueEth || 0;
        bValue = b.totalValueEth || 0;
      } else if (key === "floorPriceEth") {
        aValue = a.floorPriceEth || 0;
        bValue = b.floorPriceEth || 0;
      } else {
        aValue = a[key as keyof CollectionBreakdown];
        bValue = b[key as keyof CollectionBreakdown];
      }

      if (aValue === undefined || aValue === null) return 1;
      if (bValue === undefined || bValue === null) return -1;

      if (typeof aValue === "string" && typeof bValue === "string") {
        return sortConfig.direction === "ascending"
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      } else if (typeof aValue === "number" && typeof bValue === "number") {
        return sortConfig.direction === "ascending"
          ? aValue - bValue
          : bValue - aValue;
      } else {
        const aStr = String(aValue).toLowerCase();
        const bStr = String(bValue).toLowerCase();
        return sortConfig.direction === "ascending"
          ? aStr.localeCompare(bStr)
          : bStr.localeCompare(aStr);
      }
    });
  }, [data, sortConfig, totalValue]);

  if (isLoading) {
    return (
      <div className="rounded-md border flex items-center justify-center min-h-[190px] p-8 text-center">
        <div className="space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <p className="text-muted-foreground">Loading collections...</p>
        </div>
      </div>
    );
  }

  if (!data || !Array.isArray(data)) {
    console.error("DataTable received invalid data:", data);
    return (
      <div className="rounded-md border p-8 text-center text-destructive">
        Invalid data received.
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
              No Collections Found
            </p>
            <p className="text-sm text-muted-foreground">
              This portfolio doesn&apos;t seem to hold NFTs in any collections.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const requestSort = (key: CollectionSortKey) => {
    let direction: "ascending" | "descending" = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  const getSortIndicator = (key: CollectionSortKey) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === "ascending" ? " \u2191" : " \u2193";
  };

  console.log(data);
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow className="border-b border-border/40 bg-muted/30 hover:bg-muted/50 transition-colors">
            <TableHead
              className="w-[40%] cursor-pointer py-3.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1 pl-4 h-full my-auto"
              onClick={() => requestSort("name")}
            >
              Collection
              {getSortIndicator("name") && (
                <span className="text-primary">{getSortIndicator("name")}</span>
              )}
            </TableHead>
            <TableHead
              className="w-[12%] text-right cursor-pointer py-3.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors my-auto"
              onClick={() => requestSort("nftCount")}
            >
              Quantity
              {getSortIndicator("nftCount") && (
                <span className="text-primary">
                  {getSortIndicator("nftCount")}
                </span>
              )}
            </TableHead>
            <TableHead
              className="w-[16%] text-right cursor-pointer py-3.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors my-auto"
              onClick={() => requestSort("floorPriceEth")}
            >
              Floor Price
              {getSortIndicator("floorPriceEth") && (
                <span className="text-primary">
                  {getSortIndicator("floorPriceEth")}
                </span>
              )}
            </TableHead>
            <TableHead
              className="w-[16%] text-right cursor-pointer py-3.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors my-auto"
              onClick={() => requestSort("value")}
            >
              Value
              {getSortIndicator("value") && (
                <span className="text-primary">
                  {getSortIndicator("value")}
                </span>
              )}
            </TableHead>
            <TableHead
              className="w-[16%] text-right cursor-pointer py-3.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors my-auto pr-4"
              onClick={() => requestSort("portfolioPercentage")}
            >
              Portfolio %
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
              key={collection.slug}
              className="hover:bg-muted/20 transition-colors"
            >
              <TableCell className="w-[40%] py-3 pl-4">
                <div className="flex items-center space-x-3 min-w-0 group">
                  {collection.imageUrl ? (
                    <div className="relative h-10 w-10 flex-shrink-0 rounded-md overflow-hidden border border-muted transition-all duration-200 group-hover:shadow-md group-hover:scale-105">
                      <Image
                        src={collection.imageUrl}
                        alt={collection.name || "Collection"}
                        fill
                        sizes="40px"
                        className="object-cover transition-transform duration-300 group-hover:scale-110"
                        unoptimized={collection.imageUrl.endsWith(".gif")}
                      />
                    </div>
                  ) : (
                    <div className="h-10 w-10 flex-shrink-0 rounded-md bg-gray-200 dark:bg-gray-800 transition-all duration-200 group-hover:shadow-md group-hover:scale-105"></div>
                  )}
                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-1.5">
                      <a
                        href={`https://opensea.io/collection/${collection.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-semibold text-base hover:text-blue-600 transition-colors inline-block break-words truncate"
                        title={collection.name}
                      >
                        {collection.name}
                      </a>
                      {collection.safelistStatus === "verified" && (
                        <TooltipProvider delayDuration={100}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <BadgeCheck className="h-5 w-5 text-blue-500 flex-shrink-0 cursor-help" />
                            </TooltipTrigger>
                            <TooltipContent
                              sideOffset={4}
                              className="bg-popover/95 px-4 py-3 text-xs rounded-md shadow-sm"
                            >
                              <div className="flex items-center gap-1.5 text-popover-foreground">
                                <BadgeCheck className="h-3.5 w-3.5" />
                                <span>Verified Collection</span>
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                    </div>
                    <span
                      className="text-xs text-muted-foreground truncate"
                      title={collection.slug}
                    >
                      {collection.slug}
                    </span>
                  </div>
                </div>
              </TableCell>
              <TableCell className="w-[12%] text-right py-3 align-middle">
                <Badge variant="outline">{collection.nftCount}</Badge>
              </TableCell>
              <TableCell className="w-[16%] text-right py-3 align-middle">
                <div className="space-y-1 font-mono text-sm">
                  <div>
                    {collection.floorPriceEth != null ? (
                      `${collection.floorPriceEth.toFixed(4)} ETH`
                    ) : (
                      <span className="text-muted-foreground">--</span>
                    )}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {collection.floorPriceEth != null && ethPrice > 0
                      ? formatCurrency(
                          collection.floorPriceEth * ethPrice,
                          selectedCurrency.code,
                          selectedCurrency.symbol
                        )
                      : ""}
                  </div>
                </div>
              </TableCell>
              <TableCell className="w-[16%] text-right py-3 align-middle">
                <div className="space-y-1 font-mono text-sm">
                  <div>
                    {collection.totalValueEth != null ? (
                      `${formatThousandSeparator(
                        +collection.totalValueEth.toFixed(3)
                      )} ETH`
                    ) : (
                      <span className="text-muted-foreground">--</span>
                    )}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {collection.totalValueUsd != null
                      ? formatCurrency(
                          collection.totalValueUsd,
                          selectedCurrency.code,
                          selectedCurrency.symbol
                        )
                      : collection.totalValueEth != null && ethPrice > 0
                      ? formatCurrency(
                          collection.totalValueEth * ethPrice,
                          selectedCurrency.code,
                          selectedCurrency.symbol
                        )
                      : ""}
                  </div>
                </div>
              </TableCell>
              <TableCell className="w-[16%] text-right py-3 pr-4 align-middle font-mono text-sm">
                {totalValue > 0 && collection.totalValueEth > 0 ? (
                  `${((collection.totalValueEth / totalValue) * 100).toFixed(
                    2
                  )}%`
                ) : (
                  <span className="text-muted-foreground">--</span>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
