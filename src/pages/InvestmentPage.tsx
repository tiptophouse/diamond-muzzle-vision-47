
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { useToast } from '@/hooks/use-toast';
import { useInvestmentAnalytics } from '@/hooks/useInvestmentAnalytics';
import { 
  Diamond, 
  TrendingUp, 
  Users, 
  Clock, 
  Shield, 
  FileText, 
  Calendar,
  Sparkles,
  Target,
  Zap
} from 'lucide-react';

interface CountdownTimer {
  hours: number;
  minutes: number;
  seconds: number;
}

export default function InvestmentPage() {
  const { user } = useTelegramAuth();
  const { toast } = useToast();
  const { 
    trackInvestmentPageView, 
    trackInterestExpressed, 
    trackNDAStart, 
    trackNDASigned, 
    trackMeetingScheduled 
  } = useInvestmentAnalytics();
  
  const [timeLeft, setTimeLeft] = useState<CountdownTimer>({ hours: 72, minutes: 0, seconds: 0 });
  const [currentUsers] = useState(49);
  const [hasSignedNDA, setHasSignedNDA] = useState(false);
  const [showLegalGateway, setShowLegalGateway] = useState(false);
  const [isSchedulingMeeting, setIsSchedulingMeeting] = useState(false);

  // Track page view on mount
  useEffect(() => {
    trackInvestmentPageView();
  }, []);

  // 72-hour countdown timer
  useEffect(() => {
    const targetDate = new Date();
    targetDate.setHours(targetDate.getHours() + 72);

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = targetDate.getTime() - now;

      if (distance > 0) {
        setTimeLeft({
          hours: Math.floor(distance / (1000 * 60 * 60)),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000)
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleExpressInterest = async () => {
    await trackInterestExpressed();
    setShowLegalGateway(true);
    toast({
      title: "עניין נרשם",
      description: "אנא בדוק וחתום על ההסכמים המשפטיים להמשך.",
    });
  };

  const handleSignNDA = async () => {
    await trackNDAStart();
    // Simulate NDA signing process
    setTimeout(async () => {
      setHasSignedNDA(true);
      await trackNDASigned();
      toast({
        title: "הסכם סודיות נחתם בהצלחה",
        description: "כעת ניתן לתזמן פגישה לדיון על פרטי ההשקעה.",
      });
    }, 1000);
  };

  const handleScheduleMeeting = async () => {
    setIsSchedulingMeeting(true);
    await trackMeetingScheduled({ calendly_url: 'https://calendly.com/avtipoos' });
    
    // Open Calendly in a new window
    window.open('https://calendly.com/avtipoos', '_blank');
    
    toast({
      title: "תיזמון פגישה",
      description: "פותח Calendly לתיזמון פגישת המשקיעים שלך.",
    });
  };

  if (showLegalGateway && !hasSignedNDA) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4" dir="rtl">
        <div className="max-w-2xl mx-auto space-y-6">
          <Card className="border-2 border-blue-200 shadow-xl">
            <CardHeader className="text-center pb-2">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900">
                שער משפטי
              </CardTitle>
              <p className="text-gray-600">
                אנא בדוק וחתום על ההסכמים המשפטיים הנדרשים להמשך
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <h3 className="font-semibold text-amber-800 mb-2 flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  הסכם אי גילוי (NDA)
                </h3>
                <p className="text-sm text-amber-700 mb-4">
                  הסכם זה מבטיח ששמירת סודיות על כל המידע הסודי שישותף במהלך תהליך ההשקעה.
                </p>
                <div className="space-y-2 text-sm text-amber-700">
                  <p>• סודיות מידע עסקי</p>
                  <p>• הגנה על טכנולוגיה קניינית</p>
                  <p>• אי גילוי נתונים פיננסיים</p>
                  <p>• סודיות תנאי השקעה</p>
                </div>
              </div>

              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h3 className="font-semibold text-red-800 mb-2 flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  הסכם אי תחרות
                </h3>
                <p className="text-sm text-red-700 mb-4">
                  הסכם זה מונע יצירת פלטפורמות מסחר יהלומים מתחרות במהלך תהליך ההשקעה.
                </p>
                <div className="space-y-2 text-sm text-red-700">
                  <p>• אי פיתוח פלטפורמה מתחרה</p>
                  <p>• הגנה על מודל עסקי</p>
                  <p>• תקופת דיון בלעדית</p>
                  <p>• סעיף הגנת שוק</p>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <Button 
                  onClick={handleSignNDA}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3"
                >
                  <FileText className="w-5 h-5 ml-2" />
                  אני מסכים - חתום על ההסכמים המשפטיים
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowLegalGateway(false)}
                  className="w-full"
                >
                  חזור לסקירת ההשקעה
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (hasSignedNDA) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-4" dir="rtl">
        <div className="max-w-4xl mx-auto space-y-6">
          <Card className="border-2 border-green-200 shadow-xl">
            <CardHeader className="text-center pb-2">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-green-600 to-emerald-600 rounded-full flex items-center justify-center">
                <Calendar className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900">
                תזמון פגישת השקעה
              </CardTitle>
              <p className="text-green-600 font-medium">
                ✅ ההסכמים המשפטיים הושלמו בהצלחה
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <h3 className="font-semibold text-green-800 mb-4 text-lg">
                  🎉 ברוכים הבאים להזדמנות השקעה BrilliantBot
                </h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-2">📊 מדדים נוכחיים</h4>
                    <div className="space-y-1 text-sm">
                      <p>• {currentUsers} משתמשי פרימיום ($50/חודש)</p>
                      <p>• תמחור לכל החיים לעומת תקן של $75</p>
                      <p>• טכנולוגיית התאמת יהלומים מונעת AI</p>
                      <p>• מערכת מעקב קבוצות 24/7</p>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">🚀 הזדמנות השקעה</h4>
                    <div className="space-y-1 text-sm">
                      <p>• מחפש השקעת הון של 3-15%</p>
                      <p>• הרחבת פלטפורמת מסחר יהלומים</p>
                      <p>• מערכת התאמה AI מהפכנית</p>
                      <p>• שיבוש תעשיית היהלומים העולמית</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="text-center space-y-4">
                <h3 className="text-xl font-semibold text-gray-900">
                  מוכן לדון על ההזדמנות?
                </h3>
                <p className="text-gray-600">
                  תזמן פגישה סודית לסקירת התוכנית העסקית, הכספים ואסטרטגיית הצמיחה שלנו.
                </p>
                
                <Button 
                  onClick={handleScheduleMeeting}
                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-3 px-8 text-lg"
                >
                  <Calendar className="w-5 h-5 ml-2" />
                  תזמן פגישה עכשיו
                </Button>
                
                <p className="text-sm text-gray-500">
                  הפגישה תתוזמן דרך Calendly - נפתח בחלון חדש
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-800 mb-2">מה לצפות בפגישה:</h4>
                <div className="grid md:grid-cols-2 gap-4 text-sm text-blue-700">
                  <div>
                    <p>• מצגת מודל עסקי מפורטת</p>
                    <p>• תחזיות פיננסיות ומדדים</p>
                    <p>• הדגמת טכנולוגיה</p>
                  </div>
                  <div>
                    <p>• ניתוח הזדמנות שוק</p>
                    <p>• דיון על תנאי השקעה</p>
                    <p>• מושב שאלות ותשובות</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4" dir="rtl">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Urgent Header with Countdown */}
        <Card className="border-2 border-red-200 bg-gradient-to-r from-red-50 to-orange-50 shadow-xl">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="text-center md:text-right">
                <h1 className="text-2xl md:text-3xl font-bold text-red-700 mb-2">
                  ⚡ הזדמנות השקעה בלעדית ⚡
                </h1>
                <p className="text-red-600 font-medium">
                  זמן מוגבל: 72 שעות בלבד | מחפשים משקיעים אסטרטגיים
                </p>
              </div>
              <div className="bg-red-100 rounded-lg p-4 border-2 border-red-200">
                <div className="text-center">
                  <p className="text-sm font-semibold text-red-700 mb-1">זמן נותר</p>
                  <div className="flex gap-2 text-2xl font-bold text-red-800">
                    <span>{timeLeft.hours.toString().padStart(2, '0')}</span>
                    <span>:</span>
                    <span>{timeLeft.minutes.toString().padStart(2, '0')}</span>
                    <span>:</span>
                    <span>{timeLeft.seconds.toString().padStart(2, '0')}</span>
                  </div>
                  <p className="text-xs text-red-600">ש : ד : ש</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Investment Pitch */}
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card className="shadow-xl border-2 border-blue-200">
              <CardHeader>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center">
                    <Diamond className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl text-gray-900">
                      מהפכת BrilliantBot
                    </CardTitle>
                    <p className="text-blue-600 font-medium">
                      פלטפורמת מסחר יהלומים מונעת AI
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
                  <h3 className="text-xl font-bold text-blue-900 mb-4">
                    🚀 ההזדמנות
                  </h3>
                  <p className="text-blue-800 mb-4 leading-relaxed">
                    הצטרף לעתיד מסחר היהלומים! אנחנו מחוללים מהפכה בתעשיית היהלומים בסך $100+ מיליארד 
                    עם טכנולוגיית התאמה מונעת AI, מעקב קבוצות 24/7 וניהול מלאי חכם.
                  </p>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <p className="flex items-center gap-2 text-blue-700">
                        <Zap className="w-4 h-4" />
                        <strong>התאמה חכמה AI</strong>
                      </p>
                      <p className="flex items-center gap-2 text-blue-700">
                        <Target className="w-4 h-4" />
                        <strong>מעקב קבוצות 24/7</strong>
                      </p>
                    </div>
                    <div className="space-y-2">
                      <p className="flex items-center gap-2 text-blue-700">
                        <TrendingUp className="w-4 h-4" />
                        <strong>התראות אוטומטיות</strong>
                      </p>
                      <p className="flex items-center gap-2 text-blue-700">
                        <Sparkles className="w-4 h-4" />
                        <strong>ניהול מלאי חכם</strong>
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-green-700">{currentUsers}</div>
                    <div className="text-sm text-green-600">משתמשי פרימיום</div>
                    <div className="text-xs text-green-500">$50/חודש כל אחד</div>
                  </div>
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-purple-700">3-15%</div>
                    <div className="text-sm text-purple-600">טווח הון</div>
                    <div className="text-xs text-purple-500">השקעה אסטרטגית</div>
                  </div>
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-orange-700">$75</div>
                    <div className="text-sm text-orange-600">מחיר רגיל</div>
                    <div className="text-xs text-orange-500">לעומת $50 נעול</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            {/* User Progress */}
            <Card className="shadow-lg border-2 border-green-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-700">
                  <Users className="w-5 h-5" />
                  משתמשים מייסדים
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-700">
                    {currentUsers}/100
                  </div>
                  <p className="text-sm text-green-600">
                    משתמשי פרימיום הצטרפו
                  </p>
                </div>
                <Progress value={(currentUsers / 100) * 100} className="h-3" />
                <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                  <p className="text-sm text-green-700 text-center">
                    <strong>{100 - currentUsers} מקומות נותרו</strong> לתמחור משתמש מייסד
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Investment CTA */}
            <Card className="shadow-lg border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
              <CardContent className="p-6 text-center space-y-4">
                <div className="w-16 h-16 mx-auto bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center mb-4">
                  <TrendingUp className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-blue-900">
                  מוכן להצטרף למהפכה?
                </h3>
                <p className="text-blue-700 text-sm">
                  הבטח את מקומך בעתיד מסחר היהלומים
                </p>
                <Button 
                  onClick={handleExpressInterest}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3"
                >
                  <Diamond className="w-5 h-5 ml-2" />
                  הבע עניין בהשקעה
                </Button>
                <p className="text-xs text-gray-500">
                  כפוף להסכם סודיות ואי תחרות
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Additional Information */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl text-gray-900">
              למה להשקיע ב-BrilliantBot?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <TrendingUp className="w-8 h-8 text-blue-600 mx-auto mb-3" />
                <h4 className="font-semibold text-blue-900 mb-2">שוק צומח</h4>
                <p className="text-sm text-blue-700">
                  תעשיית יהלומים בסך $100+ מיליארד מוכנה לטרנספורמציה דיגיטלית
                </p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <Zap className="w-8 h-8 text-green-600 mx-auto mb-3" />
                <h4 className="font-semibold text-green-900 mb-2">טכנולוגיית AI</h4>
                <p className="text-sm text-green-700">
                  מערכת התאמה קניינית AI עם יכולות מעקב 24/7
                </p>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <Users className="w-8 h-8 text-purple-600 mx-auto mb-3" />
                <h4 className="font-semibold text-purple-900 mb-2">אחיזה מוכחת</h4>
                <p className="text-sm text-purple-700">
                  49 משתמשים משלמים עם שימור חזק וביקוש גובר
                </p>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <Target className="w-8 h-8 text-orange-600 mx-auto mb-3" />
                <h4 className="font-semibold text-orange-900 mb-2">אסטרטגיה ברורה</h4>
                <p className="text-sm text-orange-700">
                  מפת דרכים מוגדרת היטב להרחבה ולחדירה לשוק
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
