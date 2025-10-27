
import React, { memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MessageSquare, Users, Diamond, Phone, Mail, Clock, TrendingUp } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { QueriedDiamondsSection } from './QueriedDiamondsSection';
import { SimilarDiamondsTable } from './SimilarDiamondsTable';

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

const GroupNotificationCardComponent = ({
  notification, 
  onMarkAsRead, 
  onContactCustomer 
}: GroupNotificationCardProps) => {
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

  const handleBuyContacts = () => {
    // TODO: Implement buy contacts functionality
    console.log('Buy contacts clicked for:', metadata?.requester);
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
              {isGroupRequest && metadata?.matching_diamonds?.length > 0 && (
                <Badge variant="outline" className="text-green-600 border-green-600">
                  <Diamond className="h-3 w-3 mr-1" />
                  {metadata.matching_diamonds.length} Matches
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Queried Diamonds Section */}
        {metadata?.request_details && metadata?.original_message && (
          <QueriedDiamondsSection
            requestDetails={metadata.request_details}
            originalMessage={metadata.original_message}
          />
        )}

        {/* Similar Diamonds Table */}
        {metadata?.matching_diamonds && metadata.matching_diamonds.length > 0 && (
          <SimilarDiamondsTable
            diamonds={metadata.matching_diamonds}
            confidenceScore={metadata.confidence_score || 0}
          />
        )}

        {/* Requester Info */}
        {metadata?.requester && (
          <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
            <p className="font-medium text-purple-800 mb-2">Customer Information</p>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">{metadata.requester.first_name} {metadata.requester.last_name}</p>
                {metadata.requester.username && (
                  <p className="text-xs text-gray-600">@{metadata.requester.username}</p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Button onClick={handleBuyContacts} size="sm" variant="default" className="bg-purple-600 hover:bg-purple-700">
                  Buy Contacts
                </Button>
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
};

export const GroupNotificationCard = memo(GroupNotificationCardComponent, (prev, next) => {
  return (
    prev.notification.id === next.notification.id &&
    prev.notification.read === next.notification.read
  );
});
