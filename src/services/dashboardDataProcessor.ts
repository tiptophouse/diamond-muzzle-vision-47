
import { Diamond } from '@/components/inventory/InventoryTable';

interface DashboardStats {
  totalDiamonds: number;
  totalValue: number;
  averagePricePerCarat: number;
  availableDiamonds: number;
}

export function processDashboardStats(diamonds: Diamond[]): DashboardStats {
  console.log('📊 Processing dashboard stats for', diamonds.length, 'diamonds');
  
  // Filter only available diamonds
  const availableDiamonds = diamonds.filter(d => 
    d.status === 'Available' && 
    d.store_visible !== false
  );
  
  // Calculate total value more accurately
  let totalValue = 0;
  let validPriceCount = 0;
  let totalPricePerCarat = 0;
  
  availableDiamonds.forEach(diamond => {
    // Calculate price based on available data
    let diamondPrice = 0;
    
    if (diamond.price > 0) {
      diamondPrice = diamond.price;
    } else if (diamond.carat > 0) {
      // Look for price per carat in different possible fields
      const pricePerCarat = (diamond as any).price_per_carat || 
                           (diamond as any).pricePerCarat || 
                           0;
      
      if (pricePerCarat > 0) {
        diamondPrice = pricePerCarat * diamond.carat;
        totalPricePerCarat += pricePerCarat;
        validPriceCount++;
      }
    }
    
    // Only add reasonable prices (avoid inflated values)
    if (diamondPrice > 0 && diamondPrice < 1000000) {
      totalValue += diamondPrice;
    }
  });
  
  const averagePricePerCarat = validPriceCount > 0 ? 
    Math.round(totalPricePerCarat / validPriceCount) : 0;
  
  const stats = {
    totalDiamonds: diamonds.length,
    totalValue: Math.round(totalValue),
    averagePricePerCarat,
    availableDiamonds: availableDiamonds.length
  };
  
  console.log('📊 Calculated dashboard stats:', stats);
  
  return stats;
}

export function formatCurrency(amount: number): string {
  if (amount >= 1000000) {
    return `$${(amount / 1000000).toFixed(1)}M`;
  } else if (amount >= 1000) {
    return `$${(amount / 1000).toFixed(0)}K`;
  } else {
    return `$${amount.toLocaleString()}`;
  }
}
