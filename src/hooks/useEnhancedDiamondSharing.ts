import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { useTelegramWebApp } from '@/hooks/useTelegramWebApp';

export interface DiamondShareData {
  diamond_id?: number;
  id?: string;
  stock_number: string;
  stockNumber?: string;
  weight: number;
  carat?: number;
  shape: string;
  color: string;
  clarity: string;
  cut: string;
  price_per_carat?: number;
  price?: number;
  picture?: string;
  imageUrl?: string;
  gem_360_url?: string;
  gem360Url?: string;
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
    // Normalize diamond data
    const carat = diamond.weight || diamond.carat || 0;
    const stockNumber = diamond.stock_number || diamond.stockNumber || '';
    const totalPrice = diamond.price || (diamond.price_per_carat && diamond.price_per_carat * carat);
    
    const priceText = totalPrice && totalPrice > 0 
      ? `💰 $${totalPrice.toLocaleString()}` 
      : '💰 צור קשר למחיר';

    const diamondMessage = `✨💎 **${carat}ct ${diamond.shape.toUpperCase()}** 💎✨

🏆 **יהלום פרמיום זמין!**
*${diamond.color} צבע • ${diamond.clarity} ניקיון • ${diamond.cut} חיתוך*

${priceText}

📋 **מק"ט:** \`${stockNumber}\`
👤 **מוצע על ידי:** ${sharerName}

${customMessage ? `\n📝 **הודעה:** ${customMessage}\n` : ''}

🎯 **רוצה לראות עוד פרטים? השתמש בכפתורים למטה! 👇**`;

    // Create buttons for individual sharing
    const baseUrl = 'https://uhhljqgxhdhbbhpohxll.supabase.co';
    const telegramBotUrl = 'https://t.me/BrilliantBot_bot';
    const imageUrl = diamond.picture || diamond.imageUrl;
    
    const buttons = [
      {
        text: '💎 פרטים מלאים',
        url: `${baseUrl}/diamond/${stockNumber}?shared=true&from=${sharerId}&verify=true`
      },
      {
        text: '📱 צור קשר',
        url: `${telegramBotUrl}?start=contact_${stockNumber}_${sharerId}`
      }
    ];

    // Use individual message function with rich content
    const payload = includeImage && imageUrl ? {
      telegramId: targetId,
      message: diamondMessage,
      buttons,
      imageUrl: imageUrl
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
    // Normalize diamond data for backend
    const carat = diamond.weight || diamond.carat || 0;
    const stockNumber = diamond.stock_number || diamond.stockNumber || '';
    const totalPrice = diamond.price || (diamond.price_per_carat && diamond.price_per_carat * carat);
    const gem360 = diamond.gem_360_url || diamond.gem360Url;
    const imageUrl = diamond.picture || diamond.imageUrl;
    
    const { data, error } = await supabase.functions.invoke('send-diamond-to-group', {
      body: {
        diamond: {
          diamond_id: diamond.diamond_id || (diamond.id ? parseInt(diamond.id) : undefined),
          stock_number: stockNumber,
          stockNumber: stockNumber,
          weight: carat,
          carat: carat,
          shape: diamond.shape,
          color: diamond.color,
          clarity: diamond.clarity,
          cut: diamond.cut,
          price_per_carat: diamond.price_per_carat,
          price: totalPrice,
          picture: imageUrl,
          imageUrl: imageUrl,
          gem_360_url: gem360,
          gem360Url: gem360
        },
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

  return {
    shareMessage,
    shareMultipleDiamonds,
    quickShareToContact,
    quickShareToGroup,
    isSharing
  };
}