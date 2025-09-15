
import React from 'react';
import { TelegramMiniAppLayout } from '@/components/layout/TelegramMiniAppLayout';
import { SmartNotificationCard } from '@/components/notifications/SmartNotificationCard';
import { GroupNotificationCard } from '@/components/notifications/GroupNotificationCard';
import { BusinessNotificationCard } from '@/components/notifications/BusinessNotificationCard';
import { IncomingChatbotMessages } from '@/components/notifications/IncomingChatbotMessages';
import { TelegramNotificationsList } from '@/components/notifications/TelegramNotificationsList';

import { useFastApiNotifications } from '@/hooks/useFastApiNotifications';
import { useTelegramNotificationBridge } from '@/hooks/useTelegramNotificationBridge';
import { useDiamondSearch } from '@/hooks/useDiamondSearch';
import { useTelegramMessaging } from '@/hooks/useTelegramMessaging';
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { useTelegramHapticFeedback } from '@/hooks/useTelegramHapticFeedback';
import { useToast } from '@/hooks/use-toast';
import { Bell, BellRing, RefreshCw, Users, Diamond, Heart, TrendingUp, Search, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const NotificationsPage = () => {
  const { notifications, isLoading, markAsRead, contactCustomer, refetch } = useFastApiNotifications();
  const { simulateSearchFromBot, isLoading: isSearching } = useDiamondSearch();
  const { sendMessage, isLoading: isSendingMessage } = useTelegramMessaging();
  const { user } = useTelegramAuth();
  const haptic = useTelegramHapticFeedback();
  const { toast } = useToast();
  
  // Initialize Telegram notification bridge
  useTelegramNotificationBridge();
  
  const unreadCount = notifications.filter(n => !n.read).length;
  const businessNotifications = notifications.filter(n => 
    ['buyer_interest', 'interested_buyers', 'pair_match', 'diamond_pairs', 'group_demand', 'price_opportunity', 'price_opportunities'].includes(n.type)
  );
  const groupNotifications = notifications.filter(n => n.type === 'group_diamond_request');
  const diamondMatches = notifications.filter(n => n.type === 'diamond_match');
  const otherNotifications = notifications.filter(n => 
    !['buyer_interest', 'interested_buyers', 'pair_match', 'diamond_pairs', 'group_demand', 'price_opportunity', 'price_opportunities', 'group_diamond_request', 'diamond_match'].includes(n.type)
  );

  if (isLoading) {
    return (
      <TelegramMiniAppLayout>
        <div className="p-3">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
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
    setTimeout(() => refetch(), 1000);
  };

  return (
    <TelegramMiniAppLayout>
      <div className="p-3 space-y-4 pb-20">
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
            <TelegramNotificationsList
              notifications={notifications}
              onMarkAsRead={markAsRead}
              onMarkAllAsRead={() => {
                notifications.forEach(n => {
                  if (!n.read) markAsRead(n.id);
                });
              }}
              onContactCustomer={handleContactCustomer}
            />
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
                
                <Button onClick={refetch} variant="outline" size="sm" className="flex-1 text-xs">
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
