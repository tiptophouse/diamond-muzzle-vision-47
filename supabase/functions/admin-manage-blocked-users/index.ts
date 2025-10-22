import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface BlockUserRequest {
  action: 'block' | 'unblock' | 'list';
  telegram_id?: number;
  blocked_user_id?: string; // UUID for unblock
  reason?: string;
  admin_telegram_id: number;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    // Service role client - bypasses RLS
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body: BlockUserRequest = await req.json();
    const { action, telegram_id, blocked_user_id, reason, admin_telegram_id } = body;

    console.log('🔐 Admin blocked users request:', { action, telegram_id, admin_telegram_id });

    // Step 1: Verify caller is admin
    const { data: adminCheck, error: adminError } = await supabase
      .from('admin_roles')
      .select('role, is_active')
      .eq('telegram_id', admin_telegram_id)
      .eq('is_active', true)
      .single();

    if (adminError || !adminCheck) {
      console.error('❌ Not an admin:', admin_telegram_id);
      return new Response(
        JSON.stringify({ error: 'Unauthorized: Admin access required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 403 }
      );
    }

    console.log('✅ Admin verified:', admin_telegram_id, adminCheck.role);

    // Step 2: Perform requested action with service role (bypasses RLS)
    switch (action) {
      case 'block': {
        if (!telegram_id) {
          return new Response(
            JSON.stringify({ error: 'telegram_id is required for blocking' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
          );
        }

        const { data, error } = await supabase
          .from('blocked_users')
          .insert({
            telegram_id: telegram_id,
            blocked_by_telegram_id: admin_telegram_id,
            reason: reason || 'No reason provided'
          })
          .select()
          .single();

        if (error) {
          console.error('❌ Error blocking user:', error);
          return new Response(
            JSON.stringify({ error: `Failed to block user: ${error.message}` }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
          );
        }

        // Log admin action
        await supabase.from('admin_audit_log').insert({
          admin_telegram_id,
          action: 'block_user',
          resource_type: 'blocked_users',
          resource_id: data.id,
          metadata: { telegram_id, reason }
        });

        console.log('✅ User blocked successfully:', telegram_id);
        return new Response(
          JSON.stringify({ success: true, data }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
        );
      }

      case 'unblock': {
        if (!blocked_user_id) {
          return new Response(
            JSON.stringify({ error: 'blocked_user_id is required for unblocking' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
          );
        }

        const { error } = await supabase
          .from('blocked_users')
          .delete()
          .eq('id', blocked_user_id);

        if (error) {
          console.error('❌ Error unblocking user:', error);
          return new Response(
            JSON.stringify({ error: `Failed to unblock user: ${error.message}` }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
          );
        }

        // Log admin action
        await supabase.from('admin_audit_log').insert({
          admin_telegram_id,
          action: 'unblock_user',
          resource_type: 'blocked_users',
          resource_id: blocked_user_id,
        });

        console.log('✅ User unblocked successfully:', blocked_user_id);
        return new Response(
          JSON.stringify({ success: true }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
        );
      }

      case 'list': {
        const { data, error } = await supabase
          .from('blocked_users')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          console.error('❌ Error fetching blocked users:', error);
          return new Response(
            JSON.stringify({ error: `Failed to fetch blocked users: ${error.message}` }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
          );
        }

        return new Response(
          JSON.stringify({ success: true, data }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
        );
      }

      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action. Use: block, unblock, or list' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        );
    }

  } catch (error) {
    console.error('❌ Exception in admin-manage-blocked-users:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
