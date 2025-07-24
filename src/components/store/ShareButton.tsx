
import { Share2, Copy, MessageCircle, Mail, Link, Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useTelegramAuth } from "@/context/TelegramAuthContext";
import { useTelegramWebApp } from "@/hooks/useTelegramWebApp";

interface ShareButtonProps {
  className?: string;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg";
  storeOwner?: {
    name: string;
    telegramId: number;
  };
  specificDiamond?: {
    stockNumber: string;
    carat: number;
    shape: string;
    color: string;
    clarity: string;
  };
}

export function ShareButton({ 
  className = "", 
  variant = "outline", 
  size = "default", 
  storeOwner,
  specificDiamond 
}: ShareButtonProps) {
  const [showShareDialog, setShowShareDialog] = useState(false);
  const { toast } = useToast();
  const { user } = useTelegramAuth();
  const { webApp } = useTelegramWebApp();

  const getCurrentUrl = () => {
    return window.location.href;
  };

  const getStoreShareUrl = () => {
    if (storeOwner) {
      const baseUrl = `https://t.me/MazalBotBot/app?startapp=store_${storeOwner.telegramId}`;
      if (specificDiamond) {
        return `${baseUrl}&stock=${specificDiamond.stockNumber}`;
      }
      return baseUrl;
    }
    
    // For current user's store
    const currentUserId = user?.id || 0;
    const baseUrl = `https://t.me/MazalBotBot/app?startapp=store_${currentUserId}`;
    if (specificDiamond) {
      return `${baseUrl}&stock=${specificDiamond.stockNumber}`;
    }
    return baseUrl;
  };

  const getShareText = () => {
    if (specificDiamond) {
      return `💎 Check out this ${specificDiamond.carat}ct ${specificDiamond.shape} diamond!\n\n${specificDiamond.color} color, ${specificDiamond.clarity} clarity\nStock #${specificDiamond.stockNumber}`;
    }
    
    if (storeOwner) {
      return `💎 Check out ${storeOwner.name}'s diamond collection!\n\nBrowse premium diamonds and find your perfect match.`;
    }
    
    return "Check out our premium diamond collection!";
  };

  const shareOptions = [
    {
      name: specificDiamond ? "Copy Diamond Link" : "Copy Store Link",
      icon: Copy,
      action: () => {
        navigator.clipboard.writeText(getStoreShareUrl());
        toast({
          title: specificDiamond ? "Diamond Link Copied!" : "Store Link Copied!",
          description: specificDiamond 
            ? "Diamond link has been copied to clipboard" 
            : "Store link has been copied to clipboard",
        });
        setShowShareDialog(false);
      },
      color: "bg-blue-500 hover:bg-blue-600",
      description: specificDiamond 
        ? "Copy the direct link to this diamond"
        : "Copy the store link to share anywhere"
    },
    {
      name: "Share via Telegram",
      icon: MessageCircle,
      action: () => {
        const text = getShareText();
        const url = getStoreShareUrl();
        
        if (webApp?.openTelegramLink) {
          webApp.openTelegramLink(`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`);
        } else {
          window.open(`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`, '_blank');
        }
      },
      color: "bg-blue-600 hover:bg-blue-700",
      description: "Share directly via Telegram"
    },
    {
      name: "WhatsApp",
      icon: MessageCircle,
      action: () => {
        const text = `${getShareText()}\n\n${getStoreShareUrl()}`;
        window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
      },
      color: "bg-green-500 hover:bg-green-600",
      description: "Share via WhatsApp"
    },
    {
      name: "Email",
      icon: Mail,
      action: () => {
        const subject = specificDiamond 
          ? `${specificDiamond.carat}ct ${specificDiamond.shape} Diamond - ${specificDiamond.color} ${specificDiamond.clarity}`
          : storeOwner ? `${storeOwner.name}'s Diamond Collection` : "Premium Diamond Collection";
        
        const body = `${getShareText()}\n\n${getStoreShareUrl()}\n\nBrowse our carefully curated selection of premium diamonds.`;
        window.open(`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`, '_blank');
      },
      color: "bg-gray-600 hover:bg-gray-700",
      description: "Share via Email"
    },
    {
      name: "Generate QR Code",
      icon: Link,
      action: () => {
        const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(getStoreShareUrl())}`;
        window.open(qrUrl, '_blank');
      },
      color: "bg-purple-500 hover:bg-purple-600",
      description: "Generate QR code for easy sharing"
    }
  ];

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: specificDiamond 
            ? `${specificDiamond.carat}ct ${specificDiamond.shape} Diamond`
            : storeOwner ? `${storeOwner.name}'s Diamond Store` : "Premium Diamond Collection",
          text: getShareText(),
          url: getStoreShareUrl(),
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
          <span className="hidden sm:inline">
            {specificDiamond ? "Share Diamond" : "Share Store"}
          </span>
          <span className="sm:hidden">Share</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="w-[95vw] max-w-md mx-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Store className="h-5 w-5 text-blue-600" />
            {specificDiamond ? "Share Diamond" : "Share Diamond Store"}
          </DialogTitle>
          <p className="text-sm text-slate-600">
            {specificDiamond 
              ? `Share this ${specificDiamond.carat}ct ${specificDiamond.shape} diamond`
              : storeOwner ? `Share ${storeOwner.name}'s collection` : "Share your diamond collection with clients and prospects"
            }
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
          <Store className="h-3 w-3 inline mr-1" />
          {specificDiamond 
            ? "Share specific diamond to reach interested buyers"
            : "Share your collection to reach more potential customers"
          }
        </div>
      </DialogContent>
    </Dialog>
  );
}
