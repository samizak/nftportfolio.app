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
import {
  PortfolioSummaryData,
  CollectionBreakdown,
} from "@/hooks/usePortfolioData";

// Define User type based on UserProfile props
interface User {
  name: string;
  ethHandle: string;
  ethAddress: string;
  avatar: string;
  banner: string;
}

interface PortfolioViewProps {
  user: User | null; // Use the User type, allow null
  summary: PortfolioSummaryData | null;
  isLoading: boolean;
  ethPrice?: number;
  selectedCurrency: Currency;
}

export default function PortfolioView({
  user,
  summary,
  isLoading,
  ethPrice,
  selectedCurrency,
}: PortfolioViewProps) {
  const collections: CollectionBreakdown[] = summary?.breakdown || [];
  const totalValue = summary?.totalValueEth ?? 0;
  const lastUpdated = summary?.calculatedAt
    ? new Date(summary.calculatedAt)
    : new Date();

  const [searchQuery, setSearchQuery] = useState("");
  const [filteredData, setFilteredData] =
    useState<CollectionBreakdown[]>(collections);

  const priceForComponents = ethPrice || 0;

  useEffect(() => {
    setFilteredData(collections || []);
  }, [collections]);

  useEffect(() => {
    if (!collections) return;
    if (searchQuery === "") {
      setFilteredData(collections);
    } else {
      setFilteredData(
        collections.filter((item) =>
          item.name?.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    }
  }, [searchQuery, collections]);

  const handleApplyFilters = (field: string, min: string, max: string) => {
    if (!collections) return;
    const minValue = min === "" ? -Infinity : parseFloat(min);
    const maxValue = max === "" ? Infinity : parseFloat(max);

    const filtered = collections.filter((item) => {
      let value: number | undefined;
      switch (field) {
        case "quantity":
          value = item.nftCount;
          break;
        case "floorPrice":
          value = item.floorPriceEth;
          break;
        case "value":
          value = item.totalValueEth;
          break;
        case "portfolioPercentage":
          value = totalValue > 0 ? (item.totalValueEth / totalValue) * 100 : 0;
          break;
        default:
          value = undefined;
      }
      return (
        value !== undefined &&
        value !== null &&
        value >= minValue &&
        value <= maxValue
      );
    });
    setFilteredData(filtered);
  };

  const handleClearFilters = () => {
    setFilteredData(collections || []);
    setSearchQuery("");
  };

  return (
    <div className="flex flex-col min-h-screen">
      <main className={`${containerClass} p-4 flex-grow pb-20`}>
        {user && <Header user={user} activePage="portfolio" />}

        {user && <UserProfile user={user} />}

        <PortfolioStats
          summary={summary}
          ethPrice={priceForComponents}
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
                  <p>Your NFT Collection ({collections?.length ?? 0} found)</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Summary updated: {lastUpdated.toLocaleString()}
                  </p>
                </CardTitle>

                <div className="w-72">
                  <Input
                    placeholder="Search Collections..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </CardHeader>
              <CardContent>
                <DataTable
                  data={filteredData}
                  ethPrice={priceForComponents}
                  totalValue={totalValue}
                  selectedCurrency={selectedCurrency}
                  isLoading={isLoading}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
