import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { WelcomeMessageSender } from '@/components/admin/WelcomeMessageSender';
import { InvestmentNotificationSender } from '@/components/admin/InvestmentNotificationSender';

const Admin = () => {
  const { toast } = useToast();
  const [announcementMessage, setAnnouncementMessage] = useState('');
  const [groupUrl, setGroupUrl] = useState('');
  const [buttonText, setButtonText] = useState('Join Group');
  const [testMode, setTestMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [userStats, setUserStats] = useState({ total: 0, activeToday: 0 });
  const [isFetchingUsers, setIsFetchingUsers] = useState(false);

  useEffect(() => {
    fetchUsers();
    fetchUserStats();
  }, []);

  const fetchUsers = async () => {
    setIsFetchingUsers(true);
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('telegram_id, first_name, last_name')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch users',
        variant: 'destructive',
      });
    } finally {
      setIsFetchingUsers(false);
    }
  };

  const fetchUserStats = async () => {
    try {
      const { data, error } = await supabase.from('user_profiles').select('*', { count: 'exact' });
      if (error) throw error;

      const totalUsers = data ? data.length : 0;

      // Fetch users active today (example, adjust as needed)
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const { data: activeToday, error: activeError } = await supabase
        .from('user_profiles')
        .select('*', { count: 'exact' })
        .gte('created_at', today.toISOString());

      if (activeError) throw activeError;
      const activeTodayCount = activeToday ? activeToday.length : 0;

      setUserStats({ total: totalUsers, activeToday: activeTodayCount });
    } catch (error) {
      console.error('Error fetching user stats:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch user statistics',
        variant: 'destructive',
      });
    }
  };

  const handleSendAnnouncement = async () => {
    setIsLoading(true);
    try {
      console.log('Sending announcement:', { message: announcementMessage, groupUrl, buttonText, testMode });

      const { data, error } = await supabase.functions.invoke('send-announcement', {
        body: {
          message: announcementMessage,
          groupUrl: groupUrl,
          buttonText: buttonText,
          users: users,
          testMode: testMode,
          timestamp: new Date().toISOString()
        }
      });

      if (error) throw error;

      toast({
        title: testMode ? 'Test Announcement Sent' : 'Announcement Sent',
        description: testMode
          ? 'Test message sent to admin for review'
          : `Announcement sent to ${users.length} users`,
      });
    } catch (error) {
      console.error('Error sending announcement:', error);
      toast({
        title: 'Error',
        description: 'Failed to send announcement',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 space-y-8">
      <AdminHeader />

      {/* User Statistics */}
      <section>
        <Card>
          <CardHeader>
            <CardTitle>User Statistics</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Badge variant="secondary">Total Users: {userStats.total}</Badge>
            <Badge variant="secondary">Active Today: {userStats.activeToday}</Badge>
          </CardContent>
        </Card>
      </section>

      {/* Announcement Sender */}
      <section>
        <Card>
          <CardHeader>
            <CardTitle>Send Announcement</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="announcement">Message</Label>
                <Textarea
                  id="announcement"
                  value={announcementMessage}
                  onChange={(e) => setAnnouncementMessage(e.target.value)}
                  placeholder="Enter announcement message"
                />
              </div>
              <div>
                <Label htmlFor="groupUrl">Group URL</Label>
                <Input
                  id="groupUrl"
                  type="url"
                  value={groupUrl}
                  onChange={(e) => setGroupUrl(e.target.value)}
                  placeholder="Enter Telegram group URL"
                />
                <Label htmlFor="buttonText">Button Text</Label>
                <Input
                  id="buttonText"
                  type="text"
                  value={buttonText}
                  onChange={(e) => setButtonText(e.target.value)}
                  placeholder="Enter button text"
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="testMode" checked={testMode} onCheckedChange={() => setTestMode(!testMode)} />
              <Label htmlFor="testMode">Test Mode (Send to Admin Only)</Label>
            </div>
            <Button onClick={handleSendAnnouncement} disabled={isLoading}>
              {isLoading ? 'Sending...' : 'Send Announcement'}
            </Button>
          </CardContent>
        </Card>
      </section>

      {/* Welcome Message Campaign Section */}
      <section>
        <WelcomeMessageSender />
      </section>

      {/* Investment Campaign Section */}
      <section>
        <InvestmentNotificationSender />
      </section>
    </div>
  );
};

const AdminHeader = () => (
  <div className="text-2xl font-bold">
    Admin Panel
  </div>
);

export default Admin;
