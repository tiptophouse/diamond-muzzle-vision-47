
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useTelegramAuth } from '@/context/TelegramAuthContext';

interface LoginTrackingData {
  telegram_id: number;
  first_name?: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
  photo_url?: string;
  ip_address?: string;
  user_agent?: string;
  init_data_hash?: string;
}

export function useUserLoginTracking() {
  const { user, isAuthenticated, isTelegramEnvironment } = useTelegramAuth();

  const trackUserLogin = async (userData: LoginTrackingData) => {
    try {
      console.log('📊 Tracking user login:', userData.telegram_id);
      
      const { error } = await supabase
        .from('user_logins')
        .insert([{
          telegram_id: userData.telegram_id,
          first_name: userData.first_name,
          last_name: userData.last_name,
          username: userData.username,
          language_code: userData.language_code,
          is_premium: userData.is_premium || false,
          photo_url: userData.photo_url,
          ip_address: userData.ip_address,
          user_agent: userData.user_agent,
          init_data_hash: userData.init_data_hash
        }]);

      if (error) {
        console.error('❌ Error tracking user login:', error);
      } else {
        console.log('✅ User login tracked successfully');
      }
    } catch (error) {
      console.error('❌ Unexpected error tracking login:', error);
    }
  };

  useEffect(() => {
    if (isAuthenticated && user) {
      // Get additional browser/session info
      const loginData: LoginTrackingData = {
        telegram_id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        username: user.username,
        language_code: user.language_code,
        is_premium: user.is_premium,
        photo_url: user.photo_url,
        user_agent: navigator.userAgent,
        init_data_hash: isTelegramEnvironment && window.Telegram?.WebApp?.initData 
          ? btoa(window.Telegram.WebApp.initData) 
          : undefined
      };

      // Track the login
      trackUserLogin(loginData);
    }
  }, [isAuthenticated, user, isTelegramEnvironment]);

  return { trackUserLogin };
}
