import { api, apiEndpoints, getCurrentUserId, resetFallbackFlag } from "@/lib/api";
import { logEnvironmentInfo } from "@/utils/environment";
import { backendHealthService } from "./backendHealthService";

export interface FetchInventoryResult {
  data?: any[];
  error?: string;
  debugInfo: any;
}

export async function fetchInventoryData(): Promise<FetchInventoryResult> {
  const userId = getCurrentUserId() || 2138564172;
  
  // Log environment info for debugging
  logEnvironmentInfo();
  
  console.log('🔍 INVENTORY SERVICE: Starting enhanced fetch with user ID:', userId);
  console.log('🔍 INVENTORY SERVICE: Expected diamonds: 566');
  
  // Check backend health first
  const healthStatus = await backendHealthService.checkBackendHealth();
  console.log('🏥 Backend health status:', healthStatus);
  
  const debugInfo = { 
    step: 'Starting enhanced fetch', 
    userId, 
    expectedCount: 566, 
    timestamp: new Date().toISOString(),
    environment: window.location.hostname,
    backendStatus: 'testing',
    healthStatus: healthStatus,
  };
  
  try {
    console.log('🔍 INVENTORY SERVICE: Using API client to fetch data');
    const endpoint = apiEndpoints.getAllStones(userId);
    console.log('🔍 INVENTORY SERVICE: Endpoint:', endpoint);
    
    const result = await api.get(endpoint);
    
    const updatedDebugInfo = { 
      ...debugInfo,
      step: 'API call completed',
      hasError: !!result.error,
      hasData: !!result.data,
      endpoint: endpoint,
      timestamp: new Date().toISOString(),
      backendStatus: result.error ? 'failed' : 'success',
      recommendedMethod: healthStatus.recommendedMethod,
    };
    
    if (result.error) {
      console.error('🔍 INVENTORY SERVICE: API error:', result.error);
      
      // Provide specific guidance based on error type and health status
      let userFriendlyError = result.error;
      if (result.error.includes('No backend available')) {
        userFriendlyError = `Backend services unavailable. Recommended method: ${healthStatus.recommendedMethod}. FastAPI: ${healthStatus.fastApiAvailable ? 'Available' : 'Unavailable'}`;
      } else if (result.error.includes('Failed to fetch')) {
        userFriendlyError = `Connection failed. Backend health: FastAPI ${healthStatus.fastApiAvailable ? '✅' : '❌'}, Supabase ${healthStatus.supabaseAvailable ? '✅' : '❌'}`;
      } else if (result.error.includes('404')) {
        userFriendlyError = 'API endpoint not found. The backend server may not have the expected endpoints configured.';
      }
      
      // If it's a connection error, try resetting the fallback flag and retry once
      if (result.error.includes('Failed to fetch') || result.error.includes('NetworkError') || result.error.includes('No backend available')) {
        console.log('🔍 INVENTORY SERVICE: Connection error detected, attempting retry...');
        resetFallbackFlag();
        
        try {
          const retryResult = await api.get(endpoint);
          if (!retryResult.error && retryResult.data) {
            console.log('🔍 INVENTORY SERVICE: Retry successful!');
            return {
              data: Array.isArray(retryResult.data) ? retryResult.data : [],
              debugInfo: {
                ...updatedDebugInfo,
                step: 'SUCCESS: Retry worked',
                retryAttempted: true,
                backendStatus: 'success-after-retry',
              }
            };
          }
        } catch (retryError) {
          console.error('🔍 INVENTORY SERVICE: Retry also failed:', retryError);
        }
      }
      
      return {
        data: [],
        error: userFriendlyError,
        debugInfo: {
          ...updatedDebugInfo,
          step: 'API error occurred',
          error: result.error,
          userFriendlyError,
          backendStatus: 'failed',
        }
      };
    }
    
    if (!result.data) {
      console.log('🔍 INVENTORY SERVICE: No data returned from backend');
      return {
        data: [],
        error: `No data returned from backend. Backend method: ${healthStatus.recommendedMethod}`,
        debugInfo: {
          ...updatedDebugInfo,
          step: 'No data returned from backend',
          backendStatus: 'no-data',
        }
      };
    }
    
    // Process the response data with proper type checking
    let dataArray: any[] = [];
    
    if (Array.isArray(result.data)) {
      dataArray = result.data;
    } else if (typeof result.data === 'object' && result.data !== null) {
      // Check for common data structure patterns
      const dataObj = result.data as Record<string, any>;
      if (Array.isArray(dataObj.data)) {
        dataArray = dataObj.data;
      } else if (Array.isArray(dataObj.diamonds)) {
        dataArray = dataObj.diamonds;
      } else if (Array.isArray(dataObj.items)) {
        dataArray = dataObj.items;
      } else if (Array.isArray(dataObj.stones)) {
        dataArray = dataObj.stones;
      }
    }
    
    console.log('🔍 INVENTORY SERVICE: Processing response data:', {
      rawDataType: typeof result.data,
      isArray: Array.isArray(result.data),
      dataArrayLength: dataArray.length,
      expectedLength: 566,
      sampleItem: dataArray[0],
      recommendedMethod: healthStatus.recommendedMethod
    });
    
    if (dataArray && dataArray.length > 0) {
      console.log('🔍 INVENTORY SERVICE: SUCCESS! Processing', dataArray.length, 'diamonds (expected 566)');
      
      return {
        data: dataArray,
        debugInfo: {
          ...updatedDebugInfo,
          step: 'SUCCESS: Data fetched',
          totalDiamonds: dataArray.length,
          expectedDiamonds: 566,
          backendResponse: dataArray.length,
          sampleItem: dataArray[0],
          backendStatus: 'success',
          methodUsed: healthStatus.recommendedMethod,
        }
      };
    } else {
      console.log('🔍 INVENTORY SERVICE: Backend responded but no diamonds found in data');
      console.log('🔍 INVENTORY SERVICE: Response structure:', result.data);
      
      return {
        data: [],
        error: `Backend is working but returned no diamonds. Method: ${healthStatus.recommendedMethod}`,
        debugInfo: {
          ...updatedDebugInfo,
          step: 'Backend responded but no diamonds found',
          responseStructure: result.data && typeof result.data === 'object' ? Object.keys(result.data) : [],
          fullResponse: result.data,
          backendStatus: 'empty-response',
        }
      };
    }
  } catch (error) {
    console.error("🔍 INVENTORY SERVICE: Critical error connecting to backend:", error);
    
    const errorMessage = error instanceof Error ? error.message : String(error);
    let userFriendlyError = errorMessage;
    
    if (errorMessage.includes('Failed to fetch')) {
      userFriendlyError = `Cannot connect to backend. Health status: FastAPI ${healthStatus.fastApiAvailable ? '✅' : '❌'}, Supabase ${healthStatus.supabaseAvailable ? '✅' : '❌'}. Using: ${healthStatus.recommendedMethod}`;
    }
    
    return {
      data: [],
      error: userFriendlyError,
      debugInfo: {
        ...debugInfo,
        step: 'Critical backend connection error',
        error: errorMessage,
        userFriendlyError,
        errorStack: error instanceof Error ? error.stack : undefined,
        backendStatus: 'critical-error',
        healthStatus: healthStatus,
      }
    };
  }
}
