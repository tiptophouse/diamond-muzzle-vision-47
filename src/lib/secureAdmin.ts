/**
 * Centralized Secure Admin Management
 * 
 * CRITICAL SECURITY: This module replaces all hardcoded admin IDs
 * with database-backed validation using the admin_roles table.
 * 
 * ✅ Uses server-side validation
 * ✅ Cached for performance
 * ✅ No hardcoded credentials
 * ✅ Supports multiple admins with roles
 */

import { supabase } from '@/integrations/supabase/client';
import { useState, useEffect } from 'react';

// Cache for admin status (5 minutes)
const ADMIN_CACHE_DURATION = 5 * 60 * 1000;
interface AdminCache {
  [telegramId: string]: {
    isAdmin: boolean;
    timestamp: number;
    role?: string;
  };
}
const adminCache: AdminCache = {};

/**
 * Check if a Telegram ID belongs to an admin user
 * Uses edge function with service role to bypass RLS issues
 */
export async function isAdminTelegramId(telegramId: number | undefined | null): Promise<boolean> {
  if (!telegramId) {
    console.log('🔐 SecureAdmin: No telegram ID provided');
    return false;
  }

  const cacheKey = telegramId.toString();
  const now = Date.now();

  // Check cache first
  if (adminCache[cacheKey] && (now - adminCache[cacheKey].timestamp < ADMIN_CACHE_DURATION)) {
    console.log('🔐 SecureAdmin: Using cached result for', telegramId, '→', adminCache[cacheKey].isAdmin);
    return adminCache[cacheKey].isAdmin;
  }

  console.log('🔐 SecureAdmin: Validating admin status for Telegram ID:', telegramId);

  try {
    // Call edge function with service role (bypasses RLS)
    const { data, error } = await supabase.functions.invoke('check-admin', {
      body: { telegramId }
    });

    if (error) {
      console.error('🔐 SecureAdmin: Error checking admin status:', error);
      return false;
    }

    const isAdmin = data?.isAdmin || false;
    const role = data?.role || null;
    
    // Cache the result
    adminCache[cacheKey] = {
      isAdmin,
      timestamp: now,
      role,
    };

    console.log('🔐 SecureAdmin: Admin status for', telegramId, '→', isAdmin, role ? `(${role})` : '');
    return isAdmin;

  } catch (error) {
    console.error('🔐 SecureAdmin: Exception checking admin status:', error);
    return false;
  }
}

/**
 * Get admin role for a Telegram ID
 * Returns null if not an admin
 */
export async function getAdminRole(telegramId: number | undefined | null): Promise<string | null> {
  if (!telegramId) return null;

  try {
    // Call edge function
    const { data, error } = await supabase.functions.invoke('check-admin', {
      body: { telegramId }
    });

    if (error || !data?.isAdmin) return null;
    return data.role;
  } catch {
    return null;
  }
}

/**
 * Get the first active admin Telegram ID (for fallback purposes only)
 * ⚠️ Use sparingly - prefer checking specific users with isAdminTelegramId
 */
export async function getFirstAdminTelegramId(): Promise<number | null> {
  try {
    const { data, error } = await supabase
      .from('admin_roles')
      .select('telegram_id')
      .eq('is_active', true)
      .limit(1)
      .single();

    if (error || !data) {
      console.warn('🔐 SecureAdmin: No active admins found in database');
      return null;
    }

    return data.telegram_id;
  } catch (error) {
    console.error('🔐 SecureAdmin: Error fetching admin ID:', error);
    return null;
  }
}

/**
 * Clear admin cache for a specific user or all users
 */
export function clearAdminCache(telegramId?: number): void {
  if (telegramId) {
    delete adminCache[telegramId.toString()];
    console.log('🔐 SecureAdmin: Cleared cache for', telegramId);
  } else {
    Object.keys(adminCache).forEach(key => delete adminCache[key]);
    console.log('🔐 SecureAdmin: Cleared all admin cache');
  }
}

/**
 * React hook for checking admin status
 * Provides loading state and automatic updates
 */
export function useAdminCheck(telegramId: number | undefined | null) {
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function checkAdmin() {
      if (!telegramId) {
        if (isMounted) {
          setIsAdmin(false);
          setRole(null);
          setLoading(false);
        }
        return;
      }

      setLoading(true);
      
      try {
        const adminStatus = await isAdminTelegramId(telegramId);
        const adminRole = adminStatus ? await getAdminRole(telegramId) : null;

        if (isMounted) {
          setIsAdmin(adminStatus);
          setRole(adminRole);
          setLoading(false);
        }
      } catch (error) {
        console.error('🔐 SecureAdmin: Error in useAdminCheck:', error);
        if (isMounted) {
          setIsAdmin(false);
          setRole(null);
          setLoading(false);
        }
      }
    }

    checkAdmin();

    return () => {
      isMounted = false;
    };
  }, [telegramId]);

  return { isAdmin, loading, role };
}

/**
 * Check if user has super admin role
 */
export async function isSuperAdmin(telegramId: number | undefined | null): Promise<boolean> {
  if (!telegramId) return false;

  try {
    const { data, error } = await supabase
      .from('admin_roles')
      .select('role')
      .eq('telegram_id', telegramId)
      .eq('is_active', true)
      .eq('role', 'super_admin')
      .limit(1)
      .single();

    return !error && !!data;
  } catch {
    return false;
  }
}

/**
 * Get all active admin Telegram IDs
 * Use for bulk operations or analytics
 */
export async function getAllAdminIds(): Promise<number[]> {
  try {
    const { data, error } = await supabase
      .from('admin_roles')
      .select('telegram_id')
      .eq('is_active', true);

    if (error || !data) {
      console.warn('🔐 SecureAdmin: No admins found');
      return [];
    }

    return data.map(row => row.telegram_id);
  } catch (error) {
    console.error('🔐 SecureAdmin: Error fetching admin IDs:', error);
    return [];
  }
}
