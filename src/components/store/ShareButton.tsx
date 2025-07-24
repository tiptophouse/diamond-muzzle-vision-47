
import { Share2, Copy, MessageCircle, Mail, Link, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface ShareButtonProps {
  className?: string;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg";
  storeOwner?: string;
}

export function ShareButton({ 
  className = "", 
  variant = "outline", 
  size = "default",
  storeOwner = "Diamond Store"
}: ShareButtonProps) {
  const [showShareDialog, setShowShareDialog] = useState(false);
  const { toast } = useToast();

  const getSecureStoreUrl = () => {
    // Create secure encrypted data for store sharing
    const storeData = {
      owner: storeOwner,
      timestamp: Date.now(),
      type: 'store'
    };
    
    // Base64 encode the data for the secure link
    const encryptedData = btoa(JSON.stringify(storeData));
    return `https://miniapp.mazalbot.com/secure-store/${encryptedData}`;
  };

  const shareOptions = [
    {
      name: "Copy Secure Link",
      icon: Copy,
      action: () => {
        navigator.clipboard.writeText(getSecureStoreUrl());
        toast({
          title: "Secure Store Link Copied!",
          description: "Share this link to show your diamond store securely",
        });
        setShowShareDialog(false);
      },
      color: "bg-blue-500 hover:bg-blue-600",
      description: "Secure link with view-only access"
    },
    {
      name: "WhatsApp",
      icon: MessageCircle,
      action: () => {
        const text = `Check out ${storeOwner}'s premium diamond collection! ${getSecureStoreUrl()}`;
        window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
      },
      color: "bg-green-500 hover:bg-green-600",
      description: "Share via WhatsApp"
    },
    {
      name: "Email",
      icon: Mail,
      action: () => {
        const subject = `${storeOwner} - Premium Diamond Collection`;
        const body = `I'd like to share ${storeOwner}'s exclusive diamond collection with you:\n\n${getSecureStoreUrl()}\n\nBrowse the carefully curated selection of premium diamonds with secure view-only access.`;
        window.open(`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`, '_blank');
      },
      color: "bg-gray-600 hover:bg-gray-700",
      description: "Share via Email"
    },
    {
      name: "Generate Marketing Link",
      icon: Link,
      action: () => {
        const marketingText = `✨ EXCLUSIVE DIAMOND COLLECTION ✨

${storeOwner} presents a curated selection of premium diamonds.

🔐 Secure viewing: ${getSecureStoreUrl()}

Browse our collection with secure, view-only access. Each diamond includes detailed specifications and certification.

#Diamonds #PremiumCollection #Investment #Luxury`;

        navigator.clipboard.writeText(marketingText);
        toast({
          title: "Marketing Text Copied!",
          description: "Professional marketing text with secure link copied to clipboard",
        });
        setShowShareDialog(false);
      },
      color: "bg-purple-500 hover:bg-purple-600",
      description: "Professional marketing copy"
    }
  ];

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${storeOwner} - Premium Diamond Collection`,
          text: "Check out this exclusive diamond collection",
          url: getSecureStoreUrl(),
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
            <Shield className="h-5 w-5 text-blue-600" />
            Share Store Securely
          </DialogTitle>
          <p className="text-sm text-slate-600">
            Share your diamond store with secure, view-only access
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
          <Shield className="h-3 w-3 inline mr-1" />
          Secure links provide view-only access and require Telegram authentication
        </div>
      </DialogContent>
    </Dialog>
  );
}
