
import { api } from "@/lib/api";
import { Diamond } from "@/pages/InventoryPage";

export interface InventoryServiceResult {
  success: boolean;
  data?: Diamond[];
  error?: string;
  debugInfo?: any;
}

export class InventoryService {
  private static validateDiamondData(rawItem: any): boolean {
    // Filter out invalid entries like "lisa monroxy"
    if (!rawItem || typeof rawItem !== 'object') {
      return false;
    }

    // Check for corrupted test data
    const invalidEntries = ['lisa monroxy', 'test', 'dummy', 'sample'];
    const stockNumber = String(rawItem.stock_number || rawItem.stockNumber || '').toLowerCase();
    const shape = String(rawItem.shape || '').toLowerCase();
    
    for (const invalid of invalidEntries) {
      if (stockNumber.includes(invalid) || shape.includes(invalid)) {
        console.warn('🚮 Filtering out invalid diamond entry:', rawItem);
        return false;
      }
    }

    // Ensure required fields exist
    return (
      rawItem.stock_number || rawItem.stockNumber
    );
  }

  private static convertToStandardFormat(rawItem: any): Diamond {
    // Clean and convert the data
    const weight = Number(rawItem.weight || rawItem.carat || 1);
    const pricePerCarat = Number(rawItem.price_per_carat || 0);
    const totalPrice = weight > 0 && pricePerCarat > 0 ? weight * pricePerCarat : Number(rawItem.price || 0);

    return {
      id: rawItem.id || `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      stockNumber: String(rawItem.stock_number || rawItem.stockNumber || 'N/A'),
      shape: String(rawItem.shape || 'Round'),
      carat: weight,
      color: String(rawItem.color || 'G'),
      clarity: String(rawItem.clarity || 'VS1'),
      cut: String(rawItem.cut || 'Excellent'),
      price: Math.round(totalPrice),
      status: String(rawItem.status || 'Available'),
      imageUrl: rawItem.picture || rawItem.imageUrl || undefined,
    };
  }

  static async fetchInventory(userId: number): Promise<InventoryServiceResult> {
    console.log('📦 InventoryService: Fetching inventory for user:', userId);
    
    try {
      // Try primary endpoint first
      const primaryEndpoint = `/api/v1/get_all_stones?user_id=${userId}`;
      console.log('📦 InventoryService: Trying primary endpoint:', primaryEndpoint);
      
      const response = await api.get(primaryEndpoint);
      
      if (response.error) {
        console.warn('📦 InventoryService: Primary endpoint failed:', response.error);
        
        // Try alternative endpoint without /api/v1 prefix
        const altEndpoint = `/get_all_stones?user_id=${userId}`;
        console.log('📦 InventoryService: Trying alternative endpoint:', altEndpoint);
        
        const altResponse = await api.get(altEndpoint);
        
        if (altResponse.error) {
          return {
            success: false,
            error: `Both endpoints failed. Primary: ${response.error}, Alternative: ${altResponse.error}`,
            debugInfo: {
              primaryEndpoint,
              altEndpoint,
              primaryError: response.error,
              altError: altResponse.error,
              timestamp: new Date().toISOString()
            }
          };
        }
        
        return this.processInventoryData(altResponse.data, altEndpoint);
      }
      
      return this.processInventoryData(response.data, primaryEndpoint);
      
    } catch (error) {
      console.error('📦 InventoryService: Critical error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown inventory service error',
        debugInfo: {
          error: error,
          timestamp: new Date().toISOString()
        }
      };
    }
  }

  private static processInventoryData(rawData: any, endpoint: string): InventoryServiceResult {
    console.log('📦 InventoryService: Processing raw data:', {
      dataType: typeof rawData,
      isArray: Array.isArray(rawData),
      dataLength: Array.isArray(rawData) ? rawData.length : 'N/A'
    });

    // Extract array from various possible response structures
    let dataArray: any[] = [];
    
    if (Array.isArray(rawData)) {
      dataArray = rawData;
    } else if (rawData && typeof rawData === 'object') {
      // Check common response wrapper patterns
      const possibleArrays = [
        rawData.data,
        rawData.diamonds,
        rawData.stones,
        rawData.inventory,
        rawData.results,
        rawData.items
      ];
      
      for (const arr of possibleArrays) {
        if (Array.isArray(arr)) {
          dataArray = arr;
          break;
        }
      }
    }

    if (!Array.isArray(dataArray) || dataArray.length === 0) {
      console.warn('📦 InventoryService: No valid data array found');
      return {
        success: true,
        data: [],
        debugInfo: {
          message: 'No diamonds found in response',
          endpoint,
          rawResponseStructure: rawData && typeof rawData === 'object' ? Object.keys(rawData) : [],
          timestamp: new Date().toISOString()
        }
      };
    }

    // Filter and convert valid diamonds
    const validDiamonds = dataArray
      .filter(this.validateDiamondData)
      .map(this.convertToStandardFormat);

    console.log('📦 InventoryService: ✅ Successfully processed diamonds', {
      totalReceived: dataArray.length,
      validDiamonds: validDiamonds.length,
      filteredOut: dataArray.length - validDiamonds.length
    });

    return {
      success: true,
      data: validDiamonds,
      debugInfo: {
        endpoint,
        totalReceived: dataArray.length,
        validDiamonds: validDiamonds.length,
        filteredOut: dataArray.length - validDiamonds.length,
        timestamp: new Date().toISOString()
      }
    };
  }
}
