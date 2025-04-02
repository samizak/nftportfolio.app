"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import PortfolioStats from "@/components/portfolio/PortfolioStats";
import UserProfile from "@/components/UserProfile";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import TableFilters from "@/components/TableFilters";
import { DataTable } from "@/components/portfolio/DataTable";
import { containerClass } from "@/lib/utils";
import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";
import { Currency } from "@/context/CurrencyContext";
import { CollectionData } from "@/types/nft";

interface PortfolioViewProps {
  user: any;
  data: CollectionData[];
  ethPrice?: number;
  totalNfts: number;
  totalValue: number;
  selectedCurrency: Currency;
  isLoadingMoreNfts: boolean;
  isProcessingPrices: boolean;
  hasMoreNfts: boolean;
  loadMoreNfts: () => void;
}

export default function PortfolioView({
  user,
  data,
  ethPrice,
  totalNfts,
  totalValue,
  selectedCurrency,
  isLoadingMoreNfts,
  isProcessingPrices,
  hasMoreNfts,
  loadMoreNfts,
}: PortfolioViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredData, setFilteredData] = useState<CollectionData[]>(data);

  const priceForComponents = ethPrice || 0;

  useEffect(() => {
    if (searchQuery === "") {
      setFilteredData(data);
    } else {
      setFilteredData(
        data.filter((item) =>
          item.name?.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    }
  }, [searchQuery, data]);

  const handleApplyFilters = (field: string, min: string, max: string) => {
    const minValue = min === "" ? -Infinity : parseFloat(min);
    const maxValue = max === "" ? Infinity : parseFloat(max);
    const filtered = data.filter((item: any) => {
      let value;
      switch (field) {
        case "quantity":
          value = item.quantity;
          break;
        case "floorPrice":
          value = item.floor_price;
          break;
        case "value":
          value = item.total_value;
          break;
        case "portfolioPercentage":
          value = (item.total_value / totalValue) * 100;
          break;
        default:
          value = 0;
      }
      return value >= minValue && value <= maxValue;
    });
    setFilteredData(
      data.filter((item) => filtered.some((f) => f.name === item.name))
    );
  };

  const handleClearFilters = () => {
    setFilteredData(data);
  };

  const [timeframe, setTimeframe] = useState("all");
  const [lastUpdated, setLastUpdated] = useState(new Date());

  return (
    <div className="flex flex-col min-h-screen">
      <main className={`${containerClass} p-4 flex-grow pb-20`}>
        <Header user={user} activePage="portfolio" />

        <UserProfile user={user} />

        <PortfolioStats
          data={data}
          ethPrice={priceForComponents}
          totalNfts={totalNfts}
          totalValue={totalValue}
          selectedCurrency={selectedCurrency}
        />

        <div className="mt-8 grid grid-cols-1 md:grid-cols-[300px_1fr] gap-6">
          <div>
            <TableFilters
              onApplyFilters={handleApplyFilters}
              onClearFilters={handleClearFilters}
            />
          </div>

          <div>
            <Card className="h-full">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex flex-col space-y-2">
                  <p>Your NFT Collection</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Last updated: {lastUpdated.toLocaleString()}
                  </p>
                </CardTitle>

                <div className="w-72">
                  <Input
                    placeholder="Search NFTs..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setFilteredData(
                        data.filter((item) =>
                          item.name
                            ?.toLowerCase()
                            .includes(e.target.value.toLowerCase())
                        )
                      );
                    }}
                  />
                </div>
              </CardHeader>
              <CardContent>
                {filteredData.length === 0 && data.length > 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <p className="text-muted-foreground mb-2">
                      No collections found with the current filters
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Try adjusting your search term or filter criteria
                    </p>
                  </div>
                ) : (
                  <DataTable
                    data={filteredData}
                    ethPrice={priceForComponents}
                    totalValue={totalValue}
                    selectedCurrency={selectedCurrency}
                    isLoadingMoreNfts={isLoadingMoreNfts}
                    isProcessingPrices={isProcessingPrices}
                    hasMoreNfts={hasMoreNfts}
                    loadMoreNfts={loadMoreNfts}
                  />
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
