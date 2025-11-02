import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { MessageCircle, ChevronDown, ChevronUp, Diamond, User } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useTelegramHapticFeedback } from '@/hooks/useTelegramHapticFeedback';
import { ContactBuyerDialog } from './ContactBuyerDialog';
import { useContactBuyer } from '@/hooks/useContactBuyer';
import { getCurrentUserId } from '@/lib/api';

interface DiamondMatch {
  stock_number: string;
  shape: string;
  weight: number;
  color: string;
  clarity: string;
  total_price?: number;
  price_per_carat: number;
  cut?: string;
  picture?: string;
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
  const contactBuyer = useContactBuyer();

  const handleToggle = () => {
    impactOccurred('light');
    selectionChanged();
    setExpanded(!expanded);
  };

  const handleContact = () => {
    impactOccurred('medium');
    
    // Open the AI-powered contact dialog
    contactBuyer.openContactDialog({
      buyerId: group.buyer.userId,
      buyerName: group.buyer.name,
      notificationId: group.notificationIds[0],
      diamonds: group.matches.map(m => ({
        stock: m.stock_number,
        shape: m.shape,
        weight: m.weight,
        color: m.color,
        clarity: m.clarity,
        price_per_carat: m.price_per_carat,
        cut: m.cut,
        picture: m.picture,
      })),
    });
    
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
    <Card className="overflow-hidden bg-card border-border shadow-md hover:shadow-lg transition-all">
      {/* Header with buyer info */}
      <div className="p-4 bg-gradient-to-r from-primary/5 to-accent/5">
        <div className="flex items-start gap-3">
          <Avatar className="h-14 w-14 border-2 border-primary/20 shadow-sm flex-shrink-0">
            <AvatarFallback className="bg-primary text-primary-foreground font-bold text-xl">
              {group.buyer.name[0].toUpperCase()}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex-1 min-w-0">
                <p className="font-bold text-lg text-foreground truncate">
                  {group.buyer.name}
                </p>
                <p className="text-sm text-muted-foreground">
                  {formatDistanceToNow(new Date(group.latestTimestamp), { addSuffix: true })}
                </p>
              </div>
              <Badge 
                variant="secondary" 
                className="text-base font-bold px-3 py-1 bg-primary/10 text-primary border-primary/20 flex-shrink-0"
              >
                {group.totalCount}
              </Badge>
            </div>
            
            <div className="flex items-center gap-2 text-sm">
              <Diamond className="h-4 w-4 text-primary" />
              <span className="font-semibold text-foreground">
                {group.totalCount} {group.totalCount === 1 ? 'Diamond' : 'Diamonds'}
              </span>
              <span className="text-muted-foreground">•</span>
              <span className="font-bold text-primary">
                ${totalValue.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Button - Always Visible */}
      <div className="px-4 pt-3 pb-2">
        <Button
          size="lg"
          onClick={handleContact}
          className="w-full h-12 text-base font-semibold gap-2 bg-green-600 hover:bg-green-700 text-white shadow-md touch-manipulation"
        >
          <MessageCircle className="h-5 w-5" />
          Contact Buyer
        </Button>
      </div>

      {/* Toggle Diamond List */}
      <div 
        onClick={handleToggle}
        className="px-4 pb-3 cursor-pointer hover:bg-accent/50 transition-colors touch-manipulation"
      >
        <div className="flex items-center justify-center gap-2 py-2 text-sm text-muted-foreground font-medium">
          {expanded ? (
            <>
              <ChevronUp className="h-4 w-4" />
              Hide Diamond List
            </>
          ) : (
            <>
              <ChevronDown className="h-4 w-4" />
              View Diamond List
            </>
          )}
        </div>
      </div>

      {/* Expanded Diamond List */}
      {expanded && (
        <div className="px-4 pb-4 pt-0 border-t border-border/50">
          <div className="space-y-2 max-h-80 overflow-y-auto mt-3">
            {group.matches.map((match, idx) => (
              <div
                key={idx}
                className="bg-accent/30 rounded-lg p-3 border border-border/30 hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Diamond className="h-5 w-5 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-foreground">
                        {match.shape} {match.weight}ct
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {match.color} • {match.clarity}
                      </p>
                      <p className="text-xs text-muted-foreground/70 mt-0.5">
                        Stock #{match.stock_number}
                      </p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-bold text-base text-primary">
                      {formatPrice(match)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      ${match.price_per_carat.toLocaleString()}/ct
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Contact Buyer Dialog */}
      <ContactBuyerDialog
        open={contactBuyer.open}
        onOpenChange={contactBuyer.closeContactDialog}
        buyerId={contactBuyer.buyerId!}
        buyerName={contactBuyer.buyerName}
        notificationId={contactBuyer.notificationId}
        diamonds={contactBuyer.diamonds}
        searchQuery={contactBuyer.searchQuery}
        sellerTelegramId={getCurrentUserId() || 0}
      />
    </Card>
  );
}
