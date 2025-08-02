
import { useState } from 'react';
import { Share2, Users, TrendingUp, MessageCircle, UserCheck, AlertTriangle } from 'lucide-react';
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
    registeredViewers: number;
    clickThroughRate: number;
  };
}

export function SecureDiamondDetailShare({ diamond, shareAnalytics }: SecureDiamondDetailShareProps) {
  const [isSharing, setIsSharing] = useState(false);
  const { shareWithInlineButtons, isAvailable } = useSecureDiamondSharing();
  const { webApp, hapticFeedback } = useTelegramWebApp();

  const handleSecureShare = async () => {
    if (!isAvailable) {
      toast.error('🔒 Secure sharing requires Telegram Mini App');
      return;
    }

    setIsSharing(true);
    hapticFeedback?.impact('medium');

    try {
      const success = await shareWithInlineButtons(diamond);
      
      if (success) {
        toast.success('💎 Diamond shared with registration verification!');
      }
    } catch (error) {
      console.error('Share failed:', error);
      toast.error('Failed to share diamond');
    } finally {
      setIsSharing(false);
    }
  };

  const handleDirectContact = () => {
    hapticFeedback?.impact('light');
    
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
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{shareAnalytics.totalViews}</div>
              <div className="text-xs text-gray-600">Total Views</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{shareAnalytics.registeredViewers}</div>
              <div className="text-xs text-gray-600">Registered Users</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{shareAnalytics.uniqueViewers}</div>
              <div className="text-xs text-gray-600">Unique Viewers</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{shareAnalytics.clickThroughRate}%</div>
              <div className="text-xs text-gray-600">Click Rate</div>
            </div>
          </div>
        )}

        {/* Security Badge */}
        <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
          <Badge className="bg-blue-600 text-white">
            🔒 Registration Required
          </Badge>
          <span className="text-sm text-blue-700">
            Only registered Telegram Mini App users can access shared diamonds
          </span>
        </div>

        {/* Registration Verification Info */}
        <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
          <UserCheck className="h-5 w-5 text-green-600 mt-0.5" />
          <div className="flex-1">
            <h4 className="font-medium text-green-800 mb-1">Smart Access Control</h4>
            <p className="text-sm text-green-700">
              Users must be registered in your Mini App and have clicked "Start" to view shared diamonds. 
              Unregistered users will be prompted to register first.
            </p>
          </div>
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
            {isSharing ? 'Sharing...' : 'Share Securely'}
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
            <UserCheck className="h-4 w-4 text-green-600" />
            <span>Only registered Mini App users can view</span>
          </div>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-blue-600" />
            <span>Track registered user engagement</span>
          </div>
          <div className="flex items-center gap-2">
            <MessageCircle className="h-4 w-4 text-purple-600" />
            <span>Direct contact with verified users</span>
          </div>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-orange-600" />
            <span>Auto-redirect unregistered users to registration</span>
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
