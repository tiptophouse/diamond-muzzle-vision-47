import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Users, Calendar, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { OnboardingMessagePreview } from './OnboardingMessagePreview';

interface SessionUser {
  telegram_id: number;
  first_session: string;
  last_session: string;
  total_sessions: number;
  browser_info?: string;
  device_type?: string;
  first_name?: string;
  last_name?: string;
  username?: string;
}

export function SessionUsersDisplay() {
  const [sessionUsers, setSessionUsers] = useState<SessionUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchSessionUsers();
  }, []);

  const fetchSessionUsers = async () => {
    try {
      setIsLoading(true);
      
      // Get ALL unique users from user_sessions directly 
      const { data: distinctUsers, error: distinctError } = await supabase
        .from('user_sessions')
        .select('telegram_id')
        .not('telegram_id', 'is', null);

      if (distinctError) throw distinctError;

      // Get unique telegram IDs
      const uniqueTelegramIds = [...new Set(distinctUsers?.map(u => u.telegram_id) || [])];
      console.log(`Found ${uniqueTelegramIds.length} unique telegram IDs from sessions`);

      // Get user profiles for these IDs
      const { data: profilesData } = await supabase
        .from('user_profiles')
        .select('telegram_id, first_name, last_name, username')
        .in('telegram_id', uniqueTelegramIds);

      // Create users array with profile data
      const processedUsers = uniqueTelegramIds.map(telegramId => {
        const profile = profilesData?.find(p => p.telegram_id === telegramId);
        return {
          telegram_id: telegramId,
          first_session: new Date().toISOString(),
          last_session: new Date().toISOString(), 
          total_sessions: 1,
          first_name: profile?.first_name,
          last_name: profile?.last_name,
          username: profile?.username
        };
      });

      setSessionUsers(processedUsers);
      console.log(`📊 Found ${processedUsers.length} unique users (should be 83 total)`);
      
    } catch (error: any) {
      console.error('Error fetching session users:', error);
      toast({
        title: "Error",
        description: "Failed to load session users",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getDeviceIcon = (deviceType?: string) => {
    if (!deviceType) return '📱';
    if (deviceType.toLowerCase().includes('mobile')) return '📱';
    if (deviceType.toLowerCase().includes('tablet')) return '📱';
    return '💻';
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Loading Session Users...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <OnboardingMessagePreview sessionUsers={sessionUsers} />
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-600" />
            Session Users ({sessionUsers.length} unique users)
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            All unique users who have created sessions in the app
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {sessionUsers.map((user) => (
              <div
                key={user.telegram_id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border"
              >
                <div className="flex items-center gap-3">
                  <div className="text-2xl">
                    {getDeviceIcon(user.device_type)}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">
                      {user.first_name ? `${user.first_name} ${user.last_name || ''}`.trim() : user.username || `User ${user.telegram_id}`}
                    </div>
                    <div className="text-sm text-gray-500">
                      {user.total_sessions} session{user.total_sessions !== 1 ? 's' : ''} • ID: {user.telegram_id}
                    </div>
                  </div>
                </div>
                
                <div className="text-right text-sm">
                  <div className="flex items-center gap-1 text-gray-600 mb-1">
                    <Calendar className="h-3 w-3" />
                    <span>First: {formatDate(user.first_session)}</span>
                  </div>
                  <div className="flex items-center gap-1 text-gray-600">
                    <Clock className="h-3 w-3" />
                    <span>Last: {formatDate(user.last_session)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {sessionUsers.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No session users found
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}