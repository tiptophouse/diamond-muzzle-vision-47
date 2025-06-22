
import { api, apiEndpoints, getCurrentUserId, setCurrentUserId } from "@/lib/api";
import { fetchMockInventoryData } from "./mockInventoryService";
import { toast } from "@/components/ui/use-toast";

export interface EnhancedFetchResult {
  data?: any[];
  error?: string;
  debugInfo: any;
  dataSource: 'fastapi' | 'localStorage' | 'mock';
  diagnostics: string[];
}

const ADMIN_USER_ID = 2138564172;

export async function fetchEnhancedInventoryData(): Promise<EnhancedFetchResult> {
  const diagnostics: string[] = [];
  
  // STEP 1: Force admin user ID
  let userId = getCurrentUserId();
  if (userId !== ADMIN_USER_ID) {
    console.log('🔧 ENHANCED SERVICE: Setting admin user ID:', ADMIN_USER_ID);
    setCurrentUserId(ADMIN_USER_ID);
    userId = ADMIN_USER_ID;
    diagnostics.push(`Forced admin user ID: ${ADMIN_USER_ID}`);
  }
  
  console.log('🔍 ENHANCED SERVICE: Starting enhanced fetch for admin user:', userId);
  
  const debugInfo = { 
    step: 'Enhanced inventory fetch initiated', 
    userId, 
    timestamp: new Date().toISOString(),
    adminMode: true
  };
  
  // STEP 2: Try FastAPI with detailed error handling
  try {
    console.log('🔍 ENHANCED SERVICE: Attempting FastAPI connection...');
    diagnostics.push('Attempting FastAPI connection...');
    
    const endpoint = apiEndpoints.getAllStones(userId);
    console.log('🔍 ENHANCED SERVICE: Using endpoint:', endpoint);
    diagnostics.push(`Using endpoint: ${endpoint}`);
    
    const result = await api.get(endpoint);
    
    if (result.data && !result.error) {
      let dataArray: any[] = [];
      
      // Handle different response formats
      if (Array.isArray(result.data)) {
        dataArray = result.data;
        diagnostics.push(`Direct array response: ${dataArray.length} items`);
      } else if (typeof result.data === 'object' && result.data !== null) {
        const dataObj = result.data as Record<string, any>;
        const possibleArrayKeys = ['data', 'diamonds', 'items', 'stones', 'results', 'inventory', 'records'];
        
        for (const key of possibleArrayKeys) {
          if (Array.isArray(dataObj[key])) {
            dataArray = dataObj[key];
            diagnostics.push(`Found array in ${key}: ${dataArray.length} items`);
            break;
          }
        }
      }
      
      if (dataArray && dataArray.length > 0) {
        console.log('✅ ENHANCED SERVICE: FastAPI SUCCESS -', dataArray.length, 'diamonds loaded');
        diagnostics.push(`SUCCESS: ${dataArray.length} diamonds from FastAPI`);
        
        // Show success toast
        if (dataArray.length >= 100) {
          toast({
            title: "🎉 Real Data Loaded!",
            description: `Successfully loaded ${dataArray.length} diamonds from your FastAPI backend!`,
          });
        }
        
        return {
          data: dataArray,
          dataSource: 'fastapi',
          diagnostics,
          debugInfo: {
            ...debugInfo,
            step: 'SUCCESS: FastAPI data loaded',
            totalDiamonds: dataArray.length,
            sampleDiamond: dataArray[0]
          }
        };
      } else {
        diagnostics.push('FastAPI returned empty data');
        console.warn('⚠️ ENHANCED SERVICE: FastAPI returned empty data');
      }
    } else {
      diagnostics.push(`FastAPI error: ${result.error}`);
      console.error('❌ ENHANCED SERVICE: FastAPI error:', result.error);
    }
    
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    diagnostics.push(`FastAPI exception: ${errorMsg}`);
    console.error("❌ ENHANCED SERVICE: FastAPI exception:", error);
    
    // Show specific error toast
    toast({
      title: "❌ FastAPI Connection Failed",
      description: `Cannot connect to your backend: ${errorMsg}. Using fallback data.`,
      variant: "destructive",
    });
  }
  
  // STEP 3: Try localStorage as backup
  console.log('🔄 ENHANCED SERVICE: Trying localStorage backup...');
  diagnostics.push('Trying localStorage backup...');
  
  try {
    const localData = localStorage.getItem('diamond_inventory');
    if (localData) {
      const parsedData = JSON.parse(localData);
      if (Array.isArray(parsedData) && parsedData.length > 0) {
        const userDiamonds = parsedData.filter(item => 
          !item.user_id || item.user_id === userId
        );
        
        if (userDiamonds.length > 0) {
          console.log('✅ ENHANCED SERVICE: localStorage backup found:', userDiamonds.length, 'diamonds');
          diagnostics.push(`localStorage backup: ${userDiamonds.length} diamonds`);
          
          return {
            data: userDiamonds,
            dataSource: 'localStorage',
            diagnostics,
            debugInfo: {
              ...debugInfo,
              step: 'SUCCESS: localStorage backup used',
              totalDiamonds: userDiamonds.length
            }
          };
        }
      }
    }
    diagnostics.push('No valid localStorage backup found');
  } catch (parseError) {
    diagnostics.push(`localStorage parse error: ${parseError}`);
    console.warn('localStorage parse failed:', parseError);
  }
  
  // STEP 4: Final fallback to mock data with clear warning
  console.warn('⚠️ ENHANCED SERVICE: Using mock data fallback - your 500 real diamonds are not accessible');
  diagnostics.push('FALLBACK: Using mock data - real diamonds not accessible');
  
  toast({
    title: "⚠️ Using Sample Data",
    description: "Your real diamond inventory is not accessible. Showing sample data while we troubleshoot.",
    variant: "destructive",
  });
  
  const mockResult = await fetchMockInventoryData();
  
  return {
    ...mockResult,
    dataSource: 'mock',
    diagnostics,
    debugInfo: {
      ...debugInfo,
      ...mockResult.debugInfo,
      step: 'FALLBACK: Mock data used due to all failures'
    }
  };
}
