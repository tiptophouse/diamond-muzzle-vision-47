
import { useState, useEffect } from "react";
import { Diamond } from "@/components/inventory/InventoryTable";

interface PriceComparisonData {
  shape: string;
  userAverage: number;
  marketAverage: number;
  count: number;
  similarStonesCount: number;
  priceRange: {
    min: number;
    max: number;
  };
}

interface DetailedComparison {
  selectedStone: Diamond;
  similarStones: Diamond[];
  averagePrice: number;
  pricePosition: 'below' | 'average' | 'above';
  percentageDifference: number;
}

// Helper function to calculate similarity score between two diamonds
function calculateSimilarityScore(stone1: Diamond, stone2: Diamond): number {
  let score = 0;
  let factors = 0;

  // Shape match (highest weight)
  if (stone1.shape === stone2.shape) {
    score += 40;
  }
  factors += 40;

  // Color similarity (adjacent colors get partial points)
  const colorOrder = ['D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M'];
  const color1Index = colorOrder.indexOf(stone1.color);
  const color2Index = colorOrder.indexOf(stone2.color);
  if (color1Index !== -1 && color2Index !== -1) {
    const colorDiff = Math.abs(color1Index - color2Index);
    if (colorDiff === 0) score += 20;
    else if (colorDiff === 1) score += 15;
    else if (colorDiff === 2) score += 10;
    else if (colorDiff <= 3) score += 5;
  }
  factors += 20;

  // Clarity similarity
  const clarityOrder = ['FL', 'IF', 'VVS1', 'VVS2', 'VS1', 'VS2', 'SI1', 'SI2', 'I1', 'I2', 'I3'];
  const clarity1Index = clarityOrder.indexOf(stone1.clarity);
  const clarity2Index = clarityOrder.indexOf(stone2.clarity);
  if (clarity1Index !== -1 && clarity2Index !== -1) {
    const clarityDiff = Math.abs(clarity1Index - clarity2Index);
    if (clarityDiff === 0) score += 20;
    else if (clarityDiff === 1) score += 15;
    else if (clarityDiff === 2) score += 10;
    else if (clarityDiff <= 3) score += 5;
  }
  factors += 20;

  // Weight similarity (within 20% range)
  const weightDiff = Math.abs(stone1.carat - stone2.carat) / Math.max(stone1.carat, stone2.carat);
  if (weightDiff <= 0.1) score += 15;
  else if (weightDiff <= 0.2) score += 10;
  else if (weightDiff <= 0.3) score += 5;
  factors += 15;

  // Cut quality (if available)
  if (stone1.cut && stone2.cut) {
    const cutOrder = ['POOR', 'FAIR', 'GOOD', 'VERY GOOD', 'EXCELLENT'];
    const cut1Index = cutOrder.indexOf(stone1.cut);
    const cut2Index = cutOrder.indexOf(stone2.cut);
    if (cut1Index !== -1 && cut2Index !== -1) {
      const cutDiff = Math.abs(cut1Index - cut2Index);
      if (cutDiff === 0) score += 5;
      else if (cutDiff === 1) score += 3;
    }
  }
  factors += 5;

  return factors > 0 ? (score / factors) * 100 : 0;
}

export function usePriceComparison(diamonds: Diamond[]) {
  const [comparisonData, setComparisonData] = useState<PriceComparisonData[]>([]);
  const [selectedStoneComparison, setSelectedStoneComparison] = useState<DetailedComparison | null>(null);

  useEffect(() => {
    if (!diamonds.length) {
      setComparisonData([]);
      return;
    }

    // Group diamonds by shape and calculate sophisticated averages
    const shapeGroups = diamonds.reduce((acc, diamond) => {
      const shape = diamond.shape;
      if (!acc[shape]) {
        acc[shape] = {
          stones: [],
          prices: [],
          count: 0,
        };
      }
      
      const pricePerCarat = diamond.carat > 0 ? diamond.price / diamond.carat : 0;
      if (pricePerCarat > 0) {
        acc[shape].stones.push(diamond);
        acc[shape].prices.push(pricePerCarat);
        acc[shape].count++;
      }
      
      return acc;
    }, {} as Record<string, { stones: Diamond[]; prices: number[]; count: number }>);

    // Calculate comparison data with market averages based on similar stones
    const comparison = Object.entries(shapeGroups)
      .filter(([_, group]) => group.count > 0)
      .map(([shape, group]) => {
        const userAverage = group.prices.reduce((sum, price) => sum + price, 0) / group.prices.length;
        
        // Calculate market average based on similar stones across all shapes
        let marketPrices: number[] = [];
        let similarStonesCount = 0;

        group.stones.forEach(stone => {
          const similarStones = diamonds.filter(otherStone => {
            if (otherStone.id === stone.id) return false;
            const similarity = calculateSimilarityScore(stone, otherStone);
            return similarity >= 60; // 60% similarity threshold
          });

          similarStonesCount += similarStones.length;
          similarStones.forEach(similar => {
            const similarPrice = similar.carat > 0 ? similar.price / similar.carat : 0;
            if (similarPrice > 0) marketPrices.push(similarPrice);
          });
        });

        // If we don't have enough similar stones, use the group average as fallback
        const marketAverage = marketPrices.length > 0 
          ? marketPrices.reduce((sum, price) => sum + price, 0) / marketPrices.length
          : userAverage;

        const allPrices = [...group.prices, ...marketPrices];
        const priceRange = {
          min: Math.min(...allPrices),
          max: Math.max(...allPrices)
        };

        return {
          shape,
          userAverage: Math.round(userAverage),
          marketAverage: Math.round(marketAverage),
          count: group.count,
          similarStonesCount: Math.round(similarStonesCount / group.count), // Average similar stones per stone
          priceRange,
        };
      })
      .sort((a, b) => b.count - a.count); // Sort by count descending

    setComparisonData(comparison);
  }, [diamonds]);

  const analyzeSpecificStone = (stone: Diamond) => {
    const similarStones = diamonds.filter(otherStone => {
      if (otherStone.id === stone.id) return false;
      const similarity = calculateSimilarityScore(stone, otherStone);
      return similarity >= 50; // Lower threshold for detailed analysis
    });

    if (similarStones.length === 0) {
      setSelectedStoneComparison(null);
      return;
    }

    const stonePricePerCarat = stone.carat > 0 ? stone.price / stone.carat : 0;
    const similarPrices = similarStones
      .map(s => s.carat > 0 ? s.price / s.carat : 0)
      .filter(price => price > 0);

    const averagePrice = similarPrices.reduce((sum, price) => sum + price, 0) / similarPrices.length;
    const percentageDifference = ((stonePricePerCarat - averagePrice) / averagePrice) * 100;
    
    let pricePosition: 'below' | 'average' | 'above' = 'average';
    if (percentageDifference < -5) pricePosition = 'below';
    else if (percentageDifference > 5) pricePosition = 'above';

    setSelectedStoneComparison({
      selectedStone: stone,
      similarStones,
      averagePrice: Math.round(averagePrice),
      pricePosition,
      percentageDifference: Math.round(percentageDifference),
    });
  };

  return {
    comparisonData,
    selectedStoneComparison,
    analyzeSpecificStone,
    clearSelectedStone: () => setSelectedStoneComparison(null),
  };
}
