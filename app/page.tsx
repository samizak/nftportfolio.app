"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import NFTPortfolioTable from "@/components/NFTPortfolioTable"
import PortfolioStats from "@/components/PortfolioStats"
import UserProfile from "@/components/UserProfile"
import { Input } from "@/components/ui/input"
import { useState } from "react"

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("")
  
  // Mock user data
  const user = {
    name: "Pranksy",
    ethHandle: "pranksy.eth",
    ethAddress: "0x1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0",
    avatar: "https://placehold.co/400"
  }

  return (
    <main className="container mx-auto p-4">
      <h1 className="text-4xl font-bold mb-8">nftportfolio.app</h1>
      
      <UserProfile user={user} />
      
      <PortfolioStats />
      
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
            <NFTPortfolioTable searchQuery={searchQuery} />
          </CardContent>
        </Card>
      </div>
    </main>
  )
}