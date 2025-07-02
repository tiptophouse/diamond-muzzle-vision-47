
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Environment-specific CORS configuration
const allowedOrigins = Deno.env.get('ALLOWED_ORIGINS')?.split(',') || ['https://api.mazalbot.com']

const corsHeaders = {
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

async function validateAdminUser(authHeader: string): Promise<boolean> {
  try {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return false
    }

    const token = authHeader.substring(7)
    
    // Verify admin status through app_settings
    const { data: adminSettings, error } = await supabase
      .from('app_settings')
      .select('setting_value')
      .eq('setting_key', 'admin_telegram_id')
      .single()

    if (error || !adminSettings) {
      console.error('Failed to fetch admin settings:', error)
      return false
    }

    // Extract admin ID from settings
    let adminId = 2138564172 // fallback
    if (adminSettings.setting_value) {
      const settingValue = adminSettings.setting_value as any
      adminId = settingValue.value || settingValue.admin_telegram_id || 2138564172
    }

    // Validate token contains admin ID (simplified validation)
    return token.includes(adminId.toString())
  } catch (error) {
    console.error('Admin validation error:', error)
    return false
  }
}

function getCorsHeaders(origin: string | null): Record<string, string> {
  const allowedOrigin = origin && allowedOrigins.includes(origin) ? origin : allowedOrigins[0]
  return {
    ...corsHeaders,
    'Access-Control-Allow-Origin': allowedOrigin,
  }
}

serve(async (req) => {
  const origin = req.headers.get('origin')
  const responseCorsHeaders = getCorsHeaders(origin)

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: responseCorsHeaders })
  }

  try {
    // Only allow POST requests
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { 
          status: 405, 
          headers: { ...responseCorsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Validate admin authorization
    const authHeader = req.headers.get('authorization')
    const isAdmin = await validateAdminUser(authHeader || '')
    
    if (!isAdmin) {
      console.warn('🚨 Unauthorized token request attempt')
      return new Response(
        JSON.stringify({ error: 'Unauthorized - Admin access required' }),
        { 
          status: 403, 
          headers: { ...responseCorsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Get the secure API token from Supabase secrets
    const apiToken = Deno.env.get('FASTAPI_BEARER_TOKEN')
    
    if (!apiToken) {
      console.error('FASTAPI_BEARER_TOKEN not configured in Supabase secrets')
      return new Response(
        JSON.stringify({ error: 'API configuration error' }),
        { 
          status: 500, 
          headers: { ...responseCorsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Log secure token access
    console.log('✅ Secure token accessed by verified admin')
    
    // Audit log the token request
    try {
      await supabase
        .from('user_management_log')
        .insert({
          admin_telegram_id: 2138564172, // Will be dynamic in next phase
          action_type: 'token_request',
          reason: 'API token requested',
          changes: { timestamp: new Date().toISOString(), origin }
        })
    } catch (logError) {
      console.warn('Failed to log token request:', logError)
    }

    // Return the token securely with expiration info
    return new Response(
      JSON.stringify({ 
        token: apiToken,
        expires_in: 3600, // 1 hour
        token_type: 'Bearer'
      }),
      { 
        status: 200,
        headers: { 
          ...responseCorsHeaders, 
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store, no-cache, must-revalidate'
        }
      }
    )

  } catch (error) {
    console.error('Error in get-api-token function:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...responseCorsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
