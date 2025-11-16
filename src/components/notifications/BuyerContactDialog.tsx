import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Send, Diamond, Sparkles, Copy, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useTelegramHapticFeedback } from '@/hooks/useTelegramHapticFeedback';
import { api, apiEndpoints, getCurrentUserId } from '@/lib/api';
import { formatPrice } from '@/utils/numberUtils';

interface DiamondMatch {
  stock_number: string;
  shape: string;
  weight: number;
  color: string;
  clarity: string;
  total_price?: number;
  price_per_carat: number;
  cut?: string;
  picture?: string;
}

interface BuyerContactDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  buyerId: number;
  buyerName: string;
  notificationIds: string[];
  diamonds: DiamondMatch[];
  searchQuery?: any;
  sellerTelegramId: number;
  onMessageSent?: () => void;
}

export function BuyerContactDialog({
  open,
  onOpenChange,
  buyerId,
  buyerName,
  notificationIds,
  diamonds,
  searchQuery,
  sellerTelegramId,
  onMessageSent,
}: BuyerContactDialogProps) {
  const [loading, setLoading] = useState(false);
  const [generatedMessage, setGeneratedMessage] = useState('');
  const [diamondData, setDiamondData] = useState<any[]>([]);
  const [totalValue, setTotalValue] = useState(0);
  const [diamondImages, setDiamondImages] = useState<string[]>([]);
  const { impactOccurred, notificationOccurred } = useTelegramHapticFeedback();

  useEffect(() => {
    if (open && diamonds.length > 0) {
      fetchDiamondsAndGenerate();
    }
  }, [open, diamonds]);

  const fetchDiamondsAndGenerate = async () => {
    setLoading(true);
    try {
      console.log('🔍 Fetching full diamond data from FastAPI...');
      
      const userId = getCurrentUserId();
      if (!userId) {
        throw new Error('User not authenticated');
      }

      // Fetch full diamond details from FastAPI
      const { data: allDiamonds, error } = await api.get<any[]>(
        apiEndpoints.getAllStones(userId)
      );

      if (error || !allDiamonds) {
        throw new Error('Failed to fetch diamonds');
      }

      // Filter to get only selected diamonds with full data
      const selectedDiamonds = diamonds.map(match => {
        const fullDiamond = allDiamonds.find(d => d.stock === match.stock_number);
        return fullDiamond || match;
      });

      console.log('📸 Selected diamonds with images:', selectedDiamonds);

      // Extract image URLs
      const images = selectedDiamonds
        .map(d => d.picture)
        .filter(pic => pic && (pic.startsWith('http://') || pic.startsWith('https://')));

      setDiamondImages(images);
      console.log(`Found ${images.length} diamond images`);

      // Generate AI message
      console.log('🤖 Generating AI message for buyer:', buyerName);
      
      const { data, error: aiError } = await supabase.functions.invoke('generate-buyer-message', {
        body: {
          diamonds: selectedDiamonds,
          buyerName,
          searchQuery,
        },
      });

      if (aiError) {
        console.error('❌ Edge function error:', aiError);
        throw aiError;
      }

      if (!data) {
        throw new Error('No data returned from edge function');
      }

      console.log('✅ AI message generated successfully');
      setGeneratedMessage(data.message);
      setDiamondData(data.diamonds);
      setTotalValue(data.totalValue);
      impactOccurred('light');
      toast.success('הודעה נוצרה בהצלחה!', {
        description: `עם ${images.length} תמונות יהלומים`,
      });
      
    } catch (error: any) {
      console.error('❌ Failed to generate message:', error);
      
      if (error?.message?.includes('LOVABLE_API_KEY')) {
        toast.error('שירות ה-AI לא מוגדר. צור קשר עם התמיכה.');
      } else if (error?.status === 429) {
        toast.error('יותר מדי בקשות. נסה שוב בעוד רגע.');
      } else if (error?.status === 402) {
        toast.error('נגמר הקרדיט של ה-AI. הוסף עוד קרדיט.');
      } else {
        toast.error('שגיאה ביצירת ההודעה', {
          description: 'נסה שוב מאוחר יותר',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCopyMessage = () => {
    const fullMessage = `${generatedMessage}\n\n${diamondData.map((d, i) => 
      `💎 ${i + 1}. ${d.shape} ${d.weight}ct - ${d.color} ${d.clarity} - ${formatPrice(d.price)} (${d.stock})`
    ).join('\n')}\n\n💰 סה"כ: ${formatPrice(totalValue)}`;

    navigator.clipboard.writeText(fullMessage);
    notificationOccurred('success');
    toast.success('ההודעה הועתקה ללוח!');
  };

  const handleSendMessage = async () => {
    if (!generatedMessage) {
      toast.error('אין הודעה');
      return;
    }

    setLoading(true);
    try {
      impactOccurred('medium');
      
      console.log('📤 Sending diamond card message to buyer:', buyerId);
      
      // Recompute diamondImages from enriched diamondData at send-time
      const currentDiamondImages = diamondData
        .map(d => d.picture)
        .filter((u) => u && (u.startsWith('http://') || u.startsWith('https://')));
      
      // Compute diamondStocks from diamondData
      const diamondStocks = diamondData.map((d) => d.stock);
      
      console.log(`📸 Including ${currentDiamondImages.length} diamond images`);
      console.log(`💎 Including ${diamondStocks.length} diamond stock numbers`);

      // Send message with diamond cards and inline buttons via Telegram bot
      const { data, error } = await supabase.functions.invoke('send-seller-message', {
        body: {
          telegram_id: buyerId,
          message: generatedMessage,
          diamond_images: currentDiamondImages,
          diamond_stocks: diamondStocks,
        },
      });

      if (error) {
        console.error('❌ Failed to send message:', error);
        throw error;
      }

      if (!data?.success) {
        throw new Error(data?.error || 'Failed to send message');
      }

      // Track the contact (fire and forget)
      supabase.functions.invoke('track-buyer-contact', {
        body: {
          seller_telegram_id: sellerTelegramId,
          buyer_telegram_id: buyerId,
          buyer_name: buyerName,
          notification_id: notificationIds[0],
          diamond_count: diamonds.length,
          total_value: totalValue,
          message_preview: generatedMessage,
          diamonds_data: diamondData,
        },
      }).catch(err => console.error('⚠️ Failed to track contact:', err));

      console.log('✅ Message sent successfully to buyer:', buyerId);
      notificationOccurred('success');
      toast.success('ההודעה נשלחה בהצלחה!', {
        description: `נשלח עם ${diamondData.length} יהלומים`,
      });
      
      if (onMessageSent) {
        onMessageSent();
      }
      
      onOpenChange(false);
      
    } catch (error: any) {
      console.error('❌ Failed to send message:', error);
      
      if (error?.message?.includes('blocked')) {
        toast.error('לא ניתן לשלוח הודעה', {
          description: 'הקונה חסם את הבוט',
        });
      } else if (error?.message?.includes('not found')) {
        toast.error('לא ניתן לשלוח הודעה', {
          description: 'הקונה לא נמצא',
        });
      } else {
        toast.error('שגיאה בשליחת ההודעה', {
          description: 'נסה שוב או צור קשר עם התמיכה',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            יצירת קשר עם {buyerName}
          </DialogTitle>
          <DialogDescription>
            הודעה שנוצרה ב-AI עם {diamonds.length} יהלומים שנבחרו
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-8 space-y-3">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">יוצר הודעה מותאמת אישית...</p>
            </div>
          ) : (
            <>
              {/* Generated Message */}
              <Card className="p-4 bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
                <div className="flex items-start gap-2 mb-3">
                  <Sparkles className="h-4 w-4 text-primary mt-1 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold mb-2">הודעה שנוצרה ב-AI:</p>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{generatedMessage}</p>
                  </div>
                </div>
              </Card>

              {/* Diamond List with Images */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold flex items-center gap-2">
                    <Diamond className="h-4 w-4" />
                    יהלומים נבחרים ({diamondData.length})
                  </p>
                  {diamondImages.length > 0 && (
                    <Badge variant="secondary" className="gap-1">
                      <ImageIcon className="h-3 w-3" />
                      {diamondImages.length} תמונות
                    </Badge>
                  )}
                </div>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {diamondData.map((diamond, idx) => (
                    <Card key={idx} className="p-3 bg-background/50">
                      <div className="flex items-center gap-3">
                        {diamond.picture ? (
                          <div className="w-12 h-12 rounded-lg bg-accent flex items-center justify-center flex-shrink-0 overflow-hidden">
                            <img 
                              src={diamond.picture} 
                              alt={diamond.stock}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                              }}
                            />
                          </div>
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <Diamond className="h-6 w-6 text-primary" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm">
                            {diamond.shape} {diamond.weight}ct
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {diamond.color} • {diamond.clarity}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            מלאי: {diamond.stock}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-sm text-primary">
                            {formatPrice(diamond.price)}
                          </p>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Total Value */}
              <Card className="p-3 bg-primary/5 border-primary/20">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-sm">ערך כולל:</p>
                  <p className="font-bold text-lg text-primary">
                    {formatPrice(totalValue)}
                  </p>
                </div>
              </Card>

              {/* Actions */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={handleCopyMessage}
                  disabled={loading}
                  className="flex-1"
                >
                  <Copy className="h-4 w-4 mr-2" />
                  העתק
                </Button>
                <Button
                  onClick={handleSendMessage}
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      שולח...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      שלח בטלגרם
                    </>
                  )}
                </Button>
              </div>

              <p className="text-xs text-muted-foreground text-center">
                {diamondImages.length > 0 ? (
                  <>ההודעה ו-{diamondImages.length} תמונות יהלומים ישלחו דרך הבוט של טלגרם</>
                ) : (
                  <>ההודעה תישלח דרך הבוט של טלגרם</>
                )}
              </p>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
