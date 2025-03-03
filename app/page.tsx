import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import NFTPortfolioTable from "@/components/NFTPortfolioTable"
import PortfolioStats from "@/components/PortfolioStats"

export default function Home() {
  return (
    <main className="container mx-auto p-4">
      <h1 className="text-4xl font-bold mb-8">NFT Portfolio Tracker</h1>
      
      <PortfolioStats />
      
      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Your NFT Collection</CardTitle>
          </CardHeader>
          <CardContent>
            <NFTPortfolioTable />
          </CardContent>
        </Card>
      </div>
    </main>
  )
}