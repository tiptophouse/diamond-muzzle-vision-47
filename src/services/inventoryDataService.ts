
import { HybridDiamondService } from './hybridDiamondService';

export interface FetchInventoryResult {
  data?: any[];
  error?: string;
  debugInfo: any;
}

const hybridService = new HybridDiamondService();

export async function fetchInventoryData(): Promise<FetchInventoryResult> {
  console.log('🔍 INVENTORY SERVICE: Fetching data with hybrid approach');
  
  const debugInfo = { 
    step: 'Starting inventory fetch with hybrid service', 
    timestamp: new Date().toISOString(),
    dataSource: 'hybrid_fastapi_supabase',
    authentication: 'Telegram + Bearer Token'
  };
  
  try {
    const stones = await hybridService.fetchDiamonds();
    
    if (stones.length === 0) {
      console.log('📊 INVENTORY SERVICE: No stones found');
      return {
        data: [],
        debugInfo: {
          ...debugInfo,
          step: 'SUCCESS: Connected but no stones found',
          totalStones: 0
        }
      };
    }
    
    // Process and validate stones data
    const processedStones = stones.map((stone, index) => {
      return {
        ...stone,
        id: stone.id || `stone-${index}-${Date.now()}`,
        stock_number: stone.stock_number || `STOCK-${index + 1}`,
        shape: stone.shape || 'Round',
        weight: parseFloat(stone.weight?.toString() || '0'),
        color: stone.color || 'D',
        clarity: stone.clarity || 'FL',
        cut: stone.cut || 'Excellent',
        price: parseFloat(stone.price?.toString() || stone.price_per_carat?.toString() || '0'),
        status: stone.status || 'Available',
        store_visible: stone.store_visible !== false,
        picture: stone.picture,
        certificate_url: stone.certificate_url,
        certificate_number: stone.certificate_number,
        lab: stone.lab
      };
    });
    
    console.log('✅ INVENTORY SERVICE: Processed', processedStones.length, 'stones');
    
    return {
      data: processedStones,
      debugInfo: {
        ...debugInfo,
        step: 'SUCCESS: Data fetched and processed',
        totalStones: processedStones.length,
        sampleStone: processedStones[0]
      }
    };
    
  } catch (error) {
    console.error("❌ INVENTORY SERVICE: Unexpected error:", error);
    
    return {
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      debugInfo: {
        ...debugInfo,
        step: 'FAILED: Unexpected error',
        error: error instanceof Error ? error.message : String(error)
      }
    };
  }
}
