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
  stock?: string; // Some APIs use 'stock' instead of 'stock_number'
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
    console.log('🔵 Dialog useEffect triggered:', { open, diamondsCount: diamonds.length, buyerId, buyerName });
    if (open && diamonds.length > 0) {
      console.log('🟢 Calling fetchDiamondsAndGenerate...');
      fetchDiamondsAndGenerate();
    } else {
      console.log('🔴 Dialog NOT calling fetchDiamondsAndGenerate:', { open, diamondsEmpty: diamonds.length === 0 });
    }
  }, [open, diamonds]);

  const fetchDiamondsAndGenerate = async () => {
    console.log('🟢 fetchDiamondsAndGenerate STARTED');
    console.log('🔵 Input data:', { buyerId, buyerName, diamondsCount: diamonds.length, sellerTelegramId });
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
      // Handle both 'stock' and 'stock_number' field names for robustness
      const selectedDiamonds = diamonds.map(match => {
        const matchStock = match.stock_number || match.stock;
        const fullDiamond = allDiamonds.find(d => 
          (d.stock === matchStock || d.stock_number === matchStock)
        );
        
        if (fullDiamond) {
          console.log(`✅ Found full data for diamond ${matchStock}:`, {
            hasPicture: !!fullDiamond.picture,
            picture: fullDiamond.picture?.substring(0, 50) + '...'
          });
          return fullDiamond;
        } else {
          console.warn(`⚠️ Using partial data for diamond ${matchStock} (not found in FastAPI)`);
          return match;
        }
      });

      // Extract image URLs from diamonds
      const images = selectedDiamonds
        .map(d => d.picture)
        .filter(pic => {
          if (!pic) return false;
          return typeof pic === 'string' && pic.trim().length > 0;
        });

      console.log(`📸 Image extraction summary:`, {
        totalDiamonds: selectedDiamonds.length,
        diamondsWithPictures: selectedDiamonds.filter(d => d.picture).length,
        extractedImages: images.length,
        imageUrls: images.map(img => img.substring(0, 50) + '...')
      });

      setDiamondImages(images);
      
      if (images.length === 0) {
        console.warn('⚠️ No images found for any diamonds! This might be a problem.');
        toast.info('אין תמונות', {
          description: 'יהלומים יישלחו ללא תמונות',
        });
      }

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
      console.log('📊 Generated data:', { 
        messageLength: data.message?.length, 
        diamondsCount: data.diamonds?.length,
        totalValue: data.totalValue,
        diamondsWithPictures: data.diamonds?.filter((d: any) => d.picture).length
      });
      console.log('📊 Diamond data details:', data.diamonds?.map((d: any) => ({
        stock: d.stock,
        picture: d.picture,
        hasPicture: !!d.picture
      })));
      setGeneratedMessage(data.message);
      setDiamondData(data.diamonds);
      setTotalValue(data.totalValue);
      impactOccurred('light');
      toast.success('הודעה נוצרה בהצלחה!', {
        description: `עם ${images.length} תמונות יהלומים`,
      });
      console.log('🟢 fetchDiamondsAndGenerate COMPLETED successfully');
      
    } catch (error: any) {
      console.error('❌ fetchDiamondsAndGenerate FAILED:', error);
      console.error('❌ Error details:', {
        message: error?.message,
        status: error?.status,
        stack: error?.stack
      });
      
      if (error?.message?.includes('LOVABLE_API_KEY')) {
        toast.error('שירות ה-AI לא מוגדר. צור קשר עם התמיכה.');
      } else if (error?.status === 429) {
        toast.error('יותר מדי בקשות. נסה שוב בעוד רגע.');
      } else if (error?.status === 402) {
        toast.error('נגמר הקרדיט של ה-AI. הוסף עוד קרדיט.');
      } else {
        toast.error('שגיאה ביצירת ההודעה', {
          description: error?.message || 'נסה שוב מאוחר יותר',
        });
      }
    } finally {
      console.log('🔵 fetchDiamondsAndGenerate FINALLY block, setting loading=false');
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
    try {
      console.log('🔵 ========== START SEND MESSAGE ==========');
      console.log('🔵 State check:', { 
        generatedMessage: !!generatedMessage, 
        messageLength: generatedMessage?.length,
        buyerId, 
        buyerName,
        diamondDataLength: diamondData.length,
        diamondImages: diamondImages.length,
        loading
      });

      if (!generatedMessage) {
        console.error('❌ VALIDATION FAILED: No generated message');
        toast.error('אין הודעה', {
          description: 'נא לנסות לסגור ולפתוח מחדש את החלון'
        });
        return;
      }

      if (!buyerId) {
        console.error('❌ VALIDATION FAILED: No buyer ID');
        toast.error('מזהה קונה חסר', {
          description: 'אנא נסה שנית'
        });
        return;
      }

      if (diamondData.length === 0) {
        console.error('❌ VALIDATION FAILED: No diamond data');
        toast.error('אין נתוני יהלומים', {
          description: 'אנא נסה שנית'
        });
        return;
      }

      console.log('✅ All validations passed, proceeding with send...');
      setLoading(true);
      impactOccurred('medium');
      
      // Show immediate feedback to user
      toast.info('שולח הודעה...', {
        description: `שולח ${diamondData.length} יהלומים לקונה`
      });
      
      console.log('📤 Starting message send process...');
      console.log('📤 Buyer ID:', buyerId);
      console.log('📤 Buyer Name:', buyerName);
      console.log(`📤 Sending ${diamondData.length} diamonds with AI message`);
      console.log('📤 Generated message preview:', generatedMessage.substring(0, 100) + '...');

      // Map diamonds to the format expected by send-rich-diamond-message
      const diamondsToSend = diamondData.map(d => {
        const payload = {
          stock_number: d.stock || d.stock_number,
          shape: d.shape,
          carat: d.weight,
          color: d.color,
          clarity: d.clarity,
          cut: d.cut || 'EXCELLENT',
          price: d.price || (d.price_per_carat * d.weight),
          picture: d.picture,
          certificate_url: d.certificate_url,
        };
        
        // Log each diamond's payload for debugging
        console.log(`💎 Diamond payload for ${payload.stock_number}:`, {
          hasPicture: !!payload.picture,
          pictureUrl: payload.picture?.substring(0, 50),
          price: payload.price
        });
        
        return payload;
      });

      console.log('📤 Payload summary:', {
        telegram_id: buyerId,
        message_length: generatedMessage.length,
        diamonds_count: diamondsToSend.length,
        diamonds_with_pictures: diamondsToSend.filter(d => d.picture).length,
        total_value: diamondsToSend.reduce((sum, d) => sum + d.price, 0)
      });

      // Send AI message + all diamonds in one call to buyer's personal chat
      console.log('📤 Invoking send-rich-diamond-message edge function...');
      
      const { data, error } = await supabase.functions.invoke('send-rich-diamond-message', {
        body: {
          telegram_id: buyerId,
          message: generatedMessage,
          diamonds: diamondsToSend,
        },
      });

      console.log('📤 Edge function response:', { 
        data, 
        error,
        hasData: !!data,
        hasError: !!error 
      });

      if (error) {
        console.error('❌ Edge function returned error:', {
          message: error.message,
          details: error,
          stack: error.stack
        });
        
        // Provide specific error message based on error type
        if (error.message?.includes('TELEGRAM_BOT_TOKEN')) {
          throw new Error('🔧 הבוט לא מוגדר במערכת. צור קשר עם התמיכה.');
        } else if (error.message?.includes('Max number of functions')) {
          throw new Error('⚠️ השירות זמני לא זמין. יש מגבלת פונקציות. צור קשר עם התמיכה.');
        } else if (error.message?.includes('blocked')) {
          throw new Error('🚫 הקונה חסם את הבוט. לא ניתן לשלוח הודעה.');
        } else {
          throw new Error(`❌ שגיאה בשליחה: ${error.message || 'נסה שוב'}`);
        }
      }

      console.log('✅ Message and diamonds sent successfully to buyer:', buyerId);
      console.log('✅ Send result:', data);


      // Track the contact (fire and forget)
      supabase.functions.invoke('track-buyer-contact', {
        body: {
          seller_telegram_id: sellerTelegramId,
          buyer_telegram_id: buyerId,
          buyer_name: buyerName,
          notification_id: notificationIds[0],
          diamond_count: diamondData.length,
          total_value: totalValue,
          message_preview: generatedMessage,
          diamonds_data: diamondData,
        },
      }).catch(err => console.error('⚠️ Failed to track contact:', err));

      notificationOccurred('success');
      toast.success('ההודעה נשלחה בהצלחה!', {
        description: `${diamondData.length} יהלומים נשלחו לצ'אט האישי של הקונה`,
      });
      
      if (onMessageSent) {
        onMessageSent();
      }
      
      onOpenChange(false);
      
    } catch (error: any) {
      console.error('❌ ========== SEND MESSAGE FAILED ==========');
      console.error('❌ Error type:', typeof error);
      console.error('❌ Error:', error);
      console.error('❌ Error message:', error?.message);
      console.error('❌ Error details:', {
        name: error?.name,
        message: error?.message,
        status: error?.status,
        statusText: error?.statusText,
        context: error?.context,
        details: error?.details,
        stack: error?.stack
      });
      
      notificationOccurred('error');
      
      if (error?.message?.includes('blocked')) {
        toast.error('לא ניתן לשלוח הודעה', {
          description: 'הקונה חסם את הבוט',
        });
      } else if (error?.message?.includes('not found')) {
        toast.error('לא ניתן לשלוח הודעה', {
          description: 'הקונה לא נמצא',
        });
      } else if (error?.message?.includes('TELEGRAM_BOT_TOKEN')) {
        toast.error('שגיאת תצורה', {
          description: 'הבוט לא מוגדר. צור קשר עם התמיכה',
        });
      } else {
        toast.error('שגיאה בשליחת ההודעה', {
          description: error?.message || 'נסה שוב או צור קשר עם התמיכה',
        });
      }
    } finally {
      console.log('🔵 ========== END SEND MESSAGE ==========');
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
                  disabled={loading || !generatedMessage || diamondData.length === 0}
                  className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      שולח...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      שלח בטלגרם ({diamondData.length} יהלומים
                      {diamondImages.length > 0 && `, ${diamondImages.length} תמונות`})
                    </>
                  )}
                </Button>
              </div>

              <p className="text-xs text-muted-foreground text-center">
                ההודעה וכל היהלומים יישלחו לצ'אט האישי של הקונה עם תמונות וכפתורי פעולה
              </p>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
