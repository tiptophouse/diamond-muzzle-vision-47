import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Send, TestTube } from 'lucide-react';

export function BulkEngagementMessage() {
  const [telegramIds, setTelegramIds] = useState('');
  const [message, setMessage] = useState('');
  const [buttonText, setButtonText] = useState('');
  const [buttonUrl, setButtonUrl] = useState('');
  const [testId, setTestId] = useState('');
  const [sending, setSending] = useState(false);

  const sendToUsers = async (ids: number[]) => {
    try {
      const { data, error } = await supabase.functions.invoke('send-engagement-message', {
        body: {
          telegramIds: ids,
          message,
          buttonText,
          buttonUrl
        }
      });

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Error sending messages:', error);
      throw error;
    }
  };

  const handleTest = async () => {
    if (!testId.trim()) {
      toast.error('הזן מספר Telegram ID לבדיקה');
      return;
    }

    if (!message.trim()) {
      toast.error('הזן הודעה');
      return;
    }

    setSending(true);
    try {
      const ids = [parseInt(testId.trim())];
      const result = await sendToUsers(ids);
      
      if (result.success && result.stats.messages_sent > 0) {
        toast.success('הודעת בדיקה נשלחה בהצלחה! ✨');
      } else {
        toast.error('שליחת הודעת הבדיקה נכשלה');
      }
    } catch (error) {
      toast.error('שגיאה בשליחת הודעת בדיקה');
    } finally {
      setSending(false);
    }
  };

  const handleSendBulk = async () => {
    if (!telegramIds.trim()) {
      toast.error('הזן מספרי Telegram ID');
      return;
    }

    if (!message.trim()) {
      toast.error('הזן הודעה');
      return;
    }

    const ids = telegramIds
      .split('\n')
      .map(id => id.trim())
      .filter(id => id && /^\d+$/.test(id))
      .map(id => parseInt(id));

    if (ids.length === 0) {
      toast.error('לא נמצאו מספרי Telegram ID תקינים');
      return;
    }

    setSending(true);
    try {
      const result = await sendToUsers(ids);
      
      if (result.success) {
        toast.success(
          `נשלחו ${result.stats.messages_sent} הודעות מתוך ${result.stats.total_users} משתמשים! 🎉`
        );
        
        if (result.stats.messages_failed > 0) {
          toast.warning(`${result.stats.messages_failed} הודעות נכשלו`);
        }
      } else {
        toast.error('שליחת ההודעות נכשלה');
      }
    } catch (error) {
      toast.error('שגיאה בשליחת הודעות');
    } finally {
      setSending(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>שלח הודעת מעורבות 🚀</CardTitle>
        <CardDescription>
          שלח הודעות מעוררות עניין עם כפתור חזרה לאפליקציה
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">הודעה (HTML)</label>
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="היי! 💎 יש לנו עדכונים חדשים ומרגשים בסטור של היהלומים..."
            className="min-h-[120px] font-mono"
          />
          <p className="text-xs text-muted-foreground">
            ניתן להשתמש ב-HTML tags: &lt;b&gt;, &lt;i&gt;, &lt;a&gt;
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">טקסט כפתור</label>
            <Input
              value={buttonText}
              onChange={(e) => setButtonText(e.target.value)}
              placeholder="חזור לאפליקציה 💎"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">כתובת URL של כפתור</label>
            <Input
              value={buttonUrl}
              onChange={(e) => setButtonUrl(e.target.value)}
              placeholder="https://t.me/your_bot?start=engagement"
            />
          </div>
        </div>

        <div className="border-t pt-4 space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">בדוק עם משתמש אחד</label>
            <div className="flex gap-2">
              <Input
                value={testId}
                onChange={(e) => setTestId(e.target.value)}
                placeholder="Telegram ID לבדיקה"
                className="flex-1"
              />
              <Button
                onClick={handleTest}
                disabled={sending}
                variant="secondary"
              >
                <TestTube className="h-4 w-4 mr-2" />
                בדוק
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">
              רשימת Telegram IDs (אחד בכל שורה)
            </label>
            <Textarea
              value={telegramIds}
              onChange={(e) => setTelegramIds(e.target.value)}
              placeholder="357027836&#10;459466461&#10;608907728"
              className="min-h-[200px] font-mono"
            />
          </div>

          <Button
            onClick={handleSendBulk}
            disabled={sending}
            className="w-full"
            size="lg"
          >
            <Send className="h-4 w-4 mr-2" />
            {sending ? 'שולח...' : 'שלח לכל המשתמשים'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
