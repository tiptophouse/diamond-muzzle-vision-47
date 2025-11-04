import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRetentionAutomation } from '@/hooks/useRetentionAutomation';
import { Play, Calendar, Users, TrendingUp, Bell } from 'lucide-react';

export function RetentionAutomationPanel() {
  const { triggerRetentionCampaign, isRunning } = useRetentionAutomation();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🤖 מערכת Retention אוטומטית
          </CardTitle>
          <CardDescription>
            מערכת חכמה לשליחת הודעות אוטומטיות מותאמות אישית בהתאם למצב המשתמש
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Manual Trigger */}
          <div className="p-4 border rounded-lg bg-gradient-to-r from-blue-50 to-blue-100">
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <Play className="h-5 w-5" />
              הפעלה ידנית
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              הפעל את מערכת ה-retention מיידית לכל המשתמשים
            </p>
            <Button
              onClick={triggerRetentionCampaign}
              disabled={isRunning}
              className="w-full"
            >
              {isRunning ? '⏳ מפעיל...' : '🚀 הפעל עכשיו'}
            </Button>
          </div>

          {/* Segmentation Explanation */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">📊 סגמנטציה חכמה:</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="border-green-200 bg-green-50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    משתמשים חדשים (יום 0)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">
                    📩 הודעת onboarding עם מדריך שימוש והנחיה להעלאת מלאי
                  </p>
                  <div className="mt-2 text-xs text-gray-500">
                    • מדריך התחלה מהירה<br />
                    • קישור להעלאת מלאי<br />
                    • כפתור לתמיכה
                  </div>
                </CardContent>
              </Card>

              <Card className="border-orange-200 bg-orange-50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    ללא מלאי (ימים 1-4)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">
                    📩 תזכורת להעלאת מלאי + הסבר על היתרונות
                  </p>
                  <div className="mt-2 text-xs text-gray-500">
                    • הסבר על התאמות אוטומטיות<br />
                    • זמן השלמת תהליך: 2 דקות<br />
                    • קישור ישיר להעלאה
                  </div>
                </CardContent>
              </Card>

              <Card className="border-blue-200 bg-blue-50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    עם מלאי + משלמים
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">
                    📊 דו"ח יומי מפורט עם נתונים מתקדמים
                  </p>
                  <div className="mt-2 text-xs text-gray-500">
                    • סיכום התראות + ערך כספי<br />
                    • פירוט יהלומים פופולריים<br />
                    • מספר לקוחות מעוניינים<br />
                    • כפתורים לצפייה בהתראות
                  </div>
                </CardContent>
              </Card>

              <Card className="border-gray-200 bg-gray-50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Bell className="h-4 w-4" />
                    עם מלאי + חינם
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">
                    📊 דו"ח יומי בסיסי + קריאה לשדרוג
                  </p>
                  <div className="mt-2 text-xs text-gray-500">
                    • סיכום התראות<br />
                    • ערך פוטנציאלי של עסקאות<br />
                    • הצעת שדרוג לפרימיום<br />
                    • הסבר על יתרונות השדרוג
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Automation Schedule */}
          <div className="p-4 border rounded-lg bg-gradient-to-r from-purple-50 to-purple-100">
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              לוח זמנים אוטומטי
            </h3>
            <p className="text-sm text-gray-600 mb-2">
              המערכת תרוץ אוטומטית כל יום ב-18:00
            </p>
            <div className="text-xs text-gray-500 space-y-1">
              <div>• בדיקת סטטוס תשלום מול FastAPI</div>
              <div>• סגמנטציה חכמה של משתמשים</div>
              <div>• שליחת הודעות מותאמות אישית</div>
              <div>• שמירת לוג למעקב</div>
            </div>
          </div>

          {/* Technical Details */}
          <div className="p-4 border rounded-lg bg-gray-50">
            <h3 className="font-semibold mb-2 text-sm">⚙️ פרטים טכניים:</h3>
            <ul className="text-xs text-gray-600 space-y-1">
              <li>✅ מניעת שליחת הודעות כפולות באותו יום</li>
              <li>✅ עיכוב של 100ms בין הודעות למניעת rate limiting</li>
              <li>✅ שמירת היסטוריה ב-daily_summaries</li>
              <li>✅ התאמה אישית לשפה עברית</li>
              <li>✅ כפתורי inline לפעולות מהירות</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
