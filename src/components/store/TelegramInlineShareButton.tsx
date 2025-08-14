
import React, { useState } from 'react';
import { Share2, Users, Eye, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { useTelegramWebApp } from '@/hooks/useTelegramWebApp';
import { useDiamondSharing } from '@/hooks/useDiamondSharing';
import { Diamond } from '@/components/inventory/InventoryTable';
import { toast } from 'sonner';

interface TelegramInlineShareButtonProps {
  diamond: Diamond;
  variant?: 'button' | 'card';
  showAnalytics?: boolean;
}

export function TelegramInlineShareButton({ 
  diamond, 
  variant = 'button',
  showAnalytics = false 
}: TelegramInlineShareButtonProps) {
  const { webApp, user, hapticFeedback } = useTelegramWebApp();
  const { shareWithInlineButton, isSharing, analytics } = useDiamondSharing();
  const [shareStats, setShareStats] = useState({
    totalShares: 0,
    totalViews: 0,
    lastShared: null as Date | null
  });

  const handleInlineShare = async () => {
    if (!webApp || !user) {
      toast.error('Telegram Mini App required for native sharing');
      return;
    }

    hapticFeedback.impact('medium');

    try {
      const shareText = `💎 Check out this stunning ${diamond.carat}ct ${diamond.shape} diamond!\n\n` +
        `✨ Color: ${diamond.color} | Clarity: ${diamond.clarity}\n` +
        `💰 Price: $${diamond.price.toLocaleString()}\n` +
        `📋 Stock: ${diamond.stockNumber}`;

      // Use Telegram's native inline sharing
      webApp.switchInlineQuery(shareText, ['users', 'groups']);
      
      // Track the share
      await shareWithInlineButton(diamond);
      
      // Update local stats
      setShareStats(prev => ({
        totalShares: prev.totalShares + 1,
        totalViews: prev.totalViews,
        lastShared: new Date()
      }));

      hapticFeedback.notification('success');
      toast.success('Diamond shared via Telegram!');
      
    } catch (error) {
      console.error('Failed to share diamond:', error);
      hapticFeedback.notification('error');
      toast.error('Failed to share diamond');
    }
  };

  if (variant === 'card') {
    return (
      <Card className="w-full bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Share2 className="h-5 w-5 text-blue-600" />
              <span className="font-semibold text-blue-900">Share Diamond</span>
            </div>
            <Badge className="bg-blue-100 text-blue-800">
              Telegram Native
            </Badge>
          </div>
          
          {showAnalytics && (
            <div className="grid grid-cols-3 gap-2 mb-3 text-sm">
              <div className="text-center">
                <Users className="h-4 w-4 mx-auto mb-1 text-gray-600" />
                <p className="font-medium">{shareStats.totalShares}</p>
                <p className="text-xs text-gray-500">Shares</p>
              </div>
              <div className="text-center">
                <Eye className="h-4 w-4 mx-auto mb-1 text-gray-600" />
                <p className="font-medium">{shareStats.totalViews}</p>
                <p className="text-xs text-gray-500">Views</p>
              </div>
              <div className="text-center">
                <Clock className="h-4 w-4 mx-auto mb-1 text-gray-600" />
                <p className="font-medium">
                  {shareStats.lastShared ? 'Today' : 'Never'}
                </p>
                <p className="text-xs text-gray-500">Last</p>
              </div>
            </div>
          )}
          
          <Button 
            onClick={handleInlineShare}
            disabled={isSharing}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            <Share2 className="h-4 w-4 mr-2" />
            {isSharing ? 'Sharing...' : 'Share with Inline Keyboard'}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Button 
      onClick={handleInlineShare}
      disabled={isSharing}
      variant="outline"
      className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200 text-blue-700 hover:from-blue-100 hover:to-purple-100"
    >
      <Share2 className="h-4 w-4 mr-2" />
      {isSharing ? 'Sharing...' : 'Share'}
    </Button>
  );
}
