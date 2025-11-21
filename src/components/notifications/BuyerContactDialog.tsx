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
      
      console.log('📤 Sending diamonds to buyer using send-diamond-to-group:', buyerId);
      console.log(`💎 Sending ${diamondData.length} diamonds`);

      // Get seller's username
      const WebApp = (window as any).Telegram?.WebApp;
      const sellerUsername = WebApp?.initDataUnsafe?.user?.username;
      const sellerFirstName = WebApp?.initDataUnsafe?.user?.first_name || '';
      const sellerLastName = WebApp?.initDataUnsafe?.user?.last_name || '';
      const sharerName = `${sellerFirstName}${sellerLastName ? ` ${sellerLastName}` : ''}`.trim() || `User ${sellerTelegramId}`;

      // Send each diamond individually using send-diamond-to-group (same as store)
      let successCount = 0;
      let failCount = 0;

      for (const diamond of diamondData) {
        try {
          console.log(`📤 Sending diamond ${diamond.stock} to buyer...`);
          
          const { error } = await supabase.functions.invoke('send-diamond-to-group', {
            body: {
              diamond: {
                id: diamond.id || diamond.stock,
                stockNumber: diamond.stock,
                carat: diamond.weight,
                shape: diamond.shape,
                color: diamond.color,
                clarity: diamond.clarity,
                cut: diamond.cut || 'EXCELLENT',
                price: diamond.price,
                imageUrl: diamond.picture,
                picture: diamond.picture,
              },
              sharedBy: sellerTelegramId,
              sharedByName: sharerName,
              testMode: false, // Send directly to buyer's chat
              targetChatId: buyerId, // Override to send to buyer
            },
          });

          if (error) {
            console.error(`❌ Failed to send diamond ${diamond.stock}:`, error);
            failCount++;
          } else {
            console.log(`✅ Diamond ${diamond.stock} sent successfully`);
            successCount++;
          }

          // Small delay between sends to avoid rate limits
          await new Promise(resolve => setTimeout(resolve, 500));
        } catch (err) {
          console.error(`❌ Error sending diamond ${diamond.stock}:`, err);
          failCount++;
        }
      }

      if (failCount > 0 && successCount === 0) {
        throw new Error('Failed to send any diamonds');
      }

      // Track the contact (fire and forget)
      supabase.functions.invoke('track-buyer-contact', {
        body: {
          seller_telegram_id: sellerTelegramId,
          buyer_telegram_id: buyerId,
          buyer_name: buyerName,
          notification_id: notificationIds[0],
          diamond_count: successCount,
          total_value: totalValue,
          message_preview: generatedMessage,
          diamonds_data: diamondData,
        },
      }).catch(err => console.error('⚠️ Failed to track contact:', err));

      console.log(`✅ Sent ${successCount} diamonds to buyer:`, buyerId);
      notificationOccurred('success');
      
      if (failCount > 0) {
        toast.success(`${successCount} יהלומים נשלחו`, {
          description: `${failCount} נכשלו. אנא נסה שוב למי שנכשל.`,
        });
      } else {
        toast.success('כל היהלומים נשלחו בהצלחה!', {
          description: `${successCount} יהלומים נשלחו לקונה`,
        });
      }
      
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

              {/* Diamond Image Gallery - Prominent Display */}
              {diamondImages.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-semibold flex items-center gap-2">
                    <ImageIcon className="h-4 w-4 text-primary" />
                    תמונות היהלומים ({diamondImages.length})
                  </p>
                  <div className="grid grid-cols-2 gap-2 max-h-80 overflow-y-auto">
                    {diamondData.filter(d => d.picture).map((diamond, idx) => (
                      <Card key={idx} className="overflow-hidden bg-background/50 border-primary/20">
                        <div className="aspect-square relative">
                          <img 
                            src={diamond.picture} 
                            alt={`${diamond.shape} ${diamond.weight}ct`}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'https://via.placeholder.com/200?text=No+Image';
                            }}
                          />
                          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                            <p className="text-white text-xs font-bold">
                              {diamond.shape} {diamond.weight}ct
                            </p>
                            <p className="text-white/80 text-[10px]">
                              {diamond.stock}
                            </p>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Diamond List Summary */}
              <div className="space-y-2">
                <p className="text-sm font-semibold flex items-center gap-2">
                  <Diamond className="h-4 w-4" />
                  סיכום יהלומים ({diamondData.length})
                </p>
                <div className="space-y-1.5 max-h-40 overflow-y-auto">
                  {diamondData.map((diamond, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 bg-background/30 rounded-lg border border-border/50">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-primary" />
                        <div>
                          <p className="font-semibold text-xs">
                            {diamond.shape} {diamond.weight}ct • {diamond.color} {diamond.clarity}
                          </p>
                          <p className="text-[10px] text-muted-foreground">
                            {diamond.stock}
                          </p>
                        </div>
                      </div>
                      <p className="font-bold text-xs text-primary">
                        {formatPrice(diamond.price)}
                      </p>
                    </div>
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
                כל יהלום יישלח כהודעה נפרדת עם תמונה וכפתורי פעולה לקונה
              </p>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
