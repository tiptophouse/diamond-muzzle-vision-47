
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useGroupCTA } from '@/hooks/useGroupCTA';
import { useToast } from '@/components/ui/use-toast';
import { Send, Users, TrendingUp, Zap, DollarSign } from 'lucide-react';

export function GroupCTASender({ onSendNotification }: { onSendNotification?: (notification: any) => void }) {
  const [message, setMessage] = useState('');
  const [buttonText, setButtonText] = useState('');
  const [buttonUrl, setButtonUrl] = useState('https://t.me/diamondmazalbot?startapp=profile');
  const [groupId, setGroupId] = useState('-1001009290613');
  const [isSending, setIsSending] = useState(false);
  
  const { sendGroupCTA } = useGroupCTA();
  const { toast } = useToast();

  // Killer CTA messages with 400+ users
  const ctaTemplates = [
    {
      icon: <TrendingUp className="h-5 w-5" />,
      title: "המהפכה החדשה - 400+ סוחרים",
      message: `🚀 המהפכה החדשה כאן!

💎 400+ סוחרי יהלומים כבר מרוויחים בכל יום
📈 רווחים של 50% בחודש - לא חלום, מציאות!
⏰ הזמן להצטרף רק עכשיו - לפני שהמקומות ייגמרו

🔥 בזמן שאתה חושב, הם כבר מרוויחים...`,
      buttonText: "💰 אני רוצה לרווח יותר!",
    },
    {
      icon: <Users className="h-5 w-5" />,
      title: "הוכחה חברתית - 400+ מצליחים",
      message: `👑 400+ סוחרי יהלומים בוחרים בנו!

✅ כל יום מצטרפים 50+ סוחרים חדשים
💰 הממוצע: 50% רווח בחודש
🎯 98% שיעור הצלחה מדווח

⚡ הם לא מחכים - למה אתה כן?`,
      buttonText: "🚀 הצטרף ל-400+ הסוחרים",
    },
    {
      icon: <DollarSign className="h-5 w-5" />,
      title: "רווח מוכח - 400+ עדויות",
      message: `💎 400+ סוחרים מרוויחים ברמה אחרת!

📊 ממוצע של $15,000 רווח בחודש
🏆 המערכת #1 לסוחרי יהלומים בישראל
⏳ רק 100 מקומות נותרו השבוע

🔥 זה או לא זה - החלט עכשיו!`,
      buttonText: "💎 מה החשבון שלי?",
    },
    {
      icon: <Zap className="h-5 w-5" />,
      title: "דחיפות מקסימלית - 400+ פעילים",
      message: `⚠️ אזהרה: 400+ סוחרים כבר בפנים!

🔥 בזמן שאתה קורא את זה:
• 127 עסקאות בוצעו בשעה האחרונה
• $2.3M מחזור ביממה
• רק 67 מקומות נותרו

⏰ כל דקה שאתה מחכה = כסף שאתה מפסיד`,
      buttonText: "🏃‍♂️ בואו נתחיל עכשיו!",
    }
  ];

  const handleSendCTA = async () => {
    if (!message.trim()) {
      toast({
        title: "שגיאה",
        description: "נא להכניס הודעה",
        variant: "destructive",
      });
      return;
    }

    setIsSending(true);
    try {
      await sendGroupCTA({
        groupId: Number(groupId) || -1001009290613,
        message: message,
        buttonText: buttonText || undefined,
        buttonUrl: buttonUrl || undefined,
        useButtons: !!(buttonText && buttonUrl)
      });

      // Clear form
      setMessage('');
      setButtonText('');
      setButtonUrl('https://t.me/diamondmazalbot?startapp=profile');

      toast({
        title: "הודעה נשלחה בהצלחה!",
        description: "ההודעה נשלחה לקבוצה עם 400+ הסוחרים",
      });

      onSendNotification?.({
        type: 'group_cta',
        message: message,
        timestamp: new Date().toISOString(),
        groupId: groupId,
        userCount: '400+'
      });
    } catch (error: any) {
      console.error('Error sending group CTA:', error);
      toast({
        title: "שגיאה בשליחה",
        description: error.message || "נכשל בשליחת ההודעה",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleQuickGrowthMessage = async () => {
    const growthMessage = `🚀 עדכון: 400+ סוחרי יהלומים פעילים!

💰 הרווחים שלנו השבוע:
• $2.8M מחזור עסקאות 
• 89% רווחיות ממוצעת
• 156 עסקאות מוצלחות ביממה

⚡ הקהילה הגדולה ביותר של סוחרי יהלומים בישראל!

🔥 עדיין לא בפנים? אתה מפסיד...`;

    setIsSending(true);
    try {
      await sendGroupCTA({
        groupId: groupId,
        message: growthMessage,
        useButtons: false
      });

      onSendNotification?.({
        type: 'growth_update',
        message: growthMessage,
        timestamp: new Date().toISOString(),
        groupId: groupId,
        userCount: '400+'
      });

      toast({
        title: "עדכון צמיחה נשלח!",
        description: "הודעה עם 400+ משתמשים נשלחה בהצלחה",
      });
    } catch (error: any) {
      console.error('Error sending growth message:', error);
      toast({
        title: "שגיאה",
        description: error.message || "נכשל בשליחת הודעת הצמיחה",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  const useTemplate = (template: typeof ctaTemplates[0]) => {
    setMessage(template.message);
    setButtonText(template.buttonText);
    setButtonUrl('https://t.me/diamondmazalbot?startapp=profile');
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="h-5 w-5" />
            שלח CTA לקבוצה (400+ משתמשים)
          </CardTitle>
          <CardDescription>
            שלח הודעות מותאמות אישית לקבוצה עם 400+ סוחרי יהלומים פעילים
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Quick Actions */}
          <div className="flex gap-2 flex-wrap">
            <Button
              onClick={handleQuickGrowthMessage}
              disabled={isSending}
              variant="outline"
              size="sm"
            >
              <TrendingUp className="h-4 w-4 mr-2" />
              עדכון צמיחה (400+)
            </Button>
          </div>

          {/* Group ID */}
          <div>
            <label className="text-sm font-medium mb-2 block">מזהה קבוצה</label>
            <Input
              value={groupId}
              onChange={(e) => setGroupId(e.target.value)}
              placeholder="-1001009290613"
            />
          </div>

          {/* Message */}
          <div>
            <label className="text-sm font-medium mb-2 block">הודעה (400+ משתמשים יראו)</label>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="כתוב הודעה עם 400+ משתמשים..."
              rows={6}
            />
          </div>

          {/* Button Settings */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">טקסט הכפתור</label>
              <Input
                value={buttonText}
                onChange={(e) => setButtonText(e.target.value)}
                placeholder="💰 הצטרף ל-400+ הסוחרים"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">קישור הכפתור</label>
              <Input
                value={buttonUrl}
                onChange={(e) => setButtonUrl(e.target.value)}
                placeholder="https://t.me/diamondmazalbot?startapp=profile"
              />
            </div>
          </div>

          <Button 
            onClick={handleSendCTA} 
            disabled={isSending || !message.trim()}
            className="w-full"
            size="lg"
          >
            {isSending ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                שולח ל-400+ משתמשים...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                שלח ל-400+ סוחרי יהלומים
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* CTA Templates with 400+ */}
      <Card>
        <CardHeader>
          <CardTitle>תבניות CTA עם 400+ משתמשים</CardTitle>
          <CardDescription>
            הודעות מוכנות מראש שמדגישות את קהילת 400+ הסוחרים שלך
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {ctaTemplates.map((template, index) => (
              <div key={index} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {template.icon}
                    <h3 className="font-medium">{template.title}</h3>
                  </div>
                  <Button
                    onClick={() => useTemplate(template)}
                    variant="outline"
                    size="sm"
                  >
                    השתמש בתבנית
                  </Button>
                </div>
                <div className="text-sm text-muted-foreground whitespace-pre-line bg-muted p-3 rounded">
                  {template.message}
                </div>
                <div className="mt-2 text-xs text-blue-600">
                  כפתור: "{template.buttonText}"
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
