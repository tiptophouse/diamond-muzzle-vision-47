import { supabase } from '@/integrations/supabase/client';

/**
 * Server-side admin validation utilities
 * These functions interact with the secure admin_roles table
 */

export interface AdminRole {
  id: string;
  telegram_id: number;
  role: 'admin' | 'super_admin';
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Validate admin status for a telegram ID
 */
export async function validateAdminAccess(telegramId: number): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('admin_roles')
      .select('id')
      .eq('telegram_id', telegramId)
      .eq('is_active', true)
      .single();

    return !error && !!data;
  } catch (error) {
    console.error('Admin validation error:', error);
    return false;
  }
}

/**
 * Get admin role details
 */
export async function getAdminRole(telegramId: number): Promise<AdminRole | null> {
  try {
    const { data, error } = await supabase
      .from('admin_roles')
      .select('*')
      .eq('telegram_id', telegramId)
      .eq('is_active', true)
      .single();

    if (error || !data) {
      return null;
    }

    return data as AdminRole;
  } catch (error) {
    console.error('Error fetching admin role:', error);
    return null;
  }
}

/**
 * Check if user has super admin privileges
 */
export async function isSuperAdmin(telegramId: number): Promise<boolean> {
  try {
    const role = await getAdminRole(telegramId);
    return role?.role === 'super_admin';
  } catch (error) {
    console.error('Error checking super admin status:', error);
    return false;
  }
}

/**
 * Log admin action for audit purposes
 */
export async function logAdminAction(
  adminTelegramId: number,
  action: string,
  resourceType?: string,
  resourceId?: string,
  metadata?: Record<string, any>
): Promise<void> {
  try {
    await supabase
      .from('admin_audit_log')
      .insert({
        admin_telegram_id: adminTelegramId,
        action,
        resource_type: resourceType,
        resource_id: resourceId,
        metadata: metadata ? JSON.stringify(metadata) : null,
      });
  } catch (error) {
    console.error('Error logging admin action:', error);
  }
}