
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface AppSettings {
  manual_authorization_enabled: boolean;
}

export function useAppSettings() {
  const [settings, setSettings] = useState<AppSettings>({
    manual_authorization_enabled: false // Default to false - no authorization required
  });
  const [isLoading, setIsLoading] = useState(true);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('app_settings')
        .select('setting_key, setting_value')
        .in('setting_key', ['manual_authorization_enabled']);

      if (error) throw error;

      const settingsMap: any = {};
      data?.forEach(setting => {
        // Handle the Json type properly
        if (setting.setting_key === 'manual_authorization_enabled') {
          // Check if setting_value is an object with enabled property, or just a boolean
          const value = setting.setting_value;
          if (typeof value === 'object' && value !== null && 'enabled' in value) {
            settingsMap[setting.setting_key] = (value as any).enabled === true;
          } else {
            settingsMap[setting.setting_key] = value === true;
          }
        }
      });

      setSettings({
        manual_authorization_enabled: settingsMap.manual_authorization_enabled === true
      });
    } catch (error) {
      console.error('Error fetching app settings:', error);
      // Default to no authorization required on error
      setSettings({
        manual_authorization_enabled: false
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return {
    settings,
    isLoading,
    refetch: fetchSettings
  };
}
