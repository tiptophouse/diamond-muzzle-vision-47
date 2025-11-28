import { useState } from 'react';
import { useTelegramWebApp } from './useTelegramWebApp';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface DiamondStoryData {
  id: string;
  stockNumber: string;
  carat: number;
  shape: string;
  color: string;
  clarity: string;
  cut: string;
  price: number;
  imageUrl?: string;
}

export function useStorySharing() {
  const [isSharing, setIsSharing] = useState(false);
  const { webApp, hapticFeedback } = useTelegramWebApp();
  
  // Check if story sharing is available (Telegram 7.2+)
  const hasStorySharing = typeof webApp?.shareToStory === 'function';

  const shareToStory = async (diamond: DiamondStoryData) => {
    if (!hasStorySharing) {
      toast.error('Story sharing requires Telegram 7.2+', {
        description: 'Please update your Telegram app'
      });
      return { success: false, error: 'Feature not available' };
    }

    if (!diamond.imageUrl) {
      toast.error('Cannot share to story without image');
      return { success: false, error: 'No image URL' };
    }

    setIsSharing(true);
    hapticFeedback.impact('medium');

    try {
      console.log('📱 Sharing diamond to Telegram Story:', diamond.stockNumber);

      // Create deep link for story widget
      const botUsername = 'Brilliantteatbot';
      const deepLink = `https://t.me/${botUsername}?startapp=diamond_${diamond.stockNumber}`;
      
      // Story text
      const storyText = `💎 ${diamond.carat}ct ${diamond.shape}\n${diamond.color} ${diamond.clarity}\n💰 $${diamond.price.toLocaleString()}`;

      // Share to story with widget button
      await webApp?.shareToStory(diamond.imageUrl, {
        text: storyText,
        widget_link: {
          url: deepLink,
          name: 'View Diamond'
        }
      });

      // Track story share in analytics
      try {
        const user = webApp?.initDataUnsafe?.user;
        if (user) {
          await supabase.from('diamond_story_shares').insert({
            diamond_stock_number: diamond.stockNumber,
            shared_by_telegram_id: user.id,
            shared_by_name: user.first_name + (user.last_name ? ` ${user.last_name}` : ''),
            deep_link: deepLink,
            share_type: 'story',
          });
        }
      } catch (trackError) {
        console.error('Failed to track story share:', trackError);
      }

      hapticFeedback.notification('success');
      toast.success('💫 Shared to Telegram Story!');
      
      return { success: true };
    } catch (error) {
      console.error('❌ Error sharing to story:', error);
      hapticFeedback.notification('error');
      toast.error('שגיאה בשיתוף לסטורי');
      return { success: false, error: String(error) };
    } finally {
      setIsSharing(false);
    }
  };

  return {
    shareToStory,
    isSharing,
    hasStorySharing,
  };
}
