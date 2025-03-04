/**
 * Format a number with thousand separators
 */
export const formatThousandSeparator = (
  num: number,
  fractionDigits?: number
): string => {
  // Determine fraction count:
  // If fractionDigits is provided, use that.
  // Otherwise, count decimals in the number's string representation.
  const parts = num.toString().split(".");
  const detectedFractionDigits = parts[1]?.length || 0;
  const fractionCount =
    fractionDigits !== undefined ? fractionDigits : detectedFractionDigits;

  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: fractionCount,
    maximumFractionDigits: fractionCount,
  }).format(num);
};

/**
 * Format a dollar value with thousand separators
 */
export const formatDollarValue = (value: number): string => {
  return new Intl.NumberFormat("en-US").format(Math.round(value));
};
