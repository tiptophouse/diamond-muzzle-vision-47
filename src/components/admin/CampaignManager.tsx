import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Target, 
  MessageSquare, 
  Activity, 
  Users, 
  TrendingUp,
  Send,
  BarChart3
} from 'lucide-react';
import { ReEngagementCampaign } from './ReEngagementCampaign';
import { AcadiaBulkMessageSender } from './AcadiaBulkMessageSender';
import GroupMessageSender from './GroupMessageSender';
import CampaignAnalytics from './CampaignAnalytics';
import CampaignIdeas from './CampaignIdeas';
import { useUserDiamondCounts } from '@/hooks/admin/useUserDiamondCounts';

export function CampaignManager() {
  const { stats, loading } = useUserDiamondCounts();
  const [activeTab, setActiveTab] = useState('ideas');

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center space-x-2">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            <span>Loading campaign manager...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const campaignStats = [
    {
      title: 'Mini App Users',
      value: stats.totalUsers,
      description: `${stats.totalUsers} in app (719 total in bot)`,
      icon: Users,
      color: 'text-blue-600'
    },
    {
      title: 'Active Users',
      value: stats.usersWithDiamonds,
      description: 'Users with inventory',
      icon: Activity,
      color: 'text-green-600'
    },
    {
      title: 'Dormant Users',
      value: stats.usersWithZeroDiamonds,
      description: 'Need re-engagement',
      icon: Target,
      color: 'text-orange-600'
    },
    {
      title: 'Potential Reach',
      value: stats.totalUsers,
      description: 'Maximum campaign reach',
      icon: TrendingUp,
      color: 'text-purple-600'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Campaign Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Campaign Manager Dashboard
          </CardTitle>
          <CardDescription>
            Manage re-engagement campaigns and bulk messaging for your user base
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {campaignStats.map((stat, index) => (
              <div key={index} className="p-4 border rounded-lg bg-muted/20">
                <div className="flex items-center gap-2 mb-2">
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                  <span className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </span>
                </div>
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="text-xs text-muted-foreground">{stat.description}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Campaign Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="ideas" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Ideas
          </TabsTrigger>
          <TabsTrigger value="group" className="flex items-center gap-2">
            <Send className="h-4 w-4" />
            Group
          </TabsTrigger>
          <TabsTrigger value="reengagement" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Re-engage
          </TabsTrigger>
          <TabsTrigger value="acadia" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Acadia
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Stats
          </TabsTrigger>
        </TabsList>

        <TabsContent value="ideas">
          <CampaignIdeas />
        </TabsContent>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Campaign Strategy Overview</CardTitle>
              <CardDescription>
                Recommended approach for your current user base
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <Target className="h-4 w-4 text-orange-600" />
                    Priority: Dormant User Activation
                  </h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    {stats.usersWithZeroDiamonds} users have registered but never uploaded inventory. 
                    This is your highest-impact campaign opportunity.
                  </p>
                  <Badge variant="outline" className="text-orange-600 border-orange-600">
                    High Impact
                  </Badge>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <Activity className="h-4 w-4 text-green-600" />
                    Secondary: Active User Retention
                  </h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    {stats.usersWithDiamonds} users have inventory. Keep them engaged with 
                    feature updates and Acadia integration offers.
                  </p>
                  <Badge variant="outline" className="text-green-600 border-green-600">
                    Medium Impact
                  </Badge>
                </div>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <h4 className="font-medium mb-2 text-blue-800 dark:text-blue-200">
                  📈 Recommended Campaign Sequence
                </h4>
                <ol className="text-sm space-y-2 text-blue-700 dark:text-blue-300">
                  <li><strong>1. Activation Campaign:</strong> Target {stats.usersWithZeroDiamonds} dormant users with compelling onboarding</li>
                  <li><strong>2. Re-engagement Campaign:</strong> Send "we're back" message to all {stats.totalUsers} users</li>
                  <li><strong>3. Acadia Integration:</strong> Follow up with Acadia SFTP setup for interested users</li>
                  <li><strong>4. Monitor & Iterate:</strong> Track engagement and adjust messaging</li>
                </ol>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reengagement">
          <ReEngagementCampaign />
        </TabsContent>

        <TabsContent value="acadia">
          <AcadiaBulkMessageSender />
        </TabsContent>

        <TabsContent value="group">
          <GroupMessageSender />
        </TabsContent>

        <TabsContent value="analytics">
          <CampaignAnalytics />
        </TabsContent>
      </Tabs>
    </div>
  );
}