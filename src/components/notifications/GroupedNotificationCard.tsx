import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { MessageCircle, ChevronDown, ChevronUp, Diamond, User } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useTelegramHapticFeedback } from '@/hooks/useTelegramHapticFeedback';

interface DiamondMatch {
  stock_number: string;
  shape: string;
  weight: number;
  color: string;
  clarity: string;
  total_price?: number;
  price_per_carat: number;
  picture?: string;
  imageUrl?: string;
  lab?: string;
  certificate_number?: string;
  cut?: string;
}

interface BuyerInfo {
  userId: number;
  name: string;
  telegram_username?: string;
  phone?: string;
}

interface GroupedNotification {
  buyer: BuyerInfo;
  matches: DiamondMatch[];
  totalCount: number;
  latestTimestamp: string;
  notificationIds: string[];
}

interface GroupedNotificationCardProps {
  group: GroupedNotification;
  onContactBuyer: (buyerInfo: BuyerInfo) => void;
  onMarkAsRead: (notificationIds: string[]) => void;
}

export function GroupedNotificationCard({
  group,
  onContactBuyer,
  onMarkAsRead,
}: GroupedNotificationCardProps) {
  const [expanded, setExpanded] = useState(false);
  const { impactOccurred, selectionChanged } = useTelegramHapticFeedback();

  const handleToggle = () => {
    impactOccurred('light');
    selectionChanged();
    setExpanded(!expanded);
  };

  const handleContact = () => {
    impactOccurred('medium');
    onContactBuyer(group.buyer);
    onMarkAsRead(group.notificationIds);
  };

  const formatPrice = (diamond: DiamondMatch) => {
    const price = diamond.total_price || diamond.price_per_carat * diamond.weight;
    return price.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    });
  };

  const totalValue = group.matches.reduce(
    (sum, m) => sum + (m.total_price || m.price_per_carat * m.weight),
    0
  );

  return (
    <Card className="bg-gradient-to-br from-primary/10 via-blue-500/5 to-purple-500/5 border-2 border-primary/20 shadow-lg">
      {/* Collapsed Header */}
      <div
        onClick={handleToggle}
        className="p-4 cursor-pointer hover:bg-primary/5 transition-colors touch-manipulation"
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <Avatar className="h-12 w-12 border-2 border-primary shadow-sm">
              <AvatarFallback className="bg-primary/20 text-primary font-bold text-lg">
                {group.buyer.name[0].toUpperCase()}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 min-w-0">
              <p className="font-bold text-base truncate">{group.buyer.name}</p>
              <p className="text-xs text-muted-foreground truncate">
                {group.totalCount} diamonds • {formatDistanceToNow(new Date(group.latestTimestamp), { addSuffix: true })}
              </p>
              <p className="text-xs font-semibold text-primary mt-0.5">
                Total Value: ${totalValue.toLocaleString()}
              </p>
            </div>
          </div>

          <div className="flex flex-col items-end gap-2">
            <Badge variant="default" className="text-base px-3 py-1 font-bold">
              {group.totalCount}
            </Badge>
            {expanded ? (
              <ChevronUp className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            )}
          </div>
        </div>
      </div>

      {/* Expanded Content */}
      {expanded && (
        <CardContent className="pt-0 px-4 pb-4 space-y-3 border-t">
          {/* Diamond List */}
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {group.matches.map((match, idx) => (
              <div
                key={idx}
                className="bg-background/60 rounded-lg p-3 border border-border/50"
              >
                <div className="flex items-start justify-between gap-3">
                  {/* Diamond Image */}
                  {(match.picture || match.imageUrl) && (
                    <img
                      src={match.picture || match.imageUrl}
                      alt={`${match.shape} diamond`}
                      className="w-16 h-16 object-cover rounded-md border border-border flex-shrink-0"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  )}
                  
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    {!(match.picture || match.imageUrl) && (
                      <Diamond className="h-4 w-4 text-primary flex-shrink-0" />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold truncate">
                        {match.shape} {match.weight}ct
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {match.color} {match.clarity} • #{match.stock_number}
                      </p>
                    </div>
                  </div>
                  <p className="font-bold text-primary text-sm flex-shrink-0">
                    {formatPrice(match)}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Contact Button - Prominent */}
          <Button
            size="lg"
            onClick={handleContact}
            className="w-full h-14 text-base font-bold gap-2 bg-green-600 hover:bg-green-700 shadow-lg touch-manipulation"
          >
            <MessageCircle className="h-5 w-5" />
            📱 צ'אט עם {group.buyer.name}
          </Button>
        </CardContent>
      )}
    </Card>
  );
}
