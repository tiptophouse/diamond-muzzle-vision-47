import React, { useCallback, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Diamond, TrendingUp, Users, Sparkles, Copy, Share, MessageCircle, Search, User, Phone, Bot } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useTelegramWebApp } from '@/hooks/useTelegramWebApp';
import { useTelegramHapticFeedback } from '@/hooks/useTelegramHapticFeedback';
import { useToast } from '@/hooks/use-toast';
import { useInventoryQuickSearch } from '@/hooks/useInventoryQuickSearch';
import { useInventoryData } from '@/hooks/useInventoryData';
import { QuickReplyWithGPT } from './QuickReplyWithGPT';

interface DiamondMatch {
  stock_number: string;
  shape: string;
  weight: number;
  color: string;
  clarity: string;
  cut?: string;
  price_per_carat: number;
  status: string;
  confidence?: number;
  total_price?: number;
}

interface TelegramDiamondNotificationCardProps {
  notification: {
    id: string;
    title: string;
    message: string;
    type: string;
    read: boolean;
    data?: {
      search_criteria?: any;
      matches?: DiamondMatch[];
      customer_info?: any;
      searcher_info?: any;
      confidence_score?: number;
      user_id?: number;
      search_query?: string;
    };
    created_at: string;
  };
  onMarkAsRead: (id: string) => void;
  onContactCustomer?: (customerInfo: any, diamond?: DiamondMatch) => void;
}

export function TelegramDiamondNotificationCard({ 
  notification, 
  onMarkAsRead,
  onContactCustomer 
}: TelegramDiamondNotificationCardProps) {
  const [showQuickReply, setShowQuickReply] = useState(false);
  const { hapticFeedback, mainButton, showAlert, share } = useTelegramWebApp();
  const { impactOccurred, notificationOccurred, selectionChanged } = useTelegramHapticFeedback();
  const { toast } = useToast();
  const { allDiamonds } = useInventoryData();
  const { searchByCriteria, createQuickReplyButtons } = useInventoryQuickSearch(allDiamonds);
  
  const isDiamondMatch = notification.type === 'diamond_match';
  const metadata = notification.data;
  const matches = metadata?.matches || [];
  const topMatch = matches[0];

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'diamond_match':
        return <Diamond className="h-4 w-4" />;
      case 'customer_inquiry':
        return <Users className="h-4 w-4" />;
      case 'buyer_interest':
      case 'wishlist_added':
        return <Sparkles className="h-4 w-4" />;
      case 'price_alert':
        return <TrendingUp className="h-4 w-4" />;
      default:
        return <Diamond className="h-4 w-4" />;
    }
  };

  const getTypeGradient = (type: string) => {
    switch (type) {
      case 'diamond_match':
        return 'bg-gradient-to-br from-blue-500/10 to-blue-600/20 border-blue-200/50';
      case 'customer_inquiry':
        return 'bg-gradient-to-br from-green-500/10 to-green-600/20 border-green-200/50';
      case 'buyer_interest':
      case 'wishlist_added':
        return 'bg-gradient-to-br from-pink-500/10 to-pink-600/20 border-pink-200/50';
      case 'price_alert':
        return 'bg-gradient-to-br from-orange-500/10 to-orange-600/20 border-orange-200/50';
      default:
        return 'bg-gradient-to-br from-gray-500/10 to-gray-600/20 border-gray-200/50';
    }
  };

  const handleMarkAsRead = useCallback(() => {
    if (!notification.read) {
      impactOccurred('light');
      onMarkAsRead(notification.id);
      notificationOccurred('success');
    }
  }, [notification.read, notification.id, onMarkAsRead, impactOccurred, notificationOccurred]);

  const handleContactCustomer = useCallback((diamond?: DiamondMatch) => {
    impactOccurred('medium');
    onContactCustomer?.(metadata?.customer_info || metadata?.searcher_info, diamond);
    selectionChanged();
  }, [metadata?.customer_info, metadata?.searcher_info, onContactCustomer, impactOccurred, selectionChanged]);

  const handleDirectContact = useCallback((userId: number) => {
    impactOccurred('medium');
    
    // Try different Telegram contact methods
    if (window.Telegram?.WebApp) {
      // Use Telegram Web App API to open user profile
      window.open(`tg://user?id=${userId}`, '_blank');
    } else {
      // Fallback to opening in new window
      window.open(`https://t.me/user/${userId}`, '_blank');
    }
    
    toast({
      title: "פותח צ'אט",
      description: `פותח שיחה עם משתמש ${userId}`,
    });
  }, [impactOccurred, toast]);

  const handleQuickSearch = useCallback((criteria: any) => {
    impactOccurred('light');
    const result = searchByCriteria(criteria);
    
    toast({
      title: `🔍 נמצאו ${result.matches.length} יהלומים`,
      description: result.searchText,
    });
  }, [impactOccurred, searchByCriteria, toast]);

  const handleCopyDiamond = useCallback((diamond: DiamondMatch) => {
    const diamondText = `💎 ${diamond.shape} ${diamond.weight}ct ${diamond.color} ${diamond.clarity}\n💰 $${(diamond.total_price || diamond.price_per_carat * diamond.weight).toLocaleString()}\n📦 Stock: ${diamond.stock_number}`;
    
    navigator.clipboard.writeText(diamondText).then(() => {
      notificationOccurred('success');
      toast({
        title: "Copied to clipboard",
        description: `Diamond ${diamond.stock_number} details copied`,
      });
    });
  }, [notificationOccurred, toast]);

  const handleShareDiamond = useCallback((diamond: DiamondMatch) => {
    const shareText = `💎 Premium Diamond Available\n\n${diamond.shape} ${diamond.weight}ct ${diamond.color} ${diamond.clarity}\nPrice: $${(diamond.total_price || diamond.price_per_carat * diamond.weight).toLocaleString()}\nStock: ${diamond.stock_number}`;
    
    if (share) {
      share(shareText);
    } else {
      navigator.share?.({
        title: 'Premium Diamond',
        text: shareText
      });
    }
    impactOccurred('medium');
  }, [share, impactOccurred]);

  const formatPrice = (diamond: DiamondMatch) => {
    const price = diamond.total_price || (diamond.price_per_carat * diamond.weight);
    return price.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
  };

  const getUserInfo = () => {
    const searcherInfo = metadata?.searcher_info;
    const customerInfo = metadata?.customer_info;
    const userId = searcherInfo?.telegram_id || customerInfo?.telegram_id || metadata?.user_id;
    
    return {
      userId,
      name: searcherInfo?.name || customerInfo?.name || 'לקוח מעוניין',
      telegram_username: searcherInfo?.telegram_username || customerInfo?.telegram_username,
      phone: searcherInfo?.phone || customerInfo?.phone
    };
  };

  const quickReplyButtons = createQuickReplyButtons(notification);

  return (
    <Card 
      className={`
        transition-all duration-300 border backdrop-blur-sm
        ${notification.read ? 'opacity-75' : 'shadow-lg'} 
        ${getTypeGradient(notification.type)}
        touch-manipulation
      `}
    >
      {/* Header */}
      <div className="p-4 pb-2">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-background/50 rounded-full">
              {getTypeIcon(notification.type)}
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-sm leading-tight">{notification.title}</h3>
              <p className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
              </p>
            </div>
          </div>
          {!notification.read && (
            <Badge variant="secondary" className="bg-primary/20 text-primary text-xs px-2 py-1">
              New
            </Badge>
          )}
        </div>
      </div>

      <CardContent className="pt-0 space-y-3">
        {/* Message */}
        <p className="text-sm text-foreground/90 leading-relaxed">
          {notification.message}
        </p>

        {/* User Contact Info */}
        {getUserInfo().userId && (
          <div className="bg-background/60 backdrop-blur-sm rounded-lg p-3 border border-border/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="font-medium text-sm">{getUserInfo().name}</p>
                  <p className="text-xs text-muted-foreground">ID: {getUserInfo().userId}</p>
                </div>
              </div>
              <div className="flex gap-1">
                <Button
                  size="sm"
                  onClick={() => handleDirectContact(getUserInfo().userId!)}
                  className="h-8 px-3"
                >
                  <MessageCircle className="h-3 w-3 mr-1" />
                  צ'אט
                </Button>
                {getUserInfo().phone && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => window.open(`tel:${getUserInfo().phone}`, '_blank')}
                    className="h-8 px-3"
                  >
                    <Phone className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Diamond Match Details */}
        {isDiamondMatch && metadata && (
          <div className="space-y-3">
            
            {/* Top Match Highlight */}
            {topMatch && (
              <div className="bg-background/60 backdrop-blur-sm rounded-lg p-3 border border-border/50">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-sm flex items-center gap-1">
                    <Sparkles className="h-3 w-3" />
                    Best Match
                  </h4>
                  {topMatch.confidence && (
                    <Badge variant="outline" className="text-xs">
                      {Math.round(topMatch.confidence * 100)}% match
                    </Badge>
                  )}
                </div>
                
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <div className="text-center bg-background/50 rounded p-2">
                    <p className="text-xs text-muted-foreground">Shape & Weight</p>
                    <p className="font-semibold text-sm">{topMatch.shape} {topMatch.weight}ct</p>
                  </div>
                  <div className="text-center bg-background/50 rounded p-2">
                    <p className="text-xs text-muted-foreground">Color & Clarity</p>
                    <p className="font-semibold text-sm">{topMatch.color} {topMatch.clarity}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-xs text-muted-foreground">Stock #{topMatch.stock_number}</p>
                    <p className="font-bold text-primary">{formatPrice(topMatch)}</p>
                  </div>
                  <Badge 
                    variant={topMatch.status === 'Available' ? 'default' : 'secondary'}
                    className="text-xs"
                  >
                    {topMatch.status}
                  </Badge>
                </div>

                {/* Quick Actions */}
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleCopyDiamond(topMatch)}
                    className="flex-1 h-8 text-xs"
                  >
                    <Copy className="h-3 w-3 mr-1" />
                    Copy
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleShareDiamond(topMatch)}
                    className="flex-1 h-8 text-xs"
                  >
                    <Share className="h-3 w-3 mr-1" />
                    Share
                  </Button>
                  {(metadata?.customer_info || metadata?.searcher_info) && (
                    <Button
                      size="sm"
                      onClick={() => handleContactCustomer(topMatch)}
                      className="flex-1 h-8 text-xs"
                    >
                      <MessageCircle className="h-3 w-3 mr-1" />
                      Contact
                    </Button>
                  )}
                  {/* Quick Reply with GPT Button */}
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => {
                      setShowQuickReply(!showQuickReply);
                      impactOccurred('light');
                    }}
                    className="flex-1 h-8 text-xs"
                  >
                    <Bot className="h-3 w-3 mr-1" />
                    Quick Reply
                  </Button>
                </div>
              </div>
            )}

            {/* Quick Reply with GPT Component */}
            {showQuickReply && isDiamondMatch && (
              <QuickReplyWithGPT 
                notification={notification}
                onMessageSent={() => {
                  setShowQuickReply(false);
                  toast({
                    title: "Message Sent",
                    description: "Your reply has been sent to the customer",
                  });
                }}
              />
            )}

            {/* Additional Matches */}
            {matches.length > 1 && (
              <div className="bg-background/40 rounded-lg p-3">
                <h5 className="font-medium text-xs text-muted-foreground mb-2">
                  +{matches.length - 1} More Matches
                </h5>
                <div className="grid grid-cols-1 gap-1">
                  {matches.slice(1, 3).map((match, index) => (
                    <div key={index} className="flex items-center justify-between text-xs p-2 bg-background/50 rounded">
                      <span className="font-medium">{match.stock_number}</span>
                      <span className="text-muted-foreground">
                        {match.shape} {match.weight}ct {match.color} {match.clarity}
                      </span>
                      <span className="font-semibold text-primary">
                        {formatPrice(match)}
                      </span>
                    </div>
                  ))}
                </div>
                {matches.length > 3 && (
                  <p className="text-xs text-muted-foreground text-center mt-2">
                    +{matches.length - 3} more matches available
                  </p>
                )}
              </div>
            )}

            {/* Quick Reply Buttons */}
            {quickReplyButtons.length > 0 && (
              <div className="bg-background/40 rounded-lg p-3">
                <h5 className="font-medium text-xs text-muted-foreground mb-3 flex items-center gap-1">
                  <Search className="h-3 w-3" />
                  חיפוש מהיר במלאי שלך
                </h5>
                <div className="flex flex-wrap gap-2">
                  {quickReplyButtons.map((button, index) => (
                    <Button
                      key={index}
                      size="sm"
                      variant="outline"
                      onClick={() => handleQuickSearch(button.criteria)}
                      className="h-7 text-xs"
                    >
                      {button.text}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Search Criteria */}
            {metadata.search_criteria && (
              <details className="bg-background/40 rounded-lg">
                <summary className="p-3 cursor-pointer text-xs font-medium">
                  Search Criteria
                </summary>
                <div className="px-3 pb-3">
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {Object.entries(metadata.search_criteria).map(([key, value]) => (
                      value && (
                        <div key={key} className="flex justify-between">
                          <span className="text-muted-foreground capitalize">{key.replace('_', ' ')}:</span>
                          <span className="font-medium">{String(value)}</span>
                        </div>
                      )
                    ))}
                  </div>
                </div>
              </details>
            )}
          </div>
        )}

        {/* Action Button */}
        {!notification.read && (
          <Button
            size="sm"
            variant="outline"
            onClick={handleMarkAsRead}
            className="w-full mt-3 h-9 text-sm"
          >
            Mark as Read
          </Button>
        )}
      </CardContent>
    </Card>
  );
}