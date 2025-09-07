import { Share2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useCallback } from "react";
import { telegramSDK } from "@/lib/telegram/TelegramSDK";
import { toast } from 'sonner';

interface TelegramStoryShareButtonProps {
  diamondImage: string;
  diamondData: {
    stockNumber: string;
    carat: number;
    shape: string;
    color: string;
    clarity: string;
    price: number;
  };
  className?: string;
  variant?: "default" | "outline" | "ghost" | "secondary";
  size?: "default" | "sm" | "lg" | "icon";
}

export function TelegramStoryShareButton({ 
  diamondImage,
  diamondData,
  className = "", 
  variant = "outline", 
  size = "default"
}: TelegramStoryShareButtonProps) {
  const [isSharing, setIsSharing] = useState(false);

  const handleStoryShare = useCallback(async () => {
    if (!telegramSDK.getState().isReady) {
      toast.error('Telegram Web App not ready');
      return;
    }

    setIsSharing(true);
    telegramSDK.haptic.impact('medium');

    try {
      // Generate shareable link for the diamond
      const baseUrl = window.location.origin;
      const shareableLink = `${baseUrl}/secure-diamond/${diamondData.stockNumber}`;
      
      // Create marketing text for the story
      const storyText = `💎 ${diamondData.carat}ct ${diamondData.shape} ${diamondData.color} ${diamondData.clarity} Diamond`;

      // Share to Telegram story with widget link
      telegramSDK.ui.shareToStory(diamondImage, {
        text: storyText,
        widget_link: {
          url: shareableLink,
          name: "View Diamond"
        }
      });

      toast.success('💎 Diamond shared to your Telegram story!');
      
    } catch (error) {
      console.error('Story share failed:', error);
      toast.error('Failed to share to story. Make sure you\'re using a recent version of Telegram.');
    } finally {
      setIsSharing(false);
    }
  }, [diamondImage, diamondData]);

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleStoryShare}
      disabled={isSharing}
      className={`flex items-center gap-2 ${className}`}
      title="Share diamond to your Telegram story"
    >
      {size === 'icon' ? (
        <Sparkles className="h-4 w-4" />
      ) : (
        <>
          <Sparkles className="h-4 w-4" />
          <span className="hidden sm:inline">
            {isSharing ? 'Sharing...' : 'Share to Story'}
          </span>
          <span className="sm:hidden">
            {isSharing ? '...' : 'Story'}
          </span>
        </>
      )}
    </Button>
  );
}