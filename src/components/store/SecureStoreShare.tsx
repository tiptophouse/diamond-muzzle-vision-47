
import { useState } from 'react';
import { Share2, Lock, Users, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { useTelegramSendData } from '@/hooks/useTelegramSendData';

interface SecureStoreShareProps {
  storeTitle?: string;
  diamondCount?: number;
  showAnalytics?: boolean;
}

export function SecureStoreShare({ 
  storeTitle = "My Diamond Store", 
  diamondCount = 0,
  showAnalytics = false 
}: SecureStoreShareProps) {
  const [isSharing, setIsSharing] = useState(false);
  const { user } = useTelegramAuth();
  const { sendData } = useTelegramSendData();
  const { toast } = useToast();

  const handleSecureShare = async () => {
    if (!user?.id) {
      toast({
        title: "Authentication Required",
        description: "Please authenticate to share your store",
        variant: "destructive",
      });
      return;
    }

    setIsSharing(true);

    try {
      // Create secure store URL with authentication requirement
      const secureStoreUrl = `${window.location.origin}/store?dealer=${user.id}&auth=required&ref=secure_share&t=${Date.now()}`;
      
      // Create share message with inline buttons
      const shareMessage = {
        action: 'share_secure_store',
        data: {
          message: `🏪 **${storeTitle}**\n\n💎 **${diamondCount} Premium Diamonds Available**\n\n🔒 **Secure Access Required**\nAuthenticated viewing only - Premium inventory awaits!\n\n👥 Professional diamond trading community`,
          inline_keyboard: [
            [
              {
                text: '🏪 View Secure Store',
                web_app: {
                  url: secureStoreUrl
                }
              }
            ],
            [
              {
                text: '💬 Contact Dealer',
                callback_data: `contact_secure_dealer_${user.id}`
              },
              {
                text: '📊 Request Catalog',
                callback_data: `request_catalog_${user.id}`
              }
            ],
            [
              {
                text: '🔐 Join Premium Network',
                web_app: {
                  url: `${window.location.origin}/?register=premium&from=${user.id}`
                }
              }
            ]
          ]
        },
        timestamp: Date.now(),
        requiresAuth: true,
        storeOwner: user.id
      };

      // Send via Telegram WebApp
      const success = sendData(shareMessage);
      
      if (success) {
        toast({
          title: "🔒 Secure Store Shared!",
          description: "Your store has been shared with authentication protection. Only verified users can access your inventory.",
        });
      } else {
        throw new Error('Failed to send share data');
      }
    } catch (error) {
      console.error('❌ Failed to share secure store:', error);
      toast({
        title: "Share Failed",
        description: "Failed to share store. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto bg-gradient-to-br from-white to-blue-50/30 border-blue-200/50 shadow-lg">
      <CardHeader className="text-center pb-4">
        <CardTitle className="flex items-center justify-center gap-2 text-lg">
          <Lock className="w-5 h-5 text-blue-600" />
          Secure Store Sharing
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Eye className="w-4 h-4" />
            <span>{diamondCount} diamonds in your store</span>
          </div>
          
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Users className="w-4 h-4" />
            <span>Authentication required for access</span>
          </div>
        </div>

        <Button 
          onClick={handleSecureShare}
          disabled={isSharing}
          className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-blue-500/25 transition-all duration-300"
        >
          <Share2 className="w-4 h-4 mr-2" />
          {isSharing ? 'Sharing...' : 'Share Secure Store'}
        </Button>

        <p className="text-xs text-center text-muted-foreground">
          Your store will be shared with Telegram inline buttons. Only authenticated users can view your inventory.
        </p>
      </CardContent>
    </Card>
  );
}
