
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Send, Bell } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface SimpleNotificationCenterProps {
  users: any[];
}

export function SimpleNotificationCenter({ users }: SimpleNotificationCenterProps) {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [selectedType, setSelectedType] = useState<'info' | 'alert' | 'promotion'>('info');
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

    setIsLoading(true);
    try {
      let targetUsers: any[] = [];

      if (selectedTarget === 'all') {
        targetUsers = users;
      } else if (selectedTarget === 'premium') {
        targetUsers = users.filter(user => user.is_premium);
      } else if (selectedTarget === 'specific') {
        const specificUser = users.find(user => user.telegram_id.toString() === selectedUserId);
        if (specificUser) {
          targetUsers = [specificUser];
        }
      }

      if (targetUsers.length === 0) {
        toast({
          title: "Error",
          description: "No target users found.",
          variant: "destructive",
        });
        return;
      }

      const notificationInserts = targetUsers.map(user => ({
        telegram_id: user.telegram_id,
        message_type: selectedType,
        message_content: `${title}\n\n${message}`,
        status: 'sent',
        metadata: { 
          title: title,
          target_type: selectedTarget,
          sent_by: 'admin'
        }
      }));

      const { error } = await supabase
        .from('notifications')
        .insert(notificationInserts);

      if (error) throw error;
      
      toast({
        title: "Notification Sent",
        description: `Message sent to ${targetUsers.length} user(s)`,
      });

      setTitle('');
      setMessage('');
      setSelectedType('info');
      setSelectedTarget('all');
      setSelectedUserId('');
    } catch (error) {
      console.error('Error sending notification:', error);
      toast({
        title: "Error",
        description: "Failed to send notification",
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
          <Send className="h-5 w-5" />
          Send Notification
        </CardTitle>
        <CardDescription>
          Send notifications to users through the MazalChat bot
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Notification title"
            maxLength={100}
          />
        </div>

        <div>
          <Label htmlFor="message">Message</Label>
          <Textarea
            id="message"
            placeholder="Your message here..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={4}
            maxLength={500}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <Label>Type</Label>
            <Select value={selectedType} onValueChange={(value: any) => setSelectedType(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="info">Information</SelectItem>
                <SelectItem value="alert">Alert</SelectItem>
                <SelectItem value="promotion">Promotion</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Send To</Label>
            <Select value={selectedTarget} onValueChange={(value: any) => setSelectedTarget(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Users ({users.length})</SelectItem>
                <SelectItem value="premium">Premium Users</SelectItem>
                <SelectItem value="specific">Specific User</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {selectedTarget === 'specific' && (
            <div>
              <Label>User</Label>
              <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose user" />
                </SelectTrigger>
                <SelectContent className="max-h-48">
                  {users.map((user) => (
                    <SelectItem key={user.telegram_id} value={user.telegram_id.toString()}>
                      {user.first_name} {user.last_name} (ID: {user.telegram_id})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        <Button 
          onClick={sendNotification} 
          disabled={isLoading || !title.trim() || !message.trim()}
          className="w-full"
        >
          <Send className="h-4 w-4 mr-2" />
          {isLoading ? 'Sending...' : 'Send Notification'}
        </Button>
      </CardContent>
    </Card>
  );
}
