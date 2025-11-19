import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { CheckCircle2, Loader2, AlertCircle, ExternalLink } from 'lucide-react';

export default function WebhookSetup() {
  const [botToken, setBotToken] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [webhookInfo, setWebhookInfo] = useState<any>(null);
  const [isConfigured, setIsConfigured] = useState(false);

  const WEBHOOK_URL = 'https://uhhljqgxhdhbbhpohxll.supabase.co/functions/v1/telegram-webhook';

  const setupWebhook = async () => {
    if (!botToken.trim()) {
      toast.error('נא להזין Bot Token');
      return;
    }

    setIsLoading(true);
    try {
      // Call Telegram setWebhook API
      const response = await fetch(
        `https://api.telegram.org/bot${botToken}/setWebhook`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            url: WEBHOOK_URL,
            allowed_updates: ['message', 'callback_query'],
            drop_pending_updates: true,
          }),
        }
      );

      const result = await response.json();

      if (!result.ok) {
        throw new Error(result.description || 'Failed to set webhook');
      }

      // Get webhook info to verify
      const infoResponse = await fetch(
        `https://api.telegram.org/bot${botToken}/getWebhookInfo`
      );
      const info = await infoResponse.json();

      if (info.ok) {
        setWebhookInfo(info.result);
        setIsConfigured(true);
        toast.success('🎉 Webhook הוגדר בהצלחה!');
      }
    } catch (error: any) {
      console.error('Error setting webhook:', error);
      toast.error(`שגיאה: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const checkWebhook = async () => {
    if (!botToken.trim()) {
      toast.error('נא להזין Bot Token');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(
        `https://api.telegram.org/bot${botToken}/getWebhookInfo`
      );
      const result = await response.json();

      if (result.ok) {
        setWebhookInfo(result.result);
        setIsConfigured(result.result.url === WEBHOOK_URL);
        if (result.result.url === WEBHOOK_URL) {
          toast.success('✅ Webhook מוגדר נכון!');
        } else if (result.result.url) {
          toast.warning('⚠️ Webhook מוגדר ל-URL אחר');
        } else {
          toast.error('❌ Webhook לא מוגדר');
        }
      }
    } catch (error: any) {
      console.error('Error checking webhook:', error);
      toast.error(`שגיאה: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8" dir="rtl">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">🔧 הגדרת Telegram Webhook</h1>
          <p className="text-muted-foreground">
            הגדר את ה-Webhook כדי שכפתורי המכרזים יעבדו
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>שלב 1: הזן Bot Token</CardTitle>
            <CardDescription>
              את ה-Token ניתן לקבל מ-@BotFather בטלגרם
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="botToken">Bot Token</Label>
              <Input
                id="botToken"
                type="password"
                placeholder="1234567890:ABCdefGHIjklMNOpqrsTUVwxyz"
                value={botToken}
                onChange={(e) => setBotToken(e.target.value)}
                className="font-mono text-left"
                dir="ltr"
              />
              <p className="text-xs text-muted-foreground">
                ה-Token לא נשמר - משמש רק להגדרת ה-Webhook
              </p>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={setupWebhook}
                disabled={isLoading || !botToken}
                className="flex-1"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                    מגדיר...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="ml-2 h-4 w-4" />
                    הגדר Webhook
                  </>
                )}
              </Button>
              <Button
                onClick={checkWebhook}
                disabled={isLoading || !botToken}
                variant="outline"
              >
                בדוק סטטוס
              </Button>
            </div>
          </CardContent>
        </Card>

        {webhookInfo && (
          <Card className={isConfigured ? 'border-green-500' : 'border-orange-500'}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {isConfigured ? (
                  <>
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                    Webhook מוגדר בהצלחה!
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-5 w-5 text-orange-500" />
                    סטטוס Webhook
                  </>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">URL:</Label>
                <p className="text-sm font-mono break-all bg-muted p-2 rounded">
                  {webhookInfo.url || 'לא מוגדר'}
                </p>
              </div>

              {webhookInfo.pending_update_count > 0 && (
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">עדכונים ממתינים:</Label>
                  <p className="text-sm">{webhookInfo.pending_update_count}</p>
                </div>
              )}

              {webhookInfo.last_error_message && (
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">שגיאה אחרונה:</Label>
                  <p className="text-sm text-red-500 bg-red-50 p-2 rounded">
                    {webhookInfo.last_error_message}
                  </p>
                </div>
              )}

              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">IP Address:</Label>
                <p className="text-sm font-mono">{webhookInfo.ip_address || 'N/A'}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {isConfigured && (
          <Card className="bg-green-50 border-green-500">
            <CardContent className="pt-6">
              <div className="flex gap-3">
                <CheckCircle2 className="h-6 w-6 text-green-500 flex-shrink-0 mt-0.5" />
                <div className="space-y-2">
                  <h3 className="font-semibold text-green-900">הכל מוכן! 🎉</h3>
                  <p className="text-sm text-green-800">
                    כפתורי המכרזים יעבדו כעת בצורה מושלמת. כל לחיצה על כפתור תעובד
                    אוטומטית ותעדכן את המחירים בזמן אמת.
                  </p>
                  <a
                    href="https://supabase.com/dashboard/project/uhhljqgxhdhbbhpohxll/functions/telegram-webhook/logs"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm text-green-700 hover:text-green-900 underline"
                  >
                    צפה ב-Logs של הטלגרם
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>איך זה עובד?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                1
              </div>
              <p>משתמש לוחץ על כפתור במכרז</p>
            </div>
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                2
              </div>
              <p>טלגרם שולח את הלחיצה ל-Webhook שלנו</p>
            </div>
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                3
              </div>
              <p>המערכת מעבדת את ההצעה ומעדכנת את המחיר</p>
            </div>
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                4
              </div>
              <p>המשתמש מקבל אישור והמסרים מתעדכנים</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
