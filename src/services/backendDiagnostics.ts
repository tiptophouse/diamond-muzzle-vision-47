
import { API_BASE_URL, getCurrentUserId } from "@/lib/api";
import { getBackendAccessToken } from "@/lib/api/secureConfig";

export interface BackendDiagnosticResult {
  isReachable: boolean;
  hasAuth: boolean;
  hasData: boolean;
  userDiamondCount: number;
  errorDetails?: string;
  recommendations: string[];
}

export async function diagnoseFastAPIBackend(): Promise<BackendDiagnosticResult> {
  const userId = getCurrentUserId();
  const result: BackendDiagnosticResult = {
    isReachable: false,
    hasAuth: false,
    hasData: false,
    userDiamondCount: 0,
    recommendations: []
  };

  console.log('🔍 DIAGNOSTICS: Starting FastAPI backend diagnosis...');
  console.log('🔍 DIAGNOSTICS: Backend URL:', API_BASE_URL);
  console.log('🔍 DIAGNOSTICS: User ID:', userId);

  try {
    // Step 1: Test basic connectivity
    console.log('🔍 DIAGNOSTICS: Testing basic connectivity...');
    const connectResponse = await fetch(`${API_BASE_URL}/`, {
      method: 'GET',
      mode: 'cors',
    });
    
    if (connectResponse.ok || connectResponse.status === 404) {
      result.isReachable = true;
      console.log('✅ DIAGNOSTICS: Backend is reachable');
    } else {
      result.errorDetails = `Connection failed with status: ${connectResponse.status}`;
      result.recommendations.push('Check if your FastAPI server is running and accessible');
      return result;
    }

    // Step 2: Test authentication
    console.log('🔍 DIAGNOSTICS: Testing authentication...');
    const backendToken = await getBackendAccessToken();
    
    if (backendToken) {
      result.hasAuth = true;
      console.log('✅ DIAGNOSTICS: Backend authentication token available');
    } else {
      result.recommendations.push('Configure BACKEND_ACCESS_TOKEN or FASTAPI_BEARER_TOKEN in project settings');
      return result;
    }

    // Step 3: Test data endpoint
    if (userId && result.hasAuth) {
      console.log('🔍 DIAGNOSTICS: Testing data endpoint...');
      const dataResponse = await fetch(`${API_BASE_URL}/api/v1/get_all_stones?user_id=${userId}`, {
        method: 'GET',
        mode: 'cors',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${backendToken}`,
        },
      });

      if (dataResponse.ok) {
        const data = await dataResponse.json();
        result.hasData = true;
        
        if (Array.isArray(data)) {
          result.userDiamondCount = data.length;
        } else if (data && typeof data === 'object') {
          // Check common array properties
          const possibleArrays = ['data', 'diamonds', 'items', 'stones', 'results'];
          for (const key of possibleArrays) {
            if (Array.isArray(data[key])) {
              result.userDiamondCount = data[key].length;
              break;
            }
          }
        }
        
        console.log('✅ DIAGNOSTICS: Data endpoint working, found', result.userDiamondCount, 'diamonds');
      } else {
        result.errorDetails = `Data endpoint failed with status: ${dataResponse.status}`;
        result.recommendations.push('Check your database connection and ensure diamonds exist for your user ID');
      }
    }

    // Generate recommendations
    if (!result.hasData && result.userDiamondCount === 0) {
      result.recommendations.push('Your database appears to be empty - upload diamonds to see them here');
    }
    
    if (result.userDiamondCount < 50) {
      result.recommendations.push('Expected 500+ diamonds but found fewer - verify your database contains all your inventory');
    }

  } catch (error) {
    console.error('❌ DIAGNOSTICS: Backend diagnosis failed:', error);
    result.errorDetails = error instanceof Error ? error.message : 'Unknown error';
    result.recommendations.push('Check network connectivity and backend server status');
  }

  return result;
}
