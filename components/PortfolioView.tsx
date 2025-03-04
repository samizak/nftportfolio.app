"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import NFTPortfolioTable from "@/components/NFTPortfolioTable";
import PortfolioStats from "@/components/PortfolioStats";
import UserProfile from "@/components/UserProfile";
import { Input } from "@/components/ui/input";
import { useState } from "react";

interface PortfolioViewProps {
  user: {
    name: string;
    ethHandle: string;
    ethAddress: string;
    avatar: string;
  };
  data?: any[];
  ethPrice?: number;
  totalNfts?: number;
  totalValue?: number;
}

export default function PortfolioView({
  user,
  data = [],
  ethPrice = 0,
  totalNfts = 0,
  totalValue = 0,
}: PortfolioViewProps) {
  const [searchQuery, setSearchQuery] = useState("");

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
      />

      <div className="mt-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Your NFT Collection</CardTitle>
            <div className="w-72">
              <Input
                placeholder="Search NFTs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </CardHeader>
          <CardContent>
            <NFTPortfolioTable
              searchQuery={searchQuery}
              data={data}
              totalValue={totalValue}
            />
          </CardContent>
        </Card>
      </div>

      <footer className="mt-8 text-center text-sm text-muted-foreground">
        Made by Sami Zakir Ahmed
      </footer>
    </main>
  );
}
