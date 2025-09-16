
import { useMemo } from 'react';
import { Diamond } from '@/components/inventory/InventoryTable';

interface ShapeGroup {
  totalPrice: number;
  count: number;
}

interface ShapeGroups {
  [shape: string]: ShapeGroup;
}

export function useEnhancedInsights(diamonds: Diamond[]) {
  const insights = useMemo(() => {
    if (!diamonds || diamonds.length === 0) {
      return {
        totalValue: 0,
        averagePrice: 0,
        totalCount: 0,
        shapeDistribution: [],
        topShapes: [],
        priceRanges: [],
        inventoryVelocity: 0,
        profitMargin: 0,
      };
    }

    // Calculate total value and count
    const totalValue = diamonds.reduce((sum, diamond) => sum + (diamond.price || 0), 0);
    const totalCount = diamonds.length;
    const averagePrice = totalCount > 0 ? totalValue / totalCount : 0;

    // Shape distribution analysis
    const shapeGroups: ShapeGroups = diamonds.reduce((groups, diamond) => {
      const shape = diamond.shape || 'Unknown';
      if (!groups[shape]) {
        groups[shape] = { totalPrice: 0, count: 0 };
      }
      groups[shape].totalPrice += diamond.price || 0;
      groups[shape].count += 1;
      return groups;
    }, {} as ShapeGroups);

    const shapeDistribution = Object.entries(shapeGroups).map(([shape, data]) => ({
      shape,
      count: data.count,
      value: data.totalPrice,
      percentage: (data.count / totalCount) * 100,
    }));

    // Top shapes by count
    const topShapes = Object.entries(shapeGroups)
      .sort(([, a], [, b]) => b.count - a.count)
      .slice(0, 5)
      .map(([shape, data]) => ({
        shape,
        count: data.count,
        value: data.totalPrice,
      }));

    // Price ranges
    const priceRanges = [
      { range: '$0 - $1,000', count: diamonds.filter(d => d.price < 1000).length },
      { range: '$1,000 - $5,000', count: diamonds.filter(d => d.price >= 1000 && d.price < 5000).length },
      { range: '$5,000 - $10,000', count: diamonds.filter(d => d.price >= 5000 && d.price < 10000).length },
      { range: '$10,000+', count: diamonds.filter(d => d.price >= 10000).length },
    ];

    // Mock calculations for velocity and profit margin
    const inventoryVelocity = Math.random() * 0.3 + 0.1; // 10-40% turnover
    const profitMargin = Math.random() * 0.2 + 0.15; // 15-35% profit

    return {
      totalValue,
      averagePrice,
      totalCount,
      shapeDistribution,
      topShapes,
      priceRanges,
      inventoryVelocity,
      profitMargin,
    };
  }, [diamonds]);

  return insights;
}
