
import { Diamond } from "@/components/inventory/InventoryTable";

export interface DiamondData {
  id: number;
  stock: string;
  shape: string;
  weight: number;
  color: string;
  clarity: string;
  cut?: string;
  polish?: string;
  symmetry?: string;
  fluorescence?: string;
  price_per_carat: number;
  lab?: string;
  certificate_number?: number;
  picture?: string;
  owners?: number[];
}

export function convertDiamondsToInventoryFormat(diamonds: DiamondData[]): Diamond[] {
  console.log('Converting diamonds to inventory format, total diamonds:', diamonds.length);
  
  return diamonds.map((diamond) => {
    const convertedDiamond = {
      id: diamond.id.toString(),
      stockNumber: diamond.stock || `STOCK-${diamond.id}`,
      shape: diamond.shape || 'Unknown',
      carat: diamond.weight || 0,
      color: diamond.color || 'Unknown',
      clarity: diamond.clarity || 'Unknown',
      cut: diamond.cut || 'Unknown',
      price: diamond.price_per_carat * diamond.weight || 0,
      status: 'Available',
      imageUrl: diamond.picture || undefined,
    };
    
    console.log(`Converted diamond ${diamond.id}:`, convertedDiamond);
    return convertedDiamond;
  });
}

export function analyzeDiamondsByShape(diamonds: Diamond[]) {
  const shapeDistribution: Record<string, number> = {};
  
  diamonds.forEach(diamond => {
    const shape = diamond.shape.toLowerCase();
    shapeDistribution[shape] = (shapeDistribution[shape] || 0) + 1;
  });
  
  return Object.entries(shapeDistribution)
    .map(([shape, count]) => ({
      shape: shape.charAt(0).toUpperCase() + shape.slice(1),
      count,
      percentage: Math.round((count / diamonds.length) * 100)
    }))
    .sort((a, b) => b.count - a.count);
}

export function calculateInventoryValue(diamonds: Diamond[]): number {
  return diamonds.reduce((total, diamond) => total + diamond.price, 0);
}

export function getPremiumDiamonds(diamonds: Diamond[]): Diamond[] {
  return diamonds.filter(diamond => diamond.carat >= 2 || diamond.price >= 10000);
}

export function getAverageCaratWeight(diamonds: Diamond[]): number {
  if (diamonds.length === 0) return 0;
  const totalCarats = diamonds.reduce((total, diamond) => total + diamond.carat, 0);
  return totalCarats / diamonds.length;
}

export function getAveragePricePerCarat(diamonds: Diamond[]): number {
  if (diamonds.length === 0) return 0;
  const totalValue = diamonds.reduce((total, diamond) => total + diamond.price, 0);
  const totalCarats = diamonds.reduce((total, diamond) => total + diamond.carat, 0);
  return totalCarats > 0 ? totalValue / totalCarats : 0;
}
