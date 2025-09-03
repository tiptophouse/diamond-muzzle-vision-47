
import { Share2, Copy, MessageCircle, Mail, Link } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface ShareButtonProps {
  className?: string;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg";
}

export function ShareButton({ className = "", variant = "outline", size = "default" }: ShareButtonProps) {
  const [showShareDialog, setShowShareDialog] = useState(false);
  const { toast } = useToast();

  const getCurrentUrl = () => {
    return window.location.href;
  };

  const shareOptions = [
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
