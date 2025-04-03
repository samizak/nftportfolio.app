import Image from "next/image";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function CtaSection() {
  return (
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
              <Link href="/track">
                <Button className="cursor-pointer" size="lg" asChild>
                  <span>Get Started Free</span>
                </Button>
              </Link>
            </div>
          </div>
          <div className="flex flex-col space-y-4 rounded-lg border bg-background p-6">
            <div className="flex items-center space-x-4">
              <Image
                src="/placeholder.svg?height=100&width=100" // TODO: Replace placeholder
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
              &quot;nftportfolio.app has completely transformed how I manage my
              collection. The real-time analytics and price alerts have helped
              me make better decisions and increase my portfolio value by over
              30% in just three months.&quot;
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
  );
}
