import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  BarChart3,
  Wallet,
  TrendingUp,
  Bell,
  Shield,
  Zap,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Wallet className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">nftportfolio.app</span>
          </div>
          <nav className="hidden md:flex gap-6">
            <Link
              href="#features"
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              Features
            </Link>
            <Link
              href="#how-it-works"
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              How It Works
            </Link>
            <Link
              href="#pricing"
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              Pricing
            </Link>
            <Link
              href="#faq"
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              FAQ
            </Link>
          </nav>
          <div className="flex items-center gap-4">
            <Link
              href="#"
              className="text-sm font-medium hover:underline underline-offset-4"
            >
              Sign In
            </Link>
            <Button>Get Started</Button>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48">
          <div className="container mx-auto px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                    Track Your NFT Portfolio in One Place
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    Monitor, analyze, and optimize your NFT investments across
                    multiple blockchains with real-time data and powerful
                    analytics.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Button size="lg">
                    Start Tracking Free
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                  <Button size="lg" variant="outline">
                    View Demo
                  </Button>
                </div>
                <div className="flex items-center space-x-4 text-sm">
                  <div className="flex items-center space-x-1">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    <span>No credit card required</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    <span>Track up to 100 NFTs free</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-center">
                <div className="relative w-full max-w-[500px] aspect-square overflow-hidden rounded-xl border bg-gradient-to-br from-muted/50 to-muted p-2">
                  <Image
                    src="/placeholder.svg?height=600&width=600"
                    width={600}
                    height={600}
                    alt="NFT Portfolio Dashboard Preview"
                    className="rounded-lg object-cover"
                  />
                  <div className="absolute bottom-4 left-4 right-4 rounded-lg bg-background/80 backdrop-blur-sm p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">Portfolio Value</p>
                        <p className="text-2xl font-bold">$128,459.32</p>
                      </div>
                      <div className="flex items-center text-emerald-500">
                        <TrendingUp className="mr-1 h-4 w-4" />
                        <span className="text-sm font-medium">+12.4%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

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
                  Our platform provides comprehensive tools to track, analyze,
                  and optimize your NFT portfolio across multiple blockchains.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-3">
              <div className="flex flex-col items-center space-y-4 rounded-lg border p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <BarChart3 className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold">Real-time Analytics</h3>
                <p className="text-center text-muted-foreground">
                  Track floor prices, volume, and value changes with real-time
                  data from multiple marketplaces.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-4 rounded-lg border p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <Wallet className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold">Multi-wallet Support</h3>
                <p className="text-center text-muted-foreground">
                  Connect multiple wallets across different blockchains to get a
                  complete view of your NFT holdings.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-4 rounded-lg border p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <Bell className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold">Price Alerts</h3>
                <p className="text-center text-muted-foreground">
                  Set custom alerts for price changes, sales, and other
                  important events in your collection.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-4 rounded-lg border p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <TrendingUp className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold">Performance Tracking</h3>
                <p className="text-center text-muted-foreground">
                  Measure your portfolio performance over time with detailed
                  charts and historical data.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-4 rounded-lg border p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold">Security First</h3>
                <p className="text-center text-muted-foreground">
                  View-only wallet connections ensure your assets remain secure
                  while you monitor them.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-4 rounded-lg border p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <Zap className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold">Fast Insights</h3>
                <p className="text-center text-muted-foreground">
                  Get instant insights on rarity, estimated value, and potential
                  opportunities in the market.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="w-full py-12 md:py-24 lg:py-32" id="how-it-works">
          <div className="container mx-auto px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                  How nftportfolio.app Works
                </h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Get started in minutes and gain valuable insights into your
                  NFT investments.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-3">
              <div className="flex flex-col items-center space-y-4 rounded-lg p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <span className="text-xl font-bold">1</span>
                </div>
                <h3 className="text-xl font-bold">Connect Your Wallet</h3>
                <p className="text-center text-muted-foreground">
                  Securely connect your wallets with view-only access. We
                  support Ethereum, Solana, Polygon, and more.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-4 rounded-lg p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <span className="text-xl font-bold">2</span>
                </div>
                <h3 className="text-xl font-bold">Sync Your NFTs</h3>
                <p className="text-center text-muted-foreground">
                  We automatically detect and import all your NFTs across
                  connected wallets and blockchains.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-4 rounded-lg p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <span className="text-xl font-bold">3</span>
                </div>
                <h3 className="text-xl font-bold">Track & Analyze</h3>
                <p className="text-center text-muted-foreground">
                  Get real-time data, analytics, and insights to make informed
                  decisions about your NFT portfolio.
                </p>
              </div>
            </div>
            <div className="flex justify-center">
              <div className="relative w-full max-w-4xl overflow-hidden rounded-xl border">
                <Image
                  src="/placeholder.svg?height=800&width=1600"
                  width={1600}
                  height={800}
                  alt="NFT Portfolio Dashboard"
                  className="w-full object-cover"
                />
              </div>
            </div>
          </div>
        </section>

        <section
          className="w-full py-12 md:py-24 lg:py-32 bg-muted/50"
          id="pricing"
        >
          <div className="container mx-auto px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                  Simple, Transparent Pricing
                </h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Choose the plan that's right for your NFT portfolio size and
                  needs.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl gap-6 py-12 lg:grid-cols-3">
              <div className="flex flex-col rounded-lg border bg-background p-6">
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold">Free</h3>
                  <p className="text-muted-foreground">
                    Perfect for beginners exploring NFTs
                  </p>
                </div>
                <div className="mt-4 flex items-baseline text-3xl font-bold">
                  $0
                  <span className="ml-1 text-base font-medium text-muted-foreground">
                    /month
                  </span>
                </div>
                <ul className="mt-6 space-y-3">
                  <li className="flex items-center">
                    <CheckCircle2 className="mr-2 h-4 w-4 text-primary" />
                    <span>Track up to 100 NFTs</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle2 className="mr-2 h-4 w-4 text-primary" />
                    <span>Basic analytics</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle2 className="mr-2 h-4 w-4 text-primary" />
                    <span>Connect 2 wallets</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle2 className="mr-2 h-4 w-4 text-primary" />
                    <span>Daily price updates</span>
                  </li>
                </ul>
                <Button className="mt-8" variant="outline">
                  Get Started
                </Button>
              </div>
              <div className="flex flex-col rounded-lg border bg-background p-6 shadow-lg ring-2 ring-primary">
                <div className="space-y-2">
                  <div className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                    Most Popular
                  </div>
                  <h3 className="text-2xl font-bold">Pro</h3>
                  <p className="text-muted-foreground">
                    For serious collectors and investors
                  </p>
                </div>
                <div className="mt-4 flex items-baseline text-3xl font-bold">
                  $19
                  <span className="ml-1 text-base font-medium text-muted-foreground">
                    /month
                  </span>
                </div>
                <ul className="mt-6 space-y-3">
                  <li className="flex items-center">
                    <CheckCircle2 className="mr-2 h-4 w-4 text-primary" />
                    <span>Unlimited NFTs</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle2 className="mr-2 h-4 w-4 text-primary" />
                    <span>Advanced analytics</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle2 className="mr-2 h-4 w-4 text-primary" />
                    <span>Connect 5 wallets</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle2 className="mr-2 h-4 w-4 text-primary" />
                    <span>Real-time price updates</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle2 className="mr-2 h-4 w-4 text-primary" />
                    <span>Price alerts</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle2 className="mr-2 h-4 w-4 text-primary" />
                    <span>Portfolio performance reports</span>
                  </li>
                </ul>
                <Button className="mt-8">Get Started</Button>
              </div>
              <div className="flex flex-col rounded-lg border bg-background p-6">
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold">Enterprise</h3>
                  <p className="text-muted-foreground">
                    For professional traders and funds
                  </p>
                </div>
                <div className="mt-4 flex items-baseline text-3xl font-bold">
                  $49
                  <span className="ml-1 text-base font-medium text-muted-foreground">
                    /month
                  </span>
                </div>
                <ul className="mt-6 space-y-3">
                  <li className="flex items-center">
                    <CheckCircle2 className="mr-2 h-4 w-4 text-primary" />
                    <span>Everything in Pro</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle2 className="mr-2 h-4 w-4 text-primary" />
                    <span>Unlimited wallets</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle2 className="mr-2 h-4 w-4 text-primary" />
                    <span>API access</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle2 className="mr-2 h-4 w-4 text-primary" />
                    <span>Advanced market insights</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle2 className="mr-2 h-4 w-4 text-primary" />
                    <span>Dedicated support</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle2 className="mr-2 h-4 w-4 text-primary" />
                    <span>Custom reporting</span>
                  </li>
                </ul>
                <Button className="mt-8" variant="outline">
                  Contact Sales
                </Button>
              </div>
            </div>
          </div>
        </section>

        <section className="w-full py-12 md:py-24 lg:py-32" id="faq">
          <div className="container mx-auto px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                  Frequently Asked Questions
                </h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Everything you need to know about nftportfolio.app.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-3xl gap-4 py-12">
              <div className="rounded-lg border p-6">
                <h3 className="text-lg font-bold">
                  Is my wallet secure when connecting to nftportfolio.app?
                </h3>
                <p className="mt-2 text-muted-foreground">
                  Yes, we use view-only connections that don't require your
                  private keys or seed phrases. We can only see your NFTs, not
                  move or transfer them.
                </p>
              </div>
              <div className="rounded-lg border p-6">
                <h3 className="text-lg font-bold">
                  Which blockchains do you support?
                </h3>
                <p className="mt-2 text-muted-foreground">
                  We currently support Ethereum, Solana, Polygon, Arbitrum,
                  Optimism, and Avalanche. We're constantly adding more chains.
                </p>
              </div>
              <div className="rounded-lg border p-6">
                <h3 className="text-lg font-bold">
                  How accurate is your pricing data?
                </h3>
                <p className="mt-2 text-muted-foreground">
                  We aggregate data from multiple sources including major
                  marketplaces, DEXs, and oracles to provide the most accurate
                  pricing possible.
                </p>
              </div>
              <div className="rounded-lg border p-6">
                <h3 className="text-lg font-bold">
                  Can I track NFTs I don't own?
                </h3>
                <p className="mt-2 text-muted-foreground">
                  Yes, you can create watchlists to track any NFT collection or
                  specific tokens even if you don't own them.
                </p>
              </div>
              <div className="rounded-lg border p-6">
                <h3 className="text-lg font-bold">
                  Do you offer tax reporting for NFT transactions?
                </h3>
                <p className="mt-2 text-muted-foreground">
                  Yes, our Pro and Enterprise plans include tax reporting
                  features that help you track cost basis, gains/losses, and
                  generate reports for tax purposes.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="w-full py-12 md:py-24 lg:py-32 bg-muted/50">
          <div className="container mx-auto px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">
                    Ready to take control of your NFT portfolio?
                  </h2>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl/relaxed">
                    Join thousands of collectors and investors who use
                    nftportfolio.app to track, analyze, and optimize their NFT
                    investments.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Button size="lg">Get Started Free</Button>
                  <Button size="lg" variant="outline">
                    Schedule a Demo
                  </Button>
                </div>
              </div>
              <div className="flex flex-col space-y-4 rounded-lg border bg-background p-6">
                <div className="flex items-center space-x-4">
                  <Image
                    src="/placeholder.svg?height=100&width=100"
                    width={60}
                    height={60}
                    alt="User Avatar"
                    className="rounded-full"
                  />
                  <div>
                    <h3 className="text-lg font-bold">Alex Thompson</h3>
                    <p className="text-sm text-muted-foreground">
                      NFT Collector & Investor
                    </p>
                  </div>
                </div>
                <p className="text-muted-foreground">
                  "nftportfolio.app has completely transformed how I manage my
                  collection. The real-time analytics and price alerts have
                  helped me make better decisions and increase my portfolio
                  value by over 30% in just three months."
                </p>
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="text-primary"
                    >
                      <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                    </svg>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="w-full border-t bg-background">
        <div className="container flex flex-col gap-8 px-4 py-10 md:px-6 lg:flex-row lg:gap-12">
          <div className="flex flex-col gap-4 lg:w-1/3">
            <div className="flex items-center gap-2">
              <Wallet className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold">nftportfolio.app</span>
            </div>
            <p className="text-muted-foreground">
              The complete platform for tracking, analyzing, and optimizing your
              NFT portfolio across multiple blockchains.
            </p>
            <div className="flex gap-4">
              <Link
                href="#"
                className="text-muted-foreground hover:text-foreground"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-5 w-5"
                >
                  <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
                </svg>
                <span className="sr-only">Twitter</span>
              </Link>
              <Link
                href="#"
                className="text-muted-foreground hover:text-foreground"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-5 w-5"
                >
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                  <rect width="4" height="12" x="2" y="9" />
                  <circle cx="4" cy="4" r="2" />
                </svg>
                <span className="sr-only">LinkedIn</span>
              </Link>
              <Link
                href="#"
                className="text-muted-foreground hover:text-foreground"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-5 w-5"
                >
                  <path d="M12 2H2v10h10V2zM22 2h-8v10h8V2zM12 14H2v8h10v-8zM22 14h-8v8h8v-8z" />
                </svg>
                <span className="sr-only">Discord</span>
              </Link>
            </div>
          </div>
          <div className="grid flex-1 grid-cols-2 gap-8 sm:grid-cols-4">
            <div className="flex flex-col gap-2">
              <h3 className="text-lg font-medium">Product</h3>
              <ul className="flex flex-col gap-2">
                <li>
                  <Link
                    href="#features"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Features
                  </Link>
                </li>
                <li>
                  <Link
                    href="#pricing"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    API
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Integrations
                  </Link>
                </li>
              </ul>
            </div>
            <div className="flex flex-col gap-2">
              <h3 className="text-lg font-medium">Company</h3>
              <ul className="flex flex-col gap-2">
                <li>
                  <Link
                    href="#"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    About
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Blog
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Careers
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Press
                  </Link>
                </li>
              </ul>
            </div>
            <div className="flex flex-col gap-2">
              <h3 className="text-lg font-medium">Resources</h3>
              <ul className="flex flex-col gap-2">
                <li>
                  <Link
                    href="#"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Documentation
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Community
                  </Link>
                </li>
                <li>
                  <Link
                    href="#faq"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    FAQ
                  </Link>
                </li>
              </ul>
            </div>
            <div className="flex flex-col gap-2">
              <h3 className="text-lg font-medium">Legal</h3>
              <ul className="flex flex-col gap-2">
                <li>
                  <Link
                    href="#"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Cookie Policy
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div className="border-t">
          <div className="container flex flex-col gap-2 px-4 py-6 text-center text-xs text-muted-foreground md:px-6 md:flex-row md:text-left">
            <p>
              © {new Date().getFullYear()} nftportfolio.app. All rights
              reserved.
            </p>
            <p className="md:ml-auto">
              Made with ❤️ for NFT collectors worldwide
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
