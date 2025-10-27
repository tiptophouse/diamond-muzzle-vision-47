import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { useTelegramWebApp } from '@/hooks/useTelegramWebApp';

export interface DiamondShareData {
  id: string;
  stockNumber: string;
  carat: number;
  shape: string;
  color: string;
  clarity: string;
  cut: string;
  price: number;
  imageUrl?: string;
  gem360Url?: string;
  picture?: string;
}

export interface ShareMessageOptions {
  diamond: DiamondShareData;
  targetId?: number; // If provided, sends to individual. If not, sends to group
  message?: string; // Custom message to include
  includeImage?: boolean;
  testMode?: boolean;
}

export interface ShareResult {
  success: boolean;
  messageId?: number;
  error?: string;
}

export function useEnhancedDiamondSharing() {
  const [isSharing, setIsSharing] = useState(false);
  const { toast } = useToast();
  const { user } = useTelegramAuth();
  const { webApp } = useTelegramWebApp();

  const shareMessage = useCallback(async (options: ShareMessageOptions): Promise<ShareResult> => {
    if (!user?.id) {
      toast({
        title: "Error",
        description: "User not authenticated",
        variant: "destructive",
      });
      return { success: false, error: "Not authenticated" };
    }

    setIsSharing(true);

    try {
      // Add haptic feedback
      webApp?.HapticFeedback?.impactOccurred('light');

      const { diamond, targetId, message, includeImage = true, testMode = false } = options;

      if (targetId) {
        // Send to individual contact
        return await shareToIndividual({
          diamond,
          targetId,
          customMessage: message,
          includeImage,
          sharerId: user.id,
          sharerName: user.first_name || `User ${user.id}`
        });
      } else {
        // Send to group
        return await shareToGroup({
          diamond,
          customMessage: message,
          testMode,
          sharerId: user.id,
          sharerName: user.first_name || `User ${user.id}`
        });
      }
    } catch (error) {
      console.error('Error sharing diamond:', error);
      toast({
        title: "Sharing Failed",
        description: "Could not share diamond. Please try again.",
        variant: "destructive",
      });
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    } finally {
      setIsSharing(false);
    }
  }, [user, toast, webApp]);

  const shareToIndividual = async ({
    diamond,
    targetId,
    customMessage,
    includeImage,
    sharerId,
    sharerName
  }: {
    diamond: DiamondShareData;
    targetId: number;
    customMessage?: string;
    includeImage: boolean;
    sharerId: number;
    sharerName: string;
  }): Promise<ShareResult> => {
    // Generate rich diamond card message
    const priceText = diamond.price && diamond.price > 0 
      ? `💰 $${diamond.price.toLocaleString()}` 
      : '💰 צור קשר למחיר';

    const diamondMessage = `✨💎 **${diamond.carat}ct ${diamond.shape.toUpperCase()}** 💎✨

🏆 **יהלום פרמיום זמין!**
*${diamond.color} צבע • ${diamond.clarity} ניקיון • ${diamond.cut} חיתוך*

${priceText}

📋 **מק"ט:** \`${diamond.stockNumber}\`
👤 **מוצע על ידי:** ${sharerName}

${customMessage ? `\n📝 **הודעה:** ${customMessage}\n` : ''}

🎯 **רוצה לראות עוד פרטים? השתמש בכפתורים למטה! 👇**`;

    // Create buttons for individual sharing
    const baseUrl = 'https://uhhljqgxhdhbbhpohxll.supabase.co';
    const telegramBotUrl = 'https://t.me/BrilliantBot_bot';
    
    const buttons = [
      {
        text: '💎 פרטים מלאים',
        url: `${baseUrl}/diamond/${diamond.id}?shared=true&from=${sharerId}&verify=true`
      },
      {
        text: '📱 צור קשר',
        url: `${telegramBotUrl}?start=contact_${diamond.stockNumber}_${sharerId}`
      }
    ];

    // Use individual message function with rich content
    const payload = includeImage && diamond.imageUrl ? {
      telegramId: targetId,
      message: diamondMessage,
      buttons,
      imageUrl: diamond.imageUrl
    } : {
      telegramId: targetId,
      message: diamondMessage,
      buttons
    };

    const { data, error } = await supabase.functions.invoke('send-enhanced-individual-message', {
      body: payload
    });

    if (error) {
      throw error;
    }

    toast({
      title: "Diamond Shared",
      description: "Diamond card sent successfully",
    });

    // Record share event
    await recordShareEvent(diamond, 'individual', targetId);

    return { success: true, messageId: data?.messageId };
  };

  const recordShareEvent = async (diamond: DiamondShareData, targetType: 'group' | 'individual', targetId?: number) => {
    try {
      const shareUrl = `${window.location.origin}/diamond/${diamond.stockNumber}`;
      await supabase.from('diamond_shares').insert({
        diamond_id: diamond.id,
        stock_number: diamond.stockNumber,
        shared_by: user!.id,
        share_url: shareUrl,
      });
    } catch (error) {
      console.error('Error recording share event:', error);
    }
  };

  const shareToGroup = async ({
    diamond,
    customMessage,
    testMode,
    sharerId,
    sharerName
  }: {
    diamond: DiamondShareData;
    customMessage?: string;
    testMode: boolean;
    sharerId: number;
    sharerName: string;
  }): Promise<ShareResult> => {
    const { data, error } = await supabase.functions.invoke('send-diamond-to-group', {
      body: {
        diamond,
        sharedBy: sharerId,
        sharedByName: sharerName,
        testMode,
        customMessage
      }
    });

    if (error) {
      throw error;
    }

    toast({
      title: "Diamond Shared",
      description: testMode ? "Test message sent to your chat" : "Diamond shared to group successfully",
    });

    // Record share event
    await recordShareEvent(diamond, 'group');

    return { success: true, messageId: data?.messageId };
  };

  // Utility function to share multiple diamonds
  const shareMultipleDiamonds = useCallback(async (
    diamonds: DiamondShareData[],
    targetId?: number,
    customMessage?: string
  ): Promise<ShareResult[]> => {
    const results: ShareResult[] = [];
    
    for (const diamond of diamonds) {
      const result = await shareMessage({
        diamond,
        targetId,
        message: customMessage,
        includeImage: true
      });
      results.push(result);
      
      // Small delay between messages to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    return results;
  }, [shareMessage]);

  // Quick share functions for common use cases
  const quickShareToContact = useCallback(async (
    diamond: DiamondShareData,
    contactId: number
  ): Promise<ShareResult> => {
    return shareMessage({
      diamond,
      targetId: contactId,
      includeImage: true
    });
  }, [shareMessage]);

  const quickShareToGroup = useCallback(async (
    diamond: DiamondShareData,
    testMode: boolean = false
  ): Promise<ShareResult> => {
    return shareMessage({
      diamond,
      testMode,
      includeImage: true
    });
  }, [shareMessage]);

  return {
    shareMessage,
    shareMultipleDiamonds,
    quickShareToContact,
    quickShareToGroup,
    isSharing
  };
}