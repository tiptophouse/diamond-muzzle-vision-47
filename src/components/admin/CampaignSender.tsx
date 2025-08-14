
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Send, Users, Target, Clock, Zap, Crown, Gift, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface CampaignMessage {
  id: string;
  name: string;
  type: 'urgency' | 'scarcity' | 'social_proof' | 'value' | 'fomo' | 'exclusive';
  subject: string;
  message: string;
  icon: React.ReactNode;
  color: string;
}

const campaignMessages: CampaignMessage[] = [
  {
    id: 'urgency_72h',
    name: 'Urgency - 72 Hours',
    type: 'urgency',
    subject: '⏰ רק 72 שעות נותרו!',
    message: `🚨 **⏰ דחוף: 72 שעות נותרו!** ⏰ 🚨

💎 **הנחת לכל החיים מסתיימת בקרוב!**

רק **[X] מקומות נותרו** מתוך 100 עבור גישה לכל החיים ב-$50!

🎯 **זו ההזדמנות האחרונה שלך לקבל:**
• ✨ העלאות יהלומים ללא הגבלה - לכל החיים
• 🤖 התאמת קונים באמצעות AI - גישה לכל החיים
• 📊 תובנות שוק וניתוחים - ללא עמלות חודשיות
• 💰 התראות עדיפות על עסקאות - סטטוס VIP קבוע
• 🚀 כל התכונות העתידיות כלולות - ללא עלות נוספת

**אחרי 100 מעלים = המחיר עובר ל-$75 לחודש!**

⚡ **העלה את היהלום הראשון שלך כדי להבטיח את המקום!**

הזמן אוזל... למה לשלם דמי מנוי חודשיים כשאפשר לקבל גישה לכל החיים רק ב-$50!`,
    icon: <Clock className="h-4 w-4" />,
    color: 'text-red-600'
  },
  {
    id: 'scarcity_spots',
    name: 'Scarcity - Limited Spots',
    type: 'scarcity',
    subject: '🔥 אזהרת מחסור: רק [X] מקומות נותרו!',  
    message: `🔥 **אזהרת מחסור: רק [X] מקומות נותרו!** 🔥

💎 **BrilliantBot גישה לכל החיים - $50 (היה $75)**

⚠️ **רק ל-100 המעלים הראשונים - ללא יוצאים מן הכלל!**

מה קורה כשאתה מעלה את היהלום הראשון:
• 🎖️ הפעלת חברות לכל החיים מיידית
• 💰 נעילת מחיר $50 לכל החיים (אחרים משלמים $75 לחודש)
• 🚀 דילוג על כל מחזורי התשלום העתידיים
• ⭐ סטטוס VIP קבוע בקהילת הסחר
• 🔍 התאמת קונים באמצעות AI ללא הגבלה
• 📊 חבילת ניתוחים מלאה - שלך לכל החיים

**ספירה נוכחית: [X]/100 מקומות מאוישים**

כל שעה = פחות מקומות זמינים!
כל מעלה חדש = הזדמנות אחת פחות עבורך!

⏰ **ספירה לאחור של 72 שעות החלה...**

אל תצפה מהצד בזמן שאחרים מבטיחים את הגישה לכל החיים שלהם!`,
    icon: <AlertTriangle className="h-4 w-4" />,
    color: 'text-orange-600'
  },
  {
    id: 'social_proof',
    name: 'Social Proof - Others Joining',
    type: 'social_proof',
    subject: '👥 יותר מ-[X] סוחרים כבר הצטרפו!',
    message: `👥 **יותר מ-[X] סוחרים מובילים כבר הבטיחו את המקום שלהם!** 👥

💎 **למה הם ממהרים להצטרף ל-BrilliantBot?**

🎯 **מה שסוחרים מובילים אומרים:**
• "השקעה של $50 שחסכה לי $10,000 ברווחים החמוצים" - יוסי כ.
• "ה-AI מוצא לי קונים שלא הייתי מוצא לבד" - מיכל ר.
• "סוף סוף פלטפורמה שמבינה את הצרכים שלנו" - אבי מ.

⚡ **רק [X] מקומות נותרו מתוך 100**

📈 **הנתונים מדברים בעד עצמם:**
• ממוצע 40% יותר פניות לכל יהלום
• 65% זמן מכירה מהיר יותר
• 28% שיפור ברווחיות

🚀 **אל תהיה האחרון שנכנס - המקומות נגמרים מהר!**

**המחיר עולה ל-$75/חודש ברגע שנמלאים 100 המקומות**

⏰ נותרו רק 72 שעות להבטיח $50 לכל החיים`,
    icon: <Users className="h-4 w-4" />,
    color: 'text-blue-600'
  },
  {
    id: 'value_proposition',
    name: 'Value - ROI Focus',
    type: 'value',
    subject: '💰 חסוך $300 בשנה הראשונה!',
    message: `💰 **חישוב פשוט: BrilliantBot מחזיר את עצמו תוך שבוע!** 💰

📊 **בואו נעשה חשבון:**

**עלות רגילה:**
• $75 לחודש × 12 חודשים = $900 בשנה
• לכל החיים (5 שנים): $4,500

**מחיר מיוחד עכשיו:**
• תשלום חד-פעמי: $50 בלבד!
• חיסכון בשנה הראשונה: $850
• חיסכון לכל החיים: $4,450

🎯 **מה שאתה מקבל בתמורה:**
• 🔍 AI שמוצא קונים בדקות במקום שבועות
• 📈 ממוצע 40% יותר פניות לכל יהלום
• ⚡ 65% זמן מכירה מהיר יותר
• 💎 גישה לרשת 1,600+ סוחרים פעילים

**אפילו עסקה אחת נוספת בחודש משלמת את ההשקעה!**

⏰ **רק [X] מקומות נותרו מתוך 100**
⏰ **רק 72 שעות נותרו למחיר המיוחד**

🚀 **העלה יהלום אחד עכשיו והתחל לחסוך!**`,
    icon: <Target className="h-4 w-4" />,
    color: 'text-green-600'
  },
  {
    id: 'fomo_exclusive',
    name: 'FOMO - Exclusive Access',
    type: 'fomo',
    subject: '🎖️ גישה בלעדית לחברי VIP בלבד!',
    message: `🎖️ **אתה מוזמן לחברות VIP בלעדית ב-BrilliantBot!** 🎖️

👑 **מה זה אומר להיות VIP?**

🌟 **הטבות בלעדיות שאחרים לא יקבלו:**
• 🚀 גישה מוקדמת לכל התכונות החדשות
• 💎 עדיפות בהתאמות AI (התוצאות שלך קודם)
• 📊 דוחות שוק מתקדמים (ערך $200/חודש)
• 🎯 ייעוץ אישי מומחי יהלומים
• 👥 גישה לקבוצת VIP סגורה (50 חברים בלבד)
• 🏆 תג זהב בפרופיל + הכרה מיוחדת

⚡ **המיוחד: רק 100 מקומות VIP יפתחו אי פעם!**

מאחרי זה - הכל יהיה $75/חודש ללא הטבות VIP.

🔥 **למה עכשיו?**
• חברי VIP מקבלים פי 3 יותר פניות
• גישה לעסקאות בלעדיות שאחרים לא רואים
• רשת קשרים עם 100 הסוחרים המובילים בארץ

⏰ **נותרו [X] הזמנות VIP מתוך 100**
⏰ **נותרו 72 שעות לתפוס את המקום**

🎖️ **תהיה חלק מה-VIP - תעלה יהלום עכשיו!**`,
    icon: <Crown className="h-4 w-4" />,
    color: 'text-purple-600'
  },
  {
    id: 'last_chance',
    name: 'Last Chance - Final Call',
    type: 'fomo',
    subject: '🚨 הזדמנות אחרונה - נגמר מחר!',
    message: `🚨 **זה זה - ההזדמנות האחרונה שלך!** 🚨

⏰ **פחות מ-24 שעות נותרו למחיר $50**

💔 **אל תהיה מהסוחרים שיצטערו מחר:**
• "איך פספסתי את זה?"
• "הייתי יכול לחסוך $4,000..."
• "למה לא העליתי יהלום אחד בזמן?"

🔥 **מה שקורה מחר ב-00:00:**
• המחיר קופץ ל-$75/חודש
• הטבות ה-VIP נסגרות לתמיד
• 100 המקומות המובטחים נגמרים
• תצטרך לחכות בתור כמו כולם

⚡ **עכשיו או אף פעם:**
רק **[X] מקומות** נותרו מתוך 100
רק **[X] שעות** נותרו למחיר המיוחד

🎯 **מה שצריך לעשות עכשיו:**
1. לחץ על הכפתור למטה
2. העלה יהלום אחד (אפילו ישן)
3. קבל גישה לכל החיים ב-$50
4. התחל לקבל יותר פניות מיד

**אחרי חצות - אין דרך חזרה!**

⚡ **תעלה עכשיו ותבטיח את העתיד שלך!**`,
    icon: <Zap className="h-4 w-4" />,
    color: 'text-red-700'
  }
];

export function CampaignSender() {
  const [selectedCampaign, setSelectedCampaign] = useState<string>('');
  const [customMessage, setCustomMessage] = useState('');
  const [campaignName, setCampaignName] = useState('');
  const [targetGroup, setTargetGroup] = useState('-1001009290613');
  const [currentUploaders, setCurrentUploaders] = useState(47);
  const [hoursLeft, setHoursLeft] = useState(72);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSendCampaign = async (messageData: CampaignMessage | null = null) => {
    setIsLoading(true);
    
    try {
      const finalMessage = messageData ? messageData.message : customMessage;
      const finalSubject = messageData ? messageData.subject : 'הודעת קמפיין מיוחדת';
      
      // Replace placeholders
      const personalizedMessage = finalMessage
        .replace(/\[X\]/g, currentUploaders.toString())
        .replace(/\[HOURS\]/g, hoursLeft.toString());

      const personalizedSubject = finalSubject
        .replace(/\[X\]/g, currentUploaders.toString())
        .replace(/\[HOURS\]/g, hoursLeft.toString());

      // Send to Telegram group
      const { data, error } = await supabase.functions.invoke('send-group-cta', {
        body: {
          message: personalizedMessage,
          buttonText: '🚀 קבל גישה לכל החיים - $50',
          groupId: targetGroup,
          botUsername: 'diamondmazalbot'
        }
      });

      if (error) throw error;

      // Log campaign for analytics
      const { error: logError } = await supabase
        .from('campaign_logs')
        .insert({
          campaign_type: messageData?.type || 'custom',
          campaign_name: campaignName || messageData?.name || 'Custom Campaign',
          message_content: personalizedMessage,
          target_group: targetGroup,
          current_uploaders: currentUploaders,
          hours_remaining: hoursLeft,
          metadata: {
            campaign_id: messageData?.id || 'custom',
            subject: personalizedSubject
          }
        });

      if (logError) console.warn('Campaign logging failed:', logError);

      toast({
        title: "🚀 קמפיין נשלח בהצלחה!",
        description: `הודעת ${messageData?.name || 'קמפיין מותאם אישית'} נשלחה לקבוצה`,
      });

      // Reset form
      setSelectedCampaign('');
      setCustomMessage('');
      setCampaignName('');

    } catch (error) {
      console.error('Campaign send error:', error);
      toast({
        title: "❌ שגיאה בשליחת קמפיין",
        description: "נכשל בשליחת הקמפיין, נסה שוב",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const selectedCampaignData = campaignMessages.find(c => c.id === selectedCampaign);

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Send className="h-5 w-5" />
          מערכת קמפיינים מתקדמת
        </CardTitle>
        <CardDescription>
          שלח קמפיינים מותאמים עם הודעות שונות לקידום מכירות והרשמות
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="templates" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="templates">תבניות קמפיין</TabsTrigger>
            <TabsTrigger value="custom">קמפיין מותאם</TabsTrigger>
          </TabsList>

          {/* Campaign Settings */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted rounded-lg">
            <div className="space-y-2">
              <Label>מספר מעלים נוכחי</Label>
              <Input
                type="number"
                value={currentUploaders}
                onChange={(e) => setCurrentUploaders(parseInt(e.target.value) || 0)}
                max={100}
              />
            </div>
            <div className="space-y-2">
              <Label>שעות נותרות</Label>
              <Input
                type="number"
                value={hoursLeft}
                onChange={(e) => setHoursLeft(parseInt(e.target.value) || 0)}
              />
            </div>
            <div className="space-y-2">
              <Label>ID קבוצת יעד</Label>
              <Input
                value={targetGroup}
                onChange={(e) => setTargetGroup(e.target.value)}
                placeholder="-1001009290613"
              />
            </div>
          </div>

          <TabsContent value="templates" className="space-y-4">
            <div className="grid gap-4">
              {campaignMessages.map((campaign) => (
                <Card key={campaign.id} className="relative">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={campaign.color}>{campaign.icon}</span>
                        <CardTitle className="text-lg">{campaign.name}</CardTitle>
                        <Badge variant="outline">{campaign.type}</Badge>
                      </div>
                      <Button
                        onClick={() => handleSendCampaign(campaign)}
                        disabled={isLoading}
                        size="sm"
                      >
                        <Send className="h-4 w-4 mr-2" />
                        שלח קמפיין
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-background p-4 rounded border">
                      <p className="font-semibold text-sm mb-2">
                        {campaign.subject.replace(/\[X\]/g, currentUploaders.toString())}
                      </p>
                      <pre className="whitespace-pre-wrap text-sm text-right">
                        {campaign.message
                          .replace(/\[X\]/g, currentUploaders.toString())
                          .replace(/\[HOURS\]/g, hoursLeft.toString())
                          .substring(0, 300)}...
                      </pre>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="custom" className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>שם הקמפיין</Label>
                <Input
                  value={campaignName}
                  onChange={(e) => setCampaignName(e.target.value)}
                  placeholder="הכנס שם לקמפיין"
                />
              </div>
              
              <div className="space-y-2">
                <Label>הודעת קמפיין מותאמת</Label>
                <Textarea
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  placeholder="כתב את הודעת הקמפיין שלך כאן..."
                  rows={12}
                  dir="rtl"
                  className="text-right"
                />
                <p className="text-xs text-muted-foreground">
                  השתמש ב-[X] למספר המעלים הנוכחי ו-[HOURS] לשעות הנותרות
                </p>
              </div>

              <div className="bg-muted p-4 rounded-lg">
                <h4 className="font-semibold mb-2">תצוגה מקדימה:</h4>
                <div className="bg-background p-3 rounded border">
                  <pre className="whitespace-pre-wrap text-sm text-right">
                    {customMessage
                      .replace(/\[X\]/g, currentUploaders.toString())
                      .replace(/\[HOURS\]/g, hoursLeft.toString())}
                  </pre>
                </div>
              </div>

              <Button
                onClick={() => handleSendCampaign()}
                disabled={isLoading || !customMessage || !campaignName}
                className="w-full"
              >
                <Send className="h-4 w-4 mr-2" />
                {isLoading ? 'שולח קמפיין...' : 'שלח קמפיין מותאם'}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
