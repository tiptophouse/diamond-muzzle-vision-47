import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Bell, 
  Send, 
  Clock, 
  Users, 
  TrendingUp, 
  MessageSquare,
  Target,
  BarChart,
  Calendar,
  Sparkles,
  Zap
} from 'lucide-react';
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface NotificationTemplate {
  id: string;
  name: string;
  type: 'engagement' | 'reminder' | 'social' | 'market' | 'achievement';
  message: string;
  trigger: string;
  icon: string;
  priority: 'low' | 'medium' | 'high';
}

interface NotificationSettings {
  enableEngagement: boolean;
  enableReminders: boolean;
  enableSocial: boolean;
  enableMarket: boolean;
  quietHours: {
    start: string;
    end: string;
  };
  frequency: 'immediate' | 'hourly' | 'daily';
}

export default function SmartNotificationSystem() {
  const { user } = useTelegramAuth();
  const { toast } = useToast();
  
  const [settings, setSettings] = useState<NotificationSettings>({
    enableEngagement: true,
    enableReminders: true,
    enableSocial: false,
    enableMarket: true,
    quietHours: {
      start: '22:00',
      end: '08:00'
    },
    frequency: 'hourly'
  });

  const [customMessage, setCustomMessage] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');

  const templates: NotificationTemplate[] = [
    {
      id: 'no_uploads',
      name: 'Upload Reminder',
      type: 'reminder',
      message: "💎 Haven't uploaded any diamonds lately? Your inventory is waiting for new gems!",
      trigger: 'No uploads for 3 days',
      icon: '📤',
      priority: 'medium'
    },
    {
      id: 'streak_break',
      name: 'Streak Recovery',
      type: 'engagement',
      message: "🔥 Your streak is about to break! Quick visit to keep the momentum going.",
      trigger: 'No activity for 18 hours',
      icon: '⚡',
      priority: 'high'
    },
    {
      id: 'market_trends',
      name: 'Market Alert',
      type: 'market',
      message: "📈 Diamond prices are trending up! Check your inventory value now.",
      trigger: 'Weekly market analysis',
      icon: '💹',
      priority: 'medium'
    },
    {
      id: 'social_activity',
      name: 'Social Engagement',
      type: 'social',
      message: "👥 5 users are currently browsing diamonds. Join the active community!",
      trigger: 'High user activity',
      icon: '🌟',
      priority: 'low'
    },
    {
      id: 'inventory_update',
      name: 'Inventory Check',
      type: 'reminder',
      message: "📊 Time to review and update your diamond inventory. Stay organized!",
      trigger: 'Weekly reminder',
      icon: '📋',
      priority: 'low'
    },
    {
      id: 'achievement_unlock',
      name: 'Achievement Near',
      type: 'achievement',
      message: "🏆 You're 3 diamonds away from unlocking 'Collection Master'! Almost there!",
      trigger: 'Achievement progress 90%+',
      icon: '🎯',
      priority: 'high'
    },
    {
      id: 'competitor_analysis',
      name: 'Market Intelligence',
      type: 'market',
      message: "🔍 New competitive pricing insights available. Stay ahead of the market!",
      trigger: 'New market data',
      icon: '🧠',
      priority: 'medium'
    },
    {
      id: 'engagement_boost',
      name: 'Quick Win',
      type: 'engagement',
      message: "⚡ 2-minute task: Share a diamond and earn 50 XP instantly!",
      trigger: 'Low daily activity',
      icon: '🎮',
      priority: 'high'
    }
  ];

  const sendNotification = async (template?: NotificationTemplate, customMsg?: string) => {
    if (!user?.id) return;

    const message = customMsg || template?.message || '';
    const notificationType = template?.type || 'custom';

    try {
      // Call the Telegram notification function
      const { data, error } = await supabase.functions.invoke('send-telegram-message', {
        body: {
          telegramId: user.id,
          message: message,
          notificationType: notificationType
        }
      });

      if (error) throw error;

      // Log notification for analytics
      await supabase.from('notifications').insert({
        telegram_id: user.id,
        message_content: message,
        message_type: notificationType,
        status: 'sent'
      });

      toast({
        title: "Notification Sent! 🚀",
        description: "Message delivered via Telegram",
      });

    } catch (error) {
      console.error('Notification error:', error);
      toast({
        title: "Notification Failed",
        description: "Failed to send notification",
        variant: "destructive"
      });
    }
  };

  const sendBulkEngagementCampaign = async () => {
    const engagementMessages = [
      "🌟 Your diamond collection deserves attention! Check your latest additions.",
      "💎 Market alert: Premium diamonds are in high demand right now!",
      "🔥 You're on a roll! Complete one more task to extend your streak.",
      "📈 Weekly insight: Your inventory value increased by 12% this week!"
    ];

    for (const message of engagementMessages) {
      await sendNotification(undefined, message);
      // Small delay between messages
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    toast({
      title: "Engagement Campaign Launched! 🚀",
      description: `${engagementMessages.length} notifications sent`,
    });
  };

  const updateSettings = (key: keyof NotificationSettings, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  return (
    <div className="space-y-6 p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Smart Notifications</h1>
          <p className="text-muted-foreground">
            Automated engagement system to increase user retention
          </p>
        </div>
        <Button onClick={sendBulkEngagementCampaign} className="bg-gradient-to-r from-primary to-secondary">
          <Sparkles className="w-4 h-4 mr-2" />
          Launch Campaign
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Settings Panel */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Notification Settings
            </CardTitle>
            <CardDescription>
              Configure automated notification triggers
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="engagement">Engagement Boosts</Label>
              <Switch
                id="engagement"
                checked={settings.enableEngagement}
                onCheckedChange={(checked) => updateSettings('enableEngagement', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="reminders">Upload Reminders</Label>
              <Switch
                id="reminders"
                checked={settings.enableReminders}
                onCheckedChange={(checked) => updateSettings('enableReminders', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="social">Social Activity</Label>
              <Switch
                id="social"
                checked={settings.enableSocial}
                onCheckedChange={(checked) => updateSettings('enableSocial', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="market">Market Alerts</Label>
              <Switch
                id="market"
                checked={settings.enableMarket}
                onCheckedChange={(checked) => updateSettings('enableMarket', checked)}
              />
            </div>

            <div className="space-y-2">
              <Label>Frequency</Label>
              <Select 
                value={settings.frequency} 
                onValueChange={(value: any) => updateSettings('frequency', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="immediate">Immediate</SelectItem>
                  <SelectItem value="hourly">Hourly</SelectItem>
                  <SelectItem value="daily">Daily</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="quiet-start">Quiet Hours Start</Label>
                <Input
                  id="quiet-start"
                  type="time"
                  value={settings.quietHours.start}
                  onChange={(e) => updateSettings('quietHours', {
                    ...settings.quietHours,
                    start: e.target.value
                  })}
                />
              </div>
              <div>
                <Label htmlFor="quiet-end">Quiet Hours End</Label>
                <Input
                  id="quiet-end"
                  type="time"
                  value={settings.quietHours.end}
                  onChange={(e) => updateSettings('quietHours', {
                    ...settings.quietHours,
                    end: e.target.value
                  })}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Custom Message */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Send Custom Message
            </CardTitle>
            <CardDescription>
              Send immediate notification to increase engagement
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="Write your engagement message..."
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              className="min-h-[100px]"
            />
            <Button 
              onClick={() => sendNotification(undefined, customMessage)}
              disabled={!customMessage.trim()}
              className="w-full"
            >
              <Send className="w-4 h-4 mr-2" />
              Send Now
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Notification Templates */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Smart Templates
          </CardTitle>
          <CardDescription>
            Pre-built engagement messages with automated triggers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2">
            {templates.map((template) => (
              <div
                key={template.id}
                className="p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                onClick={() => setSelectedTemplate(template.id)}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{template.icon}</span>
                    <div>
                      <h4 className="font-medium">{template.name}</h4>
                      <Badge 
                        variant={
                          template.priority === 'high' ? 'destructive' :
                          template.priority === 'medium' ? 'default' : 'secondary'
                        }
                        className="text-xs"
                      >
                        {template.priority}
                      </Badge>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      sendNotification(template);
                    }}
                  >
                    <Send className="w-3 h-3" />
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground mb-1">
                  {template.message}
                </p>
                <p className="text-xs text-muted-foreground">
                  Trigger: {template.trigger}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Analytics Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart className="w-5 h-5" />
            Engagement Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">85%</div>
              <div className="text-sm text-muted-foreground">Open Rate</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-secondary">12m</div>
              <div className="text-sm text-muted-foreground">Avg. Return Time</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-accent">+34%</div>
              <div className="text-sm text-muted-foreground">Engagement Boost</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">156</div>
              <div className="text-sm text-muted-foreground">Messages Sent</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}