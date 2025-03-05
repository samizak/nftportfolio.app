"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import NFTPortfolioTable from "@/components/NFTPortfolioTable";
import PortfolioStats from "@/components/PortfolioStats";
import UserProfile from "@/components/UserProfile";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import TableFilters from "@/components/TableFilters";
import { DataTable } from "@/components/DataTable";

interface PortfolioViewProps {
  user: {
    name: string;
    ethHandle: string;
    ethAddress: string;
    avatar: string;
    banner: string;
  };
  data?: any[];
  ethPrice?: number;
  totalNfts?: number;
  totalValue?: number;
  selectedCurrency?: { code: string; symbol: string };
}

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

  // Apply both search and filters
  const applySearchAndFilters = (
    searchTerm: string,
    dataToFilter: any[] = data
  ) => {
    if (!searchTerm) return dataToFilter;
    
    return dataToFilter.filter((item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.collection.toLowerCase().includes(searchTerm.toLowerCase())
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

    const filtered = data.filter((item) => {
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

  // Clear all filters
  const handleClearFilters = () => {
    setFilteredData(applySearchAndFilters(searchQuery));
  };

  return (
    <main className="container mx-auto p-4">
      <div className="mb-8">
        <h1 className="text-4xl font-bold">nftportfolio.app</h1>
      </div>

      <UserProfile user={user} />

      <PortfolioStats
        data={data}
        ethPrice={ethPrice}
        totalNfts={totalNfts}
        totalValue={totalValue}
        selectedCurrency={selectedCurrency}
      />

      <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Filters column */}
        <div className="md:col-span-1">
          <TableFilters 
            onApplyFilters={handleApplyFilters}
            onClearFilters={handleClearFilters}
          />
        </div>

        {/* Main content column */}
        <div className="md:col-span-3">
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
              <DataTable
                data={filteredData}
                ethPrice={ethPrice}
                totalValue={totalValue}
                selectedCurrency={selectedCurrency}
              />
            </CardContent>
          </Card>
        </div>
      </div>

      <footer className="mt-8 text-center text-sm text-muted-foreground">
        Made by Sami Zakir Ahmed
      </footer>
    </main>
  );
}
