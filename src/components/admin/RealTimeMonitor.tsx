import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Activity, 
  MessageSquare, 
  Users, 
  Zap,
  CheckCircle,
  XCircle,
  RefreshCw,
  TrendingUp,
  Calendar
} from 'lucide-react';
import { useBotAnalytics } from '@/hooks/useBotAnalytics';
import { useUserDiamondCounts } from '@/hooks/admin/useUserDiamondCounts';
import { supabase } from '@/integrations/supabase/client';

interface SystemStatus {
  webhook: 'active' | 'inactive' | 'error';
  database: 'connected' | 'disconnected' | 'error';
  messaging: 'operational' | 'limited' | 'down';
  lastUpdate: Date;
}

export function RealTimeMonitor() {
  const { recentActivity, summary, isLoading, isConnected, refreshData } = useBotAnalytics();
  const { stats, loading: userStatsLoading } = useUserDiamondCounts();
  const [systemStatus, setSystemStatus] = useState<SystemStatus>({
    webhook: 'inactive',
    database: 'connected',
    messaging: 'operational',
    lastUpdate: new Date()
  });
  const [recentNotifications, setRecentNotifications] = useState([]);

  useEffect(() => {
    // Check system status every 30 seconds
    const statusInterval = setInterval(checkSystemStatus, 30000);
    checkSystemStatus();

    // Load recent notifications
    loadRecentNotifications();

    return () => clearInterval(statusInterval);
  }, []);

  const checkSystemStatus = async () => {
    const newStatus = { ...systemStatus };
    
    // Check webhook status based on recent bot activity
    const recentActivityCount = recentActivity.length;
    newStatus.webhook = recentActivityCount > 0 ? 'active' : 'inactive';
    
    // Database is connected if we can load data
    newStatus.database = isConnected ? 'connected' : 'disconnected';
    
    // Messaging status based on recent notifications
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('created_at')
        .gte('created_at', new Date(Date.now() - 60 * 60 * 1000).toISOString())
        .limit(1);
      
      newStatus.messaging = !error && data?.length > 0 ? 'operational' : 'limited';
    } catch {
      newStatus.messaging = 'down';
    }
    
    newStatus.lastUpdate = new Date();
    setSystemStatus(newStatus);
  };

  const loadRecentNotifications = async () => {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (!error) {
        setRecentNotifications(data || []);
      }
    } catch (error) {
      console.error('Error loading recent notifications:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
      case 'connected':
      case 'operational':
        return 'text-green-600 bg-green-100 dark:bg-green-900';
      case 'inactive':
      case 'limited':
        return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900';
      case 'error':
      case 'disconnected':
      case 'down':
        return 'text-red-600 bg-red-100 dark:bg-red-900';
      default:
        return 'text-gray-600 bg-gray-100 dark:bg-gray-900';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
      case 'connected':
      case 'operational':
        return <CheckCircle className="h-4 w-4" />;
      case 'inactive':
      case 'limited':
        return <RefreshCw className="h-4 w-4" />;
      case 'error':
      case 'disconnected':
      case 'down':
        return <XCircle className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* System Status Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Real-Time System Monitor
          </CardTitle>
          <CardDescription className="flex items-center gap-2">
            Live monitoring of bot activity and system health
            <Badge className={isConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
              {isConnected ? 'CONNECTED' : 'DISCONNECTED'}
            </Badge>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="p-3 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                {getStatusIcon(systemStatus.webhook)}
                <span className="font-medium">Webhook Status</span>
              </div>
              <Badge className={getStatusColor(systemStatus.webhook)}>
                {systemStatus.webhook.toUpperCase()}
              </Badge>
            </div>
            
            <div className="p-3 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                {getStatusIcon(systemStatus.database)}
                <span className="font-medium">Database</span>
              </div>
              <Badge className={getStatusColor(systemStatus.database)}>
                {systemStatus.database.toUpperCase()}
              </Badge>
            </div>
            
            <div className="p-3 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                {getStatusIcon(systemStatus.messaging)}
                <span className="font-medium">Messaging</span>
              </div>
              <Badge className={getStatusColor(systemStatus.messaging)}>
                {systemStatus.messaging.toUpperCase()}
              </Badge>
            </div>
          </div>
          
          <div className="flex justify-between items-center">
            <div className="text-sm text-muted-foreground">
              Last updated: {systemStatus.lastUpdate.toLocaleTimeString()}
            </div>
            <Button onClick={refreshData} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Live Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <MessageSquare className="h-5 w-5 text-blue-600" />
              <span className="text-sm font-medium">Messages Today</span>
            </div>
            <div className="text-2xl font-bold">
              {summary?.total_messages_today || 0}
            </div>
            <div className="text-xs text-muted-foreground">
              Bot messages received
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-5 w-5 text-green-600" />
              <span className="text-sm font-medium">Active Users</span>
            </div>
            <div className="text-2xl font-bold">
              {summary?.unique_users_today || 0}
            </div>
            <div className="text-xs text-muted-foreground">
              Unique users today
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="h-5 w-5 text-purple-600" />
              <span className="text-sm font-medium">Commands</span>
            </div>
            <div className="text-2xl font-bold">
              {summary?.commands_used_today || 0}
            </div>
            <div className="text-xs text-muted-foreground">
              Commands processed
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-5 w-5 text-orange-600" />
              <span className="text-sm font-medium">Response Time</span>
            </div>
            <div className="text-2xl font-bold">
              {Math.round(summary?.avg_response_time_ms || 0)}ms
            </div>
            <div className="text-xs text-muted-foreground">
              Average response
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Recent Bot Activity
            </CardTitle>
            <CardDescription>
              Latest messages and interactions
            </CardDescription>
          </CardHeader>
          <CardContent>
            {recentActivity.length > 0 ? (
              <div className="space-y-3">
                {recentActivity.slice(0, 5).map((activity, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                    <MessageSquare className="h-4 w-4 text-blue-600 mt-1" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium">
                          {activity.message_type}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {activity.chat_type}
                        </Badge>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        User {activity.telegram_id} • {activity.response_time_ms}ms
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(activity.created_at).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No recent bot activity</p>
                <p className="text-xs">Webhook may not be receiving messages</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Recent Notifications
            </CardTitle>
            <CardDescription>
              Messages sent to users today
            </CardDescription>
          </CardHeader>
          <CardContent>
            {recentNotifications.length > 0 ? (
              <div className="space-y-3">
                {recentNotifications.slice(0, 5).map((notification: any, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                    <Zap className="h-4 w-4 text-green-600 mt-1" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium">
                          {notification.message_type}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {notification.status}
                        </Badge>
                      </div>
                      <div className="text-xs text-muted-foreground truncate">
                        {notification.message_content}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(notification.created_at).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No recent notifications</p>
                <p className="text-xs">No messages sent today</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}