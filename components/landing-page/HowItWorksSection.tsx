import Image from "next/image";

export default function HowItWorksSection() {
  return (
    <section className="w-full py-12 md:py-24 lg:py-32" id="how-it-works">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
              How nftportfolio.app Works
            </h2>
            <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Get started in minutes and gain valuable insights into your NFT
              investments.
            </p>
          </div>
        </div>
        <div className="mx-auto grid max-w-5xl items-start gap-6 py-12 lg:grid-cols-3">
          <div className="flex flex-col items-center space-y-4 rounded-lg p-6 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <span className="text-xl font-bold">1</span>
            </div>
            <h3 className="text-xl font-bold">Connect Your Wallet</h3>
            <p className="text-muted-foreground">
              Securely connect your wallets with view-only access. We support
              Ethereum, Solana, Polygon, and more.
            </p>
          </div>
          <div className="flex flex-col items-center space-y-4 rounded-lg p-6 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <span className="text-xl font-bold">2</span>
            </div>
            <h3 className="text-xl font-bold">Sync Your NFTs</h3>
            <p className="text-muted-foreground">
              We automatically detect and import all your NFTs across connected
              wallets and blockchains.
            </p>
          </div>
          <div className="flex flex-col items-center space-y-4 rounded-lg p-6 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <span className="text-xl font-bold">3</span>
            </div>
            <h3 className="text-xl font-bold">Track & Analyze</h3>
            <p className="text-muted-foreground">
              Get real-time data, analytics, and insights to make informed
              decisions about your NFT portfolio.
            </p>
          </div>
        </div>
        <div className="flex justify-center">
          <div className="relative w-full max-w-4xl overflow-hidden rounded-xl border">
            <Image
              src="/placeholder.svg?height=800&width=1600" // TODO: Replace placeholder
              width={1600}
              height={800}
              alt="NFT Portfolio Dashboard"
              className="w-full object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
