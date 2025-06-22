
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
    console.log('📦 InventoryService: === STARTING INVENTORY FETCH ===');
    console.log('📦 InventoryService: User ID:', userId, 'Type:', typeof userId);
    console.log('📦 InventoryService: Expected backend: https://api.mazalbot.com');
    console.log('📦 InventoryService: Expected diamonds: ~566');
    
    try {
      // Try primary endpoint first
      const primaryEndpoint = `/api/v1/get_all_stones?user_id=${userId}`;
      console.log('📦 InventoryService: 🎯 Primary endpoint:', primaryEndpoint);
      console.log('📦 InventoryService: 🎯 Full URL will be: https://api.mazalbot.com' + primaryEndpoint);
      
      const response = await api.get(primaryEndpoint);
      
      console.log('📦 InventoryService: 📥 Primary response received:', {
        hasError: !!response.error,
        hasData: !!response.data,
        errorMessage: response.error,
        dataType: typeof response.data,
        isArray: Array.isArray(response.data)
      });
      
      if (response.error) {
        console.warn('📦 InventoryService: ⚠️ Primary endpoint failed:', response.error);
        
        // Enhanced error analysis
        const debugInfo = {
          primaryEndpoint,
          primaryError: response.error,
          timestamp: new Date().toISOString(),
          userId: userId,
          analysis: this.analyzeError(response.error)
        };
        
        console.log('📦 InventoryService: 🔍 Error analysis:', debugInfo.analysis);
        
        // Try alternative endpoint patterns
        const alternativeEndpoints = [
          `/get_all_stones?user_id=${userId}`,
          `/api/v1/stones?user_id=${userId}`,
          `/stones?user_id=${userId}`,
          `/api/v1/inventory?user_id=${userId}`,
          `/inventory?user_id=${userId}`
        ];
        
        for (const altEndpoint of alternativeEndpoints) {
          console.log('📦 InventoryService: 🔄 Trying alternative:', altEndpoint);
          
          try {
            const altResponse = await api.get(altEndpoint);
            
            if (!altResponse.error && altResponse.data) {
              console.log('📦 InventoryService: ✅ Alternative endpoint worked!', altEndpoint);
              return this.processInventoryData(altResponse.data, altEndpoint);
            } else {
              console.log('📦 InventoryService: ❌ Alternative failed:', altEndpoint, altResponse.error);
            }
          } catch (altError) {
            console.log('📦 InventoryService: ❌ Alternative error:', altEndpoint, altError);
          }
        }
        
        return {
          success: false,
          error: `All endpoints failed. Primary error: ${response.error}`,
          debugInfo: {
            ...debugInfo,
            attemptedEndpoints: [primaryEndpoint, ...alternativeEndpoints],
            recommendation: debugInfo.analysis.recommendation
          }
        };
      }
      
      return this.processInventoryData(response.data, primaryEndpoint);
      
    } catch (error) {
      console.error('📦 InventoryService: ❌ CRITICAL ERROR:', error);
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown inventory service error',
        debugInfo: {
          type: 'Critical service error',
          error: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined,
          timestamp: new Date().toISOString(),
          userId: userId,
          recommendation: 'Check network connectivity and backend server status'
        }
      };
    }
  }

  private static analyzeError(error: string): { issue: string; recommendation: string; severity: 'low' | 'medium' | 'high' } {
    const errorLower = error.toLowerCase();
    
    if (errorLower.includes('404') || errorLower.includes('not found')) {
      return {
        issue: 'API endpoint does not exist',
        recommendation: 'Verify the correct endpoint path with your FastAPI backend',
        severity: 'high'
      };
    }
    
    if (errorLower.includes('403') || errorLower.includes('forbidden')) {
      return {
        issue: 'Authentication/authorization failed',
        recommendation: 'Check BACKEND_ACCESS_TOKEN in Supabase secrets',
        severity: 'high'
      };
    }
    
    if (errorLower.includes('401') || errorLower.includes('unauthorized')) {
      return {
        issue: 'Missing or invalid authentication',
        recommendation: 'Verify backend token and user authentication',
        severity: 'high'
      };
    }
    
    if (errorLower.includes('500') || errorLower.includes('internal server')) {
      return {
        issue: 'Backend server error',
        recommendation: 'Check FastAPI server logs and status',
        severity: 'high'
      };
    }
    
    if (errorLower.includes('network') || errorLower.includes('fetch')) {
      return {
        issue: 'Network connectivity problem',
        recommendation: 'Check internet connection and server availability',
        severity: 'medium'
      };
    }
    
    if (errorLower.includes('timeout')) {
      return {
        issue: 'Request timeout',
        recommendation: 'Server may be overloaded or slow',
        severity: 'medium'
      };
    }
    
    return {
      issue: 'Unknown error',
      recommendation: 'Check logs for more details',
      severity: 'medium'
    };
  }

  private static processInventoryData(rawData: any, endpoint: string): InventoryServiceResult {
    console.log('📦 InventoryService: 🔄 Processing inventory data...');
    console.log('📦 InventoryService: 🔄 Data type:', typeof rawData);
    console.log('📦 InventoryService: 🔄 Is array:', Array.isArray(rawData));
    console.log('📦 InventoryService: 🔄 Data length:', Array.isArray(rawData) ? rawData.length : 'N/A');

    // Extract array from various possible response structures
    let dataArray: any[] = [];
    
    if (Array.isArray(rawData)) {
      dataArray = rawData;
      console.log('📦 InventoryService: 📋 Direct array detected');
    } else if (rawData && typeof rawData === 'object') {
      console.log('📦 InventoryService: 📋 Object response, checking nested arrays...');
      
      // Check common response wrapper patterns
      const possibleArrays = [
        { key: 'data', value: rawData.data },
        { key: 'diamonds', value: rawData.diamonds },
        { key: 'stones', value: rawData.stones },
        { key: 'inventory', value: rawData.inventory },
        { key: 'results', value: rawData.results },
        { key: 'items', value: rawData.items }
      ];
      
      for (const { key, value } of possibleArrays) {
        if (Array.isArray(value)) {
          console.log(`📦 InventoryService: ✅ Found array in '${key}' property:`, value.length, 'items');
          dataArray = value;
          break;
        }
      }
      
      if (dataArray.length === 0) {
        console.log('📦 InventoryService: 📋 Available object keys:', Object.keys(rawData));
      }
    }

    if (!Array.isArray(dataArray) || dataArray.length === 0) {
      console.warn('📦 InventoryService: ⚠️ No valid data array found');
      return {
        success: true,
        data: [],
        debugInfo: {
          message: 'No diamonds found in response',
          endpoint,
          rawResponseType: typeof rawData,
          rawResponseKeys: rawData && typeof rawData === 'object' ? Object.keys(rawData) : [],
          timestamp: new Date().toISOString(),
          recommendation: 'Check if the API response format has changed'
        }
      };
    }

    console.log('📦 InventoryService: 🔄 Processing', dataArray.length, 'raw items...');
    
    // Sample the first few items for debugging
    console.log('📦 InventoryService: 📋 Sample raw items:', dataArray.slice(0, 3));

    // Filter and convert valid diamonds
    const validDiamonds = dataArray
      .filter((item, index) => {
        const isValid = this.validateDiamondData(item);
        if (!isValid && index < 5) {
          console.log(`📦 InventoryService: 🚮 Filtered out item ${index}:`, item);
        }
        return isValid;
      })
      .map((item, index) => {
        try {
          return this.convertToStandardFormat(item);
        } catch (conversionError) {
          console.error(`📦 InventoryService: ❌ Conversion error for item ${index}:`, conversionError, item);
          return null;
        }
      })
      .filter(Boolean) as Diamond[];

    console.log('📦 InventoryService: ✅ Processing complete!');
    console.log('📦 InventoryService: 📊 Results:', {
      totalReceived: dataArray.length,
      validDiamonds: validDiamonds.length,
      filteredOut: dataArray.length - validDiamonds.length,
      conversionRate: `${Math.round((validDiamonds.length / dataArray.length) * 100)}%`
    });

    // Sample the converted diamonds
    if (validDiamonds.length > 0) {
      console.log('📦 InventoryService: 💎 Sample converted diamonds:', validDiamonds.slice(0, 2));
    }

    return {
      success: true,
      data: validDiamonds,
      debugInfo: {
        endpoint,
        totalReceived: dataArray.length,
        validDiamonds: validDiamonds.length,
        filteredOut: dataArray.length - validDiamonds.length,
        conversionRate: Math.round((validDiamonds.length / dataArray.length) * 100),
        sampleRawItem: dataArray[0],
        sampleConvertedItem: validDiamonds[0],
        timestamp: new Date().toISOString()
      }
    };
  }
}
