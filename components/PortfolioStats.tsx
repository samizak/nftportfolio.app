import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useMemo } from "react";

interface PortfolioStatsProps {
  data?: any[];
  ethPrice?: number;
  totalNfts?: number;
  totalValue?: number;
}

export default function PortfolioStats({ data = [], ethPrice = 0, totalNfts = 0, totalValue = 0 }: PortfolioStatsProps) {
  const stats = useMemo(() => {
    if (!data || data.length === 0) {
      return {
        totalCollections: 0,
        averageFloorPrice: 0
      };
    }

    const totalCollections = data.length;
    const validFloorPrices = data.filter(item => item.floor_price && item.floor_price > 0);
    const averageFloorPrice = validFloorPrices.length > 0 
      ? validFloorPrices.reduce((sum, item) => sum + item.floor_price, 0) / validFloorPrices.length
      : 0;

    return {
      totalCollections,
      averageFloorPrice
    };
  }, [data]);

  // Format dollar value with commas
  const formatDollarValue = (value: number) => {
    return new Intl.NumberFormat('en-US').format(Math.round(value));
  };

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Value</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">Ξ {totalValue.toFixed(2)}</div>
          <div className="text-2xl text-muted-foreground">$ {formatDollarValue(totalValue * ethPrice)}</div>
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
          <div className="text-2xl font-bold">{totalNfts}</div>
          <p className="text-xs text-muted-foreground">
            Across {stats.totalCollections} collections
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Floor Price</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">Ξ {stats.averageFloorPrice.toFixed(2)}</div>
          <p className="text-xs text-muted-foreground">Average floor price</p>
        </CardContent>
      </Card>
    </div>
  );
}
