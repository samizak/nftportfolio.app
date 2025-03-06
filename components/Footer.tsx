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
    <footer className="fixed bottom-0 left-0 right-0 w-full py-2 bg-background/90 backdrop-blur-sm border-t text-sm text-muted-foreground z-[60]">
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
      </div>
    </footer>
  );
}
