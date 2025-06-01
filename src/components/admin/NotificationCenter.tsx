
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Bell, MessageSquare, Users, Send } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface BotNotification {
  id: string;
  telegram_id: number;
  message: string;
  type: 'info' | 'alert' | 'promotion' | 'system';
  status: 'sent' | 'delivered' | 'read';
  created_at: string;
  metadata?: any;
}

export function NotificationCenter() {
  const [notifications, setNotifications] = useState<BotNotification[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [selectedType, setSelectedType] = useState<'info' | 'alert' | 'promotion' | 'system'>('info');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const fetchNotifications = async () => {
    try {
      // For now, use mock data since we don't have the notifications table set up yet
      const mockNotifications: BotNotification[] = [
        {
          id: '1',
          telegram_id: 123456789,
          message: 'Welcome to Diamond Muzzle! Your account has been set up.',
          type: 'info',
          status: 'read',
          created_at: new Date().toISOString(),
        },
        {
          id: '2',
          telegram_id: 987654321,
          message: 'New diamond matching your search criteria is available!',
          type: 'alert',
          status: 'delivered',
          created_at: new Date(Date.now() - 3600000).toISOString(),
        },
        {
          id: '3',
          telegram_id: 456789123,
          message: 'Special promotion: 20% off premium subscription!',
          type: 'promotion',
          status: 'sent',
          created_at: new Date(Date.now() - 7200000).toISOString(),
        }
      ];

      setNotifications(mockNotifications);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const sendBroadcastMessage = async () => {
    if (!newMessage.trim()) return;

    setIsLoading(true);
    try {
      // Simulate sending broadcast message
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Broadcast Sent",
        description: `Message sent to all users as ${selectedType} notification`,
      });

      setNewMessage('');
      fetchNotifications();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send broadcast message",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

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
      default: return 'outline';
    }
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
          <div className="space-y-4">
            {notifications.map((notification) => (
              <div key={notification.id} className="flex items-start justify-between p-4 border rounded-lg">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{notification.telegram_id}</Badge>
                    <Badge variant={getTypeColor(notification.type) as any}>
                      {notification.type}
                    </Badge>
                    <Badge variant={getStatusColor(notification.status) as any}>
                      {notification.status}
                    </Badge>
                  </div>
                  <p className="text-sm">{notification.message}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(notification.created_at).toLocaleString()}
                  </p>
                </div>
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Notifications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{notifications.length}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Read Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round((notifications.filter(n => n.status === 'read').length / notifications.length) * 100)}%
            </div>
            <p className="text-xs text-muted-foreground">Notifications read</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Set(notifications.map(n => n.telegram_id)).size}
            </div>
            <p className="text-xs text-muted-foreground">Unique recipients</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
