
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Send, Users, Clock, Eye, ExternalLink, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Textarea } from '@/components/ui/textarea';

interface UserWithoutDiamonds {
  telegram_id: number;
  first_name?: string;
  last_name?: string;
  username?: string;
  created_at: string;
}

interface MeetingInviteClick {
  id: string;
  telegram_id: number;
  clicked_at: string;
  calendly_url?: string;
  user_info?: {
    first_name?: string;
    username?: string;
  };
}

export function MeetingInvitationSender() {
  const { toast } = useToast();
  const [users, setUsers] = useState<UserWithoutDiamonds[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<Set<number>>(new Set());
  const [clickTracking, setClickTracking] = useState<MeetingInviteClick[]>([]);
  const [showClickTracking, setShowClickTracking] = useState(false);

  const defaultMessage = `שלום {firstName}! 👋

💎 ראיתי שהצטרפת ל-BrilliantBot אבל עדיין לא העלית יהלומים למערכת.

💬 רוצה להבין איך לעבוד חכם יותר עם היהלומים שלך?
📈 רוצה לייעל את הדרך שאתה סוחר בה?

אני אור, מייסד BrilliantBot – ובזמן הקרוב אני מקיים שיחות אישיות עם סוחרים שמעוניינים לקבל הסבר, ייעוץ או חיבור לפלטפורמה.

📅 לקביעת פגישה קצרה איתי:
👉 https://calendly.com/avtipoos?utm_source=brilliantbot&utm_medium=telegram&utm_campaign=meeting_invite

🔒 השיחה פרטית, ממוקדת, ומיועדת רק למי שבאמת רוצה להשתדרג.

בואו נדבר! 💼✨`;

  const [message, setMessage] = useState(defaultMessage);

  const predefinedTelegramIds = [
    407257458, 1094583058, 459335857, 1098392267, 7185658377, 166061347, 31938623, 851117787,
    219540839, 5638216124, 565348343, 191985686, 1547977121, 146786072, 7980263791, 290747817,
    816684685, 299303085, 125724542, 131112573, 1774808969, 7661396252, 247961355, 6328816442,
    259613412, 157850874, 459466461, 791559324, 6702124868, 362740339, 781492003, 203555051,
    1395318066, 37226932, 1050059218, 504152563, 321406246, 37822062, 205324965, 608907728,
    5228664590, 501928605, 5864205153, 351591647, 211414349, 37220053, 1016146739, 1397126724,
    221428001, 27197168, 414710632, 1586162788, 1128966406, 1115142554, 6301609905, 6499134069,
    204803871, 481547993, 1784060582, 25517331, 173056785, 599801379, 6060737011, 315642972,
    349492743, 583512006, 357027836, 599440471, 351937475, 430947198, 300551886, 538414092,
    7602268977, 5786789221, 188838452, 359846796, 5916784425, 5145559049, 725612578, 499196465,
    314532104, 476162733, 138350912, 530055516, 941142244, 139767109, 976803458, 655107366,
    376677644, 761840256, 36514706, 37680275, 773880190, 1131026884, 1491998978, 180264348,
    750731120, 2105870530, 5163648472, 609472329, 66858946, 161389691, 317301692, 1016203357,
    156440200, 868350884, 2084882603, 215605918, 174230606, 363600108, 819441864, 1021878792,
    291063886, 67414578, 5945056045, 223604456, 215251646, 7348943395, 1933311874, 812263552,
    843225749, 15178583, 158952076, 2138564172
  ].filter(id => id !== 0);

  const fetchUsersWithoutDiamonds = async () => {
    setLoading(true);
    try {
      const { data: allUsers, error: usersError } = await supabase
        .from('user_profiles')
        .select('telegram_id, first_name, last_name, username, created_at')
        .in('telegram_id', predefinedTelegramIds);

      if (usersError) throw usersError;

      const usersWithDiamondStatus = await Promise.all(
        (allUsers || []).map(async (user) => {
          const { count } = await supabase
            .from('inventory')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.telegram_id)
            .is('deleted_at', null);

          return {
            ...user,
            hasDiamonds: (count || 0) > 0
          };
        })
      );

      const usersWithoutDiamonds = usersWithDiamondStatus
        .filter(user => !user.hasDiamonds)
        .map(({ hasDiamonds, ...user }) => user);

      setUsers(usersWithoutDiamonds);
      setSelectedUsers(new Set(usersWithoutDiamonds.map(u => u.telegram_id)));

    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: 'שגיאה בטעינת נתונים',
        description: 'לא ניתן לטעון את רשימת המשתמשים',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchClickTracking = async () => {
    try {
      // For now, we'll use a mock array since the table doesn't exist yet
      // This will be replaced with actual Supabase query once the table is created
      const mockClicks: MeetingInviteClick[] = [];
      setClickTracking(mockClicks);
      
      console.log('📊 Click tracking data would be fetched here');
    } catch (error) {
      console.error('Error fetching click tracking:', error);
    }
  };

  const toggleUserSelection = (telegramId: number) => {
    const newSelected = new Set(selectedUsers);
    if (newSelected.has(telegramId)) {
      newSelected.delete(telegramId);
    } else {
      newSelected.add(telegramId);
    }
    setSelectedUsers(newSelected);
  };

  const sendMeetingInvitations = async () => {
    setSending(true);
    try {
      const selectedUsersList = users.filter(user => selectedUsers.has(user.telegram_id));
      
      const notifications = selectedUsersList.map(user => {
        const firstName = user.first_name || user.username || 'משתמש יקר';
        const personalizedMessage = message.replace('{firstName}', firstName);
        
        return {
          telegram_id: user.telegram_id,
          message_type: 'meeting_invitation',
          message_content: personalizedMessage,
          status: 'sent',
          metadata: {
            title: '📅 הזמנה לפגישה אישית - BrilliantBot',
            calendly_url: 'https://calendly.com/avtipoos?utm_source=brilliantbot&utm_medium=telegram&utm_campaign=meeting_invite',
            user_info: {
              first_name: user.first_name,
              last_name: user.last_name,
              username: user.username
            },
            diamond_count: 0,
            reason: 'no_diamonds_uploaded',
            tracking_enabled: true
          }
        };
      });

      const { error } = await supabase
        .from('notifications')
        .insert(notifications);

      if (error) throw error;

      toast({
        title: 'הזמנות נשלחו בהצלחה! 📅',
        description: `נשלחו ${selectedUsersList.length} הזמנות לפגישה אישית עם מעקב לחיצות`,
      });

      await fetchUsersWithoutDiamonds();
      await fetchClickTracking();

    } catch (error) {
      console.error('Error sending meeting invitations:', error);
      toast({
        title: 'שגיאה בשליחת ההזמנות',
        description: 'אנא נסה שוב',
        variant: 'destructive',
      });
    } finally {
      setSending(false);
    }
  };

  useEffect(() => {
    fetchUsersWithoutDiamonds();
    fetchClickTracking();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            טוען משתמשים...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-2">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6" dir="rtl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-right">
            <Calendar className="h-5 w-5 text-blue-500" />
            הזמנות לפגישות אישיות ({users.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-right block">הודעת הזמנה:</label>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={12}
              className="text-sm text-right"
              placeholder="כתוב את הודעת ההזמנה..."
              dir="rtl"
            />
            <p className="text-xs text-muted-foreground text-right">
              השתמש ב-{'{firstName}'} לשם אישי
            </p>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant="outline">{selectedUsers.size} נבחרו</Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedUsers(new Set(users.map(u => u.telegram_id)))}
              >
                בחר הכל
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedUsers(new Set())}
              >
                בטל בחירה
              </Button>
            </div>
            
            <Button
              onClick={sendMeetingInvitations}
              disabled={sending || selectedUsers.size === 0}
              className="flex items-center gap-2"
            >
              <Send className="h-4 w-4" />
              {sending ? 'שולח...' : `שלח הזמנות ל-${selectedUsers.size} משתמשים`}
            </Button>
          </div>

          {users.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">כל המשתמשים כבר העלו יהלומים! 🎉</p>
            </div>
          ) : (
            <div className="max-h-80 overflow-y-auto space-y-2">
              {users.map((user, index) => (
                <div 
                  key={user.telegram_id} 
                  className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                    selectedUsers.has(user.telegram_id) 
                      ? 'bg-blue-50 border-blue-200' 
                      : 'bg-muted/30 hover:bg-muted/50'
                  }`}
                  onClick={() => toggleUserSelection(user.telegram_id)}
                  dir="rtl"
                >
                  <input
                    type="checkbox"
                    checked={selectedUsers.has(user.telegram_id)}
                    onChange={() => toggleUserSelection(user.telegram_id)}
                    className="rounded"
                  />
                  <Badge variant="outline" className="text-xs">{index + 1}</Badge>
                  <div className="flex-1 text-right">
                    <span className="font-medium text-sm">
                      {user.first_name || user.username || `User ${user.telegram_id}`}
                    </span>
                    <div className="text-xs text-muted-foreground">
                      ID: {user.telegram_id}
                      <span className="mr-2 flex items-center gap-1 justify-end">
                        <Clock className="h-3 w-3" />
                        הצטרף: {new Date(user.created_at).toLocaleDateString('he-IL')}
                      </span>
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    0 יהלומים
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Click Tracking Section - Will be enhanced once proper table exists */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-right">
            <div className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-green-500" />
              מעקב לחיצות על הזמנות ({clickTracking.length})
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowClickTracking(!showClickTracking)}
            >
              {showClickTracking ? 'הסתר' : 'הצג'} מעקב
            </Button>
          </CardTitle>
        </CardHeader>
        {showClickTracking && (
          <CardContent>
            <div className="text-center py-8">
              <Eye className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">מעקב לחיצות יוטמע בקרוב</p>
              <p className="text-xs text-muted-foreground mt-2">
                כל לחיצה על קישור הקלנדלי תירשם כאן אוטומטית
              </p>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Scheduled Meetings Section - Placeholder for calendar integration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-right">
            <Calendar className="h-5 w-5 text-purple-500" />
            פגישות מתוכננות
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">אינטגרציה עם לוח שנה תתווסף בקרוב</p>
            <Button variant="outline" size="sm" className="mt-4">
              <Plus className="h-4 w-4 mr-2" />
              חבר לוח שנה
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
