
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('🔑 Getting FastAPI backend access token...')
    
    // Get the backend access token from Supabase secrets
    const backendToken = Deno.env.get('FASTAPI_BEARER_TOKEN')
    
    if (!backendToken) {
      console.error('❌ FASTAPI_BEARER_TOKEN not found in secrets')
      throw new Error('Backend access token not configured')
    }
    
    console.log('✅ FastAPI backend token retrieved successfully')
    
    return new Response(
      JSON.stringify({ 
        token: backendToken,
        success: true 
      }),
      {
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        },
      },
    )
  } catch (error) {
    console.error('❌ Error getting backend token:', error)
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }),
      {
        status: 500,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        },
      },
    )
  }
})
