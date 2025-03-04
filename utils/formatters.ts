/**
 * Format a number with thousand separators
 */
export const formatThousandSeparator = (num: number): string => {
  return new Intl.NumberFormat("en-US").format(num);
};

/**
 * Format a dollar value with thousand separators
 */
export const formatDollarValue = (value: number): string => {
  return new Intl.NumberFormat("en-US").format(Math.round(value));
};