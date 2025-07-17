import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { Users, Calendar, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface SessionUser {
  telegram_id: number;
  first_session: string;
  last_session: string;
  total_sessions: number;
  browser_info?: string;
  device_type?: string;
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
      
      // Get unique users from user_sessions with aggregated data
      const { data, error } = await supabase
        .from('user_sessions')
        .select(`
          telegram_id,
          session_start,
          browser_info,
          device_type,
          is_active
        `)
        .order('session_start', { ascending: false });

      if (error) throw error;

      // Process data to get unique users with stats
      const userMap = new Map<number, SessionUser>();
      
      data?.forEach(session => {
        const existingUser = userMap.get(session.telegram_id);
        
        if (existingUser) {
          existingUser.total_sessions += 1;
          if (session.session_start < existingUser.first_session) {
            existingUser.first_session = session.session_start;
          }
          if (session.session_start > existingUser.last_session) {
            existingUser.last_session = session.session_start;
            existingUser.browser_info = session.browser_info;
            existingUser.device_type = session.device_type;
          }
        } else {
          userMap.set(session.telegram_id, {
            telegram_id: session.telegram_id,
            first_session: session.session_start,
            last_session: session.session_start,
            total_sessions: 1,
            browser_info: session.browser_info,
            device_type: session.device_type
          });
        }
      });

      const uniqueUsers = Array.from(userMap.values())
        .sort((a, b) => new Date(b.last_session).getTime() - new Date(a.last_session).getTime());

      setSessionUsers(uniqueUsers);
      
      console.log(`📊 Found ${uniqueUsers.length} unique users from sessions`);
      
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
                    User {user.telegram_id}
                  </div>
                  <div className="text-sm text-gray-500">
                    {user.total_sessions} session{user.total_sessions !== 1 ? 's' : ''}
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
  );
}