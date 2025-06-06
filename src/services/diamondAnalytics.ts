
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

// Admin user ID
const ADMIN_USER_ID = 2138564172;

export function processDiamondDataForDashboard(diamonds: DiamondData[], currentUserId?: number): {
  stats: DashboardStats;
  inventoryByShape: InventoryData[];
  salesByCategory: InventoryData[];
} {
  // For admin or if no user filtering needed, use all diamonds
  let userDiamonds = diamonds;
  
  if (currentUserId && currentUserId !== ADMIN_USER_ID) {
    userDiamonds = diamonds.filter(diamond => {
      console.log('Dashboard filtering - checking diamond:', diamond.id, 'owners:', diamond.owners, 'against user:', currentUserId);
      return diamond.owners?.includes(currentUserId) || diamond.owner_id === currentUserId;
    });
  }
  
  console.log('Processing dashboard data for user:', currentUserId, 'User diamonds:', userDiamonds.length, 'Total diamonds:', diamonds.length);
  
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
  
  // Calculate inventory value tiers
  const highValueDiamonds = userDiamonds.filter(d => 
    (d.price_per_carat || 0) * (d.weight || d.carat || 0) > 10000
  ).length;
  
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
  // For admin user, don't filter - show all diamonds
  let userDiamonds = diamonds;
  
  if (currentUserId && currentUserId !== ADMIN_USER_ID) {
    userDiamonds = diamonds.filter(diamond => {
      console.log('Converting - filtering diamond:', diamond.id, 'owners:', diamond.owners, 'against user:', currentUserId);
      return diamond.owners?.includes(currentUserId) || diamond.owner_id === currentUserId;
    });
  } else if (currentUserId === ADMIN_USER_ID) {
    console.log('👑 Admin user - showing all diamonds without filtering');
  } else {
    console.log('🔧 No user filtering applied - showing all diamonds');
  }
  
  console.log('Converting diamonds to inventory format for user:', currentUserId, 'Filtered diamonds:', userDiamonds.length, 'Original:', diamonds.length);
  
  return userDiamonds.map(diamond => {
    const weight = diamond.weight || diamond.carat || 0;
    const pricePerCarat = diamond.price_per_carat || 0;
    const totalPrice = Math.round(pricePerCarat * weight);
    
    return {
      id: diamond.id?.toString() || '',
      stockNumber: diamond.stock || `D${diamond.id || Math.floor(Math.random() * 10000)}`,
      shape: diamond.shape || 'Unknown',
      carat: weight,
      color: diamond.color || 'Unknown',
      clarity: diamond.clarity || 'Unknown',
      cut: 'Excellent', // Default since not in your data
      price: totalPrice,
      status: diamond.status || 'Available',
    };
  });
}
