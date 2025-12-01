import { Share, AlertTriangle, Users, Sparkles, Camera, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { useShareQuota } from "@/hooks/useShareQuota";
import { useSecureDiamondSharing } from "@/hooks/useSecureDiamondSharing";
import { useTelegramHapticFeedback } from "@/hooks/useTelegramHapticFeedback";
import { useTelegramMainButton } from "@/hooks/useTelegramMainButton";
import { useIsAdmin } from '@/hooks/useIsAdmin';
import { Diamond } from "@/components/inventory/InventoryTable";
import { useTelegramWebApp } from "@/hooks/useTelegramWebApp";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

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
  const { user } = useTelegramWebApp();

  const handleShareClick = () => {
    impactOccurred('light');
    
    // Admin users bypass quota checks entirely
    if (isAdmin) {
      setShowConfirmDialog(true);
      return;
    }
    
    if (!quotaData || quotaData.sharesRemaining <= 0) {
      notificationOccurred('error');
      return;
    }
    setShowConfirmDialog(true);
  };

  const handleTestShare = async () => {
    impactOccurred('medium');
    
    try {
      // Show loading state
      toast({
        title: "שולח הודעת בדיקה...",
        description: "מעבד את הבקשה",
      });

      // Try to get user ID from different sources
      let userId = user?.id;
      
      // Fallback: try to get user data from Telegram WebApp directly
      if (!userId && window.Telegram?.WebApp) {
        const telegramUser = window.Telegram.WebApp.initDataUnsafe?.user;
        if (telegramUser) {
          userId = telegramUser.id;
        }
      }
      
      if (!userId) {
        toast({
          title: "שגיאה בזיהוי משתמש",
          description: "לא ניתן לזהות את המשתמש. נסה לרענן את הדף.",
          variant: "destructive"
        });
        return;
      }

      // Send to group -1002178695748 with test mode flag
      const { data, error } = await supabase.functions.invoke('send-diamond-to-group', {
        body: {
          diamond: {
            id: diamond.id,
            stockNumber: diamond.stockNumber,
            carat: diamond.carat,
            shape: diamond.shape,
            color: diamond.color,
            clarity: diamond.clarity,
            cut: diamond.cut,
            price: diamond.price,
            imageUrl: diamond.imageUrl,
            gem360Url: diamond.gem360Url,
            // Include CSV image fallbacks
            Image: (diamond as any).Image,
            image: (diamond as any).image,
            picture: (diamond as any).picture
          },
          sharedBy: userId,
          targetChatId: -1002178695748, // Send to Brilliantbot group
          testMode: true // Mark as test for message prefix
        }
      });

      if (error) {
        impactOccurred('heavy');
        toast({
          title: "שגיאה בשליחת הודעת בדיקה",
          description: error.message || "אירעה שגיאה לא צפויה",
          variant: "destructive"
        });
        return;
      }

      impactOccurred('light');
      toast({
        title: "✅ הודעת בדיקה נשלחה בהצלחה!",
        description: "בדוק את הצ'אט האישי שלך בטלגרם לצפייה בהודעה",
      });
      
      setShowConfirmDialog(false);
    } catch (error) {
      impactOccurred('heavy');
      toast({
        title: "שגיאה בשליחת הודעת בדיקה",
        description: "אירעה שגיאה בשליחת ההודעה",
        variant: "destructive"
      });
    }
  };

  const handleConfirmShare = async () => {
    impactOccurred('medium');
    
    try {
      // Show loading state
      toast({
        title: "שולח יהלום לקבוצה...",
        description: "מעבד את הבקשה",
      });

      // First use the share quota (skip for admin)
      if (!isAdmin) {
        const success = await useShare(diamond.stockNumber);
        if (!success) {
          impactOccurred('heavy');
          toast({
            title: "שגיאה בשימוש בחלק",
            description: "לא ניתן להשתמש בחלק הנוכחי",
            variant: "destructive"
          });
          return;
        }
      }
      
      // Then share the diamond
      const shared = await shareWithInlineButtons(diamond);
      
      if (shared) {
        impactOccurred('light');
        toast({
          title: "✅ יהלום נשלח לקבוצה!",
          description: "עובר לצ'אט הקבוצה...",
        });
        setShowConfirmDialog(false);
        
        // Redirect to group chat after successful share
        setTimeout(() => {
          if (window.Telegram?.WebApp) {
            window.Telegram.WebApp.close();
          }
        }, 1000);
      } else {
        impactOccurred('heavy');
        toast({
          title: "שגיאה בשליחת היהלום",
          description: "אירעה שגיאה בשליחת היהלום לקבוצה",
          variant: "destructive"
        });
      }
    } catch (error) {
      impactOccurred('heavy');
      toast({
        title: "שגיאה בשליחת היהלום",
        description: "אירעה שגיאה לא צפויה",
        variant: "destructive"
      });
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
      
      <DialogContent className="w-[95vw] max-w-md mx-auto max-h-[85vh] overflow-y-auto">
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
          {/* Diamond Preview */}
          {diamond.imageUrl && (
            <div className="flex justify-center">
              <div className="relative rounded-lg overflow-hidden border border-border">
                <img 
                  src={diamond.imageUrl} 
                  alt={`${diamond.shape} diamond ${diamond.carat}ct`}
                  className="w-32 h-32 object-cover"
                />
                <div className="absolute top-2 right-2">
                  <Badge variant="secondary" className="text-xs">
                    <Camera className="h-3 w-3 mr-1" />
                    תמונה
                  </Badge>
                </div>
              </div>
            </div>
          )}

          {/* Diamond Details */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg border border-purple-200">
            <h4 className="font-semibold text-purple-800 mb-2 flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              פרטי היהלום שישלח
            </h4>
            <div className="grid grid-cols-2 gap-2 text-sm text-purple-700">
              <div>🏷️ <strong>{diamond.carat}</strong> קראט</div>
              <div>💎 <strong>{diamond.shape}</strong></div>
              <div>🎨 צבע <strong>{diamond.color}</strong></div>
              <div>✨ ניקיון <strong>{diamond.clarity}</strong></div>
              <div>⚡ חיתוך <strong>{diamond.cut}</strong></div>
              <div>💰 <strong>${diamond.price?.toLocaleString() || 'צור קשר'}</strong></div>
            </div>
          </div>

          {/* Quota Information */}
          {quotaData && (
            <div className="text-center space-y-2">
              <div className="text-2xl font-bold">
                {isAdmin ? "∞" : quotaData.sharesRemaining} שיתופים נותרו
              </div>
              <div className="text-sm text-muted-foreground">
                {isAdmin ? "מנהל - שיתופים בלתי מוגבלים" : `מתוך ${quotaData.sharesGranted} שיתופים כולל`}
              </div>
            </div>
          )}

          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>האם אתה בטוח שאתה רוצה להשתמש בשיתוף אחד?</strong>
              <br />
              זה ישלח את כרטיס היהלום ישירות לקבוצת הטלגרם שלך עם כפתורים אינטראקטיביים. 
              לאחר השימוש, יישארו לך <strong>{isAdmin ? "∞" : (quotaData?.sharesRemaining || 1) - 1} שיתופים</strong>.
            </AlertDescription>
          </Alert>

          <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg border border-purple-200">
            <h4 className="font-semibold text-purple-800 mb-2">מה קורה כשאתה משתף:</h4>
            <ul className="text-sm text-purple-700 space-y-1">
              <li>• כרטיס יהלום נשלח ישירות לקבוצה</li>
              <li>• {diamond.imageUrl ? "תמונת היהלום תוצג בהודעה" : "הודעה טקסטואלית תישלח"}</li>
              <li>• רק משתמשים רשומים יכולים לצפות בפרטים</li>
              <li>• אתה מקבל אנליטיקה על צפיות ואינטראקציות</li>
              <li>• כפתור יצירת קשר מאפשר תקשורת ישירה</li>
              <li>• כפתור הצעת מחיר/בקשת הצעה זמין</li>
            </ul>
          </div>

          <div className="flex flex-col gap-3 mt-6">
            <Button 
              className="w-full h-12 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-medium text-base"
              onClick={handleConfirmShare}
            >
              <Sparkles className="h-4 w-4 mr-2" />
              שתף עכשיו ועבור לצ'אט
            </Button>
            
            <Button 
              variant="outline" 
              className="w-full h-10"
              onClick={() => setShowConfirmDialog(false)}
            >
              ביטול
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