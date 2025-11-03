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
  const [selectedDiamonds, setSelectedDiamonds] = useState<string[]>([]); // Stock numbers of selected diamonds
  const [selectedTone, setSelectedTone] = useState<'professional' | 'friendly' | 'brief'>('professional');
  const { impactOccurred, notificationOccurred } = useTelegramHapticFeedback();

  useEffect(() => {
    if (open) {
      fetchDiamondsAndGenerate();
    }
  }, [open, selectedTone]);

  // Select all diamonds by default when data loads
  useEffect(() => {
    if (diamonds.length > 0 && selectedDiamonds.length === 0) {
      setSelectedDiamonds(diamonds.map(d => d.stock_number || d.stock));
    }
  }, [diamonds]);

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
      console.log('💎 Fetched diamonds:', fetchedDiamonds.length, 'Sample:', fetchedDiamonds[0]);
      setDiamonds(fetchedDiamonds);

      // Generate AI response with only selected diamonds
      const diamondsToUse = selectedDiamonds.length > 0 
        ? fetchedDiamonds.filter((d: any) => selectedDiamonds.includes(d.stock_number || d.stock))
        : fetchedDiamonds;

      console.log('🤖 Generating AI response for', diamondsToUse.length, 'diamonds...');
      const { data: aiData, error: aiError } = await supabase.functions.invoke(
        'generate-ai-response',
        {
          body: {
            buyer_name: notification.buyer.name,
            diamonds: diamondsToUse,
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

      // Filter to only selected diamonds
      const selectedDiamondsData = diamonds.filter(d => 
        selectedDiamonds.includes(d.stock_number || d.stock)
      );

      // Prepare diamond images from selected diamonds only
      const diamondImages = selectedDiamondsData
        .map(d => d.picture || d.image_url || d.image)
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

      // Track the interaction with selected diamonds only
      await supabase.functions.invoke('track-buyer-contact', {
        body: {
          notification_id: notification.id,
          buyer_telegram_id: notification.buyer.telegram_id,
          buyer_name: notification.buyer.name,
          diamond_count: selectedDiamondsData.length,
          total_value: selectedDiamondsData.reduce((sum, d) => {
            const price = d.price_per_carat ? d.price_per_carat * d.weight : d.price || 0;
            return sum + price;
          }, 0),
          message_preview: generatedMessage,
          diamonds_data: selectedDiamondsData,
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

  const toggleDiamond = (stockNumber: string) => {
    setSelectedDiamonds(prev => 
      prev.includes(stockNumber) 
        ? prev.filter(s => s !== stockNumber)
        : [...prev, stockNumber]
    );
  };

  const toggleSelectAll = () => {
    if (selectedDiamonds.length === diamonds.length) {
      setSelectedDiamonds([]);
    } else {
      setSelectedDiamonds(diamonds.map(d => d.stock_number || d.stock));
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
                <div className="grid grid-cols-3 gap-3">
                  <Card className="p-3 bg-card border">
                    <div className="flex items-center gap-2 mb-1">
                      <Diamond className="h-4 w-4 text-primary" />
                      <span className="text-xs text-muted-foreground">נבחרו</span>
                    </div>
                    <p className="text-xl font-bold text-foreground">{selectedDiamonds.length}/{diamonds.length}</p>
                  </Card>

                  <Card className="p-3 bg-card border col-span-2">
                    <div className="flex items-center gap-2 mb-1">
                      <TrendingUp className="h-4 w-4 text-green-600" />
                      <span className="text-xs text-muted-foreground">שווי נבחרים</span>
                    </div>
                    <p className="text-xl font-bold text-green-600">
                      ${(diamonds.filter(d => selectedDiamonds.includes(d.stock_number || d.stock)).reduce((sum, d) => {
                        const price = d.price_per_carat ? d.price_per_carat * d.weight : d.price || 0;
                        return sum + price;
                      }, 0) / 1000).toFixed(1)}K
                    </p>
                  </Card>
                </div>

                {/* Select All Button */}
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={toggleSelectAll}
                  className="w-full"
                >
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  {selectedDiamonds.length === diamonds.length ? 'בטל הכל' : 'בחר הכל'}
                </Button>

                {/* Diamond Selection List */}
                <div className="max-h-[300px] overflow-y-auto space-y-2">
                  {diamonds.map((diamond, idx) => {
                    const stockNumber = diamond.stock_number || diamond.stock;
                    const isSelected = selectedDiamonds.includes(stockNumber);
                    const imageUrl = diamond.picture || diamond.image_url || diamond.image;
                    
                    return (
                      <Card 
                        key={idx} 
                        className={`p-3 cursor-pointer transition-all ${
                          isSelected ? 'bg-primary/5 border-primary' : 'bg-card border hover:border-primary/50'
                        }`}
                        onClick={() => toggleDiamond(stockNumber)}
                      >
                        <div className="flex items-center gap-3">
                          <input 
                            type="checkbox" 
                            checked={isSelected}
                            onChange={() => {}}
                            className="w-5 h-5 rounded border-2 cursor-pointer"
                          />
                          {imageUrl ? (
                            <div className="w-12 h-12 rounded bg-muted overflow-hidden flex-shrink-0">
                              <img 
                                src={imageUrl} 
                                alt={stockNumber}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  console.error('❌ Image failed to load:', imageUrl);
                                  (e.target as HTMLImageElement).style.display = 'none';
                                }}
                              />
                            </div>
                          ) : (
                            <div className="w-12 h-12 rounded bg-primary/10 flex items-center justify-center flex-shrink-0">
                              <Diamond className="h-6 w-6 text-primary" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-foreground truncate">
                              {diamond.shape} {diamond.weight}ct
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {diamond.color} {diamond.clarity} • {stockNumber}
                            </p>
                            <p className="text-xs font-semibold text-primary">
                              ${((diamond.price_per_carat || 0) * (diamond.weight || 0)).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
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
            disabled={loading || !generatedMessage || selectedDiamonds.length === 0}
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
                שלח {selectedDiamonds.length} יהלומים
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
