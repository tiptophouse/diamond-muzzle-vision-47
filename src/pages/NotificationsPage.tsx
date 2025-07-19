
import React from 'react';
import { Layout } from '@/components/layout/Layout';
import { SmartNotificationCard } from '@/components/notifications/SmartNotificationCard';
import { GroupNotificationCard } from '@/components/notifications/GroupNotificationCard';
import { BusinessNotificationCard } from '@/components/notifications/BusinessNotificationCard';
import { useNotifications } from '@/hooks/useNotifications';
import { useTelegramNotificationBridge } from '@/hooks/useTelegramNotificationBridge';
import { Bell, BellRing, RefreshCw, Users, Diamond, Heart, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const NotificationsPage = () => {
  const { notifications, isLoading, markAsRead, contactCustomer, refetch } = useNotifications();
  
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
      <Layout>
        <div className="max-w-4xl mx-auto p-6">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </Layout>
    );
  }

  const handleContactCustomer = (customerInfo: any) => {
    // Open Telegram chat with the user
    if (customerInfo.telegram_username) {
      window.open(`https://t.me/${customerInfo.telegram_username}`, '_blank');
    } else if (customerInfo.telegram_id) {
      window.open(`tg://user?id=${customerInfo.telegram_id}`, '_blank');
    } else if (customerInfo.phone) {
      window.open(`tel:${customerInfo.phone}`, '_blank');
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="relative flex-shrink-0">
              <Bell className="h-8 w-8 text-blue-600" />
              {unreadCount > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center text-xs p-0"
                >
                  {unreadCount}
                </Badge>
              )}
            </div>
            <div className="min-w-0 flex-1" dir="rtl">
              <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 leading-tight">
                התראות עסקיות חכמות
              </h1>
              <p className="text-sm sm:text-base text-gray-600 mt-1 leading-snug">
                קבל התראות על קונים מעוניינים, זוגות יהלומים וביקוש בקבוצות
              </p>
            </div>
          </div>
          
          <Button onClick={refetch} variant="outline" size="sm" className="flex-shrink-0">
            <RefreshCw className="h-4 w-4 mr-2" />
            רענן
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <BellRing className="h-5 w-5 text-blue-600" />
              <span className="font-medium text-blue-900">התראות חדשות</span>
            </div>
            <div className="text-2xl font-bold text-blue-600 mt-1">{unreadCount}</div>
          </div>
          
          <div className="bg-pink-50 border border-pink-200 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-pink-600" />
              <span className="font-medium text-pink-900">קונים מעוניינים</span>
            </div>
            <div className="text-2xl font-bold text-pink-600 mt-1">
              {businessNotifications.filter(n => n.type === 'buyer_interest' || n.type === 'interested_buyers').length}
            </div>
          </div>
          
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-green-600" />
              <span className="font-medium text-green-900">ביקוש בקבוצות</span>
            </div>
            <div className="text-2xl font-bold text-green-600 mt-1">
              {businessNotifications.filter(n => n.type === 'group_demand').length + groupNotifications.length}
            </div>
          </div>
          
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <Diamond className="h-5 w-5 text-purple-600" />
              <span className="font-medium text-purple-900">זוגות יהלומים</span>
            </div>
            <div className="text-2xl font-bold text-purple-600 mt-1">
              {businessNotifications.filter(n => n.type === 'pair_match' || n.type === 'diamond_pairs').length}
            </div>
          </div>

          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-orange-600" />
              <span className="font-medium text-orange-900">הזדמנות מחיר</span>
            </div>
            <div className="text-2xl font-bold text-orange-600 mt-1">
              {businessNotifications.filter(n => n.type === 'price_opportunity' || n.type === 'price_opportunities').length}
            </div>
          </div>
        </div>

        {/* Notifications List */}
        <div className="space-y-6">
          {/* Business Notifications */}
          {businessNotifications.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Diamond className="h-5 w-5 text-blue-600" />
                התראות עסקיות
              </h2>
              <div className="space-y-4">
                {businessNotifications.map((notification) => (
                  <BusinessNotificationCard
                    key={notification.id}
                    notification={notification}
                    onMarkAsRead={markAsRead}
                    onContactCustomer={handleContactCustomer}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Group Notifications */}
          {groupNotifications.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Users className="h-5 w-5 text-green-600" />
                בקשות מקבוצות B2B
              </h2>
              <div className="space-y-4">
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
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Bell className="h-5 w-5 text-blue-600" />
                התראות רגילות
              </h2>
              <div className="space-y-4">
                {[...diamondMatches, ...otherNotifications].map((notification) => (
                  <SmartNotificationCard
                    key={notification.id}
                    notification={notification}
                    onMarkAsRead={markAsRead}
                    onContactCustomer={contactCustomer}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {notifications.length === 0 && (
            <div className="text-center py-12">
              <Bell className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-gray-900 mb-2">אין התראות עדיין</h3>
              <p className="text-gray-600 max-w-md mx-auto">
                כשיהיו קונים מעוניינים, זוגות יהלומים או ביקוש בקבוצות, תקבל התראות כאן.
                המערכת פועלת באופן אוטומטי ובזמן אמת.
              </p>
            </div>
          )}
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 mb-2">התראות עסקיות חכמות</h3>
          <ul className="space-y-2 text-blue-800">
            <li className="flex items-start gap-2">
              <Heart className="h-4 w-4 mt-1 text-pink-600" />
              <span><strong>קונים מעוניינים:</strong> קבל התראות כשלקוחות מחפשים יהלומים דומים לשלך</span>
            </li>
            <li className="flex items-start gap-2">
              <Diamond className="h-4 w-4 mt-1 text-purple-600" />
              <span><strong>זוגות יהלומים:</strong> גלה הזדמנויות ליצור זוגות עם סוחרים אחרים</span>
            </li>
            <li className="flex items-start gap-2">
              <Users className="h-4 w-4 mt-1 text-green-600" />
              <span><strong>ביקוש בקבוצות:</strong> המערכת מנתחת ביקוש בקבוצות הטלגרם</span>
            </li>
            <li className="flex items-start gap-2">
              <TrendingUp className="h-4 w-4 mt-1 text-orange-600" />
              <span><strong>הזדמנויות מחיר:</strong> התראות על שינויי מחירים רלוונטיים למלאי שלך</span>
            </li>
          </ul>
        </div>
      </div>
    </Layout>
  );
};

export default NotificationsPage;
