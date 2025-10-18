import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useEnhancedAnalytics } from '@/hooks/useEnhancedAnalytics';
import { TrendingUp, Eye, Share2, MessageSquare } from 'lucide-react';
import { useDiamondShareStats } from '@/hooks/admin/useDiamondShareStats';
import { useBotUsageStats } from '@/hooks/admin/useBotUsageStats';

export function DashboardMiniAnalytics() {
  const { enhancedUsers, getUserEngagementScore } = useEnhancedAnalytics();
  const { shareStats } = useDiamondShareStats();
  const { botStats } = useBotUsageStats();

  // Get top 5 most engaged users
  const topUsers = enhancedUsers
    .map(user => ({
      ...user,
      score: getUserEngagementScore(user)
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Top Engaged Users */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-green-500" />
            Top 5 Engaged Users
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {topUsers.map((user, index) => (
              <div key={user.telegram_id} className="flex items-center justify-between text-xs">
                <span className="truncate flex-1">
                  {index + 1}. {user.first_name} {user.last_name}
                </span>
                <span className="font-semibold text-green-600">{user.score}%</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Diamond Share Performance */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Eye className="h-4 w-4 text-blue-500" />
            Share Performance (7d)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">Total Views</span>
              <span className="text-lg font-bold">{shareStats.totalViews}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">Unique Viewers</span>
              <span className="text-lg font-bold">{shareStats.uniqueViewers}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">Avg View Time</span>
              <span className="text-lg font-bold">{shareStats.avgViewTime}s</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bot Usage Trends */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-purple-500" />
            Bot Usage Today
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">Messages</span>
              <span className="text-lg font-bold">{botStats.messagesToday}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">Active Users</span>
              <span className="text-lg font-bold">{botStats.activeUsersToday}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">Commands</span>
              <span className="text-lg font-bold">{botStats.commandsToday}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Share CTR */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Share2 className="h-4 w-4 text-pink-500" />
            Share Metrics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">Shares</span>
              <span className="text-lg font-bold">{shareStats.totalShares}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">Click Rate</span>
              <span className="text-lg font-bold">{shareStats.clickRate}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">Reshares</span>
              <span className="text-lg font-bold">{shareStats.reshares}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
