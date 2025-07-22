
export interface UploadAnalytics {
  shapeDistribution: Array<{ name: string; value: number; percentage: number }>;
  priceDistribution: {
    min: number;
    max: number;
    average: number;
    median: number;
    ranges: Array<{ range: string; count: number; percentage: number }>;
  };
  qualityDistribution: {
    colorGrades: Array<{ grade: string; count: number; percentage: number }>;
    clarityGrades: Array<{ grade: string; count: number; percentage: number }>;
    cutGrades: Array<{ grade: string; count: number; percentage: number }>;
  };
  sizeDistribution: {
    averageWeight: number;
    categories: Array<{ category: string; count: number; percentage: number }>;
    weightRanges: Array<{ range: string; count: number; percentage: number }>;
  };
  marketInsights: {
    totalValue: number;
    averagePricePerCarat: number;
    premiumCount: number;
    recommendations: string[];
  };
}

export function calculateUploadAnalytics(diamonds: any[]): UploadAnalytics {
  const total = diamonds.length;
  
  // Shape Distribution
  const shapeMap = new Map<string, number>();
  diamonds.forEach(d => {
    const shape = d.shape || 'Unknown';
    shapeMap.set(shape, (shapeMap.get(shape) || 0) + 1);
  });
  
  const shapeDistribution = Array.from(shapeMap.entries())
    .map(([name, value]) => ({
      name,
      value,
      percentage: Math.round((value / total) * 100)
    }))
    .sort((a, b) => b.value - a.value);

  // Price Distribution
  const prices = diamonds
    .map(d => (d.price_per_carat || 0) * (d.weight || 0))
    .filter(p => p > 0)
    .sort((a, b) => a - b);
  
  const priceDistribution = {
    min: Math.min(...prices),
    max: Math.max(...prices),
    average: prices.reduce((a, b) => a + b, 0) / prices.length,
    median: prices[Math.floor(prices.length / 2)],
    ranges: [
      { range: 'Under $5K', count: 0, percentage: 0 },
      { range: '$5K - $15K', count: 0, percentage: 0 },
      { range: '$15K - $50K', count: 0, percentage: 0 },
      { range: 'Over $50K', count: 0, percentage: 0 }
    ]
  };

  prices.forEach(price => {
    if (price < 5000) priceDistribution.ranges[0].count++;
    else if (price < 15000) priceDistribution.ranges[1].count++;
    else if (price < 50000) priceDistribution.ranges[2].count++;
    else priceDistribution.ranges[3].count++;
  });

  priceDistribution.ranges.forEach(range => {
    range.percentage = Math.round((range.count / total) * 100);
  });

  // Quality Distribution
  const colorMap = new Map<string, number>();
  const clarityMap = new Map<string, number>();
  const cutMap = new Map<string, number>();

  diamonds.forEach(d => {
    if (d.color) colorMap.set(d.color, (colorMap.get(d.color) || 0) + 1);
    if (d.clarity) clarityMap.set(d.clarity, (clarityMap.get(d.clarity) || 0) + 1);
    if (d.cut) cutMap.set(d.cut, (cutMap.get(d.cut) || 0) + 1);
  });

  const qualityDistribution = {
    colorGrades: Array.from(colorMap.entries())
      .map(([grade, count]) => ({ grade, count, percentage: Math.round((count / total) * 100) }))
      .sort((a, b) => b.count - a.count),
    clarityGrades: Array.from(clarityMap.entries())
      .map(([grade, count]) => ({ grade, count, percentage: Math.round((count / total) * 100) }))
      .sort((a, b) => b.count - a.count),
    cutGrades: Array.from(cutMap.entries())
      .map(([grade, count]) => ({ grade, count, percentage: Math.round((count / total) * 100) }))
      .sort((a, b) => b.count - a.count)
  };

  // Size Distribution
  const weights = diamonds.map(d => d.weight || 0).filter(w => w > 0);
  const averageWeight = weights.reduce((a, b) => a + b, 0) / weights.length;
  
  const sizeCategories = {
    small: weights.filter(w => w < 0.5).length,
    medium: weights.filter(w => w >= 0.5 && w <= 2).length,
    large: weights.filter(w => w > 2).length
  };

  const sizeDistribution = {
    averageWeight,
    categories: [
      { category: 'Small (<0.5ct)', count: sizeCategories.small, percentage: Math.round((sizeCategories.small / total) * 100) },
      { category: 'Medium (0.5-2ct)', count: sizeCategories.medium, percentage: Math.round((sizeCategories.medium / total) * 100) },
      { category: 'Large (>2ct)', count: sizeCategories.large, percentage: Math.round((sizeCategories.large / total) * 100) }
    ],
    weightRanges: [
      { range: '0.1-0.49ct', count: weights.filter(w => w >= 0.1 && w < 0.5).length, percentage: 0 },
      { range: '0.5-0.99ct', count: weights.filter(w => w >= 0.5 && w < 1).length, percentage: 0 },
      { range: '1.0-1.99ct', count: weights.filter(w => w >= 1 && w < 2).length, percentage: 0 },
      { range: '2.0ct+', count: weights.filter(w => w >= 2).length, percentage: 0 }
    ]
  };

  sizeDistribution.weightRanges.forEach(range => {
    range.percentage = Math.round((range.count / total) * 100);
  });

  // Market Insights
  const totalValue = diamonds.reduce((sum, d) => sum + ((d.price_per_carat || 0) * (d.weight || 0)), 0);
  const averagePricePerCarat = diamonds.reduce((sum, d) => sum + (d.price_per_carat || 0), 0) / total;
  const premiumCount = diamonds.filter(d => (d.price_per_carat || 0) > 8000).length;

  const recommendations = [];
  if (premiumCount / total > 0.3) recommendations.push('High-value inventory detected - consider premium marketing');
  if (shapeDistribution[0]?.percentage > 60) recommendations.push(`Strong ${shapeDistribution[0].name} focus - diversify shapes for broader appeal`);
  if (averagePricePerCarat < 3000) recommendations.push('Consider price optimization for better margins');
  
  const marketInsights = {
    totalValue,
    averagePricePerCarat,
    premiumCount,
    recommendations
  };

  return {
    shapeDistribution,
    priceDistribution,
    qualityDistribution,
    sizeDistribution,
    marketInsights
  };
}
