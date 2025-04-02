"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDollarValue, formatThousandSeparator } from "@/utils/formatters";
import {
  PortfolioSummaryData,
  CollectionBreakdown,
} from "@/hooks/usePortfolioData";
import { useState, useEffect } from "react";
import Image from "next/image";

interface PortfolioStatsProps {
  summary: PortfolioSummaryData | null;
  ethPrice?: number;
  selectedCurrency?: {
    code: string;
    symbol: string;
  };
}

export default function PortfolioStats({
  summary,
  ethPrice = 0,
  selectedCurrency = { code: "USD", symbol: "$" },
}: PortfolioStatsProps) {
  const [topCollection, setTopCollection] =
    useState<CollectionBreakdown | null>(null);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    if (summary?.breakdown && summary.breakdown.length > 0) {
      const top = summary.breakdown.reduce((max, current) => {
        return (current.totalValueEth || 0) > (max.totalValueEth || 0)
          ? current
          : max;
      }, summary.breakdown[0]);
      setTopCollection(top);
      setImageError(false);
    } else {
      setTopCollection(null);
    }
  }, [summary]);

  const totalValueEth = summary?.totalValueEth ?? 0;
  const totalValueUsd = summary?.totalValueUsd ?? totalValueEth * ethPrice;
  const nftCount = summary?.nftCount ?? 0;
  const collectionCount = summary?.collectionCount ?? 0;

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Value</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            Ξ {formatThousandSeparator(+totalValueEth.toFixed(2))}
          </div>
          <div className="text-lg text-muted-foreground">
            {selectedCurrency.symbol} {formatDollarValue(totalValueUsd)}
          </div>
          <p className="text-xs text-muted-foreground">
            Based on calculated summary
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total NFTs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatThousandSeparator(nftCount)}
          </div>
          <p className="text-xs text-muted-foreground">
            Across {formatThousandSeparator(collectionCount)} collections
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Biggest Holding</CardTitle>
        </CardHeader>
        <CardContent className="pt-2">
          {topCollection ? (
            <div className="flex flex-row items-center gap-4">
              <div className="relative h-16 w-16 flex-shrink-0 rounded-full overflow-hidden border border-border">
                {topCollection.imageUrl && !imageError ? (
                  <Image
                    src={topCollection.imageUrl}
                    alt={topCollection.name}
                    fill
                    sizes="64px"
                    className="object-cover"
                    onError={() => setImageError(true)}
                    unoptimized={topCollection.imageUrl?.endsWith(".gif")}
                  />
                ) : (
                  <div className="h-full w-full bg-muted flex items-center justify-center text-muted-foreground text-xl">
                    ?
                  </div>
                )}
              </div>
              <div className="flex flex-col items-start min-w-0">
                <a
                  href={`https://opensea.io/collection/${topCollection.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xl font-bold hover:text-primary transition-colors break-words"
                  title={topCollection.name}
                >
                  {topCollection.name}
                </a>
                <div className="text-xl font-bold">
                  Ξ{" "}
                  {formatThousandSeparator(
                    +(topCollection.totalValueEth || 0).toFixed(2)
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  {formatThousandSeparator(topCollection.nftCount || 0)} items
                </p>
              </div>
            </div>
          ) : (
            <div className="text-sm text-muted-foreground pt-2">
              No collection data available.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
