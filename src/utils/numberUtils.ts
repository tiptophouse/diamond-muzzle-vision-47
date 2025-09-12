
// Utility functions for consistent number handling and formatting

export const roundToInteger = (value: number | string): number => {
  return Math.round(Number(value));
};

export const safeParseNumber = (value: any): number => {
  const parsed = Number(value);
  return isNaN(parsed) ? 0 : parsed;
};

export const formatCurrency = (amount: number | string): string => {
  const numAmount = safeParseNumber(amount);
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(numAmount);
};

export const formatPricePerCarat = (totalPrice: number | string, carat: number | string): number => {
  const price = safeParseNumber(totalPrice);
  const weight = safeParseNumber(carat);
  
  if (weight <= 0) return 0;
  
  return roundToInteger(price / weight);
};

export const ensureInteger = (value: any): number => {
  if (typeof value === 'string') {
    // Remove any decimal points and everything after
    const integerPart = value.split('.')[0];
    return parseInt(integerPart) || 0;
  }
  return roundToInteger(value);
};
