import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRetentionAutomation } from '@/hooks/useRetentionAutomation';
import { Play, Users, TrendingUp, Bell, MessageSquare, Calendar } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export function RetentionAutomationPanel() {
  const { triggerRetentionCampaign, isRunning } = useRetentionAutomation();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🤖 מערכת Retention - בקרה ידנית
          </CardTitle>
          <CardDescription>
            בדוק את תוכן ההודעות והפעל ידנית את מערכת ה-retention
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Manual Trigger */}
          <div className="p-4 border rounded-lg bg-gradient-to-r from-blue-50 to-blue-100">
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <Play className="h-5 w-5" />
              שליחה ידנית
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              לחץ לשליחת הודעות לכל המשתמשים לפי הסגמנטציה החכמה
            </p>
            <Button
              onClick={triggerRetentionCampaign}
              disabled={isRunning}
              className="w-full"
              size="lg"
            >
              {isRunning ? '⏳ שולח הודעות...' : '📤 שלח הודעות עכשיו'}
            </Button>
          </div>

          {/* Message Previews */}
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              תצוגה מקדימה של ההודעות
            </h3>
            
            <Tabs defaultValue="new-users" dir="rtl">
              <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
                <TabsTrigger value="new-users">משתמשים חדשים</TabsTrigger>
                <TabsTrigger value="no-inventory">ללא מלאי</TabsTrigger>
                <TabsTrigger value="paying">משלמים</TabsTrigger>
                <TabsTrigger value="free">חינם</TabsTrigger>
              </TabsList>

              <TabsContent value="new-users" className="space-y-3">
                <div className="bg-green-50 p-4 rounded-lg text-sm border border-green-200">
                  <p className="font-semibold mb-2">👋 שלום [שם]!</p>
                  <p className="whitespace-pre-line text-gray-700">
                    ברוך הבא לדיאמונד מזל - הפלטפורמה המתקדמת למסחר ביהלומים! 💎
                    {'\n\n'}
                    🎯 מה תוכל לעשות כאן:
                    {'\n'}• העלה את המלאי שלך בקלית
                    {'\n'}• קבל התאמות אוטומטיות ללקוחות מעוניינים
                    {'\n'}• נהל את היהלומים שלך במקום אחד
                    {'\n'}• שתף יהלומים עם לקוחות ב-1 קליק
                    {'\n\n'}
                    💡 <strong>הצעד הראשון שלך:</strong>
                    {'\n'}העלה את המלאי הראשון שלך והתחל לקבל התאמות!
                    {'\n\n'}
                    בהצלחה! 🚀
                  </p>
                  <div className="mt-3 pt-3 border-t border-green-300">
                    <p className="text-xs text-gray-500">כפתורים:</p>
                    <div className="flex gap-2 mt-2">
                      <div className="bg-blue-500 text-white px-3 py-1 rounded text-xs">📤 העלה מלאי</div>
                      <div className="bg-gray-500 text-white px-3 py-1 rounded text-xs">📚 מדריך שימוש</div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="no-inventory" className="space-y-3">
                <div className="bg-orange-50 p-4 rounded-lg text-sm border border-orange-200">
                  <p className="font-semibold mb-2">היי [שם]! 👋</p>
                  <p className="whitespace-pre-line text-gray-700">
                    שמנו לב שעדיין לא העלת את המלאי שלך...
                    {'\n\n'}
                    ⏰ זה לוקח רק 2 דקות והמערכת תתחיל לעבוד בשבילך:
                    {'\n\n'}
                    ✅ התאמות אוטומטיות ללקוחות
                    {'\n'}✅ התראות בזמן אמת
                    {'\n'}✅ ניהול מלאי חכם
                    {'\n\n'}
                    💎 יש לך יהלומים? הגיע הזמן למכור אותם!
                  </p>
                  <div className="mt-3 pt-3 border-t border-orange-300">
                    <p className="text-xs text-gray-500">כפתורים:</p>
                    <div className="flex gap-2 mt-2">
                      <div className="bg-blue-500 text-white px-3 py-1 rounded text-xs">📤 העלה מלאי עכשיו</div>
                      <div className="bg-gray-500 text-white px-3 py-1 rounded text-xs">💬 צריך עזרה?</div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="paying" className="space-y-3">
                <div className="bg-blue-50 p-4 rounded-lg text-sm border border-blue-200">
                  <p className="font-semibold mb-2">🎯 דו"ח יומי - [תאריך]</p>
                  <p className="whitespace-pre-line text-gray-700">
                    היי [שם]! 💎
                    {'\n\n'}
                    📊 <strong>הסיכום שלך להיום:</strong>
                    {'\n'}🔔 [X] התראות חדשות
                    {'\n'}👥 [X] לקוחות מעוניינים
                    {'\n'}💰 סה"כ ערך עסקאות: $[X]
                    {'\n\n'}
                    <strong>🌟 היהלומים הפופולריים שלך:</strong>
                    {'\n'}1. Round 1.5ct D/VS1 - $15,000
                    {'\n'}2. Princess 2.0ct E/VVS2 - $22,000
                    {'\n'}3. Emerald 1.8ct F/VS2 - $18,500
                    {'\n\n'}
                    💡 <strong>כמנוי פרימיום שלנו:</strong>
                    {'\n'}• התאמות בזמן אמת ⚡
                    {'\n'}• גישה ללקוחות VIP 👑
                    {'\n'}• ניתוח מתקדם 📊
                    {'\n\n'}
                    <em>לחץ להצגת הפרטים המלאים ושליחת הצעות מחיר ללקוחות</em> 👇
                  </p>
                  <div className="mt-3 pt-3 border-t border-blue-300">
                    <p className="text-xs text-gray-500">כפתורים:</p>
                    <div className="flex gap-2 mt-2">
                      <div className="bg-blue-500 text-white px-3 py-1 rounded text-xs">📱 פתח דשבורד</div>
                      <div className="bg-gray-500 text-white px-3 py-1 rounded text-xs">🔔 צפה בהתראות</div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="free" className="space-y-3">
                <div className="bg-gray-50 p-4 rounded-lg text-sm border border-gray-200">
                  <p className="font-semibold mb-2">📊 דו"ח יומי - [תאריך]</p>
                  <p className="whitespace-pre-line text-gray-700">
                    היי [שם]!
                    {'\n\n'}
                    🔔 קיבלת [X] התראות חדשות היום
                    {'\n'}💰 סה"כ ערך עסקאות פוטנציאליות: $[X]
                    {'\n\n'}
                    🚀 <strong>שדרג לפרימיום וקבל:</strong>
                    {'\n'}• ניתוח מתקדם של הלקוחות שלך
                    {'\n'}• עדיפות בהתאמות
                    {'\n'}• פרטי יצירת קשר מלאים של לקוחות
                    {'\n'}• תמיכה VIP
                    {'\n\n'}
                    💎 למכירות מקסימליות - שדרג עכשיו!
                  </p>
                  <div className="mt-3 pt-3 border-t border-gray-300">
                    <p className="text-xs text-gray-500">כפתורים:</p>
                    <div className="flex gap-2 mt-2">
                      <div className="bg-gray-500 text-white px-3 py-1 rounded text-xs">🔔 צפה בהתראות</div>
                      <div className="bg-yellow-500 text-white px-3 py-1 rounded text-xs">👑 שדרג לפרימיום</div>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
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

          {/* Logic Explanation */}
          <div className="p-4 border rounded-lg bg-gray-50">
            <h3 className="font-semibold mb-2 text-sm">🔄 לוגיקת המערכת:</h3>
            <div className="text-xs text-gray-600 space-y-1">
              <div>1️⃣ שליפת סטטוס תשלום מ-FastAPI</div>
              <div>2️⃣ סגמנטציה חכמה של משתמשים</div>
              <div>3️⃣ שליחת הודעות מותאמות אישית</div>
              <div>4️⃣ שמירת היסטוריה ב-daily_summaries</div>
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
