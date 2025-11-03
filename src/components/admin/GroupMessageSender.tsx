import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { MessageSquare, Plus, Trash2, Send, TrendingUp } from 'lucide-react';

interface Button {
  id: string;
  label: string;
  targetPage: string;
}

export default function GroupMessageSender() {
  const { toast } = useToast();
  const { user } = useTelegramAuth();
  const [campaignName, setCampaignName] = useState('');
  const [messageText, setMessageText] = useState('');
  const [buttons, setButtons] = useState<Button[]>([
    { id: 'ai', label: '🤖 AI Assistant', targetPage: 'ai' },
    { id: 'inventory', label: '💎 My Inventory', targetPage: 'inventory' },
    { id: 'dashboard', label: '📊 Dashboard', targetPage: 'dashboard' }
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const addButton = () => {
    setButtons([...buttons, { id: `btn_${Date.now()}`, label: '', targetPage: '' }]);
  };

  const removeButton = (id: string) => {
    setButtons(buttons.filter(b => b.id !== id));
  };

  const updateButton = (id: string, field: 'label' | 'targetPage', value: string) => {
    setButtons(buttons.map(b => b.id === id ? { ...b, [field]: value } : b));
  };

  const sendMessage = async () => {
    if (!user?.id) {
      toast({
        title: 'שגיאה',
        description: 'לא ניתן לשלוח הודעה ללא משתמש מחובר',
        variant: 'destructive'
      });
      return;
    }

    if (!campaignName || !messageText) {
      toast({
        title: 'שגיאה',
        description: 'נא למלא שם קמפיין והודעה',
        variant: 'destructive'
      });
      return;
    }

    const validButtons = buttons.filter(b => b.label && b.targetPage);
    if (validButtons.length === 0) {
      toast({
        title: 'שגיאה',
        description: 'נא להוסיף לפחות כפתור אחד',
        variant: 'destructive'
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('send-group-message-with-buttons', {
        body: {
          campaignName,
          messageText,
          senderTelegramId: user.id,
          buttons: validButtons
        }
      });

      if (error) throw error;

      toast({
        title: 'הצלחה! 🎉',
        description: `ההודעה נשלחה לקבוצה עם ${validButtons.length} כפתורים`,
      });

      // Reset form
      setCampaignName('');
      setMessageText('');
      
    } catch (error) {
      console.error('Send message error:', error);
      toast({
        title: 'שגיאה',
        description: error.message || 'שליחת ההודעה נכשלה',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="bg-card">
      <CardHeader>
        <div className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-primary" />
          <CardTitle>שלח הודעה לקבוצת B2B</CardTitle>
        </div>
        <CardDescription>
          שלח הודעה עם כפתורים אינטראקטיביים ועקוב אחר ביצועי הקמפיין
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Campaign Name */}
        <div className="space-y-2">
          <Label htmlFor="campaign-name">שם קמפיין</Label>
          <Input
            id="campaign-name"
            placeholder="למשל: השקת פיצ'ר חדש"
            value={campaignName}
            onChange={(e) => setCampaignName(e.target.value)}
            className="bg-background"
          />
        </div>

        {/* Message Text */}
        <div className="space-y-2">
          <Label htmlFor="message-text">תוכן ההודעה</Label>
          <Textarea
            id="message-text"
            placeholder="כתוב את ההודעה שתישלח לקבוצה..."
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            rows={6}
            className="bg-background resize-none"
          />
          <p className="text-xs text-muted-foreground">
            {messageText.length} תווים
          </p>
        </div>

        {/* Buttons */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>כפתורים אינטראקטיביים</Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addButton}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              הוסף כפתור
            </Button>
          </div>

          <div className="space-y-3">
            {buttons.map((button, index) => (
              <div key={button.id} className="flex gap-2 items-start p-3 rounded-lg border bg-background">
                <div className="flex-1 space-y-2">
                  <Input
                    placeholder="טקסט הכפתור (למשל: 🤖 AI Assistant)"
                    value={button.label}
                    onChange={(e) => updateButton(button.id, 'label', e.target.value)}
                    className="bg-card"
                  />
                  <Input
                    placeholder="דף יעד (למשל: ai, inventory, dashboard)"
                    value={button.targetPage}
                    onChange={(e) => updateButton(button.id, 'targetPage', e.target.value)}
                    className="bg-card"
                  />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeButton(button.id)}
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* Preview */}
        {messageText && (
          <div className="space-y-2">
            <Label>תצוגה מקדימה</Label>
            <div className="rounded-lg border bg-muted/50 p-4">
              <div className="whitespace-pre-wrap text-sm mb-3">{messageText}</div>
              <div className="space-y-2">
                {buttons.filter(b => b.label).map((button) => (
                  <div
                    key={button.id}
                    className="rounded-lg border bg-primary/10 text-primary px-4 py-2 text-sm font-medium text-center"
                  >
                    {button.label}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Send Button */}
        <Button
          onClick={sendMessage}
          disabled={isLoading || !campaignName || !messageText || buttons.filter(b => b.label && b.targetPage).length === 0}
          className="w-full gap-2"
          size="lg"
        >
          {isLoading ? (
            <>
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
              שולח...
            </>
          ) : (
            <>
              <Send className="h-4 w-4" />
              שלח הודעה לקבוצה
            </>
          )}
        </Button>

        {/* Info */}
        <div className="flex items-start gap-2 rounded-lg bg-primary/5 p-3 text-sm">
          <TrendingUp className="h-4 w-4 text-primary mt-0.5" />
          <div className="space-y-1">
            <p className="font-medium text-foreground">מעקב אוטומטי אחר ביצועים</p>
            <p className="text-xs text-muted-foreground">
              כל לחיצה על כפתור תתועד אוטומטית במערכת. תוכל לראות מי לחץ, מתי, ועל איזה כפתור.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
