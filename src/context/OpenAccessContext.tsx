
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useTelegramAuth } from './TelegramAuthContext';
import { extractTelegramUserData, upsertUserProfile, initializeUserAnalytics } from '@/utils/telegramUserData';

interface OpenAccessContextType {
  hasAccess: boolean;
  isBlocked: boolean;
  isAdmin: boolean;
  userProfile: any;
  loading: boolean;
}

const OpenAccessContext = createContext<OpenAccessContextType>({
  hasAccess: false,
  isBlocked: false,
  isAdmin: false,
  userProfile: null,
  loading: true
});

export function OpenAccessProvider({ children }: { children: React.ReactNode }) {
  const { user, isLoading: authLoading } = useTelegramAuth();
  const [hasAccess, setHasAccess] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAccessAndSetupUser = async () => {
      if (authLoading || !user) {
        setLoading(false);
        return;
      }

      try {
        console.log('🔓 OPEN ACCESS: Setting up user access for:', user.id);

        // Check if user is blocked
        const { data: blockedUser } = await supabase
          .from('blocked_users')
          .select('id')
          .eq('telegram_id', user.id)
          .maybeSingle();

        if (blockedUser) {
          console.log('🚫 OPEN ACCESS: User is blocked:', user.id);
          setIsBlocked(true);
          setHasAccess(false);
          setLoading(false);
          return;
        }

        // Check if user is admin
        const { data: adminSettings } = await supabase
          .from('app_settings')
          .select('setting_value')
          .eq('setting_key', 'admin_telegram_id')
          .maybeSingle();

        let adminId = 2138564172; // fallback
        if (adminSettings?.setting_value) {
          if (typeof adminSettings.setting_value === 'number') {
            adminId = adminSettings.setting_value;
          } else if (typeof adminSettings.setting_value === 'object' && adminSettings.setting_value !== null) {
            const settingObj = adminSettings.setting_value as Record<string, any>;
            adminId = settingObj.value || settingObj.admin_telegram_id || 2138564172;
          }
        }

        const isUserAdmin = user.id === adminId;
        setIsAdmin(isUserAdmin);

        // Setup/update user profile with full Telegram data
        const userData = extractTelegramUserData(user);
        await upsertUserProfile(userData);
        await initializeUserAnalytics(user.id);

        // Get updated user profile
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('telegram_id', user.id)
          .single();

        setUserProfile(profile);

        // Everyone has access (except blocked users)
        setHasAccess(true);
        setIsBlocked(false);

        console.log('✅ OPEN ACCESS: Access granted for user:', user.id, 'Admin:', isUserAdmin);

      } catch (error) {
        console.error('❌ OPEN ACCESS: Error setting up user:', error);
        // On error, still grant access (open policy)
        setHasAccess(true);
        setIsBlocked(false);
      } finally {
        setLoading(false);
      }
    };

    checkAccessAndSetupUser();
  }, [user, authLoading]);

  return (
    <OpenAccessContext.Provider value={{
      hasAccess,
      isBlocked,
      isAdmin,
      userProfile,
      loading
    }}>
      {children}
    </OpenAccessContext.Provider>
  );
}

export function useOpenAccess() {
  return useContext(OpenAccessContext);
}
