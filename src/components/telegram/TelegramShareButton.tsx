// Optimized Telegram Share Button
import React, { useState } from 'react';
import { Share2, ExternalLink, Copy } from 'lucide-react';
import { TelegramOptimizedButton } from './TelegramOptimizedButton';
import { useTelegramSDK } from '@/hooks/useTelegramSDK';
import { toast } from 'sonner';

interface TelegramShareButtonProps {
  text: string;
  url?: string;
  title?: string;
  variant?: 'default' | 'outline' | 'ghost' | 'secondary';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
}

export function TelegramShareButton({
  text,
  url,
  title,
  variant = 'default',
  size = 'default',
  className
}: TelegramShareButtonProps) {
  const [isSharing, setIsSharing] = useState(false);
  const { ui, isTelegramEnvironment, isReady } = useTelegramSDK();

  const handleShare = async () => {
    setIsSharing(true);

    try {
      if (isReady && isTelegramEnvironment) {
        // Primary: Use Telegram's native sharing
        ui.share(text, url);
        toast.success('Shared via Telegram!');
      } else {
        // Fallback 1: Web Share API
        if (navigator.share) {
          await navigator.share({
            title: title || 'Share',
            text,
            url
          });
          toast.success('Shared successfully!');
        } else {
          // Fallback 2: Copy to clipboard
          const shareText = url ? `${text}\n${url}` : text;
          await navigator.clipboard.writeText(shareText);
          toast.success('Copied to clipboard!');
        }
      }
    } catch (error) {
      console.error('Share failed:', error);
      
      // Final fallback: Copy to clipboard
      try {
        const shareText = url ? `${text}\n${url}` : text;
        await navigator.clipboard.writeText(shareText);
        toast.success('Copied to clipboard!');
      } catch (clipboardError) {
        toast.error('Failed to share or copy text');
      }
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <TelegramOptimizedButton
      variant={variant}
      size={size}
      className={className}
      onClick={handleShare}
      disabled={isSharing}
      hapticFeedback="selection"
    >
      {size === 'icon' ? (
        <Share2 className="h-4 w-4" />
      ) : (
        <>
          <Share2 className="mr-2 h-4 w-4" />
          {isSharing ? 'Sharing...' : 'Share'}
        </>
      )}
    </TelegramOptimizedButton>
  );
}