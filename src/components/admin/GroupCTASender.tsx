
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Send, Users, MessageSquare, Loader2, Sparkles, Diamond, Store, Zap, TestTube } from 'lucide-react';
import { useGroupCTA } from '@/hooks/useGroupCTA';
import { useGroupCTARegistration } from '@/hooks/useGroupCTARegistration';

export function GroupCTASender() {
  const { sendGroupCTA, isLoading } = useGroupCTA();
  const { testCTAClickWithRegistration, isRegistering } = useGroupCTARegistration();
  
  const [formData, setFormData] = useState({
    message: `💎 **העלו את העסק שלכם לרמה הבאה עם BrilliantBot!**

🚀 **הבוט החכם ביותר לסוחרי יהלומים:**
• 🔍 חיפוש מתקדם במלאי
• 📊 ניתוחי שוק בזמן אמת
• 💰 מעקב רווחיות חכם
• 🎯 התאמות מושלמות ללקוחות

⭐ **אלפי סוחרים כבר משתמשים - הצטרפו עכשיו!**`,
    groupId: '-1001009290613',
    botUsername: 'diamondmazalbot',
    useMultipleButtons: true,
    includePremiumButton: true,
    includeInventoryButton: true,
    includeChatButton: true
  });

  const handleSend = async () => {
    const success = await sendGroupCTA({
      message: formData.message,
      groupId: formData.groupId,
      botUsername: formData.botUsername?.replace('@',''),
      useMultipleButtons: formData.useMultipleButtons,
      includePremiumButton: formData.includePremiumButton,
      includeInventoryButton: formData.includeInventoryButton,
      includeChatButton: formData.includeChatButton
    });

    if (success) {
      console.log('✅ הודעת CTA קבוצתית משופרת נשלחה בהצלחה');
    }
  };

  const handleTestClick = async () => {
    await testCTAClickWithRegistration();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2" dir="rtl">
          <MessageSquare className="h-5 w-5" />
          שליחת הודעת קרא לפעולה משופרת לקבוצה
        </CardTitle>
        <CardDescription dir="rtl">
          שלח הודעה מעוררת עניין עם מספר כפתורי פעולה כדי למקסם את מעורבות המשתמשים
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="groupId" dir="rtl">מזהה קבוצה</Label>
          <Input
            id="groupId"
            value={formData.groupId}
            onChange={(e) => setFormData(prev => ({ ...prev, groupId: e.target.value }))}
            placeholder="הכנס מזהה קבוצה (לדוגמה: -1001009290613)"
            dir="ltr"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="botUsername" dir="rtl">שם משתמש של הבוט</Label>
          <Input
            id="botUsername"
            value={formData.botUsername}
            onChange={(e) => setFormData(prev => ({ ...prev, botUsername: e.target.value.replace('@','') }))}
            placeholder="לדוגמה: diamondmazalbot (ללא @)"
            dir="ltr"
          />
        </div>

        <div className="space-y-4">
          <div className="flex items-center space-x-2 space-x-reverse" dir="rtl">
            <Switch
              id="multipleButtons"
              checked={formData.useMultipleButtons}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, useMultipleButtons: checked }))}
            />
            <Label htmlFor="multipleButtons" className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              השתמש במספר כפתורי פעולה
            </Label>
          </div>

          {formData.useMultipleButtons && (
            <div className="mr-6 space-y-3 border-r-2 border-primary/20 pr-4" dir="rtl">
              <div className="flex items-center space-x-2 space-x-reverse">
                <Switch
                  id="premiumButton"
                  checked={formData.includePremiumButton}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, includePremiumButton: checked }))}
                />
                <Label htmlFor="premiumButton" className="flex items-center gap-2">
                  <Diamond className="h-4 w-4 text-yellow-500" />
                  כפתור תכונות פרמיום
                </Label>
              </div>

              <div className="flex items-center space-x-2 space-x-reverse">
                <Switch
                  id="inventoryButton"
                  checked={formData.includeInventoryButton}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, includeInventoryButton: checked }))}
                />
                <Label htmlFor="inventoryButton" className="flex items-center gap-2">
                  <Store className="h-4 w-4 text-blue-500" />
                  כפתור ניהול מלאי
                </Label>
              </div>

              <div className="flex items-center space-x-2 space-x-reverse">
                <Switch
                  id="chatButton"
                  checked={formData.includeChatButton}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, includeChatButton: checked }))}
                />
                <Label htmlFor="chatButton" className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-green-500" />
                  כפתור עוזר צ'אט AI
                </Label>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="message" dir="rtl">הודעה משופרת</Label>
          <Textarea
            id="message"
            value={formData.message}
            onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
            placeholder="הכנס את הודעת הקרא לפעולה שלך"
            rows={8}
            maxLength={2000}
            dir="rtl"
            className="text-right"
          />
          <p className="text-xs text-gray-500" dir="rtl">{formData.message.length}/2000 תווים</p>
        </div>

        <div className="bg-muted p-4 rounded-lg">
          <h4 className="font-semibold mb-2" dir="rtl">תצוגה מקדימה:</h4>
          <div className="text-sm space-y-2" dir="rtl">
            <p><strong>מזהה קבוצה:</strong> {formData.groupId}</p>
            <p><strong>בוט:</strong> @{formData.botUsername}</p>
            <div className="bg-background p-3 rounded border">
              <pre className="whitespace-pre-wrap text-right text-sm mb-3">{formData.message}</pre>
              
              {formData.useMultipleButtons && (
                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground">כפתורים מוטמעים:</p>
                  <div className="grid grid-cols-1 gap-1">
                    <div className="bg-primary text-primary-foreground px-3 py-1 rounded text-xs text-center">
                      🚀 התחל עם BrilliantBot
                    </div>
                    {formData.includePremiumButton && (
                      <div className="bg-yellow-500 text-white px-3 py-1 rounded text-xs text-center">
                        💎 גלה תכונות פרמיום
                      </div>
                    )}
                    {formData.includeInventoryButton && (
                      <div className="bg-blue-500 text-white px-3 py-1 rounded text-xs text-center">
                        📦 נהל מלאי חכם
                      </div>
                    )}
                    {formData.includeChatButton && (
                      <div className="bg-green-500 text-white px-3 py-1 rounded text-xs text-center">
                        💬 צ'אט AI מתקדם
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center pt-4">
          <Button 
            onClick={handleTestClick}
            disabled={isRegistering}
            variant="outline"
            className="bg-green-50 hover:bg-green-100 border-green-200"
          >
            {isRegistering ? (
              <>
                <Loader2 className="h-4 w-4 ml-2 animate-spin" />
                בודק רישום...
              </>
            ) : (
              <>
                <TestTube className="h-4 w-4 ml-2" />
                בדוק רישום משתמש
              </>
            )}
          </Button>
          
          <Button 
            onClick={handleSend} 
            disabled={isLoading || !formData.groupId || !formData.message}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                שולח הודעת CTA משופרת...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                שלח הודעת CTA משופרת לקבוצה
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
