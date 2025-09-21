import { Share2, Copy, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useCallback } from "react";
import { useTelegramWebApp } from "@/hooks/useTelegramWebApp";
import { toast } from 'sonner';
import { cn } from "@/lib/utils";

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
    if (isSharing) return; // Prevent double-clicks
    
    setIsSharing(true);
    hapticFeedback.impact('medium');

    try {
      const shareContent = url ? `${title}\n\n${text}\n\n${url}` : `${title}\n\n${text}`;
      
      // Best practice: Progressive enhancement with proper error boundaries
      
      // Method 1: Telegram native sharing (highest priority)
      const tgWebApp = window.Telegram?.WebApp as any;
      if (tgWebApp?.switchInlineQuery) {
        try {
          await tgWebApp.switchInlineQuery(shareContent, ['users', 'groups', 'channels']);
          toast.success('Share dialog opened!');
          return;
        } catch (telegramError) {
          console.warn('Telegram sharing failed, trying alternatives:', telegramError);
        }
      }

      // Method 2: Web Share API with proper feature detection
      if (navigator.share && navigator.canShare?.({ title, text, url: url || window.location.href })) {
        try {
          await navigator.share({
            title,
            text,
            url: url || window.location.href,
          });
          toast.success('Shared successfully!');
          return;
        } catch (shareError) {
          // User cancelled or share failed
          if (shareError instanceof Error && shareError.name !== 'AbortError') {
            console.warn('Web Share API failed:', shareError);
          }
        }
      }

      // Method 3: Clipboard fallback with better UX
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareContent);
        
        if (webApp?.showAlert) {
          webApp.showAlert('Content copied! You can now paste it in any Telegram chat.');
        } else {
          toast.success('Content copied to clipboard!');
        }
        return;
      }

      // Final fallback: Legacy clipboard method
      const textArea = document.createElement('textarea');
      textArea.value = shareContent;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      toast.success('Content copied to clipboard!');

    } catch (error) {
      console.error('All sharing methods failed:', error);
      toast.error('Unable to share content at this time');
    } finally {
      setIsSharing(false);
    }
  }, [title, text, url, webApp, hapticFeedback, isSharing]);

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleShare}
      disabled={isSharing}
      className={cn("flex items-center gap-2", className)}
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