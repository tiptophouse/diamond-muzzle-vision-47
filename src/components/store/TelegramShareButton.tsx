import { Share2, Copy, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState, useCallback } from "react";
import { useTelegramWebApp } from "@/hooks/useTelegramWebApp";
import { useShareQuota } from "@/hooks/useShareQuota";
import { useIsAdmin } from "@/hooks/useIsAdmin";
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
  diamondStockNumber?: string; // For quota tracking
  showQuotaBadge?: boolean; // Show remaining shares badge
}

export function TelegramShareButton({ 
  title, 
  text, 
  url, 
  className = "", 
  variant = "outline", 
  size = "default",
  children,
  diamondStockNumber,
  showQuotaBadge = false
}: TelegramShareButtonProps) {
  const [isSharing, setIsSharing] = useState(false);
  const { webApp, share, showAlert, hapticFeedback } = useTelegramWebApp();
  const { quotaData, loading, useShare } = useShareQuota();
  const { isAdmin } = useIsAdmin();

  const handleShare = useCallback(async () => {
    if (isSharing) return; // Prevent double-clicks
    
    // Check quota before sharing (if stock number provided)
    if (diamondStockNumber && !isAdmin) {
      if (!quotaData || quotaData.sharesRemaining <= 0) {
        toast.error('No shares remaining! You have used all your 5 shares for this period.');
        return;
      }
      
      // Deduct from quota
      const success = await useShare(diamondStockNumber);
      if (!success) {
        toast.error('Failed to use share quota. Please try again.');
        return;
      }
    }
    
    setIsSharing(true);
    hapticFeedback.impact('medium');

    try {
      // Best practice: Use Telegram deep links that work within the ecosystem
      
      // Method 1: Telegram native sharing (highest priority)
      const tgWebApp = window.Telegram?.WebApp as any;
      if (tgWebApp?.switchInlineQuery) {
        try {
          // For Telegram sharing, use the deep link format that opens in the bot
          const telegramShareText = `${title}\n\n${text}${url ? `\n\n${url}` : ''}`;
          await tgWebApp.switchInlineQuery(telegramShareText, ['users', 'groups', 'channels']);
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
      const shareContent = url ? `${title}\n\n${text}\n\n${url}` : `${title}\n\n${text}`;
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
  }, [title, text, url, webApp, hapticFeedback, isSharing, diamondStockNumber, isAdmin, quotaData, useShare]);

  const sharesRemaining = isAdmin ? 999 : (quotaData?.sharesRemaining || 0);
  const canShare = isAdmin || !diamondStockNumber || sharesRemaining > 0;

  return (
    <div className="relative inline-flex items-center gap-2">
      <Button
        variant={variant}
        size={size}
        onClick={handleShare}
        disabled={isSharing || loading || !canShare}
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
      {showQuotaBadge && diamondStockNumber && (
        <Badge 
          variant={sharesRemaining <= 2 ? "destructive" : "secondary"}
          className="absolute -top-2 -right-2 min-w-[20px] h-5 flex items-center justify-center px-1"
        >
          {isAdmin ? "∞" : sharesRemaining}
        </Badge>
      )}
    </div>
  );
}