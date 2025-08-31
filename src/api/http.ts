
import { getBackendAuthToken } from "@/lib/api/auth";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://api.mazalbot.com";

// Network connectivity cache
let connectivityCache: { isHealthy: boolean; lastChecked: number } | null = null;
const CONNECTIVITY_CACHE_DURATION = 30000; // 30 seconds

// Test backend health with timeout
async function testBackendHealth(): Promise<boolean> {
  // Check cache first
  if (connectivityCache && (Date.now() - connectivityCache.lastChecked < CONNECTIVITY_CACHE_DURATION)) {
    console.log('🔍 HTTP: Using cached backend health status:', connectivityCache.isHealthy);
    return connectivityCache.isHealthy;
  }

  try {
    console.log('🏥 HTTP: Testing FastAPI backend health at:', API_BASE_URL);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);
    
    const response = await fetch(`${API_BASE_URL}/`, {
      method: 'GET',
      mode: 'cors',
      headers: { 'Accept': 'application/json' },
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    
    const isHealthy = response.ok || response.status === 404;
    console.log('🏥 HTTP: Backend health result:', isHealthy, 'Status:', response.status);
    
    // Cache the result
    connectivityCache = { isHealthy, lastChecked: Date.now() };
    return isHealthy;
  } catch (error) {
    console.error('🏥 HTTP: Backend health check failed:', error);
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
    errorDetails.push('Check: Server status, CORS configuration, DNS resolution');
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
      console.log(`🔄 HTTP: Attempt ${attempt + 1}/${maxRetries + 1}`);
      return await requestFn();
    } catch (error) {
      lastError = error;
      console.error(`❌ HTTP: Attempt ${attempt + 1} failed:`, error);
      
      if (attempt < maxRetries) {
        const delay = baseDelay * Math.pow(2, attempt);
        console.log(`⏳ HTTP: Waiting ${delay}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError;
}

export async function http<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  // Check authentication first
  const token = getBackendAuthToken();
  
  if (!token) {
    console.error('❌ HTTP: No JWT token available for:', endpoint);
    throw new Error('אנא התחבר מחדש לאפליקציה');
  }

  // Test backend health first
  const isBackendHealthy = await testBackendHealth();
  if (!isBackendHealthy) {
    console.error('❌ HTTP: Backend is not healthy for:', endpoint);
    throw new Error('השרת אינו זמין כרגע. אנא נסה שוב מאוחר יותר.');
  }

  const config: RequestInit = {
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
      "Accept": "application/json",
      "Origin": window.location.origin,
      "X-Client-Timestamp": Date.now().toString(),
      ...options.headers,
    },
    mode: 'cors',
    credentials: 'omit',
    ...options,
  };

  const fullUrl = `${API_BASE_URL}${endpoint}`;
  console.log('🔑 HTTP: Making authenticated request to:', fullUrl);
  console.log('🔑 HTTP: Request method:', config.method || 'GET');

  const requestFn = async () => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
    try {
      return await fetch(fullUrl, {
        ...config,
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timeoutId);
    }
  };

  try {
    const response = await retryRequest(requestFn, 2, 1000);
    
    console.log('📡 HTTP: Response status:', response.status);
    console.log('📡 HTTP: Response headers:', Object.fromEntries(response.headers.entries()));
    
    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      
      try {
        const errorData = await response.json();
        errorMessage = errorData.detail || errorData.message || errorMessage;
        console.error('❌ HTTP: Server error response:', errorData);
      } catch {
        const errorText = await response.text();
        errorMessage = errorText || errorMessage;
        console.error('❌ HTTP: Server error text:', errorText);
      }
      
      console.error('❌ HTTP: Request failed:', errorMessage);
      throw new Error(errorMessage);
    }
    
    const data = await response.json();
    console.log('✅ HTTP: Request successful');
    return data;
    
  } catch (error) {
    const detailedError = getDetailedError(error);
    console.error('❌ HTTP: Request error:', detailedError);
    
    // Throw user-friendly Hebrew error messages
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new Error('הבקשה נכשלה עקב זמן קצוב. אנא נסה שוב.');
      } else if (error.message.includes('Failed to fetch')) {
        throw new Error('לא ניתן להתחבר לשרת. בדוק את חיבור האינטרנט ונסה שוב.');
      } else if (error.message.includes('CORS')) {
        throw new Error('בעיה בהגדרות השרת. אנא פנה לתמיכה טכנית.');
      } else {
        throw error; // Re-throw as-is for server errors
      }
    }
    
    throw new Error('אירעה שגיאה לא צפויה');
  }
}
