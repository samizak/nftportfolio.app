"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";
import Image from "next/image";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { formatDollarValue, formatThousandSeparator } from "@/utils/formatters";
import { CollectionData } from "@/types/nft";
import { PortfolioStatsProps } from "@/types/portfolio";

export default function PortfolioStats({
  data = [],
  ethPrice = 0,
  totalNfts = 0,
  totalValue = 0,
  selectedCurrency = { code: "USD", symbol: "$" },
}: PortfolioStatsProps) {
  const [biggestHolding, setBiggestHolding] = useState<CollectionData>();

  useEffect(() => {
    if (!Array.isArray(data) || data.length === 0) {
      setBiggestHolding(undefined);
      return;
    }

    const biggest = data.reduce((max, current) => {
      const currentValue = (current.quantity || 0) * (current.floor_price || 0);
      const maxValue = (max.quantity || 0) * (max.floor_price || 0);
      return currentValue > maxValue ? current : max;
    }, data[0]);

    // console.log(biggest);

    setBiggestHolding(biggest);
  }, [data, totalValue]);

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Value</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            Ξ {formatThousandSeparator(+totalValue.toFixed(2))}
          </div>
          <div className="text-lg text-muted-foreground">
            {selectedCurrency.symbol} {formatDollarValue(totalValue * ethPrice)}
          </div>
          <p className="text-xs text-muted-foreground">
            Based on current floor prices
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total NFTs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatThousandSeparator(totalNfts)}
          </div>
          <p className="text-xs text-muted-foreground">
            Across {formatThousandSeparator(data.length)} collections
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Biggest Holding</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1">
          <div className="flex items-center gap-2">
            {biggestHolding?.image_url && (
              <img
                src={biggestHolding.image_url}
                alt={biggestHolding.name || "Collection"}
                className="h-16 w-16 rounded-full"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    "https://placehold.co/100?text=NFT";
                }}
              />
            )}
            <div>
              <div className="flex items-center gap-2">
                <div className="text-2xl font-bold">
                  {biggestHolding?.name || "N/A"}
                </div>
                {biggestHolding?.is_verified && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <Image
                          className="inline-block cursor-pointer"
                          src="/verified_checkmark.svg"
                          alt="verified"
                          width={18}
                          height={18}
                        />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>This collection is verified</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>
              <div className="text-lg font-bold">
                Ξ{" "}
                {formatThousandSeparator(
                  +(
                    (biggestHolding?.quantity || 0) *
                    (biggestHolding?.floor_price || 0)
                  ).toFixed(2)
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                {formatThousandSeparator(biggestHolding?.quantity || 0)} items
                at Ξ {biggestHolding?.floor_price?.toFixed(4) || "0.0000"} floor
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
