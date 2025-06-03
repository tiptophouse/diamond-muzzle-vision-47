
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Bell, MessageSquare, Users, Send, TrendingUp } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { formatDistanceToNow } from 'date-fns';

interface NotificationData {
  id: string;
  telegram_id: number;
  message_type: string;
  message_content: string;
  status: string;
  sent_at: string;
  delivered_at?: string;
  read_at?: string;
  metadata?: any;
  created_at: string;
  user_first_name?: string;
  user_last_name?: string;
}

interface NotificationCenterProps {
  notifications: NotificationData[];
  onRefresh: () => void;
}

export function NotificationCenter({ notifications, onRefresh }: NotificationCenterProps) {
  const [newMessage, setNewMessage] = useState('');
  const [selectedType, setSelectedType] = useState<'info' | 'alert' | 'promotion' | 'system'>('info');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const sendBroadcastMessage = async () => {
    if (!newMessage.trim()) return;

    setIsLoading(true);
    try {
      // Get all user telegram IDs
      const { data: users, error: usersError } = await supabase
        .from('user_profiles')
        .select('telegram_id');

      if (usersError) throw usersError;

      // Insert notifications for all users
      const notificationInserts = users.map(user => ({
        telegram_id: user.telegram_id,
        message_type: selectedType,
        message_content: newMessage,
        status: 'sent',
        metadata: { broadcast: true, sent_by: 'admin' }
      }));

      const { error: insertError } = await supabase
        .from('notifications')
        .insert(notificationInserts);

      if (insertError) throw insertError;
      
      toast({
        title: "Broadcast Sent",
        description: `Message sent to ${users.length} users as ${selectedType} notification`,
      });

      setNewMessage('');
      onRefresh();
    } catch (error) {
      console.error('Error sending broadcast:', error);
      toast({
        title: "Error",
        description: "Failed to send broadcast message",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'alert': return 'destructive';
      case 'promotion': return 'default';
      case 'system': return 'secondary';
      default: return 'outline';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'read': return 'default';
      case 'delivered': return 'secondary';
      case 'failed': return 'destructive';
      default: return 'outline';
    }
  };

  const notificationStats = {
    total: notifications.length,
    readRate: notifications.length > 0 ? 
      Math.round((notifications.filter(n => n.read_at).length / notifications.length) * 100) : 0,
    deliveryRate: notifications.length > 0 ? 
      Math.round((notifications.filter(n => n.delivered_at || n.status === 'delivered').length / notifications.length) * 100) : 0,
    uniqueRecipients: new Set(notifications.map(n => n.telegram_id)).size,
    byType: notifications.reduce((acc, n) => {
      acc[n.message_type] = (acc[n.message_type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  };

  return (
    <div className="space-y-6">
      {/* Broadcast Message */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="h-5 w-5" />
            Send Broadcast Message
          </CardTitle>
          <CardDescription>
            Send notifications to all users through the MazalChat bot
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium">Message Type</label>
              <select 
                value={selectedType} 
                onChange={(e) => setSelectedType(e.target.value as any)}
                className="w-full mt-1 p-2 border rounded-md"
              >
                <option value="info">Info</option>
                <option value="alert">Alert</option>
                <option value="promotion">Promotion</option>
                <option value="system">System</option>
              </select>
            </div>
          </div>
          
          <div>
            <label className="text-sm font-medium">Message</label>
            <Textarea
              placeholder="Enter your broadcast message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className="mt-1"
              rows={3}
            />
          </div>
          
          <Button 
            onClick={sendBroadcastMessage} 
            disabled={isLoading || !newMessage.trim()}
            className="w-full"
          >
            {isLoading ? 'Sending...' : 'Send Broadcast'}
          </Button>
        </CardContent>
      </Card>

      {/* Notification Statistics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Notifications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{notificationStats.total}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Read Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{notificationStats.readRate}%</div>
            <p className="text-xs text-muted-foreground">Notifications read</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Delivery Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{notificationStats.deliveryRate}%</div>
            <p className="text-xs text-muted-foreground">Successfully delivered</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Recipients</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{notificationStats.uniqueRecipients}</div>
            <p className="text-xs text-muted-foreground">Unique users</p>
          </CardContent>
        </Card>
      </div>

      {/* Notification History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notification History
          </CardTitle>
          <CardDescription>
            All notifications sent through the MazalChat bot
          </CardDescription>
        </CardHeader>
        <CardContent>
          {notifications.length === 0 ? (
            <div className="text-center py-8">
              <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No notifications sent yet</p>
            </div>
          ) : (
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {notifications.slice(0, 50).map((notification) => (
                <div key={notification.id} className="flex items-start justify-between p-4 border rounded-lg">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{notification.telegram_id}</Badge>
                      {notification.user_first_name && (
                        <span className="text-sm text-muted-foreground">
                          {notification.user_first_name} {notification.user_last_name}
                        </span>
                      )}
                      <Badge variant={getTypeColor(notification.message_type) as any}>
                        {notification.message_type}
                      </Badge>
                      <Badge variant={getStatusColor(notification.status) as any}>
                        {notification.status}
                      </Badge>
                    </div>
                    <p className="text-sm">{notification.message_content}</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>Sent: {formatDistanceToNow(new Date(notification.sent_at), { addSuffix: true })}</span>
                      {notification.delivered_at && (
                        <span>Delivered: {formatDistanceToNow(new Date(notification.delivered_at), { addSuffix: true })}</span>
                      )}
                      {notification.read_at && (
                        <span>Read: {formatDistanceToNow(new Date(notification.read_at), { addSuffix: true })}</span>
                      )}
                    </div>
                  </div>
                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
