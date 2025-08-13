
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Share2, Eye, Clock, Users, TrendingUp } from 'lucide-react';
import { useDiamondSharing } from '@/hooks/useDiamondSharing';
import { useCachedImage } from '@/hooks/useCachedImage';
import { useSearchParams } from 'react-router-dom';

interface Diamond {
  id: string;
  stockNumber: string;
  carat: number;
  shape: string;
  color: string;
  clarity: string;
  price: number;
  imageUrl?: string;
}

interface ShareableDiamondCardProps {
  diamond: Diamond;
  showAnalytics?: boolean;
}

export function ShareableDiamondCard({ diamond, showAnalytics = false }: ShareableDiamondCardProps) {
  const [searchParams] = useSearchParams();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [viewStartTime] = useState(Date.now());
  const [scrollDepth, setScrollDepth] = useState(0);
  const cardRef = useRef<HTMLDivElement>(null);
  const viewTimeInterval = useRef<NodeJS.Timeout>();

  const { 
    shareWithInlineButton, 
    trackView, 
    updateViewTime, 
    trackInteraction, 
    trackReshare,
    isSharing,
    analytics,
    isAvailable 
  } = useDiamondSharing();

  const { imageUrl, cacheHit } = useCachedImage(diamond.imageUrl, diamond.stockNumber);

  // Check if this is a shared view
  const isSharedView = searchParams.get('shared') === 'true';
  const sharedFrom = searchParams.get('from');

  // Initialize tracking for shared views
  useEffect(() => {
    if (isSharedView) {
      const initTracking = async () => {
        const id = await trackView(diamond.id, {
          telegramId: undefined, // Will be filled by backend if user is logged in
          referrer: document.referrer
        });
        setSessionId(id);
      };
      initTracking();
    }
  }, [isSharedView, diamond.id, trackView]);

  // Track view time every 5 seconds
  useEffect(() => {
    if (sessionId && isSharedView) {
      viewTimeInterval.current = setInterval(async () => {
        await updateViewTime(sessionId, 5000); // 5 seconds
      }, 5000);

      return () => {
        if (viewTimeInterval.current) {
          clearInterval(viewTimeInterval.current);
        }
      };
    }
  }, [sessionId, isSharedView, updateViewTime]);

  // Track scroll depth
  useEffect(() => {
    if (!sessionId || !isSharedView) return;

    const handleScroll = () => {
      if (cardRef.current) {
        const rect = cardRef.current.getBoundingClientRect();
        const visibleHeight = Math.min(rect.bottom, window.innerHeight) - Math.max(rect.top, 0);
        const totalHeight = rect.height;
        const currentDepth = Math.round((visibleHeight / totalHeight) * 100);
        
        if (currentDepth > scrollDepth) {
          setScrollDepth(currentDepth);
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [sessionId, isSharedView, scrollDepth]);

  const handleShare = async () => {
    const success = await shareWithInlineButton(diamond);
    if (success && sessionId) {
      await trackInteraction(sessionId, 'share_clicked');
    }
  };

  const handleImageClick = async () => {
    if (sessionId) {
      await trackInteraction(sessionId, 'image_clicked');
    }
  };

  const handleReshare = async () => {
    if (sessionId) {
      await trackReshare(sessionId);
    }
    await handleShare();
  };

  return (
    <Card ref={cardRef} className="relative overflow-hidden group hover:shadow-lg transition-all duration-300">
      <CardContent className="p-0">
        {/* Analytics Badge for Shared Views */}
        {isSharedView && analytics && (
          <Badge className="absolute top-2 left-2 z-10 bg-blue-500 text-white">
            <Eye className="h-3 w-3 mr-1" />
            Tracked View
          </Badge>
        )}

        {/* Cache Status */}
        {cacheHit && (
          <Badge className="absolute top-2 right-2 z-10 bg-green-500 text-white">
            Cached
          </Badge>
        )}

        {/* Image Container */}
        <div 
          className="aspect-square bg-gradient-to-br from-slate-100 to-slate-200 relative cursor-pointer"
          onClick={handleImageClick}
        >
          {imageUrl ? (
            <img 
              src={imageUrl} 
              alt={`${diamond.shape} Diamond`}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <Eye className="h-12 w-12 text-slate-400" />
            </div>
          )}
        </div>

        {/* Diamond Info */}
        <div className="p-4">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h3 className="font-semibold text-lg">
                {diamond.carat}ct {diamond.shape}
              </h3>
              <p className="text-muted-foreground text-sm">
                {diamond.color} • {diamond.clarity}
              </p>
            </div>
            <p className="text-xl font-bold text-primary">
              ${diamond.price.toLocaleString()}
            </p>
          </div>

          {/* Share Button */}
          <div className="flex gap-2 mt-4">
            <Button
              onClick={isSharedView ? handleReshare : handleShare}
              disabled={!isAvailable || isSharing}
              className="flex-1"
              variant={isSharedView ? "outline" : "default"}
            >
              <Share2 className="h-4 w-4 mr-2" />
              {isSharing ? 'Sharing...' : isSharedView ? 'Re-share' : 'Share'}
            </Button>
          </div>

          {/* Analytics Display for Owner */}
          {showAnalytics && analytics && (
            <div className="mt-4 p-3 bg-slate-50 rounded-lg">
              <h4 className="text-sm font-medium mb-2">View Analytics</h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {Math.round(analytics.totalViewTime / 1000)}s viewed
                </div>
                <div className="flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  {scrollDepth}% scrolled
                </div>
                <div className="flex items-center gap-1">
                  <Eye className="h-3 w-3" />
                  {analytics.interactions.length} interactions
                </div>
                <div className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  {analytics.reshared ? 'Re-shared' : 'Not shared'}
                </div>
              </div>
            </div>
          )}

          {/* Shared View Info */}
          {isSharedView && sharedFrom && (
            <div className="mt-3 p-2 bg-blue-50 rounded text-xs text-blue-700">
              Shared by user #{sharedFrom}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
