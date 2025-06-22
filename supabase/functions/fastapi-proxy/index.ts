
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { endpoint, method = 'GET', body, userId } = await req.json();
    
    console.log('🔒 FastAPI Proxy: Request Details', { 
      endpoint, 
      method, 
      userId,
      bodySize: body ? JSON.stringify(body).length : 0,
      timestamp: new Date().toISOString()
    });
    
    // Get the secure backend token from Supabase secrets
    const backendToken = Deno.env.get('BACKEND_ACCESS_TOKEN');
    if (!backendToken) {
      console.error('🔒 FastAPI Proxy: BACKEND_ACCESS_TOKEN not found in secrets');
      return new Response(
        JSON.stringify({ 
          error: 'Backend configuration error - missing access token',
          success: false,
          status: 500
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Validate endpoint format
    if (!endpoint || !endpoint.startsWith('/')) {
      console.error('🔒 FastAPI Proxy: Invalid endpoint format:', endpoint);
      return new Response(
        JSON.stringify({ 
          error: 'Invalid endpoint format',
          success: false,
          status: 400
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Construct the full FastAPI URL
    const fastApiUrl = `https://api.mazalbot.com${endpoint}`;
    console.log('🔒 FastAPI Proxy: Calling FastAPI at:', fastApiUrl);

    // Prepare headers for FastAPI request
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${backendToken}`,
      'User-Agent': 'Lovable-FastAPI-Proxy/1.0',
    };

    // Add user context if available
    if (userId) {
      headers['X-User-ID'] = userId.toString();
      headers['X-Telegram-Auth'] = `telegram_verified_${userId}`;
      console.log('🔒 FastAPI Proxy: Added user context for:', userId);
    }

    console.log('🔒 FastAPI Proxy: Request headers (without auth):', {
      'Content-Type': headers['Content-Type'],
      'Accept': headers['Accept'],
      'User-Agent': headers['User-Agent'],
      'X-User-ID': headers['X-User-ID'],
      'X-Telegram-Auth': headers['X-Telegram-Auth'] ? 'present' : 'missing'
    });

    // Make the request to FastAPI
    const fetchOptions: RequestInit = {
      method,
      headers,
    };

    if (body && (method === 'POST' || method === 'PUT')) {
      fetchOptions.body = JSON.stringify(body);
      console.log('🔒 FastAPI Proxy: Request body:', JSON.stringify(body, null, 2));
    }

    const response = await fetch(fastApiUrl, fetchOptions);
    
    console.log('🔒 FastAPI Proxy: Response details:', {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries()),
      url: response.url
    });

    // Get response data
    let responseData;
    const contentType = response.headers.get('content-type');
    
    if (contentType && contentType.includes('application/json')) {
      responseData = await response.json();
      console.log('🔒 FastAPI Proxy: JSON Response data:', JSON.stringify(responseData, null, 2));
    } else {
      responseData = await response.text();
      console.log('🔒 FastAPI Proxy: Text Response data:', responseData);
    }

    // Enhanced error handling for specific status codes
    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      
      if (response.status === 403) {
        errorMessage = 'Access forbidden - check backend token and user permissions';
        console.error('🔒 FastAPI Proxy: 403 Forbidden - Token or permissions issue');
      } else if (response.status === 404) {
        errorMessage = `Endpoint not found: ${endpoint}`;
        console.error('🔒 FastAPI Proxy: 404 Not Found - Check endpoint path');
      } else if (response.status === 401) {
        errorMessage = 'Unauthorized - invalid or expired token';
        console.error('🔒 FastAPI Proxy: 401 Unauthorized - Token issue');
      }

      return new Response(
        JSON.stringify({
          success: false,
          status: response.status,
          error: errorMessage,
          data: responseData,
          endpoint: endpoint,
          method: method
        }),
        {
          status: 200, // Return 200 to frontend but indicate error in response
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Success response
    console.log('🔒 FastAPI Proxy: ✅ Request successful');
    return new Response(
      JSON.stringify({
        success: true,
        status: response.status,
        data: responseData,
        error: null
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('🔒 FastAPI Proxy: ❌ Unexpected error:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error instanceof Error ? error.message : 'Unknown proxy error occurred',
        data: null,
        status: 500
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
})
