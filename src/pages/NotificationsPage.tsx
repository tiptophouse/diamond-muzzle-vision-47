import React, { useMemo, useCallback, useDeferredValue, useState } from 'react';
import { TelegramMiniAppLayout } from '@/components/layout/TelegramMiniAppLayout';
import { SmartNotificationCard } from '@/components/notifications/SmartNotificationCard';
import { GroupNotificationCard } from '@/components/notifications/GroupNotificationCard';
import { BusinessNotificationCard } from '@/components/notifications/BusinessNotificationCard';
import { IncomingChatbotMessages } from '@/components/notifications/IncomingChatbotMessages';
import { GroupedNotificationCard } from '@/components/notifications/GroupedNotificationCard';
import { EmptyStateVariations } from '@/components/notifications/EmptyStateVariations';
import { NotificationSkeleton } from '@/components/notifications/NotificationSkeleton';
import { NotificationErrorBoundary } from '@/components/notifications/NotificationErrorBoundary';

import { useUnifiedNotifications } from '@/hooks/useUnifiedNotifications';
import { useTelegramMessaging } from '@/hooks/useTelegramMessaging';
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { useTelegramHapticFeedback } from '@/hooks/useTelegramHapticFeedback';
import { useToast } from '@/hooks/use-toast';
import { usePullToRefresh } from '@/hooks/usePullToRefresh';

import { Bell, RefreshCw, Users, Diamond, MessageCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const NotificationsPage = () => {
  const { 
    notifications, 
    isLoading, 
    markAsRead, 
    refetch, 
    connectionState,
    hasMore,
    loadMore 
  } = useUnifiedNotifications();
  
  const { sendMessage, isLoading: isSendingMessage } = useTelegramMessaging();
  const { user } = useTelegramAuth();
  const haptic = useTelegramHapticFeedback();
  const { toast } = useToast();
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  
  // Debounce notifications for smooth rendering
  const deferredNotifications = useDeferredValue(notifications);
  
  // Pull-to-refresh with loading guard
  const { isRefreshing, pullDistance, isPulling } = usePullToRefresh({
    onRefresh: async () => {
      if (!isLoading) {
        haptic.impactOccurred('light');
        await refetch();
      }
    },
    threshold: 60, // Lower threshold for mobile
  });

  // Smart grouping by buyer - deferred to avoid blocking
  const groupedNotifications = useMemo(() => {
    const groups = new Map<number, any>();
    
    deferredNotifications
      .filter(n => n.type === 'diamond_match' && n.data?.searcher_info?.telegram_id)
      .forEach(notif => {
        const buyerId = notif.data.searcher_info.telegram_id;
        
        if (!groups.has(buyerId)) {
          groups.set(buyerId, {
            buyer: {
              userId: buyerId,
              name: notif.data.searcher_info.name || 'Interested Buyer',
              telegram_username: notif.data.searcher_info.telegram_username,
              phone: notif.data.searcher_info.phone,
            },
            matches: [],
            totalCount: 0,
            latestTimestamp: notif.created_at,
            notificationIds: [],
          });
        }
        
        const group = groups.get(buyerId);
        group.matches.push(...(notif.data.matches || []));
        group.totalCount = group.matches.length;
        group.notificationIds.push(notif.id);
        
        if (new Date(notif.created_at) > new Date(group.latestTimestamp)) {
          group.latestTimestamp = notif.created_at;
        }
      });
    
    return Array.from(groups.values())
      .sort((a, b) => new Date(b.latestTimestamp).getTime() - new Date(a.latestTimestamp).getTime());
  }, [deferredNotifications]);

  // Categorize notifications
  const { businessNotifications, groupNotifications, diamondMatches, otherNotifications } = useMemo(() => {
    const business = deferredNotifications.filter(n => 
      ['buyer_interest', 'pair_match', 'group_demand', 'price_opportunity'].includes(n.type)
    );
    
    const group = deferredNotifications.filter(n => 
      n.type === 'group_diamond_request'
    );
    
    const matches = deferredNotifications.filter(n => 
      n.type === 'diamond_match'
    );
    
    const other = deferredNotifications.filter(n => 
      !['buyer_interest', 'pair_match', 'group_demand', 'price_opportunity', 'group_diamond_request', 'diamond_match'].includes(n.type)
    );
    
    return {
      businessNotifications: business,
      groupNotifications: group,
      diamondMatches: matches,
      otherNotifications: other,
    };
  }, [deferredNotifications]);

  const unreadCount = useMemo(() => 
    deferredNotifications.filter(n => !n.read).length, 
    [deferredNotifications]
  );

  const isEmpty = !isLoading && deferredNotifications.length === 0;

  // Stable callback for contacting buyer
  const handleContactBuyer = useCallback(async (buyerInfo: any) => {
    if (!buyerInfo?.telegram_id) {
      toast({
        title: "שגיאה",
        description: "לא נמצאו פרטי קשר",
        variant: "destructive"
      });
      return;
    }

    haptic.impactOccurred('medium');
    
    const telegramUrl = `https://t.me/${buyerInfo.telegram_username || buyerInfo.telegram_id}`;
    window.open(telegramUrl, '_blank');
    
    toast({
      title: "פותח Telegram...",
      description: `יוצר קשר עם ${buyerInfo.name}`,
    });
  }, [toast, haptic]);

  const handleMarkAsRead = useCallback(async (id: string) => {
    haptic.impactOccurred('light');
    await markAsRead(id);
  }, [markAsRead, haptic]);

  const handleLoadMore = useCallback(async () => {
    if (!hasMore || isLoadingMore || isLoading) return;
    
    setIsLoadingMore(true);
    haptic.impactOccurred('light');
    
    try {
      await loadMore();
    } catch (error) {
      console.error('Failed to load more:', error);
    } finally {
      setIsLoadingMore(false);
    }
  }, [hasMore, isLoadingMore, isLoading, loadMore, haptic]);

  return (
    <TelegramMiniAppLayout>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Bell className="h-6 w-6 text-foreground" />
                {unreadCount > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
                  >
                    {unreadCount}
                  </Badge>
                )}
              </div>
              <div>
                <h1 className="text-xl font-bold">התראות</h1>
                <p className="text-xs text-muted-foreground">
                  {connectionState === 'connected' && '🟢 Live'}
                  {connectionState === 'connecting' && '🟡 מתחבר...'}
                  {connectionState === 'error' && '🔴 שגיאה'}
                </p>
              </div>
            </div>
            
            <Button
              onClick={refetch}
              variant="ghost"
              size="icon"
              disabled={isLoading || isRefreshing}
            >
              <RefreshCw className={`h-5 w-5 ${(isLoading || isRefreshing) ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>

        {/* Pull-to-refresh indicator */}
        {isPulling && (
          <div 
            className="flex justify-center items-center py-2 bg-primary/10 transition-all"
            style={{ height: `${Math.min(pullDistance, 60)}px` }}
          >
            <RefreshCw className={`h-5 w-5 text-primary ${pullDistance > 50 ? 'animate-spin' : ''}`} />
          </div>
        )}

        {/* Loading state */}
        {isLoading && deferredNotifications.length === 0 && (
          <div className="p-4">
            <NotificationSkeleton count={5} />
          </div>
        )}

        {/* Empty state */}
        {isEmpty && (
          <div className="flex-1 flex items-center justify-center p-8">
            <EmptyStateVariations 
              type="no_matches"
            />
          </div>
        )}

        {/* Notifications tabs */}
        {!isEmpty && (
          <Tabs defaultValue="enhanced" className="flex-1">
            <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent">
              <TabsTrigger value="enhanced" className="flex-1 data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none">
                <Diamond className="h-4 w-4 mr-2" />
                משופר ({diamondMatches.length})
              </TabsTrigger>
              <TabsTrigger value="outgoing" className="flex-1 data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none">
                <Users className="h-4 w-4 mr-2" />
                יוצא ({businessNotifications.length})
              </TabsTrigger>
              <TabsTrigger value="incoming" className="flex-1 data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none">
                <MessageCircle className="h-4 w-4 mr-2" />
                נכנס
              </TabsTrigger>
            </TabsList>

            {/* Enhanced Tab */}
            <TabsContent value="enhanced" className="p-4 space-y-4">
              {groupedNotifications.length > 0 && (
                <div className="space-y-4">
                  <h2 className="text-sm font-semibold text-muted-foreground">
                    התאמות מקובצות ({groupedNotifications.length})
                  </h2>
                  {groupedNotifications.map((group) => (
                    <NotificationErrorBoundary key={group.buyer.userId}>
                      <GroupedNotificationCard
                        group={{
                          buyer: group.buyer,
                          matches: group.matches,
                          totalCount: group.totalCount,
                          latestTimestamp: group.latestTimestamp,
                          notificationIds: group.notificationIds
                        }}
                        onContactBuyer={handleContactBuyer}
                        onMarkAsRead={(ids: string[]) => {
                          ids.forEach((id: string) => handleMarkAsRead(id));
                        }}
                      />
                    </NotificationErrorBoundary>
                  ))}
                </div>
              )}

              {groupNotifications.length > 0 && (
                <div className="space-y-4">
                  <h2 className="text-sm font-semibold text-muted-foreground">
                    בקשות מקבוצות ({groupNotifications.length})
                  </h2>
                  {groupNotifications.map((notification) => (
                    <NotificationErrorBoundary key={notification.id}>
                      <GroupNotificationCard
                        notification={notification}
                        onMarkAsRead={handleMarkAsRead}
                        onContactCustomer={handleContactBuyer}
                      />
                    </NotificationErrorBoundary>
                  ))}
                </div>
              )}

              {otherNotifications.length > 0 && (
                <div className="space-y-4">
                  <h2 className="text-sm font-semibold text-muted-foreground">
                    אחרות ({otherNotifications.length})
                  </h2>
                  {otherNotifications.map((notification) => (
                    <NotificationErrorBoundary key={notification.id}>
                      <SmartNotificationCard
                        notification={notification}
                        onMarkAsRead={handleMarkAsRead}
                        onContactCustomer={handleContactBuyer}
                        isLoading={isSendingMessage}
                      />
                    </NotificationErrorBoundary>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Outgoing Tab */}
            <TabsContent value="outgoing" className="p-4 space-y-4">
              {businessNotifications.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  אין התראות עסקיות כרגע
                </div>
              ) : (
                businessNotifications.map((notification) => (
                  <NotificationErrorBoundary key={notification.id}>
                    <BusinessNotificationCard
                      notification={notification}
                      onMarkAsRead={handleMarkAsRead}
                      onContactCustomer={handleContactBuyer}
                      isLoading={isSendingMessage}
                    />
                  </NotificationErrorBoundary>
                ))
              )}
            </TabsContent>

            {/* Incoming Tab */}
            <TabsContent value="incoming" className="p-4">
              <IncomingChatbotMessages />
            </TabsContent>
          </Tabs>
        )}

        {/* Load more button */}
        {!isEmpty && hasMore && (
          <div className="p-4 border-t">
            <Button
              onClick={handleLoadMore}
              disabled={isLoadingMore || isLoading}
              variant="outline"
              className="w-full"
            >
              {isLoadingMore ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  טוען...
                </>
              ) : (
                'טען עוד התראות'
              )}
            </Button>
          </div>
        )}
      </div>
    </TelegramMiniAppLayout>
  );
};

export default NotificationsPage;
