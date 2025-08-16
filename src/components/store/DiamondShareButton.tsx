
import { useState } from 'react';
import { Share2, Copy, MessageCircle, BarChart3, Eye, Clock, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Diamond } from '@/components/inventory/InventoryTable';
import { useDiamondSharing } from '@/hooks/useDiamondSharing';
import { toast } from 'sonner';

interface DiamondShareButtonProps {
  diamond: Diamond;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg';
}

export function DiamondShareButton({ diamond, variant = 'outline', size = 'sm' }: DiamondShareButtonProps) {
  const [showDialog, setShowDialog] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const { createShare, shareAnalytics, getShareAnalytics, trackReshare, loading } = useDiamondSharing();

  const handleCreateShare = async (shareType: 'individual_item' | 'entire_store') => {
    const share = await createShare(diamond, shareType);
    if (share) {
      // Copy link to clipboard
      navigator.clipboard.writeText(share.share_url);
      toast.success('🔗 Share link copied to clipboard!');
      setShowDialog(false);
    }
  };

  const handleShowAnalytics = async () => {
    await getShareAnalytics();
    setShowAnalytics(true);
  };

  const currentDiamondAnalytics = shareAnalytics.find(
    analytics => analytics.diamondStockNumber === diamond.stockNumber
  );

  const handleWhatsAppShare = async () => {
    const share = await createShare(diamond, 'individual_item');
    if (share) {
      const message = `💎 Check out this ${diamond.carat}ct ${diamond.shape} diamond!\n\n` +
        `💰 Price: $${diamond.price?.toLocaleString()}\n` +
        `🎨 ${diamond.color} ${diamond.clarity}\n` +
        `✂️ ${diamond.cut} cut\n\n` +
        `View details: ${share.share_url}`;
      
      const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank');
      
      // Track the reshare
      await trackReshare(share.id, 0, 'copy_link'); // 0 for system tracking
    }
  };

  return (
    <>
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogTrigger asChild>
          <Button variant={variant} size={size} className="flex items-center gap-2">
            <Share2 className="h-4 w-4" />
            Share
          </Button>
        </DialogTrigger>
        <DialogContent className="w-[95vw] max-w-md mx-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Share2 className="h-5 w-5 text-blue-600" />
              Share Diamond
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Diamond Info */}
            <Card className="bg-gradient-to-r from-blue-50 to-purple-50">
              <CardContent className="pt-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold">{diamond.carat}ct {diamond.shape}</h3>
                  <Badge variant="secondary">#{diamond.stockNumber}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {diamond.color} {diamond.clarity} • {diamond.cut} cut
                </p>
                <p className="text-lg font-bold text-primary mt-2">
                  ${diamond.price?.toLocaleString()}
                </p>
              </CardContent>
            </Card>

            {/* Share Options */}
            <div className="space-y-3">
              <Button
                onClick={() => handleCreateShare('individual_item')}
                disabled={loading}
                className="w-full justify-start h-12 bg-blue-500 hover:bg-blue-600 text-white"
              >
                <Copy className="h-5 w-5 mr-3" />
                <div className="text-left">
                  <div className="font-medium">Copy Share Link</div>
                  <div className="text-xs opacity-90">Share this specific diamond</div>
                </div>
              </Button>

              <Button
                onClick={handleWhatsAppShare}
                disabled={loading}
                className="w-full justify-start h-12 bg-green-500 hover:bg-green-600 text-white"
              >
                <MessageCircle className="h-5 w-5 mr-3" />
                <div className="text-left">
                  <div className="font-medium">Share via WhatsApp</div>
                  <div className="text-xs opacity-90">Send directly to clients</div>
                </div>
              </Button>

              <Button
                onClick={handleShowAnalytics}
                variant="outline"
                className="w-full justify-start h-12"
              >
                <BarChart3 className="h-5 w-5 mr-3" />
                <div className="text-left">
                  <div className="font-medium">View Analytics</div>
                  <div className="text-xs text-muted-foreground">Track performance</div>
                </div>
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Analytics Dialog */}
      <Dialog open={showAnalytics} onOpenChange={setShowAnalytics}>
        <DialogContent className="w-[95vw] max-w-2xl mx-auto max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-green-600" />
              Diamond Performance Analytics
            </DialogTitle>
          </DialogHeader>

          {currentDiamondAnalytics ? (
            <div className="space-y-6">
              {/* Metrics Overview */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="pt-4 text-center">
                    <Eye className="h-6 w-6 mx-auto mb-2 text-blue-500" />
                    <div className="text-2xl font-bold">{currentDiamondAnalytics.metrics.totalViews}</div>
                    <div className="text-xs text-muted-foreground">Total Views</div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="pt-4 text-center">
                    <Clock className="h-6 w-6 mx-auto mb-2 text-orange-500" />
                    <div className="text-2xl font-bold">{Math.round(currentDiamondAnalytics.metrics.avgViewDuration)}s</div>
                    <div className="text-xs text-muted-foreground">Avg Duration</div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="pt-4 text-center">
                    <Users className="h-6 w-6 mx-auto mb-2 text-green-500" />
                    <div className="text-2xl font-bold">{currentDiamondAnalytics.metrics.uniqueViewers}</div>
                    <div className="text-xs text-muted-foreground">Unique Viewers</div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="pt-4 text-center">
                    <Share2 className="h-6 w-6 mx-auto mb-2 text-purple-500" />
                    <div className="text-2xl font-bold">{currentDiamondAnalytics.metrics.reshares}</div>
                    <div className="text-xs text-muted-foreground">Reshares</div>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Viewers */}
              {currentDiamondAnalytics.viewers.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Recent Viewers</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {currentDiamondAnalytics.viewers.slice(0, 5).map((viewer, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                          <div>
                            <div className="font-medium">Viewer #{viewer.viewerId || 'Anonymous'}</div>
                            <div className="text-sm text-muted-foreground">
                              {new Date(viewer.viewedAt).toLocaleDateString()} • {viewer.deviceType}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-medium">{viewer.viewDuration}s</div>
                            {viewer.reshared && (
                              <Badge variant="secondary" className="text-xs">Reshared</Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-muted-foreground mb-4">No analytics data available yet</div>
              <p className="text-sm">Share this diamond to start tracking performance</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
