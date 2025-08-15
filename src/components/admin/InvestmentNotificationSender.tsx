
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  TrendingUp, 
  Users, 
  Send, 
  Loader2, 
  Diamond, 
  Clock,
  Target,
  Zap
} from 'lucide-react';

export function InvestmentNotificationSender() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [testMode, setTestMode] = useState(false);
  
  const investmentMessage = `🚀 **הזדמנות השקעה בלעדית: BrilliantBot**

💎 הצטרף למהפכת המסחר ביהלומים!
📈 49 משתמשים כבר שדרגו לפרימיום $50/חודש (במקום $75 רגיל)
🎯 מחפשים משקיעים אסטרטגיים: מניות 3-15%
⏰ **זמן מוגבל: 72 שעות בלבד**

🔗 **פורטל השקעה מאובטח:**
brilliantbot-investor-hub.lovable.app/investment

*פרטי השקעה כפופים להסכם סודיות ואי-תחרות*

#DiamondTech #השקעה #הזדמנות`;

  const handleSendInvestmentNotification = async () => {
    setIsLoading(true);
    
    try {
      console.log('📤 Sending investment opportunity notification');
      
      // Get all users for the notification
      const { data: users, error: usersError } = await supabase
        .from('user_profiles')
        .select('telegram_id, first_name, last_name')
        .order('created_at', { ascending: false });

      if (usersError) throw usersError;

      if (!users || users.length === 0) {
        toast({
          title: 'לא נמצאו משתמשים',
          description: 'אין משתמשים זמינים לשליחת הודעת השקעה',
          variant: 'destructive',
        });
        return;
      }

      console.log(`📊 Found ${users.length} users in database`);

      // Send the investment notification
      const { data, error } = await supabase.functions.invoke('send-investment-notification', {
        body: {
          message: investmentMessage,
          users: users,
          testMode: testMode,
          timestamp: new Date().toISOString()
        }
      });

      if (error) throw error;

      toast({
        title: testMode ? 'הודעת השקעה נשלחה לבדיקה' : 'הודעת השקעה נשלחה',
        description: testMode 
          ? 'הודעה נשלחה למנהל לבדיקה'
          : `הזדמנות השקעה נשלחה ל-${users.length} משתמשים`,
      });

    } catch (error) {
      console.error('❌ Error sending investment notification:', error);
      toast({
        title: 'שגיאה בשליחת ההודעה',
        description: 'נכשל בשליחת הודעת הזדמנות השקעה',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border-2 border-blue-200 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-700">
            <TrendingUp className="h-6 w-6" />
            קמפיין הזדמנות השקעה
          </CardTitle>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="border-blue-200 text-blue-700">
              <Clock className="h-3 w-3 mr-1" />
              72 שעות מוגבל
            </Badge>
            <Badge variant="outline" className="border-green-200 text-green-700">
              <Target className="h-3 w-3 mr-1" />
              3-15% מניות
            </Badge>
            <Badge variant="outline" className="border-purple-200 text-purple-700">
              <Diamond className="h-3 w-3 mr-1" />
              השקעה אסטרטגית
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Campaign Overview */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
            <h3 className="font-semibold text-blue-900 mb-4 text-lg flex items-center gap-2">
              <Zap className="w-5 h-5" />
              סקירת הקמפיין
            </h3>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <p className="flex items-center gap-2 text-blue-700">
                  <Users className="w-4 h-4" />
                  <strong>יעד:</strong> כל המשתמשים הרשומים
                </p>
                <p className="flex items-center gap-2 text-blue-700">
                  <Clock className="w-4 h-4" />
                  <strong>משך:</strong> 72 שעות בלבד
                </p>
              </div>
              <div className="space-y-2">
                <p className="flex items-center gap-2 text-blue-700">
                  <Target className="w-4 h-4" />
                  <strong>מטרה:</strong> למשוך משקיעים אסטרטגיים
                </p>
                <p className="flex items-center gap-2 text-blue-700">
                  <Diamond className="w-4 h-4" />
                  <strong>מניות:</strong> טווח השקעה 3-15%
                </p>
              </div>
            </div>
          </div>

          {/* Message Preview */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900">תצוגה מקדימה של הודעת השקעה:</h3>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <Textarea
                value={investmentMessage}
                readOnly
                className="min-h-[200px] resize-none bg-transparent border-none text-right"
                dir="rtl"
              />
            </div>
          </div>

          <Separator />

          {/* Key Features Highlight */}
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-green-700">49</div>
              <div className="text-sm text-green-600">משתמשי פרימיום</div>
              <div className="text-xs text-green-500">$50/חודש נעול</div>
            </div>
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-orange-700">72h</div>
              <div className="text-sm text-orange-600">זמן מוגבל</div>
              <div className="text-xs text-orange-500">גורם דחיפות</div>
            </div>
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-purple-700">3-15%</div>
              <div className="text-sm text-purple-600">טווח מניות</div>
              <div className="text-xs text-purple-500">חלק אסטרטגי</div>
            </div>
          </div>

          {/* Send Controls */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={handleSendInvestmentNotification}
              disabled={isLoading}
              className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Send className="h-4 w-4 mr-2" />
              )}
              שלח הודעת השקעה
            </Button>
            
            <Button
              onClick={() => {
                setTestMode(true);
                handleSendInvestmentNotification();
              }}
              disabled={isLoading}
              variant="outline"
              className="border-blue-200 text-blue-700 hover:bg-blue-50"
            >
              {isLoading && testMode ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Send className="h-4 w-4 mr-2" />
              )}
              שליחה לבדיקה (מנהל בלבד)
            </Button>
          </div>

          {/* Important Notes */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <h4 className="font-semibold text-amber-800 mb-2">📋 הערות קמפיין:</h4>
            <div className="text-sm text-amber-700 space-y-1" dir="rtl">
              <p>• עמוד השקעה כולל חתימה על הסכם סודיות ואי-תחרות</p>
              <p>• אינטגרציה עם Calendly לתיאום פגישות אוטומטי</p>
              <p>• טיימר של 72 שעות יוצר דחיפות</p>
              <p>• הוכחה חברתית עם מדדי משתמשים נוכחיים (49/100)</p>
              <p>• מצגת השקעה מקצועית מוכנה</p>
            </div>
          </div>

          {/* User Count Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-800 mb-2">👥 מידע משתמשים:</h4>
            <p className="text-sm text-blue-700">
              ההודעה תישלח לכל המשתמשים במסד הנתונים. לצפייה במספר המדויק של המשתמשים, 
              בדוק בעמוד הניהול או במסד הנתונים ישירות.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
