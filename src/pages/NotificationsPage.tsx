
import React from 'react';
import { Layout } from '@/components/layout/Layout';
import { SmartNotificationCard } from '@/components/notifications/SmartNotificationCard';
import { useNotifications } from '@/hooks/useNotifications';
import { Bell, BellRing, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const NotificationsPage = () => {
  const { notifications, isLoading, markAsRead, contactCustomer, refetch } = useNotifications();
  
  const unreadCount = notifications.filter(n => !n.read).length;
  const diamondMatches = notifications.filter(n => n.type === 'diamond_match');

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

  return (
    <Layout>
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
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
            <div>
              <h1 className="text-3xl font-bold text-gray-900">התראות חכמות</h1>
              <p className="text-gray-600">
                קבל התראות כשמישהו מחפש יהלומים דומים למלאי שלך
              </p>
            </div>
          </div>
          
          <Button onClick={refetch} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            רענן
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <BellRing className="h-5 w-5 text-blue-600" />
              <span className="font-medium text-blue-900">התראות חדשות</span>
            </div>
            <div className="text-2xl font-bold text-blue-600 mt-1">{unreadCount}</div>
          </div>
          
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-green-600" />
              <span className="font-medium text-green-900">סה"כ התראות</span>
            </div>
            <div className="text-2xl font-bold text-green-600 mt-1">{notifications.length}</div>
          </div>
          
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-purple-600" />
              <span className="font-medium text-purple-900">התאמות יהלומים</span>
            </div>
            <div className="text-2xl font-bold text-purple-600 mt-1">{diamondMatches.length}</div>
          </div>
        </div>

        {/* Notifications List */}
        <div className="space-y-4">
          {notifications.length === 0 ? (
            <div className="text-center py-12">
              <Bell className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-gray-900 mb-2">אין התראות עדיין</h3>
              <p className="text-gray-600 max-w-md mx-auto">
                כשמישהו יחפש יהלומים דומים למלאי שלך, תקבל התראה כאן. 
                המערכת פועלת באופן אוטומטי ובזמן אמת.
              </p>
            </div>
          ) : (
            notifications.map((notification) => (
              <SmartNotificationCard
                key={notification.id}
                notification={notification}
                onMarkAsRead={markAsRead}
                onContactCustomer={contactCustomer}
              />
            ))
          )}
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 mb-2">איך זה עובד?</h3>
          <ul className="space-y-2 text-blue-800">
            <li className="flex items-start gap-2">
              <span className="font-bold">•</span>
              <span>כשמישהו מחפש יהלום בצ'אט, המערכת מנתחת אוטומטי את הבקשה</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold">•</span>
              <span>המערכת מחפשת התאמות במלאי של כל הסוחרים</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold">•</span>
              <span>אתה מקבל התראה מיידית על יהלומים דומים שיש לך במלאי</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold">•</span>
              <span>ציון ההתאמה מבוסס על צורה, צבע, בהירות, משקל ומחיר</span>
            </li>
          </ul>
        </div>
      </div>
    </Layout>
  );
};

export default NotificationsPage;
