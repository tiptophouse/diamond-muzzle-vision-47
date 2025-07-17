import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Send, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface UserWithDiamondCount {
  telegram_id: number;
  first_name?: string;
  last_name?: string;
  username?: string;
  diamond_count: number;
}

export function ZeroDiamondUsersNotifier() {
  const { toast } = useToast();
  const [zeroDiamondUsers, setZeroDiamondUsers] = useState<UserWithDiamondCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  // Generate Telegram mini-app deep link for tutorial
  const generateTutorialUrl = (telegramId: number) => {
    return `https://t.me/DiamondMazalVisionBot/diamond?startapp=tutorial_${telegramId}`;
  };

  const fetchZeroDiamondUsers = async () => {
    setLoading(true);
    try {
      // Get users with zero diamonds
      const { data, error } = await supabase
        .from('user_profiles')
        .select(`
          telegram_id,
          first_name,
          last_name,
          username
        `);

      if (error) throw error;

      // Check diamond count for each user
      const usersWithCounts = await Promise.all(
        data.map(async (user) => {
          const { count } = await supabase
            .from('inventory')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.telegram_id)
            .is('deleted_at', null);

          return {
            ...user,
            diamond_count: count || 0
          };
        })
      );

      // Filter users with zero diamonds
      const zeroDiamondUsers = usersWithCounts.filter(user => user.diamond_count === 0);
      setZeroDiamondUsers(zeroDiamondUsers);

    } catch (error) {
      console.error('Error fetching zero diamond users:', error);
      toast({
        title: 'שגיאה בטעינת נתונים',
        description: 'לא ניתן לטעון את רשימת המשתמשים',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const sendNotificationsToZeroDiamondUsers = async () => {
    setSending(true);
    try {
      const notifications = zeroDiamondUsers.map(user => {
        const tutorialUrl = generateTutorialUrl(user.telegram_id);
        const firstName = user.first_name || user.username || 'משתמש';
        
        const message = `🚀 שלום ${firstName}! 

💎 זמן לעלות את היהלום הראשון שלך!
ראינו שעדיין לא התחלת - בואו נעשה את זה יחד.

🎯 המדריך המהיר שלנו כולל:
📱 סריקת תעודות GIA אוטומטית 
⚡ העלאה מהירה תוך 3 דקות
📊 ניהול מלאי מתקדם
🏪 חנות וירטואלית מקצועית

👆 פתח את האפליקציה ותתחיל עם המדריך:
${tutorialUrl}

💡 טיפ: יש כפתור "התחל סריקת תעודה" שיקח אותך ישר לסריקה!

בהצלחה!
🔷 צוות Diamond Mazal`;

        return {
          telegram_id: user.telegram_id,
          message_type: 'zero_diamonds_tutorial',
          message_content: message,
          status: 'sent',
          metadata: {
            title: '🚀 זמן להתחיל! הדרכה מהירה למערכת היהלומים',
            tutorial_url: tutorialUrl,
            user_info: {
              first_name: user.first_name,
              last_name: user.last_name,
              username: user.username
            },
            diamond_count: user.diamond_count
          }
        };
      });

      const { error } = await supabase
        .from('notifications')
        .insert(notifications);

      if (error) throw error;

      toast({
        title: 'הודעות נשלחו בהצלחה!',
        description: `נשלחו ${zeroDiamondUsers.length} הודעות למשתמשים ללא יהלומים`,
      });

      // Refresh the list
      await fetchZeroDiamondUsers();

    } catch (error) {
      console.error('Error sending notifications:', error);
      toast({
        title: 'שגיאה בשליחת ההודעות',
        description: 'אנא נסה שוב',
        variant: 'destructive',
      });
    } finally {
      setSending(false);
    }
  };

  useEffect(() => {
    fetchZeroDiamondUsers();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-orange-500" />
          משתמשים ללא יהלומים ({zeroDiamondUsers.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            משתמשים שלא העלו אף יהלום למערכת - זמן לשלוח להם הדרכה!
          </p>
          <Button
            onClick={sendNotificationsToZeroDiamondUsers}
            disabled={sending || zeroDiamondUsers.length === 0}
            className="flex items-center gap-2"
          >
            <Send className="h-4 w-4" />
            {sending ? 'שולח...' : `שלח הדרכה ל-${zeroDiamondUsers.length} משתמשים`}
          </Button>
        </div>

        {zeroDiamondUsers.length === 0 ? (
          <div className="text-center py-8">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">כל המשתמשים כבר העלו יהלומים! 🎉</p>
          </div>
        ) : (
          <div className="max-h-60 overflow-y-auto space-y-2">
            {zeroDiamondUsers.slice(0, 20).map((user, index) => (
              <div key={user.telegram_id} className="flex items-center gap-2 p-2 bg-muted/30 rounded text-sm">
                <Badge variant="outline">{index + 1}</Badge>
                <span className="font-medium">
                  {user.first_name || user.username || `User ${user.telegram_id}`}
                </span>
                <span className="text-muted-foreground">({user.telegram_id})</span>
                <Badge variant="secondary" className="text-xs">
                  {user.diamond_count} יהלומים
                </Badge>
              </div>
            ))}
            {zeroDiamondUsers.length > 20 && (
              <div className="text-sm text-muted-foreground text-center">
                ...ועוד {zeroDiamondUsers.length - 20} משתמשים
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}