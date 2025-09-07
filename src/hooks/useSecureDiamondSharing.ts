
import { useCallback } from 'react';
import { useTelegramWebApp } from './useTelegramWebApp';
import { useTelegramSendData } from './useTelegramSendData';
import { Diamond } from '@/components/inventory/InventoryTable';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { processImageUrl } from '@/utils/diamondImageUtils';

export function useSecureDiamondSharing() {
  const { webApp, user } = useTelegramWebApp();
  const { sendData } = useTelegramSendData();

  const createSecureShareData = useCallback((diamond: Diamond) => {
    // Create secure data payload that only works in Telegram for registered users
    return {
      type: 'diamond_share',
      diamond: {
        id: diamond.id,
        stockNumber: diamond.stockNumber,
        carat: diamond.carat,
        shape: diamond.shape,
        color: diamond.color,
        clarity: diamond.clarity,
        cut: diamond.cut,
        price: diamond.price,
        imageUrl: diamond.imageUrl,
        gem360Url: diamond.gem360Url
      },
      sharedBy: user?.id,
      timestamp: Date.now(),
      miniAppUrl: window.location.origin,
      requiresRegistration: true
    };
  }, [user]);

  const verifyUserRegistration = useCallback(async (telegramId: number): Promise<boolean> => {
    try {
      // Check if user exists in user_profiles (meaning they've registered and clicked start)
      const { data: userProfile, error } = await supabase
        .from('user_profiles')
        .select('telegram_id, status, created_at')
        .eq('telegram_id', telegramId)
        .single();

      if (error || !userProfile) {
        console.log('❌ User not found in database - not registered:', telegramId);
        return false;
      }

      // Additional check: user must be active and have been created (registered)
      if (userProfile.status !== 'active') {
        console.log('❌ User account is not active:', telegramId);
        return false;
      }

      console.log('✅ User is registered and active:', telegramId);
      return true;
    } catch (error) {
      console.error('❌ Error verifying user registration:', error);
      return false;
    }
  }, []);

  const trackShareClick = useCallback(async (diamondId: string, sharedBy: number) => {
    try {
      await supabase.from('diamond_share_analytics').insert({
        diamond_stock_number: diamondId,
        owner_telegram_id: sharedBy,
        viewer_telegram_id: user?.id,
        viewer_user_agent: navigator.userAgent,
        device_type: /Mobile|Android|iPhone|iPad/.test(navigator.userAgent) ? 'mobile' : 'desktop',
        session_id: crypto.randomUUID(),
        shared_click: true,
        access_via_share: true
      });
      
      console.log('✅ Share click tracked for diamond:', diamondId);
    } catch (error) {
      console.error('❌ Failed to track share click:', error);
    }
  }, [user]);

  const shareWithInlineButtons = useCallback(async (diamond: Diamond) => {
    
    try {
      // Try to get user ID from different sources
      let userId = user?.id;
      let sharerName = '';
      
      // Fallback: try to get user data from Telegram WebApp directly
      if (!userId && webApp) {
        const telegramUser = webApp.initDataUnsafe?.user;
        if (telegramUser) {
          userId = telegramUser.id;
          sharerName = `${telegramUser.first_name}${telegramUser.last_name ? ` ${telegramUser.last_name}` : ''}`;
        }
      }
      
      if (!userId) {
        toast.error('לא ניתן לזהות את המשתמש. נסה לרענן את הדף.');
        return false;
      }
      
      // Get user profile for name if we don't have it
      if (!sharerName) {
        const { data: userProfile } = await supabase
          .from('user_profiles')
          .select('first_name, last_name')
          .eq('telegram_id', userId)
          .single();
        
        sharerName = userProfile ? 
          `${userProfile.first_name}${userProfile.last_name ? ` ${userProfile.last_name}` : ''}` : 
          `User ${userId}`;
      }

      // Process diamond image using our enhanced image utilities
      const processedImageUrl = processImageUrl(
        diamond.imageUrl || 
        (diamond as any).Image || 
        (diamond as any).image || 
        (diamond as any).picture
      );

      

      // Call the Supabase function to send diamond to group
      const { data, error } = await supabase.functions.invoke('send-diamond-to-group', {
        body: {
          diamond: {
            id: diamond.id,
            stockNumber: diamond.stockNumber,
            carat: diamond.carat,
            shape: diamond.shape,
            color: diamond.color,
            clarity: diamond.clarity,
            cut: diamond.cut,
            price: diamond.price,
            imageUrl: processedImageUrl,
            gem360Url: diamond.gem360Url,
            // Include all image fallbacks
            Image: (diamond as any).Image,
            image: (diamond as any).image,
            picture: (diamond as any).picture
          },
          sharedBy: userId,
          sharedByName: sharerName,
          testMode: false
        }
      });

      if (error) {
        toast.error(`שגיאה בשליחה: ${error.message}`);
        return false;
      }
      toast.success('💎 היהלום נשתף לקבוצה בהצלחה!');
      return true;
      
    } catch (error) {
      toast.error('נכשל בשיתוף היהלום. נסה שוב.');
      return false;
    }
  }, [webApp, user]);

  return {
    shareWithInlineButtons,
    trackShareClick,
    verifyUserRegistration,
    isAvailable: !!(webApp && user)
  };
}
