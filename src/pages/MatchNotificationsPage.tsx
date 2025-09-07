import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useMatchNotifications } from '@/hooks/useMatchNotifications';
import { Loader2, Bell, Diamond, User, Calendar, RefreshCcw, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTelegramAuth } from '@/context/TelegramAuthContext';

export default function MatchNotificationsPage() {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading: authLoading } = useTelegramAuth();

  const { notifications, loading, error, total, refresh } = useMatchNotifications(user?.id || 609472329);

  // Show loading if still authenticating
  if (authLoading) {
    return (
      <div className="min-h-screen bg-background p-4 md:p-6">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardContent className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin mr-2" />
              <span>Authenticating...</span>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Show error if not authenticated
  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-background p-4 md:p-6">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardContent className="text-center py-8">
              <Bell className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">Authentication Required</h3>
              <p className="text-muted-foreground mb-4">
                Please open this app through Telegram to view your notifications.
              </p>
              <Button variant="outline" onClick={() => navigate('/')}>
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
    <div className="min-h-screen bg-background p-4 md:p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/')}
              className="h-8 w-8"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
                <Bell className="h-6 w-6 md:h-8 w-8" />
                Match Notifications
              </h1>
              <p className="text-muted-foreground">
                View all your diamond match notifications
              </p>
            </div>
          </div>
          <Button onClick={refresh} disabled={loading} variant="outline" size="sm">
            <RefreshCcw className="h-4 w-4 mr-2" />
            Refresh
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
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{total}</div>
                <div className="text-sm text-muted-foreground">Total Notifications</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {notifications.filter(n => n.is_match).length}
                </div>
                <div className="text-sm text-muted-foreground">Matches Found</div>
              </div>
              <div className="text-center md:col-span-1 col-span-2">
                <div className="text-2xl font-bold text-primary">{user.id}</div>
                <div className="text-sm text-muted-foreground">Your User ID</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Loading State */}
        {loading && (
          <Card>
            <CardContent className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin mr-2" />
              <span>Loading notifications...</span>
            </CardContent>
          </Card>
        )}

        {/* Error State */}
        {error && (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-destructive font-medium mb-4">Error: {error}</p>
              <Button variant="outline" onClick={refresh}>
                Try Again
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Notifications List */}
        {!loading && !error && notifications.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">
              Your Notifications ({notifications.length})
            </h2>
            
            <div className="space-y-3">
              {notifications.map((notification) => (
                <Card key={notification.id} className="w-full">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2 text-base">
                        <Diamond className="h-4 w-4" />
                        {getNotificationTitle(notification)}
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        <Badge variant={notification.is_match ? "default" : "secondary"}>
                          {notification.is_match ? "Match" : "No Match"}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {Math.round((notification.confidence_score || 0) * 100)}% confidence
                        </Badge>
                      </div>
                    </div>
                    <CardDescription className="text-sm">
                      {getNotificationDescription(notification)}
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent className="pt-0">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Diamond className="h-3 w-3" />
                        <span className="font-medium">Diamond:</span>
                        <span>{notification.diamond_id}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <User className="h-3 w-3" />
                        <span className="font-medium">Parties:</span>
                        <span>{notification.buyer_id} ↔ {notification.seller_id}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-3 w-3" />
                        <span className="font-medium">Date:</span>
                        <span>{formatDate(notification.created_at)}</span>
                      </div>
                    </div>

                    {notification.details_json && Object.keys(notification.details_json).length > 0 && (
                      <div className="mt-3 pt-3 border-t">
                        <h4 className="font-medium mb-2 text-sm">Additional Details</h4>
                        <pre className="text-xs bg-muted p-2 rounded overflow-auto max-h-20">
                          {JSON.stringify(notification.details_json, null, 2)}
                        </pre>
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
            <CardContent className="text-center py-12">
              <Bell className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">No Notifications Yet</h3>
              <p className="text-muted-foreground mb-4">
                You haven't received any match notifications yet. When matches are found for your diamonds or requests, they'll appear here.
              </p>
              <Button variant="outline" onClick={refresh}>
                Check Again
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}