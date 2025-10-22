import React, { useState, useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { TelegramDiamondNotificationCard } from './TelegramDiamondNotificationCard';
import { TelegramDiamondMiniCard } from './TelegramDiamondMiniCard';
import { Bell, BellOff, Filter, Sparkles, TrendingUp } from 'lucide-react';
import { useTelegramWebApp } from '@/hooks/useTelegramWebApp';
import { useTelegramHapticFeedback } from '@/hooks/useTelegramHapticFeedback';
import { useIsMobile } from '@/hooks/use-mobile';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  data?: any;
  created_at: string;
}

interface TelegramNotificationsListProps {
  notifications: Notification[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onContactCustomer?: (customerInfo: any, diamond?: any) => void;
  loading?: boolean;
}

export function TelegramNotificationsList({
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onContactCustomer,
  loading = false
}: TelegramNotificationsListProps) {
  const [filter, setFilter] = useState<'all' | 'unread' | 'diamond_match'>('all');
  const [viewMode, setViewMode] = useState<'cards' | 'mini'>('cards');
  const { mainButton, hapticFeedback } = useTelegramWebApp();
  const { impactOccurred, notificationOccurred, selectionChanged } = useTelegramHapticFeedback();
  const isMobile = useIsMobile();

  const unreadCount = notifications.filter(n => !n.read).length;
  const diamondMatches = notifications.filter(n => n.type === 'diamond_match');

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'unread') return !notification.read;
    if (filter === 'diamond_match') return notification.type === 'diamond_match';
    return true;
  });

  // Configure main button based on unread notifications
  useEffect(() => {
    if (unreadCount > 0) {
      const handleMainButtonClick = () => {
        impactOccurred('medium');
        onMarkAllAsRead();
        notificationOccurred('success');
      };

      mainButton?.show(`Mark ${unreadCount} as Read`, handleMainButtonClick);
      mainButton?.enable();
    } else {
      mainButton?.hide();
    }
  }, [unreadCount, mainButton, onMarkAllAsRead, impactOccurred, notificationOccurred]);

  const handleFilterChange = useCallback((newFilter: typeof filter) => {
    impactOccurred('light');
    setFilter(newFilter);
    selectionChanged();
  }, [impactOccurred, selectionChanged]);

  const handleViewModeChange = useCallback(() => {
    impactOccurred('light');
    setViewMode(prev => prev === 'cards' ? 'mini' : 'cards');
    selectionChanged();
  }, [impactOccurred, selectionChanged]);

  const renderDiamondMatches = () => {
    if (diamondMatches.length === 0) return null;

    return (
      <Card className="mb-4 bg-gradient-to-br from-blue-500/5 to-blue-600/10 border-blue-200/50">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-blue-700 text-sm">
            <Sparkles className="h-4 w-4" />
            Diamond Matches Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div className="text-center bg-white/60 rounded-lg p-2">
              <p className="text-xs text-muted-foreground">Total Matches</p>
              <p className="font-bold text-blue-600">{diamondMatches.length}</p>
            </div>
            <div className="text-center bg-white/60 rounded-lg p-2">
              <p className="text-xs text-muted-foreground">Avg Confidence</p>
              <p className="font-bold text-blue-600">
                {Math.round(
                  diamondMatches.reduce((acc, n) => 
                    acc + (n.data?.confidence_score || 0), 0
                  ) / diamondMatches.length * 100
                )}%
              </p>
            </div>
          </div>
          
          {/* Top diamonds from matches */}
          <div className="space-y-2">
            {diamondMatches.slice(0, 2).map(notification => {
              const topDiamond = notification.data?.matches?.[0];
              if (!topDiamond) return null;
              
              return (
                <TelegramDiamondMiniCard
                  key={`${notification.id}-${topDiamond.stock_number}`}
                  diamond={topDiamond}
                  compact={true}
                  onContact={(diamond) => onContactCustomer?.(notification.data?.customer_info, diamond)}
                />
              );
            })}
          </div>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="space-y-4 p-4">
        {[1, 2, 3].map(i => (
          <Card key={i} className="animate-pulse">
            <div className="h-32 bg-muted/30 rounded"></div>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col w-full max-w-full overflow-hidden">
      {/* Header with filters and stats - Mobile optimized */}
      <div className="px-2 sm:px-4 py-3 border-b bg-background/95 backdrop-blur-sm sticky top-0 z-10">
        <div className="flex items-center justify-between mb-2 gap-2">
          <div className="flex items-center gap-1.5 min-w-0 flex-1">
            <Bell className="h-4 w-4 flex-shrink-0" />
            <h2 className="font-semibold text-sm truncate">Notifications</h2>
            {unreadCount > 0 && (
              <Badge variant="destructive" className="text-[10px] px-1.5 py-0 h-4 flex-shrink-0">
                {unreadCount}
              </Badge>
            )}
          </div>
          
          <Button
            size="sm"
            variant="outline"
            onClick={handleViewModeChange}
            className="h-7 text-[10px] px-2 flex-shrink-0"
          >
            {viewMode === 'cards' ? 'Mini' : 'Cards'}
          </Button>
        </div>

        {/* Filter tabs - Mobile optimized */}
        <div className="flex gap-0.5 p-0.5 bg-muted/50 rounded-lg">
          {[
            { key: 'all', label: 'All', icon: null },
            { key: 'unread', label: 'Unread', icon: BellOff },
            { key: 'diamond_match', label: 'Matches', icon: Sparkles },
          ].map(({ key, label, icon: Icon }) => (
            <Button
              key={key}
              size="sm"
              variant={filter === key ? 'default' : 'ghost'}
              onClick={() => handleFilterChange(key as typeof filter)}
              className="flex-1 h-7 text-[10px] px-1 gap-0.5"
            >
              {Icon && <Icon className="h-3 w-3" />}
              <span className="hidden xs:inline">{label}</span>
              {key === 'unread' && unreadCount > 0 && (
                <Badge variant="secondary" className="ml-0.5 h-3 px-1 text-[9px] leading-none">
                  {unreadCount}
                </Badge>
              )}
            </Button>
          ))}
        </div>
      </div>

      <ScrollArea className="flex-1 w-full">
        <div className="px-2 sm:px-4 py-3 space-y-3 w-full">
          {/* Diamond matches summary */}
          {filter === 'all' && renderDiamondMatches()}

          {/* Notifications list - Mobile responsive */}
          {filteredNotifications.length > 0 ? (
            <div className={viewMode === 'mini' ? 'grid grid-cols-1 gap-2' : 'space-y-3'}>
              {filteredNotifications.map(notification => (
                viewMode === 'cards' ? (
                  <TelegramDiamondNotificationCard
                    key={notification.id}
                    notification={notification}
                    onMarkAsRead={onMarkAsRead}
                    onContactCustomer={onContactCustomer}
                  />
                ) : (
                  <div key={notification.id} className="space-y-2">
                    {notification.data?.matches?.slice(0, 1).map((diamond: any, index: number) => (
                      <TelegramDiamondMiniCard
                        key={`${notification.id}-${index}`}
                        diamond={diamond}
                        compact={true}
                        onContact={(diamond) => onContactCustomer?.(notification.data?.customer_info, diamond)}
                      />
                    ))}
                  </div>
                )
              ))}
            </div>
          ) : (
            <Card className="text-center py-6 mx-2">
              <CardContent className="py-4">
                <BellOff className="h-10 w-10 mx-auto mb-2 text-muted-foreground/50" />
                <p className="text-muted-foreground text-sm">
                  {filter === 'unread' ? 'No unread notifications' : 
                   filter === 'diamond_match' ? 'No diamond matches found' : 
                   'No notifications yet'}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}