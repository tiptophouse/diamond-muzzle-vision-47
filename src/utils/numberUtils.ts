
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

export const formatLargeNumber = (value: number | string): string => {
  const num = safeParseNumber(value);
  
  if (num < 1000) {
    return num.toString();
  } else if (num < 1000000) {
    const kValue = num / 1000;
    return kValue % 1 === 0 ? `${kValue}K` : `${kValue.toFixed(1)}K`;
  } else if (num < 1000000000) {
    const mValue = num / 1000000;
    return mValue % 1 === 0 ? `${mValue}M` : `${mValue.toFixed(1)}M`;
  } else {
    const bValue = num / 1000000000;
    return bValue % 1 === 0 ? `${bValue}B` : `${bValue.toFixed(1)}B`;
  }
};
