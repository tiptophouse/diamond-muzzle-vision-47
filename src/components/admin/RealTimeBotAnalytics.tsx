import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Json } from '@/integrations/supabase/types';

interface BotUsageData {
  id: string;
  telegram_id: number;
  bot_token_type: string;
  command: string | null;
  message_type: string;
  chat_type: string;
  user_info: Json;
  response_time_ms: number;
  created_at: string;
}

interface BotSummary {
  total_messages_today: number;
  unique_users_today: number;
  commands_used_today: number;
  avg_response_time_ms: number;
  most_used_commands: Json;
  active_chats: number;
  bot_distribution: Json;
}

export function RealTimeBotAnalytics() {
  const [recentActivity, setRecentActivity] = useState<BotUsageData[]>([]);
  const [summary, setSummary] = useState<BotSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Load initial data
    loadBotAnalytics();
    loadBotSummary();

    // Set up real-time subscription
    const channel = supabase
      .channel('bot-usage-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'bot_usage_analytics'
        },
        (payload) => {
          console.log('📊 New bot usage:', payload);
          const newUsage = payload.new as BotUsageData;
          
          setRecentActivity(prev => [newUsage, ...prev.slice(0, 19)]); // Keep last 20
          loadBotSummary(); // Refresh summary
          
          // Show toast for important commands
          if (newUsage.command) {
            toast({
              title: "🤖 Bot Command Used",
              description: `${(newUsage.user_info as any)?.first_name} used ${newUsage.command}`,
              duration: 3000,
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [toast]);

  const loadBotAnalytics = async () => {
    try {
      const { data, error } = await supabase
        .from('bot_usage_analytics')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setRecentActivity(data || []);
    } catch (error) {
      console.error('❌ Error loading bot analytics:', error);
    }
  };

  const loadBotSummary = async () => {
    try {
      const { data, error } = await supabase.rpc('get_bot_usage_summary');
      
      if (error) throw error;
      if (data && data.length > 0) {
        setSummary(data[0]);
      }
    } catch (error) {
      console.error('❌ Error loading bot summary:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getMessageTypeColor = (type: string) => {
    switch (type) {
      case 'command': return 'bg-blue-100 text-blue-800';
      case 'text': return 'bg-green-100 text-green-800';
      case 'callback': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getBotTypeColor = (type: string) => {
    switch (type) {
      case 'main': return 'bg-primary/10 text-primary';
      case 'clients': return 'bg-orange-100 text-orange-800';
      case 'sellers': return 'bg-cyan-100 text-cyan-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-2">
              <div className="h-4 bg-muted rounded w-3/4"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-muted rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      {summary && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Messages Today</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.total_messages_today}</div>
              <p className="text-xs text-muted-foreground">
                From {summary.unique_users_today} users
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Commands Used</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.commands_used_today}</div>
              <p className="text-xs text-muted-foreground">
                Avg response: {Math.round(summary.avg_response_time_ms)}ms
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Active Chats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.active_chats}</div>
              <p className="text-xs text-muted-foreground">
                Unique conversations
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Bot Distribution</CardTitle>
            </CardHeader>
            <CardContent>
            <div className="space-y-1">
              {summary.bot_distribution && typeof summary.bot_distribution === 'object' && 
                Object.entries(summary.bot_distribution as Record<string, any>).map(([bot, count]) => (
                  <div key={bot} className="flex justify-between text-sm">
                    <span className="capitalize">{bot}</span>
                    <span className="font-medium">{count as number}</span>
                  </div>
                ))
              }
            </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Popular Commands */}
      {summary?.most_used_commands && Array.isArray(summary.most_used_commands) && summary.most_used_commands.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Most Used Commands Today</CardTitle>
            <CardDescription>Top commands by usage frequency</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {(summary.most_used_commands as any[]).map((cmd: any, index: number) => (
                <Badge key={index} variant="secondary" className="text-sm">
                  {cmd.command} ({cmd.count})
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Real-time Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Real-time Bot Activity</CardTitle>
          <CardDescription>Live updates of bot interactions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivity.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No recent bot activity
              </p>
            ) : (
              recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center justify-between p-3 rounded-lg border bg-card">
                  <div className="flex items-center space-x-3">
                    <div className="flex flex-col">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">
                          {(activity.user_info as any)?.first_name || 'Unknown User'}
                        </span>
                        <Badge className={getBotTypeColor(activity.bot_token_type)}>
                          {activity.bot_token_type}
                        </Badge>
                        <Badge className={getMessageTypeColor(activity.message_type)}>
                          {activity.message_type}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {activity.command || 'Text message'} • {activity.chat_type}
                        {activity.response_time_ms && (
                          <span> • {activity.response_time_ms}ms</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-muted-foreground">
                      {new Date(activity.created_at).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}