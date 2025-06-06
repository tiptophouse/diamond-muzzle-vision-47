
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface AppSettings {
  manual_authorization_enabled: boolean;
}

export function useAppSettings() {
  const [settings, setSettings] = useState<AppSettings>({
    manual_authorization_enabled: false
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
        settingsMap[setting.setting_key] = setting.setting_value;
      });

      setSettings({
        manual_authorization_enabled: settingsMap.manual_authorization_enabled === true
      });
    } catch (error) {
      console.error('Error fetching app settings:', error);
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
