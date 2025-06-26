
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-telegram-user-id',
}

interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { operation, data, telegramUserId, diamondId } = await req.json();
    
    console.log('🔍 Diamond Operation:', operation, 'for user:', telegramUserId);

    if (!telegramUserId) {
      throw new Error('Telegram user ID is required');
    }

    let result;

    switch (operation) {
      case 'fetch':
        const { data: diamonds, error: fetchError } = await supabase
          .from('inventory')
          .select('*')
          .eq('user_id', telegramUserId)
          .is('deleted_at', null);
        
        if (fetchError) throw fetchError;
        result = diamonds || [];
        break;

      case 'add':
        const { data: newDiamond, error: addError } = await supabase
          .from('inventory')
          .insert({
            ...data,
            user_id: telegramUserId,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select()
          .single();
        
        if (addError) throw addError;
        result = newDiamond;
        break;

      case 'update':
        const { data: updatedDiamond, error: updateError } = await supabase
          .from('inventory')
          .update({
            ...data,
            updated_at: new Date().toISOString()
          })
          .eq('id', diamondId)
          .eq('user_id', telegramUserId)
          .select()
          .single();
        
        if (updateError) throw updateError;
        result = updatedDiamond;
        break;

      case 'delete':
        const { error: deleteError } = await supabase
          .from('inventory')
          .update({ deleted_at: new Date().toISOString() })
          .eq('id', diamondId)
          .eq('user_id', telegramUserId);
        
        if (deleteError) throw deleteError;
        result = { success: true };
        break;

      default:
        throw new Error('Invalid operation');
    }

    return new Response(
      JSON.stringify({ success: true, data: result }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error) {
    console.error('❌ Diamond operation error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Operation failed' 
      }),
      { 
        status: 400,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  }
});
