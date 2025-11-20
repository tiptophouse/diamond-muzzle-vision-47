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

interface DiamondInfo {
  stock: string;
  shape: string;
  weight: number;
  color: string;
  clarity: string;
  price_per_carat: number;
  cut?: string;
  picture?: string;
}

interface ContactBuyerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  buyerId: number;
  buyerName: string;
  notificationId: string;
  diamonds: DiamondInfo[];
  searchQuery?: string;
  sellerTelegramId: number;
}

export function ContactBuyerDialog({
  open,
  onOpenChange,
  buyerId,
  buyerName,
  notificationId,
  diamonds,
  searchQuery,
  sellerTelegramId,
}: ContactBuyerDialogProps) {
  const [loading, setLoading] = useState(false);
  const [generatedMessage, setGeneratedMessage] = useState('');
  const [diamondData, setDiamondData] = useState<any[]>([]);
  const [totalValue, setTotalValue] = useState(0);
  const [stockNumbers, setStockNumbers] = useState<string[]>([]);
  const { impactOccurred, notificationOccurred } = useTelegramHapticFeedback();

  useEffect(() => {
    if (open && diamonds.length > 0) {
      generateMessage();
    }
  }, [open, diamonds]);

  const generateMessage = async () => {
    setLoading(true);
    try {
      console.log('🤖 Generating AI message for buyer:', buyerName);
      
      const { data, error } = await supabase.functions.invoke('generate-buyer-message', {
        body: {
          diamonds,
          buyerName,
          searchQuery,
        },
      });

      if (error) {
        console.error('❌ Edge function error:', error);
        throw error;
      }

      if (!data) {
        throw new Error('No data returned from edge function');
      }

      console.log('✅ AI message generated successfully');
      setGeneratedMessage(data.message);
      setDiamondData(data.diamonds);
      setTotalValue(data.totalValue);
      setStockNumbers(data.stockNumbers || []);
      impactOccurred('light');
      toast.success('Message generated successfully!');
      
    } catch (error: any) {
      console.error('❌ Failed to generate message:', error);
      
      // Provide helpful error messages
      if (error?.message?.includes('LOVABLE_API_KEY')) {
        toast.error('AI service not configured. Please contact support.');
      } else if (error?.status === 429) {
        toast.error('Too many requests. Please wait a moment and try again.');
      } else if (error?.status === 402) {
        toast.error('AI credits exhausted. Please add more credits.');
      } else {
        toast.error('Failed to generate message. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCopyMessage = () => {
    const fullMessage = `${generatedMessage}\n\n${diamondData.map((d, i) => 
      `💎 ${i + 1}. ${d.shape} ${d.weight}ct - ${d.color} ${d.clarity} - $${d.price.toLocaleString()} (${d.stock})`
    ).join('\n')}\n\n💰 Total: $${totalValue.toLocaleString()}`;

    navigator.clipboard.writeText(fullMessage);
    notificationOccurred('success');
    toast.success('Message copied to clipboard!');
  };

  const handleSendMessage = async () => {
    if (!generatedMessage) {
      toast.error('No message generated');
      return;
    }

    setLoading(true);
    try {
      impactOccurred('medium');
      
      console.log('📤 Sending message to buyer via Telegram bot:', buyerId);
      
      // Prepare diamond images (filter only valid image URLs)
      const diamondImages = diamondData
        .map(d => d.picture)
        .filter(pic => pic && (pic.startsWith('http://') || pic.startsWith('https://')));
      
      console.log('📸 Including diamond images:', diamondImages.length);

      // Get seller's Telegram username if available
      const WebApp = (window as any).Telegram?.WebApp;
      const sellerUsername = WebApp?.initDataUnsafe?.user?.username;

      // Send message via Telegram bot
      const { data, error } = await supabase.functions.invoke('send-seller-message', {
        body: {
          telegram_id: buyerId,
          message: generatedMessage,
          diamond_images: diamondImages,
          diamond_stocks: stockNumbers,
          seller_telegram_id: sellerTelegramId,
          seller_username: sellerUsername,
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
          notification_id: notificationId,
          diamond_count: diamonds.length,
          total_value: totalValue,
          message_preview: generatedMessage,
          diamonds_data: diamondData,
        },
      }).catch(err => console.error('⚠️ Failed to track contact:', err));

      console.log('✅ Message sent successfully to buyer:', buyerId);
      notificationOccurred('success');
      toast.success(`Message sent to ${buyerName}!`, {
        description: `Sent with ${diamondImages.length} diamond image${diamondImages.length !== 1 ? 's' : ''}`,
      });
      onOpenChange(false);
      
    } catch (error: any) {
      console.error('❌ Failed to send message:', error);
      
      // Handle specific errors
      if (error?.message?.includes('blocked')) {
        toast.error('Cannot send message', {
          description: 'The buyer has blocked the bot',
        });
      } else if (error?.message?.includes('not found')) {
        toast.error('Cannot send message', {
          description: 'Buyer not found',
        });
      } else {
        toast.error('Failed to send message', {
          description: 'Please try again or contact support',
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
            Contact {buyerName}
          </DialogTitle>
          <DialogDescription>
            AI-generated message with {diamonds.length} matched diamond{diamonds.length !== 1 ? 's' : ''}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-8 space-y-3">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Generating personalized message...</p>
            </div>
          ) : (
            <>
              {/* Generated Message */}
              <Card className="p-4 bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
                <div className="flex items-start gap-2 mb-3">
                  <Sparkles className="h-4 w-4 text-primary mt-1 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold mb-2">AI-Generated Message:</p>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{generatedMessage}</p>
                  </div>
                </div>
              </Card>

              {/* Diamond List */}
              <div className="space-y-2">
                <p className="text-sm font-semibold flex items-center gap-2">
                  <Diamond className="h-4 w-4" />
                  Matched Diamonds ({diamondData.length})
                </p>
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
                            Stock: {diamond.stock}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-sm text-primary">
                            ${diamond.price.toLocaleString()}
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
                  <p className="font-semibold text-sm">Total Value:</p>
                  <p className="font-bold text-lg text-primary">
                    ${totalValue.toLocaleString()}
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
                  Copy Message
                </Button>
                <Button
                  onClick={handleSendMessage}
                  disabled={loading}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Send via Telegram
                    </>
                  )}
                </Button>
              </div>

              <p className="text-xs text-muted-foreground text-center">
                {diamondData.filter(d => d.picture).length > 0 ? (
                  <>Message and {diamondData.filter(d => d.picture).length} diamond image{diamondData.filter(d => d.picture).length !== 1 ? 's' : ''} will be sent via Telegram bot</>
                ) : (
                  <>Message will be sent via Telegram bot</>
                )}
              </p>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
