
import { supabase } from '@/integrations/supabase/client';

interface SecureConfig {
  backendAccessToken: string | null;
  adminTelegramId: number | null;
}

let cachedConfig: SecureConfig | null = null;
let configExpiry: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export async function getSecureConfig(): Promise<SecureConfig> {
  // Return cached config if still valid
  if (cachedConfig && Date.now() < configExpiry) {
    return cachedConfig;
  }

  try {
    console.log('🔐 Fetching secure configuration...');
    
    // Get backend access token from Supabase edge function
    const { data: tokenData, error: tokenError } = await supabase.functions.invoke('get-api-token', {
      method: 'POST'
    });

    if (tokenError) {
      console.error('❌ Failed to get backend access token:', tokenError);
      throw new Error('Failed to retrieve secure backend token');
    }

    // Get admin configuration from app_settings
    const { data: adminSettings, error: adminError } = await supabase
      .from('app_settings')
      .select('setting_value')
      .eq('setting_key', 'admin_telegram_id')
      .maybeSingle();

    if (adminError) {
      console.warn('⚠️ Failed to get admin settings:', adminError);
    }

    // Properly handle the JSON setting_value field
    let adminTelegramId = 2138564172; // fallback
    if (adminSettings?.setting_value) {
      // Handle different possible formats of the setting_value
      if (typeof adminSettings.setting_value === 'number') {
        adminTelegramId = adminSettings.setting_value;
      } else if (typeof adminSettings.setting_value === 'object' && adminSettings.setting_value !== null) {
        // If it's an object, check if it has a value property
        const settingObj = adminSettings.setting_value as Record<string, any>;
        adminTelegramId = settingObj.value || settingObj.admin_telegram_id || 2138564172;
      } else if (typeof adminSettings.setting_value === 'string') {
        // Try to parse as number
        const parsed = parseInt(adminSettings.setting_value, 10);
        if (!isNaN(parsed)) {
          adminTelegramId = parsed;
        }
      }
    }

    const config: SecureConfig = {
      backendAccessToken: tokenData?.token || null,
      adminTelegramId
    };

    // Cache the configuration
    cachedConfig = config;
    configExpiry = Date.now() + CACHE_DURATION;

    console.log('✅ Secure configuration loaded successfully');
    return config;
  } catch (error) {
    console.error('❌ Error loading secure configuration:', error);
    // Return minimal fallback config for emergency access
    return {
      backendAccessToken: null,
      adminTelegramId: 2138564172
    };
  }
}

export async function getBackendAccessToken(): Promise<string | null> {
  const config = await getSecureConfig();
  return config.backendAccessToken;
}

export async function getAdminTelegramId(): Promise<number> {
  const config = await getSecureConfig();
  return config.adminTelegramId || 2138564172;
}

// Clear cache when needed (for testing or token rotation)
export function clearSecureConfigCache(): void {
  cachedConfig = null;
  configExpiry = 0;
  console.log('🔄 Secure configuration cache cleared');
}
