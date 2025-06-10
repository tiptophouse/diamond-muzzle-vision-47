
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { action, diamond_id, user_id, updates } = await req.json()
    
    // Get backend configuration from secrets
    const backendToken = Deno.env.get('BACKEND_ACCESS_TOKEN')
    const backendUrl = Deno.env.get('BACKEND_URL') || 'https://api.mazalbot.com'
    
    if (!backendToken) {
      console.error('Backend access token not configured')
      return new Response(
        JSON.stringify({ error: 'Backend access token not configured' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    console.log(`🔧 CRUD operation: ${action} for diamond ${diamond_id}`)

    let result = { success: false }

    switch (action) {
      case 'soft_delete':
        // Call external API for soft delete
        const archiveResponse = await fetch(`${backendUrl}/api/v1/archive`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${backendToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            diamond_id: diamond_id,
            user_id: user_id,
            action: 'soft_delete'
          }),
        })

        if (archiveResponse.ok) {
          // Also update local database
          const { error: localError } = await supabase
            .from('inventory')
            .update({ deleted_at: new Date().toISOString() })
            .eq('id', diamond_id)
            .eq('user_id', user_id)

          if (localError) {
            console.warn('Local soft delete failed:', localError)
          }

          result.success = true
        }
        break

      case 'hard_delete':
        // Call external API for hard delete
        const deleteResponse = await fetch(`${backendUrl}/api/v1/sold`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${backendToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            diamond_id: diamond_id,
            user_id: user_id,
            action: 'delete'
          }),
        })

        if (deleteResponse.ok) {
          // Also delete from local database
          const { error: localError } = await supabase
            .from('inventory')
            .delete()
            .eq('id', diamond_id)
            .eq('user_id', user_id)

          if (localError) {
            console.warn('Local hard delete failed:', localError)
          }

          result.success = true
        }
        break

      case 'update':
        // Update local database
        const { error: updateError } = await supabase
          .from('inventory')
          .update({
            ...updates,
            updated_at: new Date().toISOString()
          })
          .eq('id', diamond_id)
          .eq('user_id', user_id)

        if (!updateError) {
          result.success = true
        }
        break

      default:
        throw new Error(`Unknown action: ${action}`)
    }

    console.log(`✅ CRUD operation ${action} completed:`, result.success)

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('❌ CRUD operation error:', error)
    return new Response(
      JSON.stringify({ error: error.message, success: false }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
