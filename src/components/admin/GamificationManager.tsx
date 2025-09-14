import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Trophy, Award, Star, Gift, Target, Crown, Gem, TrendingUp } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface UserAchievement {
  telegram_id: number;
  name: string;
  achievements: string[];
  points: number;
  level: number;
  diamonds_uploaded: number;
  days_active: number;
  shares_made: number;
  referrals: number;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  points: number;
  criteria: {
    type: 'diamonds' | 'activity' | 'shares' | 'referrals';
    threshold: number;
  };
}

const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_upload',
    title: 'First Steps',
    description: 'Upload your first diamond',
    icon: 'gem',
    points: 50,
    criteria: { type: 'diamonds', threshold: 1 }
  },
  {
    id: 'diamond_collector',
    title: 'Diamond Collector',
    description: 'Upload 10 diamonds',
    icon: 'star',
    points: 200,
    criteria: { type: 'diamonds', threshold: 10 }
  },
  {
    id: 'inventory_master',
    title: 'Inventory Master',
    description: 'Upload 50 diamonds',
    icon: 'crown',
    points: 500,
    criteria: { type: 'diamonds', threshold: 50 }
  },
  {
    id: 'diamond_mogul',
    title: 'Diamond Mogul',
    description: 'Upload 100 diamonds',
    icon: 'trophy',
    points: 1000,
    criteria: { type: 'diamonds', threshold: 100 }
  },
  {
    id: 'active_week',
    title: 'Weekly Warrior',
    description: 'Active for 7 consecutive days',
    icon: 'target',
    points: 150,
    criteria: { type: 'activity', threshold: 7 }
  },
  {
    id: 'share_pioneer',
    title: 'Share Pioneer',
    description: 'Share 5 diamonds',
    icon: 'trending-up',
    points: 100,
    criteria: { type: 'shares', threshold: 5 }
  },
  {
    id: 'community_builder',
    title: 'Community Builder',
    description: 'Refer 3 new users',
    icon: 'award',
    points: 300,
    criteria: { type: 'referrals', threshold: 3 }
  }
];

const ACHIEVEMENT_ICONS: { [key: string]: React.ReactNode } = {
  gem: <Gem className="h-4 w-4" />,
  star: <Star className="h-4 w-4" />,
  crown: <Crown className="h-4 w-4" />,
  trophy: <Trophy className="h-4 w-4" />,
  target: <Target className="h-4 w-4" />,
  'trending-up': <TrendingUp className="h-4 w-4" />,
  award: <Award className="h-4 w-4" />
};

export function GamificationManager() {
  const { toast } = useToast();
  const [userAchievements, setUserAchievements] = useState<UserAchievement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchUserAchievements = async () => {
    try {
      setIsLoading(true);

      // Get user profiles with analytics
      const { data: profiles, error: profilesError } = await supabase
        .from('user_profiles')
        .select(`
          telegram_id,
          first_name,
          last_name,
          created_at,
          updated_at
        `);

      if (profilesError) throw profilesError;

      // Get user analytics
      const { data: analytics, error: analyticsError } = await supabase
        .from('user_analytics')
        .select('telegram_id, api_calls_count');

      if (analyticsError) throw analyticsError;

      // Get diamond shares
      const { data: shares, error: sharesError } = await supabase
        .from('diamond_shares')
        .select('shared_by');

      // Calculate achievements for each user
      const achievements = (profiles || []).map(profile => {
        const userAnalytics = analytics?.find(a => a.telegram_id === profile.telegram_id);
        const userShares = shares?.filter(s => s.shared_by === profile.telegram_id).length || 0;
        
        const diamondsUploaded = userAnalytics?.api_calls_count || 0;
        const daysActive = profile.updated_at ? 
          Math.floor((new Date().getTime() - new Date(profile.updated_at).getTime()) / (1000 * 60 * 60 * 24)) : 0;

        // Calculate achieved badges
        const earned = ACHIEVEMENTS.filter(achievement => {
          switch (achievement.criteria.type) {
            case 'diamonds':
              return diamondsUploaded >= achievement.criteria.threshold;
            case 'activity':
              return daysActive <= achievement.criteria.threshold; // Less days = more active
            case 'shares':
              return userShares >= achievement.criteria.threshold;
            case 'referrals':
              return false; // TODO: Implement referral tracking
            default:
              return false;
          }
        });

        const totalPoints = earned.reduce((sum, a) => sum + a.points, 0);
        const level = Math.floor(totalPoints / 100) + 1;

        return {
          telegram_id: profile.telegram_id,
          name: `${profile.first_name} ${profile.last_name || ''}`.trim(),
          achievements: earned.map(a => a.id),
          points: totalPoints,
          level,
          diamonds_uploaded: diamondsUploaded,
          days_active: daysActive,
          shares_made: userShares,
          referrals: 0 // TODO: Implement referral tracking
        };
      });

      setUserAchievements(achievements.sort((a, b) => b.points - a.points));

    } catch (error) {
      console.error('Error fetching user achievements:', error);
      toast({
        title: "Error Loading Achievements",
        description: "Failed to load gamification data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const sendAchievementNotifications = async () => {
    try {
      setIsUpdating(true);

      // Get top performers to celebrate
      const topPerformers = userAchievements
        .filter(user => user.points > 100)
        .slice(0, 10);

      if (topPerformers.length === 0) {
        toast({
          title: "No Achievements to Celebrate",
          description: "No users have significant achievements yet",
          variant: "destructive",
        });
        return;
      }

      const message = `🏆 **הדירוג השבועי של BrilliantBot!** 💎

הנה המשתמשים הכי פעילים השבוע:

${topPerformers.slice(0, 5).map((user, index) => {
  const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '🏅';
  return `${medal} ${user.name} - Level ${user.level} (${user.points} נקודות)`;
}).join('\n')}

🎯 **איך להשיג נקודות:**
• העלאת יהלום ראשון: 50 נקודות
• 10 יהלומים: 200 נקודות
• שיתוף יהלום: 20 נקודות
• פעילות יומית: 10 נקודות

💰 **פרסים מיוחדים:** המשתמשים הכי פעילים יקבלו גישה מוקדמת לכלים חדשים!

בואו נמשיך להתקדם יחד! 🚀`;

      const { error } = await supabase.functions.invoke('send-bulk-acadia-message', {
        body: {
          message,
          senderName: 'BrilliantBot Team',
          senderId: 0,
          users: userAchievements.map(u => ({ 
            telegram_id: u.telegram_id, 
            name: u.name,
            diamond_count: u.diamonds_uploaded 
          })),
          testMode: false,
          campaignType: 'gamification'
        }
      });

      if (error) throw error;

      toast({
        title: "🎉 Achievement Notifications Sent!",
        description: `Gamification update sent to ${userAchievements.length} users`,
      });

    } catch (error) {
      console.error('Error sending achievement notifications:', error);
      toast({
        title: "Failed to Send Notifications",
        description: "Could not send achievement notifications",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  useEffect(() => {
    fetchUserAchievements();
  }, []);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center space-x-2">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            <span>Loading gamification data...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalActiveUsers = userAchievements.filter(u => u.points > 0).length;
  const averageLevel = userAchievements.length > 0 
    ? userAchievements.reduce((sum, u) => sum + u.level, 0) / userAchievements.length 
    : 0;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Gamification & Achievement System
          </CardTitle>
          <CardDescription>
            Track user achievements, levels, and engagement through gamification
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Overview Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-gradient-to-r from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 rounded-lg">
              <Trophy className="h-6 w-6 mx-auto mb-2 text-yellow-600" />
              <div className="text-2xl font-bold text-yellow-700">{totalActiveUsers}</div>
              <div className="text-sm text-muted-foreground">Active Players</div>
            </div>
            
            <div className="text-center p-4 bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg">
              <Star className="h-6 w-6 mx-auto mb-2 text-purple-600" />
              <div className="text-2xl font-bold text-purple-700">{averageLevel.toFixed(1)}</div>
              <div className="text-sm text-muted-foreground">Avg Level</div>
            </div>
            
            <div className="text-center p-4 bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg">
              <Gem className="h-6 w-6 mx-auto mb-2 text-green-600" />
              <div className="text-2xl font-bold text-green-700">
                {userAchievements.reduce((sum, u) => sum + u.diamonds_uploaded, 0)}
              </div>
              <div className="text-sm text-muted-foreground">Total Diamonds</div>
            </div>
            
            <div className="text-center p-4 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg">
              <Gift className="h-6 w-6 mx-auto mb-2 text-blue-600" />
              <div className="text-2xl font-bold text-blue-700">
                {userAchievements.reduce((sum, u) => sum + u.achievements.length, 0)}
              </div>
              <div className="text-sm text-muted-foreground">Achievements Earned</div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 flex-wrap">
            <Button 
              onClick={fetchUserAchievements}
              disabled={isUpdating}
              variant="outline"
            >
              <TrendingUp className="h-4 w-4 mr-2" />
              Refresh Data
            </Button>
            
            <Button 
              onClick={sendAchievementNotifications}
              disabled={isUpdating || totalActiveUsers === 0}
              className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600"
            >
              <Trophy className="h-4 w-4 mr-2" />
              {isUpdating ? 'Sending...' : 'Send Achievement Update'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Leaderboard */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5" />
            Top Performers Leaderboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {userAchievements.slice(0, 10).map((user, index) => (
              <div 
                key={user.telegram_id} 
                className={`flex items-center justify-between p-3 rounded-lg ${
                  index < 3 
                    ? 'bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20' 
                    : 'bg-muted/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="text-lg font-bold">
                    {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                  </div>
                  <div>
                    <div className="font-medium">{user.name}</div>
                    <div className="text-sm text-muted-foreground">
                      Level {user.level} • {user.diamonds_uploaded} diamonds
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{user.points} pts</Badge>
                  <div className="flex gap-1">
                    {user.achievements.slice(0, 3).map(achievementId => {
                      const achievement = ACHIEVEMENTS.find(a => a.id === achievementId);
                      return achievement ? (
                        <div key={achievementId} className="text-yellow-600" title={achievement.title}>
                          {ACHIEVEMENT_ICONS[achievement.icon]}
                        </div>
                      ) : null;
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Available Achievements */}
      <Card>
        <CardHeader>
          <CardTitle>Achievement System</CardTitle>
          <CardDescription>
            Available achievements and their requirements
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {ACHIEVEMENTS.map(achievement => {
              const usersEarned = userAchievements.filter(u => 
                u.achievements.includes(achievement.id)
              ).length;
              
              return (
                <div key={achievement.id} className="p-4 border rounded-lg">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-primary/10 rounded-full">
                      {ACHIEVEMENT_ICONS[achievement.icon]}
                    </div>
                    <div>
                      <div className="font-medium">{achievement.title}</div>
                      <div className="text-sm text-muted-foreground">
                        {achievement.points} points
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    {achievement.description}
                  </p>
                  <div className="text-xs text-muted-foreground">
                    Earned by {usersEarned} users
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}