import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { TrendingUp, Users, Target, Brain, Zap, BarChart3, Send } from 'lucide-react';
import { CampaignSegments } from '@/components/campaigns/CampaignSegments';
import { CampaignAnalytics } from '@/components/campaigns/CampaignAnalytics';
import { AILearningDashboard } from '@/components/campaigns/AILearningDashboard';
import { CampaignCreator } from '@/components/campaigns/CampaignCreator';
import { ActiveCampaigns } from '@/components/campaigns/ActiveCampaigns';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export default function CampaignsPage() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    frontendUsers: 496,
    backendUsers: 723,
    activeUsers: 0,
    inactiveUsers: 0,
    usersWithStock: 0,
    usersWithoutStock: 0,
    avgEngagement: 0
  });
  const { toast } = useToast();

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      // Get user profiles count
      const { data: profiles, error } = await supabase
        .from('user_profiles')
        .select('telegram_id, last_active');

      if (error) throw error;

      // Calculate active vs inactive (active = visited in last 7 days)
      const now = new Date();
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      
      const activeUsers = profiles?.filter(p => 
        p.last_active && new Date(p.last_active) > sevenDaysAgo
      ).length || 0;

      // Get users with stock
      const { data: inventory } = await supabase
        .from('inventory')
        .select('user_id')
        .is('deleted_at', null);

      const uniqueUsersWithStock = new Set(inventory?.map(i => i.user_id)).size;

      setStats({
        ...stats,
        totalUsers: profiles?.length || 0,
        activeUsers,
        inactiveUsers: (profiles?.length || 0) - activeUsers,
        usersWithStock: uniqueUsersWithStock,
        usersWithoutStock: (profiles?.length || 0) - uniqueUsersWithStock,
        avgEngagement: profiles?.length ? Math.round((activeUsers / profiles.length) * 100) : 0
      });
    } catch (error) {
      console.error('Error loading stats:', error);
      toast({
        title: "Error loading stats",
        description: "Failed to load campaign statistics",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Campaign Control Center
            </h1>
            <p className="text-muted-foreground mt-2">
              AI-powered campaigns with real-time learning and optimization
            </p>
          </div>
          <Button size="lg" className="gap-2">
            <Zap className="h-5 w-5" />
            Launch Campaign
          </Button>
        </div>

        {/* Critical Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="border-2 border-yellow-500/20 bg-yellow-500/5">
            <CardHeader className="pb-3">
              <CardDescription className="text-xs">Frontend Users</CardDescription>
              <CardTitle className="text-3xl font-bold text-yellow-600">
                {stats.frontendUsers}
              </CardTitle>
            </CardHeader>
          </Card>

          <Card className="border-2 border-blue-500/20 bg-blue-500/5">
            <CardHeader className="pb-3">
              <CardDescription className="text-xs">Backend Users</CardDescription>
              <CardTitle className="text-3xl font-bold text-blue-600">
                {stats.backendUsers}
              </CardTitle>
            </CardHeader>
          </Card>

          <Card className="border-2 border-red-500/20 bg-red-500/5">
            <CardHeader className="pb-3">
              <CardDescription className="text-xs">Inactive Users</CardDescription>
              <CardTitle className="text-3xl font-bold text-red-600">
                {stats.inactiveUsers}
              </CardTitle>
            </CardHeader>
          </Card>

          <Card className="border-2 border-purple-500/20 bg-purple-500/5">
            <CardHeader className="pb-3">
              <CardDescription className="text-xs">Avg Engagement</CardDescription>
              <CardTitle className="text-3xl font-bold text-purple-600">
                {stats.avgEngagement}%
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="segments" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="segments" className="gap-2">
              <Target className="h-4 w-4" />
              Segments
            </TabsTrigger>
            <TabsTrigger value="campaigns" className="gap-2">
              <Send className="h-4 w-4" />
              Active
            </TabsTrigger>
            <TabsTrigger value="analytics" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="ai" className="gap-2">
              <Brain className="h-4 w-4" />
              AI Learning
            </TabsTrigger>
            <TabsTrigger value="create" className="gap-2">
              <Zap className="h-4 w-4" />
              Create
            </TabsTrigger>
          </TabsList>

          <TabsContent value="segments" className="space-y-6">
            <CampaignSegments stats={stats} onRefresh={loadStats} />
          </TabsContent>

          <TabsContent value="campaigns" className="space-y-6">
            <ActiveCampaigns />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <CampaignAnalytics />
          </TabsContent>

          <TabsContent value="ai" className="space-y-6">
            <AILearningDashboard />
          </TabsContent>

          <TabsContent value="create" className="space-y-6">
            <CampaignCreator segments={stats} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
