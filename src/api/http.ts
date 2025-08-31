
import { getBackendAuthToken } from "@/lib/api/auth";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://api.mazalbot.com";

// Network connectivity cache
let connectivityCache: { isHealthy: boolean; lastChecked: number } | null = null;
const CONNECTIVITY_CACHE_DURATION = 30000; // 30 seconds

// Test backend health with timeout
async function testBackendHealth(): Promise<boolean> {
  // Check cache first
  if (connectivityCache && (Date.now() - connectivityCache.lastChecked < CONNECTIVITY_CACHE_DURATION)) {
    console.log('🔍 Using cached backend health status:', connectivityCache.isHealthy);
    return connectivityCache.isHealthy;
  }

  try {
    console.log('🏥 Testing FastAPI backend health at:', API_BASE_URL);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout
    
    const response = await fetch(`${API_BASE_URL}/`, {
      method: 'GET',
      mode: 'cors',
      headers: {
        'Accept': 'application/json',
      },
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    
    const isHealthy = response.ok || response.status === 404; // 404 is fine, means server is reachable
    console.log('🏥 Backend health check result:', isHealthy, 'Status:', response.status);
    
    // Cache the result
    connectivityCache = { isHealthy, lastChecked: Date.now() };
    
    return isHealthy;
  } catch (error) {
    console.error('🏥 Backend health check failed:', error);
    connectivityCache = { isHealthy: false, lastChecked: Date.now() };
    return false;
  }
}

// Enhanced error details extraction
function getDetailedError(error: any, response?: Response): string {
  let errorDetails = [];
  
  if (error.name === 'AbortError') {
    errorDetails.push('Request timeout (server took too long to respond)');
  } else if (error.message?.includes('Failed to fetch')) {
    errorDetails.push('Network connection failed');
    errorDetails.push('Possible causes: Server is down, CORS issue, or DNS problem');
  } else if (error.message?.includes('NetworkError')) {
    errorDetails.push('Network error occurred');
  } else if (error.message) {
    errorDetails.push(`Error: ${error.message}`);
  }
  
  if (response) {
    errorDetails.push(`HTTP Status: ${response.status} ${response.statusText}`);
  }
  
  return errorDetails.join(' | ');
}

// Retry mechanism with exponential backoff
async function retryRequest<T>(
  requestFn: () => Promise<Response>,
  maxRetries: number = 2,
  baseDelay: number = 1000
): Promise<Response> {
  let lastError: any;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🔄 Attempt ${attempt + 1}/${maxRetries + 1} for request`);
      return await requestFn();
    } catch (error) {
      lastError = error;
      console.error(`❌ Attempt ${attempt + 1} failed:`, error);
      
      if (attempt < maxRetries) {
        const delay = baseDelay * Math.pow(2, attempt);
        console.log(`⏳ Waiting ${delay}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError;
}

export async function http<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getBackendAuthToken();
  
  if (!token) {
    console.error('❌ No JWT token available for API call:', endpoint);
    throw new Error('לא ניתן להתחבר - נדרש טוקן אימות');
  }
  
  // Test backend health first
  const isBackendHealthy = await testBackendHealth();
  if (!isBackendHealthy) {
    throw new Error('השרת אינו זמין כרגע. אנא נסה שוב מאוחר יותר.');
  }
  
  const config: RequestInit = {
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
      "Accept": "application/json",
      "Origin": window.location.origin,
      ...options.headers,
    },
    mode: 'cors',
    credentials: 'omit',
    ...options,
  };

  console.log('🔑 Making authenticated API call to:', `${API_BASE_URL}${endpoint}`);
  console.log('🔑 Request headers:', Object.keys(config.headers || {}));

  const requestFn = async () => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
    try {
      return await fetch(`${API_BASE_URL}${endpoint}`, {
        ...config,
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timeoutId);
    }
  };

  try {
    const response = await retryRequest(requestFn, 2, 1000);
    
    console.log('📡 Response status:', response.status);
    console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()));
    
    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      
      try {
        const errorData = await response.json();
        errorMessage = errorData.detail || errorData.message || errorMessage;
      } catch {
        const errorText = await response.text();
        errorMessage = errorText || errorMessage;
      }
      
      console.error('❌ API request failed:', errorMessage);
      throw new Error(errorMessage);
    }
    
    const data = await response.json();
    console.log('✅ API request successful');
    return data;
    
  } catch (error) {
    const detailedError = getDetailedError(error);
    console.error('❌ API request error:', detailedError);
    
    // Throw user-friendly Hebrew error messages
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new Error('הבקשה נכשלה עקב זמן קצוב. אנא נסה שוב.');
      } else if (error.message.includes('Failed to fetch')) {
        throw new Error('לא ניתן להתחבר לשרת. בדוק את חיבור האינטרנט ונסה שוב.');
      } else if (error.message.includes('CORS')) {
        throw new Error('בעיה בהגדרות השרת. אנא פנה לתמיכה טכנית.');
      } else {
        throw new Error(error.message || 'אירעה שגיאה לא צפויה');
      }
    }
    
    throw new Error('אירעה שגיאה לא צפויה');
  }
}
