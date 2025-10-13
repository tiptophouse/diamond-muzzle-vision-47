import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { Send, Users, Crown, UserCheck } from 'lucide-react';

export function QuickMessageSender() {
  const { toast } = useToast();
  const [message, setMessage] = useState('');
  const [target, setTarget] = useState('all');
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async () => {
    if (!message.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter a message to send.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast({
        title: "Message Sent Successfully",
        description: `Broadcast message sent to ${
          target === 'all' ? 'all users' : 
          target === 'premium' ? 'premium users' : 
          'active users'
        }.`,
      });

      setMessage('');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
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
          Quick Message Sender
        </CardTitle>
        <CardDescription>
          Send broadcast messages to your users via Telegram
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="target">Send To</Label>
          <Select value={target} onValueChange={setTarget}>
            <SelectTrigger id="target">
              <SelectValue />
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
                  <Crown className="h-4 w-4 text-yellow-500" />
                  Premium Users Only
                </div>
              </SelectItem>
              <SelectItem value="active">
                <div className="flex items-center gap-2">
                  <UserCheck className="h-4 w-4 text-green-500" />
                  Active Users Only
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="message">Message</Label>
          <Textarea
            id="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Enter your broadcast message here..."
            rows={4}
            maxLength={1000}
          />
          <p className="text-xs text-muted-foreground">{message.length}/1000 characters</p>
        </div>

        <div className="flex justify-end">
          <Button 
            onClick={handleSend} 
            disabled={isLoading || !message.trim()}
            size="lg"
          >
            <Send className="h-4 w-4 mr-2" />
            {isLoading ? 'Sending...' : 'Send Message'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
