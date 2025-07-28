
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Upload, Send, Users, ExternalLink, RefreshCw } from 'lucide-react';
import { useUserDiamondCounts } from '@/hooks/admin/useUserDiamondCounts';

export function UploadReminderNotifier() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const { userCounts, stats, loading: diamondCountsLoading, forceRefresh } = useUserDiamondCounts();

  // Get users with EXACTLY zero diamonds from our accurate FastAPI data
  const usersWithoutInventory = userCounts.filter(user => user.diamond_count === 0);

  console.log('📊 UploadReminderNotifier: Total users:', userCounts.length);
  console.log('📊 UploadReminderNotifier: Users with 0 diamonds:', usersWithoutInventory.length);
  console.log('📊 UploadReminderNotifier: Sample users with diamonds:', 
    userCounts.filter(u => u.diamond_count > 0).slice(0, 3).map(u => ({
      name: u.first_name,
      count: u.diamond_count
    }))
  );

  const sendEnhancedWelcomeMessage = async () => {
    try {
      setIsLoading(true);
      
      if (usersWithoutInventory.length === 0) {
        toast({
          title: "No Users Found",
          description: "All users already have diamonds uploaded!",
        });
        return;
      }

      // Call edge function to send enhanced welcome messages
      const { data, error } = await supabase.functions.invoke('send-upload-reminder', {
        body: {
          users: usersWithoutInventory,
          includeAdmin: true
        }
      });

      if (error) throw error;

      toast({
        title: "Enhanced Welcome Messages Sent!",
        description: `Successfully sent comprehensive welcome messages with 8-button navigation to ${usersWithoutInventory.length} users (including admin preview).`,
      });

    } catch (error) {
      console.error('Error sending notifications:', error);
      toast({
        title: "Error",
        description: "Failed to send notifications. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (diamondCountsLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center space-x-2">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span>Loading accurate diamond counts from FastAPI...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Enhanced Welcome Message Campaign
        </CardTitle>
        <CardDescription>
          Send comprehensive welcome messages with full feature overview and 8-button navigation to users who haven't uploaded inventory yet
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
          <h4 className="font-medium mb-2">Enhanced Message Features:</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Comprehensive platform overview with detailed feature explanations</li>
            <li>• 8-button inline keyboard: Upload, Store, AI Chat, Analytics, Inventory, Dashboard, Notifications, Settings</li>
            <li>• Follow-up tutorial message with interactive guide</li>
            <li>• Multi-language support (Hebrew/English based on user preference)</li>
            <li>• Professional business-focused messaging for diamond traders</li>
          </ul>
        </div>

        <div className="bg-muted/50 p-4 rounded-lg">
          <h4 className="font-medium mb-2">What this will do:</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Find all users who haven't uploaded any diamonds (verified via FastAPI)</li>
            <li>• Send them the enhanced welcome message with comprehensive feature overview</li>
            <li>• Include comprehensive 8-button navigation keyboard</li>
            <li>• Send follow-up tutorial message after 3 seconds</li>
            <li>• Include you (admin) in the notification to see the message</li>
          </ul>
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Users className="h-4 w-4 text-blue-600" />
            <span className="font-medium">Accurate User Statistics (from FastAPI)</span>
            <Button
              onClick={forceRefresh}
              variant="ghost"
              size="sm"
              className="ml-auto"
            >
              <RefreshCw className="h-3 w-3" />
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Total Users:</span>
              <span className="ml-2 font-medium">{stats.totalUsers}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Need Welcome:</span>
              <span className="ml-2 font-medium text-orange-600">{stats.usersWithZeroDiamonds}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Have Diamonds:</span>
              <span className="ml-2 font-medium text-green-600">{stats.usersWithDiamonds}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Total Diamonds:</span>
              <span className="ml-2 font-medium text-purple-600">{stats.totalDiamonds}</span>
            </div>
          </div>
        </div>

        {stats.usersWithZeroDiamonds === 0 ? (
          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
            <h4 className="font-medium mb-2 text-green-800 dark:text-green-200">
              🎉 Great news! All users have uploaded diamonds!
            </h4>
            <p className="text-sm text-green-700 dark:text-green-300">
              Every user in your system has at least one diamond uploaded. No enhanced welcome messages needed.
            </p>
          </div>
        ) : (
          <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg">
            <h4 className="font-medium mb-2 text-orange-800 dark:text-orange-200">
              Users who will receive enhanced welcome messages ({usersWithoutInventory.length}):
            </h4>
            <div className="text-sm space-y-1 max-h-32 overflow-y-auto">
              {usersWithoutInventory.slice(0, 10).map((user) => (
                <div key={user.telegram_id} className="text-orange-700 dark:text-orange-300">
                  • {user.first_name} {user.last_name} (@{user.username || 'no username'}) - {user.diamond_count} diamonds
                </div>
              ))}
              {usersWithoutInventory.length > 10 && (
                <div className="text-orange-600 dark:text-orange-400 italic">
                  ...and {usersWithoutInventory.length - 10} more users
                </div>
              )}
            </div>
          </div>
        )}

        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
          <h4 className="font-medium mb-2 text-green-800 dark:text-green-200">Message Preview (Hebrew):</h4>
          <div className="text-sm space-y-1 text-green-700 dark:text-green-300">
            <p><strong>🎉 ברוכים הבאים ל-Diamond Muzzle, [שם המשתמש]!</strong></p>
            <p>💎 הצטרפת לפלטפורמת המסחר ביהלומים המתקדמת בעולם!</p>
            <p><strong>🔍 ניטור קבוצות חכם 24/7</strong> - התראות מיידיות על אבנים שלך</p>
            <p><strong>📊 ניהול מלאי מתקדם</strong> - העלאה קלה מתעודות GIA</p>
            <p><strong>🤖 בינה מלאכותית</strong> - צ'אט חכם עם המלאי</p>
            <p className="text-muted-foreground">+ 8 לחצנים אינטראקטיביים ומדריך עוקב</p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button 
            onClick={sendEnhancedWelcomeMessage}
            disabled={isLoading || usersWithoutInventory.length === 0}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Send className="h-4 w-4 mr-2" />
            {isLoading ? 'Sending Enhanced Welcome...' : `Send Enhanced Welcome Messages (${usersWithoutInventory.length} users)`}
          </Button>
        </div>

        <div className="text-xs text-muted-foreground border-t pt-2">
          <p className="flex items-center gap-1">
            <ExternalLink className="h-3 w-3" />
            Primary button will direct users to: /upload-single-stone
          </p>
          <p className="mt-1 text-green-600">
            ✓ Now sending enhanced welcome message with comprehensive 8-button navigation and tutorial follow-up
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
