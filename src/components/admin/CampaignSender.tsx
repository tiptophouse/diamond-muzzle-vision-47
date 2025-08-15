
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
  messageHe: string;
  icon: React.ReactNode;
  color: string;
}

const campaignMessages: CampaignMessage[] = [
  {
    id: 'lifetime_discount_new',
    name: 'Lifetime Discount - New Version',
    type: 'urgency',
    subject: '🚨 LIMITED TIME: LIFETIME DISCOUNT!',
    message: `🚨 **LIMITED TIME: LIFETIME DISCOUNT!** 🚨

💎 **Only the FIRST 100 uploaders get LIFETIME access for $50 instead of $75!**

⏰ **You have 72 HOURS to secure your spot!**

🎯 **What you get as a LIFETIME member:**
• ✨ Upload unlimited diamonds to BrilliantBot
• 🔍 AI-powered buyer matching system  
• 📊 Real-time market analytics
• 💰 Priority notifications for high-value deals
• 🚀 Early access to ALL future features
• 🎖️ VIP status in the trading community

**Current spots taken: [X]/100** ⚠️

Don't miss out - once we hit 100 uploaders, the price goes back to $75/month!

⚡ **Start uploading NOW and claim your lifetime discount!**`,
    messageHe: `🚨 **זמן מוגבל: הנחה לכל החיים!** 🚨

💎 **רק 100 המעלים הראשונים מקבלים גישה לכל החיים ב-$50 במקום $75!**

⏰ **יש לכם 72 שעות להבטיח את המקום שלכם!**

🎯 **מה תקבלו כחברים לכל החיים:**
• ✨ העלאת יהלומים ללא הגבלה ל-BrilliantBot
• 🔍 מערכת התאמת קונים מבוססת AI
• 📊 ניתוחי שוק בזמן אמת
• 💰 התראות עדיפות על עסקאות בעלות ערך גבוה
• 🚀 גישה מוקדמת לכל התכונות העתידיות
• 🎖️ סטטוס VIP בקהילת הסחר

**מקומות תפוסים כרגע: [X]/100** ⚠️

אל תפספסו - ברגע שנגיע ל-100 מעלים, המחיר חוזר ל-$75 לחודש!

⚡ **התחילו להעלות עכשיו וקבלו את ההנחה לכל החיים!**`,
    icon: <Zap className="h-4 w-4" />,
    color: 'text-red-600'
  },
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
    messageHe: `🚨 **⏰ דחוף: 72 שעות נותרו!** ⏰ 🚨

💎 **הנחת לכל החייםמסתיימת בקרוב!**

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
    messageHe: `🔥 **אזהרת מחסור: רק [X] מקומות נותרו!** 🔥

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
  }
];

export function CampaignSender() {
  const [selectedCampaign, setSelectedCampaign] = useState<string>('');
  const [customMessage, setCustomMessage] = useState('');
  const [campaignName, setCampaignName] = useState('');
  const [targetGroup, setTargetGroup] = useState('-1001009290613');
  const [currentUploaders, setCurrentUploaders] = useState(47);
  const [hoursLeft, setHoursLeft] = useState(72);
  const [language, setLanguage] = useState<'en' | 'he'>('he');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSendCampaign = async (messageData: CampaignMessage | null = null) => {
    setIsLoading(true);
    
    try {
      const isHebrew = language === 'he';
      const finalMessage = messageData 
        ? (isHebrew ? messageData.messageHe : messageData.message) 
        : customMessage;
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
          buttonText: isHebrew ? '🚀 קבל גישה לכל החיים - $50' : '🚀 Get Lifetime Access - $50',
          groupId: targetGroup,
          botUsername: 'diamondmazalbot'
        }
      });

      if (error) throw error;

      // Log campaign in analytics_events table
      const { error: logError } = await supabase
        .from('analytics_events')
        .insert({
          event_type: 'campaign_sent',
          page_path: '/admin/campaigns',
          session_id: crypto.randomUUID(),
          user_agent: navigator.userAgent,
          event_data: {
            campaign_type: messageData?.type || 'custom',
            campaign_name: campaignName || messageData?.name || 'Custom Campaign',
            message_content: personalizedMessage,
            target_group: targetGroup,
            current_uploaders: currentUploaders,
            hours_remaining: hoursLeft,
            language: language,
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-muted rounded-lg">
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
              <Label>שפה</Label>
              <Select value={language} onValueChange={(value: 'en' | 'he') => setLanguage(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="he">עברית</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                </SelectContent>
              </Select>
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
                        {(language === 'he' ? campaign.messageHe : campaign.message)
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
