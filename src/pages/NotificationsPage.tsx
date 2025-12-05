import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { TelegramMiniAppLayout } from '@/components/layout/TelegramMiniAppLayout';
import { useFastApiNotifications } from '@/hooks/useFastApiNotifications';
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { useTelegramHapticFeedback } from '@/hooks/useTelegramHapticFeedback';
import { useToast } from '@/hooks/use-toast';
import { usePullToRefresh } from '@/hooks/usePullToRefresh';
import { useTelegramWebApp } from '@/hooks/useTelegramWebApp';
import { NotificationSkeleton } from '@/components/notifications/NotificationSkeleton';
import { Bell, RefreshCw, Users, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MatchNotificationCard } from '@/components/notifications/MatchNotificationCard';
import { BuyerContactDialog } from '@/components/notifications/BuyerContactDialog';
import { getCurrentUserId } from '@/lib/api';
import { http } from '@/api/http';
import { apiEndpoints } from '@/lib/api/endpoints';

const NotificationsPage = () => {
  const [searchParams] = useSearchParams();
  const buyerIdFromUrl = searchParams.get('buyerId');
  const cardRefs = useRef<Map<number, HTMLDivElement>>(new Map());
  
  const { notifications, isLoading, markAsRead, refetch, loadMore, hasMore } = useFastApiNotifications();
  const { user } = useTelegramAuth();
  const haptic = useTelegramHapticFeedback();
  const { toast } = useToast();
  const { webApp } = useTelegramWebApp();
  
  const [selectedBuyerId, setSelectedBuyerId] = useState<number | null>(null);
  const [selectedDiamonds, setSelectedDiamonds] = useState<Record<number, Set<string>>>({});
  const [diamondInventory, setDiamondInventory] = useState<Map<string, any>>(new Map());
  const [loadingInventory, setLoadingInventory] = useState(false);
  
  // Fetch all diamonds from inventory
  useEffect(() => {
    const fetchInventory = async () => {
      const userId = getCurrentUserId();
      if (!userId) return;
      
      setLoadingInventory(true);
      try {
        const response = await http<{ diamonds: any[] }>(
          apiEndpoints.getAllStones(),
          { method: 'GET' }
        );
        
        const inventoryMap = new Map();
        response.diamonds?.forEach((diamond: any) => {
          // Map by stock_number and diamond_id
          if (diamond.stock_number) {
            inventoryMap.set(diamond.stock_number, diamond);
          }
          if (diamond.diamond_id) {
            inventoryMap.set(diamond.diamond_id, diamond);
          }
        });
        
        setDiamondInventory(inventoryMap);
      } catch (error) {
        console.error('Failed to fetch diamond inventory:', error);
      } finally {
        setLoadingInventory(false);
      }
    };
    
    fetchInventory();
  }, [user]);
  
  // Scroll to buyer card if buyerId is in URL
  useEffect(() => {
    if (buyerIdFromUrl && !isLoading) {
      setTimeout(() => {
        const buyerId = parseInt(buyerIdFromUrl);
        const cardElement = cardRefs.current.get(buyerId);
        if (cardElement) {
          cardElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
          haptic.impactOccurred('medium');
        }
      }, 300);
    }
  }, [buyerIdFromUrl, isLoading, haptic]);
  
  // Pull-to-refresh
  const { isRefreshing, pullDistance, isPulling } = usePullToRefresh({
    onRefresh: async () => {
      await refetch();
    },
    threshold: 80,
  });
  
  // Group notifications by buyer with diamond_match type only and enhance with inventory data
  const groupedNotifications = useMemo(() => {
    const groups = new Map<number, any>();
    
    notifications
      .filter(n => n.type === 'diamond_match' && n.data?.searcher_info?.telegram_id)
      .forEach(notif => {
        const buyerId = notif.data.searcher_info.telegram_id;
        
        if (!groups.has(buyerId)) {
          // Get buyer name with smart fallback chain
          const searcherInfo = notif.data.searcher_info;
          const buyerName = searcherInfo.name 
            || searcherInfo.first_name 
            || (searcherInfo.telegram_username ? `@${searcherInfo.telegram_username}` : null)
            || `Buyer ${buyerId}`;
          
          groups.set(buyerId, {
            buyer: {
              userId: buyerId,
              name: buyerName,
              telegram_username: searcherInfo.telegram_username,
              phone: searcherInfo.phone,
            },
            matches: [],
            matchesMap: new Map(), // Track unique diamonds by stock_number
            searchQuery: notif.data.search_criteria || {},
            latestTimestamp: notif.created_at,
            notificationIds: [],
            read: notif.read,
          });
        }
        
        const group = groups.get(buyerId);
        
        // Deduplicate diamonds by stock_number and enhance with inventory data
        (notif.data.matches || []).forEach(match => {
          if (!group.matchesMap.has(match.stock_number)) {
            // Get full diamond data from inventory
            const inventoryDiamond = diamondInventory.get(match.stock_number) || 
                                    diamondInventory.get(match.diamond_id);
            
            // Merge notification match with inventory data (prioritize inventory images)
            const enhancedMatch = {
              ...match,
              picture: inventoryDiamond?.picture || inventoryDiamond?.image_url || match.picture,
              video_url: inventoryDiamond?.video_url || match.video_url,
              certificate_url: inventoryDiamond?.certificate_url || match.certificate_url,
            };
            
            group.matchesMap.set(match.stock_number, enhancedMatch);
            group.matches.push(enhancedMatch);
          }
        });
        
        // Update to latest timestamp
        if (new Date(notif.created_at) > new Date(group.latestTimestamp)) {
          group.latestTimestamp = notif.created_at;
        }
        
        // If any notification is unread, mark group as unread
        if (!notif.read) {
          group.read = false;
        }
      });
    
    // Clean up temporary matchesMap before returning
    const groupsArray = Array.from(groups.values()).map(group => {
      const { matchesMap, ...rest } = group;
      return rest;
    });
    
    return groupsArray.sort(
      (a, b) => new Date(b.latestTimestamp).getTime() - new Date(a.latestTimestamp).getTime()
    );
  }, [notifications, diamondInventory]);

  // Stats calculation
  const stats = useMemo(() => ({
    totalBuyers: groupedNotifications.length,
    unreadCount: groupedNotifications.filter(g => !g.read).length,
    totalDiamonds: groupedNotifications.reduce((sum, g) => sum + g.matches.length, 0),
  }), [groupedNotifications]);

  // Handle diamond selection toggle
  const handleToggleDiamond = useCallback((buyerId: number, stockNumber: string) => {
    haptic.impactOccurred('light');
    
    setSelectedDiamonds(prev => {
      const buyerSet = new Set(prev[buyerId] || []);
      
      if (buyerSet.has(stockNumber)) {
        buyerSet.delete(stockNumber);
      } else {
        buyerSet.add(stockNumber);
      }
      
      return {
        ...prev,
        [buyerId]: buyerSet,
      };
    });
  }, [haptic]);

  // Handle select all diamonds for a buyer
  const handleSelectAll = useCallback((buyerId: number, allStockNumbers: string[]) => {
    haptic.impactOccurred('medium');
    
    setSelectedDiamonds(prev => ({
      ...prev,
      [buyerId]: new Set(allStockNumbers),
    }));
    
    toast({
      title: 'All diamonds selected',
      description: `Selected ${allStockNumbers.length} diamonds`,
    });
  }, [haptic, toast]);

  // Handle clear all selections for a buyer
  const handleClearSelection = useCallback((buyerId: number) => {
    haptic.impactOccurred('light');
    
    setSelectedDiamonds(prev => {
      const newState = { ...prev };
      delete newState[buyerId];
      return newState;
    });
    
    toast({
      title: 'Selection cleared',
    });
  }, [haptic, toast]);

  // Open contact dialog with selected diamonds
  const handleContactBuyer = useCallback((buyerId: number) => {
    const selectedCount = selectedDiamonds[buyerId]?.size || 0;
    
    if (selectedCount === 0) {
      toast({
        title: 'No diamonds selected',
        description: 'Please select at least one diamond to send',
        variant: 'destructive',
      });
      return;
    }
    
    haptic.impactOccurred('medium');
    setSelectedBuyerId(buyerId);
  }, [selectedDiamonds, haptic, toast]);

  // Close contact dialog
  const handleCloseDialog = useCallback(() => {
    setSelectedBuyerId(null);
  }, []);

  // Get selected buyer and diamonds
  const selectedBuyerData = useMemo(() => {
    if (!selectedBuyerId) return null;
    
    const group = groupedNotifications.find(g => g.buyer.userId === selectedBuyerId);
    if (!group) return null;
    
    const selectedStocks = selectedDiamonds[selectedBuyerId] || new Set();
    const selectedMatches = group.matches.filter(m => selectedStocks.has(m.stock_number));
    
    return {
      ...group,
      selectedMatches,
    };
  }, [selectedBuyerId, groupedNotifications, selectedDiamonds]);

  // Handle successful message send
  const handleMessageSent = useCallback(() => {
    if (selectedBuyerId && selectedBuyerData) {
      // Mark notifications as read
      selectedBuyerData.notificationIds.forEach(id => markAsRead(id));
      
      // Clear selections
      handleClearSelection(selectedBuyerId);
    }
  }, [selectedBuyerId, selectedBuyerData, markAsRead, handleClearSelection]);

  if (isLoading && groupedNotifications.length === 0) {
    return (
      <TelegramMiniAppLayout>
        <div className="p-4 space-y-3">
          <NotificationSkeleton count={5} />
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
      
      <div className="p-4 space-y-4 pb-20">
        {/* Header */}
        <div className="space-y-3">
          <div className="flex items-center justify-between" dir="rtl">
            <div className="flex items-center gap-2">
              <div className="relative">
                <Bell className="h-6 w-6 text-primary" />
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
                <h1 className="text-xl font-bold text-foreground">
                  התראות התאמה
                </h1>
                <p className="text-sm text-muted-foreground">
                  קונים מעוניינים ביהלומים שלך
                </p>
              </div>
            </div>
            <Button 
              onClick={refetch} 
              variant="outline" 
              size="icon"
              disabled={isRefreshing}
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-card border rounded-lg p-3">
              <div className="flex items-center gap-1 mb-1">
                <Users className="h-3 w-3 text-primary" />
                <span className="text-xs text-muted-foreground">קונים</span>
              </div>
              <div className="text-xl font-bold text-primary">{stats.totalBuyers}</div>
            </div>
            <div className="bg-card border rounded-lg p-3">
              <div className="flex items-center gap-1 mb-1">
                <Bell className="h-3 w-3 text-primary" />
                <span className="text-xs text-muted-foreground">חדשות</span>
              </div>
              <div className="text-xl font-bold text-destructive">{stats.unreadCount}</div>
            </div>
            <div className="bg-card border rounded-lg p-3">
              <div className="flex items-center gap-1 mb-1">
                <Sparkles className="h-3 w-3 text-primary" />
                <span className="text-xs text-muted-foreground">יהלומים</span>
              </div>
              <div className="text-xl font-bold text-primary">{stats.totalDiamonds}</div>
            </div>
          </div>
        </div>

        {/* Notifications List */}
        {groupedNotifications.length === 0 ? (
          <div className="text-center py-12">
            <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">אין התראות חדשות</h3>
            <p className="text-sm text-muted-foreground">
              כשקונים יחפשו יהלומים שמתאימים למלאי שלך, תקבל התראה כאן
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {groupedNotifications.map((group) => (
              <div 
                key={group.buyer.userId}
                ref={(el) => {
                  if (el) cardRefs.current.set(group.buyer.userId, el);
                }}
              >
                <MatchNotificationCard
                  group={group}
                  selectedDiamonds={selectedDiamonds[group.buyer.userId] || new Set()}
                  onToggleDiamond={(stockNumber) => handleToggleDiamond(group.buyer.userId, stockNumber)}
                  onSelectAll={(stockNumbers) => handleSelectAll(group.buyer.userId, stockNumbers)}
                  onClearSelection={() => handleClearSelection(group.buyer.userId)}
                  onContactBuyer={() => handleContactBuyer(group.buyer.userId)}
                />
              </div>
            ))}
          </div>
        )}

        {/* Load More Button */}
        {hasMore && groupedNotifications.length > 0 && (
          <div className="flex justify-center py-4">
            <Button
              onClick={loadMore}
              variant="outline"
              disabled={isLoading}
              className="gap-2"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  טוען...
                </>
              ) : (
                <>
                  טען עוד התראות
                </>
              )}
            </Button>
          </div>
        )}
      </div>

      {/* Buyer Contact Dialog */}
      {selectedBuyerData && (
        <BuyerContactDialog
          open={!!selectedBuyerId}
          onOpenChange={handleCloseDialog}
          buyerId={selectedBuyerData.buyer.userId}
          buyerName={selectedBuyerData.buyer.name}
          notificationIds={selectedBuyerData.notificationIds}
          diamonds={selectedBuyerData.selectedMatches}
          searchQuery={selectedBuyerData.searchQuery}
          sellerTelegramId={getCurrentUserId() || 0}
          onMessageSent={handleMessageSent}
        />
      )}
    </TelegramMiniAppLayout>
  );
};

export default NotificationsPage;
