import { useState } from "react";
import { Send, Users, MessageCircle, Copy, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Diamond } from "@/components/inventory/InventoryTable";
import { useTelegramHapticFeedback } from "@/hooks/useTelegramHapticFeedback";
import { useTelegramWebApp } from "@/hooks/useTelegramWebApp";
import { toast } from "@/hooks/use-toast";
import { formatCurrency } from "@/utils/numberUtils";
import { supabase } from "@/integrations/supabase/client";

interface QuickShareActionsProps {
  diamond: Diamond;
  className?: string;
}

export function QuickShareActions({ diamond, className = "" }: QuickShareActionsProps) {
  const [isSharing, setIsSharing] = useState(false);
  const { impactOccurred } = useTelegramHapticFeedback();
  const { user, webApp } = useTelegramWebApp();

  // Quick send to personal chat for preview
  const handleQuickPreview = async () => {
    if (isSharing) return;
    setIsSharing(true);
    impactOccurred('light');
    
    try {
      const userId = user?.id || webApp?.initDataUnsafe?.user?.id;
      
      if (!userId) {
        toast({
          title: "שגיאה",
          description: "לא ניתן לזהות משתמש",
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

      toast({
        title: "✅ נשלח לצפייה",
        description: "בדוק את הצ'אט האישי שלך",
        duration: 2000
      });
    } catch (error) {
      toast({
        title: "שגיאה",
        description: "לא ניתן לשלוח תצוגה מקדימה",
        variant: "destructive"
      });
    } finally {
      setIsSharing(false);
    }
  };

  // Quick copy diamond details
  const handleQuickCopy = async () => {
    impactOccurred('light');
    
    const price = diamond.price > 0 ? formatCurrency(diamond.price) : 'צור קשר למחיר';
    const message = `💎 ${diamond.carat} ct ${diamond.shape}
🎨 ${diamond.color} • ✨ ${diamond.clarity} • ⚡ ${diamond.cut}
💰 ${price}
📋 מק"ט: ${diamond.stockNumber}`;

    try {
      await navigator.clipboard.writeText(message);
      toast({
        title: "✅ הועתק",
        description: "פרטי היהלום הועתקו",
        duration: 2000
      });
    } catch (error) {
      toast({
        title: "שגיאה",
        description: "לא ניתן להעתיק",
        variant: "destructive"
      });
    }
  };

  // Quick Telegram share
  const handleQuickTelegramShare = () => {
    impactOccurred('light');
    
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
        title: "✅ פתיחת טלגרם",
        description: "בחר איתם לשתף",
        duration: 2000
      });
    } catch (error) {
      toast({
        title: "שגיאה",
        description: "לא ניתן לפתוח טלגרם",
        variant: "destructive"
      });
    }
  };

  return (
    <div className={`flex gap-2 ${className}`}>
      <Button
        variant="outline"
        size="sm"
        onClick={handleQuickPreview}
        disabled={isSharing}
        className="flex-1 h-8 text-xs"
      >
        <MessageCircle className="h-3 w-3 mr-1" />
        תצוגה
      </Button>
      
      <Button
        variant="outline"
        size="sm"
        onClick={handleQuickCopy}
        className="flex-1 h-8 text-xs"
      >
        <Copy className="h-3 w-3 mr-1" />
        העתק
      </Button>
      
      <Button
        variant="outline"
        size="sm"
        onClick={handleQuickTelegramShare}
        className="flex-1 h-8 text-xs"
      >
        <Send className="h-3 w-3 mr-1" />
        שתף
      </Button>
    </div>
  );
}