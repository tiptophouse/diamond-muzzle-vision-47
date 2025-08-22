import { useMemo } from 'react';
import { Diamond } from '@/types/diamond';

interface ProfitAnalysis {
  potentialProfit: number;
  suggestedMarkup: number;
  isProfitable: boolean;
}

export function useProfitOptimizer(diamond: Diamond, targetProfitMargin: number = 0.15): ProfitAnalysis {
  const analysis = useMemo(() => {
    const cost = diamond.price || 0;
    const suggestedMarkup = cost > 0 ? cost * (1 + targetProfitMargin) : 0;
    const potentialProfit = suggestedMarkup - cost;
    const isProfitable = potentialProfit > 0;

    return {
      potentialProfit,
      suggestedMarkup,
      isProfitable,
    };
  }, [diamond.price, targetProfitMargin]);

  return analysis;
}
