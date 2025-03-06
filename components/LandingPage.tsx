"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { LandingPageProps } from "@/types/page";
import Footer from "./Footer";
import { motion } from "framer-motion";
import { useState } from "react";
import { isAddress } from "ethers";

export default function LandingPage({
  address,
  setAddress,
  onConnectMetamask,
}: LandingPageProps) {
  const router = useRouter();
  const [error, setError] = useState<string>("");

  const validateAndSearch = () => {
    const trimmedAddress = address.trim();
    
    // Check if it's a valid Ethereum address
    if (!trimmedAddress) {
      setError("Please enter an address");
      return;
    }

    // Check if it's an ENS name
    if (trimmedAddress.toLowerCase().endsWith('.eth')) {
      router.push(`/portfolio?id=${trimmedAddress}`);
      return;
    }

    // Validate Ethereum address
    if (!isAddress(trimmedAddress)) {
      setError("Please enter a valid Ethereum address");
      return;
    }

    setError("");
    router.push(`/portfolio?id=${trimmedAddress}`);
  };

  return (
    <div className="flex flex-col min-h-screen overflow-hidden">
      <main className="flex-grow flex flex-col items-center justify-center p-4 md:p-8 pb-20">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold mb-3 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            nftportfolio.app
          </h1>
          <p className="text-muted-foreground text-lg max-w-md">
            Track any NFT portfolio in one place
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="w-full max-w-md space-y-6 backdrop-blur-sm bg-card/30 p-6 rounded-xl border border-border/40 shadow-sm"
        >
          <div className="relative">
            <Input
              placeholder="Enter ETH address or ENS name"
              value={address}
              onChange={(e) => {
                setAddress(e.target.value);
                setError(""); // Clear error when input changes
              }}
              className={`w-full pr-12 bg-background/70 backdrop-blur-sm ${
                error ? "border-red-500 focus-visible:ring-red-500" : ""
              }`}
              onKeyDown={(e) => e.key === "Enter" && validateAndSearch()}
            />
            <Button
              variant="ghost"
              className="absolute right-2 top-1/2 -translate-y-1/2 hover:bg-primary/10 transition-colors"
              onClick={validateAndSearch}
            >
              →
            </Button>
            {error && (
              <p className="text-red-500 text-sm mt-1 absolute">
                {error}
              </p>
            )}
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border/50" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background/80 backdrop-blur-sm px-3 py-1 rounded-full text-muted-foreground">
                Or
              </span>
            </div>
          </div>

          <Button
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-[#F6851B] to-[#E2761B] hover:from-[#E2761B] hover:to-[#F6851B] transition-all duration-300"
            onClick={onConnectMetamask}
          >
            <Image
              src="/metamask-fox.svg"
              alt="MetaMask"
              width={24}
              height={24}
              style={{ height: "auto" }}
            />
            <span>Connect with MetaMask</span>
          </Button>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
}
