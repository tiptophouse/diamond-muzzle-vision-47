
import { supabase } from '@/integrations/supabase/client';

// Secure admin configuration - checks database instead of hardcoded values
export async function getAdminTelegramId(): Promise<number | null> {
  try {
    // First check if there's an active session
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      return null;
    }

    // Check admin_roles table for current user
    const { data: adminRole, error } = await supabase
      .from('admin_roles')
      .select('telegram_id')
      .eq('is_active', true)
      .single();

    if (error || !adminRole) {
      return null;
    }

    return adminRole.telegram_id;
  } catch (error) {
    console.error('Error checking admin status:', error);
    return null;
  }
}

// Check if a specific telegram ID is an admin
export async function isAdminTelegramId(telegramId: number): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('admin_roles')
      .select('id')
      .eq('telegram_id', telegramId)
      .eq('is_active', true)
      .single();

    return !error && !!data;
  } catch (error) {
    console.error('Error checking admin status for telegram ID:', error);
    return false;
  }
}
