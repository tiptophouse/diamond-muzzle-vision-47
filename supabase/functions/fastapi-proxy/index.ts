
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
    
    console.log('🔒 FastAPI Proxy: === NEW REQUEST ===');
    console.log('🔒 FastAPI Proxy: Request Details:', { 
      endpoint, 
      method, 
      userId,
      bodySize: body ? JSON.stringify(body).length : 0,
      timestamp: new Date().toISOString(),
      userAgent: req.headers.get('user-agent'),
      origin: req.headers.get('origin')
    });
    
    // Get the secure backend token from Supabase secrets
    const backendToken = Deno.env.get('BACKEND_ACCESS_TOKEN');
    if (!backendToken) {
      console.error('🔒 FastAPI Proxy: ❌ CRITICAL: BACKEND_ACCESS_TOKEN not found in secrets');
      console.error('🔒 FastAPI Proxy: Available env vars:', Object.keys(Deno.env.toObject()));
      return new Response(
        JSON.stringify({ 
          error: 'Backend configuration error - missing access token',
          success: false,
          status: 500,
          debugInfo: {
            issue: 'BACKEND_ACCESS_TOKEN not configured in Supabase secrets',
            availableSecrets: Object.keys(Deno.env.toObject()).filter(key => key.includes('TOKEN') || key.includes('KEY'))
          }
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('🔒 FastAPI Proxy: ✅ Backend token found, length:', backendToken.length);

    // Validate endpoint format
    if (!endpoint || !endpoint.startsWith('/')) {
      console.error('🔒 FastAPI Proxy: ❌ Invalid endpoint format:', endpoint);
      return new Response(
        JSON.stringify({ 
          error: 'Invalid endpoint format - must start with /',
          success: false,
          status: 400,
          debugInfo: { providedEndpoint: endpoint }
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Construct the full FastAPI URL
    const fastApiUrl = `https://api.mazalbot.com${endpoint}`;
    console.log('🔒 FastAPI Proxy: 🎯 Target URL:', fastApiUrl);
    console.log('🔒 FastAPI Proxy: 🎯 Expected Response: Diamond inventory data');

    // Prepare headers for FastAPI request
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${backendToken}`,
      'User-Agent': 'Supabase-Edge-Function/1.0',
      'X-Forwarded-For': req.headers.get('x-forwarded-for') || 'unknown',
    };

    // Add user context if available
    if (userId) {
      headers['X-User-ID'] = userId.toString();
      headers['X-Telegram-Auth'] = `telegram_verified_${userId}`;
      console.log('🔒 FastAPI Proxy: 👤 User context added for ID:', userId);
    } else {
      console.warn('🔒 FastAPI Proxy: ⚠️ No user ID provided - API might reject request');
    }

    console.log('🔒 FastAPI Proxy: 📤 Request headers (sanitized):', {
      'Content-Type': headers['Content-Type'],
      'Accept': headers['Accept'],
      'Authorization': headers['Authorization'] ? `Bearer ${headers['Authorization'].substring(7, 15)}...` : 'missing',
      'User-Agent': headers['User-Agent'],
      'X-User-ID': headers['X-User-ID'],
      'X-Telegram-Auth': headers['X-Telegram-Auth'] ? 'present' : 'missing'
    });

    // Prepare fetch options
    const fetchOptions: RequestInit = {
      method,
      headers,
      timeout: 30000, // 30 second timeout
    };

    if (body && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
      fetchOptions.body = JSON.stringify(body);
      console.log('🔒 FastAPI Proxy: 📤 Request body preview:', JSON.stringify(body, null, 2).substring(0, 500));
    }

    console.log('🔒 FastAPI Proxy: 🚀 Making request to FastAPI...');
    const startTime = Date.now();

    // Make the request to FastAPI with timeout handling
    let response: Response;
    try {
      response = await Promise.race([
        fetch(fastApiUrl, fetchOptions),
        new Promise<never>((_, reject) => 
          setTimeout(() => reject(new Error('Request timeout after 30 seconds')), 30000)
        )
      ]);
    } catch (fetchError) {
      const duration = Date.now() - startTime;
      console.error('🔒 FastAPI Proxy: ❌ Network error after', duration, 'ms:', fetchError);
      
      return new Response(
        JSON.stringify({
          success: false,
          status: 0,
          error: `Network error: ${fetchError instanceof Error ? fetchError.message : 'Unknown network failure'}`,
          debugInfo: {
            issue: 'Network connectivity problem',
            targetUrl: fastApiUrl,
            duration: duration,
            possibleCauses: [
              'FastAPI server is down',
              'Network connectivity issues',
              'DNS resolution problems',
              'Firewall blocking requests'
            ]
          }
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const duration = Date.now() - startTime;
    console.log('🔒 FastAPI Proxy: 📥 Response received after', duration, 'ms');
    console.log('🔒 FastAPI Proxy: 📥 Status:', response.status, response.statusText);
    console.log('🔒 FastAPI Proxy: 📥 Headers:', Object.fromEntries(response.headers.entries()));

    // Get response data
    let responseData;
    const contentType = response.headers.get('content-type') || '';
    
    try {
      if (contentType.includes('application/json')) {
        responseData = await response.json();
        console.log('🔒 FastAPI Proxy: 📥 JSON Response preview:', JSON.stringify(responseData, null, 2).substring(0, 1000));
      } else {
        responseData = await response.text();
        console.log('🔒 FastAPI Proxy: 📥 Text Response preview:', responseData.substring(0, 500));
      }
    } catch (parseError) {
      console.error('🔒 FastAPI Proxy: ❌ Failed to parse response:', parseError);
      responseData = `Failed to parse response: ${parseError}`;
    }

    // Enhanced error handling with specific diagnostics
    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      let diagnostics: any = {
        status: response.status,
        statusText: response.statusText,
        endpoint: endpoint,
        fullUrl: fastApiUrl,
        duration: duration,
        headers: Object.fromEntries(response.headers.entries())
      };
      
      if (response.status === 403) {
        errorMessage = 'Access forbidden - invalid or expired backend token';
        diagnostics.issue = 'Authentication failed';
        diagnostics.solution = 'Check BACKEND_ACCESS_TOKEN in Supabase secrets';
        console.error('🔒 FastAPI Proxy: ❌ 403 Forbidden - Token authentication failed');
      } else if (response.status === 404) {
        errorMessage = `Endpoint not found: ${endpoint}`;
        diagnostics.issue = 'API endpoint does not exist';
        diagnostics.possibleEndpoints = [
          '/api/v1/get_all_stones',
          '/get_all_stones',
          '/api/v1/verify-telegram',
          '/api/v1/upload-inventory'
        ];
        console.error('🔒 FastAPI Proxy: ❌ 404 Not Found - Check API endpoint path');
      } else if (response.status === 401) {
        errorMessage = 'Unauthorized - missing or invalid authentication';
        diagnostics.issue = 'Authentication required';
        diagnostics.solution = 'Verify Authorization header and user context';
        console.error('🔒 FastAPI Proxy: ❌ 401 Unauthorized - Authentication issue');
      } else if (response.status === 500) {
        errorMessage = 'Internal server error on FastAPI backend';
        diagnostics.issue = 'Backend server error';
        diagnostics.solution = 'Check FastAPI server logs';
        console.error('🔒 FastAPI Proxy: ❌ 500 Internal Server Error - Backend issue');
      } else if (response.status === 422) {
        errorMessage = 'Validation error - invalid request data';
        diagnostics.issue = 'Request validation failed';
        diagnostics.solution = 'Check request parameters and body format';
        console.error('🔒 FastAPI Proxy: ❌ 422 Validation Error - Invalid request data');
      }

      return new Response(
        JSON.stringify({
          success: false,
          status: response.status,
          error: errorMessage,
          data: responseData,
          debugInfo: diagnostics
        }),
        {
          status: 200, // Return 200 to frontend but indicate error in response
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Success response
    console.log('🔒 FastAPI Proxy: ✅ Request successful!');
    console.log('🔒 FastAPI Proxy: ✅ Response time:', duration, 'ms');
    
    return new Response(
      JSON.stringify({
        success: true,
        status: response.status,
        data: responseData,
        error: null,
        debugInfo: {
          duration: duration,
          endpoint: endpoint,
          dataPreview: Array.isArray(responseData) ? `Array with ${responseData.length} items` : typeof responseData
        }
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('🔒 FastAPI Proxy: ❌ CRITICAL ERROR:', error);
    console.error('🔒 FastAPI Proxy: ❌ Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error instanceof Error ? error.message : 'Unknown proxy error occurred',
        data: null,
        status: 500,
        debugInfo: {
          type: 'Critical proxy error',
          error: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined,
          timestamp: new Date().toISOString()
        }
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
})
