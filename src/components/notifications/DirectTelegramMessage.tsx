import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { MessageCircle, Send, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useTelegramHapticFeedback } from '@/hooks/useTelegramHapticFeedback';
import { supabase } from '@/integrations/supabase/client';

interface DirectTelegramMessageProps {
  recipientId: number;
  recipientName: string;
  diamondInfo?: {
    stock_number: string;
    shape: string;
    weight: number;
    color: string;
    clarity: string;
    price: number;
  };
  onClose?: () => void;
}

export function DirectTelegramMessage({ 
  recipientId, 
  recipientName, 
  diamondInfo,
  onClose 
}: DirectTelegramMessageProps) {
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const { toast } = useToast();
  const { impactOccurred, notificationOccurred } = useTelegramHapticFeedback();

  const handleSendMessage = async () => {
    if (!message.trim()) {
      toast({
        title: "שגיאה",
        description: "נא להזין הודעה",
        variant: "destructive"
      });
      return;
    }
    if (!recipientId) {
      toast({
        title: "שגיאה",
        description: "לא נמצאה זהות טלגרם של הנמען",
        variant: "destructive"
      });
      return;
    }

    setIsSending(true);
    impactOccurred('medium');

    try {
      const API_BASE = 'https://uhhljqgxhdhbbhpohxll.supabase.co/functions/v1';
      
      // Format message with diamond info if available
      let fullMessage = message;
      if (diamondInfo) {
        fullMessage = `💎 ${diamondInfo.shape} ${diamondInfo.weight}ct ${diamondInfo.color} ${diamondInfo.clarity}\n💰 $${diamondInfo.price.toLocaleString()}\n📦 Stock: ${diamondInfo.stock_number}\n\n${message}`;
      }

      const { data, error } = await supabase.functions.invoke('send-telegram-message', {
        body: { chat_id: recipientId, message: fullMessage }
      });

      if (error) {
        throw new Error(error.message || 'Failed to send message');
      }
      if (data && (data.success === false || (data as any).error)) {
        throw new Error((data as any).error || 'Failed to send message');
      }

      notificationOccurred('success');
      toast({
        title: "✅ הודעה נשלחה",
        description: `ההודעה נשלחה ל-${recipientName}`,
      });

      setMessage('');
      onClose?.();
    } catch (error) {
      console.error('Error sending message:', error);
      notificationOccurred('error');
      toast({
        title: "❌ שגיאה בשליחה",
        description: "לא הצלחנו לשלוח את ההודעה. נסה שוב.",
        variant: "destructive"
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Card className="p-4 bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-blue-200/50">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5 text-blue-600" />
          <div>
            <h3 className="font-semibold text-sm">שלח הודעה ישירה</h3>
            <p className="text-xs text-muted-foreground">אל: {recipientName}</p>
          </div>
        </div>
        {onClose && (
          <Button
            size="sm"
            variant="ghost"
            onClick={onClose}
            className="h-6 w-6 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {diamondInfo && (
        <div className="bg-white/50 rounded-lg p-2 mb-3 text-xs">
          <p className="font-semibold">יהלום: {diamondInfo.shape} {diamondInfo.weight}ct</p>
          <p className="text-muted-foreground">{diamondInfo.color} {diamondInfo.clarity} - ${diamondInfo.price.toLocaleString()}</p>
        </div>
      )}

      <Textarea
        placeholder="כתוב הודעה..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        className="mb-3 min-h-[100px] text-sm"
        disabled={isSending}
      />

      <div className="flex gap-2">
        <Button
          onClick={handleSendMessage}
          disabled={isSending || !message.trim()}
          className="flex-1 gap-2"
        >
          <Send className="h-4 w-4" />
          {isSending ? 'שולח...' : 'שלח הודעה'}
        </Button>
      </div>
    </Card>
  );
}
