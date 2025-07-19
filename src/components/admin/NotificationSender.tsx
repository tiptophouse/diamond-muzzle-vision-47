
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { Send, Users, MessageSquare, Bell } from 'lucide-react';

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

  const handleSend = async () => {
    if (!notification.title || !notification.message) {
      toast({
        title: "Validation Error",
        description: "Please fill in both title and message fields.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // In a real implementation, this would call the Telegram Bot API
      const notificationData = {
        ...notification,
        timestamp: new Date().toISOString(),
        id: Math.random().toString(36).substr(2, 9)
      };

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      onSendNotification?.(notificationData);
      
      toast({
        title: "Notification Sent",
        description: `Successfully sent notification to ${notification.target === 'all' ? 'all users' : 'specific user'}.`,
      });

      // Reset form
      setNotification({
        title: '',
        message: '',
        type: 'info',
        target: 'all',
        specificUserId: ''
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send notification. Please try again.",
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
          <MessageSquare className="h-5 w-5" />
          Send Notification
        </CardTitle>
        <CardDescription>
          Send push notifications to users via Telegram Bot API
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
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
            rows={4}
            maxLength={500}
          />
          <p className="text-xs text-gray-500">{notification.message.length}/500 characters</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="type">Notification Type</Label>
            <Select value={notification.type} onValueChange={(value) => setNotification(prev => ({ ...prev, type: value }))}>
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
                    All Users
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
            {isLoading ? 'Sending...' : 'Send Notification'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
