
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
      console.error('Error sending comprehensive welcome messages:', error);
      toast({
        title: 'Error',
        description: 'Failed to send comprehensive welcome messages',
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
            Comprehensive Diamond Muzzle Welcome Campaign
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">
                Send the comprehensive Hebrew welcome message explaining all Diamond Muzzle features and benefits
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
                Send Comprehensive Messages
              </Button>
            </div>
          </div>

          {/* Comprehensive message preview */}
          <div className="bg-muted p-4 rounded-lg">
            <h4 className="font-semibold mb-2">Comprehensive Message Preview:</h4>
            <div className="text-sm space-y-2 max-h-60 overflow-y-auto">
              <p><strong>🎉 ברוכים הבאים ל-Diamond Muzzle, [שם המשתמש]!</strong></p>
              <p><strong>💎 הצטרפת לפלטפורמת המסחר ביהלומים המתקדמת בעולם!</strong></p>
              
              <div className="space-y-1 text-xs">
                <p><strong>🔍 ניטור קבוצות חכם 24/7</strong></p>
                <p>• אנחנו מאזינים לכל קבוצות היהלומים בזמן אמת</p>
                <p>• קבל התראות מיידיות כשמישהו מחפש בדיוק את האבנים שלך</p>
                
                <p><strong>📊 ניהול מלאי מתקדם</strong></p>
                <p>• העלאת יהלומים קלה ומהירה מתעודות GIA</p>
                <p>• חזית חנות מקצועית לאוסף שלך</p>
                
                <p><strong>🤖 בינה מלאכותית מתקדמת</strong></p>
                <p>• צ'אט חכם עם המלאי שלך - שאל שאלות וקבל תשובות מיידיות</p>
                <p>• התאמות אוטומטיות בין ביקוש להיצע</p>
                
                <p><strong>💰 כלי צמיחה עסקית</strong></p>
                <p>• שיתוף מקצועי של יהלומים ברשתות החברתיות</p>
                <p>• ניהול לידים ולקוחות פוטנציאליים</p>
                
                <p><strong>🌐 קהילה גלובלית</strong></p>
                <p>• חיבור לקונים ברחבי העולם</p>
                <p>• פלטפורמה רב-לשונית</p>
                
                <p><strong>⭐ התחל עכשיו ב-3 צעדים פשוטים:</strong></p>
                <p>1️⃣ העלה את היהלומים הראשונים מתעודה</p>
                <p>2️⃣ הגדר את החנות המקצועית שלך</p>
                <p>3️⃣ התחל לקבל לידים והתאמות אוטומטיות</p>
                
                <p><strong>🚀 מוכן לשנות את עסק היהלומים שלך לנצח?</strong></p>
              </div>
              
              <div className="mt-3 pt-3 border-t">
                <p className="text-xs text-muted-foreground">
                  <strong>4 Interactive Buttons:</strong> העלאה מתעודה | צ'אט עם AI | דשבורד | חנות
                </p>
              </div>
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
