
import { useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useTelegramWebApp } from './useTelegramWebApp';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function useSharedDiamondAccess() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, webApp } = useTelegramWebApp();

  const validateUserRegistration = useCallback(async (telegramId: number): Promise<boolean> => {
    try {
      console.log('🔍 Checking registration for user:', telegramId);
      
      // Check if user exists in user_profiles and is active
      const { data: userProfile, error } = await supabase
        .from('user_profiles')
        .select('telegram_id, status, created_at, first_name')
        .eq('telegram_id', telegramId)
        .single();

      if (error || !userProfile) {
        console.log('❌ User not registered in database:', telegramId);
        return false;
      }

      if (userProfile.status !== 'active') {
        console.log('❌ User account is not active:', userProfile.status);
        return false;
      }

      console.log('✅ User is registered and active:', userProfile.first_name);
      return true;
    } catch (error) {
      console.error('❌ Error validating user registration:', error);
      return false;
    }
  }, []);

  const validateAndTrackAccess = useCallback(async (diamondId: string) => {
    const isShared = searchParams.get('shared');
    const sharedFrom = searchParams.get('from');
    const requiresVerification = searchParams.get('verify');

    if (!isShared || !sharedFrom) return true;

    // Only allow access via Telegram Mini App for shared links
    if (!webApp || !user) {
      toast.error('🔒 Shared diamonds can only be viewed in Telegram Mini App');
      return false;
    }

    // If verification is required, check if user is registered
    if (requiresVerification === 'true') {
      console.log('🔐 Registration verification required for access');
      
      const isRegistered = await validateUserRegistration(user.id);
      
      if (!isRegistered) {
        toast.error('📝 You must be registered in our Mini App to view this diamond. Please click "Start" first!');
        // Redirect to registration/start page
        navigate('/?register=true&required=diamond_access');
        return false;
      }
      
      console.log('✅ Registration verified - allowing access');
    }

    try {
      // Track the shared diamond access
      await supabase.from('diamond_share_analytics').insert({
        diamond_stock_number: diamondId,
        owner_telegram_id: parseInt(sharedFrom),
        viewer_telegram_id: user.id,
        viewer_user_agent: navigator.userAgent,
        device_type: /Mobile|Android|iPhone|iPad/.test(navigator.userAgent) ? 'mobile' : 'desktop',
        session_id: crypto.randomUUID(),
        access_via_share: true,
        referrer: document.referrer
      });

      // Clean up URL params after tracking
      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.delete('shared');
      newSearchParams.delete('from');
      newSearchParams.delete('verify');
      setSearchParams(newSearchParams, { replace: true });

      console.log('✅ Registered user diamond access tracked');
      return true;
    } catch (error) {
      console.error('❌ Failed to track diamond access:', error);
      return true; // Don't block access on tracking errors
    }
  }, [searchParams, setSearchParams, webApp, user, validateUserRegistration, navigate]);

  const sendAccessNotification = useCallback(async (diamondId: string, ownerTelegramId: number) => {
    if (!user) return;

    try {
      // Only send notification if user is registered
      const isRegistered = await validateUserRegistration(user.id);
      if (!isRegistered) return;

      // Notify the diamond owner about the registered user view
      const notificationMessage = {
        action: 'registered_user_viewed_diamond',
        data: {
          diamondId,
          viewerName: user.first_name,
          viewerUsername: user.username,
          viewerTelegramId: user.id,
          timestamp: Date.now(),
          isRegisteredUser: true
        }
      };

      webApp?.sendData?.(JSON.stringify(notificationMessage));
    } catch (error) {
      console.error('❌ Failed to send access notification:', error);
    }
  }, [user, webApp, validateUserRegistration]);

  return {
    validateAndTrackAccess,
    sendAccessNotification,
    validateUserRegistration,
    isSecureAccess: !!(webApp && user)
  };
}
