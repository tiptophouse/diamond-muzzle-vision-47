import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Clock, TrendingUp, Users, Target, Bell, BarChart3, Calendar, Award } from 'lucide-react';
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { useToast } from '@/hooks/use-toast';

interface EngagementMetrics {
  dailyGoal: number;
  currentStreak: number;
  timeSpent: number;
  actionsCompleted: number;
  level: number;
  xp: number;
  nextLevelXp: number;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  progress?: number;
  maxProgress?: number;
}

export default function EngagementDashboard() {
  const { user } = useTelegramAuth();
  const { toast } = useToast();
  const [metrics, setMetrics] = useState<EngagementMetrics>({
    dailyGoal: 30,
    currentStreak: 3,
    timeSpent: 24,
    actionsCompleted: 12,
    level: 5,
    xp: 1250,
    nextLevelXp: 1500
  });

  const [achievements] = useState<Achievement[]>([
    {
      id: 'first_upload',
      title: 'Diamond Discoverer',
      description: 'Upload your first diamond',
      icon: '💎',
      unlocked: true
    },
    {
      id: 'streak_7',
      title: 'Weekly Warrior',
      description: 'Maintain a 7-day streak',
      icon: '🔥',
      unlocked: false,
      progress: 3,
      maxProgress: 7
    },
    {
      id: 'inventory_100',
      title: 'Collection Master',
      description: 'Add 100 diamonds to inventory',
      icon: '🏆',
      unlocked: false,
      progress: 45,
      maxProgress: 100
    },
    {
      id: 'social_sharer',
      title: 'Social Butterfly',
      description: 'Share 10 diamonds',
      icon: '🦋',
      unlocked: false,
      progress: 7,
      maxProgress: 10
    }
  ]);

  const [dailyTasks] = useState([
    { id: 1, task: 'Check market insights', completed: true, xp: 50 },
    { id: 2, task: 'Upload a new diamond', completed: true, xp: 100 },
    { id: 3, task: 'Share a diamond', completed: false, xp: 75 },
    { id: 4, task: 'Update inventory', completed: false, xp: 50 },
    { id: 5, task: 'Review analytics', completed: false, xp: 80 }
  ]);

  const completedTasks = dailyTasks.filter(task => task.completed).length;
  const totalTasks = dailyTasks.length;
  const dailyProgress = (completedTasks / totalTasks) * 100;

  const sendEngagementNotification = async (type: string, message: string) => {
    if (user?.id) {
      // This would call the Telegram notification API
      toast({
        title: "Notification Sent!",
        description: `${type}: ${message}`,
      });
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Engagement Hub</h1>
          <p className="text-muted-foreground">
            Track your progress and stay motivated
          </p>
        </div>
        <Badge variant="secondary" className="text-lg px-4 py-2">
          Level {metrics.level}
        </Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="hover-scale">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Daily Progress</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedTasks}/{totalTasks}</div>
            <Progress value={dailyProgress} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {Math.round(dailyProgress)}% complete
            </p>
          </CardContent>
        </Card>

        <Card className="hover-scale">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.currentStreak} days</div>
            <p className="text-xs text-muted-foreground">
              Keep going! 🔥
            </p>
          </CardContent>
        </Card>

        <Card className="hover-scale">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Time Spent</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.timeSpent}m</div>
            <p className="text-xs text-muted-foreground">
              Today's session
            </p>
          </CardContent>
        </Card>

        <Card className="hover-scale">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">XP Progress</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.xp}</div>
            <Progress 
              value={(metrics.xp / metrics.nextLevelXp) * 100} 
              className="mt-2" 
            />
            <p className="text-xs text-muted-foreground mt-1">
              {metrics.nextLevelXp - metrics.xp} XP to level {metrics.level + 1}
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="tasks" className="space-y-4">
        <TabsList>
          <TabsTrigger value="tasks">Daily Tasks</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="tasks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Today's Tasks</CardTitle>
              <CardDescription>
                Complete tasks to earn XP and maintain your streak
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {dailyTasks.map((task) => (
                <div 
                  key={task.id}
                  className={`flex items-center justify-between p-3 rounded-lg border transition-all ${
                    task.completed 
                      ? 'bg-muted/50 opacity-75' 
                      : 'hover:bg-muted/20 cursor-pointer'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-4 h-4 rounded-full border-2 ${
                      task.completed 
                        ? 'bg-primary border-primary' 
                        : 'border-muted-foreground'
                    }`} />
                    <span className={task.completed ? 'line-through' : ''}>
                      {task.task}
                    </span>
                  </div>
                  <Badge variant={task.completed ? 'secondary' : 'default'}>
                    +{task.xp} XP
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="achievements" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {achievements.map((achievement) => (
              <Card 
                key={achievement.id}
                className={`transition-all ${
                  achievement.unlocked 
                    ? 'bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20' 
                    : 'opacity-75'
                }`}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{achievement.icon}</span>
                      <div>
                        <CardTitle className="text-lg">{achievement.title}</CardTitle>
                        <CardDescription>{achievement.description}</CardDescription>
                      </div>
                    </div>
                    {achievement.unlocked && (
                      <Badge className="bg-primary">Unlocked!</Badge>
                    )}
                  </div>
                </CardHeader>
                {achievement.progress !== undefined && (
                  <CardContent>
                    <Progress 
                      value={(achievement.progress! / achievement.maxProgress!) * 100} 
                      className="mb-2"
                    />
                    <p className="text-sm text-muted-foreground">
                      {achievement.progress}/{achievement.maxProgress}
                    </p>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Weekly Report</CardTitle>
                <CardDescription>Your activity this week</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Sessions:</span>
                  <span className="font-medium">15</span>
                </div>
                <div className="flex justify-between">
                  <span>Average time:</span>
                  <span className="font-medium">32 minutes</span>
                </div>
                <div className="flex justify-between">
                  <span>Actions completed:</span>
                  <span className="font-medium">89</span>
                </div>
                <Button 
                  className="w-full mt-4"
                  onClick={() => sendEngagementNotification(
                    "Weekly Report", 
                    "Check out your weekly progress!"
                  )}
                >
                  <Bell className="w-4 h-4 mr-2" />
                  Share Weekly Report
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Engagement Boost</CardTitle>
                <CardDescription>Get back in the game</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => sendEngagementNotification(
                    "Reminder", 
                    "You haven't uploaded any diamonds today!"
                  )}
                >
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Send Upload Reminder
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => sendEngagementNotification(
                    "Market Update", 
                    "New market trends available for your diamonds!"
                  )}
                >
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Market Insights Alert
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => sendEngagementNotification(
                    "Social", 
                    "Your friends are active! Join them now."
                  )}
                >
                  <Users className="w-4 h-4 mr-2" />
                  Social Activity Push
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}