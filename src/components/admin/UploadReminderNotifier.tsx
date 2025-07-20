import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Upload, Send, Users, ExternalLink } from 'lucide-react';

export function UploadReminderNotifier() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState<{ total: number; noInventory: number } | null>(null);

  const checkUsersWithoutInventory = async () => {
    try {
      setIsLoading(true);
      
      // Get all users and check who has no inventory
      const { data: users, error: usersError } = await supabase
        .from('user_profiles')
        .select('telegram_id, first_name');

      if (usersError) throw usersError;

      const { data: inventoryUsers, error: inventoryError } = await supabase
        .from('inventory')
        .select('user_id')
        .not('deleted_at', 'is', null);

      if (inventoryError) throw inventoryError;

      const usersWithInventory = new Set(inventoryUsers?.map(inv => inv.user_id) || []);
      const usersWithoutInventory = users?.filter(user => !usersWithInventory.has(user.telegram_id)) || [];

      setStats({
        total: users?.length || 0,
        noInventory: usersWithoutInventory.length
      });

      return usersWithoutInventory;
    } catch (error) {
      console.error('Error checking users:', error);
      toast({
        title: "Error",
        description: "Failed to check users. Please try again.",
        variant: "destructive",
      });
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const sendUploadReminder = async () => {
    try {
      setIsLoading(true);
      
      const usersWithoutInventory = await checkUsersWithoutInventory();
      
      if (usersWithoutInventory.length === 0) {
        toast({
          title: "No Users Found",
          description: "All users already have inventory uploaded!",
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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Upload Reminder Notifications
        </CardTitle>
        <CardDescription>
          Send Telegram notifications to users who haven't uploaded their inventory yet
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-muted/50 p-4 rounded-lg">
          <h4 className="font-medium mb-2">What this will do:</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Find all users who haven't uploaded any diamonds</li>
            <li>• Send them a personalized Telegram message</li>
            <li>• Include a deep link button that opens the upload page directly</li>
            <li>• Include you (admin) in the notification to see the message</li>
          </ul>
        </div>

        {stats && (
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-4 w-4 text-blue-600" />
              <span className="font-medium">User Statistics</span>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Total Users:</span>
                <span className="ml-2 font-medium">{stats.total}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Need Upload:</span>
                <span className="ml-2 font-medium text-orange-600">{stats.noInventory}</span>
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-2">
          <Button 
            onClick={checkUsersWithoutInventory}
            disabled={isLoading}
            variant="outline"
          >
            <Users className="h-4 w-4 mr-2" />
            {isLoading ? 'Checking...' : 'Check Users'}
          </Button>
          
          <Button 
            onClick={sendUploadReminder}
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Send className="h-4 w-4 mr-2" />
            {isLoading ? 'Sending...' : 'Send Upload Reminders'}
          </Button>
        </div>

        <div className="text-xs text-muted-foreground border-t pt-2">
          <p className="flex items-center gap-1">
            <ExternalLink className="h-3 w-3" />
            Deep link will direct users to: /upload-single-stone
          </p>
        </div>
      </CardContent>
    </Card>
  );
}