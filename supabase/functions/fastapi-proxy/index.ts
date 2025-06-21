
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
    
    console.log('🔒 FastAPI Proxy: Handling request', { endpoint, method, userId });
    
    // Get the secure backend token from Supabase secrets
    const backendToken = Deno.env.get('BACKEND_ACCESS_TOKEN');
    if (!backendToken) {
      console.error('🔒 FastAPI Proxy: Backend token not configured');
      return new Response(
        JSON.stringify({ error: 'Backend configuration error' }),
        { 
          status: 500, 
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
    };

    // Add Telegram auth if available
    if (userId) {
      headers['X-Telegram-Auth'] = `telegram_verified_${userId}`;
    }

    // Make the request to FastAPI
    const fetchOptions: RequestInit = {
      method,
      headers,
    };

    if (body && (method === 'POST' || method === 'PUT')) {
      fetchOptions.body = JSON.stringify(body);
    }

    const response = await fetch(fastApiUrl, fetchOptions);
    
    console.log('🔒 FastAPI Proxy: FastAPI response status:', response.status);

    // Get response data
    let responseData;
    const contentType = response.headers.get('content-type');
    
    if (contentType && contentType.includes('application/json')) {
      responseData = await response.json();
    } else {
      responseData = await response.text();
    }

    console.log('🔒 FastAPI Proxy: Response data type:', typeof responseData);

    // Return the response
    return new Response(
      JSON.stringify({
        success: response.ok,
        status: response.status,
        data: responseData,
        error: response.ok ? null : responseData
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('🔒 FastAPI Proxy: Error:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        data: null
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
})
