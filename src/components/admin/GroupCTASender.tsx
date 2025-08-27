
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Send, Users, MessageSquare, Loader2, TrendingUp, Celebration } from 'lucide-react';
import { useGroupCTA } from '@/hooks/useGroupCTA';

export function GroupCTASender() {
  const { sendGroupCTA, isLoading } = useGroupCTA();
  
  const [formData, setFormData] = useState({
    message: `🎉 **מזל טוב! אנחנו גדלים!**

💎 **BrilliantBot חוגג: 400+ סוחרי יהלומים פעילים!**

🚀 **מה שהתחיל כחלום הפך למציאות:**
• 400+ סוחרי יהלומים מובילים
• אלפי יהלומים נמכרו דרך המערכת
• חיסכון של מיליוני שקלים בעלויות
• רשת הסוחרים הגדולה והמתקדמת בישראל

💪 **אנחנו ממשיכים לחדש ולהוביל בתחום טכנולוגיית היהלומים**

🙏 **תודה לכל הסוחרים שהאמינו בנו מההתחלה!**

#יהלומים #BrilliantBot #גדלים_יחד #400_סוחרים`,
    groupId: '-1001009290613',
    botUsername: 'diamondmazalbot',
    useButtons: false // Default to false
  });

  const handleSend = async () => {
    const success = await sendGroupCTA({
      message: formData.message,
      groupId: formData.groupId,
      botUsername: formData.botUsername?.replace('@',''),
      useButtons: formData.useButtons
    });

    if (success) {
      console.log('✅ הודעת צמיחה נשלחה בהצלחה לקבוצה');
    }
  };

  const handleSendGrowthAnnouncement = async () => {
    const success = await sendGroupCTA({
      message: formData.message,
      groupId: formData.groupId,
      botUsername: formData.botUsername?.replace('@',''),
      useButtons: false // Force no buttons for growth announcement
    });

    if (success) {
      console.log('✅ הודעת צמיחה ל-400+ משתמשים נשלחה בהצלחה');
    }
  };

  return (
    <Card className="shadow-lg border-0 bg-gradient-to-br from-green-50 to-emerald-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-green-900" dir="rtl">
          <TrendingUp className="h-6 w-6" />
          הודעת צמיחה לקבוצה - 400+ משתמשים!
        </CardTitle>
        <CardDescription dir="rtl" className="text-green-700">
          שלח הודעה לקבוצה על הגידול המדהים שלנו ל-400+ סוחרי יהלומים פעילים
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="groupId" dir="rtl" className="font-semibold">מזהה קבוצה</Label>
            <Input
              id="groupId"
              value={formData.groupId}
              onChange={(e) => setFormData(prev => ({ ...prev, groupId: e.target.value }))}
              placeholder="הכנס מזהה קבוצה (לדוגמה: -1001009290613)"
              dir="ltr"
              className="border-green-200 focus:border-green-400"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="botUsername" dir="rtl" className="font-semibold">שם משתמש של הבוט</Label>
            <Input
              id="botUsername"
              value={formData.botUsername}
              onChange={(e) => setFormData(prev => ({ ...prev, botUsername: e.target.value.replace('@','') }))}
              placeholder="לדוגמה: diamondmazalbot (ללא @)"
              dir="ltr"
              className="border-green-200 focus:border-green-400"
            />
          </div>
        </div>

        <div className="space-y-4 bg-white/70 p-4 rounded-lg border border-green-200">
          <div className="flex items-center space-x-2 space-x-reverse" dir="rtl">
            <Switch
              id="useButtons"
              checked={formData.useButtons}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, useButtons: checked }))}
            />
            <Label htmlFor="useButtons" className="flex items-center gap-2 font-semibold">
              <MessageSquare className="h-5 w-5 text-green-600" />
              הוסף כפתורים להודעה (לא מומלץ כעת)
            </Label>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="message" dir="rtl" className="font-semibold">הודעת צמיחה מותאמת</Label>
          <Textarea
            id="message"
            value={formData.message}
            onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
            placeholder="הכנס את הודעת הצמיחה שלך"
            rows={12}
            maxLength={3000}
            dir="rtl"
            className="text-right border-green-200 focus:border-green-400"
          />
          <p className="text-xs text-green-600" dir="rtl">{formData.message.length}/3000 תווים</p>
        </div>

        <div className="bg-white/90 p-6 rounded-lg border-2 border-green-200 shadow-sm">
          <h4 className="font-bold mb-4 text-green-900 flex items-center gap-2" dir="rtl">
            <Celebration className="h-5 w-5" />
            תצוגה מקדימה של הודעת הצמיחה:
          </h4>
          <div className="bg-white p-4 rounded-lg border border-green-100 shadow-sm">
            <pre className="whitespace-pre-wrap text-right text-sm text-gray-800 leading-relaxed">{formData.message}</pre>
          </div>
        </div>

        <div className="flex justify-between items-center pt-4 gap-4">
          <div className="text-sm text-green-700 bg-green-100 p-3 rounded-lg" dir="rtl">
            <strong>🎯 מצב נוכחי:</strong> ללא כפתורים (הודעה פשוטה)
          </div>
          
          <div className="flex gap-2">
            <Button 
              onClick={handleSendGrowthAnnouncement}
              disabled={isLoading || !formData.groupId || !formData.message}
              className="bg-green-600 hover:bg-green-700 font-semibold shadow-sm"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  שולח הודעת צמיחה...
                </>
              ) : (
                <>
                  <TrendingUp className="h-5 w-5 mr-2" />
                  שלח הודעת צמיחה 400+
                </>
              )}
            </Button>
            
            <Button 
              onClick={handleSend} 
              disabled={isLoading || !formData.groupId || !formData.message}
              variant="outline"
              className="border-green-300 text-green-700 hover:bg-green-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  שולח...
                </>
              ) : (
                <>
                  <Send className="h-5 w-5 mr-2" />
                  שלח הודעה רגילה
                </>
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
