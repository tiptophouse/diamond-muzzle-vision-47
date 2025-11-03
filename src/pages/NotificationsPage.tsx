import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { TelegramMiniAppLayout } from '@/components/layout/TelegramMiniAppLayout';
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { useTelegramSDK2Context } from '@/providers/TelegramSDK2Provider';
import { api, apiEndpoints } from '@/lib/api';
import { cachedApiCall, apiCache } from '@/lib/api/cache';
import { toast } from 'sonner';
import { Bell, RefreshCw, Users, Diamond, Sparkles, MessageCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDistanceToNow } from 'date-fns';
import { he } from 'date-fns/locale';

interface SellerNotification {
  id: number;
  user_id: number;
  searcher_user_id: number | null;
  search_query: string;
  result_type: string;
  diamonds_data: any[] | null;
  message_sent: string | null;
  created_at: string;
}

interface GroupedBuyerNotifications {
  buyerId: number;
  buyerName: string;
  notifications: SellerNotification[];
  totalDiamonds: number;
  totalValue: number;
  latestTimestamp: string;
  unread: boolean;
}

export default function NotificationsPage() {
  const { user } = useTelegramAuth();
  const { webApp, isReady } = useTelegramSDK2Context();
  
  const [notifications, setNotifications] = useState<SellerNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [expandedBuyers, setExpandedBuyers] = useState<Set<number>>(new Set());

  const fetchNotifications = useCallback(async (pageNum: number = 1, forceRefresh: boolean = false) => {
    if (!user?.id) return;

    try {
      const offset = (pageNum - 1) * 20;
      const cacheKey = `notifications_${user.id}_${pageNum}`;
      
      if (forceRefresh) {
        apiCache.clear(cacheKey);
      }

      const response = await cachedApiCall(
        cacheKey,
        () => api.get<SellerNotification[]>(apiEndpoints.sellerNotifications(user.id, 20, offset)),
        120000 // 2 minutes cache
      );

      if (response.error) {
        const errorMsg = typeof response.error === 'string' 
          ? response.error 
          : (response.error as any)?.message || 'Failed to fetch notifications';
        throw new Error(errorMsg);
      }

      if (response.data) {
        if (pageNum === 1) {
          setNotifications(response.data);
        } else {
          setNotifications(prev => [...prev, ...response.data]);
        }
        setHasMore(response.data.length === 20);
      }
    } catch (error: any) {
      console.error('Failed to fetch notifications:', error);
      toast.error('שגיאה בטעינת התראות', {
        description: error.message || 'נסה שוב מאוחר יותר',
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (user?.id) {
      fetchNotifications(1);
    }
  }, [user?.id]);

  const handleRefresh = useCallback(async () => {
    if (refreshing) return;
    
    setRefreshing(true);
    webApp?.HapticFeedback?.impactOccurred('light');
    
    await fetchNotifications(1, true);
    
    toast.success('התראות עודכנו');
  }, [refreshing, webApp, fetchNotifications]);

  const handleLoadMore = useCallback(() => {
    if (!loading && hasMore) {
      setPage(prev => prev + 1);
      fetchNotifications(page + 1);
    }
  }, [loading, hasMore, page, fetchNotifications]);

  const toggleBuyerExpanded = useCallback((buyerId: number) => {
    webApp?.HapticFeedback?.impactOccurred('light');
    setExpandedBuyers(prev => {
      const next = new Set(prev);
      if (next.has(buyerId)) {
        next.delete(buyerId);
      } else {
        next.add(buyerId);
      }
      return next;
    });
  }, [webApp]);

  // Group notifications by buyer
  const groupedNotifications = useMemo<GroupedBuyerNotifications[]>(() => {
    const groups = new Map<number, GroupedBuyerNotifications>();

    notifications.forEach(notif => {
      const buyerId = notif.searcher_user_id || 0;
      if (buyerId === 0) return;

      if (!groups.has(buyerId)) {
        groups.set(buyerId, {
          buyerId,
          buyerName: `Buyer ${buyerId}`,
          notifications: [],
          totalDiamonds: 0,
          totalValue: 0,
          latestTimestamp: notif.created_at,
          unread: !notif.message_sent,
        });
      }

      const group = groups.get(buyerId)!;
      group.notifications.push(notif);
      
      if (notif.diamonds_data) {
        group.totalDiamonds += notif.diamonds_data.length;
        group.totalValue += notif.diamonds_data.reduce((sum, d) => {
          return sum + (d.price_per_carat || 0) * (d.weight || 0);
        }, 0);
      }

      if (new Date(notif.created_at) > new Date(group.latestTimestamp)) {
        group.latestTimestamp = notif.created_at;
      }

      if (!notif.message_sent) {
        group.unread = true;
      }
    });

    return Array.from(groups.values()).sort(
      (a, b) => new Date(b.latestTimestamp).getTime() - new Date(a.latestTimestamp).getTime()
    );
  }, [notifications]);

  // Stats
  const stats = useMemo(() => ({
    totalBuyers: groupedNotifications.length,
    unreadCount: groupedNotifications.filter(g => g.unread).length,
    totalDiamonds: groupedNotifications.reduce((sum, g) => sum + g.totalDiamonds, 0),
    totalValue: groupedNotifications.reduce((sum, g) => sum + g.totalValue, 0),
  }), [groupedNotifications]);

  if (loading && notifications.length === 0) {
    return (
      <TelegramMiniAppLayout>
        <div className="p-4 space-y-4">
          <Skeleton className="h-16 w-full" />
          <div className="grid grid-cols-3 gap-2">
            <Skeleton className="h-20" />
            <Skeleton className="h-20" />
            <Skeleton className="h-20" />
          </div>
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      </TelegramMiniAppLayout>
    );
  }

  return (
    <TelegramMiniAppLayout>
      <div className="p-4 space-y-4 pb-20">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-background pb-3 border-b border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Bell className="h-7 w-7 text-primary" />
                {stats.unreadCount > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center text-xs p-0"
                  >
                    {stats.unreadCount}
                  </Badge>
                )}
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">התראות</h1>
                <p className="text-sm text-muted-foreground">
                  קונים מעוניינים ביהלומים שלך
                </p>
              </div>
            </div>
            <Button 
              onClick={handleRefresh} 
              variant="outline" 
              size="icon"
              disabled={refreshing}
              className="flex-shrink-0"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-2">
          <Card className="border-border">
            <CardContent className="p-3">
              <div className="flex items-center gap-1 mb-1">
                <Users className="h-3 w-3 text-primary" />
                <span className="text-xs text-muted-foreground">קונים</span>
              </div>
              <div className="text-2xl font-bold text-primary">{stats.totalBuyers}</div>
            </CardContent>
          </Card>
          
          <Card className="border-border">
            <CardContent className="p-3">
              <div className="flex items-center gap-1 mb-1">
                <Bell className="h-3 w-3 text-primary" />
                <span className="text-xs text-muted-foreground">חדשות</span>
              </div>
              <div className="text-2xl font-bold text-destructive">{stats.unreadCount}</div>
            </CardContent>
          </Card>
          
          <Card className="border-border">
            <CardContent className="p-3">
              <div className="flex items-center gap-1 mb-1">
                <Diamond className="h-3 w-3 text-primary" />
                <span className="text-xs text-muted-foreground">יהלומים</span>
              </div>
              <div className="text-2xl font-bold text-primary">{stats.totalDiamonds}</div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-3 h-auto">
            <TabsTrigger value="all" className="text-xs py-2">
              הכל ({groupedNotifications.length})
            </TabsTrigger>
            <TabsTrigger value="unread" className="text-xs py-2">
              חדשות ({stats.unreadCount})
            </TabsTrigger>
            <TabsTrigger value="contacted" className="text-xs py-2">
              יצרתי קשר
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-3 mt-4">
            {groupedNotifications.length === 0 ? (
              <Card className="border-border">
                <CardContent className="p-8 text-center">
                  <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    אין התראות
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    כשקונים יחפשו יהלומים שמתאימים למלאי שלך, תקבל התראה כאן
                  </p>
                </CardContent>
              </Card>
            ) : (
              groupedNotifications.map(group => (
                <BuyerNotificationCard
                  key={group.buyerId}
                  group={group}
                  isExpanded={expandedBuyers.has(group.buyerId)}
                  onToggle={() => toggleBuyerExpanded(group.buyerId)}
                />
              ))
            )}
          </TabsContent>

          <TabsContent value="unread" className="space-y-3 mt-4">
            {groupedNotifications.filter(g => g.unread).map(group => (
              <BuyerNotificationCard
                key={group.buyerId}
                group={group}
                isExpanded={expandedBuyers.has(group.buyerId)}
                onToggle={() => toggleBuyerExpanded(group.buyerId)}
              />
            ))}
          </TabsContent>

          <TabsContent value="contacted" className="space-y-3 mt-4">
            {groupedNotifications.filter(g => !g.unread).map(group => (
              <BuyerNotificationCard
                key={group.buyerId}
                group={group}
                isExpanded={expandedBuyers.has(group.buyerId)}
                onToggle={() => toggleBuyerExpanded(group.buyerId)}
              />
            ))}
          </TabsContent>
        </Tabs>

        {/* Load More */}
        {hasMore && groupedNotifications.length > 0 && (
          <Button
            onClick={handleLoadMore}
            variant="outline"
            disabled={loading}
            className="w-full"
          >
            {loading ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin ml-2" />
                טוען...
              </>
            ) : (
              'טען עוד התראות'
            )}
          </Button>
        )}
      </div>
    </TelegramMiniAppLayout>
  );
}

function BuyerNotificationCard({ 
  group, 
  isExpanded, 
  onToggle 
}: { 
  group: GroupedBuyerNotifications;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  return (
    <Card className={`border-2 ${group.unread ? 'border-primary/40' : 'border-border'}`}>
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-start gap-3 mb-3">
          <Avatar className="h-12 w-12 border-2 border-primary/20">
            <AvatarFallback className="bg-primary text-primary-foreground font-bold">
              {group.buyerName[0]}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-bold text-base text-foreground truncate">
                    {group.buyerName}
                  </p>
                  {group.unread && (
                    <Badge variant="destructive" className="text-xs">חדש</Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(group.latestTimestamp), { 
                    addSuffix: true,
                    locale: he 
                  })}
                </p>
              </div>
              <Badge variant="secondary" className="text-sm font-bold bg-primary/10 text-primary">
                {group.notifications.length}
              </Badge>
            </div>

            <div className="flex items-center gap-3 text-sm mt-2">
              <div className="flex items-center gap-1">
                <Diamond className="h-3 w-3 text-primary" />
                <span className="text-foreground font-semibold">{group.totalDiamonds}</span>
              </div>
              <span className="text-muted-foreground">•</span>
              <span className="font-bold text-primary">
                ${group.totalValue.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 mb-3">
          <Button 
            size="sm" 
            className="flex-1 bg-green-600 hover:bg-green-700 text-white"
          >
            <MessageCircle className="h-4 w-4 ml-2" />
            צור קשר
          </Button>
        </div>

        {/* Toggle Details */}
        <button
          onClick={onToggle}
          className="w-full flex items-center justify-center gap-2 py-2 text-xs text-muted-foreground hover:text-foreground transition-colors border-t border-border pt-3"
        >
          {isExpanded ? (
            <>
              <ChevronUp className="h-3 w-3" />
              הסתר פרטים
            </>
          ) : (
            <>
              <ChevronDown className="h-3 w-3" />
              הצג פרטים
            </>
          )}
        </button>

        {/* Expanded Details */}
        {isExpanded && (
          <div className="mt-3 space-y-2 border-t border-border pt-3">
            {group.notifications.map(notif => (
              <div 
                key={notif.id}
                className="p-2 rounded-lg bg-accent/30 text-xs"
              >
                <p className="text-foreground font-medium mb-1">
                  {notif.result_type}
                </p>
                <p className="text-muted-foreground">
                  {notif.diamonds_data?.length || 0} יהלומים נמצאו
                </p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
