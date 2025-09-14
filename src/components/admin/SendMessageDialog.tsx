import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Send, Loader2 } from 'lucide-react';

interface SendMessageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: any;
}

export function SendMessageDialog({ open, onOpenChange, user }: SendMessageDialogProps) {
  const { toast } = useToast();
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async () => {
    if (!message.trim() || !user) {
      toast({
        title: "Error",
        description: "Please enter a message",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const personalizedMessage = `שלום ${user.first_name || 'משתמש יקר'},\n\n${message}`;
      
      const { data, error } = await supabase.functions.invoke('send-individual-message', {
        body: {
          telegramId: user.telegram_id,
          message: personalizedMessage,
          buttons: [
            {
              text: '🚀 פתח דשבורד',
              url: 'https://t.me/diamondmazalbot?startapp=dashboard'
            },
            {
              text: '💎 חנות היהלומים',
              url: 'https://t.me/diamondmazalbot?startapp=store'
            }
          ]
        }
      });

      if (error) {
        console.error('Error sending message:', error);
        toast({
          title: "שגיאה בשליחה",
          description: `נכשל בשליחת ההודעה ל-${user.first_name}: ${error.message}`,
          variant: "destructive",
        });
      } else {
        toast({
          title: "הודעה נשלחה בהצלחה! ✅",
          description: `ההודעה נשלחה ל-${user.first_name} (${user.telegram_id})`,
        });
        setMessage('');
        onOpenChange(false);
      }
    } catch (error: any) {
      console.error('Error sending message:', error);
      toast({
        title: "שגיאה",
        description: error.message || "נכשל בשליחת ההודעה",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" dir="rtl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Send className="h-5 w-5" />
            שלח הודעה ל-{user?.first_name || 'משתמש'}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">הודעה אישית</label>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="הכנס את ההודעה שלך כאן..."
              rows={6}
              className="text-right"
              dir="rtl"
            />
            <p className="text-xs text-muted-foreground mt-1">
              ההודעה תשלח עם שם המשתמש בתחילת ההודעה
            </p>
          </div>

          <div className="bg-muted p-3 rounded-lg text-sm">
            <p className="font-medium mb-2">פרטי משתמש:</p>
            <p>📱 טלגרם ID: {user?.telegram_id}</p>
            <p>👤 שם: {user?.first_name} {user?.last_name || ''}</p>
            {user?.username && <p>🏷️ שם משתמש: @{user.username}</p>}
          </div>

          <div className="flex gap-2 justify-end">
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              ביטול
            </Button>
            <Button 
              onClick={handleSendMessage}
              disabled={isLoading || !message.trim()}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  שולח...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
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