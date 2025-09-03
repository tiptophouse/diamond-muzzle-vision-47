
import { Share2, Copy, MessageCircle, Mail, Link, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAdvancedTelegramSDK } from "@/hooks/useAdvancedTelegramSDK";

interface ShareButtonProps {
  className?: string;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg";
}

export function ShareButton({ className = "", variant = "outline", size = "default" }: ShareButtonProps) {
  const [showShareDialog, setShowShareDialog] = useState(false);
  const { toast } = useToast();
  const { shareToStory, isInitialized, haptics } = useAdvancedTelegramSDK();

  const getCurrentUrl = () => {
    return window.location.href;
  };

  const handleStoryShare = async () => {
    try {
      haptics.impact('light');
      
      // Generate store image for story
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas not supported');

      canvas.width = 1080;
      canvas.height = 1920;

      // Create gradient background
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      gradient.addColorStop(0, '#667eea');
      gradient.addColorStop(0.5, '#764ba2');
      gradient.addColorStop(1, '#f093fb');
      
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Add diamond emoji/icon
      ctx.font = '200px Arial';
      ctx.textAlign = 'center';
      ctx.fillStyle = '#ffffff';
      ctx.fillText('💎', canvas.width / 2, 400);

      // Add store title
      ctx.font = 'bold 80px Arial';
      ctx.fillStyle = '#ffffff';
      ctx.fillText('Premium Diamond', canvas.width / 2, 600);
      ctx.fillText('Collection', canvas.width / 2, 700);
      
      ctx.font = '50px Arial';
      ctx.fillText('Browse our exclusive selection', canvas.width / 2, 800);

      // Add branding
      ctx.font = '40px Arial';
      ctx.fillStyle = '#ffd700';
      ctx.fillText('Visit our store now!', canvas.width / 2, 1600);

      const mediaUrl = canvas.toDataURL('image/jpeg', 0.9);
      const storyText = '✨ Premium Diamond Collection\n💎 Browse our exclusive selection';
      const widgetUrl = getCurrentUrl();

      const success = shareToStory(mediaUrl, storyText, widgetUrl);
      
      if (success) {
        toast({
          title: "השיתוף הצליח! 📖",
          description: "החנות שותפה לסטורי בטלגרם",
        });
        haptics.notification('success');
      } else {
        toast({
          title: "שיתוף פותח בדפדפן 🌐",
          description: "השיתוף נפתח בחלון חדש",
        });
      }
      
      setShowShareDialog(false);
    } catch (error) {
      console.error('Story sharing failed:', error);
      toast({
        title: "שגיאה בשיתוף ❌",
        description: "נסה שוב מאוחר יותר",
        variant: "destructive"
      });
      haptics.notification('error');
    }
  };

  const shareOptions = [
    ...(isInitialized ? [{
      name: "Telegram Story",
      icon: Camera,
      action: handleStoryShare,
      color: "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700",
      description: "Share to your Telegram story"
    }] : []),
    {
      name: "Copy Link",
      icon: Copy,
      action: () => {
        navigator.clipboard.writeText(getCurrentUrl());
        toast({
          title: "Link Copied!",
          description: "Store link has been copied to clipboard",
        });
        setShowShareDialog(false);
      },
      color: "bg-blue-500 hover:bg-blue-600",
      description: "Copy the link to share anywhere"
    },
    {
      name: "WhatsApp",
      icon: MessageCircle,
      action: () => {
        const text = `Check out our premium diamond collection! ${getCurrentUrl()}`;
        window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
      },
      color: "bg-green-500 hover:bg-green-600",
      description: "Share via WhatsApp"
    },
    {
      name: "Email",
      icon: Mail,
      action: () => {
        const subject = "Premium Diamond Collection";
        const body = `I'd like to share our exclusive diamond collection with you:\n\n${getCurrentUrl()}\n\nBrowse our carefully curated selection of premium diamonds.`;
        window.open(`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`, '_blank');
      },
      color: "bg-gray-600 hover:bg-gray-700",
      description: "Share via Email"
    },
    {
      name: "Generate Link",
      icon: Link,
      action: () => {
        const shareableUrl = `${getCurrentUrl()}?shared=true`;
        navigator.clipboard.writeText(shareableUrl);
        toast({
          title: "Shareable Link Generated!",
          description: "A trackable link has been copied to clipboard",
        });
        setShowShareDialog(false);
      },
      color: "bg-purple-500 hover:bg-purple-600",
      description: "Generate a trackable sharing link"
    }
  ];

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Premium Diamond Collection",
          text: "Check out our exquisite selection of premium diamonds",
          url: getCurrentUrl(),
        });
      } catch (error) {
        // User cancelled sharing or error occurred
        setShowShareDialog(true);
      }
    } else {
      setShowShareDialog(true);
    }
  };

  return (
    <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
      <DialogTrigger asChild>
        <Button
          variant={variant}
          size={size}
          onClick={handleNativeShare}
          className={`flex items-center gap-2 ${className}`}
        >
          <Share2 className="h-4 w-4" />
          <span className="hidden sm:inline">Share Store</span>
          <span className="sm:hidden">Share</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="w-[95vw] max-w-md mx-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Share2 className="h-5 w-5 text-blue-600" />
            Share Your Diamond Store
          </DialogTitle>
          <p className="text-sm text-slate-600">
            Share your diamond collection with clients and prospects
          </p>
        </DialogHeader>
        <div className="space-y-3 py-4">
          {shareOptions.map((option) => (
            <div key={option.name} className="group">
              <Button
                onClick={option.action}
                className={`w-full flex items-center gap-3 justify-start h-14 text-white ${option.color} transition-all duration-200 group-hover:scale-[1.02]`}
              >
                <option.icon className="h-5 w-5" />
                <div className="text-left">
                  <div className="font-medium">{option.name}</div>
                  <div className="text-xs opacity-90">{option.description}</div>
                </div>
              </Button>
            </div>
          ))}
        </div>
        <div className="text-xs text-slate-500 text-center border-t pt-3">
          Share your collection to reach more potential customers
        </div>
      </DialogContent>
    </Dialog>
  );
}
