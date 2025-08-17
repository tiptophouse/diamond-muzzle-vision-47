import { EnhancedStoreGrid } from "@/components/store/EnhancedStoreGrid";
import { EnhancedStoreHeader } from "@/components/store/EnhancedStoreHeader";
import { TelegramStoreFilters } from "@/components/store/TelegramStoreFilters";
import { useStoreData } from "@/hooks/useStoreData";
import { useStoreFilters } from "@/hooks/useStoreFilters";
import { useTelegramWebApp } from "@/hooks/useTelegramWebApp";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Share2, BarChart3, Users, Eye, Clock } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useDiamondSharing } from "@/hooks/useDiamondSharing";
import { toast } from "sonner";

export default function StorePage() {
  const { webApp } = useTelegramWebApp();
  const { diamonds, loading, error } = useStoreData();
  const { shareAnalytics, getShareAnalytics, createShare, loading: sharingLoading } = useDiamondSharing();
  const [showStoreAnalytics, setShowStoreAnalytics] = useState(false);
  
  const storeFilters = useStoreFilters(diamonds || []);
  const { filteredDiamonds, filters, updateFilter, clearFilters } = storeFilters;

  useEffect(() => {
    if (webApp) {
      webApp.ready();
      webApp.MainButton.hide();
      webApp.BackButton.hide();
    }
  }, [webApp]);

  // Load analytics on component mount
  useEffect(() => {
    getShareAnalytics();
  }, [getShareAnalytics]);

  const handleShareEntireStore = async () => {
    if (!diamonds?.length) {
      toast.error('No diamonds to share');
      return;
    }

    // Use the first diamond as a representative for the entire store
    const representativeDiamond = diamonds[0];
    const share = await createShare(representativeDiamond, 'entire_store');
    
    if (share) {
      const storeUrl = `${window.location.origin}/store?shared=true&from=${share.owner_telegram_id}`;
      navigator.clipboard.writeText(storeUrl);
      toast.success('🏪 Store link copied to clipboard!');
    }
  };

  const totalViews = shareAnalytics.reduce((sum, analytics) => sum + analytics.metrics.totalViews, 0);
  const totalReshares = shareAnalytics.reduce((sum, analytics) => sum + analytics.metrics.reshares, 0);
  const avgViewDuration = shareAnalytics.length > 0 
    ? shareAnalytics.reduce((sum, analytics) => sum + analytics.metrics.avgViewDuration, 0) / shareAnalytics.length 
    : 0;

  const hasActiveFilters = Object.values(filters).some(value => {
    if (Array.isArray(value)) return value.length > 0;
    if (typeof value === 'object' && value !== null) return Object.values(value).some(v => v !== null && v !== '');
    return value !== null && value !== '';
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="animate-pulse space-y-4 p-4">
          <div className="h-8 bg-muted rounded w-3/4"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-64 bg-muted rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="pt-6 text-center">
            <div className="text-destructive mb-4">⚠️ Error Loading Store</div>
            <p className="text-muted-foreground">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Enhanced Header with Store Sharing */}
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold">Diamond Store</h1>
              <p className="text-sm text-muted-foreground">
                {filteredDiamonds.length} of {diamonds?.length || 0} diamonds
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <Dialog open={showStoreAnalytics} onOpenChange={setShowStoreAnalytics}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Analytics
                  </Button>
                </DialogTrigger>
                <DialogContent className="w-[95vw] max-w-2xl mx-auto">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5 text-blue-600" />
                      Store Performance Analytics
                    </DialogTitle>
                  </DialogHeader>
                  
                  <div className="space-y-6">
                    {/* Overall Metrics */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <Card>
                        <CardContent className="pt-4 text-center">
                          <Eye className="h-6 w-6 mx-auto mb-2 text-blue-500" />
                          <div className="text-2xl font-bold">{totalViews}</div>
                          <div className="text-xs text-muted-foreground">Total Views</div>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardContent className="pt-4 text-center">
                          <Share2 className="h-6 w-6 mx-auto mb-2 text-green-500" />
                          <div className="text-2xl font-bold">{shareAnalytics.length}</div>
                          <div className="text-xs text-muted-foreground">Items Shared</div>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardContent className="pt-4 text-center">
                          <Clock className="h-6 w-6 mx-auto mb-2 text-orange-500" />
                          <div className="text-2xl font-bold">{Math.round(avgViewDuration)}s</div>
                          <div className="text-xs text-muted-foreground">Avg View Time</div>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardContent className="pt-4 text-center">
                          <Users className="h-6 w-6 mx-auto mb-2 text-purple-500" />
                          <div className="text-2xl font-bold">{totalReshares}</div>
                          <div className="text-xs text-muted-foreground">Reshares</div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Top Performing Diamonds */}
                    {shareAnalytics.length > 0 && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Top Performing Diamonds</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            {shareAnalytics
                              .sort((a, b) => b.metrics.totalViews - a.metrics.totalViews)
                              .slice(0, 5)
                              .map((analytics, index) => (
                                <div key={analytics.shareId} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                                  <div>
                                    <div className="font-medium">#{analytics.diamondStockNumber}</div>
                                    <div className="text-sm text-muted-foreground">
                                      {analytics.metrics.uniqueViewers} unique viewers
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <div className="font-bold text-lg">{analytics.metrics.totalViews}</div>
                                    <div className="text-xs text-muted-foreground">views</div>
                                  </div>
                                </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </DialogContent>
              </Dialog>

              <Button 
                onClick={handleShareEntireStore}
                disabled={sharingLoading}
                className="bg-primary hover:bg-primary/90"
                size="sm"
              >
                <Share2 className="h-4 w-4 mr-2" />
                Share Store
              </Button>
            </div>
          </div>

          {/* Share Analytics Summary */}
          {shareAnalytics.length > 0 && (
            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
              <div className="flex items-center gap-1">
                <Eye className="h-4 w-4" />
                {totalViews} views
              </div>
              <div className="flex items-center gap-1">
                <Share2 className="h-4 w-4" />
                {shareAnalytics.length} shared items
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {Math.round(avgViewDuration)}s avg view time
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="container mx-auto px-4 py-4">
        <TelegramStoreFilters
          filters={filters}
          onUpdateFilter={updateFilter}
          onClearFilters={clearFilters}
        />
      </div>

      {/* Store Grid */}
      <div className="container mx-auto px-4 pb-8">
        <EnhancedStoreGrid 
          diamonds={filteredDiamonds} 
          loading={loading} 
          error={error}
          onUpdate={getShareAnalytics}
        />
      </div>
    </div>
  );
}
