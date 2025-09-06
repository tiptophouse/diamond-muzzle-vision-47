import { Share, AlertTriangle, Users, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { useShareQuota } from "@/hooks/useShareQuota";
import { useSecureDiamondSharing } from "@/hooks/useSecureDiamondSharing";
import { useTelegramHapticFeedback } from "@/hooks/useTelegramHapticFeedback";
import { useIsAdmin } from '@/hooks/useIsAdmin';
import { Diamond } from "@/components/inventory/InventoryTable";

interface LimitedGroupShareButtonProps {
  diamond: Diamond;
  className?: string;
  variant?: "default" | "outline" | "ghost" | "secondary";
  size?: "default" | "sm" | "lg";
}

export function LimitedGroupShareButton({ 
  diamond, 
  className = "", 
  variant = "default", 
  size = "default" 
}: LimitedGroupShareButtonProps) {
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const { quotaData, loading, useShare } = useShareQuota();
  const { shareWithInlineButtons } = useSecureDiamondSharing();
  const { impactOccurred, notificationOccurred } = useTelegramHapticFeedback();
  const { isAdmin } = useIsAdmin();

  const handleShareClick = () => {
    console.log('🔍 SHARE CLICK DEBUG: Button clicked, isAdmin:', isAdmin, 'quotaData:', quotaData);
    impactOccurred('light');
    
    // Admin users bypass quota checks entirely
    if (isAdmin) {
      console.log('🔧 SHARE CLICK DEBUG: Admin bypass - opening dialog');
      setShowConfirmDialog(true);
      return;
    }
    
    if (!quotaData || quotaData.sharesRemaining <= 0) {
      console.error('❌ SHARE CLICK DEBUG: No shares remaining');
      notificationOccurred('error');
      return;
    }
    setShowConfirmDialog(true);
  };

  const handleConfirmShare = async () => {
    console.log('🔍 SHARE DEBUG: Share button clicked for diamond:', diamond.stockNumber);
    console.log('🔍 SHARE DEBUG: Current quota data:', quotaData);
    impactOccurred('medium');
    
    // First use the share quota
    console.log('🔍 SHARE DEBUG: Attempting to use share quota...');
    const success = await useShare(diamond.stockNumber);
    console.log('🔍 SHARE DEBUG: Share quota result:', success);
    
    if (success) {
      console.log('🔍 SHARE DEBUG: Quota used successfully, now sharing diamond...');
      // Then share the diamond
      const shared = await shareWithInlineButtons(diamond);
      console.log('🔍 SHARE DEBUG: Diamond sharing result:', shared);
      
      if (shared) {
        console.log('✅ SHARE DEBUG: Complete share process successful');
        notificationOccurred('success');
        setShowConfirmDialog(false);
      } else {
        console.error('❌ SHARE DEBUG: Diamond sharing failed');
        notificationOccurred('error');
      }
    } else {
      console.error('❌ SHARE DEBUG: Share quota usage failed');
      notificationOccurred('error');
    }
  };

  const getButtonVariant = () => {
    if (!quotaData || quotaData.sharesRemaining <= 0) return "outline";
    if (quotaData.sharesRemaining <= 2) return "default";
    return variant;
  };

  const getButtonColor = () => {
    if (!quotaData || quotaData.sharesRemaining <= 0) return "bg-muted text-muted-foreground";
    if (quotaData.sharesRemaining <= 2) return "bg-amber-500 hover:bg-amber-600 text-white";
    return "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white";
  };

  if (loading) {
    return (
      <Button variant="outline" size={size} disabled className={className}>
        <Share className="h-4 w-4 animate-pulse" />
        <span className="hidden sm:inline ml-2">Loading...</span>
      </Button>
    );
  }

  return (
    <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
      <DialogTrigger asChild>
        <Button
          variant={getButtonVariant()}
          size={size}
          onClick={handleShareClick}
          disabled={!isAdmin && (!quotaData || quotaData.sharesRemaining <= 0)}
          className={`flex items-center gap-2 relative ${getButtonColor()} ${className}`}
        >
          {quotaData && quotaData.sharesRemaining <= 2 && quotaData.sharesRemaining > 0 && (
            <AlertTriangle className="h-3 w-3 animate-pulse" />
          )}
          {quotaData && quotaData.sharesRemaining > 2 && (
            <Sparkles className="h-4 w-4" />
          )}
          {(!quotaData || quotaData.sharesRemaining <= 0) && (
            <Share className="h-4 w-4 opacity-50" />
          )}
          {quotaData && quotaData.sharesRemaining > 0 && quotaData.sharesRemaining <= 2 && (
            <Share className="h-4 w-4" />
          )}
          <span className="hidden sm:inline">
            Share to Group
          </span>
          <Badge variant="secondary" className="ml-1 text-xs">
            {isAdmin ? "∞" : (quotaData?.sharesRemaining || 0)}
          </Badge>
        </Button>
      </DialogTrigger>
      
      <DialogContent className="w-[95vw] max-w-md mx-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Users className="h-5 w-5 text-purple-600" />
            Share to Telegram Group
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            Premium group sharing with analytics tracking
          </p>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {quotaData && (
            <div className="text-center space-y-2">
              <div className="text-2xl font-bold">
                {quotaData.sharesRemaining} shares remaining
              </div>
              <div className="text-sm text-muted-foreground">
                out of {quotaData.sharesGranted} total shares
              </div>
            </div>
          )}

          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Are you sure you want to use one share?</strong>
              <br />
              This will send the diamond card directly to your Telegram group with inline buttons. 
              Once used, you'll have <strong>{(quotaData?.sharesRemaining || 1) - 1} shares left</strong>.
            </AlertDescription>
          </Alert>

          <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg border border-purple-200">
            <h4 className="font-semibold text-purple-800 mb-2">What happens when you share:</h4>
            <ul className="text-sm text-purple-700 space-y-1">
              <li>• Diamond card sent directly to group</li>
              <li>• Only registered users can view details</li>
              <li>• You get analytics on views and interactions</li>
              <li>• Contact button allows direct communication</li>
            </ul>
          </div>

          <div className="flex gap-2">
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={() => setShowConfirmDialog(false)}
            >
              Cancel
            </Button>
            <Button 
              className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
              onClick={handleConfirmShare}
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Share Now
            </Button>
          </div>

          {quotaData && quotaData.sharesRemaining <= 2 && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="text-amber-700">
                <strong>Running low on shares!</strong> Contact admin to increase your quota.
              </AlertDescription>
            </Alert>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}