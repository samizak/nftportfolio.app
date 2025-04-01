"use client";

import { useFormattedGasPrice } from "@/hooks/useGasPriceQuery";
import { Fuel, Loader2 } from "lucide-react";

export function GasPrice() {
  const { roundedGwei, isLoading, error, isDefault } = useFormattedGasPrice();

  if (isLoading)
    return (
      <div className="flex items-center gap-2 text-sm">
        <Loader2 className="h-4 w-4 animate-spin" />
        Fetching gas price...
      </div>
    );

  if (error)
    return <div className="text-sm text-red-500">Error loading gas price</div>;

  return (
    <div className="flex items-center gap-1.5 transition-colors hover:text-foreground">
      <Fuel />
      <span className={`${isDefault && "text-yellow-500"}`}>
        {roundedGwei} gwei
      </span>
    </div>
  );
}
