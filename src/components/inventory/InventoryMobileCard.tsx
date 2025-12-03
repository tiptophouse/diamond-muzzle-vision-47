import { memo, useState } from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Diamond } from "./InventoryTable";
import { Edit, Trash, Share2, Loader2 } from "lucide-react";
import { OptimizedDiamondImage } from "@/components/store/OptimizedDiamondImage";
import { formatPrice } from "@/utils/numberUtils";
import { useTelegramAdvanced } from "@/hooks/useTelegramAdvanced";
import { useToast } from "@/hooks/use-toast";
import { useTelegramWebApp } from "@/hooks/useTelegramWebApp";

interface InventoryMobileCardProps {
  diamond: Diamond;
  onEdit?: (diamond: Diamond) => void;
  onDelete?: (diamondId: string) => void;
}

export const InventoryMobileCard = memo(function InventoryMobileCard({ diamond, onEdit, onDelete }: InventoryMobileCardProps) {
  const [isSharing, setIsSharing] = useState(false);
  const { shareStory, features } = useTelegramAdvanced();
  const { hapticFeedback } = useTelegramWebApp();
  const { toast } = useToast();

  const handleShareToStory = async () => {
    // Check if mobile device
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    if (!isMobile) {
      toast({
        title: "📱 נדרש מכשיר נייד",
        description: "שיתוף לסטורי זמין רק באפליקציית טלגרם במכשיר נייד",
        variant: "destructive",
      });
      hapticFeedback.notification('error');
      return;
    }

    // Check Telegram version
    if (!features.hasStorySharing) {
      toast({
        title: "❌ עדכון נדרש",
        description: "שיתוף לסטורי דורש טלגרם גרסה 7.8 ומעלה. אנא עדכן את האפליקציה.",
        variant: "destructive",
      });
      hapticFeedback.notification('error');
      return;
    }

    // Get image URL - must be public HTTPS
    const imageUrl = diamond.picture || diamond.imageUrl || diamond.gem360Url;
    
    if (!imageUrl) {
      toast({
        title: "❌ אין תמונה",
        description: "לא ניתן לשתף יהלום ללא תמונה",
        variant: "destructive",
      });
      hapticFeedback.notification('error');
      return;
    }

    // Validate HTTPS URL
    if (!imageUrl.startsWith('https://')) {
      toast({
        title: "❌ תמונה לא תקינה",
        description: "נדרשת תמונה עם כתובת HTTPS",
        variant: "destructive",
      });
      hapticFeedback.notification('error');
      return;
    }

    setIsSharing(true);
    hapticFeedback.impact('light');
    
    toast({
      title: "⏳ משתף לסטורי...",
      description: "אנא המתן",
    });

    try {
      // Use correct deep link format
      const botUsername = 'MazalBotApp';
      const diamondId = diamond.diamondId || diamond.id;
      const widgetUrl = `https://t.me/${botUsername}?startapp=diamond_${diamondId}`;
      
      const success = await shareStory(imageUrl, {
        text: `💎 ${diamond.carat}ct ${diamond.shape} | ${diamond.color} • ${diamond.clarity}\n${formatPrice(diamond.price)}`,
        widgetLink: {
          url: widgetUrl,
          name: '💎 פרטים מלאים'
        }
      });

      if (success) {
        hapticFeedback.notification('success');
        toast({
          title: "✅ סטורי שותף בהצלחה!",
          description: "היהלום שותף לסטורי שלך",
        });
      } else {
        throw new Error('Share operation returned false');
      }
    } catch (error) {
      console.error('Story share error:', error);
      hapticFeedback.notification('error');
      toast({
        title: "❌ שגיאה בשיתוף",
        description: "לא ניתן לשתף לסטורי כרגע. ודא שאתה במכשיר נייד עם טלגרם עדכני.",
        variant: "destructive",
      });
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <Card className="w-full bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors">
      <CardContent className="p-3 sm:p-4 w-full">
        <div className="flex gap-4 mb-3">
          <div className="flex-shrink-0">
            <OptimizedDiamondImage
              imageUrl={diamond.imageUrl}
              gem360Url={diamond.gem360Url}
              stockNumber={diamond.stockNumber}
              shape={diamond.shape}
              className="w-20 h-20 rounded border"
            />
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="font-mono text-sm font-semibold text-slate-900 dark:text-slate-100 truncate mb-1">
              {diamond.stockNumber}
            </h3>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide">ID:</span>
              <span className="text-xs font-mono text-slate-600 dark:text-slate-400">{diamond.diamondId || 'N/A'}</span>
            </div>
            <p className="text-lg font-bold text-slate-800 dark:text-slate-200 capitalize">{diamond.shape}</p>
          </div>
          
          <div className="text-right flex-shrink-0">
            <p className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-1">
              {formatPrice(diamond.price)}
            </p>
            <Badge 
              className={`text-xs ${
                diamond.status === "Available" 
                  ? "bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-900 dark:text-emerald-200" 
                  : diamond.status === "Reserved" 
                  ? "bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900 dark:text-blue-200" 
                  : "bg-slate-100 text-slate-800 border-slate-300 dark:bg-slate-700 dark:text-slate-200"
              }`}
              variant="outline"
            >
              {diamond.status}
            </Badge>
          </div>
        </div>
        
        <div className="space-y-2 mb-3 w-full">
          <div className="flex justify-between items-center gap-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide">CARAT</span>
              <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">{diamond.carat.toFixed(2)}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide">CLARITY</span>
              <Badge variant="outline" className="bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-700 dark:text-slate-200 dark:border-slate-600 text-xs px-2">
                {diamond.clarity}
              </Badge>
            </div>
          </div>
          
          <div className="flex justify-between items-center gap-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide">COLOR</span>
              <Badge variant="outline" className="bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-700 dark:text-slate-200 dark:border-slate-600 text-xs px-2">
                {diamond.color}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide">CUT</span>
              <Badge variant="outline" className="bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-700 dark:text-slate-200 dark:border-slate-600 text-xs px-2">
                {diamond.cut}
              </Badge>
            </div>
          </div>
        </div>

        {(onEdit || onDelete) && (
          <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-700 w-full">
            <div className="flex gap-2 w-full">
              {onEdit && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(diamond)}
                  className="flex-1 h-9 text-sm dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              )}
              {onDelete && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onDelete(diamond.diamondId?.toString() || diamond.id)}
                  className="flex-1 h-9 text-sm text-red-600 border-red-200 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950"
                >
                  <Trash className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              )}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleShareToStory}
              disabled={isSharing}
              className="w-full h-9 text-sm bg-gradient-to-r from-blue-500 to-purple-500 text-white border-0 hover:from-blue-600 hover:to-purple-600 disabled:opacity-50"
            >
              {isSharing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  משתף...
                </>
              ) : (
                <>
                  <Share2 className="h-4 w-4 mr-2" />
                  📱 שתף לסטורי
                </>
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
});
