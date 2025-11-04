import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Zap, Send, Brain } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface CampaignCreatorProps {
  segments: any;
}

export function CampaignCreator({ segments }: CampaignCreatorProps) {
  const [message, setMessage] = useState('');
  const [segment, setSegment] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const { toast } = useToast();

  const generateAIMessage = async () => {
    setIsGenerating(true);
    try {
      // Call AI to generate optimized message
      const { data, error } = await supabase.functions.invoke('generate-campaign-message', {
        body: { segment, userCount: segments.totalUsers }
      });

      if (error) throw error;

      setMessage(data.message);
      toast({
        title: "AI Message Generated",
        description: "Optimized message created based on learning patterns"
      });
    } catch (error) {
      console.error('Error generating message:', error);
      // Fallback message
      setMessage(`היי! 💎\n\nהבחנו שלא היית פעיל לאחרונה.\n\nיש לנו תכונות חדשות שיכולות לעזור לך למכור יותר יהלומים:\n\n✨ התאמה אוטומטית לקונים\n💰 דוחות שוק יומיים\n📊 ניתוח מלאי חכם\n\nרוצה לנסות?`);
    } finally {
      setIsGenerating(false);
    }
  };

  const sendCampaign = async () => {
    setIsSending(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-bulk-payment-reminder', {
        body: { 
          testMode: false,
          customMessage: message,
          targetSegment: segment
        }
      });

      if (error) throw error;

      toast({
        title: "Campaign Launched!",
        description: `Sent to ${data.stats?.messages_sent || 0} users`
      });
    } catch (error) {
      console.error('Error sending campaign:', error);
      toast({
        title: "Campaign Failed",
        description: "Failed to send campaign messages",
        variant: "destructive"
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Create New Campaign
          </CardTitle>
          <CardDescription>
            Design targeted campaigns with AI assistance
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Segment Selection */}
          <div className="space-y-2">
            <Label>Target Segment</Label>
            <Select value={segment} onValueChange={setSegment}>
              <SelectTrigger>
                <SelectValue placeholder="Select user segment..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="inactive_no_stock">Inactive Without Stock</SelectItem>
                <SelectItem value="inactive_with_stock">Inactive With Stock</SelectItem>
                <SelectItem value="active_no_stock">Active Without Stock</SelectItem>
                <SelectItem value="active_with_stock">Active With Stock</SelectItem>
                <SelectItem value="all">All Users</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* AI Generation */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Campaign Message</Label>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={generateAIMessage}
                disabled={!segment || isGenerating}
                className="gap-2"
              >
                <Brain className="h-4 w-4" />
                {isGenerating ? 'Generating...' : 'AI Generate'}
              </Button>
            </div>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Enter your campaign message or use AI to generate..."
              rows={10}
              className="font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground">
              💡 Tip: AI will optimize based on {segments.totalUsers} user patterns
            </p>
          </div>

          {/* Preview */}
          {message && (
            <Card className="border-2 border-primary/20 bg-primary/5">
              <CardHeader>
                <CardTitle className="text-sm">Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-background rounded-lg p-4 whitespace-pre-wrap">
                  {message}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <Button 
              onClick={sendCampaign}
              disabled={!message || !segment || isSending}
              className="flex-1 gap-2"
              size="lg"
            >
              <Send className="h-4 w-4" />
              {isSending ? 'Sending...' : 'Launch Campaign'}
            </Button>
            <Button variant="outline" size="lg">
              Save Draft
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
