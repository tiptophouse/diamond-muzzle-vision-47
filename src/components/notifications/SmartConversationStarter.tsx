import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { MessageSquare, Wand2, Send, Copy, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

interface ConversationStarter {
  type: 'professional' | 'consultative' | 'personal';
  message: string;
  tone: string;
}

interface SmartConversationStarterProps {
  customerInfo: {
    telegram_id?: number;
    searchQuery?: string;
    diamonds?: any[];
    customerName?: string;
  };
  onMessageSent?: () => void;
}

export function SmartConversationStarter({ customerInfo, onMessageSent }: SmartConversationStarterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [conversationStarters, setConversationStarters] = useState<ConversationStarter[]>([]);
  const [selectedMessage, setSelectedMessage] = useState('');
  const [customMessage, setCustomMessage] = useState('');
  const { toast } = useToast();

  const generateConversationStarters = async () => {
    setIsGenerating(true);
    try {
      console.log('🤖 Generating conversation starters for:', customerInfo);
      
      const { data, error } = await supabase.functions.invoke('generate-conversation-starter', {
        body: {
          customerInfo,
          language: 'he'
        }
      });

      if (error) {
        console.error('❌ Error generating conversation starters:', error);
        toast({
          title: "שגיאה ביצירת הודעות",
          description: error.message || "נכשל ביצירת הצעות הודעות",
          variant: "destructive"
        });
        return;
      }

      if (data?.success && data.conversation_starters) {
        setConversationStarters(data.conversation_starters);
        console.log('✅ Generated conversation starters:', data.conversation_starters);
      }
    } catch (error) {
      console.error('❌ Failed to generate conversation starters:', error);
      toast({
        title: "שגיאה",
        description: "נכשל ביצירת הצעות הודעות חכמות",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const sendMessage = async (message: string) => {
    if (!customerInfo.telegram_id || !message.trim()) {
      toast({
        title: "שגיאה",
        description: "חסרים פרטי לקוח או הודעה",
        variant: "destructive"
      });
      return;
    }

    setIsSending(true);
    try {
      console.log('📤 Sending message via Telegram bot');
      
      const bestDiamond = customerInfo.diamonds?.[0];
      
      // Prepare diamond data if available
      const diamondData = bestDiamond ? {
        stock_number: bestDiamond.stock_number || bestDiamond.stock || '',
        shape: bestDiamond.shape || '',
        weight: bestDiamond.weight || bestDiamond.carat || 0,
        color: bestDiamond.color || '',
        clarity: bestDiamond.clarity || '',
        cut: bestDiamond.cut,
        price_per_carat: bestDiamond.price_per_carat || bestDiamond.price,
        total_price: bestDiamond.total_price || (bestDiamond.price_per_carat || bestDiamond.price) * (bestDiamond.weight || bestDiamond.carat),
        imageUrl: bestDiamond.picture || bestDiamond.imageUrl,
        lab: bestDiamond.lab,
        certificate_number: bestDiamond.certificate_number
      } : undefined;
      
      const { data, error } = await supabase.functions.invoke('send-individual-message', {
        body: {
          telegramId: customerInfo.telegram_id,
          message: message,
          diamondData: diamondData
        }
      });

      if (error) {
        console.error('❌ Error sending message:', error);
        toast({
          title: "שגיאה בשליחת הודעה",
          description: error.message || "נכשל בשליחת ההודעה ללקוח",
          variant: "destructive"
        });
        return;
      }

      if (data?.success) {
        console.log('✅ Message sent successfully');
        toast({
          title: "הודעה נשלחה! ✅",
          description: diamondData ? "כרטיס יהלום נשלח בהצלחה ללקוח" : "ההודעה נשלחה בהצלחה ללקוח"
        });
        
        setIsOpen(false);
        onMessageSent?.();
      }
    } catch (error) {
      console.error('❌ Failed to send message:', error);
      toast({
        title: "שגיאה",
        description: "נכשל בשליחת ההודעה",
        variant: "destructive"
      });
    } finally {
      setIsSending(false);
    }
  };

  const copyToClipboard = async (message: string) => {
    try {
      await navigator.clipboard.writeText(message);
      toast({
        title: "הועתק! 📋",
        description: "ההודעה הועתקה ללוח העתקה"
      });
    } catch (error) {
      console.error('Failed to copy:', error);
      toast({
        title: "שגיאה בהעתקה",
        description: "נכשל בהעתקת ההודעה",
        variant: "destructive"
      });
    }
  };

  const handleOpen = (open: boolean) => {
    setIsOpen(open);
    if (open && conversationStarters.length === 0) {
      generateConversationStarters();
    }
  };

  const getToneBadgeColor = (type: string) => {
    switch (type) {
      case 'professional': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'consultative': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'personal': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Wand2 className="h-4 w-4" />
          צור קשר חכם
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto" dir="rtl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            יצירת הודעות חכמות ללקוח
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Customer Info */}
          <Card>
            <CardContent className="p-4">
              <h4 className="font-medium mb-2">פרטי לקוח:</h4>
              <div className="text-sm text-muted-foreground space-y-1">
                <p>🆔 טלגרם ID: {customerInfo.telegram_id}</p>
                <p>🔍 חיפוש: {customerInfo.searchQuery || 'לא זמין'}</p>
                <p>💎 יהלומים מתאימים: {customerInfo.diamonds?.length || 0}</p>
              </div>
            </CardContent>
          </Card>

          {/* AI Generated Starters */}
          {isGenerating ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin ml-2" />
              <span>יוצר הודעות חכמות...</span>
            </div>
          ) : conversationStarters.length > 0 ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">הצעות הודעות חכמות:</h4>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={generateConversationStarters}
                  disabled={isGenerating}
                >
                  <Wand2 className="h-4 w-4 ml-1" />
                  יצר מחדש
                </Button>
              </div>
              
              {conversationStarters.map((starter, index) => (
                <Card key={index} className="cursor-pointer transition-colors hover:bg-muted/50">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <Badge className={getToneBadgeColor(starter.type)}>
                        {starter.tone}
                      </Badge>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(starter.message)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedMessage(starter.message)}
                        >
                          בחר
                        </Button>
                      </div>
                    </div>
                    <p className="text-sm leading-relaxed">{starter.message}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : null}

          {/* Custom/Selected Message */}
          <div className="space-y-2">
            <h4 className="font-medium">הודעה לשליחה:</h4>
            <Textarea
              value={selectedMessage || customMessage}
              onChange={(e) => {
                setCustomMessage(e.target.value);
                setSelectedMessage('');
              }}
              placeholder="כתב הודעה מותאמת אישית או בחר מההצעות למעלה..."
              rows={4}
              className="text-right resize-none"
              dir="rtl"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 justify-end">
            <Button 
              variant="outline" 
              onClick={() => setIsOpen(false)}
              disabled={isSending}
            >
              ביטול
            </Button>
            <Button 
              onClick={() => sendMessage(selectedMessage || customMessage)}
              disabled={isSending || (!selectedMessage && !customMessage.trim())}
            >
              {isSending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin ml-1" />
                  שולח...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 ml-1" />
                  שלח הודעה
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}