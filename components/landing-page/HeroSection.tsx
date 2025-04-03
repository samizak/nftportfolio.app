import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2, TrendingUp } from "lucide-react";
import Link from "next/link";
import NftHeroGraphic from "@/components/graphics/NftHeroGraphic";

export default function HeroSection() {
  return (
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
                multiple blockchains with real-time data and powerful analytics.
              </p>
            </div>
            <div className="flex flex-col gap-2 min-[400px]:flex-row">
              <Link href="/track">
                <Button className=" cursor-pointer" size="lg" asChild>
                  <span>
                    Start Tracking Free
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </span>
                </Button>
              </Link>
              <Button className=" cursor-pointer" size="lg" variant="outline">
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
                <span>Track 10,000s NFTs free</span>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-center">
            <div className="relative w-full max-w-[500px] aspect-square overflow-hidden rounded-xl border bg-gradient-to-br from-muted/50 to-muted p-2">
              <NftHeroGraphic
                width="100%"
                height="100%"
                className="rounded-lg object-cover"
                aria-label="NFT Portfolio Dashboard Graphic"
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
  );
}
