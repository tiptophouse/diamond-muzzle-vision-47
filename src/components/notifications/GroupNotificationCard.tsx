
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MessageSquare, Users, Diamond, Phone, Mail, Clock, TrendingUp } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface GroupNotificationCardProps {
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

export function GroupNotificationCard({ 
  notification, 
  onMarkAsRead, 
  onContactCustomer 
}: GroupNotificationCardProps) {
  const isGroupRequest = notification.type === 'group_diamond_request';
  const metadata = notification.data;
  
  const handleContact = () => {
    if (onContactCustomer && metadata?.requester) {
      onContactCustomer({
        name: `${metadata.requester.first_name} ${metadata.requester.last_name || ''}`.trim(),
        telegram_username: metadata.requester.username,
        telegram_id: metadata.requester.id
      });
    }
  };

  const formatMatchingSummary = () => {
    if (!metadata?.matching_diamonds) return '';
    
    const diamonds = metadata.matching_diamonds;
    const shapes = [...new Set(diamonds.map(d => d.shape))];
    const caratRange = {
      min: Math.min(...diamonds.map(d => d.weight)),
      max: Math.max(...diamonds.map(d => d.weight))
    };
    
    return `${diamonds.length} matches: ${shapes.join(', ')} (${caratRange.min}-${caratRange.max}ct)`;
  };

  return (
    <Card className={`${notification.read ? 'bg-gray-50' : 'bg-blue-50 border-blue-200'} transition-all hover:shadow-md`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2 flex-1">
            {isGroupRequest ? (
              <Users className="h-5 w-5 text-blue-600" />
            ) : (
              <MessageSquare className="h-5 w-5 text-gray-600" />
            )}
            <div className="flex-1">
              <CardTitle className="text-lg">{notification.title}</CardTitle>
              {metadata?.group_title && (
                <p className="text-sm text-gray-600 mt-1">
                  From: {metadata.group_title}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              {!notification.read && (
                <Badge variant="default" className="bg-blue-600">
                  New
                </Badge>
              )}
              {isGroupRequest && (
                <Badge variant="outline" className="text-green-600 border-green-600">
                  <Diamond className="h-3 w-3 mr-1" />
                  Match Found
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Original Message */}
        <div className="bg-white p-3 rounded-lg border">
          <p className="text-sm font-medium text-gray-700 mb-1">Original Request:</p>
          <p className="text-gray-800">{metadata?.original_message || notification.message}</p>
        </div>

        {/* Matching Diamonds Summary */}
        {metadata?.matching_diamonds && (
          <div className="bg-green-50 p-3 rounded-lg border border-green-200">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <span className="font-medium text-green-800">Your Matches</span>
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                {Math.round(metadata.confidence_score * 100)}% confidence
              </Badge>
            </div>
            <p className="text-sm text-green-700">{formatMatchingSummary()}</p>
          </div>
        )}

        {/* Request Details */}
        {metadata?.request_details && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {metadata.request_details.shape && (
              <div className="text-center p-2 bg-gray-100 rounded">
                <p className="text-xs text-gray-600">Shape</p>
                <p className="font-medium">{metadata.request_details.shape}</p>
              </div>
            )}
            {(metadata.request_details.carat_min || metadata.request_details.carat_max) && (
              <div className="text-center p-2 bg-gray-100 rounded">
                <p className="text-xs text-gray-600">Carat</p>
                <p className="font-medium">
                  {metadata.request_details.carat_min?.toFixed(1)}-{metadata.request_details.carat_max?.toFixed(1)}
                </p>
              </div>
            )}
            {metadata.request_details.color && (
              <div className="text-center p-2 bg-gray-100 rounded">
                <p className="text-xs text-gray-600">Color</p>
                <p className="font-medium">{metadata.request_details.color.toUpperCase()}</p>
              </div>
            )}
            {metadata.request_details.clarity && (
              <div className="text-center p-2 bg-gray-100 rounded">
                <p className="text-xs text-gray-600">Clarity</p>
                <p className="font-medium">{metadata.request_details.clarity.toUpperCase()}</p>
              </div>
            )}
          </div>
        )}

        {/* Requester Info */}
        {metadata?.requester && (
          <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
            <p className="font-medium text-blue-800 mb-1">Requester</p>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm">{metadata.requester.first_name} {metadata.requester.last_name}</p>
                {metadata.requester.username && (
                  <p className="text-xs text-gray-600">@{metadata.requester.username}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-2 border-t">
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
            </div>
            {metadata?.message_timestamp && (
              <div>
                Group: {formatDistanceToNow(new Date(metadata.message_timestamp), { addSuffix: true })}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            {metadata?.requester && (
              <Button onClick={handleContact} size="sm" variant="outline">
                <MessageSquare className="h-4 w-4 mr-1" />
                Contact
              </Button>
            )}
            {!notification.read && (
              <Button onClick={() => onMarkAsRead(notification.id)} size="sm">
                Mark Read
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
