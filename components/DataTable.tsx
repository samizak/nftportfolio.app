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
import { CheckCircle2 } from "lucide-react";
import Image from "next/image";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface CollectionData {
  collection: string;
  name: string;
  quantity: number;
  image_url: string;
  is_verified: boolean;
  floor_price?: number;
  total_value?: number;
}

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
  const [sortConfig, setSortConfig] = useState<{
    key: keyof CollectionData | "portfolioPercentage";
    direction: "ascending" | "descending";
  }>({
    key: "total_value",
    direction: "descending",
  });

  const sortedData = [...data].sort((a, b) => {
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
          <TableRow>
            <TableHead
              className="w-[250px] cursor-pointer"
              onClick={() => requestSort("name")}
            >
              Collection {getSortIndicator("name")}
            </TableHead>
            <TableHead
              className="text-right cursor-pointer"
              onClick={() => requestSort("quantity")}
            >
              Quantity {getSortIndicator("quantity")}
            </TableHead>
            <TableHead
              className="text-right cursor-pointer"
              onClick={() => requestSort("floor_price")}
            >
              Floor Price {getSortIndicator("floor_price")}
            </TableHead>
            <TableHead
              className="text-right cursor-pointer"
              onClick={() => requestSort("total_value")}
            >
              Value {getSortIndicator("total_value")}
            </TableHead>
            <TableHead
              className="text-right cursor-pointer"
              onClick={() => requestSort("portfolioPercentage")}
            >
              Portfolio % {getSortIndicator("portfolioPercentage")}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedData.map((collection) => (
            <TableRow key={collection.collection}>
              <TableCell className="font-medium">
                <div className="flex items-center space-x-3">
                  {collection.image_url ? (
                    <div className="relative h-10 w-10 rounded-md overflow-hidden">
                      <Image
                        src={collection.image_url}
                        alt={collection.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="h-10 w-10 rounded-md bg-gray-200 dark:bg-gray-800"></div>
                  )}
                  <div className="flex flex-col">
                    <div className="flex items-center">
                      <span className="font-medium">{collection.name}</span>
                      {collection.is_verified && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              <Image
                                className="inline-block cursor-pointer ml-1"
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
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {collection.collection}
                    </span>
                  </div>
                </div>
              </TableCell>
              <TableCell className="text-right">
                <Badge variant="outline">{collection.quantity}</Badge>
              </TableCell>
              <TableCell className="text-right">
                {collection.floor_price
                  ? `${collection.floor_price.toFixed(3)} ETH`
                  : "N/A"}
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {collection.floor_price
                    ? formatCurrency(
                        collection.floor_price * ethPrice,
                        selectedCurrency.code,
                        selectedCurrency.symbol
                      )
                    : ""}
                </div>
              </TableCell>
              <TableCell className="text-right">
                {collection.total_value
                  ? `${collection.total_value.toFixed(3)} ETH`
                  : "N/A"}
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {collection.total_value
                    ? formatCurrency(
                        collection.total_value * ethPrice,
                        selectedCurrency.code,
                        selectedCurrency.symbol
                      )
                    : ""}
                </div>
              </TableCell>
              <TableCell className="text-right">
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
    </div>
  );
}
