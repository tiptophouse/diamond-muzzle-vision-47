
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { Send, Users, MessageSquare, Sparkles, TestTube } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface PreMadeMessage {
  id: string;
  title: string;
  message: string;
  category: 'welcome' | 'features' | 'engagement' | 'updates' | 'promotions';
}

const preMadeMessages: PreMadeMessage[] = [
  {
    id: 'welcome_new',
    title: '🎉 Welcome New Users',
    category: 'welcome',
    message: `🎉 ברוכים הבאים ל-Diamond Muzzle!

💎 הצטרפתם לפלטפורמת המסחר ביהלומים המתקדמת ביותר!

✨ מה שמחכה לכם:
🔸 ניהול מלאי חכם ומתקדם
🔸 התאמה אוטומטית לביקושי השוק
🔸 חזית חנות מקצועית ויפה
🔸 כלי שיתוף וחיפוש מתקדמים

👨‍💼 צוות התמיכה שלנו כאן בשבילכם 24/7
📱 התחילו עכשיו והעלו את היהלום הראשון שלכם!`
  },
  {
    id: 'feature_inventory',
    title: '📊 Inventory Management Features',
    category: 'features',
    message: `📊 ניהול מלאי מתקדם ב-Diamond Muzzle!

💎 העלאת יהלומים:
• העלאה יחידה עם תמונות ותעודות
• העלאה המונית מקבצי CSV/Excel
• סריקת QR לעדכון מהיר
• תמיכה בכל סוגי היהלומים

🔍 חיפוש וסינון חכם:
• חיפוש לפי צורה, צבע, בהירות
• סינון לפי מחיר וגודל
• התראות על התאמות בשוק
• ניתוח מגמות השוק

🏪 חזית חנות מקצועית:
• עיצוב אלגנטי ומותאם נייד
• שיתוף קל ברשתות חברתיות
• כלי הזמנה ויצירת קשר מובנים

התחילו עכשיו ותחוו את החוויה המלאה! 🚀`
  },
  {
    id: 'engagement_upload',
    title: '🚀 Upload Your Diamonds',
    category: 'engagement',
    message: `🚀 הגיע הזמן להעלות את היהלומים שלכם!

💎 למה חשוב להעלות עכשיו?
✅ הגעה ללקוחות פוטנציאליים ברחבי העולם
✅ חזית חנות מקצועית ומרשימה
✅ כלי ניתוח ותובנות עסקיות חכמות
✅ התראות אוטומטיות על הזדמנויות מכירה

⚡ העלאה מהירה וקלה:
• צילום פשוט או סריקת QR
• מילוי פרטים אוטומטי
• תמיכה בכל פורמטי התעודות

👥 הצטרפו ל-5,000+ סוחרי יהלומים שכבר פעילים!
📈 המכירה הבאה שלכם מחכה!`
  },
  {
    id: 'update_features',
    title: '🆕 Platform Updates',
    category: 'updates',
    message: `🆕 עדכונים חדשים בפלטפורמה!

🔥 תכונות חדשות שהוספנו עבורכם:

📱 ממשק משופר:
• עיצוב חדש ומודרני
• ניווט מהיר יותר
• תמיכה משופרת במובייל

💡 כלים חכמים:
• ניתוח מחירים אוטומטי
• המלצות אישיות למלאי
• התראות חכמות על הזדמנויות

🔧 שיפורים טכניים:
• מהירות טעינה משופרת
• אבטחה מתקדמת יותר
• ביצועים מהירים יותר

📊 דוחות וניתוח:
• דוחות מכירות מפורטים
• ניתוח מגמות השוק
• תובנות עסקיות חכמות

תיהנו מהעדכונים החדשים! 🎉`
  },
  {
    id: 'promotion_premium',
    title: '⭐ Premium Features',
    category: 'promotions',
    message: `⭐ שדרגו ל-Premium וקבלו יותר!

🚀 תכונות Premium בלעדיות:

💎 מלאי בלתי מוגבל:
• העלאה של אלפי יהלומים
• תמונות ברזולוציה גבוהה
• תעודות ומסמכים ללא הגבלה

📈 כלי ניתוח מתקדמים:
• ניתוח מחירים בזמן אמת
• דוחות רווחיות מפורטים
• תובנות שוק בלעדיות

🎯 שיווק מתקדם:
• קידום יהלומים בתוצאות חיפוש
• כלי שיתוף מתקדמים
• אינטגרציה עם רשתות חברתיות

🛡️ תמיכה מועדפת:
• תמיכה עדיפות 24/7
• ייעוץ אישי מומחה יהלומים
• גיבוי אוטומטי של המלאי

💰 מחיר מיוחד השבוע: 50% הנחה!
הצטרפו עכשיו לחבורת ה-Premium! ✨`
  },
  {
    id: 'engagement_community',
    title: '👥 Join Our Community',
    category: 'engagement',
    message: `👥 הצטרפו לקהילת Diamond Muzzle!

🌟 למה כדאי להיות פעילים?

💬 קבוצות מסחר בלעדיות:
• קבוצת סוחרי יהלומים מקצועיים
• עדכונים שוטפים על מגמות השוק
• הזדמנויות מסחר בזמן אמת

📚 למידה ופיתוח:
• וובינרים שבועיים עם מומחים
• מדריכי וידאו מקצועיים
• טיפים וטריקים למכירה טובה יותר

🤝 נטוורקינג:
• פגישות סוחרים חודשיות
• אירועי רשת מקצועיים
• שיתופי פעולה עסקיים

🏆 תחרויות ופרסים:
• תחרות "סוחר החודש"
• פרסים כספיים ומוצרים
• הכרה ציבורית בקהילה

הצטרפו אלינו ותהפכו לחלק מהקהילה הכי פעילה! 🚀`
  }
];

export function BroadcastNotificationSender() {
  const { toast } = useToast();
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [customMessage, setCustomMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTestMode, setIsTestMode] = useState(false);

  const handleTemplateSelect = (templateId: string) => {
    const template = preMadeMessages.find(msg => msg.id === templateId);
    if (template) {
      setSelectedTemplate(templateId);
      setCustomMessage(template.message);
    }
  };

  const handleSendBroadcast = async () => {
    if (!customMessage.trim()) {
      toast({
        title: "שגיאה",
        description: "אנא הזן הודעה לשליחה",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      // Get all users
      const { data: users, error: usersError } = await supabase
        .from('user_profiles')
        .select('telegram_id, first_name, last_name')
        .neq('telegram_id', 0);

      if (usersError) {
        throw new Error(`Failed to fetch users: ${usersError.message}`);
      }

      if (!users || users.length === 0) {
        toast({
          title: "אין משתמשים",
          description: "לא נמצאו משתמשים לשליחת הודעה",
          variant: "destructive",
        });
        return;
      }

      console.log(`📤 Sending broadcast to ${users.length} users (test mode: ${isTestMode})`);

      // Send broadcast via Supabase Edge Function
      const { data: result, error: sendError } = await supabase.functions.invoke('send-announcement', {
        body: {
          message: customMessage,
          groupUrl: 'https://t.me/DiamondMuzzle', // Your main group/channel
          buttonText: '💎 צפה בחנות היהלומים',
          users: users,
          testMode: isTestMode
        }
      });

      if (sendError) {
        throw new Error(`Failed to send broadcast: ${sendError.message}`);
      }

      const successCount = result?.successCount || 0;
      const errorCount = result?.errorCount || 0;

      toast({
        title: isTestMode ? "🧪 הודעת בדיקה נשלחה" : "📢 הודעה נשלחה בהצלחה!",
        description: isTestMode 
          ? "הודעת הבדיקה נשלחה למנהל בלבד"
          : `נשלחה ל-${successCount} משתמשים, ${errorCount} נכשלו`,
      });

      // Clear message after successful send (unless it's test mode)
      if (!isTestMode) {
        setCustomMessage('');
        setSelectedTemplate('');
      }

    } catch (error) {
      console.error('Broadcast error:', error);
      toast({
        title: "שגיאה בשליחה",
        description: error instanceof Error ? error.message : "שגיאה לא ידועה",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const categorizedMessages = preMadeMessages.reduce((acc, msg) => {
    if (!acc[msg.category]) acc[msg.category] = [];
    acc[msg.category].push(msg);
    return acc;
  }, {} as Record<string, PreMadeMessage[]>);

  const categoryLabels = {
    welcome: '🎉 הודעות ברכה',
    features: '✨ תכונות המערכת',
    engagement: '🚀 עידוד השתתפות',
    updates: '🆕 עדכונים',
    promotions: '⭐ מבצעים'
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="h-5 w-5" />
            שליחת הודעות לכל המשתמשים
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Pre-made message templates */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium">הודעות מוכנות מראש:</h3>
            
            {Object.entries(categoryLabels).map(([category, label]) => (
              <div key={category} className="space-y-2">
                <h4 className="text-xs font-medium text-muted-foreground">{label}</h4>
                <div className="grid gap-2">
                  {categorizedMessages[category]?.map((template) => (
                    <Button
                      key={template.id}
                      variant={selectedTemplate === template.id ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleTemplateSelect(template.id)}
                      className="justify-start text-right"
                    >
                      <MessageSquare className="h-4 w-4 ml-2" />
                      {template.title}
                    </Button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Custom message input */}
          <div className="space-y-2">
            <label className="text-sm font-medium">הודעה מותאמת אישית:</label>
            <Textarea
              placeholder="כתבו את ההודעה שלכם כאן... תוכלו להשתמש באימוג'ים! 💎✨🚀"
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              rows={8}
              className="text-right"
              dir="rtl"
            />
            <p className="text-xs text-muted-foreground">
              {customMessage.length}/4000 תווים
            </p>
          </div>

          {/* Test mode toggle */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="testMode"
              checked={isTestMode}
              onChange={(e) => setIsTestMode(e.target.checked)}
              className="rounded"
            />
            <label htmlFor="testMode" className="text-sm">
              🧪 מצב בדיקה (שליחה למנהל בלבד)
            </label>
          </div>

          {/* Send button */}
          <div className="flex justify-end gap-2">
            <Button
              onClick={handleSendBroadcast}
              disabled={isLoading || !customMessage.trim()}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                  שולח...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  {isTestMode ? <TestTube className="h-4 w-4" /> : <Send className="h-4 w-4" />}
                  {isTestMode ? 'שלח הודעת בדיקה' : 'שלח לכל המשתמשים'}
                  <Users className="h-4 w-4" />
                </span>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Message preview */}
      {customMessage && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">תצוגה מקדימה של ההודעה:</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-muted p-4 rounded-lg" dir="rtl">
              <div className="whitespace-pre-wrap text-sm">
                {customMessage}
              </div>
              <div className="mt-3 pt-3 border-t">
                <Button size="sm" variant="outline" className="text-xs">
                  💎 צפה בחנות היהלומים
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
