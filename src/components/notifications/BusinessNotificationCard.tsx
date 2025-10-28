
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Diamond, Users, TrendingUp, Phone, MessageSquare, Heart, DollarSign } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { he } from 'date-fns/locale';

interface BusinessNotificationCardProps {
  notification: {
    id: string;
    title: string;
    message: string;
    type: string;
    read: boolean;
    data?: any;
    created_at: string;
  };
  onMarkAsRead: (id: string) => void;
  onContactCustomer?: (customerInfo: any) => void;
  isLoading?: boolean;
}

export function BusinessNotificationCard({ 
  notification, 
  onMarkAsRead,
  onContactCustomer,
  isLoading = false
}: BusinessNotificationCardProps) {
  const metadata = notification.data;
  
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'buyer_interest':
        return <Heart className="h-5 w-5 text-pink-600" />;
      case 'pair_match':
        return <Diamond className="h-5 w-5 text-purple-600" />;
      case 'group_demand':
        return <Users className="h-5 w-5 text-green-600" />;
      case 'price_opportunity':
        return <TrendingUp className="h-5 w-5 text-orange-600" />;
      default:
        return <Diamond className="h-5 w-5 text-blue-600" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'buyer_interest':
        return 'bg-pink-50 border-pink-200';
      case 'pair_match':
        return 'bg-purple-50 border-purple-200';
      case 'group_demand':
        return 'bg-green-50 border-green-200';
      case 'price_opportunity':
        return 'bg-orange-50 border-orange-200';
      default:
        return 'bg-blue-50 border-blue-200';
    }
  };

  const handleContactBuyer = () => {
    if (onContactCustomer && metadata?.buyer_info) {
      onContactCustomer(metadata.buyer_info);
    }
  };

  return (
    <Card 
      className={`transition-all duration-200 ${
        notification.read ? 'opacity-75' : 'shadow-sm'
      } ${getTypeColor(notification.type)}`}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            {getTypeIcon(notification.type)}
            <div>
              <CardTitle className="text-sm flex items-center gap-2">
                {notification.title}
                {!notification.read && (
                  <Badge variant="secondary" className="text-xs">
                    חדש
                  </Badge>
                )}
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-1">
                {formatDistanceToNow(new Date(notification.created_at), { 
                  addSuffix: true,
                  locale: he 
                })}
              </p>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="text-xs">
          {notification.message}
        </div>

        {/* Buyer Interest Details */}
        {notification.type === 'buyer_interest' && metadata && (
          <div className="space-y-2 border-t pt-2">
            <div className="bg-card rounded-lg p-2 border">
              <h5 className="font-medium text-xs text-pink-800 mb-2">פרטי הקונה:</h5>
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span>שם: <span className="font-medium">{metadata.buyer_info?.name}</span></span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleContactBuyer}
                    className="h-6 text-xs"
                    disabled={isLoading}
                  >
                    <MessageSquare className="h-3 w-3 mr-1" />
                    {isLoading ? 'שולח...' : 'שלח הודעה'}
                  </Button>
                </div>
                <div>תקציב: <span className="font-medium text-green-600">${metadata.max_budget?.toLocaleString()}</span></div>
                <div className="text-xs text-muted-foreground">
                  דרישות: {metadata.requirements?.shape} {metadata.requirements?.carat_min}-{metadata.requirements?.carat_max}ct {metadata.requirements?.color} {metadata.requirements?.clarity}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Pair Match Details */}
        {notification.type === 'pair_match' && metadata && (
          <div className="space-y-3 border-t pt-3">
            <div className="bg-white rounded-lg p-3 border">
              <h5 className="font-medium text-sm text-purple-800 mb-2">פרטי הזוג:</h5>
              <div className="space-y-2 text-sm">
                <div>היהלום שלך: <span className="font-medium">{metadata.your_diamond}</span></div>
                <div>יהלום תואם: <span className="font-medium">{metadata.partner_diamond}</span></div>
                <div>סוחר: <span className="font-medium">{metadata.partner_dealer}</span></div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-purple-600">
                    {metadata.match_score}% התאמה
                  </Badge>
                  <span className="text-green-600 text-xs">עלייה בערך: {metadata.pair_value_increase}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Group Demand Details */}
        {notification.type === 'group_demand' && metadata && (
          <div className="space-y-3 border-t pt-3">
            <div className="bg-white rounded-lg p-3 border">
              <h5 className="font-medium text-sm text-green-800 mb-2">פרטי הביקוש:</h5>
              <div className="space-y-2 text-sm">
                <div>קטגוריה: <span className="font-medium">{metadata.demand_type} {metadata.carat_range}ct</span></div>
                <div>מספר קבוצות: <span className="font-medium">{metadata.groups_count}</span></div>
                <div>היהלומים שלך: <span className="font-medium">{metadata.matching_diamonds?.join(', ')}</span></div>
                <Badge variant="outline" className="text-green-600">
                  ביקוש {metadata.estimated_interest}
                </Badge>
              </div>
            </div>
          </div>
        )}

        {/* Price Opportunity Details */}
        {notification.type === 'price_opportunity' && metadata && (
          <div className="space-y-3 border-t pt-3">
            <div className="bg-white rounded-lg p-3 border">
              <h5 className="font-medium text-sm text-orange-800 mb-2">פרטי ההזדמנות:</h5>
              <div className="space-y-2 text-sm">
                <div>קטגוריה: <span className="font-medium">{metadata.category}</span></div>
                <div className="flex items-center gap-2">
                  <span>שינוי מחיר:</span>
                  <Badge variant="outline" className="text-green-600">
                    {metadata.price_change}
                  </Badge>
                </div>
                <div>היהלומים שלך: <span className="font-medium">{metadata.your_diamonds?.join(', ')}</span></div>
                <div>מגמת שוק: <span className="font-medium text-green-600">{metadata.market_trend}</span></div>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end pt-2 border-t gap-2">
          {metadata?.buyer_info && (
            <Button onClick={handleContactBuyer} size="sm" variant="outline" disabled={isLoading}>
              <MessageSquare className="h-3 w-3 mr-1" />
              {isLoading ? 'שולח...' : 'שלח הודעה'}
            </Button>
          )}
          {!notification.read && (
            <Button onClick={() => onMarkAsRead(notification.id)} size="sm" className="text-xs">
              סמן כנקרא
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
