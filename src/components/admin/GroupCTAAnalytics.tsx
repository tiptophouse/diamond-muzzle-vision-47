import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Users, MousePointer, Calendar, TrendingUp, UserCheck, UserX, Target, BarChart3 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { toast } from '@/components/ui/use-toast';
import { getButtonClicked, isFastAPIResponse } from '@/types/groupCTA';

interface CTAAnalytics {
  totalClicks: number;
  registrationAttempts: number;
  successfulRegistrations: number;
  failedRegistrations: number;
  conversionRate: number;
  clicksByDay: Record<string, number>;
  buttonClicksByType: Record<string, number>;
  uniqueUsers: number;
  data: any[];
}

export function GroupCTAAnalytics() {
  const [analytics, setAnalytics] = useState<CTAAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [daysFilter, setDaysFilter] = useState(7);

  const fetchAnalytics = async () => {
    setIsLoading(true);
    try {
      console.log('🔍 מביא אנליטיקת Group CTA...');
      
      const fromDate = new Date();
      fromDate.setDate(fromDate.getDate() - daysFilter);

      const { data: directData, error: directError } = await supabase
        .from('group_cta_clicks')
        .select('*')
        .gte('clicked_at', fromDate.toISOString())
        .order('clicked_at', { ascending: false });

      if (directError) {
        console.error('❌ שגיאה בשאילתה ישירה:', directError);
        throw directError;
      }

      console.log('✅ שאילתה ישירה הצליחה, נתונים:', directData);

      // Process the data with registration metrics
      const clicksByDay: Record<string, number> = {};
      const buttonClicksByType: Record<string, number> = {};
      let registrationAttempts = 0;
      let successfulRegistrations = 0;
      
      for (const click of directData || []) {
        const d = new Date(click.clicked_at);
        const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
        clicksByDay[key] = (clicksByDay[key] || 0) + 1;
        
        // Track button clicks by type - safely handle Json type
        const buttonType = getButtonClicked(click.fastapi_response);
        buttonClicksByType[buttonType] = (buttonClicksByType[buttonType] || 0) + 1;
        
        if (click.registration_attempted) {
          registrationAttempts++;
          if (click.registration_success) {
            successfulRegistrations++;
          }
        }
      }

      const uniqueUsers = new Set((directData || []).map((c: any) => c.telegram_id)).size;
      const totalClicks = directData?.length || 0;
      const failedRegistrations = registrationAttempts - successfulRegistrations;
      const conversionRate = totalClicks > 0 ? (successfulRegistrations / totalClicks) * 100 : 0;

      const analyticsData: CTAAnalytics = {
        totalClicks,
        registrationAttempts,
        successfulRegistrations,
        failedRegistrations,
        conversionRate: Math.round(conversionRate * 100) / 100,
        uniqueUsers,
        clicksByDay,
        buttonClicksByType,
        data: directData || [],
      };

      console.log('📊 אנליטיקה מעובדת:', analyticsData);
      setAnalytics(analyticsData);

      if (analyticsData.totalClicks === 0) {
        toast({
          title: "📊 אין נתוני CTA",
          description: "עדיין לא נרשמו לחיצות CTA של קבוצה. שלח הודעת קבוצה עם כפתור התחלה כדי להתחיל לעקוב.",
          duration: 4000,
        });
      } else {
        const registrationInfo = analyticsData.registrationAttempts > 0 
          ? ` | ${analyticsData.successfulRegistrations} רישומים מוצלחים`
          : '';
        
        toast({
          title: "✅ אנליטיקה עודכנה",
          description: `נמצאו ${analyticsData.totalClicks} לחיצות מ-${analyticsData.uniqueUsers} משתמשים${registrationInfo}`,
          duration: 3000,
        });
      }

    } catch (err) {
      console.error('❌ שגיאה בהבאת אנליטיקת CTA:', err);
      toast({
        title: "❌ שגיאת אנליטיקה",
        description: "נכשל בהבאת אנליטיקת CTA של קבוצה. בדוק את הקונסול לפרטים.",
        variant: "destructive",
      });
      setAnalytics({ 
        totalClicks: 0, 
        registrationAttempts: 0,
        successfulRegistrations: 0,
        failedRegistrations: 0,
        conversionRate: 0,
        clicksByDay: {}, 
        buttonClicksByType: {},
        uniqueUsers: 0, 
        data: [] 
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [daysFilter]);

  const handleRefresh = () => {
    console.log('🔄 רענון ידני הופעל');
    fetchAnalytics();
  };

  const getButtonDisplayName = (buttonType: string) => {
    const buttonNames: Record<string, string> = {
      'main_dashboard': '🏠 מחוון ראשי',
      'premium_features': '💎 תכונות פרמיום',
      'inventory_management': '📦 ניהול מלאי',
      'ai_chat': '🤖 צ\'אט AI',
      'online_store': '🏪 חנות מקוונת',
      'single_start': '🚀 התחלה יחידה',
      'לא ידוע': '❓ לא ידוע'
    };
    return buttonNames[buttonType] || buttonType;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>אנליטיקת Group CTA</CardTitle>
          <CardDescription>טוען אנליטיקת לחיצות...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-8">
            <RefreshCw className="h-6 w-6 animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div dir="rtl">
          <CardTitle className="flex items-center gap-2">
            <MousePointer className="h-5 w-5" />
            אנליטיקת Group CTA
          </CardTitle>
          <CardDescription>
            עקוב אחר כמה משתמשים לחצו על כפתור התחלה מהודעות קבוצה ונרשמו
          </CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <select 
            value={daysFilter} 
            onChange={(e) => setDaysFilter(Number(e.target.value))}
            className="px-3 py-1 border rounded-md text-sm"
          >
            <option value={1}>24 שעות האחרונות</option>
            <option value={7}>7 ימים האחרונים</option>
            <option value={14}>14 ימים האחרונים</option>
            <option value={30}>30 ימים האחרונים</option>
          </select>
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Enhanced Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center gap-2">
              <MousePointer className="h-5 w-5 text-blue-600" />
              <span className="text-sm font-medium">סה״כ לחיצות</span>
            </div>
            <p className="text-2xl font-bold mt-1">{analytics?.totalClicks || 0}</p>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center gap-2">
              <UserCheck className="h-5 w-5 text-green-600" />
              <span className="text-sm font-medium">רישומים מוצלחים</span>
            </div>
            <p className="text-2xl font-bold mt-1">{analytics?.successfulRegistrations || 0}</p>
          </div>
          
          <div className="bg-red-50 p-4 rounded-lg">
            <div className="flex items-center gap-2">
              <UserX className="h-5 w-5 text-red-600" />
              <span className="text-sm font-medium">רישומים נכשלים</span>
            </div>
            <p className="text-2xl font-bold mt-1">{analytics?.failedRegistrations || 0}</p>
          </div>
          
          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-purple-600" />
              <span className="text-sm font-medium">שיעור הרשמה</span>
            </div>
            <p className="text-2xl font-bold mt-1">{analytics?.conversionRate || 0}%</p>
          </div>
        </div>

        {/* Button Analytics */}
        {analytics && Object.keys(analytics.buttonClicksByType).length > 0 && (
          <div>
            <h4 className="font-medium mb-3 flex items-center gap-2" dir="rtl">
              <BarChart3 className="h-4 w-4" />
              לחיצות לפי כפתור
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {Object.entries(analytics.buttonClicksByType)
                .sort(([,a], [,b]) => (b as number) - (a as number))
                .map(([buttonType, count]) => (
                  <div key={buttonType} className="flex items-center justify-between py-2 px-3 bg-muted/30 rounded" dir="rtl">
                    <span className="text-sm">{getButtonDisplayName(buttonType)}</span>
                    <Badge variant="secondary">{count} לחיצות</Badge>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Registration Status Breakdown */}
        {analytics && analytics.registrationAttempts > 0 && (
          <div>
            <h4 className="font-medium mb-3 flex items-center gap-2" dir="rtl">
              <Users className="h-4 w-4" />
              פילוח סטטוס רישום
            </h4>
            <div className="bg-muted/30 p-4 rounded-lg" dir="rtl">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-sm text-muted-foreground">ניסיונות רישום</p>
                  <p className="text-xl font-bold text-blue-600">{analytics.registrationAttempts}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">הצליחו</p>
                  <p className="text-xl font-bold text-green-600">{analytics.successfulRegistrations}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">נכשלו</p>
                  <p className="text-xl font-bold text-red-600">{analytics.failedRegistrations}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Daily Breakdown */}
        {analytics?.clicksByDay && Object.keys(analytics.clicksByDay).length > 0 && (
          <div>
            <h4 className="font-medium mb-3 flex items-center gap-2" dir="rtl">
              <Calendar className="h-4 w-4" />
              פילוח יומי
            </h4>
            <div className="space-y-2">
              {Object.entries(analytics.clicksByDay)
                .sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime())
                .map(([day, count]) => (
                  <div key={day} className="flex items-center justify-between py-2 px-3 bg-muted/30 rounded" dir="rtl">
                    <span className="text-sm">{day}</span>
                    <Badge variant="secondary">{count} לחיצות</Badge>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Recent Clicks with Registration Status */}
        {analytics?.data && analytics.data.length > 0 && (
          <div>
            <h4 className="font-medium mb-3" dir="rtl">לחיצות אחרונות</h4>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {analytics.data.slice(0, 10).map((click) => (
                <div key={click.id} className="flex items-center justify-between py-2 px-3 border rounded text-sm" dir="rtl">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">משתמש {click.telegram_id}</span>
                    <span className="text-muted-foreground">
                      {format(new Date(click.clicked_at), 'dd/MM, HH:mm')}
                    </span>
                    {click.registration_attempted && (
                      <Badge 
                        variant={click.registration_success ? "default" : "destructive"}
                        className="text-xs"
                      >
                        {click.registration_success ? "נרשם ✓" : "רישום נכשל ✗"}
                      </Badge>
                    )}
                    {click.fastapi_response && (
                      <Badge variant="outline" className="text-xs">
                        {getButtonDisplayName(getButtonClicked(click.fastapi_response))}
                      </Badge>
                    )}
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {click.start_parameter}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {analytics?.totalClicks === 0 && (
          <div className="text-center py-8">
            <MousePointer className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground" dir="rtl">עדיין לא נרשמו לחיצות CTA של קבוצה</p>
            <p className="text-sm text-muted-foreground mt-1" dir="rtl">
              שלח הודעת קבוצה עם כפתור התחלה כדי להתחיל לעקוב
            </p>
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg" dir="rtl">
              <p className="text-sm text-yellow-800">
                <strong>פתרון בעיות:</strong> אם שלחת הודעות קבוצה אבל לא רואה נתונים:
              </p>
              <ul className="text-xs text-yellow-700 mt-2 space-y-1 text-right">
                <li>• בדוק שמשתמשים באמת לוחצים על כפתור ההתחלה</li>
                <li>• ודא שלבוט יש הרשאות מתאימות בקבוצה</li>
                <li>• וודא שהפרמטר start מועבר נכון ב-URL</li>
                <li>• בדוק את לוגי הקונסול לשגיאות מעקב</li>
                <li>• השתמש בכפתור 'בדוק רישום משתמש' לבדיקה</li>
              </ul>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
