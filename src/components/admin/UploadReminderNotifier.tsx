
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Upload, Send, Users, ExternalLink } from 'lucide-react';
import { useUserDiamondCounts } from '@/hooks/admin/useUserDiamondCounts';

export function UploadReminderNotifier() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const { userCounts, stats, loading: diamondCountsLoading } = useUserDiamondCounts();

  // Get users with zero diamonds from our accurate FastAPI data
  const usersWithoutInventory = userCounts.filter(user => user.diamond_count === 0);

  const sendUploadReminder = async () => {
    try {
      setIsLoading(true);
      
      if (usersWithoutInventory.length === 0) {
        toast({
          title: "No Users Found",
          description: "All users already have diamonds uploaded!",
        });
        return;
      }

      // Call edge function to send notifications
      const { data, error } = await supabase.functions.invoke('send-upload-reminder', {
        body: {
          users: usersWithoutInventory,
          includeAdmin: true
        }
      });

      if (error) throw error;

      toast({
        title: "Notifications Sent!",
        description: `Successfully sent upload reminders to ${usersWithoutInventory.length} users (including admin).`,
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
            <span>Loading accurate diamond counts...</span>
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
          Upload Reminder Notifications
        </CardTitle>
        <CardDescription>
          Send Telegram notifications to users who haven't uploaded their inventory yet (based on real FastAPI diamond counts)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-muted/50 p-4 rounded-lg">
          <h4 className="font-medium mb-2">What this will do:</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Find all users who haven't uploaded any diamonds (verified via FastAPI)</li>
            <li>• Send them a personalized Telegram message</li>
            <li>• Include a deep link button that opens the upload page directly</li>
            <li>• Include you (admin) in the notification to see the message</li>
          </ul>
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Users className="h-4 w-4 text-blue-600" />
            <span className="font-medium">Accurate User Statistics (from FastAPI)</span>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Total Users:</span>
              <span className="ml-2 font-medium">{stats.totalUsers}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Need Upload:</span>
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

        {usersWithoutInventory.length > 0 && (
          <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg">
            <h4 className="font-medium mb-2 text-orange-800 dark:text-orange-200">
              Users who will receive notifications:
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

        <div className="flex gap-2">
          <Button 
            onClick={sendUploadReminder}
            disabled={isLoading || usersWithoutInventory.length === 0}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Send className="h-4 w-4 mr-2" />
            {isLoading ? 'Sending...' : `Send Upload Reminders (${usersWithoutInventory.length} users)`}
          </Button>
        </div>

        <div className="text-xs text-muted-foreground border-t pt-2">
          <p className="flex items-center gap-1">
            <ExternalLink className="h-3 w-3" />
            Deep link will direct users to: /upload-single-stone
          </p>
          <p className="mt-1 text-green-600">
            ✓ Now using accurate FastAPI diamond counts instead of Supabase inventory
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
