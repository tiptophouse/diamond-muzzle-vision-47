import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Shield } from 'lucide-react';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader className="text-center border-b">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Shield className="h-10 w-10 text-blue-600" />
              <CardTitle className="text-3xl font-bold">מדיניות פרטיות</CardTitle>
            </div>
            <p className="text-muted-foreground">BrilliantBot</p>
            <p className="text-xs text-muted-foreground mt-2">עדכון אחרון: אוקטובר 2025</p>
          </CardHeader>
          <CardContent className="p-6">
            <ScrollArea className="h-[600px] pr-4">
              <div className="space-y-6 text-right" dir="rtl">
                
                <section>
                  <h2 className="text-xl font-bold mb-3 text-blue-700">1. מבוא</h2>
                  <p className="text-gray-700 leading-relaxed">
                    BrilliantBot בע״מ ("החברה", "אנחנו") מחויבת להגן על פרטיותך. מדיניות פרטיות זו מסבירה כיצד אנו אוספים, משתמשים, ומגינים על המידע האישי שלך בעת שימוש בשירות BrilliantBot.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-bold mb-3 text-blue-700">2. איסוף מידע</h2>
                  <p className="text-gray-700 leading-relaxed mb-2">אנו אוספים את סוגי המידע הבאים:</p>
                  <ul className="list-disc pr-6 space-y-2 text-gray-700">
                    <li><strong>מידע חשבון:</strong> מזהה טלגרם, שם פרטי, שם משפחה, שם משתמש</li>
                    <li><strong>מידע עסקי:</strong> נתוני יהלומים, מלאי, מחירים, קבצים שהעלית</li>
                    <li><strong>נתוני שימוש:</strong> אינטראקציות עם המערכת, פעולות, זמני פעילות</li>
                    <li><strong>נתונים טכניים:</strong> כתובת IP, סוג מכשיר, מידע דפדפן</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-xl font-bold mb-3 text-blue-700">3. שימוש במידע</h2>
                  <p className="text-gray-700 leading-relaxed mb-2">אנו משתמשים במידע שנאסף למטרות הבאות:</p>
                  <ul className="list-disc pr-6 space-y-2 text-gray-700">
                    <li>אספקת והפעלת השירות</li>
                    <li>ניהול חשבונך והמלאי שלך</li>
                    <li>עיבוד תשלומים (דרך Cardcom)</li>
                    <li>שיפור חווית המשתמש והתאמה אישית</li>
                    <li>שליחת התראות והודעות רלוונטיות</li>
                    <li>זיהוי ומניעת שימוש לרעה או הונאה</li>
                    <li>ניתוח שימוש ושיפור השירות</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-xl font-bold mb-3 text-blue-700">4. אבטחת מידע</h2>
                  <p className="text-gray-700 leading-relaxed mb-2">
                    אנו נוקטים באמצעי אבטחה מתקדמים כדי להגן על המידע שלך:
                  </p>
                  <ul className="list-disc pr-6 space-y-2 text-gray-700">
                    <li>הצפנת נתונים בזמן העברה ואחסון</li>
                    <li>גישה מוגבלת למידע רגיש</li>
                    <li>אימות דו-שלבי למשתמשים</li>
                    <li>ניטור אבטחה שוטף</li>
                    <li>גיבויים אוטומטיים</li>
                  </ul>
                  <p className="text-gray-700 leading-relaxed mt-2">
                    <strong>חשוב:</strong> פרטי תשלום מעובדים ומאוחסנים בידי Cardcom בלבד, בהתאם לתקני PCI-DSS. אנחנו לא שומרים פרטי כרטיס אשראי בשרתים שלנו.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-bold mb-3 text-blue-700">5. שיתוף מידע</h2>
                  <p className="text-gray-700 leading-relaxed mb-2">
                    אנו לא מוכרים או משכירים את המידע האישי שלך. אנו עשויים לשתף מידע במקרים הבאים:
                  </p>
                  <ul className="list-disc pr-6 space-y-2 text-gray-700">
                    <li><strong>ספקי שירות:</strong> Cardcom לעיבוד תשלומים, Supabase לאחסון נתונים</li>
                    <li><strong>דרישות חוק:</strong> כאשר נדרש על-פי חוק או צו בית משפט</li>
                    <li><strong>הגנה על זכויות:</strong> כדי להגן על זכויותינו, רכושנו או בטחוננו</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-xl font-bold mb-3 text-blue-700">6. זכויות המשתמש</h2>
                  <p className="text-gray-700 leading-relaxed mb-2">
                    בהתאם לחוק הגנת הפרטיות התשמ״א-1981, יש לך את הזכויות הבאות:
                  </p>
                  <ul className="list-disc pr-6 space-y-2 text-gray-700">
                    <li>זכות לעיין במידע שאנו מחזיקים עליך</li>
                    <li>זכות לתקן מידע שגוי או לא מדויק</li>
                    <li>זכות למחוק את חשבונך והמידע שלך</li>
                    <li>זכות להתנגד לשימושים מסוימים במידע</li>
                    <li>זכות לקבל העתק של המידע שלך</li>
                  </ul>
                  <p className="text-gray-700 leading-relaxed mt-2">
                    לממש את זכויותיך, צור קשר עמנו בכתובת: avtipoos@gmail.com
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-bold mb-3 text-blue-700">7. עוגיות (Cookies)</h2>
                  <p className="text-gray-700 leading-relaxed">
                    אנו משתמשים בעוגיות ובטכנולוגיות דומות כדי לשפר את חווית המשתמש, לנתח שימוש, ולזכור העדפות. אתה יכול לנהל את העדפות העוגיות בהגדרות הדפדפן שלך.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-bold mb-3 text-blue-700">8. שימוש בטלגרם</h2>
                  <p className="text-gray-700 leading-relaxed">
                    השירות פועל באמצעות טלגרם. אנו מקבלים מידע בסיסי מטלגרם (מזהה, שם) כדי לאמת את זהותך ולספק את השירות. מדיניות הפרטיות של טלגרם חלה גם על השימוש בפלטפורמה שלהם.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-bold mb-3 text-blue-700">9. שינויים במדיניות</h2>
                  <p className="text-gray-700 leading-relaxed">
                    אנו שומרים לעצמנו את הזכות לעדכן מדיניות פרטיות זו מעת לעת. נודיע לך על שינויים מהותיים באמצעות הודעה במערכת או בדוא״ל. המשך שימוש בשירות לאחר שינויים מהווה הסכמה למדיניות המעודכנת.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-bold mb-3 text-blue-700">10. שמירת מידע</h2>
                  <p className="text-gray-700 leading-relaxed">
                    אנו שומרים את המידע שלך כל עוד חשבונך פעיל או כנדרש לצורך מתן השירות. בעת מחיקת החשבון, נמחק את המידע האישי שלך בהתאם לדרישות החוק, למעט מידע שנדרש לשמור לצרכי רישום, דיווח או משפטיים.
                  </p>
                </section>

                <section className="border-t pt-6 mt-6">
                  <h2 className="text-xl font-bold mb-3 text-blue-700">יצירת קשר</h2>
                  <p className="text-gray-700 leading-relaxed mb-2">
                    לשאלות או בקשות בנוגע למדיניות פרטיות זו, ניתן לפנות אלינו:
                  </p>
                  <ul className="list-none space-y-2 text-gray-700">
                    <li><strong>דוא״ל:</strong> avtipoos@gmail.com</li>
                    <li><strong>בוט טלגרם:</strong> @diamondmazalbot</li>
                  </ul>
                </section>

                <div className="text-center text-sm text-muted-foreground mt-8 pt-6 border-t">
                  <p>© 2025 BrilliantBot בע״מ. כל הזכויות שמורות.</p>
                </div>

              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
