
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Users, Send, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useWelcomeMessage } from '@/hooks/useWelcomeMessage';
import { supabase } from '@/integrations/supabase/client';

interface User {
  telegram_id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  created_at: string;
}

export function WelcomeMessageSender() {
  const { toast } = useToast();
  const { sendBulkWelcomeMessages } = useWelcomeMessage();
  const [isLoading, setIsLoading] = useState(false);
  const [recentUsers, setRecentUsers] = useState<User[]>([]);
  const [isFetchingUsers, setIsFetchingUsers] = useState(false);

  const fetchRecentUsers = async () => {
    setIsFetchingUsers(true);
    try {
      // Get users who joined in the last 24 hours
      const twentyFourHoursAgo = new Date();
      twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

      const { data, error } = await supabase
        .from('user_profiles')
        .select('telegram_id, first_name, last_name, username, language_code, created_at')
        .gte('created_at', twentyFourHoursAgo.toISOString())
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      setRecentUsers(data || []);
      
      toast({
        title: 'Recent Users Loaded',
        description: `Found ${data?.length || 0} users who joined in the last 24 hours`,
      });
    } catch (error) {
      console.error('Error fetching recent users:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch recent users',
        variant: 'destructive',
      });
    } finally {
      setIsFetchingUsers(false);
    }
  };

  const handleSendWelcomeMessages = async () => {
    if (recentUsers.length === 0) {
      toast({
        title: 'No Users Found',
        description: 'Please fetch recent users first',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      await sendBulkWelcomeMessages(recentUsers);
    } catch (error) {
      console.error('Error sending welcome messages:', error);
      toast({
        title: 'Error',
        description: 'Failed to send welcome messages',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Welcome Message Campaign
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">
                Send comprehensive welcome messages to new users explaining all platform features
              </p>
              <div className="mt-2">
                <Badge variant="outline" className="mr-2">
                  <Users className="h-3 w-3 mr-1" />
                  {recentUsers.length} recent users
                </Badge>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button
                onClick={fetchRecentUsers}
                disabled={isFetchingUsers}
                variant="outline"
              >
                {isFetchingUsers ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Users className="h-4 w-4 mr-2" />
                )}
                Fetch Recent Users
              </Button>
              
              <Button
                onClick={handleSendWelcomeMessages}
                disabled={isLoading || recentUsers.length === 0}
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Send className="h-4 w-4 mr-2" />
                )}
                Send Welcome Messages
              </Button>
            </div>
          </div>

          {/* Welcome message preview */}
          <div className="bg-muted p-4 rounded-lg">
            <h4 className="font-semibold mb-2">Message Preview (Hebrew):</h4>
            <div className="text-sm space-y-2">
              <p><strong>🎉 ברוכים הבאים ל-Diamond Muzzle, [שם המשתמש]!</strong></p>
              <p>💎 הצטרפת לפלטפורמת המסחר ביהלומים המתקדמת ביותר!</p>
              <p><strong>🔍 ניטור קבוצות חכם</strong> - אנחנו מאזינים לקבוצות יהלומים 24/7</p>
              <p><strong>📊 ניהול מלאי חכם</strong> - העלה את היהלומים שלך בקלות</p>
              <p><strong>🚀 התאמה אוטומטית</strong> - קבל התראות כשיש ביקוש לאבנים שלך</p>
              <p className="text-muted-foreground">+ תכונות נוספות ולחצנים אינטראקטיביים</p>
            </div>
          </div>

          {recentUsers.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-semibold">Recent Users ({recentUsers.length}):</h4>
              <div className="max-h-40 overflow-y-auto space-y-1">
                {recentUsers.slice(0, 10).map((user) => (
                  <div key={user.telegram_id} className="flex items-center gap-2 text-sm bg-background p-2 rounded">
                    <Badge variant="outline">{user.telegram_id}</Badge>
                    <span>{user.first_name} {user.last_name}</span>
                    {user.username && <span className="text-muted-foreground">@{user.username}</span>}
                    <Badge variant="secondary" className="ml-auto">
                      {new Date(user.created_at).toLocaleDateString()}
                    </Badge>
                  </div>
                ))}
                {recentUsers.length > 10 && (
                  <p className="text-sm text-muted-foreground">
                    ...and {recentUsers.length - 10} more users
                  </p>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
