"use client";

import Image from "next/image";
import { useEthPrice } from "@/context/EthPriceContext";
import { useCurrency } from "@/context/CurrencyContext";
import { useGasPrice } from "@/context/GasPriceContext";
import { formatCurrency } from "@/lib/utils";
import { containerClass } from "@/lib/utils";

export default function Footer() {
  const { gasPrice } = useGasPrice();
  const { ethPrice } = useEthPrice();
  const { selectedCurrency } = useCurrency();

  return (
    <footer className="fixed bottom-0 left-0 right-0 w-full py-2 bg-background/80 backdrop-blur-sm border-t text-sm text-muted-foreground z-[60]">
      <div
        className={`${containerClass} mx-auto flex items-center justify-between px-4`}
      >
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 font-medium">
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
        </div>
        <div className="text-center font-medium">
          Made by <span className="text-primary">Sami Zakir Ahmed</span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 transition-colors hover:text-foreground">
            <Image
              src="/ethereum-eth-logo.svg"
              alt="Ethereum-logo"
              width={12}
              height={12}
              style={{ height: "auto" }}
            />
            <span>
              {formatCurrency(
                ethPrice,
                selectedCurrency.code,
                selectedCurrency.symbol
              )}
            </span>
          </div>
          <div className="text-border/60">|</div>
          <div className="transition-colors hover:text-foreground">{`${gasPrice} GWEI`}</div>
        </div>
      </div>
    </footer>
  );
}
