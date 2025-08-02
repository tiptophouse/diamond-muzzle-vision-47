
import { useState } from 'react';
import { Share2, Users, TrendingUp, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useSecureDiamondSharing } from '@/hooks/useSecureDiamondSharing';
import { useTelegramWebApp } from '@/hooks/useTelegramWebApp';
import { Diamond } from '@/components/inventory/InventoryTable';
import { toast } from 'sonner';

interface SecureDiamondDetailShareProps {
  diamond: Diamond;
  shareAnalytics?: {
    totalViews: number;
    uniqueViewers: number;
    clickThroughRate: number;
  };
}

export function SecureDiamondDetailShare({ diamond, shareAnalytics }: SecureDiamondDetailShareProps) {
  const [isSharing, setIsSharing] = useState(false);
  const { shareWithInlineButtons, isAvailable } = useSecureDiamondSharing();
  const { webApp, hapticFeedback } = useTelegramWebApp();

  const handleSecureShare = async () => {
    if (!isAvailable) {
      toast.error('Secure sharing requires Telegram Mini App');
      return;
    }

    setIsSharing(true);
    hapticFeedback.impact('medium');

    try {
      const success = await shareWithInlineButtons(diamond);
      
      if (success) {
        toast.success('💎 Diamond shared securely with tracking!');
      }
    } catch (error) {
      console.error('Share failed:', error);
      toast.error('Failed to share diamond');
    } finally {
      setIsSharing(false);
    }
  };

  const handleDirectContact = () => {
    hapticFeedback.impact('light');
    
    // Send direct contact request via Telegram
    if (webApp) {
      const contactMessage = {
        action: 'diamond_contact_request',
        data: {
          diamond: {
            stockNumber: diamond.stockNumber,
            carat: diamond.carat,
            shape: diamond.shape,
            color: diamond.color,
            clarity: diamond.clarity,
            price: diamond.price
          },
          message: `💎 Contact request for ${diamond.carat} ct ${diamond.shape} diamond (${diamond.stockNumber})`
        },
        timestamp: Date.now()
      };

      webApp.sendData?.(JSON.stringify(contactMessage));
      toast.success('📞 Contact request sent!');
    }
  };

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Share2 className="h-5 w-5" />
          Secure Sharing & Contact
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Share Analytics (if available) */}
        {shareAnalytics && (
          <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{shareAnalytics.totalViews}</div>
              <div className="text-xs text-gray-600">Total Views</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{shareAnalytics.uniqueViewers}</div>
              <div className="text-xs text-gray-600">Unique Viewers</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{shareAnalytics.clickThroughRate}%</div>
              <div className="text-xs text-gray-600">Click Rate</div>
            </div>
          </div>
        )}

        {/* Security Badge */}
        <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
          <Badge className="bg-blue-600 text-white">
            🔒 Secure
          </Badge>
          <span className="text-sm text-blue-700">
            Only Telegram Mini App users can access shared diamonds
          </span>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <Button
            onClick={handleSecureShare}
            disabled={!isAvailable || isSharing}
            className="w-full"
            size="lg"
          >
            <Share2 className="h-4 w-4 mr-2" />
            {isSharing ? 'Sharing...' : 'Share with Buttons'}
          </Button>

          <Button
            onClick={handleDirectContact}
            variant="outline"
            className="w-full"
            size="lg"
          >
            <MessageCircle className="h-4 w-4 mr-2" />
            Direct Contact
          </Button>
        </div>

        {/* Feature Benefits */}
        <div className="space-y-2 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-green-600" />
            <span>Only authenticated Telegram users can view</span>
          </div>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-blue-600" />
            <span>Track views and engagement in real-time</span>
          </div>
          <div className="flex items-center gap-2">
            <MessageCircle className="h-4 w-4 text-purple-600" />
            <span>Direct contact buttons for instant communication</span>
          </div>
        </div>

        {!isAvailable && (
          <div className="text-center p-4 bg-yellow-50 rounded-lg">
            <p className="text-sm text-yellow-700">
              ⚠️ Open in Telegram Mini App for secure sharing features
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
