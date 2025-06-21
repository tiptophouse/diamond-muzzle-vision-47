
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useNotifications } from '@/hooks/useNotifications';
import { Bell, Search, Diamond, Mail, Check } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function NotificationsPage() {
  const { notifications, isLoading, markAsRead } = useNotifications();

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'search_alert':
        return <Search className="h-4 w-4" />;
      case 'diamond_match':
        return <Diamond className="h-4 w-4" />;
      case 'message':
        return <Mail className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'search_alert':
        return 'bg-blue-500';
      case 'diamond_match':
        return 'bg-diamond-500';
      case 'message':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  if (isLoading) {
    return (
      <Layout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
          </div>
          <div className="grid gap-4">
            {[...Array(5)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
            <p className="text-muted-foreground">
              Stay updated with customer searches and diamond matches
            </p>
          </div>
          {unreadCount > 0 && (
            <Badge variant="secondary" className="bg-diamond-100 text-diamond-700">
              {unreadCount} unread
            </Badge>
          )}
        </div>

        {notifications.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Bell className="h-12 w-12 text-muted-foreground mb-4" />
              <CardTitle className="text-xl mb-2">No notifications yet</CardTitle>
              <CardDescription className="text-center max-w-md">
                You'll receive notifications here when customers search for diamonds similar to your inventory, 
                when you get new leads, or when there are system updates.
              </CardDescription>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {notifications.map((notification) => (
              <Card 
                key={notification.id} 
                className={`transition-all duration-200 hover:shadow-md ${
                  !notification.read ? 'ring-2 ring-diamond-200 bg-diamond-50/50' : ''
                }`}
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className={`p-2 rounded-full ${getNotificationColor(notification.type)} text-white`}>
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-semibold text-foreground">{notification.title}</h3>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">
                            {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                          </span>
                          {!notification.read && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => markAsRead(notification.id)}
                              className="h-8 w-8 p-0"
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                      <p className="text-muted-foreground">{notification.message}</p>
                      
                      {notification.data && (
                        <div className="mt-3 p-3 bg-muted rounded-lg">
                          <div className="text-sm">
                            {notification.type === 'search_alert' && notification.data.search_query && (
                              <div>
                                <span className="font-medium">Search details: </span>
                                {Object.entries(notification.data.search_query).map(([key, value]) => (
                                  <span key={key} className="mr-2">
                                    {key}: {String(value)}
                                  </span>
                                ))}
                              </div>
                            )}
                            {notification.data.customer_info && (
                              <div className="mt-1">
                                <span className="font-medium">Customer: </span>
                                {notification.data.customer_info.name || 'Anonymous'}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
