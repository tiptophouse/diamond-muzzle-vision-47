import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Lightbulb, Target, TrendingUp, Zap, Gift, Sparkles } from 'lucide-react';

interface CampaignIdea {
  title: string;
  description: string;
  targetAudience: string;
  estimatedReach: number;
  priority: 'high' | 'medium' | 'low';
  messageTemplate: string;
  buttons: Array<{ label: string; targetPage: string }>;
}

const CAMPAIGN_IDEAS: CampaignIdea[] = [
  {
    title: '🚀 Mini App Launch - "Open for First Time"',
    description: 'Target 223 bot users who never opened the mini app. Showcase new features and benefits.',
    targetAudience: 'Bot users without mini app profile (223 users)',
    estimatedReach: 223,
    priority: 'high',
    messageTemplate: `🎉 *BrilliantBot Mini App is Live!*

היי! שמנו לב שיש לך את הבוט אבל עדיין לא פתחת את האפליקציה החדשה שלנו! 

✨ *מה חדש?*
• 💎 ניהול מלאי יהלומים דיגיטלי
• 🤖 עוזר AI חכם למענה על שאלות
• 📊 דשבורד אנליטיקה מתקדם
• 🔔 התראות אוטומטיות על התאמות

לחץ על הכפתור למטה לפתיחה ראשונה! 👇`,
    buttons: [
      { label: '🚀 פתח את האפליקציה', targetPage: 'dashboard' },
      { label: '💎 העלה יהלומים', targetPage: 'upload' }
    ]
  },
  {
    title: '💎 Upload Activation - Zero Inventory Users',
    description: 'Re-engage 400+ users who registered but never uploaded diamonds.',
    targetAudience: 'Users with 0 diamonds (400+ users)',
    estimatedReach: 400,
    priority: 'high',
    messageTemplate: `💎 *התחל למכור יהלומים עוד היום!*

היי! ראינו שנרשמת אבל עדיין לא העלת יהלומים למערכת.

🎁 *במיוחד בשבילך:*
• העלאת מלאי ראשונה חינם (עד 100 אבנים)
• הדרכה אישית צמודה
• גישה מיידית ל-AI Agent למכירות
• חיבור אוטומטי ל-Acadia

*אל תפספס!* רק 5 דקות וכבר תתחיל למכור 🚀`,
    buttons: [
      { label: '📤 העלה מלאי עכשיו', targetPage: 'upload' },
      { label: '🤖 דבר עם AI', targetPage: 'ai' }
    ]
  },
  {
    title: '🔥 Feature Highlight - Active Users',
    description: 'Educate 96 active users about advanced features they might not know.',
    targetAudience: 'Users with inventory (96 users)',
    estimatedReach: 96,
    priority: 'medium',
    messageTemplate: `🔥 *פיצ'רים שלא הכרת ב-BrilliantBot!*

יש לך מלאי במערכת - מעולה! 
אבל האם ידעת על כל היכולות?

✨ *פיצ'רים מתקדמים:*
• 🎯 התאמות אוטומטיות למוכרים
• 📊 אנליטיקה על יהלומים פופולריים
• 🤖 AI Agent לשאלות מקצועיות
• 🔗 שיתוף יהלומים בקבוצות

התחל להשתמש בכל היכולות עכשיו! 👇`,
    buttons: [
      { label: '🤖 נסה את ה-AI', targetPage: 'ai' },
      { label: '📊 ראה אנליטיקה', targetPage: 'analytics' },
      { label: '🔔 התאמות חדשות', targetPage: 'notifications' }
    ]
  },
  {
    title: '🎁 Weekly Engagement - All Users',
    description: 'Regular touchpoint with value updates and tips for all 719 bot users.',
    targetAudience: 'All bot users (719 users)',
    estimatedReach: 719,
    priority: 'medium',
    messageTemplate: `📈 *עדכון שבועי - BrilliantBot*

*המספרים השבוע:*
• 🔥 50+ התאמות חדשות נוצרו
• 💎 200+ יהלומים הועלו
• 🤝 15+ עסקאות נסגרו

*טיפ השבוע:* 
השתמש ב-AI Agent לקבלת תשובות מקצועיות על יהלומים תוך שניות!

בוא נגדיל את המכירות שלך השבוע 💪`,
    buttons: [
      { label: '💬 שאל את ה-AI', targetPage: 'ai' },
      { label: '📊 ראה דשבורד', targetPage: 'dashboard' }
    ]
  },
  {
    title: '🔗 Acadia Integration Push',
    description: 'Promote Acadia SFTP integration to users with significant inventory.',
    targetAudience: 'Users with 50+ diamonds (estimated 30 users)',
    estimatedReach: 30,
    priority: 'low',
    messageTemplate: `🔗 *חבר את Acadia ל-BrilliantBot!*

יש לך מלאי משמעותי במערכת - מעולה!
עכשיו תוכל לסנכרן אוטומטית עם Acadia.

✅ *יתרונות:*
• סנכרון אוטומטי של מלאי
• עדכונים בזמן אמת
• אין עוד עדכונים ידניים
• חיבור חינמי למשתמשים מובילים

זמן חיבור: 3 דקות בלבד! ⚡`,
    buttons: [
      { label: '🔗 חבר ל-Acadia', targetPage: 'settings' },
      { label: '📖 קרא עוד', targetPage: 'help' }
    ]
  },
  {
    title: '🏆 Success Stories & Social Proof',
    description: 'Share wins and testimonials to build trust with all users.',
    targetAudience: 'All users (719 users)',
    estimatedReach: 719,
    priority: 'low',
    messageTemplate: `🏆 *סיפורי הצלחה מ-BrilliantBot*

"תוך שבוע סגרתי 3 עסקאות דרך ההתאמות!" - יוסי, תל אביב

"ה-AI חסך לי שעות בתשובות ללקוחות" - דוד, רמת גן

"המערכת פשוט עובדת. המלאי שלי תמיד מעודכן" - משה, ירושלים

הצטרף למאות סוחרים מצליחים! 💎`,
    buttons: [
      { label: '🚀 התחל עכשיו', targetPage: 'dashboard' },
      { label: '💬 דבר איתנו', targetPage: 'support' }
    ]
  }
];

export default function CampaignIdeas() {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500/10 text-red-600 border-red-600';
      case 'medium': return 'bg-yellow-500/10 text-yellow-600 border-yellow-600';
      case 'low': return 'bg-green-500/10 text-green-600 border-green-600';
      default: return 'bg-gray-500/10 text-gray-600 border-gray-600';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return Zap;
      case 'medium': return TrendingUp;
      case 'low': return Sparkles;
      default: return Lightbulb;
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-primary/5 border-primary/20">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-primary" />
            <CardTitle>Campaign Ideas for 719 Users</CardTitle>
          </div>
          <CardDescription>
            Strategic campaigns ranked by priority and estimated impact
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid gap-6">
        {CAMPAIGN_IDEAS.map((idea, index) => {
          const PriorityIcon = getPriorityIcon(idea.priority);
          
          return (
            <Card key={index} className="bg-card">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <CardTitle className="text-lg">{idea.title}</CardTitle>
                    <CardDescription>{idea.description}</CardDescription>
                  </div>
                  <Badge variant="outline" className={getPriorityColor(idea.priority)}>
                    <PriorityIcon className="h-3 w-3 mr-1" />
                    {idea.priority.toUpperCase()}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Target Audience */}
                <div className="flex items-center gap-2 text-sm">
                  <Target className="h-4 w-4 text-primary" />
                  <span className="font-medium">Target:</span>
                  <span className="text-muted-foreground">{idea.targetAudience}</span>
                  <Badge variant="secondary" className="mr-auto">
                    ~{idea.estimatedReach} users
                  </Badge>
                </div>

                {/* Message Template */}
                <div className="space-y-2">
                  <p className="text-sm font-medium">Message Template:</p>
                  <div className="rounded-lg border bg-muted/50 p-3">
                    <pre className="whitespace-pre-wrap text-xs font-sans">
                      {idea.messageTemplate}
                    </pre>
                  </div>
                </div>

                {/* Buttons Preview */}
                <div className="space-y-2">
                  <p className="text-sm font-medium">Inline Buttons:</p>
                  <div className="space-y-2">
                    {idea.buttons.map((button, btnIndex) => (
                      <div
                        key={btnIndex}
                        className="rounded-lg border bg-primary/10 text-primary px-4 py-2 text-sm font-medium text-center"
                      >
                        {button.label} → /{button.targetPage}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Copy Button */}
                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(idea.messageTemplate);
                    }}
                    className="flex-1 rounded-lg border bg-background px-4 py-2 text-sm font-medium hover:bg-muted transition-colors"
                  >
                    📋 Copy Message
                  </button>
                  <button
                    onClick={() => {
                      const buttonsJson = JSON.stringify(idea.buttons, null, 2);
                      navigator.clipboard.writeText(buttonsJson);
                    }}
                    className="flex-1 rounded-lg border bg-background px-4 py-2 text-sm font-medium hover:bg-muted transition-colors"
                  >
                    📱 Copy Buttons JSON
                  </button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Summary Card */}
      <Card className="bg-card border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5 text-primary" />
            Recommended Campaign Sequence
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="space-y-3 text-sm">
            <li className="flex items-start gap-2">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-500/10 text-red-600 font-bold text-xs">1</span>
              <div>
                <span className="font-medium">Week 1:</span> Launch "Mini App First Time" campaign to 223 users
              </div>
            </li>
            <li className="flex items-start gap-2">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-500/10 text-red-600 font-bold text-xs">2</span>
              <div>
                <span className="font-medium">Week 2:</span> "Upload Activation" to 400+ zero-inventory users
              </div>
            </li>
            <li className="flex items-start gap-2">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-yellow-500/10 text-yellow-600 font-bold text-xs">3</span>
              <div>
                <span className="font-medium">Week 3:</span> "Feature Highlight" to 96 active users
              </div>
            </li>
            <li className="flex items-start gap-2">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-yellow-500/10 text-yellow-600 font-bold text-xs">4</span>
              <div>
                <span className="font-medium">Ongoing:</span> Weekly engagement messages to all 719 users
              </div>
            </li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}
