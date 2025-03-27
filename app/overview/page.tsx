"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import {
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  BarChart3,
  Wallet,
  TrendingUp,
} from "lucide-react";
import { cn, containerClass } from "@/lib/utils";
import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";

// Mock data for the pie chart
const PORTFOLIO_DATA = [
  { name: "Bored Ape Yacht Club", value: 45, color: "#8884d8" },
  { name: "CryptoPunks", value: 20, color: "#82ca9d" },
  { name: "Azuki", value: 15, color: "#ffc658" },
  { name: "Doodles", value: 10, color: "#ff8042" },
  { name: "CloneX", value: 5, color: "#0088fe" },
  { name: "Others", value: 5, color: "#00C49F" },
];

// Mock data for analytics
const ANALYTICS_DATA = {
  totalTrades: 47,
  winRate: 68,
  avgDuration: "34 days",
  profitLoss: 12.4,
  totalVolume: 156.8,
};

export default function OverviewPage({ user }: { user: any }) {
  const [timeframe, setTimeframe] = useState("all");

  return (
    <div className="flex flex-col min-h-screen">
      <Header user={user} activePage="overview" />
      <main className={`pt-20 flex-grow pb-20`}>
        <div className={`${containerClass} p-4 mx-auto`}>
          <div className="container mx-auto px-4 py-6 space-y-8 max-w-7xl">
            <div className="flex flex-col space-y-2">
              <h1 className="text-3xl font-bold tracking-tight">
                Portfolio Overview
              </h1>
              <p className="text-muted-foreground">
                Track your NFT investments, analyze performance, and monitor
                your collection.
              </p>
            </div>

            <Tabs
              defaultValue="all"
              className="w-full"
              onValueChange={setTimeframe}
            >
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Portfolio Value</h2>
                <TabsList>
                  <TabsTrigger value="1d">1D</TabsTrigger>
                  <TabsTrigger value="7d">7D</TabsTrigger>
                  <TabsTrigger value="30d">30D</TabsTrigger>
                  <TabsTrigger value="90d">90D</TabsTrigger>
                  <TabsTrigger value="all">All</TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="all" className="mt-0">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mt-4">
                  {/* Net Worth Card - ETH */}
                  <Card className="overflow-hidden">
                    <CardHeader className="pb-2">
                      <CardDescription>Net Worth</CardDescription>
                      <CardTitle className="text-2xl flex items-center">
                        <Wallet className="mr-2 h-5 w-5 text-primary" />
                        156.8 ETH
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                          ≈ $312,456.00
                        </span>
                        <div className="flex items-center text-emerald-500 text-sm font-medium">
                          <ArrowUpRight className="h-4 w-4 mr-1" />
                          12.4%
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Total Trades Card */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardDescription>Total Trades</CardDescription>
                      <CardTitle className="text-2xl flex items-center">
                        <BarChart3 className="mr-2 h-5 w-5 text-primary" />
                        {ANALYTICS_DATA.totalTrades}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                          Lifetime
                        </span>
                        <div className="flex items-center text-emerald-500 text-sm font-medium">
                          <ArrowUpRight className="h-4 w-4 mr-1" />8 new this
                          month
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Win Rate Card */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardDescription>Win Rate</CardDescription>
                      <CardTitle className="text-2xl flex items-center">
                        <TrendingUp className="mr-2 h-5 w-5 text-primary" />
                        {ANALYTICS_DATA.winRate}%
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                          Based on sales
                        </span>
                        <div className="flex items-center text-emerald-500 text-sm font-medium">
                          <ArrowUpRight className="h-4 w-4 mr-1" />
                          4.2%
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Average Duration Card */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardDescription>Avg Hold Time</CardDescription>
                      <CardTitle className="text-2xl flex items-center">
                        <Clock className="mr-2 h-5 w-5 text-primary" />
                        {ANALYTICS_DATA.avgDuration}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                          Per trade
                        </span>
                        <div className="flex items-center text-rose-500 text-sm font-medium">
                          <ArrowDownRight className="h-4 w-4 mr-1" />3 days
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>

            {/* Portfolio Allocation Section */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mt-8">
              {/* Pie Chart Card */}
              <Card className="col-span-2">
                <CardHeader>
                  <CardTitle>NFT Allocation</CardTitle>
                  <CardDescription>
                    Distribution of your portfolio by collection value (ETH)
                  </CardDescription>
                </CardHeader>
                <CardContent className="pl-2">
                  <div className="h-80 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={PORTFOLIO_DATA}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={120}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }: any) =>
                            `${name} ${(percent * 100).toFixed(0)}%`
                          }
                        >
                          {PORTFOLIO_DATA.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value: any) => [`${value} ETH`, "Value"]}
                        />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Activity Card */}
              <Card className="col-span-1">
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>
                    Your latest NFT transactions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="flex items-center gap-4 pb-4 border-b last:border-0 last:pb-0"
                      >
                        <div className="h-12 w-12 rounded-md bg-secondary/80 flex items-center justify-center">
                          <img
                            src={`https://picsum.photos/seed/${i}/200/200`}
                            alt="NFT"
                            className="h-full w-full object-cover rounded-md"
                          />
                        </div>
                        <div className="flex-1">
                          <div className="font-medium">
                            Bored Ape #{1000 + i}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Purchased • 2 days ago
                          </div>
                        </div>
                        <div
                          className={cn(
                            "text-sm font-medium",
                            i % 2 === 0 ? "text-emerald-500" : "text-rose-500"
                          )}
                        >
                          {i % 2 === 0 ? "+" : "-"}12.5 ETH
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Additional Analytics Section */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mt-8">
              {/* Top Performers Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Top Performers</CardTitle>
                  <CardDescription>Your best performing NFTs</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="flex items-center gap-4 pb-4 border-b last:border-0 last:pb-0"
                      >
                        <div className="h-12 w-12 rounded-md bg-secondary/80 flex items-center justify-center">
                          <img
                            src={`https://picsum.photos/seed/${i + 10}/200/200`}
                            alt="NFT"
                            className="h-full w-full object-cover rounded-md"
                          />
                        </div>
                        <div className="flex-1">
                          <div className="font-medium">
                            CryptoPunk #{2000 + i}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Held for 120 days
                          </div>
                        </div>
                        <div className="text-sm font-medium text-emerald-500">
                          +{45 - i * 10}%
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Worst Performers Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Underperformers</CardTitle>
                  <CardDescription>Your least performing NFTs</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="flex items-center gap-4 pb-4 border-b last:border-0 last:pb-0"
                      >
                        <div className="h-12 w-12 rounded-md bg-secondary/80 flex items-center justify-center">
                          <img
                            src={`https://picsum.photos/seed/${i + 20}/200/200`}
                            alt="NFT"
                            className="h-full w-full object-cover rounded-md"
                          />
                        </div>
                        <div className="flex-1">
                          <div className="font-medium">Doodle #{3000 + i}</div>
                          <div className="text-sm text-muted-foreground">
                            Held for 45 days
                          </div>
                        </div>
                        <div className="text-sm font-medium text-rose-500">
                          -{i * 8}%
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Monthly Performance Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Monthly Performance</CardTitle>
                  <CardDescription>
                    Your portfolio growth over time
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {["January", "February", "March"].map((month, i) => (
                      <div
                        key={month}
                        className="flex items-center justify-between pb-4 border-b last:border-0 last:pb-0"
                      >
                        <div className="font-medium">{month}</div>
                        <div className="flex items-center gap-2">
                          <div
                            className={cn(
                              "text-sm font-medium",
                              i === 0
                                ? "text-emerald-500"
                                : i === 1
                                ? "text-rose-500"
                                : "text-emerald-500"
                            )}
                          >
                            {i === 0 ? "+" : i === 1 ? "-" : "+"}
                            {i === 0 ? "12.4" : i === 1 ? "5.2" : "8.7"}%
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {i === 0 ? "+18.6" : i === 1 ? "-8.3" : "+14.2"} ETH
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>{" "}
        </div>
      </main>
      <Footer />
    </div>
  );
}
