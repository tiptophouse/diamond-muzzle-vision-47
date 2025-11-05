import React, { useState, useEffect, useCallback } from 'react';
import { TelegramMiniAppLayout } from '@/components/layout/TelegramMiniAppLayout';
import { useFastApiNotifications } from '@/hooks/useFastApiNotifications';
import { useSellerMessageGeneration } from '@/hooks/useSellerMessageGeneration';
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { useEnhancedTelegramWebApp } from '@/hooks/useEnhancedTelegramWebApp';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { 
  Sparkles, 
  Send, 
  RefreshCw, 
  Image as ImageIcon, 
  MessageSquare,
  CheckCircle2,
  Diamond,
  User,
  Zap,
  Eye,
  Copy,
  ChevronRight
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export default function NotificationPageFeatureTesting() {
  const { notifications, isLoading, refetch } = useFastApiNotifications();
  const { generateMessages, sendMessageToBuyer, generatedMessages, isGenerating, isSending } = useSellerMessageGeneration();
  const { user } = useTelegramAuth();
  const { webApp, isInitialized, haptics, navigation, utils } = useEnhancedTelegramWebApp();

  const [selectedNotification, setSelectedNotification] = useState<any>(null);
  const [selectedMessage, setSelectedMessage] = useState<string>('');
  const [selectedDiamonds, setSelectedDiamonds] = useState<string[]>([]);
  const [customMessage, setCustomMessage] = useState<string>('');

  // Telegram SDK Integration - Setup Main Button
  useEffect(() => {
    if (!isInitialized || !webApp) return;

    // Show back button
    navigation.showBackButton(() => {
      haptics.light();
      window.history.back();
    });

    // Setup main button for sending message
    if (selectedNotification && (selectedMessage || customMessage)) {
      navigation.showMainButton(
        'שלח הודעה ללקוח 💎',
        handleSendMessage,
        'active'
      );
    } else {
      navigation.hideMainButton();
    }

    return () => {
      navigation.hideBackButton();
      navigation.hideMainButton();
    };
  }, [isInitialized, webApp, selectedNotification, selectedMessage, customMessage]);

  // Pull to refresh
  useEffect(() => {
    if (!webApp) return;

    const handleRefresh = () => {
      haptics.light();
      refetch();
    };

    // Simulate pull to refresh trigger
    const refreshInterval = setInterval(() => {
      if (document.documentElement.scrollTop === 0) {
        // At top of page - could trigger refresh
      }
    }, 1000);

    return () => clearInterval(refreshInterval);
  }, [webApp, haptics, refetch]);

  const handleNotificationSelect = useCallback((notification: any) => {
    haptics.medium();
    setSelectedNotification(notification);
    setSelectedMessage('');
    setSelectedDiamonds([]);
    setCustomMessage('');

    // Scroll to message generation section
    setTimeout(() => {
      document.getElementById('message-generation')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  }, [haptics]);

  const handleGenerateMessages = useCallback(async () => {
    if (!selectedNotification || !user) return;

    haptics.success();

    const buyerInfo = selectedNotification.data?.searcher_info;
    const diamonds = selectedNotification.data?.matches || [];

    await generateMessages({
      buyerName: buyerInfo?.name || 'לקוח',
      buyerTelegramId: buyerInfo?.telegram_id,
      searchQuery: selectedNotification.search_query,
      matchedDiamonds: diamonds,
      sellerName: user.first_name || 'המוכר',
    });

    haptics.success();
  }, [selectedNotification, user, generateMessages, haptics]);

  const handleSendMessage = useCallback(async () => {
    if (!selectedNotification) return;

    const buyerTelegramId = selectedNotification.data?.searcher_info?.telegram_id;
    if (!buyerTelegramId) {
      toast.error('לא נמצא מזהה טלגרם של הקונה');
      haptics.error();
      return;
    }

    haptics.heavy();

    const messageToSend = customMessage || selectedMessage;
    
    // Extract full diamond data for selected diamonds
    const diamondsToSend = selectedDiamonds
      .map(stockNum => {
        const diamond = selectedNotification.data?.matches?.find((d: any) => d.stock_number === stockNum);
        if (!diamond) return null;
        
        return {
          stock_number: diamond.stock_number,
          shape: diamond.shape || 'ROUND',
          carat: diamond.carat || diamond.weight || 1.0,
          color: diamond.color || 'D',
          clarity: diamond.clarity || 'VVS1',
          cut: diamond.cut || 'Excellent',
          price: diamond.price || (diamond.price_per_carat * (diamond.carat || diamond.weight || 1.0)),
          picture: diamond.picture,
          certificate_url: diamond.certificate_url
        };
      })
      .filter(Boolean);

    const success = await sendMessageToBuyer(buyerTelegramId, messageToSend, diamondsToSend);

    if (success) {
      haptics.success();
      utils.showAlert('הודעה נשלחה בהצלחה! ✅');
      
      // Reset selection after sending
      setTimeout(() => {
        setSelectedNotification(null);
        setSelectedMessage('');
        setSelectedDiamonds([]);
        setCustomMessage('');
      }, 1500);
    } else {
      haptics.error();
    }
  }, [selectedNotification, selectedMessage, customMessage, selectedDiamonds, sendMessageToBuyer, haptics, utils]);

  const handleDiamondToggle = useCallback((stockNumber: string) => {
    haptics.selection();
    setSelectedDiamonds(prev => 
      prev.includes(stockNumber) 
        ? prev.filter(s => s !== stockNumber)
        : [...prev, stockNumber]
    );
  }, [haptics]);

  const handleCopyMessage = useCallback((message: string) => {
    navigator.clipboard.writeText(message);
    haptics.success();
    toast.success('הועתק ללוח');
  }, [haptics]);

  if (isLoading) {
    return (
      <TelegramMiniAppLayout>
        <div className="p-4 space-y-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </TelegramMiniAppLayout>
    );
  }

  const diamondMatchNotifications = notifications.filter(n => 
    n.type === 'diamond_match' && n.data?.searcher_info?.telegram_id
  );

  return (
    <TelegramMiniAppLayout>
      <div className="min-h-screen pb-24">
        {/* Header */}
        <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-background p-6 space-y-4 sticky top-0 z-10 backdrop-blur-lg border-b">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Sparkles className="h-6 w-6 text-primary animate-pulse" />
                התראות AI חכמות
              </h1>
              <p className="text-sm text-muted-foreground">
                צור הודעות מותאמות אישית עם AI ושלח ללקוחות
              </p>
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={() => {
                haptics.light();
                refetch();
              }}
              disabled={isLoading}
            >
              <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
            </Button>
          </div>

          <div className="flex gap-2">
            <div className="flex-1 bg-card rounded-lg p-3 border">
              <div className="text-xs text-muted-foreground">התראות פעילות</div>
              <div className="text-2xl font-bold text-primary">{diamondMatchNotifications.length}</div>
            </div>
            <div className="flex-1 bg-card rounded-lg p-3 border">
              <div className="text-xs text-muted-foreground">ממתינות לתגובה</div>
              <div className="text-2xl font-bold text-orange-500">
                {diamondMatchNotifications.filter(n => !n.read).length}
              </div>
            </div>
          </div>
        </div>

        {/* Notifications List */}
        <div className="p-4 space-y-3">
          {diamondMatchNotifications.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <MessageSquare className="h-12 w-12 text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground">אין התראות חדשות כרגע</p>
                <p className="text-sm text-muted-foreground mt-2">
                  התראות חדשות יופיעו כאן כשלקוחות יחפשו יהלומים
                </p>
              </CardContent>
            </Card>
          ) : (
            diamondMatchNotifications.map((notification) => {
              const buyerInfo = notification.data?.searcher_info;
              const diamonds = notification.data?.matches || [];
              const isSelected = selectedNotification?.id === notification.id;

              return (
                <Card
                  key={notification.id}
                  className={cn(
                    "cursor-pointer transition-all hover:shadow-lg",
                    isSelected && "ring-2 ring-primary shadow-lg"
                  )}
                  onClick={() => handleNotificationSelect(notification)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <User className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-base">{buyerInfo?.name || 'לקוח'}</CardTitle>
                          <CardDescription className="text-xs">
                            @{buyerInfo?.telegram_username || `user${buyerInfo?.telegram_id}`}
                          </CardDescription>
                        </div>
                      </div>
                      {!notification.read && (
                        <Badge variant="destructive" className="text-xs">חדש</Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Diamond className="h-4 w-4" />
                      <span>{diamonds.length} יהלומים תואמים</span>
                    </div>

                    {/* Diamond Preview Grid */}
                    <div className="grid grid-cols-3 gap-2">
                      {diamonds.slice(0, 3).map((diamond: any) => (
                        <div
                          key={diamond.stock_number}
                          className="relative aspect-square rounded-lg overflow-hidden bg-muted"
                        >
                          {diamond.picture ? (
                            <img
                              src={diamond.picture}
                              alt={diamond.shape}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Diamond className="h-6 w-6 text-muted-foreground" />
                            </div>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                          <div className="absolute bottom-1 left-1 right-1">
                            <p className="text-white text-xs font-semibold truncate">
                              {diamond.weight}ct {diamond.shape}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {isSelected && (
                      <div className="flex items-center gap-2 text-primary text-sm font-medium pt-2">
                        <CheckCircle2 className="h-4 w-4" />
                        נבחר - גלול למטה ליצירת הודעה
                      </div>
                    )}

                    <Button
                      variant={isSelected ? "default" : "outline"}
                      className="w-full"
                      size="sm"
                    >
                      {isSelected ? (
                        <>
                          <Sparkles className="h-4 w-4 mr-2" />
                          נבחר
                        </>
                      ) : (
                        <>
                          <Eye className="h-4 w-4 mr-2" />
                          צור הודעה
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>

        {/* Message Generation Section */}
        {selectedNotification && (
          <div id="message-generation" className="p-4 space-y-4 bg-muted/30">
            <Separator />
            
            <div className="space-y-3">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                יצירת הודעה אישית
              </h2>

              {/* Generate Messages Button */}
              {generatedMessages.length === 0 ? (
                <Button
                  onClick={handleGenerateMessages}
                  disabled={isGenerating}
                  className="w-full"
                  size="lg"
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
                      יוצר הודעות...
                    </>
                  ) : (
                    <>
                      <Zap className="h-5 w-5 mr-2" />
                      צור הודעות עם AI
                    </>
                  )}
                </Button>
              ) : (
                <Button
                  onClick={handleGenerateMessages}
                  variant="outline"
                  disabled={isGenerating}
                  className="w-full"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  צור הודעות חדשות
                </Button>
              )}

              {/* Generated Messages */}
              {generatedMessages.length > 0 && (
                <ScrollArea className="h-[400px] rounded-lg border bg-card">
                  <div className="p-4 space-y-3">
                    {generatedMessages.map((msg) => (
                      <Card
                        key={msg.id}
                        className={cn(
                          "cursor-pointer transition-all hover:shadow-md",
                          selectedMessage === msg.content && "ring-2 ring-primary"
                        )}
                        onClick={() => {
                          haptics.selection();
                          setSelectedMessage(msg.content);
                          setCustomMessage('');
                        }}
                      >
                        <CardHeader className="pb-2">
                          <div className="flex items-center justify-between">
                            <Badge variant="outline" className="text-xs">
                              {msg.tone === 'professional' && '👔 מקצועי'}
                              {msg.tone === 'friendly' && '😊 ידידותי'}
                              {msg.tone === 'urgent' && '⚡ דחוף'}
                            </Badge>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCopyMessage(msg.content);
                              }}
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                          {selectedMessage === msg.content && (
                            <div className="flex items-center gap-2 text-primary text-xs font-medium mt-3">
                              <CheckCircle2 className="h-3 w-3" />
                              הודעה נבחרה
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              )}

              {/* Custom Message */}
              <div className="space-y-2">
                <label className="text-sm font-medium">או כתוב הודעה משלך:</label>
                <Textarea
                  value={customMessage}
                  onChange={(e) => {
                    setCustomMessage(e.target.value);
                    setSelectedMessage('');
                  }}
                  placeholder="כתוב הודעה אישית ללקוח..."
                  className="min-h-[120px]"
                />
              </div>

              {/* Diamond Selection */}
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <ImageIcon className="h-4 w-4" />
                  בחר יהלומים לשליחה:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {selectedNotification.data?.matches?.map((diamond: any) => (
                    <Card
                      key={diamond.stock_number}
                      className={cn(
                        "cursor-pointer transition-all",
                        selectedDiamonds.includes(diamond.stock_number) && "ring-2 ring-primary"
                      )}
                      onClick={() => handleDiamondToggle(diamond.stock_number)}
                    >
                      <CardContent className="p-3">
                        <div className="aspect-square rounded-lg overflow-hidden bg-muted mb-2">
                          {diamond.picture ? (
                            <img
                              src={diamond.picture}
                              alt={diamond.shape}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Diamond className="h-8 w-8 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm font-semibold">
                            {diamond.weight}ct {diamond.shape}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {diamond.color} • {diamond.clarity}
                          </p>
                          {selectedDiamonds.includes(diamond.stock_number) && (
                            <Badge variant="default" className="text-xs">נבחר ✓</Badge>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Send Button (also controlled by Main Button) */}
              <Button
                onClick={handleSendMessage}
                disabled={isSending || (!selectedMessage && !customMessage)}
                className="w-full"
                size="lg"
              >
                {isSending ? (
                  <>
                    <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
                    שולח...
                  </>
                ) : (
                  <>
                    <Send className="h-5 w-5 mr-2" />
                    שלח הודעה ללקוח
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
    </TelegramMiniAppLayout>
  );
}
