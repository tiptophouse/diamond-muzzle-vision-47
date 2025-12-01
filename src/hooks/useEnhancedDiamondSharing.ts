import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { useTelegramWebApp } from '@/hooks/useTelegramWebApp';
import { useTelegramAdvanced } from '@/hooks/useTelegramAdvanced';

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
  const { shareStory, features } = useTelegramAdvanced();

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

    return { success: true, messageId: data?.messageId };
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

  // Share diamond to Telegram Story
  const shareToStory = useCallback(async (diamond: DiamondShareData): Promise<ShareResult> => {
    console.log('📱 shareToStory hook called:', {
      hasStorySharing: features.hasStorySharing,
      hasImage: !!diamond.imageUrl,
      stockNumber: diamond.stockNumber
    });

    if (!features.hasStorySharing) {
      console.warn('⚠️ Story sharing not available');
      toast({
        title: "Not Available",
        description: "Story sharing requires Telegram 7.2+",
        variant: "destructive",
      });
      return { success: false, error: "Story sharing not available" };
    }

    // Validate image URL
    const imageUrl = diamond.imageUrl || diamond.picture;
    if (!imageUrl) {
      console.warn('⚠️ No image URL found');
      toast({
        title: "No Image",
        description: "This diamond doesn't have an image to share",
        variant: "destructive",
      });
      return { success: false, error: "No image available" };
    }

    if (!imageUrl.startsWith('http')) {
      console.error('❌ Invalid image URL:', imageUrl);
      toast({
        title: "Invalid Image",
        description: "Image URL must be HTTPS",
        variant: "destructive",
      });
      return { success: false, error: "Invalid image URL" };
    }

    setIsSharing(true);
    webApp?.HapticFeedback?.impactOccurred('medium');

    try {
      const botUsername = 'BrilliantBot_bot';
      const deepLink = `https://t.me/${botUsername}?startapp=diamond_${diamond.stockNumber}_${user?.id || 'guest'}_story`;

      console.log('🚀 Attempting story share:', { imageUrl, deepLink });

      const success = await shareStory(imageUrl, {
        text: `💎 ${diamond.carat}ct ${diamond.shape} Diamond - $${diamond.price.toLocaleString()}`,
        widgetLink: {
          url: deepLink,
          name: '💎 View Diamond'
        }
      });

      if (success) {
        console.log('✅ Story shared successfully');
        
        // Track story share
        await supabase.from('diamond_story_shares').insert({
          diamond_stock_number: diamond.stockNumber,
          shared_by_telegram_id: user?.id,
          shared_by_name: user?.first_name || `User ${user?.id}`,
          deep_link: deepLink,
          share_type: 'telegram_story'
        });

        toast({
          title: "Shared to Story! 🎉",
          description: "Your diamond is now in your Telegram Story",
        });

        return { success: true };
      }

      console.error('❌ Story share returned false');
      toast({
        title: "Share Failed",
        description: "Could not share to story. Please try again.",
        variant: "destructive",
      });
      return { success: false, error: "Story sharing failed" };
    } catch (error) {
      console.error('❌ Story share error:', error);
      toast({
        title: "Share Failed",
        description: error instanceof Error ? error.message : "Could not share to story",
        variant: "destructive",
      });
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    } finally {
      setIsSharing(false);
    }
  }, [user, shareStory, features.hasStorySharing, toast, webApp]);

  return {
    shareMessage,
    shareMultipleDiamonds,
    quickShareToContact,
    quickShareToGroup,
    shareToStory,
    isSharing,
    hasStorySharing: features.hasStorySharing
  };
}