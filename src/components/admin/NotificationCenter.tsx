
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Bell, MessageSquare, Users, Send, TrendingUp, User } from 'lucide-react';
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

interface UserData {
  id: string;
  telegram_id: number;
  first_name: string;
  last_name?: string;
  username?: string;
}

interface NotificationCenterProps {
  notifications: NotificationData[];
  users: UserData[];
  onRefresh: () => void;
}

export function NotificationCenter({ notifications, users, onRefresh }: NotificationCenterProps) {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [selectedType, setSelectedType] = useState<'info' | 'alert' | 'promotion' | 'system'>('info');
  const [selectedTarget, setSelectedTarget] = useState<'all' | 'premium' | 'specific'>('all');
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const sendNotification = async () => {
    if (!title.trim() || !message.trim()) {
      toast({
        title: "Validation Error",
        description: "Please fill in both title and message fields.",
        variant: "destructive",
      });
      return;
    }

    if (selectedTarget === 'specific' && !selectedUserId) {
      toast({
        title: "Validation Error",
        description: "Please select a specific user when targeting individuals.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      let targetUsers: UserData[] = [];

      if (selectedTarget === 'all') {
        targetUsers = users;
      } else if (selectedTarget === 'premium') {
        // Filter premium users (assuming is_premium field exists)
        targetUsers = users.filter((user: any) => user.is_premium);
      } else if (selectedTarget === 'specific') {
        const specificUser = users.find(user => user.telegram_id.toString() === selectedUserId);
        if (specificUser) {
          targetUsers = [specificUser];
        }
      }

      if (targetUsers.length === 0) {
        toast({
          title: "Error",
          description: "No target users found for the selected criteria.",
          variant: "destructive",
        });
        return;
      }

      // Insert notifications for target users
      const notificationInserts = targetUsers.map(user => ({
        telegram_id: user.telegram_id,
        message_type: selectedType,
        message_content: `${title}\n\n${message}`,
        status: 'sent',
        metadata: { 
          broadcast: selectedTarget !== 'specific', 
          sent_by: 'admin',
          title: title,
          target_type: selectedTarget
        }
      }));

      const { error: insertError } = await supabase
        .from('notifications')
        .insert(notificationInserts);

      if (insertError) throw insertError;
      
      toast({
        title: "Notification Sent",
        description: `Message "${title}" sent to ${targetUsers.length} user(s) as ${selectedType} notification`,
      });

      // Reset form
      setTitle('');
      setMessage('');
      setSelectedType('info');
      setSelectedTarget('all');
      setSelectedUserId('');
      
      onRefresh();
    } catch (error) {
      console.error('Error sending notification:', error);
      toast({
        title: "Error",
        description: "Failed to send notification. Please try again.",
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

  const getUserDisplayName = (user: UserData) => {
    if (user.first_name && user.first_name !== 'Telegram' && user.first_name !== 'Test') {
      return `${user.first_name} ${user.last_name || ''}`.trim();
    }
    if (user.username) {
      return `@${user.username}`;
    }
    return `User ${user.telegram_id}`;
  };

  return (
    <div className="space-y-6">
      {/* Send Notification Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="h-5 w-5" />
            Send Notification
          </CardTitle>
          <CardDescription>
            Send notifications to users through the MazalChat bot
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="title">Notification Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter notification title"
                maxLength={100}
              />
            </div>
            <div>
              <Label htmlFor="type">Notification Type</Label>
              <Select value={selectedType} onValueChange={(value: any) => setSelectedType(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="info">
                    <div className="flex items-center gap-2">
                      <Bell className="h-4 w-4 text-blue-500" />
                      Information
                    </div>
                  </SelectItem>
                  <SelectItem value="alert">
                    <div className="flex items-center gap-2">
                      <Bell className="h-4 w-4 text-red-500" />
                      Alert
                    </div>
                  </SelectItem>
                  <SelectItem value="promotion">
                    <div className="flex items-center gap-2">
                      <Bell className="h-4 w-4 text-green-500" />
                      Promotion
                    </div>
                  </SelectItem>
                  <SelectItem value="system">
                    <div className="flex items-center gap-2">
                      <Bell className="h-4 w-4 text-gray-500" />
                      System
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="message">Message Content</Label>
            <Textarea
              id="message"
              placeholder="Enter your notification message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              maxLength={500}
            />
            <p className="text-xs text-gray-500 mt-1">{message.length}/500 characters</p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="target">Send To</Label>
              <Select value={selectedTarget} onValueChange={(value: any) => setSelectedTarget(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select target" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      All Users ({users.length})
                    </div>
                  </SelectItem>
                  <SelectItem value="premium">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-yellow-500" />
                      Premium Users Only
                    </div>
                  </SelectItem>
                  <SelectItem value="specific">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-blue-500" />
                      Specific User
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {selectedTarget === 'specific' && (
              <div>
                <Label htmlFor="specificUser">Select User</Label>
                <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a user" />
                  </SelectTrigger>
                  <SelectContent className="max-h-48">
                    {users.map((user) => (
                      <SelectItem key={user.telegram_id} value={user.telegram_id.toString()}>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          <span>{getUserDisplayName(user)}</span>
                          <Badge variant="outline" className="text-xs">
                            ID: {user.telegram_id}
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <div className="flex justify-end pt-4">
            <Button 
              onClick={sendNotification} 
              disabled={isLoading || !title.trim() || !message.trim()}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Send className="h-4 w-4 mr-2" />
              {isLoading ? 'Sending...' : 'Send Notification'}
            </Button>
          </div>
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
            Recent notifications sent through the MazalChat bot
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
                    <div className="flex items-center gap-2 flex-wrap">
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
                    <div className="text-sm">
                      {notification.metadata?.title && (
                        <div className="font-semibold mb-1">{notification.metadata.title}</div>
                      )}
                      <p>{notification.message_content}</p>
                    </div>
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
