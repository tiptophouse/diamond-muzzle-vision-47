import { Share2, Copy, MessageCircle, Mail, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useTutorial } from "@/contexts/TutorialContext";

interface SecureShareButtonProps {
  stockNumber: string;
  diamond?: {
    carat: number;
    shape: string;
    color: string;
    clarity: string;
    price: number;
  };
  className?: string;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg";
}

export function SecureShareButton({ 
  stockNumber, 
  diamond, 
  className = "", 
  variant = "outline", 
  size = "default" 
}: SecureShareButtonProps) {
  const [showShareDialog, setShowShareDialog] = useState(false);
  const { toast } = useToast();
  const tutorial = useTutorial();

  const getSecureUrl = () => {
    return `https://miniapp.mazalbot.com/secure-diamond/${stockNumber}`;
  };

  const getDiamondDescription = () => {
    if (!diamond) return `Check out this premium diamond - Stock #${stockNumber}`;
    
    return `${diamond.carat}ct ${diamond.shape} Diamond
${diamond.color} color, ${diamond.clarity} clarity
Price: $${diamond.price.toLocaleString()}
Stock #${stockNumber}`;
  };

  const shareOptions = [
    {
      name: "Copy Secure Link",
      icon: Copy,
      action: () => {
        navigator.clipboard.writeText(getSecureUrl());
        toast({
          title: "Secure Link Copied!",
          description: "Diamond link has been copied to clipboard with analytics tracking",
        });
        setShowShareDialog(false);
      },
      color: "bg-blue-500 hover:bg-blue-600",
      description: "Secure link with view analytics"
    },
    {
      name: "WhatsApp Share",
      icon: MessageCircle,
      action: () => {
        const text = `${getDiamondDescription()}\n\n${getSecureUrl()}`;
        window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
      },
      color: "bg-green-500 hover:bg-green-600",
      description: "Share via WhatsApp with diamond details"
    },
    {
      name: "Email Share",
      icon: Mail,
      action: () => {
        const subject = diamond 
          ? `${diamond.carat}ct ${diamond.shape} Diamond - ${diamond.color} ${diamond.clarity}`
          : `Premium Diamond - Stock #${stockNumber}`;
        const body = `${getDiamondDescription()}\n\nView this diamond: ${getSecureUrl()}\n\nThis is a secure link that tracks engagement analytics.`;
        window.open(`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`, '_blank');
      },
      color: "bg-gray-600 hover:bg-gray-700",
      description: "Professional email with diamond details"
    },
    {
      name: "Generate Marketing Text",
      icon: Shield,
      action: () => {
        const marketingText = `✨ EXCLUSIVE DIAMOND OPPORTUNITY ✨

${getDiamondDescription()}

🔐 Secure viewing: ${getSecureUrl()}

This premium diamond is available for immediate viewing. The secure link provides detailed specifications and tracks client engagement.

#Diamond #Investment #Luxury #PreciousStones`;

        navigator.clipboard.writeText(marketingText);
        toast({
          title: "Marketing Text Copied!",
          description: "Professional marketing text copied to clipboard",
        });
        setShowShareDialog(false);
      },
      color: "bg-purple-500 hover:bg-purple-600",
      description: "Professional marketing copy"
    }
  ];

  const handleNativeShare = async () => {
    // Handle tutorial interaction if available
    if (tutorial?.handleRequiredClick) {
      tutorial.handleRequiredClick();
    }
    
    // Create shareable link for tutorial or use secure URL
    const shareableLink = tutorial?.createShareableLink 
      ? tutorial.createShareableLink(stockNumber)
      : getSecureUrl();
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: diamond 
            ? `${diamond.carat}ct ${diamond.shape} Diamond`
            : `Premium Diamond #${stockNumber}`,
          text: getDiamondDescription(),
          url: shareableLink,
        });
      } catch (error) {
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
          data-tutorial="share-diamond"
          variant={variant}
          size={size}
          onClick={handleNativeShare}
          className={`flex items-center gap-2 ${className}`}
        >
          <Share2 className="h-4 w-4" />
          <span className="hidden sm:inline">Share</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="w-[95vw] max-w-md mx-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Shield className="h-5 w-5 text-blue-600" />
            Share Diamond Securely
          </DialogTitle>
          <p className="text-sm text-slate-600">
            Share with analytics tracking and Telegram-only access
          </p>
        </DialogHeader>
        <div className="space-y-3 py-4">
          {shareOptions.map((option) => (
            <div key={option.name} className="group">
              <Button
                onClick={option.action}
                className={`w-full flex items-center gap-3 justify-start h-16 text-white ${option.color} transition-all duration-200 group-hover:scale-[1.02]`}
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
          <Shield className="h-3 w-3 inline mr-1" />
          Secure links track views and require Telegram access
        </div>
      </DialogContent>
    </Dialog>
  );
}