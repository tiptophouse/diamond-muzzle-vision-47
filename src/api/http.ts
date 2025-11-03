import { getBackendAuthToken } from "@/lib/api/auth";
import { toast } from "@/components/ui/use-toast";
import { API_BASE_URL } from "@/lib/api/config";

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
    
    const response = await fetch(`${API_BASE_URL}/api/v1/alive`, {
      method: 'GET',
      mode: 'cors',
      headers: { 'Accept': 'application/json' },
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    
    const isHealthy = response.ok;
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

export async function http<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const fullUrl = `${API_BASE_URL}${endpoint}`;
  const method = options.method || 'GET';
  
  console.log('🔑 HTTP: Making request to:', fullUrl, 'Method:', method);

  // Check authentication for protected endpoints (most endpoints require auth according to OpenAPI spec)
  const token = getBackendAuthToken();
  
  if (!token && !endpoint.includes('/api/v1/sign-in/')) {
    console.error('❌ HTTP: No JWT token available for protected endpoint:', endpoint);
    const error = new Error('נדרש אימות. אנא התחבר מחדש לאפליקציה');
    
    toast({
      title: "🔐 Authentication Required",
      description: "אנא התחבר מחדש לאפליקציה",
      variant: "destructive",
    });
    
    throw error;
  }

  // Test backend health for non-auth requests
  if (!endpoint.includes('/api/v1/sign-in/')) {
    const isBackendHealthy = await testBackendHealth();
    if (!isBackendHealthy) {
      console.error('❌ HTTP: Backend is not healthy for:', endpoint);
      
      toast({
        title: "🔌 Server Offline",
        description: "השרת אינו זמין כרגע. אנא נסה שוב מאוחר יותר.",
        variant: "destructive",
      });
      
      throw new Error('השרת אינו זמין כרגע. אנא נסה שוב מאוחר יותר.');
    }
  }

  const config: RequestInit = {
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json",
      "Origin": window.location.origin,
      "X-Client-Timestamp": Date.now().toString(),
      ...(token && { "Authorization": `Bearer ${token}` }),
      ...options.headers,
    },
    mode: 'cors',
    credentials: 'omit',
    ...options,
  };

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
    const response = await requestFn();
    
    console.log('📡 HTTP: Response status:', response.status);
    
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
      
      // Handle 401 Unauthorized - Session expired
      if (response.status === 401 && !endpoint.includes('/api/v1/sign-in/')) {
        toast({
          title: "🔐 Session Expired",
          description: "אנא התחבר מחדש | Please sign in again",
          variant: "destructive",
        });
        
        // Clear the invalid token (attempt to clear from localStorage)
        try {
          localStorage.removeItem('backend_auth_token');
        } catch (e) {
          console.error('Failed to clear auth token:', e);
        }
        
        // Auto-reload after 2 seconds
        setTimeout(() => {
          window.location.reload();
        }, 2000);
        
        throw new Error('Session expired');
      }
      
      // Show specific error messages for different operations
      if (method === 'DELETE') {
        toast({
          title: "❌ Deletion Failed",
          description: `לא ניתן למחוק את הפריט: ${errorMessage}`,
          variant: "destructive",
        });
      } else if (method === 'POST') {
        toast({
          title: "❌ Creation Failed", 
          description: `לא ניתן ליצור את הפריט: ${errorMessage}`,
          variant: "destructive",
        });
      } else {
        toast({
          title: "❌ Request Failed",
          description: errorMessage,
          variant: "destructive",
        });
      }
      
      throw new Error(errorMessage);
    }
    
    const contentType = response.headers.get('content-type') || '';
    const contentLength = response.headers.get('content-length');
    let data: any = null;

    // Gracefully handle 201/204 or empty bodies
    if (response.status === 204 || contentLength === '0') {
      data = {};
    } else if (contentType.includes('application/json')) {
      try {
        data = await response.json();
      } catch {
        // If server returned no JSON body, treat as success with empty object
        data = {};
      }
    } else {
      const text = await response.text();
      data = text ? { message: text } : {};
    }
    
    // Show success messages for write operations
    if (method === 'DELETE') {
      console.log('✅ HTTP: Delete successful');
      toast({
        title: "✅ נמחק בהצלחה",
        description: "הפריט נמחק מהמערכת",
        variant: "default",
      });
    } else if (method === 'POST') {
      console.log('✅ HTTP: Create successful');
      toast({
        title: "✅ נוסף בהצלחה",
        description: "הפריט נוסף למערכת",
        variant: "default",
      });
    } else if (method === 'PUT') {
      console.log('✅ HTTP: Update successful');
      toast({
        title: "✅ עודכן בהצלחה",
        description: "הפריט עודכן במערכת",
        variant: "default",
      });
    }
    
    console.log('✅ HTTP: Request successful');
    return data;
    
  } catch (error) {
    const detailedError = getDetailedError(error);
    console.error('❌ HTTP: Request error:', detailedError);
    
    // Show user-friendly error messages
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        toast({
          title: "⏱️ Timeout",
          description: "הבקשה נכשלה עקב זמן קצוב. אנא נסה שוב.",
          variant: "destructive",
        });
        throw new Error('הבקשה נכשלה עקב זמן קצוב. אנא נסה שוב.');
      } else if (error.message.includes('Failed to fetch')) {
        toast({
          title: "🌐 Connection Error",
          description: "לא ניתן להתחבר לשרת. בדוק את חיבור האינטרנט ונסה שוב.",
          variant: "destructive",
        });
        throw new Error('לא ניתן להתחבר לשרת. בדוק את חיבור האינטרנט ונסה שוב.');
      } else {
        throw error; // Re-throw server errors as-is
      }
    }
    
    throw new Error('אירעה שגיאה לא צפויה');
  }
}
