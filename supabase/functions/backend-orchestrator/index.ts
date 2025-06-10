
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE',
}

const BACKEND_CONFIG = {
  API_URL: 'https://api.mazalbot.com',
  ACCESS_TOKEN: 'ifj9ov1rh20fslfp',
  MAKE_WEBHOOK_URL: 'https://hook.eu1.make.com/pe4zsmm82vt5fglrahnm5rtyc6kkakaj',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { action, data, userId } = await req.json()
    console.log(`🔄 Backend Orchestrator: ${action}`, { userId, data })

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    switch (action) {
      case 'sync_inventory':
        return await syncInventory(userId)
      
      case 'create_diamond':
        return await createDiamond(data, userId)
      
      case 'trigger_webhook':
        return await triggerWebhook(data.event, data.payload)
      
      case 'health_check':
        return await healthCheck()
      
      default:
        throw new Error(`Unknown action: ${action}`)
    }

  } catch (error) {
    console.error('❌ Orchestrator error:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})

async function syncInventory(userId: number) {
  console.log(`🔄 Syncing inventory for user: ${userId}`)
  
  const response = await fetch(`${BACKEND_CONFIG.API_URL}/api/v1/get_all_stones?user_id=${userId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${BACKEND_CONFIG.ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) {
    throw new Error(`Backend API error: ${response.status}`)
  }

  const diamonds = await response.json()
  
  // Trigger webhook for sync completion
  await triggerWebhook('inventory_synced', {
    user_id: userId,
    count: diamonds.length,
    timestamp: new Date().toISOString()
  })

  return new Response(
    JSON.stringify({ 
      success: true, 
      data: diamonds,
      count: diamonds.length 
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function createDiamond(diamondData: any, userId: number) {
  console.log(`💎 Creating diamond for user: ${userId}`, diamondData)
  
  const response = await fetch(`${BACKEND_CONFIG.API_URL}/api/v1/upload-inventory`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${BACKEND_CONFIG.ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      user_id: userId,
      diamonds: [diamondData]
    }),
  })

  if (!response.ok) {
    throw new Error(`Failed to create diamond: ${response.status}`)
  }

  const result = await response.json()
  
  // Trigger webhook for diamond creation
  await triggerWebhook('diamond_created', {
    user_id: userId,
    diamond: diamondData,
    timestamp: new Date().toISOString()
  })

  return new Response(
    JSON.stringify({ 
      success: true, 
      data: result 
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function triggerWebhook(event: string, payload: any) {
  console.log(`🔗 Triggering webhook: ${event}`, payload)
  
  try {
    await fetch(BACKEND_CONFIG.MAKE_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event,
        timestamp: new Date().toISOString(),
        payload
      }),
    })
    
    console.log(`✅ Webhook triggered: ${event}`)
  } catch (error) {
    console.warn(`⚠️ Webhook failed: ${error}`)
  }

  return new Response(
    JSON.stringify({ 
      success: true, 
      webhook_triggered: true 
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function healthCheck() {
  try {
    const response = await fetch(`${BACKEND_CONFIG.API_URL}/api/v1/health`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${BACKEND_CONFIG.ACCESS_TOKEN}`,
      },
    })

    const isHealthy = response.ok
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        backend_healthy: isHealthy,
        status: isHealthy ? 'connected' : 'error',
        timestamp: new Date().toISOString()
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ 
        success: false, 
        backend_healthy: false,
        status: 'error',
        error: error.message,
        timestamp: new Date().toISOString()
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
}
