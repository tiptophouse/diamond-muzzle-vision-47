import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Send, Users, MessageSquare, Target, Clock } from 'lucide-react';
import { useUserDiamondCounts } from '@/hooks/admin/useUserDiamondCounts';
import { useTelegramWebApp } from '@/hooks/useTelegramWebApp';

const CAMPAIGN_TEMPLATES = {
  reengagement: {
    title: "Re-engagement Campaign",
    message: `🔥 **חזרנו עם עדכונים חדשים ומרגשים!** 💎

היי! שמחים לבשר שהמערכת שלנו עברה שיפורים משמעותיים:

✨ **מה חדש:**
• ממשק משופר וידידותי יותר
• אנליטיקה מתקדמת למלאי שלכם
• שיתוף מהיר יותר ויעיל יותר
• תמיכה משופרת בכל הפלטפורמות

🚀 **תתחילו עכשיו:**
1️⃣ העלו את המלאי העדכני שלכם
2️⃣ נסו את כלי השיתוף החדשים
3️⃣ קבלו תובנות על הביצועים שלכם

💰 **בונוס:** המשתמשים הראשונים שיעלו מלאי יקבלו גישה חינמית לכלים המתקדמים!

לחצו כאן להתחלה: @diamondmazalbot`
  },
  welcome: {
    title: "Welcome Series",
    message: `🎉 **ברוכים הבאים ל-BrilliantBot!** 💎

שמחים שהצטרפתם למשפחה שלנו של סוחרי יהלומים!

🔹 **הצעד הראשון שלכם:**
העלו את היהלום הראשון שלכם למערכת - זה לוקח רק דקה!

🔹 **מה תקבלו:**
• ארגון מושלם של המלאי
• שיתוף מהיר עם לקוחות
• מעקב אחר ביצועים
• חיבור ישיר ל-Acadia (למנויים)

💡 **טיפ:** התחילו עם 3-5 יהלומים כדי לראות את כל היכולות

מוכנים להתחיל? @diamondmazalbot`
  },
  activation: {
    title: "User Activation",
    message: `⏰ **עדיין לא התחלתם? זה הזמן!** 💎

ראינו שנרשמתם אצלנו אבל עדיין לא העליתם מלאי...
אל תפספסו את הזדמנות הזהב! 🏆

🎯 **במיוחד בשבילכם - החודש:**
• העלאה חינמית של 100 יהלומים ראשונים
• שיתוף ללא הגבלה 30 יום
• תמיכה אישית מהצוות שלנו

⚡ **3 דקות ותהיו במערכת:**
1. היכנסו ל-@diamondmazalbot
2. לחצו "Upload" או שלחו תמונה של יהלום
3. מלאו פרטים בסיסיים
4. המלאי שלכם מוכן!

זה באמת כל כך פשוט. בואו נתחיל!`
  }
};

type CampaignType = 'reengagement' | 'welcome' | 'activation' | 'custom';

export function ReEngagementCampaign() {
  const { toast } = useToast();
  const { user } = useTelegramWebApp();
  const [campaignType, setCampaignType] = useState<CampaignType>('reengagement');
  const [message, setMessage] = useState(CAMPAIGN_TEMPLATES.reengagement.message);
  const [isLoading, setIsLoading] = useState(false);
  const { userCounts, stats, loading: diamondCountsLoading } = useUserDiamondCounts();

  // Filter users based on campaign type
  const getTargetUsers = () => {
    switch (campaignType) {
      case 'welcome':
        return userCounts.filter(user => user.diamond_count === 0 && isRecentSignup(user));
      case 'activation':
        return userCounts.filter(user => user.diamond_count === 0);
      case 'reengagement':
      default:
        return userCounts.filter(user => user.diamond_count > 0 || isInactiveUser(user));
    }
  };

  const isRecentSignup = (user: any) => {
    // Users who signed up in last 7 days (placeholder logic)
    return true; // You can implement actual date logic
  };

  const isInactiveUser = (user: any) => {
    // Users who haven't been active recently (placeholder logic)
    return true; // You can implement actual activity logic
  };

  const handleCampaignTypeChange = (type: CampaignType) => {
    setCampaignType(type);
    if (type !== 'custom') {
      setMessage(CAMPAIGN_TEMPLATES[type].message);
    }
  };

  const sendCampaign = async () => {
    if (!user?.id) {
      toast({
        title: "Authentication Error",
        description: "User not authenticated",
        variant: "destructive",
      });
      return;
    }

    const targetUsers = getTargetUsers();
    if (targetUsers.length === 0) {
      toast({
        title: "No Target Users",
        description: "No users match the selected campaign criteria",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);

      const { data, error } = await supabase.functions.invoke('send-bulk-acadia-message', {
        body: {
          message: message.trim(),
          senderName: user.first_name || 'Admin',
          senderId: user.id,
          users: targetUsers,
          testMode: false,
          campaignType
        }
      });

      if (error) throw error;

      toast({
        title: "🚀 Campaign Sent Successfully!",
        description: `${CAMPAIGN_TEMPLATES[campaignType]?.title || 'Campaign'} sent to ${targetUsers.length} users`,
      });

      // Log campaign analytics
      await supabase.from('notifications').insert({
        telegram_id: user.id,
        message_type: 'campaign',
        message_content: `${campaignType}_campaign_sent_to_${targetUsers.length}_users`,
        status: 'sent',
        metadata: {
          campaignType,
          targetCount: targetUsers.length,
          timestamp: new Date().toISOString()
        }
      });

    } catch (error) {
      console.error('Error sending campaign:', error);
      toast({
        title: "Campaign Failed",
        description: "Could not send the campaign. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const sendTestMessage = async () => {
    if (!user?.id) return;

    try {
      setIsLoading(true);
      const targetUsers = getTargetUsers();

      const testMessage = `🧪 **Test: ${CAMPAIGN_TEMPLATES[campaignType]?.title || 'Custom Campaign'}**

${message.trim()}

*This would be sent to ${targetUsers.length} users matching the campaign criteria*`;

      const { error } = await supabase.functions.invoke('send-bulk-acadia-message', {
        body: {
          message: testMessage,
          senderName: user.first_name || 'Admin',
          senderId: user.id,
          users: [],
          testMode: true,
          campaignType: `test_${campaignType}`
        }
      });

      if (error) throw error;

      toast({
        title: "Test Sent! ✅",
        description: "Check your Telegram for the test message",
      });
    } catch (error) {
      toast({
        title: "Test Failed",
        description: "Failed to send test message",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (diamondCountsLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center space-x-2">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            <span>Loading campaign data...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const targetUsers = getTargetUsers();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          Re-engagement Campaign Manager
        </CardTitle>
        <CardDescription>
          Send targeted campaigns to re-engage users and activate dormant accounts
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{stats.totalUsers}</div>
            <div className="text-sm text-muted-foreground">Total Users</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{stats.usersWithDiamonds}</div>
            <div className="text-sm text-muted-foreground">Active Users</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">{stats.usersWithZeroDiamonds}</div>
            <div className="text-sm text-muted-foreground">Inactive Users</div>
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-sm font-medium">Campaign Type</label>
          <Select value={campaignType} onValueChange={handleCampaignTypeChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="reengagement">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Re-engagement Campaign
                </div>
              </SelectItem>
              <SelectItem value="welcome">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Welcome New Users
                </div>
              </SelectItem>
              <SelectItem value="activation">
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  Activate Dormant Users
                </div>
              </SelectItem>
              <SelectItem value="custom">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Custom Campaign
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Target className="h-4 w-4 text-blue-600" />
            <span className="font-medium">Campaign Target</span>
          </div>
          <div className="text-sm">
            <span className="text-muted-foreground">Will send to:</span>
            <span className="ml-2 font-medium text-blue-600">{targetUsers.length} users</span>
            <div className="mt-1 text-xs text-muted-foreground">
              {campaignType === 'welcome' && 'New users who haven\'t uploaded inventory'}
              {campaignType === 'activation' && 'Users with zero diamonds in inventory'}
              {campaignType === 'reengagement' && 'Users with inventory or previous activity'}
              {campaignType === 'custom' && 'All registered users'}
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-sm font-medium">Message Content</label>
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Enter your campaign message..."
            className="min-h-[300px] font-mono text-sm"
          />
          <div className="text-xs text-muted-foreground">
            Characters: {message.length} | Target: {targetUsers.length} users
          </div>
        </div>

        {message.trim() && (
          <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 p-4 rounded-lg border border-green-200 dark:border-green-700">
            <h4 className="font-medium mb-2 text-green-800 dark:text-green-200">
              📱 Message Preview
            </h4>
            <div className="text-sm whitespace-pre-wrap bg-white dark:bg-gray-800 p-3 rounded border">
              {message}
            </div>
          </div>
        )}

        <div className="flex gap-2 flex-wrap">
          <Button 
            onClick={sendTestMessage}
            disabled={isLoading || !message.trim()}
            variant="outline"
            className="border-blue-600 text-blue-600 hover:bg-blue-50"
          >
            <Send className="h-4 w-4 mr-2" />
            {isLoading ? 'Sending...' : 'Send Test'}
          </Button>
          
          <Button 
            onClick={sendCampaign}
            disabled={isLoading || !message.trim() || targetUsers.length === 0}
            className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
          >
            <Target className="h-4 w-4 mr-2" />
            {isLoading ? 'Sending...' : `Launch Campaign (${targetUsers.length})`}
          </Button>
        </div>

        {targetUsers.length === 0 && (
          <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
            <Target className="h-8 w-8 mx-auto mb-2 text-yellow-600" />
            <p className="text-sm text-yellow-700 dark:text-yellow-300">
              No users match the selected campaign criteria. Try a different campaign type.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}