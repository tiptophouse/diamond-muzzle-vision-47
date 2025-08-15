
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Send, 
  Users, 
  MessageSquare, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Target,
  Zap,
  TrendingUp,
  Calendar
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useCampaignAnalytics } from '@/hooks/useCampaignAnalytics';

interface CampaignData {
  name: string;
  message: string;
  targetGroup: 'all' | 'uploaders' | 'zero-diamonds' | 'inactive';
  campaignType: 'announcement' | 'promotion' | 'reminder' | 'welcome';
}

export function CampaignSender() {
  const [campaignData, setCampaignData] = useState<CampaignData>({
    name: '',
    message: '',
    targetGroup: 'all',
    campaignType: 'announcement'
  });
  const [isSending, setIsSending] = useState(false);
  const [sendProgress, setSendProgress] = useState(0);
  const [estimatedReach, setEstimatedReach] = useState(0);
  
  const { metrics, logCampaignSent } = useCampaignAnalytics();

  // Estimate reach based on target group
  React.useEffect(() => {
    const estimateReach = async () => {
      try {
        let query = supabase.from('user_profiles').select('telegram_id', { count: 'exact' });
        
        switch (campaignData.targetGroup) {
          case 'uploaders':
            // Users who have diamonds
            const { data: uploaders } = await supabase
              .from('diamonds')
              .select('user_id')
              .not('user_id', 'is', null);
            const uniqueUploaders = [...new Set(uploaders?.map(d => d.user_id) || [])];
            setEstimatedReach(uniqueUploaders.length);
            break;
          case 'zero-diamonds':
            // Users with no diamonds
            const { data: allUsers } = await supabase.from('user_profiles').select('telegram_id');
            const { data: usersWithDiamonds } = await supabase
              .from('diamonds')
              .select('user_id')
              .not('user_id', 'is', null);
            const usersWithDiamondsSet = new Set(usersWithDiamonds?.map(d => d.user_id) || []);
            const zeroUsers = allUsers?.filter(u => !usersWithDiamondsSet.has(u.telegram_id)) || [];
            setEstimatedReach(zeroUsers.length);
            break;
          case 'inactive':
            // Users who haven't logged in recently (last 7 days)
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
            const { count } = await supabase
              .from('user_profiles')
              .select('telegram_id', { count: 'exact' })
              .lt('last_login', sevenDaysAgo.toISOString());
            setEstimatedReach(count || 0);
            break;
          default:
            const { count: totalCount } = await supabase
              .from('user_profiles')
              .select('telegram_id', { count: 'exact' });
            setEstimatedReach(totalCount || 0);
        }
      } catch (error) {
        console.error('Error estimating reach:', error);
        setEstimatedReach(0);
      }
    };

    if (campaignData.targetGroup) {
      estimateReach();
    }
  }, [campaignData.targetGroup]);

  const handleSendCampaign = async () => {
    if (!campaignData.name.trim() || !campaignData.message.trim()) {
      toast.error('Please fill in campaign name and message');
      return;
    }

    setIsSending(true);
    setSendProgress(0);

    try {
      // Log campaign start
      await logCampaignSent({
        campaign_type: campaignData.campaignType,
        campaign_name: campaignData.name,
        message_content: campaignData.message,
        target_group: campaignData.targetGroup,
        sent_count: estimatedReach,
        current_uploaders: 0 // Will be updated by backend
      });

      // Call the appropriate Supabase function based on campaign type
      const functionName = getCampaignFunction(campaignData.campaignType, campaignData.targetGroup);
      
      const { data, error } = await supabase.functions.invoke(functionName, {
        body: {
          message: campaignData.message,
          campaign_name: campaignData.name,
          target_group: campaignData.targetGroup
        }
      });

      if (error) throw error;

      // Simulate progress
      const progressInterval = setInterval(() => {
        setSendProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      // Complete after response
      setTimeout(() => {
        setSendProgress(100);
        toast.success(`Campaign "${campaignData.name}" sent successfully to ${estimatedReach} users!`);
        
        // Reset form
        setCampaignData({
          name: '',
          message: '',
          targetGroup: 'all',
          campaignType: 'announcement'
        });
      }, 2000);

    } catch (error) {
      console.error('Campaign send error:', error);
      toast.error('Failed to send campaign');
      setSendProgress(0);
    } finally {
      setTimeout(() => {
        setIsSending(false);
        setSendProgress(0);
      }, 3000);
    }
  };

  const getCampaignFunction = (type: string, target: string): string => {
    switch (type) {
      case 'welcome':
        return 'send-welcome-message';
      case 'reminder':
        return 'send-upload-reminder';
      default:
        return 'send-announcement';
    }
  };

  const getCampaignIcon = (type: string) => {
    switch (type) {
      case 'announcement': return <MessageSquare className="h-4 w-4" />;
      case 'promotion': return <TrendingUp className="h-4 w-4" />;
      case 'reminder': return <Clock className="h-4 w-4" />;
      case 'welcome': return <Zap className="h-4 w-4" />;
      default: return <MessageSquare className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="h-5 w-5" />
            Campaign Sender
          </CardTitle>
          <CardDescription>
            Send targeted campaigns to user groups via Telegram
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Campaign Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <Target className="h-5 w-5 text-blue-600" />
                <span className="text-2xl font-bold text-blue-600">{estimatedReach}</span>
              </div>
              <p className="text-sm text-blue-600 mt-1">Estimated Reach</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="text-2xl font-bold text-green-600">{metrics.totalSent}</span>
              </div>
              <p className="text-sm text-green-600 mt-1">Total Sent</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <TrendingUp className="h-5 w-5 text-purple-600" />
                <span className="text-2xl font-bold text-purple-600">{metrics.averageEngagement.toFixed(1)}%</span>
              </div>
              <p className="text-sm text-purple-600 mt-1">Avg Engagement</p>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <Calendar className="h-5 w-5 text-orange-600" />
                <span className="text-2xl font-bold text-orange-600">{metrics.totalCampaigns}</span>
              </div>
              <p className="text-sm text-orange-600 mt-1">Campaigns Sent</p>
            </div>
          </div>

          <Separator />

          {/* Campaign Form */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="campaign-name">Campaign Name</Label>
                <Input
                  id="campaign-name"
                  placeholder="e.g., Weekly Diamond Update"
                  value={campaignData.name}
                  onChange={(e) => setCampaignData(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>

              <div>
                <Label htmlFor="campaign-type">Campaign Type</Label>
                <Select 
                  value={campaignData.campaignType} 
                  onValueChange={(value: any) => setCampaignData(prev => ({ ...prev, campaignType: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="announcement">📢 Announcement</SelectItem>
                    <SelectItem value="promotion">🎯 Promotion</SelectItem>
                    <SelectItem value="reminder">⏰ Reminder</SelectItem>
                    <SelectItem value="welcome">👋 Welcome</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="target-group">Target Group</Label>
                <Select 
                  value={campaignData.targetGroup} 
                  onValueChange={(value: any) => setCampaignData(prev => ({ ...prev, targetGroup: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">👥 All Users</SelectItem>
                    <SelectItem value="uploaders">💎 Active Uploaders</SelectItem>
                    <SelectItem value="zero-diamonds">🆘 Zero Diamonds</SelectItem>
                    <SelectItem value="inactive">😴 Inactive Users</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="message">Campaign Message</Label>
              <Textarea
                id="message"
                placeholder="Enter your campaign message here..."
                className="min-h-[200px]"
                value={campaignData.message}
                onChange={(e) => setCampaignData(prev => ({ ...prev, message: e.target.value }))}
              />
              <p className="text-sm text-muted-foreground mt-2">
                {campaignData.message.length}/1000 characters
              </p>
            </div>
          </div>

          {/* Progress */}
          {isSending && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Sending campaign...</span>
                <span className="text-sm text-muted-foreground">{sendProgress}%</span>
              </div>
              <Progress value={sendProgress} className="w-full" />
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <Button 
              onClick={handleSendCampaign}
              disabled={isSending || !campaignData.name.trim() || !campaignData.message.trim()}
              className="flex-1 md:flex-none"
            >
              {isSending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Sending...
                </>
              ) : (
                <>
                  {getCampaignIcon(campaignData.campaignType)}
                  <span className="ml-2">Send Campaign</span>
                </>
              )}
            </Button>
            
            <Badge variant="outline" className="hidden md:flex">
              Reach: {estimatedReach} users
            </Badge>
          </div>

          {/* Preview */}
          {campaignData.message && (
            <Alert>
              <MessageSquare className="h-4 w-4" />
              <AlertDescription>
                <strong>Preview:</strong> {campaignData.message.substring(0, 100)}
                {campaignData.message.length > 100 && '...'}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
