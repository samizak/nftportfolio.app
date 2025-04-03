import { BarChart3, Wallet, TrendingUp, Bell, Shield, Zap } from "lucide-react";

const features = [
  {
    icon: BarChart3,
    title: "Real-time Analytics",
    description:
      "Track floor prices, volume, and value changes with real-time data from multiple marketplaces.",
  },
  {
    icon: Wallet,
    title: "Multi-wallet Support",
    description:
      "Connect multiple wallets across different blockchains to get a complete view of your NFT holdings.",
  },
  {
    icon: Bell,
    title: "Price Alerts",
    description:
      "Set custom alerts for price changes, sales, and other important events in your collection.",
  },
  {
    icon: TrendingUp,
    title: "Performance Tracking",
    description:
      "Measure your portfolio performance over time with detailed charts and historical data.",
  },
  {
    icon: Shield,
    title: "Security First",
    description:
      "View-only wallet connections ensure your assets remain secure while you monitor them.",
  },
  {
    icon: Zap,
    title: "Fast Insights",
    description:
      "Get instant insights on rarity, estimated value, and potential opportunities in the market.",
  },
];

export default function FeaturesSection() {
  return (
    <section
      className="w-full py-12 md:py-24 lg:py-32 bg-muted/50"
      id="features"
    >
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
              Powerful Features
            </div>
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
              Everything You Need to Manage Your NFTs
            </h2>
            <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Our platform provides comprehensive tools to track, analyze, and
              optimize your NFT portfolio across multiple blockchains.
            </p>
          </div>
        </div>
        <div className="mx-auto grid max-w-5xl items-start gap-6 py-12 lg:grid-cols-3">
          {features.map((feature, index) => {
            const Icon = feature.icon; // Assign component to a variable
            return (
              <div
                key={index}
                className="flex flex-col items-center space-y-4 rounded-lg border bg-background p-6 text-center"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
