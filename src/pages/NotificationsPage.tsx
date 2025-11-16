import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TelegramMiniAppLayout } from '@/components/layout/TelegramMiniAppLayout';
import { useFastApiNotifications } from '@/hooks/useFastApiNotifications';
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { useTelegramHapticFeedback } from '@/hooks/useTelegramHapticFeedback';
import { useToast } from '@/hooks/use-toast';
import { usePullToRefresh } from '@/hooks/usePullToRefresh';
import { useTelegramWebApp } from '@/hooks/useTelegramWebApp';
import { ModernNotificationCard } from '@/components/notifications/ModernNotificationCard';
import { NotificationHeader } from '@/components/notifications/NotificationHeader';
import { EmptyNotificationsState } from '@/components/notifications/EmptyNotificationsState';
import { NotificationSkeleton } from '@/components/notifications/NotificationSkeleton';
import { BuyerContactDialog } from '@/components/notifications/BuyerContactDialog';
import { Button } from '@/components/ui/button';
import { getCurrentUserId } from '@/lib/api';
import { http } from '@/api/http';
import { apiEndpoints } from '@/lib/api/endpoints';
import { format, formatDistanceToNow } from 'date-fns';
import { he } from 'date-fns/locale';

const NotificationsPage = () => {
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
          apiEndpoints.getAllStones(userId),
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

  // Open contact dialog (removed diamond selection requirement)
  const handleContactBuyer = useCallback((buyerId: number) => {
    haptic.impactOccurred('medium');
    setSelectedBuyerId(buyerId);
  }, [haptic]);

  // Close contact dialog
  const handleCloseDialog = useCallback(() => {
    setSelectedBuyerId(null);
  }, []);

  // Get selected buyer and diamonds
  const selectedBuyerData = useMemo(() => {
    if (!selectedBuyerId) return null;
    
    const group = groupedNotifications.find(g => g.buyer.userId === selectedBuyerId);
    if (!group) return null;

    // Extract notification IDs
    const notificationIds = group.matches.map((m: any) => m.id);
    
    // Prepare diamonds for the dialog
    const diamonds = group.diamonds || [];
    
    return {
      buyerId: group.buyer.userId,
      buyerName: group.buyer.name,
      notificationIds,
      diamonds,
      searchQuery: group.matches[0]?.data?.search_query,
    };
  }, [selectedBuyerId, groupedNotifications]);

  // Handle successful message send
  const handleMessageSent = useCallback(() => {
    if (selectedBuyerId && selectedBuyerData) {
      // Mark notifications as read
      selectedBuyerData.notificationIds.forEach(id => markAsRead(id));
      
      // Clear selections
      handleClearSelection(selectedBuyerId);
    }
  }, [selectedBuyerId, selectedBuyerData, markAsRead, handleClearSelection]);

  return (
    <TelegramMiniAppLayout>
      <div className="min-h-screen bg-gradient-to-b from-background via-background to-secondary/20 pb-24">
        {/* Pull to refresh indicator */}
        <AnimatePresence>
          {isPulling && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: pullDistance * 0.3 }}
              exit={{ opacity: 0 }}
              className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-4"
            >
              <div className="bg-primary text-primary-foreground px-4 py-2 rounded-full shadow-large">
                {pullDistance >= 80 ? 'שחרר לרענון...' : 'משוך למטה...'}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="container mx-auto px-4 py-6 max-w-2xl">
          {/* Header */}
          <NotificationHeader
            totalNotifications={stats.totalBuyers}
            unreadCount={stats.unreadCount}
            totalDiamonds={stats.totalDiamonds}
            onRefresh={refetch}
            isRefreshing={isRefreshing || isLoading}
          />

          {/* Notifications list */}
          <div className="mt-6 space-y-3">
            {isLoading && notifications.length === 0 ? (
              // Loading skeletons
              Array.from({ length: 3 }).map((_, i) => (
                <NotificationSkeleton key={i} />
              ))
            ) : groupedNotifications.length === 0 ? (
              // Empty state
              <EmptyNotificationsState />
            ) : (
              // Notifications
              <AnimatePresence mode="popLayout">
                {groupedNotifications.map((group, index) => {
                  const isNew = group.matches.some((m: any) => !m.read);
                  const latestMatch = group.matches[0];
                  const timeAgo = formatDistanceToNow(new Date(latestMatch.created_at), {
                    addSuffix: true,
                    locale: he,
                  });

                  return (
                    <ModernNotificationCard
                      key={group.buyer.userId}
                      buyerName={group.buyer.name}
                      buyerId={group.buyer.userId}
                      diamondCount={group.totalDiamonds}
                      timestamp={timeAgo}
                      isNew={isNew}
                      searchQuery={latestMatch.data?.search_query}
                      onContact={() => handleContactBuyer(group.buyer.userId)}
                      onViewDetails={() => handleContactBuyer(group.buyer.userId)}
                      onGenerateMessage={() => {
                        haptic.impactOccurred('light');
                        handleContactBuyer(group.buyer.userId);
                      }}
                    />
                  );
                })}
              </AnimatePresence>
            )}

            {/* Load more button */}
            {hasMore && !isLoading && groupedNotifications.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="pt-4"
              >
                <Button
                  onClick={loadMore}
                  variant="outline"
                  className="w-full h-12 rounded-xl border-2 border-dashed hover:border-primary/50 hover:bg-primary/5 font-medium transition-all duration-300"
                >
                  טען עוד התראות
                </Button>
              </motion.div>
            )}
          </div>
        </div>

        {/* Buyer Contact Dialog */}
        <AnimatePresence>
          {selectedBuyerId && selectedBuyerData && user?.id && (
            <BuyerContactDialog
              open={!!selectedBuyerId}
              onOpenChange={(open) => {
                if (!open) handleCloseDialog();
              }}
              buyerId={selectedBuyerData.buyerId}
              buyerName={selectedBuyerData.buyerName}
              notificationIds={selectedBuyerData.notificationIds}
              diamonds={selectedBuyerData.diamonds}
              searchQuery={selectedBuyerData.searchQuery}
              sellerTelegramId={user.id}
              onMessageSent={handleMessageSent}
            />
          )}
        </AnimatePresence>
      </div>
    </TelegramMiniAppLayout>
  );
};

export default NotificationsPage;
