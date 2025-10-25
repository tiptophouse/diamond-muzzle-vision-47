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
import { DirectTelegramMessage } from './DirectTelegramMessage';

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
  const [showDirectMessage, setShowDirectMessage] = useState(false);
  const { hapticFeedback, mainButton, showAlert, share, webApp } = useTelegramWebApp();
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

  const handleDirectContact = useCallback(() => {
    impactOccurred('medium');
    setShowDirectMessage(true);
  }, [impactOccurred]);

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

  const getBuyerTelegramId = () => {
    // Try ALL possible sources for buyer telegram ID
    const searcherInfo = metadata?.searcher_info;
    const customerInfo = metadata?.customer_info;
    
    const buyerId = searcherInfo?.telegram_id || 
           customerInfo?.telegram_id || 
           metadata?.user_id ||
           null;
    
    // 🔍 DEBUG LOGGING - Check buyer ID extraction
    console.log('🔍 BUYER ID EXTRACTION:', {
      buyerId,
      searcherInfo,
      customerInfo,
      metadata,
      notificationId: notification.id
    });
    
    return buyerId;
  };

  const getBuyerName = () => {
    const searcherInfo = metadata?.searcher_info;
    const customerInfo = metadata?.customer_info;
    
    return searcherInfo?.name || 
           customerInfo?.name || 
           searcherInfo?.first_name ||
           customerInfo?.first_name ||
           'Buyer';
  };

  const getBuyerUsername = () => {
    const searcherInfo = metadata?.searcher_info;
    const customerInfo = metadata?.customer_info;
    return searcherInfo?.telegram_username || customerInfo?.telegram_username || null;
  };

  const openChatByUsername = () => {
    const username = getBuyerUsername();
    if (!username) return;
    try {
      if (webApp && typeof (webApp as any).openTelegramLink === 'function') {
        (webApp as any).openTelegramLink(`https://t.me/${username}`);
      } else {
        window.open(`https://t.me/${username}`, '_blank');
      }
      impactOccurred('medium');
      toast({
        title: "פותח צ'אט",
        description: `פותח שיחה עם ${getBuyerName()}`,
      });
    } catch (error) {
      console.error('Failed to open chat via username:', error);
      toast({
        title: 'שגיאה',
        description: 'לא ניתן לפתוח צ׳אט בטלגרם כרגע',
        variant: 'destructive',
      });
    }
  };

  const quickReplyButtons = createQuickReplyButtons(notification);

  return (
    <Card 
      className={`
        transition-all duration-300 border backdrop-blur-sm w-full
        ${notification.read ? 'opacity-75' : 'shadow-lg'} 
        ${getTypeGradient(notification.type)}
        touch-manipulation
      `}
    >
      {/* Header - Mobile optimized */}
      <div className="p-3 pb-2">
        <div className="flex items-start justify-between mb-2 gap-2">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <div className="p-1.5 bg-background/50 rounded-full flex-shrink-0">
              {getTypeIcon(notification.type)}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-xs leading-tight truncate">{notification.title}</h3>
              <p className="text-[10px] text-muted-foreground truncate">
                {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
              </p>
            </div>
          </div>
          {!notification.read && (
            <Badge variant="secondary" className="bg-primary/20 text-primary text-[10px] px-1.5 py-0.5 flex-shrink-0">
              New
            </Badge>
          )}
        </div>
      </div>

      <CardContent className="pt-0 space-y-2 px-3 pb-3">
        {/* Message */}
        <p className="text-xs sm:text-sm text-foreground/90 leading-relaxed">
          {notification.message}
        </p>

        {/* CONTACT BUYER BUTTON - ALWAYS VISIBLE */}
        <div className="bg-gradient-to-br from-green-500/20 to-green-600/10 rounded-lg p-4 border-2 border-green-500/30 shadow-lg">
          {getBuyerTelegramId() ? (
            <>
              {!showDirectMessage ? (
                <>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="p-2 bg-green-500/20 rounded-full">
                      <User className="h-4 w-4 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-sm">👤 {getBuyerName()}</p>
                      <p className="text-xs text-muted-foreground">ID: {getBuyerTelegramId()}</p>
                    </div>
                  </div>
                  
                  <Button
                    size="lg"
                    onClick={handleDirectContact}
                    className="w-full h-12 text-base font-bold gap-2 bg-green-600 hover:bg-green-700"
                  >
                    <MessageCircle className="h-5 w-5" />
                    📱 שלח הודעה לקונה
                  </Button>
                </>
              ) : (
                <DirectTelegramMessage
                  recipientId={getBuyerTelegramId()!}
                  recipientName={getBuyerName()}
                  diamondInfo={topMatch ? {
                    stock_number: topMatch.stock_number,
                    shape: topMatch.shape,
                    weight: topMatch.weight,
                    color: topMatch.color,
                    clarity: topMatch.clarity,
                    price: topMatch.total_price || (topMatch.price_per_carat * topMatch.weight)
                  } : undefined}
                  onClose={() => setShowDirectMessage(false)}
                />
              )}
            </>
          ) : (
            <div className="text-center space-y-3">
              <p className="text-sm font-semibold text-destructive">⚠️ אין פרטי ID של הקונה</p>
              {getBuyerUsername() ? (
                <Button
                  size="lg"
                  onClick={openChatByUsername}
                  className="w-full h-12 text-base font-bold gap-2 bg-green-600 hover:bg-green-700"
                >
                  <MessageCircle className="h-5 w-5" />
                  📱 פתיחת צ'אט לפי שם משתמש (@{getBuyerUsername()})
                </Button>
              ) : (
                <details className="text-xs text-left">
                  <summary className="cursor-pointer text-muted-foreground">פרטי דיבאג</summary>
                  <pre className="mt-2 p-2 bg-background/50 rounded text-[10px] overflow-auto">
                    {JSON.stringify(metadata, null, 2)}
                  </pre>
                </details>
              )}
            </div>
          )}
        </div>

        {/* Diamond Match Details */}
        {isDiamondMatch && metadata && (
          <div className="space-y-3">
            
            {/* Top Match Highlight - Mobile optimized */}
            {topMatch && (
              <div className="bg-background/60 backdrop-blur-sm rounded-lg p-2.5 border border-border/50">
                <div className="flex items-center justify-between mb-2 gap-1">
                  <h4 className="font-medium text-xs flex items-center gap-1">
                    <Sparkles className="h-3 w-3" />
                    Best Match
                  </h4>
                  {topMatch.confidence && (
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                      {Math.round(topMatch.confidence * 100)}%
                    </Badge>
                  )}
                </div>
                
                <div className="grid grid-cols-2 gap-1.5 mb-2">
                  <div className="text-center bg-background/50 rounded p-1.5">
                    <p className="text-[10px] text-muted-foreground">Shape & Weight</p>
                    <p className="font-semibold text-xs">{topMatch.shape} {topMatch.weight}ct</p>
                  </div>
                  <div className="text-center bg-background/50 rounded p-1.5">
                    <p className="text-[10px] text-muted-foreground">Color & Clarity</p>
                    <p className="font-semibold text-xs">{topMatch.color} {topMatch.clarity}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between mb-2 px-1">
                  <div>
                    <p className="text-[10px] text-muted-foreground">Stock #{topMatch.stock_number}</p>
                    <p className="font-bold text-primary text-sm">{formatPrice(topMatch)}</p>
                  </div>
                  <Badge 
                    variant={topMatch.status === 'Available' ? 'default' : 'secondary'}
                    className="text-[10px] px-1.5 py-0"
                  >
                    {topMatch.status}
                  </Badge>
                </div>

                {/* Quick Actions - Mobile responsive grid */}
                <div className="grid grid-cols-2 gap-1.5">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleCopyDiamond(topMatch)}
                    className="h-8 text-[10px] px-2"
                  >
                    <Copy className="h-3 w-3 mr-0.5" />
                    Copy
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleShareDiamond(topMatch)}
                    className="h-8 text-[10px] px-2"
                  >
                    <Share className="h-3 w-3 mr-0.5" />
                    Share
                  </Button>
                  {(metadata?.customer_info || metadata?.searcher_info) && (
                    <Button
                      size="sm"
                      onClick={() => handleContactCustomer(topMatch)}
                      className="h-8 text-[10px] px-2"
                    >
                      <MessageCircle className="h-3 w-3 mr-0.5" />
                      Contact
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => {
                      setShowQuickReply(!showQuickReply);
                      impactOccurred('light');
                    }}
                    className="h-8 text-[10px] px-2"
                  >
                    <Bot className="h-3 w-3 mr-0.5" />
                    AI Reply
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

            {/* Additional Matches - Mobile optimized */}
            {matches.length > 1 && (
              <div className="bg-background/40 rounded-lg p-2">
                <h5 className="font-medium text-[10px] text-muted-foreground mb-1.5">
                  +{matches.length - 1} More Matches
                </h5>
                <div className="space-y-1">
                  {matches.slice(1, 3).map((match, index) => (
                    <div key={index} className="flex flex-col gap-0.5 text-[10px] p-1.5 bg-background/50 rounded">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-xs">#{match.stock_number}</span>
                        <span className="font-semibold text-primary text-xs">
                          {formatPrice(match)}
                        </span>
                      </div>
                      <span className="text-muted-foreground text-[10px]">
                        {match.shape} {match.weight}ct {match.color} {match.clarity}
                      </span>
                    </div>
                  ))}
                </div>
                {matches.length > 3 && (
                  <p className="text-[10px] text-muted-foreground text-center mt-1.5">
                    +{matches.length - 3} more available
                  </p>
                )}
              </div>
            )}

            {/* Quick Reply Buttons - Mobile optimized */}
            {quickReplyButtons.length > 0 && (
              <div className="bg-background/40 rounded-lg p-2">
                <h5 className="font-medium text-[10px] text-muted-foreground mb-2 flex items-center gap-1">
                  <Search className="h-3 w-3" />
                  חיפוש מהיר במלאי
                </h5>
                <div className="flex flex-wrap gap-1">
                  {quickReplyButtons.map((button, index) => (
                    <Button
                      key={index}
                      size="sm"
                      variant="outline"
                      onClick={() => handleQuickSearch(button.criteria)}
                      className="h-6 text-[10px] px-2"
                    >
                      {button.text}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Search Criteria - Mobile optimized */}
            {metadata.search_criteria && (
              <details className="bg-background/40 rounded-lg">
                <summary className="p-2 cursor-pointer text-[10px] font-medium">
                  Search Criteria
                </summary>
                <div className="px-2 pb-2">
                  <div className="grid grid-cols-2 gap-1 text-[10px]">
                    {Object.entries(metadata.search_criteria).map(([key, value]) => (
                      value && (
                        <div key={key} className="flex justify-between gap-1">
                          <span className="text-muted-foreground capitalize truncate">{key.replace('_', ' ')}:</span>
                          <span className="font-medium truncate">{String(value)}</span>
                        </div>
                      )
                    ))}
                  </div>
                </div>
              </details>
            )}
          </div>
        )}

        {/* Action Button - Mobile optimized */}
        {!notification.read && (
          <Button
            size="sm"
            variant="outline"
            onClick={handleMarkAsRead}
            className="w-full mt-2 h-8 text-xs"
          >
            Mark as Read
          </Button>
        )}
      </CardContent>
    </Card>
  );
}