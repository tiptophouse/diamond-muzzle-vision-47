import { useState, useCallback } from 'react';
import { useTelegramWebApp } from './useTelegramWebApp';
import { useTelegramHapticFeedback } from './useTelegramHapticFeedback';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Diamond } from '@/components/inventory/InventoryTable';

export interface ContactInfo {
  id: number;
  firstName: string;
  lastName?: string;
  username?: string;
}

export function useAdvancedSharing() {
  const [isSharing, setIsSharing] = useState(false);
  const { webApp, user } = useTelegramWebApp();
  const { impactOccurred } = useTelegramHapticFeedback();

  // Share directly via Bot API to specific user
  const shareToUser = useCallback(async (diamond: Diamond, targetUserId: number) => {
    if (isSharing) return false;
    
    setIsSharing(true);
    impactOccurred('medium');

    try {
      const currentUserId = user?.id || webApp?.initDataUnsafe?.user?.id;
      
      if (!currentUserId) {
        toast({
          title: "שגיאה בזיהוי משתמש",
          description: "לא ניתן לזהות את המשתמש הנוכחי",
          variant: "destructive"
        });
        return false;
      }

      // Use the individual message function to send to specific user
      const { error } = await supabase.functions.invoke('send-individual-message', {
        body: {
          telegramId: targetUserId,
          message: `💎 <b>${diamond.carat} ct ${diamond.shape}</b>

🎨 צבע: ${diamond.color}
✨ ניקיון: ${diamond.clarity}  
⚡ חיתוך: ${diamond.cut}
💰 מחיר: ${diamond.price > 0 ? `$${diamond.price.toLocaleString()}` : 'צור קשר למחיר'}
🏷️ מק"ט: ${diamond.stockNumber}

📧 <b>נשלח מ:</b> ${user?.first_name || 'משתמש'} ${user?.last_name || ''}`,
          buttons: [
            {
              text: '💎 צפה בפרטים המלאים',
              url: `${window.location.origin}/diamond/${diamond.id}?shared=true&from=${currentUserId}`
            },
            {
              text: '📱 צור קשר עם המוכר',
              url: `https://t.me/${webApp?.initDataUnsafe?.user?.username || 'user'}?start=contact_${diamond.stockNumber}`
            }
          ]
        }
      });

      if (error) {
        throw new Error(error.message || 'Failed to send message');
      }

      toast({
        title: "✅ נשלח בהצלחה!",
        description: "היהלום נשלח ישירות ללקוח",
      });
      
      return true;
    } catch (error) {
      console.error('Error sharing to user:', error);
      toast({
        title: "שגיאה בשליחה",
        description: error instanceof Error ? error.message : "אירעה שגיאה בשליחת ההודעה",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsSharing(false);
    }
  }, [isSharing, user, webApp, impactOccurred]);

  // Share to multiple users at once
  const shareToMultipleUsers = useCallback(async (diamond: Diamond, userIds: number[]) => {
    if (isSharing) return false;
    
    setIsSharing(true);
    impactOccurred('heavy');

    try {
      const results = await Promise.allSettled(
        userIds.map(userId => shareToUser(diamond, userId))
      );

      const successful = results.filter(r => r.status === 'fulfilled' && r.value).length;
      const failed = results.length - successful;

      if (successful > 0) {
        toast({
          title: `✅ נשלח ל-${successful} לקוחות`,
          description: failed > 0 ? `${failed} שליחות נכשלו` : "כל השליחות הצליחו",
          variant: failed > 0 ? "destructive" : "default"
        });
      } else {
        toast({
          title: "שגיאה",
          description: "לא ניתן לשלוח לאף אחד מהלקוחות",
          variant: "destructive"
        });
      }

      return successful > 0;
    } catch (error) {
      toast({
        title: "שגיאה",
        description: "אירעה שגיאה בשליחה מרובה",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsSharing(false);
    }
  }, [shareToUser, isSharing, impactOccurred]);

  // Create shareable link with tracking
  const createTrackableLink = useCallback((diamond: Diamond) => {
    const currentUserId = user?.id || webApp?.initDataUnsafe?.user?.id;
    const baseUrl = window.location.origin;
    
    return `${baseUrl}/diamond/${diamond.id}?shared=true&from=${currentUserId}&utm_source=direct_share&utm_medium=telegram&utm_campaign=p2p_sharing`;
  }, [user, webApp]);

  // Enhanced Telegram sharing with better formatting
  const shareViaTelegram = useCallback((diamond: Diamond, includeImage: boolean = false) => {
    impactOccurred('medium');
    
    const trackableLink = createTrackableLink(diamond);
    const price = diamond.price > 0 ? `$${diamond.price.toLocaleString()}` : 'צור קשר למחיר';
    
    let message = `💎 *יהלום מיוחד זמין עכשיו!*

🔸 *פרטי היהלום:*
💠 **${diamond.carat} קראט ${diamond.shape}**
🌈 צבע **${diamond.color}** • ניקיון **${diamond.clarity}**
⚡ חיתוך **${diamond.cut}**
💰 מחיר: **${price}**
📋 מק"ט: \`${diamond.stockNumber}\`

🔗 *לפרטים מלאים:*
${trackableLink}

*נשלח דרך מערכת הלקוחות המתקדמת שלנו*`;

    if (includeImage && diamond.imageUrl) {
      message = `🖼️ [תמונת היהלום]\n\n${message}`;
    }

    const encodedMessage = encodeURIComponent(message);
    const telegramUrl = `https://t.me/share/url?url=&text=${encodedMessage}`;
    
    try {
      if (webApp) {
        webApp.openTelegramLink(telegramUrl);
      } else {
        window.open(telegramUrl, '_blank');
      }
      
      toast({
        title: "✅ פתיחת טלגרם",
        description: "בחר איתם לשתף את היהלום",
      });
      
      return true;
    } catch (error) {
      toast({
        title: "שגיאה",
        description: "לא ניתן לפתוח את טלגרם",
        variant: "destructive"
      });
      return false;
    }
  }, [impactOccurred, createTrackableLink, webApp]);

  return {
    isSharing,
    shareToUser,
    shareToMultipleUsers,
    shareViaTelegram,
    createTrackableLink
  };
}