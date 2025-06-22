
import { Filter, Gem, Share2, Copy, MessageCircle, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface StoreHeaderProps {
  totalDiamonds: number;
  onOpenFilters: () => void;
}

export function StoreHeader({ totalDiamonds, onOpenFilters }: StoreHeaderProps) {
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
      color: "bg-blue-500 hover:bg-blue-600"
    },
    {
      name: "WhatsApp",
      icon: MessageCircle,
      action: () => {
        const text = `Check out our premium diamond collection! ${getCurrentUrl()}`;
        window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
      },
      color: "bg-green-500 hover:bg-green-600"
    },
    {
      name: "Email",
      icon: Mail,
      action: () => {
        const subject = "Premium Diamond Collection";
        const body = `I'd like to share our exclusive diamond collection with you: ${getCurrentUrl()}`;
        window.open(`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`, '_blank');
      },
      color: "bg-gray-500 hover:bg-gray-600"
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
        console.log('Share cancelled');
      }
    } else {
      setShowShareDialog(true);
    }
  };

  return (
    <div className="w-full">
      <div className="flex items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
          <div className="p-2 sm:p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg sm:rounded-xl shadow-lg flex-shrink-0">
            <Gem className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900 truncate">
              Diamond Collection
            </h1>
            <p className="text-sm sm:text-base text-slate-600 mt-0.5 sm:mt-1">
              <span className="hidden sm:inline">Discover our exquisite selection of </span>
              <span className="font-medium">{totalDiamonds}</span> 
              <span className="hidden sm:inline"> premium diamonds</span>
              <span className="sm:hidden"> diamonds</span>
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Share Button */}
          <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                onClick={handleNativeShare}
                className="flex items-center gap-2 border-slate-300 text-slate-700 hover:bg-slate-50 h-10 px-3 sm:px-4"
              >
                <Share2 className="h-4 w-4" />
                <span className="hidden sm:inline">Share</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="w-[95vw] max-w-md mx-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-lg">
                  <Share2 className="h-5 w-5" />
                  Share Diamond Collection
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-3 py-4">
                {shareOptions.map((option) => (
                  <Button
                    key={option.name}
                    onClick={option.action}
                    className={`w-full flex items-center gap-3 justify-start h-12 text-white ${option.color}`}
                  >
                    <option.icon className="h-5 w-5" />
                    {option.name}
                  </Button>
                ))}
              </div>
            </DialogContent>
          </Dialog>

          {/* Mobile Filter Button */}
          <Button
            variant="outline"
            onClick={onOpenFilters}
            className="lg:hidden flex items-center gap-2 border-slate-300 text-slate-700 hover:bg-slate-50 h-10 px-3 sm:px-4"
          >
            <Filter className="h-4 w-4" />
            <span className="hidden sm:inline">Filters</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
