import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function PortfolioStats() {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Value</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">Ξ 465.9</div>
          <div className="text-2xl text-muted-foreground">$ 799,089</div>
          <p className="text-xs text-muted-foreground">
            +20.1% from last month
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total NFTs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">2,800</div>
          <p className="text-xs text-muted-foreground">
            Across 300 collections
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Floor Price</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">Ξ 1.82</div>
          <p className="text-xs text-muted-foreground">Average floor price</p>
        </CardContent>
      </Card>
    </div>
  );
}
