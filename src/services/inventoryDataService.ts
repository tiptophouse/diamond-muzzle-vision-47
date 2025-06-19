
import { api, apiEndpoints, getCurrentUserId } from "@/lib/api";
import { fetchMockInventoryData } from "./mockInventoryService";
import { diagnoseFastAPIBackend } from "./backendDiagnostics";

export interface FetchInventoryResult {
  data?: any[];
  error?: string;
  debugInfo: any;
}

export async function fetchInventoryData(): Promise<FetchInventoryResult> {
  const userId = getCurrentUserId() || 2138564172;
  
  console.log('🔍 INVENTORY SERVICE: Starting comprehensive inventory fetch for user:', userId);
  
  const debugInfo = { 
    step: 'Starting inventory fetch process', 
    userId, 
    timestamp: new Date().toISOString(),
    dataSource: 'unknown'
  };
  
  try {
    // First, run comprehensive backend diagnostics
    console.log('🔍 INVENTORY SERVICE: Running backend diagnostics...');
    const diagnostics = await diagnoseFastAPIBackend();
    
    console.log('🔍 INVENTORY SERVICE: Diagnostics result:', {
      isReachable: diagnostics.isReachable,
      hasAuth: diagnostics.hasAuth,
      hasData: diagnostics.hasData,
      diamondCount: diagnostics.userDiamondCount,
      recommendations: diagnostics.recommendations
    });

    // If backend is fully operational, fetch real data
    if (diagnostics.isReachable && diagnostics.hasAuth && diagnostics.hasData) {
      console.log('✅ INVENTORY SERVICE: Backend is fully operational, fetching real data...');
      
      const endpoint = apiEndpoints.getAllStones(userId);
      console.log('🔍 INVENTORY SERVICE: Using endpoint:', endpoint);
      
      const result = await api.get(endpoint);
      console.log('🔍 INVENTORY SERVICE: FastAPI response received');
      
      if (result.data && !result.error) {
        let dataArray: any[] = [];
        
        if (Array.isArray(result.data)) {
          dataArray = result.data;
        } else if (typeof result.data === 'object' && result.data !== null) {
          const dataObj = result.data as Record<string, any>;
          const possibleArrayKeys = ['data', 'diamonds', 'items', 'stones', 'results', 'inventory', 'records'];
          
          for (const key of possibleArrayKeys) {
            if (Array.isArray(dataObj[key])) {
              dataArray = dataObj[key];
              console.log('🔍 INVENTORY SERVICE: Found data in key:', key);
              break;
            }
          }
        }
        
        if (dataArray && dataArray.length > 0) {
          console.log('✅ INVENTORY SERVICE: Successfully loaded', dataArray.length, 'diamonds from FastAPI');
          
          // Enhanced data mapping for better compatibility
          const mappedData = dataArray.map(item => ({
            ...item,
            // Ensure all required fields are present
            id: item.id || `${item.stock_number || item.stock}-${Date.now()}-${Math.random()}`,
            stock_number: item.stock_number || item.stock || item.stockNumber,
            // Add user verification
            user_id: item.user_id || userId,
            // Ensure consistent field mapping
            weight: item.weight || item.carat,
            carat: item.carat || item.weight,
          }));
          
          return {
            data: mappedData,
            debugInfo: {
              ...debugInfo,
              step: 'SUCCESS: Real data loaded from FastAPI',
              totalDiamonds: mappedData.length,
              dataSource: 'fastapi',
              backendDiagnostics: diagnostics,
              sampleDiamond: mappedData[0]
            }
          };
        }
      }
    }
    
    // If we reach here, there's an issue with the backend
    console.log('⚠️ INVENTORY SERVICE: Backend issues detected, using fallback strategy');
    
    // Try localStorage as emergency fallback
    const localData = localStorage.getItem('diamond_inventory');
    if (localData) {
      try {
        const parsedData = JSON.parse(localData);
        if (Array.isArray(parsedData) && parsedData.length > 0) {
          const userDiamonds = parsedData.filter(item => 
            !item.user_id || item.user_id === userId
          );
          
          if (userDiamonds.length > 0) {
            console.log('✅ INVENTORY SERVICE: Using localStorage data -', userDiamonds.length, 'diamonds');
            
            return {
              data: userDiamonds,
              debugInfo: {
                ...debugInfo,
                step: 'FALLBACK: localStorage data found',
                totalDiamonds: userDiamonds.length,
                dataSource: 'localStorage',
                backendDiagnostics: diagnostics
              }
            };
          }
        }
      } catch (parseError) {
        console.warn('Failed to parse localStorage data:', parseError);
      }
    }
    
    // Final fallback to mock data with clear indication
    console.log('🔄 INVENTORY SERVICE: Using mock data as final fallback');
    const mockResult = await fetchMockInventoryData();
    
    return {
      ...mockResult,
      error: diagnostics.errorDetails || 'Backend connection issues - showing sample data',
      debugInfo: {
        ...debugInfo,
        ...mockResult.debugInfo,
        step: 'FINAL FALLBACK: Using mock data due to backend issues',
        dataSource: 'mock',
        backendDiagnostics: diagnostics,
        backendIssues: diagnostics.recommendations
      }
    };
    
  } catch (error) {
    console.error("❌ INVENTORY SERVICE: Complete failure:", error);
    
    // Emergency fallback to mock data
    const mockResult = await fetchMockInventoryData();
    return {
      ...mockResult,
      error: `System error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      debugInfo: {
        ...debugInfo,
        step: 'EMERGENCY FALLBACK: System error occurred',
        error: error instanceof Error ? error.message : String(error),
        dataSource: 'mock_emergency'
      }
    };
  }
}
