import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format a number as currency
 * @param amount The amount to format
 * @param currencyCode The currency code (e.g., 'USD', 'EUR')
 * @param symbol The currency symbol (e.g., '$', '€')
 * @returns Formatted currency string
 */
export function formatCurrency(
  amount: number,
  currencyCode: string = "USD",
  symbol: string = "$"
): string {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currencyCode,
      currencyDisplay: "symbol",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch (error) {
    // Fallback if the currency code is not supported
    return `${symbol}${amount.toFixed(2)}`;
  }
}
