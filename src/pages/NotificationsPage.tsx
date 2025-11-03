import React, { useState, useMemo, useCallback } from 'react';
import { TelegramMiniAppLayout } from '@/components/layout/TelegramMiniAppLayout';
import { PremiumNotificationCard } from '@/components/notifications/PremiumNotificationCard';
import { EnhancedContactDialog } from '@/components/notifications/EnhancedContactDialog';
import { useFastApiNotifications } from '@/hooks/useFastApiNotifications';
import { useNotifications as useDbNotifications } from '@/hooks/useNotifications';
import { useTelegramNotificationBridge } from '@/hooks/useTelegramNotificationBridge';
import { useNotificationRealtimeUpdates } from '@/hooks/useNotificationRealtimeUpdates';
import { usePullToRefresh } from '@/hooks/usePullToRefresh';
import { useTelegramHapticFeedback } from '@/hooks/useTelegramHapticFeedback';
import { toast } from 'sonner';
import { 
  Bell, 
  RefreshCw, 
  TrendingUp, 
  Zap,
  Filter,
  CheckCheck,
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';

const NotificationsPage = () => {
  const { notifications, isLoading, markAsRead, refetch } = useFastApiNotifications();
  const { notifications: dbNotifications, isLoading: isLoadingDb, markAsRead: markAsReadDb, refetch: refetchDb } = useDbNotifications();
  const haptic = useTelegramHapticFeedback();
  
  const [selectedNotification, setSelectedNotification] = useState<any>(null);
  const [showContactDialog, setShowContactDialog] = useState(false);
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'sent'>('all');

  // Use FastAPI notifications if available, fallback to DB
  const hasFast = notifications.length > 0;
  const displayNotifications = hasFast ? notifications : dbNotifications;
  const displayIsLoading = hasFast ? isLoading : isLoadingDb;
  const markAsReadHandler = hasFast ? markAsRead : markAsReadDb;
  
  const refetchAll = useCallback(async () => {
    await Promise.all([refetch(), refetchDb()]);
  }, [refetch, refetchDb]);

  // Initialize bridges
  useTelegramNotificationBridge();

  // Pull-to-refresh
  const { isRefreshing, pullDistance, isPulling } = usePullToRefresh({
    onRefresh: refetchAll,
    threshold: 80,
  });

  // Real-time updates
  useNotificationRealtimeUpdates({
    onNewNotification: () => {
      refetchAll();
    }
  });

  // Group notifications by buyer
  const groupedNotifications = useMemo(() => {
    const groups = new Map<number, any>();
    
    displayNotifications
      .filter(n => n.type === 'diamond_match' && n.data?.searcher_info?.telegram_id)
      .forEach(notif => {
        const buyerId = notif.data.searcher_info.telegram_id;
        
        if (!groups.has(buyerId)) {
          groups.set(buyerId, {
            id: notif.id,
            buyer: {
              name: notif.data.searcher_info.name || 'Interested Buyer',
              telegram_id: buyerId,
              username: notif.data.searcher_info.telegram_username,
            },
            matches: [],
            totalValue: 0,
            created_at: notif.created_at,
            read: notif.read,
            status: (notif as any).status || 'pending'
          });
        }
        
        const group = groups.get(buyerId);
        const newMatches = notif.data.matches || [];
        group.matches.push(...newMatches);
        
        // Calculate total value
        group.totalValue = group.matches.reduce((sum: number, match: any) => {
          const price = match.price_per_carat ? match.price_per_carat * match.weight : match.price || 0;
          return sum + price;
        }, 0);
      });
    
    return Array.from(groups.values()).sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }, [displayNotifications]);

  // Filter notifications
  const filteredNotifications = useMemo(() => {
    if (filterStatus === 'all') return groupedNotifications;
    return groupedNotifications.filter(n => n.status === filterStatus);
  }, [groupedNotifications, filterStatus]);

  const stats = useMemo(() => {
    const unread = groupedNotifications.filter(n => !n.read).length;
    const pending = groupedNotifications.filter(n => n.status === 'pending').length;
    const sent = groupedNotifications.filter(n => n.status === 'sent').length;
    const totalValue = groupedNotifications.reduce((sum, n) => sum + n.totalValue, 0);
    
    return { unread, pending, sent, totalValue };
  }, [groupedNotifications]);

  const handleGenerateResponse = (notificationId: string) => {
    const notification = groupedNotifications.find(n => n.id === notificationId);
    if (notification) {
      haptic.impactOccurred('medium');
      setSelectedNotification(notification);
      setShowContactDialog(true);
    }
  };

  const handleMarkAsRead = (notificationId: string) => {
    haptic.impactOccurred('light');
    markAsReadHandler(notificationId);
    toast.success('סומן כנקרא');
  };

  const handleMarkAllAsRead = () => {
    haptic.impactOccurred('medium');
    groupedNotifications.forEach(n => {
      if (!n.read) markAsReadHandler(n.id);
    });
    toast.success('הכל סומן כנקרא');
  };

  const handleMessageSent = () => {
    refetchAll();
  };

  if (displayIsLoading && groupedNotifications.length === 0) {
    return (
      <TelegramMiniAppLayout>
        <div className="p-4 space-y-3">
          {[1, 2, 3].map(i => (
            <Card key={i} className="p-4 animate-pulse">
              <div className="h-20 bg-muted rounded" />
            </Card>
          ))}
        </div>
      </TelegramMiniAppLayout>
    );
  }

  return (
    <TelegramMiniAppLayout>
      {/* Pull-to-refresh indicator */}
      {isPulling && (
        <div 
          className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center bg-primary/10 transition-all"
          style={{ 
            height: `${Math.min(pullDistance, 60)}px`,
            opacity: pullDistance / 80 
          }}
        >
          <RefreshCw 
            className={`h-6 w-6 text-primary transition-transform ${
              isRefreshing ? 'animate-spin' : ''
            }`}
            style={{ 
              transform: `rotate(${pullDistance * 2}deg)` 
            }}
          />
        </div>
      )}

      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <div className="p-4 space-y-4 pb-24">
          {/* Premium Header */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Bell className="h-6 w-6 text-primary" />
                  <h1 className="text-2xl font-bold text-foreground">התראות חכמות</h1>
                </div>
                <p className="text-sm text-muted-foreground">
                  תגובות AI אוטומטיות לקונים מעוניינים
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={refetchAll}
                disabled={displayIsLoading}
              >
                <RefreshCw className={`h-4 w-4 ${displayIsLoading ? 'animate-spin' : ''}`} />
              </Button>
            </div>

            {/* Stats Dashboard */}
            <div className="grid grid-cols-2 gap-3">
              <Card className="p-4 bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="h-5 w-5 text-orange-600" />
                  <span className="text-sm font-medium text-foreground">ממתינות</span>
                </div>
                <p className="text-3xl font-bold text-foreground">{stats.pending}</p>
                <p className="text-xs text-muted-foreground mt-1">דורשות תשומת לב</p>
              </Card>

              <Card className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 border-green-200 dark:border-green-800">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  <span className="text-sm font-medium text-foreground">פוטנציאל</span>
                </div>
                <p className="text-3xl font-bold text-green-600">
                  ${(stats.totalValue / 1000).toFixed(0)}K
                </p>
                <p className="text-xs text-muted-foreground mt-1">שווי כולל</p>
              </Card>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-2">
              <Button
                variant={filterStatus === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus('all')}
                className="whitespace-nowrap"
              >
                <Filter className="h-3 w-3 mr-1" />
                הכל ({groupedNotifications.length})
              </Button>
              <Button
                variant={filterStatus === 'pending' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus('pending')}
                className="whitespace-nowrap"
              >
                <Sparkles className="h-3 w-3 mr-1" />
                ממתין ({stats.pending})
              </Button>
              <Button
                variant={filterStatus === 'sent' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus('sent')}
                className="whitespace-nowrap"
              >
                <CheckCheck className="h-3 w-3 mr-1" />
                נשלח ({stats.sent})
              </Button>
              {stats.unread > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleMarkAllAsRead}
                  className="whitespace-nowrap mr-auto"
                >
                  סמן הכל כנקרא
                </Button>
              )}
            </div>
          </div>

          {/* Notifications List */}
          <div className="space-y-3">
            {filteredNotifications.length === 0 ? (
              <Card className="p-12 text-center">
                <Bell className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-20" />
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {filterStatus === 'pending' ? 'אין התראות ממתינות' : 'אין התראות'}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {filterStatus === 'pending' 
                    ? 'כל ההתראות טופלו' 
                    : 'התראות חדשות יופיעו כאן'}
                </p>
              </Card>
            ) : (
              filteredNotifications.map((notification) => (
                <PremiumNotificationCard
                  key={notification.id}
                  notification={notification}
                  onGenerateResponse={handleGenerateResponse}
                  onMarkAsRead={handleMarkAsRead}
                  onDismiss={handleMarkAsRead}
                />
              ))
            )}
          </div>

          {/* Load More - if needed in future */}
          {groupedNotifications.length > 20 && (
            <div className="flex justify-center pt-4">
              <Button variant="outline" size="sm">
                טען עוד
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Enhanced Contact Dialog */}
      {selectedNotification && (
        <EnhancedContactDialog
          open={showContactDialog}
          onOpenChange={setShowContactDialog}
          notification={selectedNotification}
          onMessageSent={handleMessageSent}
        />
      )}
    </TelegramMiniAppLayout>
  );
};

export default NotificationsPage;
