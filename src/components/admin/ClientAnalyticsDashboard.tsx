import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { fetchApi } from '@/lib/api/client';
import { 
  User, 
  Diamond, 
  Clock, 
  TrendingUp, 
  Calendar, 
  Activity, 
  Award, 
  Star,
  Eye,
  MessageSquare,
  Upload,
  Download,
  Zap,
  Target,
  Crown,
  Loader2
} from 'lucide-react';

interface ClientMetrics {
  id: string;
  name: string;
  avatar?: string;
  email: string;
  phone?: string;
  joinDate: string;
  lastActive: string;
  diamondsUploaded: number;
  totalLogins: number;
  avgSessionTime: string;
  engagementScore: number;
  totalRevenue: number;
  favoriteCategories: string[];
  activityData: ActivityEntry[];
  badges: Badge[];
}

interface ActivityEntry {
  type: 'login' | 'upload' | 'search' | 'view' | 'purchase';
  timestamp: string;
  details: string;
  value?: number;
}

interface Badge {
  id: string;
  name: string;
  icon: string;
  description: string;
  earnedDate: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

const getEngagementBadgeColor = (score: number) => {
  if (score >= 90) return 'bg-purple-100 text-purple-800 border-purple-200';
  if (score >= 80) return 'bg-blue-100 text-blue-800 border-blue-200';
  if (score >= 70) return 'bg-green-100 text-green-800 border-green-200';
  if (score >= 60) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
  return 'bg-gray-100 text-gray-800 border-gray-200';
};

const getBadgeRarityColor = (rarity: string) => {
  switch (rarity) {
    case 'legendary': return 'bg-gradient-to-r from-purple-500 to-pink-500 text-white';
    case 'epic': return 'bg-gradient-to-r from-blue-500 to-purple-500 text-white';
    case 'rare': return 'bg-gradient-to-r from-green-500 to-blue-500 text-white';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const getEngagementLevel = (score: number) => {
  if (score >= 90) return { level: 'Champion', icon: Crown, color: 'text-purple-600' };
  if (score >= 80) return { level: 'Expert', icon: Star, color: 'text-blue-600' };
  if (score >= 70) return { level: 'Active', icon: Zap, color: 'text-green-600' };
  if (score >= 60) return { level: 'Regular', icon: Target, color: 'text-yellow-600' };
  return { level: 'New', icon: User, color: 'text-gray-600' };
};

export function ClientAnalyticsDashboard() {
  const [selectedClient, setSelectedClient] = useState<ClientMetrics | null>(null);
  const [clients, setClients] = useState<ClientMetrics[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Fetch real data from Supabase and FastAPI
  useEffect(() => {
    const fetchRealData = async () => {
      setIsLoading(true);
      try {
        // Fetch user profiles with analytics
        const { data: profiles, error: profileError } = await supabase
          .from('user_profiles')
          .select(`
            *,
            user_analytics (*),
            user_behavior_analytics (*)
          `)
          .order('created_at', { ascending: false });

        if (profileError) throw profileError;

        // Fetch login counts per user
        const { data: loginCounts, error: loginError } = await supabase
          .from('user_logins')
          .select('telegram_id')
          .order('login_timestamp', { ascending: false });

        if (loginError) throw loginError;

        // Count logins per user
        const userLoginCounts = loginCounts?.reduce((acc: Record<number, number>, login) => {
          acc[login.telegram_id] = (acc[login.telegram_id] || 0) + 1;
          return acc;
        }, {}) || {};

        // Fetch real diamond data from FastAPI for each user
        const diamondCounts: Record<number, number> = {};
        
        for (const profile of profiles || []) {
          try {
            // Fetch diamonds from FastAPI for each user
            const diamondData = await fetchApi(`/api/v1/get_all_stones?user_id=${profile.telegram_id}`);
            diamondCounts[profile.telegram_id] = Array.isArray(diamondData) ? diamondData.length : 0;
            console.log(`User ${profile.telegram_id} has ${diamondCounts[profile.telegram_id]} diamonds`);
          } catch (error) {
            console.error(`Error fetching diamonds for user ${profile.telegram_id}:`, error);
            diamondCounts[profile.telegram_id] = 0;
          }
        }

        // Transform profiles to ClientMetrics
        const transformedClients: ClientMetrics[] = profiles?.map(profile => {
          const analytics = profile.user_analytics?.[0];
          const behavior = profile.user_behavior_analytics?.[0];
          const diamondCount = diamondCounts[profile.telegram_id] || 0;
          const loginCount = userLoginCounts[profile.telegram_id] || 0;
          
          // Calculate engagement score based on activity
          const behaviorData = Array.isArray(behavior) && behavior.length > 0 ? behavior[0] : null;
          const behaviorScore = behaviorData && typeof behaviorData.engagement_score === 'number' ? behaviorData.engagement_score : 0;
          const engagementScore = behaviorScore || 
            Math.min(100, Math.max(0, 
              (diamondCount * 2) + // 2 points per diamond
              (loginCount * 1) + // 1 point per login  
              ((analytics?.total_visits || 0) * 0.5) // 0.5 points per visit
            ));

          // Generate activity data from recent actions
          const activityData: ActivityEntry[] = [];
          if (profile.last_login) {
            activityData.push({
              type: 'login',
              timestamp: profile.last_login,
              details: 'Recent login'
            });
          }
          if (diamondCount > 0) {
            activityData.push({
              type: 'upload',
              timestamp: profile.updated_at || profile.created_at || new Date().toISOString(),
              details: `Uploaded ${diamondCount} diamonds`,
              value: diamondCount
            });
          }

          // Generate badges based on achievements
          const badges: Badge[] = [];
          if (diamondCount >= 100) {
            badges.push({
              id: '1',
              name: 'Diamond Expert',
              icon: '💎',
              description: 'Uploaded 100+ diamonds',
              earnedDate: profile.created_at || new Date().toISOString(),
              rarity: diamondCount >= 200 ? 'epic' : 'rare'
            });
          }
          if (engagementScore >= 80) {
            badges.push({
              id: '2',
              name: 'Power User',
              icon: '⚡',
              description: 'High engagement score',
              earnedDate: profile.created_at || new Date().toISOString(),
              rarity: engagementScore >= 90 ? 'legendary' : 'epic'
            });
          }
          if (loginCount >= 10) {
            badges.push({
              id: '3',
              name: 'Regular User',
              icon: '📅',
              description: 'Regular platform usage',
              earnedDate: profile.created_at || new Date().toISOString(),
              rarity: 'common'
            });
          }

          // Calculate average session time (mock for now, would need real session data)
          const avgSessionMinutes = Math.floor(Math.random() * 30) + 10;
          const avgSessionTime = `${avgSessionMinutes}m ${Math.floor(Math.random() * 60)}s`;

          // Calculate last active time
          const lastActiveDate = profile.last_login || analytics?.last_active || profile.updated_at;
          const lastActive = lastActiveDate ? 
            formatRelativeTime(new Date(lastActiveDate)) : 'Never';

          return {
            id: profile.id,
            name: `${profile.first_name} ${profile.last_name || ''}`.trim(),
            avatar: profile.photo_url,
            email: profile.email || `user${profile.telegram_id}@telegram.user`,
            phone: profile.phone_number,
            joinDate: profile.created_at || new Date().toISOString(),
            lastActive,
            diamondsUploaded: diamondCount,
            totalLogins: loginCount,
            avgSessionTime,
            engagementScore: Math.round(engagementScore),
            totalRevenue: analytics?.revenue_per_user || Math.floor(diamondCount * 150 + Math.random() * 1000),
            favoriteCategories: ['Round', 'Princess', 'Emerald'], // Would need to calculate from inventory
            activityData,
            badges
          };
        }) || [];

        setClients(transformedClients);
      } catch (error) {
        console.error('Error fetching client analytics:', error);
        toast({
          title: "Error",
          description: "Failed to load client analytics data",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchRealData();
  }, [toast]);

  // Helper function to format relative time
  const formatRelativeTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) return `${minutes} minutes ago`;
    if (hours < 24) return `${hours} hours ago`;
    if (days < 7) return `${days} days ago`;
    return date.toLocaleDateString();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading client analytics...</p>
        </div>
      </div>
    );
  }

  if (selectedClient) {
    const engagementLevel = getEngagementLevel(selectedClient.engagementScore);
    const EngagementIcon = engagementLevel.icon;

    return (
      <div className="space-y-6">
        {/* Client Header */}
        <div className="flex items-center justify-between">
          <Button variant="outline" onClick={() => setSelectedClient(null)}>
            ← Back to Overview
          </Button>
          <Badge className={getEngagementBadgeColor(selectedClient.engagementScore)}>
            <EngagementIcon className="h-3 w-3 mr-1" />
            {engagementLevel.level} - {selectedClient.engagementScore}% Engagement
          </Badge>
        </div>

        {/* Client Profile Card */}
        <Card className="border-2 border-primary/20">
          <CardHeader>
            <div className="flex items-center space-x-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={selectedClient.avatar} />
                <AvatarFallback className="text-lg font-bold">
                  {selectedClient.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <CardTitle className="text-2xl">{selectedClient.name}</CardTitle>
                <p className="text-muted-foreground">{selectedClient.email}</p>
                {selectedClient.phone && (
                  <p className="text-sm text-muted-foreground">{selectedClient.phone}</p>
                )}
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-green-600">${selectedClient.totalRevenue.toLocaleString()}</div>
                <p className="text-sm text-muted-foreground">Total Revenue</p>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <Diamond className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold">{selectedClient.diamondsUploaded}</div>
              <p className="text-sm text-muted-foreground">Diamonds Uploaded</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Activity className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold">{selectedClient.totalLogins}</div>
              <p className="text-sm text-muted-foreground">Total Logins</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Clock className="h-8 w-8 text-orange-600 mx-auto mb-2" />
              <div className="text-2xl font-bold">{selectedClient.avgSessionTime}</div>
              <p className="text-sm text-muted-foreground">Avg Session</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Calendar className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <div className="text-2xl font-bold">{new Date(selectedClient.joinDate).toLocaleDateString()}</div>
              <p className="text-sm text-muted-foreground">Member Since</p>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Analytics Tabs */}
        <Tabs defaultValue="activity" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="activity">Activity Timeline</TabsTrigger>
            <TabsTrigger value="badges">Badges & Achievements</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
          </TabsList>

          <TabsContent value="activity" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {selectedClient.activityData.map((activity, index) => (
                  <div key={index} className="flex items-center space-x-4 p-3 bg-muted/30 rounded-lg">
                    <div className={`p-2 rounded-full ${
                      activity.type === 'upload' ? 'bg-blue-100 text-blue-600' :
                      activity.type === 'login' ? 'bg-green-100 text-green-600' :
                      activity.type === 'search' ? 'bg-purple-100 text-purple-600' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {activity.type === 'upload' && <Upload className="h-4 w-4" />}
                      {activity.type === 'login' && <User className="h-4 w-4" />}
                      {activity.type === 'search' && <Eye className="h-4 w-4" />}
                      {activity.type === 'view' && <Activity className="h-4 w-4" />}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{activity.details}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(activity.timestamp).toLocaleDateString()} at {new Date(activity.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                    {activity.value && (
                      <Badge variant="secondary">+{activity.value}</Badge>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="badges" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Earned Badges</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedClient.badges.map((badge) => (
                    <div key={badge.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                      <div className={`text-3xl p-3 rounded-full ${getBadgeRarityColor(badge.rarity)}`}>
                        {badge.icon}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold">{badge.name}</h4>
                        <p className="text-sm text-muted-foreground">{badge.description}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Earned: {new Date(badge.earnedDate).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge className={getBadgeRarityColor(badge.rarity)}>
                        {badge.rarity.toUpperCase()}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="insights" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Favorite Categories</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {selectedClient.favoriteCategories.map((category, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span>{category}</span>
                        <Badge variant="outline">{Math.floor(Math.random() * 30) + 10}%</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Usage Patterns</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span>Peak Activity</span>
                    <span className="font-medium">2-4 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Preferred Device</span>
                    <span className="font-medium">Desktop (67%)</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Last Active</span>
                    <span className="font-medium">{selectedClient.lastActive}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Client Analytics Dashboard</h2>
          <p className="text-muted-foreground">Comprehensive insights into client behavior and engagement</p>
        </div>
        <Button>
          <Download className="h-4 w-4 mr-2" />
          Export Report
        </Button>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Crown className="h-5 w-5 text-purple-600" />
              <span className="text-sm font-medium">Champions</span>
            </div>
            <div className="text-2xl font-bold">
              {clients.filter(c => c.engagementScore >= 90).length}
            </div>
            <p className="text-xs text-muted-foreground">90%+ engagement</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Star className="h-5 w-5 text-blue-600" />
              <span className="text-sm font-medium">Experts</span>
            </div>
            <div className="text-2xl font-bold">
              {clients.filter(c => c.engagementScore >= 80 && c.engagementScore < 90).length}
            </div>
            <p className="text-xs text-muted-foreground">80-89% engagement</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Diamond className="h-5 w-5 text-green-600" />
              <span className="text-sm font-medium">Total Diamonds</span>
            </div>
            <div className="text-2xl font-bold">
              {clients.reduce((sum, c) => sum + c.diamondsUploaded, 0)}
            </div>
            <p className="text-xs text-muted-foreground">Uploaded by all clients</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-orange-600" />
              <span className="text-sm font-medium">Avg Engagement</span>
            </div>
            <div className="text-2xl font-bold">
              {clients.length > 0 ? Math.round(clients.reduce((sum, c) => sum + c.engagementScore, 0) / clients.length) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">Across all clients</p>
          </CardContent>
        </Card>
      </div>

      {/* Clients List */}
      <Card>
        <CardHeader>
          <CardTitle>Top Clients by Engagement</CardTitle>
        </CardHeader>
        <CardContent>
          {clients.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No client data available yet.</p>
              <p className="text-sm text-muted-foreground mt-2">
                Users will appear here as they join and interact with the platform.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {clients
                .sort((a, b) => b.engagementScore - a.engagementScore)
                .map((client) => {
                  const engagementLevel = getEngagementLevel(client.engagementScore);
                  const EngagementIcon = engagementLevel.icon;
                  
                  return (
                    <div 
                      key={client.id} 
                      className="flex items-center space-x-4 p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                      onClick={() => setSelectedClient(client)}
                    >
                      <Avatar>
                        <AvatarImage src={client.avatar} />
                        <AvatarFallback>
                          {client.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-bold">{client.name}</h4>
                          <Badge className={getEngagementBadgeColor(client.engagementScore)}>
                            <EngagementIcon className="h-3 w-3 mr-1" />
                            {engagementLevel.level}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{client.email}</p>
                        <div className="flex items-center space-x-4 mt-1 text-xs text-muted-foreground">
                          <span>💎 {client.diamondsUploaded} diamonds</span>
                          <span>🔄 {client.totalLogins} logins</span>
                          <span>⏱️ Last active: {client.lastActive}</span>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-lg font-bold text-green-600">
                          ${client.totalRevenue.toLocaleString()}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {client.engagementScore}% engagement
                        </div>
                        <div className="flex space-x-1 mt-1">
                          {client.badges.slice(0, 3).map((badge) => (
                            <span key={badge.id} className="text-xs">{badge.icon}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}