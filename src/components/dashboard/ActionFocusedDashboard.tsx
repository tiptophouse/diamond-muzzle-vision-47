import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Phone, MessageCircle, Eye, TrendingUp, Gem, HandHeart, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useNotifications } from '@/hooks/useNotifications';
import { useTelegramWebApp } from '@/hooks/useTelegramWebApp';
import { cn } from '@/lib/utils';
import { Diamond } from '@/components/inventory/InventoryTable';

interface ActionFocusedDashboardProps {
  allDiamonds: Diamond[];
}

interface QuickStats {
  diamondCount: number;
  totalValue: number;
  dailyMatches: number;
  dealsThisMonth: number;
}

export function ActionFocusedDashboard({ allDiamonds }: ActionFocusedDashboardProps) {
  const navigate = useNavigate();
  const { notifications, markAsRead } = useNotifications();
  const { hapticFeedback } = useTelegramWebApp();
  const [expandedMatch, setExpandedMatch] = useState<string | null>(null);

  // Calculate realistic portfolio value
  const calculateRealisticValue = (diamonds: Diamond[]) => {
    return diamonds.reduce((sum, d) => {
      // Skip diamonds with invalid or unrealistic prices
      if (!d.price || d.price <= 0 || d.price > 100000) return sum;
      
      // Calculate realistic price based on carat weight and market rates
      const caratWeight = d.carat || 1;
      const basePrice = d.price;
      
      // Apply realistic caps based on carat size
      let cappedPrice = basePrice;
      if (caratWeight < 0.5) {
        cappedPrice = Math.min(basePrice, 5000);
      } else if (caratWeight < 1) {
        cappedPrice = Math.min(basePrice, 15000);
      } else if (caratWeight < 2) {
        cappedPrice = Math.min(basePrice, 35000);
      } else {
        cappedPrice = Math.min(basePrice, 75000);
      }
      
      return sum + cappedPrice;
    }, 0);
  };

  // Calculate quick stats
  const quickStats: QuickStats = {
    diamondCount: allDiamonds.length,
    totalValue: calculateRealisticValue(allDiamonds),
    dailyMatches: notifications.filter(n => 
      n.type === 'diamond_match' && 
      new Date(n.created_at).toDateString() === new Date().toDateString()
    ).length,
    dealsThisMonth: notifications.filter(n => 
      n.type === 'deal_closed' && 
      new Date(n.created_at).getMonth() === new Date().getMonth()
    ).length
  };

  // Get unread diamond matches
  const unreadMatches = notifications.filter(n => 
    n.type === 'diamond_match' && !n.read
  ).slice(0, 3);

  const formatValue = (value: number) => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
    return `$${value.toLocaleString()}`;
  };

  const handleCall = (customerInfo: any, notification: any) => {
    hapticFeedback.selection();
    if (customerInfo?.phone) {
      window.open(`tel:${customerInfo.phone}`);
      markAsRead(notification.id);
    }
  };

  const handleChat = (customerInfo: any, notification: any) => {
    hapticFeedback.selection();
    // Generate GPT response and create deep link
    const diamondData = notification.data?.matches?.[0];
    const message = `Hi! I have a perfect ${diamondData?.shape} ${diamondData?.weight}ct ${diamondData?.color} ${diamondData?.clarity} diamond that matches your search. Stock: ${diamondData?.stockNumber}. Price: ${formatValue(diamondData?.price || 0)}. Interested?`;
    
    if (customerInfo?.telegram_id) {
      // Create Telegram deep link
      const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(`https://t.me/your_bot?start=diamond_${diamondData?.stockNumber}`)}&text=${encodeURIComponent(message)}`;
      window.open(telegramUrl, '_blank');
      markAsRead(notification.id);
    }
  };

  const handleViewDetails = (notification: any) => {
    hapticFeedback.impact('light');
    setExpandedMatch(expandedMatch === notification.id ? null : notification.id);
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="p-4 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <div className="flex items-center gap-2 mb-2">
            <Gem className="h-4 w-4 text-primary" />
            <span className="text-xs font-medium text-muted-foreground">Diamonds</span>
          </div>
          <div className="text-xl font-bold text-foreground">{quickStats.diamondCount}</div>
          <div className="text-xs text-muted-foreground">{formatValue(quickStats.totalValue)} total</div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-4 w-4 text-green-600" />
            <span className="text-xs font-medium text-muted-foreground">Today</span>
          </div>
          <div className="text-xl font-bold text-foreground">{quickStats.dailyMatches}</div>
          <div className="text-xs text-muted-foreground">new matches</div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-500/20">
          <div className="flex items-center gap-2 mb-2">
            <HandHeart className="h-4 w-4 text-blue-600" />
            <span className="text-xs font-medium text-muted-foreground">This Month</span>
          </div>
          <div className="text-xl font-bold text-foreground">{quickStats.dealsThisMonth}</div>
          <div className="text-xs text-muted-foreground">deals closed</div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-orange-500/10 to-orange-500/5 border-orange-500/20">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="h-4 w-4 text-orange-600" />
            <span className="text-xs font-medium text-muted-foreground">Revenue</span>
          </div>
          <div className="text-xl font-bold text-foreground">{formatValue(quickStats.totalValue * 0.15)}</div>
          <div className="text-xs text-muted-foreground">potential monthly</div>
        </Card>
      </div>

      {/* Active Diamond Matches */}
      {unreadMatches.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <h2 className="text-lg font-semibold text-foreground">Active Matches</h2>
            <div className="bg-destructive text-destructive-foreground text-xs px-2 py-1 rounded-full font-medium">
              {unreadMatches.length}
            </div>
          </div>

          {unreadMatches.map((notification) => {
            const customerInfo = notification.data?.customer_info || notification.data?.searcher_info;
            const matches = notification.data?.matches || [];
            const topMatch = matches[0];
            const isExpanded = expandedMatch === notification.id;

            return (
              <Card 
                key={notification.id} 
                onClick={() => navigate(`/notifications?buyerId=${customerInfo?.telegram_id || customerInfo?.user_id}`)}
                className={cn(
                  "p-4 border-l-4 transition-all duration-200 cursor-pointer hover:shadow-xl",
                  "border-l-green-500 bg-green-500/5",
                  isExpanded && "shadow-lg"
                )}
              >
                <div className="space-y-3">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-foreground">New Diamond Match</span>
                        <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded-full">
                          {matches.length} match{matches.length !== 1 ? 'es' : ''}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {customerInfo?.first_name || 'Customer'} is looking for: {topMatch?.shape} {topMatch?.weight}ct
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(notification.created_at).toLocaleTimeString()}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewDetails(notification);
                      }}
                      className="shrink-0"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Quick Match Info */}
                  {topMatch && (
                    <div className="bg-background/50 rounded-lg p-3 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Your Match:</span>
                        <span className="font-medium">Stock #{topMatch.stockNumber}</span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {topMatch.shape} • {topMatch.weight}ct • {topMatch.color} • {topMatch.clarity}
                      </div>
                      {topMatch.price && (
                        <div className="text-sm font-medium text-green-600">
                          {formatValue(topMatch.price)}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Expanded Details */}
                  {isExpanded && matches.length > 1 && (
                    <div className="space-y-2 border-t pt-3">
                      <p className="text-sm font-medium text-muted-foreground">All Matches:</p>
                      {matches.slice(1).map((match, index) => (
                        <div key={index} className="text-xs bg-background/30 rounded p-2">
                          {match.shape} {match.weight}ct {match.color} {match.clarity} • Stock #{match.stockNumber}
                          {match.price && <span className="float-right text-green-600">{formatValue(match.price)}</span>}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-2">
                    {customerInfo?.phone && (
                      <Button
                        onClick={() => handleCall(customerInfo, notification)}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                        size="sm"
                      >
                        <Phone className="h-4 w-4 mr-2" />
                        Call
                      </Button>
                    )}
                    <Button
                      onClick={() => handleChat(customerInfo, notification)}
                      variant="outline"
                      className="flex-1"
                      size="sm"
                    >
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Chat
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Empty State */}
      {unreadMatches.length === 0 && (
        <Card className="p-8 text-center">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <Gem className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">All Caught Up!</h3>
          <p className="text-muted-foreground text-sm">
            No new diamond matches right now. We'll notify you when potential customers are looking for your diamonds.
          </p>
        </Card>
      )}
    </div>
  );
}