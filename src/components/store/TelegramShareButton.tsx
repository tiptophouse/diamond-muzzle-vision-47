import { Share2, Copy, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useCallback } from "react";
import { useTelegramWebApp } from "@/hooks/useTelegramWebApp";
import { toast } from 'sonner';

interface TelegramShareButtonProps {
  title: string;
  text: string;
  url?: string;
  className?: string;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg";
  children?: React.ReactNode;
}

export function TelegramShareButton({ 
  title, 
  text, 
  url, 
  className = "", 
  variant = "outline", 
  size = "default",
  children 
}: TelegramShareButtonProps) {
  const [isSharing, setIsSharing] = useState(false);
  const { webApp, share, showAlert, hapticFeedback } = useTelegramWebApp();

  const handleShare = useCallback(async () => {
    setIsSharing(true);
    hapticFeedback.impact('medium');

    try {
      // Method 1: Try Telegram's switchInlineQuery (best for Telegram environment)  
      const tgWebApp = window.Telegram?.WebApp as any;
      if (tgWebApp && tgWebApp.switchInlineQuery) {
        const shareText = url ? `${text}\n\n${url}` : text;
        
        try {
          // This opens Telegram's share interface with the content
          tgWebApp.switchInlineQuery(shareText, ['users', 'groups', 'channels']);
          toast.success('Share dialog opened!');
          return;
        } catch (error) {
          console.log('switchInlineQuery failed, trying alternatives');
        }
      }

      // Method 2: Try native Web Share API
      if (navigator.share) {
        await navigator.share({
          title,
          text,
          url: url || window.location.href,
        });
        toast.success('Shared successfully!');
        return;
      }

      // Method 3: Fallback - Copy to clipboard and show instructions
      const shareContent = url ? `${title}\n\n${text}\n\n${url}` : `${title}\n\n${text}`;
      await navigator.clipboard.writeText(shareContent);
      
      if (webApp) {
        showAlert('Content copied! You can now paste it in any Telegram chat.');
      } else {
        toast.success('Content copied to clipboard!');
      }

    } catch (error) {
      console.error('Share failed:', error);
      
      // Final fallback - just copy to clipboard
      try {
        const shareContent = url ? `${title}\n\n${text}\n\n${url}` : `${title}\n\n${text}`;
        await navigator.clipboard.writeText(shareContent);
        toast.success('Content copied to clipboard!');
      } catch (clipboardError) {
        toast.error('Failed to share content');
      }
    } finally {
      setIsSharing(false);
    }
  }, [title, text, url, webApp, share, showAlert, hapticFeedback]);

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleShare}
      disabled={isSharing}
      className={`flex items-center gap-2 ${className}`}
    >
      <Share2 className="h-4 w-4" />
      {children || (
        <>
          <span className="hidden sm:inline">
            {isSharing ? 'Sharing...' : 'Share'}
          </span>
          <span className="sm:hidden">
            {isSharing ? '...' : 'Share'}
          </span>
        </>
      )}
    </Button>
  );
}