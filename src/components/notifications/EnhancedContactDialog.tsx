import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Loader2, 
  Send, 
  Sparkles, 
  Copy, 
  RefreshCw,
  CheckCircle2,
  Diamond,
  TrendingUp
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useTelegramHapticFeedback } from '@/hooks/useTelegramHapticFeedback';

interface EnhancedContactDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  notification: {
    id: string;
    buyer: {
      name: string;
      telegram_id: number;
      username?: string;
    };
    matches: any[];
    totalValue: number;
  };
  onMessageSent?: () => void;
}

export function EnhancedContactDialog({
  open,
  onOpenChange,
  notification,
  onMessageSent
}: EnhancedContactDialogProps) {
  const [loading, setLoading] = useState(false);
  const [generatedMessage, setGeneratedMessage] = useState('');
  const [diamonds, setDiamonds] = useState<any[]>([]);
  const [selectedTone, setSelectedTone] = useState<'professional' | 'friendly' | 'brief'>('professional');
  const { impactOccurred, notificationOccurred } = useTelegramHapticFeedback();

  useEffect(() => {
    if (open) {
      fetchDiamondsAndGenerate();
    }
  }, [open, selectedTone]);

  const fetchDiamondsAndGenerate = async () => {
    setLoading(true);
    try {
      // Get stock numbers from matches
      const stockNumbers = notification.matches.map(m => m.stock || m.stock_number);

      // Fetch fresh diamond data from FastAPI
      console.log('📡 Fetching fresh diamond data from FastAPI...');
      const { data: diamondData, error: diamondError } = await supabase.functions.invoke(
        'fetch-fastapi-diamonds',
        { body: { stock_numbers: stockNumbers } }
      );

      if (diamondError) throw diamondError;

      const fetchedDiamonds = diamondData?.diamonds || notification.matches;
      setDiamonds(fetchedDiamonds);

      // Generate AI response
      console.log('🤖 Generating AI response...');
      const { data: aiData, error: aiError } = await supabase.functions.invoke(
        'generate-ai-response',
        {
          body: {
            buyer_name: notification.buyer.name,
            diamonds: fetchedDiamonds,
            tone: selectedTone
          }
        }
      );

      if (aiError) throw aiError;

      setGeneratedMessage(aiData.message);
      impactOccurred('light');
      
    } catch (error: any) {
      console.error('❌ Error:', error);
      
      if (error?.message?.includes('RATE_LIMIT')) {
        toast.error('יותר מדי בקשות', {
          description: 'נסה שוב בעוד רגע'
        });
      } else if (error?.message?.includes('PAYMENT_REQUIRED')) {
        toast.error('נגמרו קרדיטים', {
          description: 'אנא הוסף קרדיטים'
        });
      } else {
        toast.error('שגיאה ביצירת הודעה', {
          description: 'נסה שוב'
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(generatedMessage);
    notificationOccurred('success');
    toast.success('הועתק ללוח!');
  };

  const handleSendMessage = async () => {
    setLoading(true);
    try {
      impactOccurred('medium');

      // Prepare diamond images
      const diamondImages = diamonds
        .map(d => d.picture || d.image_url)
        .filter(pic => pic && (pic.startsWith('http://') || pic.startsWith('https://')));

      // Send message via Telegram bot
      const { data, error } = await supabase.functions.invoke('send-seller-message', {
        body: {
          telegram_id: notification.buyer.telegram_id,
          message: generatedMessage,
          diamond_images: diamondImages.slice(0, 10), // Max 10 images
        },
      });

      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || 'Failed to send');

      // Track the interaction
      await supabase.functions.invoke('track-buyer-contact', {
        body: {
          notification_id: notification.id,
          buyer_telegram_id: notification.buyer.telegram_id,
          buyer_name: notification.buyer.name,
          diamond_count: diamonds.length,
          total_value: notification.totalValue,
          message_preview: generatedMessage,
          diamonds_data: diamonds,
        },
      }).catch(err => console.warn('⚠️ Tracking failed:', err));

      notificationOccurred('success');
      toast.success('הודעה נשלחה בהצלחה!', {
        description: `נשלח עם ${diamondImages.length} תמונות`,
      });

      onMessageSent?.();
      onOpenChange(false);

    } catch (error: any) {
      console.error('❌ Failed to send:', error);
      
      if (error?.message?.includes('blocked')) {
        toast.error('לא ניתן לשלוח', {
          description: 'הקונה חסם את הבוט',
        });
      } else {
        toast.error('שגיאה בשליחה', {
          description: 'נסה שוב',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Sparkles className="h-5 w-5 text-primary" />
            יצירת תגובה עבור {notification.buyer.name}
          </DialogTitle>
        </DialogHeader>

        <Tabs value={selectedTone} onValueChange={(v: any) => setSelectedTone(v)} className="flex-1 overflow-hidden flex flex-col">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="professional">מקצועי</TabsTrigger>
            <TabsTrigger value="friendly">ידידותי</TabsTrigger>
            <TabsTrigger value="קצר">brief</TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-y-auto p-1">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12 space-y-3">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">יוצר הודעה מותאמת אישית...</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Generated Message */}
                <Card className="p-4 bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
                  <div className="flex items-start gap-2 mb-3">
                    <Sparkles className="h-4 w-4 text-primary mt-1 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold mb-2 text-foreground">הודעה שנוצרה:</p>
                      <p className="text-sm leading-relaxed whitespace-pre-wrap text-foreground" dir="rtl">
                        {generatedMessage}
                      </p>
                    </div>
                  </div>
                </Card>

                {/* Summary Stats */}
                <div className="grid grid-cols-2 gap-3">
                  <Card className="p-3 bg-card border">
                    <div className="flex items-center gap-2 mb-1">
                      <Diamond className="h-4 w-4 text-primary" />
                      <span className="text-xs text-muted-foreground">יהלומים</span>
                    </div>
                    <p className="text-xl font-bold text-foreground">{diamonds.length}</p>
                  </Card>

                  <Card className="p-3 bg-card border">
                    <div className="flex items-center gap-2 mb-1">
                      <TrendingUp className="h-4 w-4 text-green-600" />
                      <span className="text-xs text-muted-foreground">שווי</span>
                    </div>
                    <p className="text-xl font-bold text-green-600">
                      ${(notification.totalValue / 1000).toFixed(1)}K
                    </p>
                  </Card>
                </div>

                {/* Diamond Preview Grid */}
                <div className="grid grid-cols-2 gap-2">
                  {diamonds.slice(0, 4).map((diamond, idx) => (
                    <Card key={idx} className="p-2 bg-card border">
                      <div className="flex items-center gap-2">
                        {diamond.picture ? (
                          <div className="w-10 h-10 rounded bg-muted overflow-hidden flex-shrink-0">
                            <img 
                              src={diamond.picture} 
                              alt={diamond.stock_number || diamond.stock}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                              }}
                            />
                          </div>
                        ) : (
                          <div className="w-10 h-10 rounded bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <Diamond className="h-5 w-5 text-primary" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-foreground truncate">
                            {diamond.shape} {diamond.weight}ct
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {diamond.color} {diamond.clarity}
                          </p>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>

                {diamonds.length > 4 && (
                  <p className="text-xs text-center text-muted-foreground">
                    +{diamonds.length - 4} יהלומים נוספים יישלחו
                  </p>
                )}
              </div>
            )}
          </div>
        </Tabs>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-4 border-t">
          <Button
            variant="outline"
            onClick={handleCopyMessage}
            disabled={loading || !generatedMessage}
            className="flex-1"
          >
            <Copy className="h-4 w-4 mr-2" />
            העתק
          </Button>
          
          <Button
            variant="outline"
            onClick={fetchDiamondsAndGenerate}
            disabled={loading}
            className="flex-1"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            צור מחדש
          </Button>

          <Button
            onClick={handleSendMessage}
            disabled={loading || !generatedMessage}
            className="flex-[2] bg-gradient-to-r from-green-600 to-green-700 hover:opacity-90 text-white font-semibold"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                שולח...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                שלח דרך טלגרם
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
