import { API_BASE_URL } from './config';
import { apiEndpoints } from './endpoints';
import { getBackendAccessToken } from './secureConfig';
import { validateApiRequest, logSecurityEvent, createSecurityHeaders } from './securityUtils';
import { checkRateLimit, createRateLimitHeaders } from './rateLimiter';

interface SecureApiOptions {
  userId: number;
  endpoint: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: any;
  timeout?: number;
}

interface SecureApiResponse<T = any> {
  data?: T;
  error?: string;
  status: number;
  rateLimitInfo?: {
    remaining: number;
    resetTime: number | null;
  };
}

export async function secureApiRequest<T = any>({
  userId,
  endpoint,
  method = 'GET',
  body,
  timeout = 10000
}: SecureApiOptions): Promise<SecureApiResponse<T>> {
  // Security validation
  const validation = validateApiRequest(userId, endpoint);
  if (!validation.allowed) {
    logSecurityEvent('api_request_blocked', userId, { endpoint, reason: validation.reason });
    return {
      status: 429,
      error: validation.reason || 'Request blocked'
    };
  }

  // Rate limiting
  const rateLimit = checkRateLimit('api', userId.toString(), endpoint);
  if (!rateLimit.allowed) {
    logSecurityEvent('rate_limit_exceeded', userId, { endpoint });
    return {
      status: 429,
      error: 'Rate limit exceeded',
      rateLimitInfo: {
        remaining: rateLimit.remaining,
        resetTime: rateLimit.resetTime
      }
    };
  }

  try {
    // Get secure backend token
    const backendToken = await getBackendAccessToken();
    if (!backendToken) {
      logSecurityEvent('token_unavailable', userId, { endpoint });
      return {
        status: 401,
        error: 'Authentication token unavailable'
      };
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${backendToken}`,
      'X-User-ID': userId.toString(),
      'X-Client-Timestamp': Date.now().toString(),
      'X-Client-Version': '2.0.0',
      ...createSecurityHeaders(),
      ...createRateLimitHeaders(rateLimit.remaining, rateLimit.resetTime)
    };

    const requestOptions: RequestInit = {
      method,
      headers,
      signal: controller.signal,
      mode: 'cors',
      credentials: 'omit' // Don't send cookies for security
    };

    if (body && method !== 'GET') {
      requestOptions.body = JSON.stringify(body);
    }

    console.log(`🔐 Secure API request: ${method} ${endpoint}`);
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, requestOptions);
    
    clearTimeout(timeoutId);

    const responseData = await response.json();

    if (!response.ok) {
      logSecurityEvent('api_error', userId, { 
        endpoint, 
        status: response.status, 
        error: responseData 
      });
      
      return {
        status: response.status,
        error: responseData.error || `Request failed with status ${response.status}`,
        rateLimitInfo: {
          remaining: rateLimit.remaining,
          resetTime: rateLimit.resetTime
        }
      };
    }

    console.log(`✅ Secure API request successful: ${endpoint}`);
    
    return {
      data: responseData,
      status: response.status,
      rateLimitInfo: {
        remaining: rateLimit.remaining,
        resetTime: rateLimit.resetTime
      }
    };

  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      logSecurityEvent('api_timeout', userId, { endpoint, timeout });
      return {
        status: 408,
        error: 'Request timeout'
      };
    }

    logSecurityEvent('api_request_failed', userId, { 
      endpoint, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });

    console.error(`❌ Secure API request failed: ${endpoint}`, error);
    
    return {
      status: 500,
      error: 'Network error or server unavailable'
    };
  }
}

// Specialized secure functions for different operations
export const secureApi = {
  // Stone management
  async getAllStones(userId: number) {
    return secureApiRequest({
      userId,
      endpoint: apiEndpoints.getAllStones(userId),
      method: 'GET'
    });
  },

  async addStone(userId: number, stoneData: any) {
    return secureApiRequest({
      userId,
      endpoint: apiEndpoints.addIndividualStone(),
      method: 'POST',
      body: { ...stoneData, user_id: userId }
    });
  },

  async deleteStone(userId: number, stoneId: string, diamondId: number) {
    const rateLimit = checkRateLimit('api', userId.toString(), 'delete_stone');
    if (!rateLimit.allowed) {
      return {
        status: 429,
        error: 'Too many deletion attempts. Please wait.',
        rateLimitInfo: {
          remaining: rateLimit.remaining,
          resetTime: rateLimit.resetTime
        }
      };
    }

    return secureApiRequest({
      userId,
      endpoint: apiEndpoints.deleteStone(stoneId, diamondId),
      method: 'DELETE'
    });
  },

  async updateStone(userId: number, stoneId: string, updateData: any) {
    return secureApiRequest({
      userId,
      endpoint: apiEndpoints.updateStone(stoneId),
      method: 'PUT',
      body: updateData
    });
  },

  // Admin operations (require additional validation)
  async adminOperation(userId: number, operation: string, data?: any) {
    // Additional admin validation would go here
    const rateLimit = checkRateLimit('admin', userId.toString(), operation);
    if (!rateLimit.allowed) {
      return {
        status: 429,
        error: 'Admin rate limit exceeded',
        rateLimitInfo: {
          remaining: rateLimit.remaining,
          resetTime: rateLimit.resetTime
        }
      };
    }

    logSecurityEvent('admin_operation_attempt', userId, { operation, data });
    
    return secureApiRequest({
      userId,
      endpoint: `/api/v1/admin/${operation}`,
      method: 'POST',
      body: data
    });
  }
};