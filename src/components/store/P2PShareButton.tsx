import { useState, useCallback } from "react";
import { Share2, Users, Send, Copy, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Diamond } from "@/components/inventory/InventoryTable";
import { useTelegramHapticFeedback } from "@/hooks/useTelegramHapticFeedback";
import { useTelegramWebApp } from "@/hooks/useTelegramWebApp";
import { toast } from "@/hooks/use-toast";
import { formatCurrency } from "@/utils/numberUtils";

interface P2PShareButtonProps {
  diamond: Diamond;
  className?: string;
  variant?: "default" | "outline" | "ghost" | "secondary";
  size?: "default" | "sm" | "lg";
}

export function P2PShareButton({ 
  diamond, 
  className = "", 
  variant = "default", 
  size = "default" 
}: P2PShareButtonProps) {
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [shareUrl, setShareUrl] = useState("");
  const { impactOccurred } = useTelegramHapticFeedback();
  const { webApp } = useTelegramWebApp();

  // Create shareable URL for the diamond
  const createShareUrl = useCallback(() => {
    const baseUrl = window.location.origin;
    const url = `${baseUrl}/diamond/${diamond.stockNumber}?shared=true&utm_source=p2p_share`;
    setShareUrl(url);
    return url;
  }, [diamond.stockNumber]);

  // Create shareable message
  const createShareMessage = useCallback(() => {
    const url = createShareUrl();
    const price = diamond.price > 0 ? formatCurrency(diamond.price) : 'Contact for Price';
    
    return `💎 *${diamond.carat} ct ${diamond.shape} Diamond*

🎨 Color: ${diamond.color}
✨ Clarity: ${diamond.clarity}
⚡ Cut: ${diamond.cut}
💰 Price: ${price}
🏷️ Stock: ${diamond.stockNumber}

View full details: ${url}

*Shared via BrilliantBot*`;
  }, [diamond, createShareUrl]);

  const handleShareClick = () => {
    impactOccurred('light');
    createShareUrl();
    setShowShareDialog(true);
  };

  const handleTelegramShare = useCallback(() => {
    impactOccurred('medium');
    
    const message = createShareMessage();
    const encodedMessage = encodeURIComponent(message);
    const telegramUrl = `https://t.me/share/url?url=&text=${encodedMessage}`;
    
    try {
      if (webApp) {
        webApp.openTelegramLink(telegramUrl);
      } else {
        window.open(telegramUrl, '_blank');
      }
      
      toast({
        title: "✅ Opening Telegram",
        description: "Choose who to share this diamond with",
      });
      
      setShowShareDialog(false);
    } catch (error) {
      console.error('Failed to open Telegram:', error);
      toast({
        title: "Error",
        description: "Failed to open Telegram sharing",
        variant: "destructive"
      });
    }
  }, [createShareMessage, webApp, impactOccurred]);

  const handleDirectMessage = useCallback(() => {
    impactOccurred('medium');
    
    const message = createShareMessage();
    const encodedMessage = encodeURIComponent(message);
    
    // Create a more direct sharing URL for personal chats
    const directUrl = `tg://msg?text=${encodedMessage}`;
    
    try {
      if (webApp) {
        webApp.openTelegramLink(directUrl);
      } else {
        // Fallback to web version
        window.open(`https://t.me/share/url?url=&text=${encodedMessage}`, '_blank');
      }
      
      toast({
        title: "✅ Opening Direct Message",
        description: "Send diamond details directly to someone",
      });
      
      setShowShareDialog(false);
    } catch (error) {
      console.error('Failed to open direct message:', error);
      handleTelegramShare(); // Fallback to regular share
    }
  }, [createShareMessage, webApp, impactOccurred, handleTelegramShare]);

  const handleCopyLink = useCallback(async () => {
    impactOccurred('light');
    
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast({
        title: "✅ Link Copied",
        description: "Diamond link copied to clipboard",
      });
    } catch (error) {
      // Fallback for browsers that don't support clipboard API
      const textArea = document.createElement('textarea');
      textArea.value = shareUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      
      toast({
        title: "✅ Link Copied",
        description: "Diamond link copied to clipboard",
      });
    }
  }, [shareUrl, impactOccurred]);

  const handleCopyMessage = useCallback(async () => {
    impactOccurred('light');
    
    const message = createShareMessage();
    
    try {
      await navigator.clipboard.writeText(message);
      toast({
        title: "✅ Message Copied",
        description: "Diamond details copied to clipboard",
      });
    } catch (error) {
      // Fallback for browsers that don't support clipboard API
      const textArea = document.createElement('textarea');
      textArea.value = message;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      
      toast({
        title: "✅ Message Copied",
        description: "Diamond details copied to clipboard",
      });
    }
  }, [createShareMessage, impactOccurred]);

  return (
    <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
      <DialogTrigger asChild>
        <Button
          variant={variant}
          size={size}
          onClick={handleShareClick}
          className={`flex items-center gap-2 ${className}`}
        >
          <Share2 className="h-4 w-4" />
          <span className="hidden sm:inline">Share P2P</span>
        </Button>
      </DialogTrigger>
      
      <DialogContent className="w-[95vw] max-w-md mx-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Share2 className="h-5 w-5 text-blue-600" />
            Share Diamond P2P
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            Share this diamond directly with anyone
          </p>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {/* Diamond Preview */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border border-blue-200">
            <div className="flex items-center gap-3">
              {diamond.imageUrl && (
                <img 
                  src={diamond.imageUrl} 
                  alt={`${diamond.shape} diamond`}
                  className="w-16 h-16 object-cover rounded-lg border"
                />
              )}
              <div className="flex-1">
                <h4 className="font-semibold text-blue-800">
                  {diamond.carat} ct {diamond.shape}
                </h4>
                <p className="text-sm text-blue-600">
                  {diamond.color} • {diamond.clarity} • {diamond.cut}
                </p>
                <p className="text-sm font-medium text-blue-700">
                  {diamond.price > 0 ? formatCurrency(diamond.price) : 'Contact for Price'}
                </p>
              </div>
            </div>
          </div>

          <Tabs defaultValue="telegram" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="telegram">Telegram</TabsTrigger>
              <TabsTrigger value="manual">Manual</TabsTrigger>
            </TabsList>
            
            <TabsContent value="telegram" className="space-y-3">
              <div className="space-y-2">
                <Button 
                  onClick={handleDirectMessage}
                  className="w-full flex items-center gap-2 bg-blue-500 hover:bg-blue-600"
                >
                  <Send className="h-4 w-4" />
                  Send Direct Message
                </Button>
                <p className="text-xs text-muted-foreground text-center">
                  Opens Telegram to send directly to someone
                </p>
              </div>
              
              <div className="space-y-2">
                <Button 
                  onClick={handleTelegramShare}
                  variant="outline"
                  className="w-full flex items-center gap-2"
                >
                  <Users className="h-4 w-4" />
                  Share to Contacts
                </Button>
                <p className="text-xs text-muted-foreground text-center">
                  Choose from your Telegram contacts
                </p>
              </div>
            </TabsContent>
            
            <TabsContent value="manual" className="space-y-3">
              <div className="space-y-2">
                <label className="text-sm font-medium">Diamond Link:</label>
                <div className="flex gap-2">
                  <Input 
                    value={shareUrl} 
                    readOnly 
                    className="flex-1 text-xs"
                  />
                  <Button 
                    onClick={handleCopyLink}
                    variant="outline"
                    size="sm"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2">
                <Button 
                  onClick={handleCopyMessage}
                  variant="outline"
                  className="w-full flex items-center gap-2"
                >
                  <Copy className="h-4 w-4" />
                  Copy Full Message
                </Button>
                <p className="text-xs text-muted-foreground text-center">
                  Copy formatted message with diamond details
                </p>
              </div>
            </TabsContent>
          </Tabs>

          <div className="bg-green-50 p-3 rounded-lg border border-green-200">
            <h4 className="font-medium text-green-800 mb-1">P2P Sharing Benefits:</h4>
            <ul className="text-xs text-green-700 space-y-1">
              <li>• No sharing limits or quotas</li>
              <li>• Direct person-to-person communication</li>
              <li>• Recipient gets full diamond details</li>
              <li>• Works with any messaging app</li>
              <li>• Instant sharing and viewing</li>
            </ul>
          </div>

          <Button 
            variant="outline" 
            onClick={() => setShowShareDialog(false)}
            className="w-full"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}