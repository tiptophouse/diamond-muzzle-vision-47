
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-telegram-user-id',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get FastAPI token from Supabase secrets
    const fastApiToken = Deno.env.get('FASTAPI_BEARER_TOKEN')
    if (!fastApiToken) {
      console.error('FASTAPI_BEARER_TOKEN not configured')
      return new Response(
        JSON.stringify({ error: 'FastAPI token not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Extract Telegram user ID from headers
    const telegramUserId = req.headers.get('x-telegram-user-id')
    if (!telegramUserId) {
      return new Response(
        JSON.stringify({ error: 'Telegram user ID required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Parse request
    const { method, endpoint, body } = await req.json()
    
    console.log(`FastAPI Proxy: ${method} ${endpoint} for user ${telegramUserId}`)

    // Build FastAPI request
    const fastApiUrl = `https://api.mazalbot.com${endpoint}`
    const fastApiHeaders: Record<string, string> = {
      'Authorization': `Bearer ${fastApiToken}`,
      'Content-Type': 'application/json',
      'X-Telegram-User-ID': telegramUserId
    }

    // Make request to FastAPI
    const response = await fetch(fastApiUrl, {
      method,
      headers: fastApiHeaders,
      body: body ? JSON.stringify(body) : undefined
    })

    const responseData = await response.text()
    let parsedData
    
    try {
      parsedData = JSON.parse(responseData)
    } catch {
      parsedData = responseData
    }

    if (!response.ok) {
      console.error(`FastAPI Error: ${response.status} - ${responseData}`)
      return new Response(
        JSON.stringify({ error: `FastAPI Error: ${response.statusText}`, details: parsedData }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log(`FastAPI Success: ${endpoint} for user ${telegramUserId}`)
    
    return new Response(
      JSON.stringify({ success: true, data: parsedData }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('FastAPI Proxy Error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
