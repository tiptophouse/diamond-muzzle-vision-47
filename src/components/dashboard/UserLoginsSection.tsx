
import { useState } from 'react';
import { useUserLogins } from '@/hooks/useUserLogins';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Users, Clock, RefreshCw, Eye, UserCheck } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export function UserLoginsSection() {
  const { userLogins, detailedLogins, isLoading, refreshLogins } = useUserLogins();
  const [showDetails, setShowDetails] = useState(false);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            User Logins
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

  const totalUsers = userLogins.length;
  const totalLogins = userLogins.reduce((sum, user) => sum + user.login_count, 0);
  const recentLogins = userLogins.filter(user => {
    const lastLogin = new Date(user.last_login);
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    return lastLogin > oneDayAgo;
  }).length;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              User Login Tracking
            </CardTitle>
            <CardDescription>
              Monitor all users who log into your application
            </CardDescription>
          </div>
          <Button onClick={refreshLogins} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Stats Summary */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{totalUsers}</div>
            <div className="text-sm text-blue-700">Total Users</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{totalLogins}</div>
            <div className="text-sm text-green-700">Total Logins</div>
          </div>
          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <div className="text-2xl font-bold text-orange-600">{recentLogins}</div>
            <div className="text-sm text-orange-700">Last 24h</div>
          </div>
        </div>

        <Tabs defaultValue="summary" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="summary">User Summary</TabsTrigger>
            <TabsTrigger value="detailed">Recent Activity</TabsTrigger>
          </TabsList>
          
          <TabsContent value="summary">
            <ScrollArea className="h-[400px]">
              <div className="space-y-3">
                {userLogins.map((user) => (
                  <div key={user.telegram_id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <UserCheck className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <div className="font-medium">
                          {user.first_name} {user.last_name}
                          {user.username && (
                            <span className="text-sm text-gray-500 ml-2">@{user.username}</span>
                          )}
                        </div>
                        <div className="text-sm text-gray-500">
                          ID: {user.telegram_id}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">
                        {formatDistanceToNow(new Date(user.last_login), { addSuffix: true })}
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {user.login_count} login{user.login_count !== 1 ? 's' : ''}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="detailed">
            <ScrollArea className="h-[400px]">
              <div className="space-y-3">
                {detailedLogins.map((login) => (
                  <div key={login.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <Clock className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <div className="font-medium">
                          {login.first_name} {login.last_name}
                          {login.username && (
                            <span className="text-sm text-gray-500 ml-2">@{login.username}</span>
                          )}
                        </div>
                        <div className="text-xs text-gray-500">
                          {login.telegram_id} • {login.language_code} 
                          {login.is_premium && <Badge variant="secondary" className="ml-2 text-xs">Premium</Badge>}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm">
                        {formatDistanceToNow(new Date(login.login_timestamp), { addSuffix: true })}
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(login.login_timestamp).toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
