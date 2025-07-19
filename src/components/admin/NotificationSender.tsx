
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { Send, Users, MessageSquare, Bell, Upload, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface NotificationSenderProps {
  onSendNotification?: (notification: any) => void;
}

export function NotificationSender({ onSendNotification }: NotificationSenderProps) {
  const { toast } = useToast();
  
  const [notification, setNotification] = useState({
    title: '',
    message: '',
    type: 'info',
    target: 'all',
    specificUserId: ''
  });

  const [isLoading, setIsLoading] = useState(false);
  const [userStats, setUserStats] = useState({
    totalUsers: 0,
    premiumUsers: 0,
    activeUsers: 0
  });
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  // Fetch user statistics
  useEffect(() => {
    fetchUserStats();
  }, []);

  const fetchUserStats = async () => {
    try {
      const { data: totalData } = await supabase
        .from('user_profiles')
        .select('id', { count: 'exact' })
        .eq('status', 'active');

      const { data: premiumData } = await supabase
        .from('user_profiles')
        .select('id', { count: 'exact' })
        .eq('is_premium', true)
        .eq('status', 'active');

      const { data: activeData } = await supabase
        .from('user_profiles')
        .select('id', { count: 'exact' })
        .eq('status', 'active')
        .gte('last_login', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

      setUserStats({
        totalUsers: totalData?.length || 0,
        premiumUsers: premiumData?.length || 0,
        activeUsers: activeData?.length || 0
      });
    } catch (error) {
      console.error('Error fetching user stats:', error);
    }
  };

  const uploadReminderTemplates = {
    gentle: {
      title: "Ready to Upload Your Diamonds? 💎",
      message: `📋 **Quick Certificate Scan Available!**

✨ **Why upload now?**
• Get discovered by potential buyers
• Professional diamond showcase
• Secure certificate storage
• Real-time market exposure

Simply photograph your GIA certificate and our AI will extract all diamond details automatically!`
    },
    urgent: {
      title: "Don't Miss Out - Upload Your Inventory! 🚀",
      message: `⏰ **Your diamonds deserve to be seen!**

📈 **Market Activity is High:**
• Active buyers searching daily
• Premium listings getting more views
• Quick certificate processing available

Transform your certificate into a professional listing in seconds!`
    },
    personal: {
      title: "Complete Your Diamond Showcase",
      message: `👋 **We noticed you haven't uploaded your diamonds yet!**

🔍 **Getting started is simple:**
• Snap a photo of your certificate
• Our AI handles the rest
• Your diamonds go live immediately

Ready to connect with serious buyers?`
    }
  };

  const applyTemplate = (templateKey: string) => {
    const template = uploadReminderTemplates[templateKey];
    setNotification(prev => ({
      ...prev,
      title: template.title,
      message: template.message,
      type: 'upload_reminder'
    }));
  };

  const getRecipientCount = () => {
    switch (notification.target) {
      case 'all': return userStats.totalUsers;
      case 'premium': return userStats.premiumUsers;
      case 'specific': return 1;
      default: return 0;
    }
  };

  const handleSend = () => {
    if (!notification.title || !notification.message) {
      toast({
        title: "Validation Error",
        description: "Please fill in both title and message fields.",
        variant: "destructive",
      });
      return;
    }

    if (notification.target === 'specific' && !notification.specificUserId) {
      toast({
        title: "Validation Error", 
        description: "Please enter a Telegram ID for specific user targeting.",
        variant: "destructive",
      });
      return;
    }

    const recipientCount = getRecipientCount();
    if (recipientCount === 0) {
      toast({
        title: "No Recipients",
        description: "No users found matching your target criteria.",
        variant: "destructive",
      });
      return;
    }

    setShowConfirmDialog(true);
  };

  const confirmSend = async () => {
    setShowConfirmDialog(false);
    setIsLoading(true);

    try {
      console.log('📤 Sending notification via Supabase edge function');
      
      const { data, error } = await supabase.functions.invoke('send-admin-notification', {
        body: {
          title: notification.title,
          message: notification.message,
          type: notification.type,
          target: notification.target,
          specificUserId: notification.specificUserId || null
        }
      });

      if (error) {
        console.error('❌ Edge function error:', error);
        throw error;
      }

      console.log('✅ Notification sent successfully:', data);
      
      toast({
        title: "✅ Notifications Sent!",
        description: `Successfully sent to ${data.sent} users${data.failed > 0 ? ` (${data.failed} failed)` : ''}.`,
      });

      // Reset form
      setNotification({
        title: '',
        message: '',
        type: 'info',
        target: 'all',
        specificUserId: ''
      });

      // Refresh user stats
      fetchUserStats();

      onSendNotification?.({
        ...notification,
        timestamp: new Date().toISOString(),
        id: Math.random().toString(36).substr(2, 9),
        sent: data.sent,
        failed: data.failed
      });

    } catch (error) {
      console.error('❌ Error sending notification:', error);
      toast({
        title: "❌ Error",
        description: `Failed to send notification: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Send Notification
          </CardTitle>
          <CardDescription>
            Send notifications to users via Telegram Bot API ({userStats.totalUsers} total users)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Quick Templates */}
          <div className="space-y-2">
            <Label>Quick Templates</Label>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => applyTemplate('gentle')}
                className="flex items-center gap-1"
              >
                <Upload className="h-3 w-3" />
                Gentle Reminder
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => applyTemplate('urgent')}
                className="flex items-center gap-1"
              >
                <AlertCircle className="h-3 w-3" />
                Urgent
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => applyTemplate('personal')}
                className="flex items-center gap-1"
              >
                <Users className="h-3 w-3" />
                Personal
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Notification Title</Label>
            <Input
              id="title"
              value={notification.title}
              onChange={(e) => setNotification(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Enter notification title"
              maxLength={100}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              value={notification.message}
              onChange={(e) => setNotification(prev => ({ ...prev, message: e.target.value }))}
              placeholder="Enter your notification message"
              rows={6}
              maxLength={1000}
            />
            <p className="text-xs text-gray-500">{notification.message.length}/1000 characters</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Notification Type</Label>
              <Select value={notification.type} onValueChange={(value) => setNotification(prev => ({ ...prev, type: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="upload_reminder">
                    <div className="flex items-center gap-2">
                      <Upload className="h-4 w-4 text-blue-500" />
                      Upload Reminder
                    </div>
                  </SelectItem>
                  <SelectItem value="info">
                    <div className="flex items-center gap-2">
                      <Bell className="h-4 w-4 text-blue-500" />
                      Information
                    </div>
                  </SelectItem>
                  <SelectItem value="warning">
                    <div className="flex items-center gap-2">
                      <Bell className="h-4 w-4 text-yellow-500" />
                      Warning
                    </div>
                  </SelectItem>
                  <SelectItem value="success">
                    <div className="flex items-center gap-2">
                      <Bell className="h-4 w-4 text-green-500" />
                      Success
                    </div>
                  </SelectItem>
                  <SelectItem value="urgent">
                    <div className="flex items-center gap-2">
                      <Bell className="h-4 w-4 text-red-500" />
                      Urgent
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="target">Send To</Label>
              <Select value={notification.target} onValueChange={(value) => setNotification(prev => ({ ...prev, target: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select target" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      All Users ({userStats.totalUsers})
                    </div>
                  </SelectItem>
                  <SelectItem value="premium">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-yellow-500" />
                      Premium Users ({userStats.premiumUsers})
                    </div>
                  </SelectItem>
                  <SelectItem value="specific">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-blue-500" />
                      Specific User
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {notification.target === 'specific' && (
            <div className="space-y-2">
              <Label htmlFor="specificUserId">User Telegram ID</Label>
              <Input
                id="specificUserId"
                value={notification.specificUserId}
                onChange={(e) => setNotification(prev => ({ ...prev, specificUserId: e.target.value }))}
                placeholder="Enter Telegram user ID"
                type="number"
              />
            </div>
          )}

          <div className="flex justify-end pt-4">
            <Button 
              onClick={handleSend} 
              disabled={isLoading || !notification.title || !notification.message}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Send className="h-4 w-4 mr-2" />
              {isLoading ? 'Sending...' : `Send to ${getRecipientCount()} users`}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Confirm Send Notification</h3>
            <div className="space-y-3 mb-6">
              <p><strong>Title:</strong> {notification.title}</p>
              <p><strong>Recipients:</strong> {getRecipientCount()} users</p>
              <p><strong>Type:</strong> {notification.type}</p>
              <div className="p-3 bg-gray-50 rounded border">
                <p className="text-sm"><strong>Message Preview:</strong></p>
                <p className="text-sm mt-1">{notification.message.substring(0, 150)}...</p>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setShowConfirmDialog(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={confirmSend}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Send Now
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
