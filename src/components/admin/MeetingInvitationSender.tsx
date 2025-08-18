
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Calendar, Users, Send, CheckCircle } from 'lucide-react';

interface MeetingInvitation {
  title: string;
  description: string;
  meeting_url: string;
  scheduled_date: string;
  telegram_ids: string;
}

export function MeetingInvitationSender() {
  const [invitation, setInvitation] = useState<MeetingInvitation>({
    title: '',
    description: '',
    meeting_url: '',
    scheduled_date: '',
    telegram_ids: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [sentCount, setSentCount] = useState(0);
  const { toast } = useToast();

  const handleSendInvitations = async () => {
    if (!invitation.title || !invitation.meeting_url || !invitation.telegram_ids) {
      toast({
        title: "Missing Information",
        description: "Please fill in title, meeting URL, and telegram IDs",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const telegramIds = invitation.telegram_ids.split(',').map(id => id.trim()).filter(id => id);
      
      console.log('📅 Sending meeting invitations to:', telegramIds.length, 'users');

      const { data, error } = await supabase.functions.invoke('send-telegram-message', {
        body: {
          invitation: invitation,
          telegram_ids: telegramIds
        }
      });

      if (error) {
        console.error('❌ Failed to send invitations:', error);
        toast({
          title: "Send Failed",
          description: error.message || "Failed to send meeting invitations",
          variant: "destructive"
        });
        return;
      }

      console.log('✅ Meeting invitations sent successfully:', data);
      setSentCount(telegramIds.length);
      
      toast({
        title: "Invitations Sent Successfully!",
        description: `Meeting invitations sent to ${telegramIds.length} users`,
      });

      // Reset form
      setInvitation({
        title: '',
        description: '',
        meeting_url: '',
        scheduled_date: '',
        telegram_ids: ''
      });

    } catch (error) {
      console.error('❌ Error sending invitations:', error);
      toast({
        title: "Error",
        description: "Failed to send meeting invitations",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Meeting Invitation Sender
        </CardTitle>
        <CardDescription>
          Send meeting invitations to users via Telegram
          {sentCount > 0 && (
            <div className="flex items-center gap-1 text-green-600 mt-2">
              <CheckCircle className="h-4 w-4" />
              Last sent to {sentCount} users
            </div>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="title">Meeting Title</Label>
            <Input
              id="title"
              value={invitation.title}
              onChange={(e) => setInvitation(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Weekly Team Meeting"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="meeting_url">Meeting URL</Label>
            <Input
              id="meeting_url"
              value={invitation.meeting_url}
              onChange={(e) => setInvitation(prev => ({ ...prev, meeting_url: e.target.value }))}
              placeholder="https://zoom.us/j/123456789"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="scheduled_date">Scheduled Date & Time</Label>
          <Input
            id="scheduled_date"
            type="datetime-local"
            value={invitation.scheduled_date}
            onChange={(e) => setInvitation(prev => ({ ...prev, scheduled_date: e.target.value }))}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description (Optional)</Label>
          <Textarea
            id="description"
            value={invitation.description}
            onChange={(e) => setInvitation(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Discuss project updates and next steps..."
            rows={3}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="telegram_ids" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Telegram IDs (comma-separated)
          </Label>
          <Textarea
            id="telegram_ids"
            value={invitation.telegram_ids}
            onChange={(e) => setInvitation(prev => ({ ...prev, telegram_ids: e.target.value }))}
            placeholder="2138564172, 1234567890, 9876543210"
            rows={3}
          />
          <p className="text-xs text-muted-foreground">
            Enter Telegram user IDs separated by commas
          </p>
        </div>

        <Button 
          onClick={handleSendInvitations}
          disabled={isLoading || !invitation.title || !invitation.meeting_url || !invitation.telegram_ids}
          className="w-full"
        >
          <Send className="h-4 w-4 mr-2" />
          {isLoading ? 'Sending Invitations...' : 'Send Meeting Invitations'}
        </Button>
      </CardContent>
    </Card>
  );
}
