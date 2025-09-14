// Safe math operations to prevent crashes from division by zero and invalid numbers

export const safeDivide = (numerator: number, denominator: number): number => {
  if (!isFinite(numerator) || !isFinite(denominator) || denominator === 0) {
    return 0;
  }
  const result = numerator / denominator;
  return isFinite(result) ? result : 0;
};

export const safeMultiply = (a: number, b: number): number => {
  if (!isFinite(a) || !isFinite(b)) {
    return 0;
  }
  const result = a * b;
  return isFinite(result) ? result : 0;
};

export const safeSum = (numbers: number[]): number => {
  return numbers.reduce((sum, num) => {
    if (isFinite(num)) {
      return sum + num;
    }
    return sum;
  }, 0);
};

export const safeRound = (value: number): number => {
  if (!isFinite(value)) {
    return 0;
  }
  return Math.round(value);
};

export const validateDiamondData = (diamond: any): boolean => {
  return (
    diamond &&
    typeof diamond.carat === 'number' &&
    diamond.carat > 0 &&
    diamond.carat < 50 && // Reasonable upper limit
    typeof diamond.price === 'number' &&
    diamond.price > 0 &&
    diamond.price < 10000000 && // Reasonable upper limit
    diamond.shape &&
    diamond.color &&
    diamond.clarity
  );
};