import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useMatchNotifications } from '@/hooks/useMatchNotifications';
import { Loader2, Bell, Diamond, User, Calendar, RefreshCcw, ArrowLeft } from 'lucide-react';
import { MobileLoading } from '@/components/ui/mobile-loading';
import { useNavigate } from 'react-router-dom';
import { useTelegramAuth } from '@/context/TelegramAuthContext';

export default function MatchNotificationsPage() {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading: authLoading } = useTelegramAuth();

  const { notifications, loading, error, total, refresh } = useMatchNotifications(user?.id || 0);

  // Show loading if still authenticating
  if (authLoading) {
    return (
      <div className="min-h-screen bg-background p-2 md:p-6 pb-safe">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardContent className="p-4 md:p-6">
              <MobileLoading text="Authenticating..." />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Show error if not authenticated
  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-background p-2 md:p-6 pb-safe">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardContent className="text-center py-6 md:py-8 px-4">
              <Bell className="h-10 w-10 md:h-12 md:w-12 mx-auto mb-3 md:mb-4 text-muted-foreground" />
              <h3 className="text-base md:text-lg font-medium mb-2">Authentication Required</h3>
              <p className="text-muted-foreground mb-4 text-sm md:text-base">
                Please open this app through Telegram to view your notifications.
              </p>
              <Button variant="outline" onClick={() => navigate('/')} className="mobile-tap">
                Go Home
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getNotificationTitle = (notification: any) => {
    return notification.is_match ? 'New Match Found!' : 'No Match Found';
  };

  const getNotificationDescription = (notification: any) => {
    const role = notification.buyer_id === user.id ? 'buyer' : 'seller';
    const otherParty = role === 'buyer' ? notification.seller_id : notification.buyer_id;
    
    if (notification.is_match) {
      return `Great news! Diamond ${notification.diamond_id} matched with ${role === 'buyer' ? 'seller' : 'buyer'} ${otherParty}`;
    } else {
      return `Diamond ${notification.diamond_id} was checked but didn't match requirements`;
    }
  };

  return (
    <div className="min-h-screen bg-background p-2 md:p-6 pb-safe">
      <div className="max-w-4xl mx-auto space-y-4 md:space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 md:gap-4 min-w-0 flex-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/')}
              className="h-9 w-9 md:h-8 md:w-8 flex-shrink-0"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="min-w-0 flex-1">
              <h1 className="text-xl md:text-2xl lg:text-3xl font-bold flex items-center gap-2 truncate">
                <Bell className="h-5 w-5 md:h-6 md:w-6 lg:h-8 lg:w-8 flex-shrink-0" />
                <span className="truncate">Notifications</span>
              </h1>
              <p className="text-muted-foreground text-sm hidden md:block">
                View all your diamond match notifications
              </p>
            </div>
          </div>
          <Button onClick={refresh} disabled={loading} variant="outline" size="sm" className="mobile-tap flex-shrink-0">
            <RefreshCcw className="h-4 w-4 mr-1 md:mr-2" />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
        </div>

        {/* Stats Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Diamond className="h-5 w-5" />
              Notifications Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 md:p-6">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
              <div className="text-center">
                <div className="text-xl md:text-2xl font-bold text-primary">{total}</div>
                <div className="text-xs md:text-sm text-muted-foreground">Total</div>
              </div>
              <div className="text-center">
                <div className="text-xl md:text-2xl font-bold text-green-600">
                  {notifications.filter(n => n.is_match).length}
                </div>
                <div className="text-xs md:text-sm text-muted-foreground">Matches</div>
              </div>
              <div className="text-center col-span-2 md:col-span-1">
                <div className="text-lg md:text-2xl font-bold text-primary truncate">{user.id}</div>
                <div className="text-xs md:text-sm text-muted-foreground">User ID</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Loading State */}
        {loading && (
          <Card>
            <CardContent className="p-4 md:p-6">
              <MobileLoading text="Loading notifications..." />
            </CardContent>
          </Card>
        )}

        {/* Error State */}
        {error && (
          <Card>
            <CardContent className="text-center py-6 md:py-8 px-4">
              <p className="text-destructive font-medium mb-4 text-sm md:text-base break-words">Error: {error}</p>
              <Button variant="outline" onClick={refresh} className="mobile-tap">
                Try Again
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Notifications List */}
        {!loading && !error && notifications.length > 0 && (
          <div className="space-y-3 md:space-y-4">
            <h2 className="text-lg md:text-xl font-semibold px-1">
              Your Notifications ({notifications.length})
            </h2>
            
            <div className="space-y-2 md:space-y-3">
              {notifications.map((notification) => (
                <Card key={notification.id} className="w-full mobile-tap">
                  <CardHeader className="pb-2 md:pb-3 p-3 md:p-6">
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="flex items-center gap-2 text-sm md:text-base min-w-0 flex-1">
                        <Diamond className="h-4 w-4 flex-shrink-0" />
                        <span className="truncate">{getNotificationTitle(notification)}</span>
                      </CardTitle>
                      <div className="flex flex-col sm:flex-row items-end sm:items-center gap-1 sm:gap-2 flex-shrink-0">
                        <Badge variant={notification.is_match ? "default" : "secondary"} className="text-xs">
                          {notification.is_match ? "Match" : "No Match"}
                        </Badge>
                        <Badge variant="outline" className="text-xs whitespace-nowrap">
                          {Math.round((notification.confidence_score || 0) * 100)}%
                        </Badge>
                      </div>
                    </div>
                    <CardDescription className="text-xs md:text-sm mt-1">
                      {getNotificationDescription(notification)}
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent className="pt-0 p-3 md:p-6 md:pt-0">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-4 text-xs md:text-sm">
                      <div className="flex items-center gap-2 min-w-0">
                        <Diamond className="h-3 w-3 flex-shrink-0" />
                        <span className="font-medium flex-shrink-0">Diamond:</span>
                        <span className="truncate">{notification.diamond_id}</span>
                      </div>
                      <div className="flex items-center gap-2 min-w-0">
                        <User className="h-3 w-3 flex-shrink-0" />
                        <span className="font-medium flex-shrink-0">Parties:</span>
                        <span className="truncate">{notification.buyer_id} ↔ {notification.seller_id}</span>
                      </div>
                      <div className="flex items-center gap-2 min-w-0 col-span-1 sm:col-span-2 lg:col-span-1">
                        <Calendar className="h-3 w-3 flex-shrink-0" />
                        <span className="font-medium flex-shrink-0">Date:</span>
                        <span className="truncate">{formatDate(notification.created_at)}</span>
                      </div>
                    </div>

                    {notification.details_json && Object.keys(notification.details_json).length > 0 && (
                      <div className="mt-3 pt-3 border-t">
                        <h4 className="font-medium mb-2 text-xs md:text-sm">Additional Details</h4>
                        <div className="text-xs bg-muted p-2 rounded overflow-auto max-h-16 md:max-h-20">
                          <pre className="whitespace-pre-wrap break-words">
                            {JSON.stringify(notification.details_json, null, 2)}
                          </pre>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && notifications.length === 0 && (
          <Card>
            <CardContent className="text-center py-8 md:py-12 px-4">
              <Bell className="h-10 w-10 md:h-12 md:w-12 mx-auto mb-3 md:mb-4 text-muted-foreground" />
              <h3 className="text-base md:text-lg font-medium mb-2">No Notifications Yet</h3>
              <p className="text-muted-foreground mb-4 text-sm md:text-base">
                You haven't received any match notifications yet. When matches are found for your diamonds or requests, they'll appear here.
              </p>
              <Button variant="outline" onClick={refresh} className="mobile-tap">
                Check Again
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}