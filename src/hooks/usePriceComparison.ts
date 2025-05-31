
import { useState, useEffect } from "react";
import { Diamond } from "@/components/inventory/InventoryTable";

interface PriceComparisonData {
  shape: string;
  userAverage: number;
  marketAverage: number;
  count: number;
}

// Market average prices per carat by shape (sample data - in real app this would come from an API)
const MARKET_AVERAGES: Record<string, number> = {
  "Round": 6500,
  "Princess": 5200,
  "Emerald": 4800,
  "Asscher": 4900,
  "Oval": 5800,
  "Radiant": 4600,
  "Cushion": 5400,
  "Pear": 5100,
  "Heart": 4700,
  "Marquise": 4900,
};

export function usePriceComparison(diamonds: Diamond[]) {
  const [comparisonData, setComparisonData] = useState<PriceComparisonData[]>([]);

  useEffect(() => {
    if (!diamonds.length) {
      setComparisonData([]);
      return;
    }

    // Group diamonds by shape and calculate averages
    const shapeGroups = diamonds.reduce((acc, diamond) => {
      const shape = diamond.shape;
      if (!acc[shape]) {
        acc[shape] = {
          prices: [],
          count: 0,
        };
      }
      
      const pricePerCarat = diamond.carat > 0 ? diamond.price / diamond.carat : 0;
      if (pricePerCarat > 0) {
        acc[shape].prices.push(pricePerCarat);
        acc[shape].count++;
      }
      
      return acc;
    }, {} as Record<string, { prices: number[]; count: number }>);

    // Calculate comparison data
    const comparison = Object.entries(shapeGroups)
      .filter(([_, group]) => group.count > 0)
      .map(([shape, group]) => {
        const userAverage = group.prices.reduce((sum, price) => sum + price, 0) / group.prices.length;
        const marketAverage = MARKET_AVERAGES[shape] || 5000; // Default if shape not found

        return {
          shape,
          userAverage: Math.round(userAverage),
          marketAverage,
          count: group.count,
        };
      })
      .sort((a, b) => b.count - a.count); // Sort by count descending

    setComparisonData(comparison);
  }, [diamonds]);

  return {
    comparisonData,
  };
}
