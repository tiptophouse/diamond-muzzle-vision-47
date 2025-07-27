import { Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTelegramWebApp } from "@/hooks/useTelegramWebApp";
import { Diamond } from "@/components/inventory/InventoryTable";

interface MobileShareButtonProps {
  diamond: Diamond;
  className?: string;
}

export function MobileShareButton({ diamond, className = "" }: MobileShareButtonProps) {
  const { hapticFeedback, share } = useTelegramWebApp();

  const handleShare = async () => {
    hapticFeedback.selection();
    
    const shareText = `💎 ${diamond.carat}ct ${diamond.shape} Diamond
    
📊 Specifications:
• Color: ${diamond.color}
• Clarity: ${diamond.clarity}
• Cut: ${diamond.cut}
• Lab: ${diamond.lab || 'N/A'}

💰 Price: $${diamond.price.toLocaleString()}
💎 Stock: #${diamond.stockNumber}

✨ View this premium diamond in our collection!`;

    try {
      await share(shareText, `${window.location.origin}/store?stock=${diamond.stockNumber}`);
    } catch (error) {
      console.error('Share failed:', error);
      // Fallback: copy to clipboard
      await navigator.clipboard.writeText(shareText);
      // Could show toast here but keeping it simple
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleShare}
      className={`flex items-center gap-2 h-9 px-3 ${className}`}
    >
      <Share2 className="h-4 w-4" />
      <span className="text-sm">Share</span>
    </Button>
  );
}
