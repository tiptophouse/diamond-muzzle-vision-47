
// Secure configuration for FastAPI backend access
import { supabase } from '@/integrations/supabase/client';

let backendAccessToken: string | null = null;
let adminTelegramId: number | null = null;

export async function getBackendAccessToken(): Promise<string | null> {
  if (backendAccessToken) {
    return backendAccessToken;
  }

  try {
    console.log('🔐 SECURE: Fetching backend access token from Supabase edge function');
    
    const { data, error } = await supabase.functions.invoke('get-api-token', {
      body: {}
    });

    if (error) {
      console.error('❌ SECURE: Failed to get backend token:', error);
      return null;
    }

    if (data?.token) {
      backendAccessToken = data.token;
      console.log('✅ SECURE: Backend access token retrieved successfully');
      return backendAccessToken;
    }

    console.warn('⚠️ SECURE: No token returned from edge function');
    return null;
  } catch (error) {
    console.error('❌ SECURE: Error fetching backend token:', error);
    return null;
  }
}

export async function getAdminTelegramId(): Promise<number> {
  if (adminTelegramId) {
    return adminTelegramId;
  }

  try {
    console.log('🔐 SECURE: Fetching admin Telegram ID from edge function');
    
    const { data, error } = await supabase.functions.invoke('get-api-token', {
      body: { getAdminId: true }
    });

    if (error) {
      console.error('❌ SECURE: Failed to get admin ID:', error);
      return 2138564172; // Your fallback admin ID
    }

    if (data?.adminId) {
      adminTelegramId = data.adminId;
      console.log('✅ SECURE: Admin Telegram ID retrieved:', adminTelegramId);
      return adminTelegramId;
    }

    console.warn('⚠️ SECURE: No admin ID returned, using fallback');
    adminTelegramId = 2138564172; // Your fallback admin ID
    return adminTelegramId;
  } catch (error) {
    console.error('❌ SECURE: Error fetching admin ID:', error);
    adminTelegramId = 2138564172; // Your fallback admin ID
    return adminTelegramId;
  }
}

// Clear cached values (useful for development)
export function clearSecureCache() {
  backendAccessToken = null;
  adminTelegramId = null;
  console.log('🔧 SECURE: Cache cleared');
}
