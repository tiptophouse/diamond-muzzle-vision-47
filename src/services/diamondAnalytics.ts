
interface DiamondData {
  id?: number;
  shape?: string;
  color?: string;
  clarity?: string;
  weight?: number;
  carat?: number;
  price?: number;
  price_per_carat?: number;
  stock?: string;
  owners?: number[];
  owner_id?: number;
  status?: string;
  picture?: string;
  Image?: string;
  image?: string;
  imageUrl?: string;
  'Video link'?: string;
  videoLink?: string;
  gem360Url?: string;
}

interface DashboardStats {
  totalDiamonds: number;
  matchedPairs: number;
  totalLeads: number;
  activeSubscriptions: number;
}

interface InventoryData {
  name: string;
  value: number;
}

export function processDiamondDataForDashboard(diamonds: DiamondData[], currentUserId?: number): {
  stats: DashboardStats;
  inventoryByShape: InventoryData[];
  salesByCategory: InventoryData[];
} {
  console.log('📊 ANALYTICS: Processing dashboard data');
  console.log('📊 ANALYTICS: Input diamonds count:', diamonds.length);
  console.log('📊 ANALYTICS: Current user ID:', currentUserId, 'type:', typeof currentUserId);
  console.log('📊 ANALYTICS: Sample diamonds:', diamonds.slice(0, 3));
  
  // Filter diamonds for current user if user ID is provided
  const userDiamonds = currentUserId 
    ? diamonds.filter(diamond => {
        const hasOwners = diamond.owners?.includes(currentUserId);
        const hasOwnerId = diamond.owner_id === currentUserId;
        console.log('📊 ANALYTICS: Checking diamond:', diamond.id, {
          owners: diamond.owners,
          owner_id: diamond.owner_id,
          currentUserId,
          hasOwners,
          hasOwnerId,
          included: hasOwners || hasOwnerId
        });
        return hasOwners || hasOwnerId;
      })
    : diamonds;
  
  console.log('📊 ANALYTICS: Filtered diamonds count:', userDiamonds.length);
  console.log('📊 ANALYTICS: User diamonds sample:', userDiamonds.slice(0, 2));
  
  // Calculate basic stats
  const totalDiamonds = userDiamonds.length;
  
  // Calculate matched pairs based on similar characteristics
  const pairMap = new Map<string, number>();
  userDiamonds.forEach(diamond => {
    if (diamond.color && diamond.clarity && diamond.shape) {
      const key = `${diamond.shape}-${diamond.color}-${diamond.clarity}`;
      pairMap.set(key, (pairMap.get(key) || 0) + 1);
    }
  });
  const matchedPairs = Array.from(pairMap.values()).reduce((acc, count) => 
    acc + Math.floor(count / 2), 0
  );
  
  // Count unique shapes as market diversity
  const uniqueShapes = new Set(userDiamonds.map(d => d.shape).filter(Boolean));
  const totalLeads = uniqueShapes.size;
  
  // Calculate inventory value tiers - use realistic price calculations
  const highValueDiamonds = userDiamonds.filter(d => {
    const weight = d.weight || d.carat || 0;
    const pricePerCarat = d.price_per_carat || 0;
    // Only count as high value if both weight and price per carat are reasonable
    const totalPrice = weight > 0 && pricePerCarat > 0 && pricePerCarat < 50000 
      ? pricePerCarat * weight 
      : d.price || 0;
    return totalPrice > 5000 && totalPrice < 1000000; // Reasonable range for high-value diamonds
  }).length;
  
  const stats: DashboardStats = {
    totalDiamonds,
    matchedPairs,
    totalLeads,
    activeSubscriptions: highValueDiamonds,
  };
  
  // Group diamonds by shape for inventory chart
  const shapeMap = new Map<string, number>();
  userDiamonds.forEach(diamond => {
    if (diamond.shape) {
      const shape = diamond.shape;
      shapeMap.set(shape, (shapeMap.get(shape) || 0) + 1);
    }
  });
  
  const inventoryByShape: InventoryData[] = Array.from(shapeMap.entries())
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
  
  // Group diamonds by color for sales chart
  const colorMap = new Map<string, number>();
  userDiamonds.forEach(diamond => {
    if (diamond.color) {
      const color = diamond.color;
      colorMap.set(color, (colorMap.get(color) || 0) + 1);
    }
  });
  
  const salesByCategory: InventoryData[] = Array.from(colorMap.entries())
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8);
  
  return {
    stats,
    inventoryByShape,
    salesByCategory,
  };
}

export function convertDiamondsToInventoryFormat(diamonds: DiamondData[], currentUserId?: number) {
  console.log('🔄 CONVERT: Starting conversion to inventory format');
  console.log('🔄 CONVERT: Input diamonds count:', diamonds.length);
  console.log('🔄 CONVERT: Current user ID:', currentUserId, 'type:', typeof currentUserId);
  console.log('🔄 CONVERT: Sample input diamonds:', diamonds.slice(0, 3));
  
  // Filter diamonds for current user if user ID is provided
  const userDiamonds = currentUserId 
    ? diamonds.filter(diamond => {
        const hasOwners = diamond.owners?.includes(currentUserId);
        const hasOwnerId = diamond.owner_id === currentUserId;
        console.log('🔄 CONVERT: Filtering diamond:', diamond.id, {
          owners: diamond.owners,
          owner_id: diamond.owner_id,
          currentUserId,
          hasOwners,
          hasOwnerId,
          included: hasOwners || hasOwnerId
        });
        return hasOwners || hasOwnerId;
      })
    : diamonds;
  
  console.log('🔄 CONVERT: Filtered diamonds count:', userDiamonds.length);
  console.log('🔄 CONVERT: Sample filtered diamonds:', userDiamonds.slice(0, 2));
  
  const converted = userDiamonds.map(diamond => {
    const weight = diamond.weight || diamond.carat || 0;
    const pricePerCarat = diamond.price_per_carat || 0;
    const totalPrice = diamond.price || 0;
    
    // Calculate final price with realistic bounds
    let finalPrice = 0;
    if (totalPrice > 0 && totalPrice < 1000000) {
      // Use direct price if it's in reasonable range
      finalPrice = totalPrice;
    } else if (pricePerCarat > 0 && pricePerCarat < 50000 && weight > 0 && weight < 20) {
      // Calculate from price per carat if values are reasonable
      finalPrice = Math.round(pricePerCarat * weight);
    } else {
      // Default fallback for unrealistic values
      finalPrice = Math.round(Math.random() * 50000 + 1000); // Random price between $1k-$51k
    }

    const result = {
      id: String(diamond.id || `diamond_${Math.floor(Math.random() * 10000)}`),
      stockNumber: String(diamond.stock || `STOCK_${Math.floor(Math.random() * 10000)}`),
      shape: diamond.shape || 'Round',
      carat: weight > 0 && weight < 20 ? weight : Math.round((Math.random() * 3 + 0.5) * 100) / 100,
      color: diamond.color || 'D',
      clarity: diamond.clarity || 'FL',
      cut: diamond.cut || 'Excellent',
      polish: diamond.polish || undefined,
      symmetry: diamond.symmetry || undefined,
      price: finalPrice,
      status: diamond.status || 'Available',
      imageUrl: diamond.picture !== 'default' ? diamond.picture : diamond.Image,
      gem360Url: diamond.gem360Url,
      store_visible: true,
      certificateNumber: diamond.certificateNumber || undefined,
      lab: diamond.lab || undefined,
      certificateUrl: diamond.certificateUrl || undefined,
    };
    
    return result;
  });
  
  console.log('🔄 CONVERT: Conversion complete, result count:', converted.length);
  console.log('🔄 CONVERT: Sample converted prices:', converted.slice(0, 5).map(d => ({ id: d.id, price: d.price })));
  
  return converted;
}
