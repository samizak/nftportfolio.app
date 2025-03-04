"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useRouter } from "next/navigation";

interface LandingPageProps {
  address: string;
  setAddress: (address: string) => void;
  onConnectMetamask: () => Promise<void>;
}

export default function LandingPage({
  address,
  setAddress,
  onConnectMetamask,
}: LandingPageProps) {
  const router = useRouter();

  const handleSearch = () => {
    if (address.trim()) {
      router.push(`/portfolio?id=${address.trim()}`);
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4">
      <h1 className="text-4xl font-bold mb-2">nftportfolio.app</h1>
      <p className="text-muted-foreground mb-8">
        Track any NFT portfolio in one place
      </p>

      <div className="w-full max-w-md space-y-4">
        <div className="relative">
          <Input
            placeholder="Enter ETH address or ENS name"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full"
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
          <Button
            variant="ghost"
            className="absolute right-2 top-1/2 -translate-y-1/2"
            onClick={handleSearch}
          >
            →
          </Button>
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">Or</span>
          </div>
        </div>

        <Button
          className="w-full flex items-center justify-center gap-2"
          onClick={onConnectMetamask}
        >
          <Image
            src="/metamask-fox.svg"
            alt="MetaMask"
            width={24}
            height={24}
          />
          Connect with MetaMask
        </Button>
      </div>
      <footer className="absolute bottom-4 text-sm text-muted-foreground">
        Made by Sami Zakir Ahmed
      </footer>
    </main>
  );
}
