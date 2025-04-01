"use client";

import Image from "next/image";

import { containerClass } from "@/lib/utils";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { GasPrice } from "../footer/GasPrice";
import { EthPrice } from "../footer/EthPrice";
import { useFormattedEthPrice } from "@/hooks/useEthPriceQuery";
import { useFormattedGasPrice } from "@/hooks/useGasPriceQuery";

export default function Footer() {
  const { timestamp: lastUpdatedGas } = useFormattedGasPrice();
  const { lastUpdated: lastUpdatedPrice } = useFormattedEthPrice();

  return (
    <footer className="fixed bottom-0 left-0 right-0 w-full py-2 bg-background/80 backdrop-blur-sm border-t text-sm text-muted-foreground z-[60]">
      <div
        className={`${containerClass} mx-auto flex items-center justify-between px-4`}
      >
        <div className="flex items-center gap-2">
          <HoverCard>
            <HoverCardTrigger asChild>
              <div className="flex items-center gap-1.5 font-medium cursor-pointer">
                <div className="relative flex items-center">
                  <Image
                    src="/live-pulse.svg"
                    alt="live-pulse"
                    width={20}
                    height={20}
                    className="animate-pulse"
                    style={{ height: "auto" }}
                  />
                </div>
                <span>Live</span>
              </div>
            </HoverCardTrigger>
            <HoverCardContent className="w-80 p-4">
              <div className="space-y-3">
                <h4 className="text-sm font-semibold">Data Sources</h4>
                <div className="space-y-2 border-b pb-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Image
                      src="/coingecko_logo.svg"
                      alt="CoinGecko"
                      width={20}
                      height={20}
                      style={{ height: "auto" }}
                    />
                    <span>CoinGecko API</span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    ETH Price • Last updated:{" "}
                    {lastUpdatedPrice
                      ? lastUpdatedPrice.toLocaleString()
                      : "Updating..."}
                  </div>
                </div>

                <div className="space-y-2 border-b pb-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Image
                      src="/infura_logo_red.svg"
                      alt="Infura"
                      width={20}
                      height={20}
                      style={{ height: "auto" }}
                    />
                    <span>Infura API</span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Gas Price • Last updated:{" "}
                    {lastUpdatedGas
                      ? lastUpdatedGas.toLocaleString()
                      : "Updating..."}{" "}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Image
                      src="/opensea_logo.svg"
                      alt="OpenSea"
                      width={20}
                      height={20}
                      style={{ height: "auto" }}
                    />
                    <span>OpenSea API</span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    NFT Data • Collection & Asset Information
                  </div>
                </div>
              </div>
            </HoverCardContent>
          </HoverCard>
        </div>
        <div className="text-center font-medium">
          Made by <span className="text-primary">Sami Zakir Ahmed</span>
        </div>

        <div className="flex items-center gap-3">
          <EthPrice />
          <div className="text-border/60">|</div>
          <GasPrice />
        </div>
      </div>
    </footer>
  );
}
