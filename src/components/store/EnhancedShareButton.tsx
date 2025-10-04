import { useState } from "react";
import { Share2, Users, Send, MessageCircle, Sparkles, Camera, Contact } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Diamond } from "@/components/inventory/InventoryTable";
import { useShareQuota } from "@/hooks/useShareQuota";
import { useSecureDiamondSharing } from "@/hooks/useSecureDiamondSharing";
import { useTelegramHapticFeedback } from "@/hooks/useTelegramHapticFeedback";
import { useTelegramWebApp } from "@/hooks/useTelegramWebApp";
import { useIsAdmin } from '@/hooks/useIsAdmin';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { formatCurrency } from "@/utils/numberUtils";

interface EnhancedShareButtonProps {
  diamond: Diamond;
  className?: string;
  variant?: "default" | "outline" | "ghost" | "secondary";
  size?: "default" | "sm" | "lg";
}

export function EnhancedShareButton({ 
  diamond, 
  className = "", 
  variant = "default", 
  size = "default" 
}: EnhancedShareButtonProps) {
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const { quotaData, loading, useShare } = useShareQuota();
  const { shareWithInlineButtons } = useSecureDiamondSharing();
  const { impactOccurred, notificationOccurred } = useTelegramHapticFeedback();
  const { isAdmin } = useIsAdmin();
  const { user, webApp } = useTelegramWebApp();

  const handleShareClick = () => {
    impactOccurred('light');
    setShowShareDialog(true);
  };

  // Share to customer group (with quota)
  const handleGroupShare = async () => {
    if (isSharing) return;
    setIsSharing(true);
    impactOccurred('medium');
    
    try {
      if (!isAdmin) {
        const success = await useShare(diamond.stockNumber);
        if (!success) {
          notificationOccurred('error');
          toast({
            title: "שגיאה בשימוש בחלק",
            description: "לא ניתן להשתמש בחלק הנוכחי",
            variant: "destructive"
          });
          return;
        }
      }

      const shared = await shareWithInlineButtons(diamond);
      
      if (shared) {
        impactOccurred('light');
        toast({
          title: "✅ יהלום נשלח לקבוצת הלקוחות!",
          description: "הלקוחות יכולים כעת לצפות ביהלום ויצירת קשר",
        });
        setShowShareDialog(false);
      } else {
        throw new Error("Failed to share to group");
      }
    } catch (error) {
      impactOccurred('heavy');
      toast({
        title: "שגיאה בשליחת היהלום",
        description: "אירעה שגיאה בשליחת היהלום לקבוצת הלקוחות",
        variant: "destructive"
      });
    } finally {
      setIsSharing(false);
    }
  };

  // Send directly to personal chat
  const handlePersonalShare = async () => {
    if (isSharing) return;
    setIsSharing(true);
    impactOccurred('medium');
    
    try {
      const userId = user?.id || webApp?.initDataUnsafe?.user?.id;
      
      if (!userId) {
        toast({
          title: "שגיאה בזיהוי משתמש",
          description: "לא ניתן לזהות את המשתמש",
          variant: "destructive"
        });
        return;
      }

      const { error } = await supabase.functions.invoke('send-diamond-to-group', {
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
            Image: (diamond as any).Image,
            image: (diamond as any).image,
            picture: (diamond as any).picture
          },
          sharedBy: userId,
          testMode: true
        }
      });

      if (error) throw error;

      impactOccurred('light');
      toast({
        title: "✅ יהלום נשלח לצ'אט האישי!",
        description: "בדוק את הצ'אט האישי בטלגרם לצפייה",
      });
      setShowShareDialog(false);
    } catch (error) {
      impactOccurred('heavy');
      toast({
        title: "שגיאה בשליחה",
        description: "אירעה שגיאה בשליחת היהלום",
        variant: "destructive"
      });
    } finally {
      setIsSharing(false);
    }
  };

  // Share via Telegram contacts
  const handleTelegramShare = () => {
    impactOccurred('medium');
    
    const price = diamond.price > 0 ? formatCurrency(diamond.price) : 'צור קשר למחיר';
    const message = `💎 *${diamond.carat} ct ${diamond.shape}*

🎨 צבע: ${diamond.color}
✨ ניקיון: ${diamond.clarity}  
⚡ חיתוך: ${diamond.cut}
💰 מחיר: ${price}
🏷️ מק"ט: ${diamond.stockNumber}

*נשלח דרך מערכת הלקוחות שלנו*`;

    const encodedMessage = encodeURIComponent(message);
    const telegramUrl = `https://t.me/share/url?url=&text=${encodedMessage}`;
    
    try {
      if (webApp) {
        webApp.openTelegramLink(telegramUrl);
      } else {
        window.open(telegramUrl, '_blank');
      }
      
      toast({
        title: "✅ פותח טלגרם",
        description: "בחר איתם לשתף את היהלום",
      });
      
      setShowShareDialog(false);
    } catch (error) {
      toast({
        title: "שגיאה",
        description: "לא ניתן לפתוח את טלגרם",
        variant: "destructive"
      });
    }
  };

  const getButtonVariant = () => {
    if (!quotaData || quotaData.sharesRemaining <= 0) return "outline";
    if (quotaData.sharesRemaining <= 2) return "default";
    return variant;
  };

  if (loading) {
    return (
      <Button variant="outline" size={size} disabled className={className}>
        <Share2 className="h-4 w-4 animate-pulse" />
        <span className="hidden sm:inline ml-2">טוען...</span>
      </Button>
    );
  }

  return (
    <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
      <DialogTrigger asChild>
        <Button
          variant={getButtonVariant()}
          size={size}
          onClick={handleShareClick}
          className={`flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white ${className}`}
        >
          <Sparkles className="h-4 w-4" />
          <span className="hidden sm:inline">שתף יהלום</span>
          <span className="sm:hidden">שתף</span>
          <Badge variant="secondary" className="ml-1 text-xs bg-white/20">
            {isAdmin ? "∞" : (quotaData?.sharesRemaining || 0)}
          </Badge>
        </Button>
      </DialogTrigger>
      
      <DialogContent className="w-[95vw] max-w-md mx-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Share2 className="h-5 w-5 text-purple-600" />
            שתף יהלום ללקוחות
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            בחר איך תרצה לשתף את היהלום עם הלקוחות שלך
          </p>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {/* Diamond Preview */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg border border-purple-200">
            <div className="flex items-center gap-3">
              {diamond.imageUrl && (
                <div className="relative">
                  <img 
                    src={diamond.imageUrl} 
                    alt={`${diamond.shape} diamond`}
                    className="w-16 h-16 object-cover rounded-lg border"
                  />
                  <div className="absolute top-1 right-1">
                    <Badge variant="secondary" className="text-xs">
                      <Camera className="h-2 w-2 mr-1" />
                    </Badge>
                  </div>
                </div>
              )}
              <div className="flex-1">
                <h4 className="font-semibold text-purple-800">
                  {diamond.carat} קראט {diamond.shape}
                </h4>
                <p className="text-sm text-purple-600">
                  {diamond.color} • {diamond.clarity} • {diamond.cut}
                </p>
                <p className="text-sm font-medium text-purple-700">
                  {diamond.price > 0 ? formatCurrency(diamond.price) : 'צור קשר למחיר'}
                </p>
                <p className="text-xs text-purple-500 mt-1">
                  מק"ט: #{diamond.stockNumber}
                </p>
              </div>
            </div>
          </div>

          <Tabs defaultValue="group" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="group" className="text-xs">קבוצת לקוחות</TabsTrigger>
              <TabsTrigger value="personal" className="text-xs">צ'אט אישי</TabsTrigger>
              <TabsTrigger value="contacts" className="text-xs">אנשי קשר</TabsTrigger>
            </TabsList>
            
            <TabsContent value="group" className="space-y-3">
              <div className="space-y-3">
                <Alert>
                  <Users className="h-4 w-4" />
                  <AlertDescription>
                    שיתוף לקבוצת הלקוחות הפרמיום שלך
                    <br />
                    <strong>נותרו {isAdmin ? "∞" : (quotaData?.sharesRemaining || 0)} שיתופים</strong>
                  </AlertDescription>
                </Alert>

                <Button 
                  onClick={handleGroupShare}
                  disabled={!isAdmin && (!quotaData || quotaData.sharesRemaining <= 0) || isSharing}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                >
                  <Users className="h-4 w-4 mr-2" />
                  {isSharing ? "שולח..." : "שלח לקבוצת הלקוחות"}
                </Button>

                <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
                  <h4 className="font-medium text-purple-800 mb-1">מה קורה כשאתה משתף:</h4>
                  <ul className="text-xs text-purple-700 space-y-1">
                    <li>• היהלום יישלח עם תמונה וכפתורים אינטראקטיביים</li>
                    <li>• לקוחות יוכלו לצפות בפרטים המלאים</li>
                    <li>• כפתור יצירת קשר ישיר איתך</li>
                    <li>• מעקב אחר צפיות ואינטראקציות</li>
                  </ul>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="personal" className="space-y-3">
              <div className="space-y-3">
                <Alert>
                  <MessageCircle className="h-4 w-4" />
                  <AlertDescription>
                    שליחה לצ'אט האישי שלך לבדיקה
                  </AlertDescription>
                </Alert>

                <Button 
                  onClick={handlePersonalShare}
                  disabled={isSharing}
                  variant="outline"
                  className="w-full"
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  {isSharing ? "שולח..." : "שלח לצ'אט האישי"}
                </Button>

                <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                  <h4 className="font-medium text-blue-800 mb-1">מצב בדיקה:</h4>
                  <ul className="text-xs text-blue-700 space-y-1">
                    <li>• היהלום יישלח לצ'אט האישי שלך</li>
                    <li>• תוכל לראות איך ההודעה תיראה</li>
                    <li>• לא נספר כשיתוף מהמכסה</li>
                  </ul>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="contacts" className="space-y-3">
              <div className="space-y-3">
                <Alert>
                  <Contact className="h-4 w-4" />
                  <AlertDescription>
                    שיתוף ישיר דרך אנשי הקשר שלך בטלגרם
                  </AlertDescription>
                </Alert>

                <Button 
                  onClick={handleTelegramShare}
                  variant="outline" 
                  className="w-full"
                >
                  <Send className="h-4 w-4 mr-2" />
                  פתח רשימת אנשי קשר
                </Button>

                <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                  <h4 className="font-medium text-green-800 mb-1">שיתוף ידני:</h4>
                  <ul className="text-xs text-green-700 space-y-1">
                    <li>• נפתח חלון שיתוף של טלגרם</li>
                    <li>• תוכל לבחור מאנשי הקשר שלך</li>
                    <li>• ההודעה תכלול פרטי יהלום מקוצרים</li>
                  </ul>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <Button 
            variant="outline" 
            onClick={() => setShowShareDialog(false)}
            className="w-full"
          >
            סגור
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}