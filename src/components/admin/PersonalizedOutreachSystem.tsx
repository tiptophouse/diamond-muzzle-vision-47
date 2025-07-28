
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Calendar, Clock, Users, Send, MessageSquare, Phone } from 'lucide-react';

interface UserData {
  telegram_id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  created_at: string;
  last_login?: string;
  diamond_count: number;
  upload_attempts: number;
  user_status: 'active' | 'inactive' | 'dormant';
  language_code?: string;
}

export function PersonalizedOutreachSystem() {
  const { toast } = useToast();
  const [users, setUsers] = useState<UserData[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [messageTemplate, setMessageTemplate] = useState('');
  const [calendarLink, setCalendarLink] = useState('https://calendly.com/your-calendar-link');
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const hebrewMessageTemplates = {
    recent_joiner: `שלום {firstName} 👋

ראיתי שהצטרפת לאחרונה למערכת ניהול היהלומים שלנו - ברוך הבא!

🎯 **אני כאן לעזור לך אישית**

אנחנו סטארט-אפ שמנסה להבין לעומק את תעשיית היהלומים, והמשוב שלך זה זהב עבורנו.

**המערכת שלנו מאפשרת:**
• העלאת מלאי יהלומים בקלות ובמהירות
• ניהול מקצועי של המלאי שלך
• חזית חנות יפה ללקוחות
• כלי שיתוף מתקדמים ואנליטיקה

❓ **יש לי כמה שאלות מהירות:**
• מה הקשיים שאתה חווה עם העלאת המלאי?
• איך אני יכול לעזור לך להתחיל?
• מה החסר במערכת הנוכחית?

📅 **בוא נדבר אישית!**
קבע פגישה קצרה איתי (10-15 דקות) ואני אסביר לך בדיוק איך המערכת עובדת ואיך היא יכולה לעזור לעסק שלך:

{calendarLink}

המשוב שלך יעזור לנו לבנות משהו מדהים עבור תעשיית היהלומים! 💎

בברכה,
המייסד`,

    hebrew_speaker: `שלום {firstName}! 🇮🇱

שמחתי לראות שהצטרפת למערכת ניהול היהלומים שלנו!

כמייסד הסטארט-אפ הזה, אני מנסה להבין מה הכי חסר לסוחרי יהלומים בישראל.

**המערכת הנוכחית מציעה:**
• סריקת תעודות יהלומים אוטומטית
• ניהול מלאי חכם ומקצועי  
• חנות וירטואלית ללקוחות
• כלי אנליטיקה מתקדמים

💭 **אני רוצה להבין:**
• איך אתה מנהל מלאי כרגע?
• מה הכי מעצבן אותך בתהליך הנוכחי?
• איך המערכת יכולה לחסוך לך זמן?

🤝 **בוא נעשה זאת יחד!**
אני מזמין אותך לשיחה קצרה (רק 10-15 דקות) שבה אני אראה לך בדיוק איך המערכת עובדת ואיך להעלות את היהלום הראשון:

{calendarLink}

יחד נבנה את הכלי הטוב ביותר לתעשיית היהלומים! 🚀

בהערכה,
המייסד של המערכת`,

    established_name: `שלום {firstName}, 🎩

אני מכיר את השם שלך בתעשייה ונרגש שהצטרפת למערכת שלנו!

כמישהו מנוסה בתחום, המשוב שלך חשוב לי במיוחד.

**המערכת מתמחה ב:**
• דיגיטציה מלאה של תהליכי המלאי
• אוטומציה של משימות יומיומיות
• שיפור חוויית הלקוח הקצה
• נתונים ותובנות עסקיות

🎯 **השאלות שלי אליך:**
• מה הכי מאתגר בניהול מלאי דיגיטלי?
• איך אפשר לעשות את התהליך יותר יעיל?
• מה הפיצ'ר החסר שהכי היית רוצה?

📞 **שיחת ייעוץ מקצועית**
אני מזמין אותך לשיחה איכותית (15-20 דקות) שבה נדבר על החזון של המערכת ואיך היא יכולה לשרת את הצרכים המקצועיים שלך:

{calendarLink}

יחד נעצב את עתיד ניהול היהלומים! 💎

בכבוד רב,
המייסד`
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select(`
          telegram_id,
          first_name,
          last_name,
          username,
          created_at,
          last_login,
          language_code
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Get diamond counts for each user
      const usersWithCounts = await Promise.all(
        (data || []).map(async (user) => {
          const { data: diamonds } = await supabase
            .from('inventory')
            .select('id')
            .eq('user_id', user.telegram_id)
            .is('deleted_at', null);

          const { data: uploads } = await supabase
            .from('user_activity_log')
            .select('id')
            .eq('telegram_id', user.telegram_id)
            .like('activity_type', '%upload%');

          return {
            ...user,
            diamond_count: diamonds?.length || 0,
            upload_attempts: uploads?.length || 0,
            user_status: getUserStatus(user.last_login)
          };
        })
      );

      setUsers(usersWithCounts);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: "שגיאה בטעינת המשתמשים",
        description: "לא ניתן לטעון את רשימת המשתמשים",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getUserStatus = (lastLogin?: string): 'active' | 'inactive' | 'dormant' => {
    if (!lastLogin) return 'dormant';
    const loginDate = new Date(lastLogin);
    const now = new Date();
    const daysDiff = (now.getTime() - loginDate.getTime()) / (1000 * 3600 * 24);
    
    if (daysDiff <= 7) return 'active';
    if (daysDiff <= 30) return 'inactive';
    return 'dormant';
  };

  const getMessageForUser = (user: UserData): string => {
    const daysSinceJoined = Math.floor(
      (new Date().getTime() - new Date(user.created_at).getTime()) / (1000 * 60 * 60 * 24)
    );

    let template = '';
    
    if (daysSinceJoined <= 3) {
      template = hebrewMessageTemplates.recent_joiner;
    } else if (user.language_code?.startsWith('he') || user.first_name.match(/[\u0590-\u05FF]/)) {
      template = hebrewMessageTemplates.hebrew_speaker;
    } else {
      template = hebrewMessageTemplates.established_name;
    }

    return template
      .replace('{firstName}', user.first_name)
      .replace('{calendarLink}', calendarLink);
  };

  const toggleUserSelection = (telegramId: number) => {
    setSelectedUsers(prev => 
      prev.includes(telegramId)
        ? prev.filter(id => id !== telegramId)
        : [...prev, telegramId]
    );
  };

  const sendPersonalizedMessages = async () => {
    if (selectedUsers.length === 0) {
      toast({
        title: "לא נבחרו משתמשים",
        description: "אנא בחר לפחות משתמש אחד לשליחת הודעה",
        variant: "destructive",
      });
      return;
    }

    setIsSending(true);
    try {
      const messages = selectedUsers.map(telegramId => {
        const user = users.find(u => u.telegram_id === telegramId);
        if (!user) return null;

        const personalizedMessage = getMessageForUser(user);
        
        return {
          telegram_id: telegramId,
          message_type: 'personal_outreach',
          message_content: personalizedMessage,
          status: 'pending',
          metadata: {
            calendar_link: calendarLink,
            user_segment: getDaysAgo(user.created_at) <= 3 ? 'new' : 'existing',
            pain_point_focus: user.diamond_count === 0 ? 'onboarding' : 'optimization'
          }
        };
      }).filter(Boolean);

      const { error } = await supabase
        .from('notifications')
        .insert(messages);

      if (error) throw error;

      // Send via edge function for immediate delivery
      await supabase.functions.invoke('send-personalized-outreach', {
        body: {
          user_ids: selectedUsers,
          calendar_link: calendarLink
        }
      });

      toast({
        title: "הודעות נשלחו בהצלחה! 🎉",
        description: `נשלחו ${selectedUsers.length} הודעות מותאמות אישית`,
      });

      setSelectedUsers([]);
    } catch (error) {
      console.error('Error sending messages:', error);
      toast({
        title: "שגיאה בשליחה",
        description: "לא ניתן לשלוח את ההודעות כרגע",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  const getDaysAgo = (dateString: string) => {
    return Math.floor((new Date().getTime() - new Date(dateString).getTime()) / (1000 * 60 * 60 * 24));
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">פעיל</Badge>;
      case 'inactive':
        return <Badge className="bg-yellow-100 text-yellow-800">לא פעיל</Badge>;
      case 'dormant':
        return <Badge className="bg-gray-100 text-gray-800">רדום</Badge>;
      default:
        return <Badge variant="outline">לא ידוע</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-pulse text-lg">טוען נתוני משתמשים...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            מערכת הודעות מותאמות אישית בעברית
          </CardTitle>
          <CardDescription>
            שלח הודעות מותאמות אישית למשתמשים לפי הפרופיל שלהם עם קישור לתיאום פגישה
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="calendar-link">קישור ליומן (Calendly/Cal.com)</Label>
            <Input
              id="calendar-link"
              value={calendarLink}
              onChange={(e) => setCalendarLink(e.target.value)}
              placeholder="https://calendly.com/your-calendar-link"
            />
          </div>

          <div className="grid gap-4">
            <h3 className="text-lg font-semibold">בחר משתמשים לשליחה ({selectedUsers.length} נבחרו)</h3>
            
            <div className="grid gap-2 max-h-64 overflow-y-auto">
              {users.map((user) => (
                <div
                  key={user.telegram_id}
                  className={`flex items-center justify-between p-3 border rounded cursor-pointer transition-colors ${
                    selectedUsers.includes(user.telegram_id)
                      ? 'bg-blue-50 border-blue-200'
                      : 'hover:bg-gray-50'
                  }`}
                  onClick={() => toggleUserSelection(user.telegram_id)}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={selectedUsers.includes(user.telegram_id)}
                      onChange={() => toggleUserSelection(user.telegram_id)}
                      className="rounded"
                    />
                    <div>
                      <div className="font-medium">
                        {user.first_name} {user.last_name}
                        {user.username && (
                          <span className="text-gray-500 ml-2">@{user.username}</span>
                        )}
                      </div>
                      <div className="text-sm text-gray-500">
                        הצטרף לפני {getDaysAgo(user.created_at)} ימים • {user.diamond_count} יהלומים
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(user.user_status)}
                    {user.diamond_count === 0 && (
                      <Badge variant="outline" className="bg-red-50 text-red-700">
                        ללא יהלומים
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={sendPersonalizedMessages}
              disabled={isSending || selectedUsers.length === 0}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Send className="h-4 w-4 mr-2" />
              {isSending ? 'שולח...' : `שלח הודעות מותאמות (${selectedUsers.length})`}
            </Button>

            <Button
              variant="outline"
              onClick={() => setSelectedUsers(users.map(u => u.telegram_id))}
            >
              <Users className="h-4 w-4 mr-2" />
              בחר הכל
            </Button>

            <Button
              variant="outline"
              onClick={() => setSelectedUsers([])}
            >
              בטל בחירה
            </Button>
          </div>
        </CardContent>
      </Card>

      {selectedUsers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>תצוגה מקדימה של ההודעות</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-64 overflow-y-auto">
              {selectedUsers.slice(0, 3).map((telegramId) => {
                const user = users.find(u => u.telegram_id === telegramId);
                if (!user) return null;

                return (
                  <div key={telegramId} className="border-l-4 border-blue-200 pl-4 py-2">
                    <div className="font-medium text-sm text-gray-600 mb-2">
                      הודעה ל{user.first_name}:
                    </div>
                    <div className="text-sm bg-gray-50 p-3 rounded whitespace-pre-wrap">
                      {getMessageForUser(user).slice(0, 200)}...
                    </div>
                  </div>
                );
              })}
              {selectedUsers.length > 3 && (
                <div className="text-sm text-gray-500 text-center">
                  ועוד {selectedUsers.length - 3} הודעות נוספות...
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            סטטיסטיקות משתמשים
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{users.length}</div>
              <div className="text-sm text-gray-500">כלל המשתמשים</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {users.filter(u => u.diamond_count === 0).length}
              </div>
              <div className="text-sm text-gray-500">ללא יהלומים</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {users.filter(u => u.user_status === 'active').length}
              </div>
              <div className="text-sm text-gray-500">פעילים</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {users.filter(u => getDaysAgo(u.created_at) <= 7).length}
              </div>
              <div className="text-sm text-gray-500">חדשים (שבוע)</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
