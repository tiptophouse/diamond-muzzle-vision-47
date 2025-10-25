
import React from 'react';
import { TelegramMiniAppLayout } from '@/components/layout/TelegramMiniAppLayout';
import { SmartNotificationCard } from '@/components/notifications/SmartNotificationCard';
import { GroupNotificationCard } from '@/components/notifications/GroupNotificationCard';
import { BusinessNotificationCard } from '@/components/notifications/BusinessNotificationCard';
import { IncomingChatbotMessages } from '@/components/notifications/IncomingChatbotMessages';
import { TelegramNotificationsList } from '@/components/notifications/TelegramNotificationsList';

import { useFastApiNotifications } from '@/hooks/useFastApiNotifications';
import { useNotifications as useDbNotifications } from '@/hooks/useNotifications';
import { useTelegramNotificationBridge } from '@/hooks/useTelegramNotificationBridge';
import { useDiamondSearch } from '@/hooks/useDiamondSearch';
import { useTelegramMessaging } from '@/hooks/useTelegramMessaging';
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { useTelegramHapticFeedback } from '@/hooks/useTelegramHapticFeedback';
import { useToast } from '@/hooks/use-toast';
import { usePullToRefresh } from '@/hooks/usePullToRefresh';
import { useTelegramWebApp } from '@/hooks/useTelegramWebApp';
import { useNotificationRealtimeUpdates } from '@/hooks/useNotificationRealtimeUpdates';
import { useMemo, useCallback } from 'react';
import { GroupedNotificationCard } from '@/components/notifications/GroupedNotificationCard';
import { EmptyStateVariations } from '@/components/notifications/EmptyStateVariations';
import { NotificationSkeleton } from '@/components/notifications/NotificationSkeleton';
import { Bell, BellRing, RefreshCw, Users, Diamond, Heart, TrendingUp, Search, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const NotificationsPage = () => {
  const { notifications, isLoading, markAsRead, contactCustomer, refetch, loadMore, hasMore } = useFastApiNotifications();
  const { notifications: dbNotifications, isLoading: isLoadingDb, markAsRead: markAsReadDb, refetch: refetchDb } = useDbNotifications();
  const { simulateSearchFromBot, isLoading: isSearching } = useDiamondSearch();
  const { sendMessage, isLoading: isSendingMessage } = useTelegramMessaging();
  const { user } = useTelegramAuth();
  const haptic = useTelegramHapticFeedback();
  const { toast } = useToast();
  const { webApp } = useTelegramWebApp();
  
  const hasFast = notifications.length > 0;
  const displayNotifications = hasFast ? notifications : dbNotifications;
  const displayIsLoading = hasFast ? isLoading : isLoadingDb;
  const markAsReadHandler = hasFast ? markAsRead : markAsReadDb;
  const refetchAll = useCallback(async () => {
    await Promise.all([refetch(), refetchDb()]);
  }, [refetch, refetchDb]);
  
  // Initialize Telegram notification bridge
  useTelegramNotificationBridge();
  
  // Pull-to-refresh
  const { isRefreshing, pullDistance, isPulling } = usePullToRefresh({
    onRefresh: async () => {
      await refetchAll();
    },
    threshold: 80,
  });

  // Real-time updates
  useNotificationRealtimeUpdates({
    onNewNotification: (newNotif) => {
      console.log('📲 New notification received via realtime:', newNotif);
      refetchAll(); // Refresh the list to include the new notification
    }
  });
  
  // Smart grouping by buyer
  const groupedNotifications = useMemo(() => {
    const groups = new Map<number, any>();
    
    displayNotifications
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
        
        // Update to latest timestamp
        if (new Date(notif.created_at) > new Date(group.latestTimestamp)) {
          group.latestTimestamp = notif.created_at;
        }
      });
    
    return Array.from(groups.values()).sort(
      (a, b) => new Date(b.latestTimestamp).getTime() - new Date(a.latestTimestamp).getTime()
    );
  }, [displayNotifications]);

  const unreadCount = displayNotifications.filter(n => !n.read).length;
  const businessNotifications = displayNotifications.filter(n => 
    ['buyer_interest', 'interested_buyers', 'pair_match', 'diamond_pairs', 'group_demand', 'price_opportunity', 'price_opportunities'].includes(n.type)
  );
  const groupNotifications = displayNotifications.filter(n => n.type === 'group_diamond_request');
  const diamondMatches = displayNotifications.filter(n => n.type === 'diamond_match');
  const otherNotifications = displayNotifications.filter(n => 
    !['buyer_interest', 'interested_buyers', 'pair_match', 'diamond_pairs', 'group_demand', 'price_opportunity', 'price_opportunities', 'group_diamond_request', 'diamond_match'].includes(n.type)
  );
  
  // Determine empty state type
  const getEmptyStateType = useCallback(() => {
    if (displayNotifications.length === 0) return 'first_time';
    if (unreadCount === 0 && displayNotifications.length > 0) return 'all_read';
    if (diamondMatches.length === 0) return 'no_matches';
    return 'no_buyers';
  }, [displayNotifications.length, unreadCount, diamondMatches.length]);

  const handleContactBuyer = useCallback(async (buyerInfo: any) => {
    haptic.impactOccurred('medium');

    const id = buyerInfo?.userId || buyerInfo?.telegram_id;
    const username = buyerInfo?.telegram_username || buyerInfo?.username;

    if (!id && !username) {
      toast({
        title: 'שגיאה',
        description: 'לא נמצאו פרטי קשר של הקונה (ID או שם משתמש)',
        variant: 'destructive',
      });
      return;
    }

    const link = username ? `https://t.me/${username}` : `https://t.me/user?id=${id}`;

    try {
      if (webApp && typeof (webApp as any).openTelegramLink === 'function') {
        (webApp as any).openTelegramLink(link);
      } else {
        window.open(link, '_blank');
      }
      toast({
        title: 'פותח צ׳אט',
        description: `פותח שיחה עם ${buyerInfo?.name || username || id}`,
      });
    } catch (error) {
      console.error('Failed to open Telegram chat:', error);
      toast({
        title: 'שגיאה',
        description: 'לא ניתן לפתוח צ׳אט בטלגרם כרגע',
        variant: 'destructive',
      });
    }
  }, [haptic, toast, webApp]);

  const handleMarkMultipleAsRead = useCallback((notificationIds: string[]) => {
    notificationIds.forEach(id => markAsReadHandler(id));
  }, [markAsReadHandler]);

  if (displayIsLoading && displayNotifications.length === 0) {
    return (
      <TelegramMiniAppLayout>
        <div className="p-4 space-y-3">
          <NotificationSkeleton count={5} />
        </div>
      </TelegramMiniAppLayout>
    );
  }

  const handleContactCustomer = async (customerInfo: any) => {
    haptic.impactOccurred('medium');
    
    if (!customerInfo.telegram_id) {
      toast({
        title: "שגיאה",
        description: "לא נמצא מזהה טלגרם עבור הלקוח",
        variant: "destructive",
      });
      return;
    }

    const success = await sendMessage({
      telegramId: customerInfo.telegram_id,
      message: `שלום ${customerInfo.name || 'לקוח יקר'},\n\nאני רוצה ליצור איתך קשר בנוגע לבקשה שלך ליהלום.\nאשמח לקבל פרטים נוספים ולעזור לך למצוא את היהלום המושלם.\n\nבברכה,\n${user?.first_name || 'המוכר'}`
    });

    if (success) {
      toast({
        title: "הודעה נשלחה בהצלחה",
        description: `הודעה נשלחה ל-${customerInfo.name || 'הלקוח'}`,
      });
    }
  };

  const handleTestDiamondSearch = async () => {
    if (!user?.id) return;
    
    // Simulate a search for round diamonds
    await simulateSearchFromBot({
      shape: 'round',
      color: 'G',
      clarity: 'VVS2',
      weight_min: 1.0,
      weight_max: 2.0
    }, 987654321, "Test Buyer");
    
    // Refresh notifications after search
    setTimeout(() => refetchAll(), 1000);
  };

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
      
      <div className="p-3 space-y-4 pb-20">
        {/* Debug Panel */}
        <details className="bg-muted/50 rounded-lg p-3 text-xs">
          <summary className="cursor-pointer font-semibold flex items-center gap-2">
            🔍 Debug Info ({displayNotifications.length} total)
          </summary>
          <div className="mt-2 space-y-2">
            <p>✅ With Telegram ID: {displayNotifications.filter(n => 
              n.data?.searcher_info?.telegram_id).length}</p>
            <p>👤 Username-only: {displayNotifications.filter(n => 
              !n.data?.searcher_info?.telegram_id && 
              n.data?.searcher_info?.telegram_username).length}</p>
            <p>📋 First 3 notifications:</p>
            {displayNotifications.slice(0, 3).map(n => (
              <details key={n.id} className="ml-4">
                <summary className="cursor-pointer text-primary">Notification #{n.id}</summary>
                <pre className="text-[10px] overflow-auto max-h-40 bg-background p-2 rounded mt-1">
                  {JSON.stringify({
                    id: n.id,
                    type: n.type,
                    telegram_id: n.data?.searcher_info?.telegram_id,
                    username: n.data?.searcher_info?.telegram_username,
                    name: n.data?.searcher_info?.name,
                    has_full_info: n.data?.searcher_info?.has_full_info
                  }, null, 2)}
                </pre>
              </details>
            ))}
          </div>
        </details>
        
        <Tabs defaultValue="enhanced" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-4 h-auto">
            <TabsTrigger value="enhanced" className="flex items-center gap-1 py-3 text-xs">
              <Bell className="h-3 w-3" />
              Enhanced
            </TabsTrigger>
            <TabsTrigger value="outgoing" className="flex items-center gap-1 py-3 text-xs">
              <Bell className="h-3 w-3" />
              יוצאות
            </TabsTrigger>
            <TabsTrigger value="incoming" className="flex items-center gap-1 py-3 text-xs">
              <MessageCircle className="h-3 w-3" />
              נכנסות
            </TabsTrigger>
          </TabsList>

          <TabsContent value="enhanced" className="space-y-6">
            {/* Grouped Notifications */}
            {groupedNotifications.length > 0 && (
              <div className="space-y-3">
                <h2 className="text-sm font-semibold text-foreground flex items-center gap-2 px-2">
                  <Users className="h-4 w-4 text-primary" />
                  קונים מעוניינים ({groupedNotifications.length})
                </h2>
                {groupedNotifications.map((group) => (
                  <GroupedNotificationCard
                    key={group.buyer.userId}
                    group={group}
                    onContactBuyer={handleContactBuyer}
                    onMarkAsRead={handleMarkMultipleAsRead}
                  />
                ))}
              </div>
            )}
            
            {/* Regular Notifications List */}
            <TelegramNotificationsList
              notifications={displayNotifications}
              onMarkAsRead={markAsReadHandler}
              onMarkAllAsRead={() => {
                displayNotifications.forEach(n => {
                  if (!n.read) markAsReadHandler(n.id);
                });
              }}
              onContactCustomer={handleContactCustomer}
              loading={displayIsLoading}
            />
            
            {/* Empty State */}
            {displayNotifications.length === 0 && !displayIsLoading && (
              <EmptyStateVariations 
                type={getEmptyStateType()}
                onAction={(action) => {
                  if (action === 'share_store') {
                    toast({ title: "שיתוף החנות", description: "פתח את דף החנות לשיתוף" });
                  } else if (action === 'start_tour') {
                    toast({ title: "סיור מודרך", description: "מתחיל סיור באפליקציה" });
                  }
                }}
              />
            )}
            
            {/* Load More Button */}
            {hasMore && displayNotifications.length > 0 && (
              <div className="flex justify-center py-4">
                <Button
                  onClick={loadMore}
                  variant="outline"
                  disabled={displayIsLoading}
                  className="gap-2"
                >
                  {displayIsLoading ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      טוען...
                    </>
                  ) : (
                    <>
                      <Diamond className="h-4 w-4" />
                      טען עוד התראות
                    </>
                  )}
                </Button>
              </div>
            )}
          </TabsContent>


          <TabsContent value="outgoing" className="space-y-4">
            {/* Header */}
            <div className="space-y-3">
              <div className="flex items-center gap-2" dir="rtl">
                <div className="relative">
                  <Bell className="h-5 w-5 text-primary" />
                  {unreadCount > 0 && (
                    <Badge 
                      variant="destructive" 
                      className="absolute -top-1 -right-1 h-3 w-3 flex items-center justify-center text-xs p-0 min-w-[12px]"
                    >
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </Badge>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h1 className="text-base font-bold text-foreground leading-tight">
                    התראות עסקיות חכמות
                  </h1>
                  <p className="text-xs text-muted-foreground mt-1 leading-snug">
                    קבל התראות על קונים מעוניינים וזוגות יהלומים
                  </p>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button 
                  onClick={handleTestDiamondSearch} 
                  variant="outline" 
                  size="sm" 
                  className="flex-1 text-xs"
                  disabled={isSearching}
                >
                  <Search className="h-3 w-3 mr-1" />
                  {isSearching ? 'מחפש...' : 'בדיקה'}
                </Button>
                
                <Button onClick={refetchAll} variant="outline" size="sm" className="flex-1 text-xs">
                  <RefreshCw className="h-3 w-3 mr-1" />
                  רענן
                </Button>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-card border rounded-lg p-3">
                <div className="flex items-center gap-1">
                  <BellRing className="h-3 w-3 text-primary" />
                  <span className="font-medium text-xs text-foreground">חדשות</span>
                </div>
                <div className="text-lg font-bold text-primary mt-1">{unreadCount}</div>
              </div>
              
              <div className="bg-card border rounded-lg p-3">
                <div className="flex items-center gap-1">
                  <Heart className="h-3 w-3 text-pink-600" />
                  <span className="font-medium text-xs text-foreground">קונים</span>
                </div>
                <div className="text-lg font-bold text-pink-600 mt-1">
                  {businessNotifications.filter(n => n.type === 'buyer_interest' || n.type === 'interested_buyers').length}
                </div>
              </div>
              
              <div className="bg-card border rounded-lg p-3">
                <div className="flex items-center gap-1">
                  <Users className="h-3 w-3 text-green-600" />
                  <span className="font-medium text-xs text-foreground">קבוצות</span>
                </div>
                <div className="text-lg font-bold text-green-600 mt-1">
                  {businessNotifications.filter(n => n.type === 'group_demand').length + groupNotifications.length}
                </div>
              </div>
              
              <div className="bg-card border rounded-lg p-3">
                <div className="flex items-center gap-1">
                  <Diamond className="h-3 w-3 text-purple-600" />
                  <span className="font-medium text-xs text-foreground">זוגות</span>
                </div>
                <div className="text-lg font-bold text-purple-600 mt-1">
                  {businessNotifications.filter(n => n.type === 'pair_match' || n.type === 'diamond_pairs').length}
                </div>
              </div>
            </div>

            {/* Notifications List */}
            <div className="space-y-4">
              {/* Business Notifications */}
              {businessNotifications.length > 0 && (
                <div>
                  <h2 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                    <Diamond className="h-4 w-4 text-primary" />
                    התראות עסקיות
                  </h2>
                  <div className="space-y-3">
                    {businessNotifications.map((notification) => (
                      <BusinessNotificationCard
                        key={notification.id}
                        notification={notification}
                        onMarkAsRead={markAsRead}
                        onContactCustomer={handleContactCustomer}
                        isLoading={isSendingMessage}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Group Notifications */}
              {groupNotifications.length > 0 && (
                <div>
                  <h2 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                    <Users className="h-4 w-4 text-green-600" />
                    בקשות מקבוצות B2B
                  </h2>
                  <div className="space-y-3">
                    {groupNotifications.map((notification) => (
                      <GroupNotificationCard
                        key={notification.id}
                        notification={notification}
                        onMarkAsRead={markAsRead}
                        onContactCustomer={handleContactCustomer}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Regular Notifications */}
              {(diamondMatches.length > 0 || otherNotifications.length > 0) && (
                <div>
                  <h2 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                    <Bell className="h-4 w-4 text-primary" />
                    התראות רגילות
                  </h2>
                  <div className="space-y-3">
                    {[...diamondMatches, ...otherNotifications].map((notification) => (
                      <SmartNotificationCard
                        key={notification.id}
                        notification={notification}
                        onMarkAsRead={markAsRead}
                        onContactCustomer={handleContactCustomer}
                        isLoading={isSendingMessage}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Empty State */}
              {notifications.length === 0 && (
                <div className="text-center py-8">
                  <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                  <h3 className="text-base font-medium text-foreground mb-2">אין התראות עדיין</h3>
                  <p className="text-sm text-muted-foreground px-4">
                    כשיהיו קונים מעוניינים או זוגות יהלומים, תקבל התראות כאן
                  </p>
                </div>
              )}
            </div>

            {/* Info Box */}
            <div className="bg-card border rounded-lg p-4">
              <h3 className="font-semibold text-foreground mb-2 text-sm">התראות עסקיות חכמות</h3>
              <ul className="space-y-2 text-xs text-muted-foreground">
                <li className="flex items-start gap-2">
                  <Heart className="h-3 w-3 mt-0.5 text-pink-600 flex-shrink-0" />
                  <span><strong>קונים מעוניינים:</strong> התראות כשלקוחות מחפשים יהלומים דומים</span>
                </li>
                <li className="flex items-start gap-2">
                  <Diamond className="h-3 w-3 mt-0.5 text-purple-600 flex-shrink-0" />
                  <span><strong>זוגות יהלומים:</strong> הזדמנויות ליצור זוגות עם סוחרים אחרים</span>
                </li>
                <li className="flex items-start gap-2">
                  <Users className="h-3 w-3 mt-0.5 text-green-600 flex-shrink-0" />
                  <span><strong>ביקוש בקבוצות:</strong> ניתוח ביקוש בקבוצות הטלגרם</span>
                </li>
              </ul>
            </div>
          </TabsContent>

          <TabsContent value="incoming">
            <IncomingChatbotMessages />
          </TabsContent>
        </Tabs>
      </div>
    </TelegramMiniAppLayout>
  );
};

export default NotificationsPage;
