"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useCurrency } from "@/context/CurrencyContext";

const currencies = [
  { code: "USD", symbol: "$" },
  { code: "EUR", symbol: "€" },
  { code: "GBP", symbol: "£" },
  { code: "JPY", symbol: "JP¥" },
  { code: "AUD", symbol: "A$" },
  { code: "CAD", symbol: "C$" },
  { code: "CNY", symbol: "CN¥" },
];

export default function CurrencySelector() {
  const { selectedCurrency, setSelectedCurrency } = useCurrency();

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild className="cursor-pointer">
        <Button variant="outline" size="sm" className="w-20">
          {selectedCurrency.code}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="z-[100]">
        {currencies.map((currency) => (
          <DropdownMenuItem
            key={currency.code}
            onClick={() => setSelectedCurrency(currency)}
            className="cursor-pointer"
          >
            {currency.code}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
