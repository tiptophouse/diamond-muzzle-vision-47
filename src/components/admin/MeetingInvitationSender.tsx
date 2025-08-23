
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Send, Users, Clock, RefreshCw } from 'lucide-react';
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

export function MeetingInvitationSender() {
  const { toast } = useToast();
  const [users, setUsers] = useState<UserWithoutDiamonds[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<Set<number>>(new Set());

  const defaultMessage = `שלום {firstName}! 👋

💎 ראיתי שהצטרפת ל-BrilliantBot אבל עדיין לא העלית יהלומים למערכת.

💬 רוצה להבין איך לעבוד חכם יותר עם היהלומים שלך?
📈 רוצה לייעל את הדרך שאתה סוחר בה?

אני אור, מייסד BrilliantBot – ובזמן הקרוב אני מקיים שיחות אישיות עם סוחרים שמעוניינים לקבל הסבר, ייעוץ או חיבור לפלטפורמה.

📅 לקביעת פגישה קצרה איתי:
👉 https://calendly.com/avtipoos

🔒 השיחה פרטית, ממוקדת, ומיועדת רק למי שבאמת רוצה להשתדרג.

בואו נדבר! 💼✨`;

  const [message, setMessage] = useState(defaultMessage);

  const fetchUsersWithoutDiamonds = async () => {
    setLoading(true);
    try {
      console.log('📊 Fetching users without diamonds...');
      
      // First, get all user profiles
      const { data: allUsers, error: usersError } = await supabase
        .from('user_profiles')
        .select('telegram_id, first_name, last_name, username, created_at')
        .not('telegram_id', 'eq', 0)
        .order('created_at', { ascending: false });

      if (usersError) {
        console.error('Error fetching users:', usersError);
        throw usersError;
      }

      console.log(`📝 Found ${allUsers?.length || 0} total users`);

      if (!allUsers || allUsers.length === 0) {
        setUsers([]);
        setSelectedUsers(new Set());
        return;
      }

      // For each user, check if they have diamonds
      const usersWithDiamondStatus = await Promise.all(
        allUsers.map(async (user) => {
          try {
            const { count, error: countError } = await supabase
              .from('inventory')
              .select('*', { count: 'exact', head: true })
              .eq('user_id', user.telegram_id)
              .is('deleted_at', null);

            if (countError) {
              console.error(`Error checking diamonds for user ${user.telegram_id}:`, countError);
              return { ...user, hasDiamonds: false };
            }

            return {
              ...user,
              hasDiamonds: (count || 0) > 0
            };
          } catch (error) {
            console.error(`Error processing user ${user.telegram_id}:`, error);
            return { ...user, hasDiamonds: false };
          }
        })
      );

      // Filter users without diamonds
      const usersWithoutDiamonds = usersWithDiamondStatus
        .filter(user => !user.hasDiamonds)
        .map(({ hasDiamonds, ...user }) => user);

      console.log(`💎 Found ${usersWithoutDiamonds.length} users without diamonds`);
      
      setUsers(usersWithoutDiamonds);
      
      // Auto-select all users
      setSelectedUsers(new Set(usersWithoutDiamonds.map(u => u.telegram_id)));

    } catch (error) {
      console.error('❌ Error fetching users:', error);
      toast({
        title: 'שגיאה בטעינת נתונים',
        description: 'לא ניתן לטעון את רשימת המשתמשים. אנא נסה שוב.',
        variant: 'destructive',
      });
      setUsers([]);
      setSelectedUsers(new Set());
    } finally {
      setLoading(false);
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
    if (selectedUsers.size === 0) {
      toast({
        title: 'אין משתמשים נבחרים',
        description: 'אנא בחר לפחות משתמש אחד לשליחת הזמנה',
        variant: 'destructive',
      });
      return;
    }

    setSending(true);
    let successCount = 0;
    let errorCount = 0;

    try {
      const selectedUsersList = users.filter(user => selectedUsers.has(user.telegram_id));
      console.log(`📧 Sending invitations to ${selectedUsersList.length} users`);
      
      for (const user of selectedUsersList) {
        try {
          const firstName = user.first_name || user.username || 'משתמש יקר';
          const personalizedMessage = message.replace('{firstName}', firstName);
          
          const notificationData = {
            telegram_id: user.telegram_id,
            message_type: 'meeting_invitation',
            message_content: personalizedMessage,
            status: 'sent',
            metadata: {
              title: '📅 הזמנה לפגישה אישית - BrilliantBot',
              calendly_url: 'https://calendly.com/avtipoos',
              user_info: {
                first_name: user.first_name,
                last_name: user.last_name,
                username: user.username
              },
              diamond_count: 0,
              reason: 'no_diamonds_uploaded'
            }
          };

          const { error: insertError } = await supabase
            .from('notifications')
            .insert([notificationData]);

          if (insertError) {
            console.error(`❌ Error sending invitation to ${user.telegram_id}:`, insertError);
            errorCount++;
          } else {
            console.log(`✅ Successfully sent invitation to ${user.telegram_id}`);
            successCount++;
          }
        } catch (userError) {
          console.error(`❌ Error processing user ${user.telegram_id}:`, userError);
          errorCount++;
        }
      }

      if (successCount > 0) {
        toast({
          title: `הזמנות נשלחו בהצלחה! 📅`,
          description: `נשלחו ${successCount} הזמנות לפגישה אישית${errorCount > 0 ? `, ${errorCount} נכשלו` : ''}`,
        });
      }

      if (errorCount > 0 && successCount === 0) {
        toast({
          title: 'שגיאה בשליחת ההזמנות',
          description: `כל ${errorCount} ההזמנות נכשלו. אנא נסה שוב.`,
          variant: 'destructive',
        });
      }

      // Refresh the list after sending
      await fetchUsersWithoutDiamonds();

    } catch (error) {
      console.error('❌ Error in sending process:', error);
      toast({
        title: 'שגיאה בשליחת ההזמנות',
        description: 'אירעה שגיאה במהלך שליחת ההזמנות. אנא נסה שוב.',
        variant: 'destructive',
      });
    } finally {
      setSending(false);
    }
  };

  useEffect(() => {
    fetchUsersWithoutDiamonds();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5 animate-spin" />
            טוען משתמשים...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-2">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
            <div className="h-4 bg-muted rounded w-2/3"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-500" />
            הזמנות לפגישות אישיות ({users.length})
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchUsersWithoutDiamonds}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            רענן
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">הודעת הזמנה:</label>
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={12}
            className="text-sm"
            placeholder="כתוב את הודעת ההזמנה..."
          />
          <p className="text-xs text-muted-foreground">
            השתמש ב-{'{firstName}'} לשם אישי
          </p>
        </div>

        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Badge variant="outline">{selectedUsers.size} נבחרו</Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedUsers(new Set(users.map(u => u.telegram_id)))}
              disabled={users.length === 0}
            >
              בחר הכל
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedUsers(new Set())}
              disabled={selectedUsers.size === 0}
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
            <p className="text-muted-foreground">
              {loading ? 'טוען...' : 'כל המשתמשים כבר העלו יהלומים! 🎉'}
            </p>
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
              >
                <input
                  type="checkbox"
                  checked={selectedUsers.has(user.telegram_id)}
                  onChange={() => toggleUserSelection(user.telegram_id)}
                  className="rounded"
                />
                <Badge variant="outline" className="text-xs">{index + 1}</Badge>
                <div className="flex-1">
                  <span className="font-medium text-sm">
                    {user.first_name || user.username || `User ${user.telegram_id}`}
                  </span>
                  <div className="text-xs text-muted-foreground">
                    ID: {user.telegram_id}
                    <span className="ml-2 flex items-center gap-1">
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
  );
}
