
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Diamond, Users, TrendingUp, Phone } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { he } from 'date-fns/locale';

interface SmartNotificationCardProps {
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
}

export function SmartNotificationCard({ 
  notification, 
  onMarkAsRead,
  onContactCustomer 
}: SmartNotificationCardProps) {
  const isDiamondMatch = notification.type === 'diamond_match';
  const metadata = notification.data;
  
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'diamond_match':
        return <Diamond className="h-5 w-5 text-blue-600" />;
      case 'customer_inquiry':
        return <Users className="h-5 w-5 text-green-600" />;
      case 'buyer_interest':
      case 'wishlist_added':
        return <Diamond className="h-5 w-5 text-pink-600" />;
      case 'price_alert':
        return <TrendingUp className="h-5 w-5 text-orange-600" />;
      default:
        return <Diamond className="h-5 w-5 text-gray-600" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'diamond_match':
        return 'bg-blue-50 border-blue-200';
      case 'customer_inquiry':
        return 'bg-green-50 border-green-200';
      case 'buyer_interest':
      case 'wishlist_added':
        return 'bg-pink-50 border-pink-200';
      case 'price_alert':
        return 'bg-orange-50 border-orange-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const handleMarkAsRead = () => {
    if (!notification.read) {
      onMarkAsRead(notification.id);
    }
  };

  return (
    <Card 
      className={`transition-all duration-200 ${
        notification.read ? 'opacity-75' : 'shadow-md'
      } ${getTypeColor(notification.type)}`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            {getTypeIcon(notification.type)}
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                {notification.title}
                {!notification.read && (
                  <Badge variant="secondary" className="text-xs">
                    חדש
                  </Badge>
                )}
              </CardTitle>
              <CardDescription className="text-sm text-muted-foreground">
                {formatDistanceToNow(new Date(notification.created_at), { 
                  addSuffix: true,
                  locale: he 
                })}
              </CardDescription>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="whitespace-pre-line text-sm">
          {notification.message}
        </div>

        {isDiamondMatch && metadata && (
          <div className="space-y-3 border-t pt-3">
            <h4 className="font-medium text-sm">פרטי ההתאמות:</h4>
            
            {metadata.search_criteria && (
              <div className="bg-white rounded-lg p-3 border">
                <h5 className="font-medium text-xs text-muted-foreground mb-2">
                  קריטריוני החיפוש:
                </h5>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {metadata.search_criteria.shape && (
                    <div>צורה: <span className="font-medium">{metadata.search_criteria.shape}</span></div>
                  )}
                  {metadata.search_criteria.color && (
                    <div>צבע: <span className="font-medium">{metadata.search_criteria.color}</span></div>
                  )}
                  {metadata.search_criteria.clarity && (
                    <div>בהירות: <span className="font-medium">{metadata.search_criteria.clarity}</span></div>
                  )}
                  {(metadata.search_criteria.weight_min || metadata.search_criteria.weight_max) && (
                    <div>
                      משקל: <span className="font-medium">
                        {metadata.search_criteria.weight_min || 0}-{metadata.search_criteria.weight_max || '∞'} קרט
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {metadata.matches && metadata.matches.length > 0 && (
              <div className="bg-white rounded-lg p-3 border">
                <h5 className="font-medium text-xs text-muted-foreground mb-2">
                  היהלומים המתאימים שלך:
                </h5>
                <div className="space-y-2">
                  {metadata.matches.slice(0, 3).map((match: any, index: number) => (
                    <div key={index} className="flex items-center justify-between text-xs p-2 bg-gray-50 rounded">
                      <div>
                        <span className="font-medium">{match.stock_number}</span>
                        <span className="text-muted-foreground ml-2">
                          {match.shape} {match.weight}ct {match.color} {match.clarity}
                        </span>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {Math.round(match.match_score * 100)}% התאמה
                      </Badge>
                    </div>
                  ))}
                  {metadata.matches.length > 3 && (
                    <div className="text-xs text-muted-foreground text-center">
                      ועוד {metadata.matches.length - 3} התאמות...
                    </div>
                  )}
                </div>
              </div>
            )}

            {metadata.customer_info && (
              <div className="bg-white rounded-lg p-3 border">
                <h5 className="font-medium text-xs text-muted-foreground mb-2">
                  פרטי הלקוח:
                </h5>
                <div className="space-y-1 text-xs">
                  {metadata.customer_info.name && (
                    <div>שם: <span className="font-medium">{metadata.customer_info.name}</span></div>
                  )}
                  {metadata.customer_info.phone && (
                    <div className="flex items-center justify-between">
                      <span>טלפון: <span className="font-medium">{metadata.customer_info.phone}</span></span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onContactCustomer?.(metadata.customer_info)}
                        className="h-6 text-xs"
                      >
                        <Phone className="h-3 w-3 mr-1" />
                        צור קשר
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="flex justify-end pt-2">
          {!notification.read && (
            <Button
              size="sm"
              variant="outline"
              onClick={handleMarkAsRead}
              className="text-xs"
            >
              סמן כנקרא
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
