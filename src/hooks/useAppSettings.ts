
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { setCurrentUserId, getCurrentUserId } from '@/lib/api';
import { useTelegramAuth } from '@/context/TelegramAuthContext';

interface AppSettings {
  manual_authorization_enabled: boolean;
}

export function useAppSettings() {
  const [settings, setSettings] = useState<AppSettings>({
    manual_authorization_enabled: false
  });
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useTelegramAuth();

  const fetchSettings = async () => {
    try {
      // Set current user context securely
      if (user?.id && user.id !== getCurrentUserId()) {
        setCurrentUserId(user.id);
        
        // Set database context via secure edge function
        await supabase.functions.invoke('set-session-context', {
          body: {
            setting_name: 'app.current_user_id',
            setting_value: user.id.toString()
          }
        });
      }

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
    if (user?.id) {
      fetchSettings();
    } else {
      setIsLoading(false);
    }
  }, [user?.id]);

  return {
    settings,
    isLoading,
    refetch: fetchSettings
  };
}
