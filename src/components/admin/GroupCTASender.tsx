
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Send, Users, MessageSquare, Loader2, Sparkles, Diamond, Store, Zap, TestTube, Home, Bot, Share, ExternalLink } from 'lucide-react';
import { useGroupCTA } from '@/hooks/useGroupCTA';
import { useGroupCTARegistration } from '@/hooks/useGroupCTARegistration';

export function GroupCTASender() {
  const { sendGroupCTA, isLoading } = useGroupCTA();
  const { testCTAClickWithRegistration, isRegistering } = useGroupCTARegistration();
  
  const [formData, setFormData] = useState({
    message: `💎 *פתח עסק יהלומים מצליח עם BrilliantBot*

🚀 *הפלטפורמה המתקדמת לסוחרי יהלומים:*
• 📱 ניהול מלאי חכם ומתקדם
• 🔍 חיפוש מהיר ויעיל ביהלומים
• 💰 מעקב רווחיות ומחירים
• 🎯 התאמה מושלמת ללקוחות
• 📊 דוחות מכירות מפורטים

⭐ *אלפי סוחרים כבר מרוויחים איתנו - הצטרף עכשיו!*

🎁 *התחל חינם והעלה את העסק שלך לרמה הבאה*`,
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
      console.log('✅ הודעת CTA קבוצתית נשלחה בהצלחה');
    }
  };

  const handleTestClick = async () => {
    await testCTAClickWithRegistration();
  };

  // Smart routing configuration for preview
  const getButtonRoutes = () => {
    const routes = [];
    
    // Main dashboard button
    routes.push({
      icon: <Home className="h-3 w-3" />,
      text: '🏠 התחל עכשיו - מחוון ראשי',
      route: '/?utm_source=group_cta&start=group_activation',
      color: 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800'
    });

    if (formData.includeInventoryButton) {
      routes.push({
        icon: <Store className="h-3 w-3" />,
        text: '📦 ניהול מלאי יהלומים',
        route: '/inventory?start=inventory_demo',
        color: 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800'
      });
    }

    if (formData.includePremiumButton) {
      routes.push({
        icon: <Diamond className="h-3 w-3" />,
        text: '💎 חנות יהלומים מקוונת',
        route: '/store?start=store_demo&view=featured',
        color: 'bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800'
      });
    }

    if (formData.includeChatButton) {
      routes.push({
        icon: <Bot className="h-3 w-3" />,
        text: '🤖 יועץ AI חכם ליהלומים',
        route: '/chat?start=ai_chat_demo&welcome=true',
        color: 'bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800'
      });
    }

    // Upload button
    routes.push({
      icon: <Share className="h-3 w-3" />,
      text: '📤 העלאת יהלומים מהירה',
      route: '/upload?start=upload_demo',
      color: 'bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800'
    });

    return routes;
  };

  return (
    <Card className="shadow-lg border-0 bg-gradient-to-br from-blue-50 to-indigo-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-blue-900" dir="rtl">
          <MessageSquare className="h-6 w-6" />
          שליחת הודעת קרא לפעולה מתקדמת לקבוצה
        </CardTitle>
        <CardDescription dir="rtl" className="text-blue-700">
          שלח הודעה מעוררת עניין עם כפתורים חכמים המובילים ישירות לדפים השונים במערכת
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
              className="border-blue-200 focus:border-blue-400"
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
              className="border-blue-200 focus:border-blue-400"
            />
          </div>
        </div>

        <div className="space-y-4 bg-white/70 p-4 rounded-lg border border-blue-200">
          <div className="flex items-center space-x-2 space-x-reverse" dir="rtl">
            <Switch
              id="multipleButtons"
              checked={formData.useMultipleButtons}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, useMultipleButtons: checked }))}
            />
            <Label htmlFor="multipleButtons" className="flex items-center gap-2 font-semibold">
              <Sparkles className="h-5 w-5 text-blue-600" />
              הפעל כפתורים חכמים מתקדמים
            </Label>
          </div>

          {formData.useMultipleButtons && (
            <div className="mr-6 space-y-3 border-r-2 border-blue-200 pr-4" dir="rtl">
              <div className="flex items-center space-x-2 space-x-reverse">
                <Switch
                  id="inventoryButton"
                  checked={formData.includeInventoryButton}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, includeInventoryButton: checked }))}
                />
                <Label htmlFor="inventoryButton" className="flex items-center gap-2">
                  <Store className="h-4 w-4 text-green-500" />
                  כפתור ניהול מלאי → דף המלאי
                </Label>
              </div>

              <div className="flex items-center space-x-2 space-x-reverse">
                <Switch
                  id="premiumButton"
                  checked={formData.includePremiumButton}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, includePremiumButton: checked }))}
                />
                <Label htmlFor="premiumButton" className="flex items-center gap-2">
                  <Diamond className="h-4 w-4 text-purple-500" />
                  כפתור חנות יהלומים → דף החנות
                </Label>
              </div>

              <div className="flex items-center space-x-2 space-x-reverse">
                <Switch
                  id="chatButton"
                  checked={formData.includeChatButton}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, includeChatButton: checked }))}
                />
                <Label htmlFor="chatButton" className="flex items-center gap-2">
                  <Bot className="h-4 w-4 text-orange-500" />
                  כפתור יועץ AI → דף הצ'אט
                </Label>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="message" dir="rtl" className="font-semibold">הודעה מעוצבת</Label>
          <Textarea
            id="message"
            value={formData.message}
            onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
            placeholder="הכנס את הודעת הקרא לפעולה שלך"
            rows={10}
            maxLength={2000}
            dir="rtl"
            className="text-right border-blue-200 focus:border-blue-400 font-medium"
          />
          <p className="text-xs text-blue-600" dir="rtl">{formData.message.length}/2000 תווים</p>
        </div>

        <div className="bg-white/90 p-6 rounded-lg border-2 border-blue-200 shadow-sm">
          <h4 className="font-bold mb-4 text-blue-900 flex items-center gap-2" dir="rtl">
            <ExternalLink className="h-5 w-5" />
            תצוגה מקדימה של ההודעה:
          </h4>
          <div className="text-sm space-y-4" dir="rtl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-blue-700">
              <p><strong>מזהה קבוצה:</strong> {formData.groupId}</p>
              <p><strong>בוט:</strong> @{formData.botUsername}</p>
            </div>
            
            <div className="bg-white p-4 rounded-lg border border-blue-100 shadow-sm">
              <pre className="whitespace-pre-wrap text-right text-sm mb-4 text-gray-800 leading-relaxed font-medium">{formData.message}</pre>
              
              {formData.useMultipleButtons && (
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-blue-600 border-b border-blue-100 pb-1">
                    כפתורים אינטראקטיביים:
                  </p>
                  <div className="grid grid-cols-1 gap-2">
                    {getButtonRoutes().map((button, index) => (
                      <div key={index} className={`${button.color} text-white px-4 py-3 rounded-lg text-center font-semibold shadow-md transition-all hover:shadow-lg hover:scale-105`}>
                        <div className="flex items-center justify-center gap-2">
                          {button.icon}
                          <span>{button.text}</span>
                        </div>
                        <div className="text-xs opacity-80 mt-1">
                          → {button.route}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center pt-4 gap-4">
          <Button 
            onClick={handleTestClick}
            disabled={isRegistering}
            variant="outline"
            className="bg-green-50 hover:bg-green-100 border-green-300 text-green-700 font-semibold shadow-sm"
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
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 font-semibold shadow-md flex-1 md:flex-none"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                שולח הודעה...
              </>
            ) : (
              <>
                <Send className="h-5 w-5 mr-2" />
                שלח הודעת CTA מתקדמת
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
