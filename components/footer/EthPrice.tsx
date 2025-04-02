"use client";

import { useFormattedEthPrice } from "@/hooks/useEthPriceQuery";
import { Loader2 } from "lucide-react";
import Image from "next/image";

export function EthPrice() {
  const { formattedPrice, isLoading, error, isDefault } =
    useFormattedEthPrice();

  if (isLoading)
    return (
      <div className="flex items-center gap-2 text-sm">
        <Loader2 className="h-4 w-4 animate-spin" />
        Fetching ETH prices...
      </div>
    );

  if (error)
    return <div className="text-sm text-red-500">Error loading ETH prices</div>;

  return (
    <div className="flex items-center gap-1.5 transition-colors hover:text-foreground">
      <Image
        src="/ethereum-eth-logo.svg"
        alt="Ethereum-logo"
        width={12}
        height={12}
        style={{ height: "auto" }}
      />
      <span className={`${isDefault && "text-yellow-500"}`}>
        {formattedPrice}
      </span>
    </div>
  );
}
