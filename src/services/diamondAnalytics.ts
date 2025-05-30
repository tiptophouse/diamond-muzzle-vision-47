
interface DiamondData {
  id?: number;
  shape?: string;
  color?: string;
  clarity?: string;
  weight?: number; // FastAPI uses 'weight' not 'carat'
  carat?: number;
  price?: number;
  owners?: number[]; // FastAPI uses 'owners' array
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

export function processDiamondDataForDashboard(diamonds: DiamondData[], currentUserId?: number): {
  stats: DashboardStats;
  inventoryByShape: InventoryData[];
  salesByCategory: InventoryData[];
} {
  // Filter diamonds for current user if user ID is provided
  const userDiamonds = currentUserId 
    ? diamonds.filter(diamond => 
        diamond.owners?.includes(currentUserId) || diamond.owner_id === currentUserId
      )
    : diamonds;
  
  console.log('Processing dashboard data for user:', currentUserId, 'User diamonds:', userDiamonds.length, 'Total diamonds:', diamonds.length);
  
  // Calculate basic stats
  const totalDiamonds = userDiamonds.length;
  
  // Count unique owners as leads
  const uniqueOwners = new Set(userDiamonds.flatMap(d => d.owners || [d.owner_id].filter(Boolean)));
  const totalLeads = uniqueOwners.size;
  
  // Count matched pairs (diamonds with same color and clarity)
  const pairMap = new Map<string, number>();
  userDiamonds.forEach(diamond => {
    if (diamond.color && diamond.clarity) {
      const key = `${diamond.color}-${diamond.clarity}`;
      pairMap.set(key, (pairMap.get(key) || 0) + 1);
    }
  });
  const matchedPairs = Array.from(pairMap.values()).reduce((acc, count) => 
    acc + Math.floor(count / 2), 0
  );
  
  // For demo, set active subscriptions to number of unique owners
  const activeSubscriptions = totalLeads;
  
  const stats: DashboardStats = {
    totalDiamonds,
    matchedPairs,
    totalLeads,
    activeSubscriptions,
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
    .slice(0, 8); // Top 8 colors
  
  return {
    stats,
    inventoryByShape,
    salesByCategory,
  };
}

export function convertDiamondsToInventoryFormat(diamonds: DiamondData[], currentUserId?: number) {
  // Filter diamonds for current user if user ID is provided
  const userDiamonds = currentUserId 
    ? diamonds.filter(diamond => 
        diamond.owners?.includes(currentUserId) || diamond.owner_id === currentUserId
      )
    : diamonds;
  
  console.log('Converting diamonds to inventory format for user:', currentUserId, 'Filtered diamonds:', userDiamonds.length);
  
  return userDiamonds.map(diamond => ({
    id: diamond.id?.toString() || '',
    stockNumber: `D${diamond.id || Math.floor(Math.random() * 10000)}`,
    shape: diamond.shape || 'Unknown',
    carat: diamond.weight || diamond.carat || 0, // Map 'weight' to 'carat'
    color: diamond.color || 'Unknown',
    clarity: diamond.clarity || 'Unknown',
    cut: 'Excellent', // Default since not in your data
    price: diamond.price || 0,
    status: diamond.status || 'Available',
  }));
}
