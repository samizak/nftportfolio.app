"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import PortfolioStats from "@/components/PortfolioStats";
import UserProfile from "@/components/UserProfile";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import TableFilters from "@/components/TableFilters";
import { DataTable } from "@/components/DataTable";
import { containerClass } from "@/lib/utils";
import { PortfolioViewProps } from "@/types/portfolio";
import { useEffect } from "react";
import Footer from "@/components/Footer";
import Header from "@/components/Header";

export default function PortfolioView({
  user,
  data = [],
  ethPrice = 0,
  totalNfts = 0,
  totalValue = 0,
  selectedCurrency = { code: "USD", symbol: "$" },
}: PortfolioViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredData, setFilteredData] = useState(data);

  // Add this effect to update filteredData when data changes
  useEffect(() => {
    setFilteredData(applySearchAndFilters(searchQuery, data));
  }, [data]);
  // Apply both search and filters
  const applySearchAndFilters = (
    searchTerm: string,
    dataToFilter: any[] = data
  ) => {
    if (!searchTerm) return dataToFilter;
    return dataToFilter.filter(
      (item) =>
        item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.collection?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };
  // Handle search input changes
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    setFilteredData(applySearchAndFilters(query));
  };
  // Handle filter application
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
    setFilteredData(applySearchAndFilters(searchQuery, filtered));
  };
  // Add the missing handleClearFilters function
  const handleClearFilters = () => {
    setFilteredData(applySearchAndFilters(searchQuery));
  };

  return (
    <div className="flex flex-col min-h-screen">
      <main className={`${containerClass} p-4 flex-grow pb-20`}>
        <Header user={user} activePage="portfolio" />

        <UserProfile user={user} />

        <PortfolioStats
          data={data}
          ethPrice={ethPrice}
          totalNfts={totalNfts}
          totalValue={totalValue}
          selectedCurrency={selectedCurrency}
        />

        <div className="mt-8 grid grid-cols-1 md:grid-cols-[300px_1fr] gap-6">
          {/* Filters column - fixed width */}
          <div>
            <TableFilters
              onApplyFilters={handleApplyFilters}
              onClearFilters={handleClearFilters}
            />
          </div>

          {/* Main content column - auto width */}
          <div>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Your NFT Collection</CardTitle>
                <div className="w-72">
                  <Input
                    placeholder="Search NFTs..."
                    value={searchQuery}
                    onChange={handleSearchChange}
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
                    ethPrice={ethPrice}
                    totalValue={totalValue}
                    selectedCurrency={selectedCurrency}
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
