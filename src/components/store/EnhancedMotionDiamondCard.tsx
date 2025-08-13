
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Settings, Zap, Eye, Wifi } from 'lucide-react';
import { useEnhancedTelegramMotion } from '@/hooks/useEnhancedTelegramMotion';
import { useCachedImage } from '@/hooks/useCachedImage';

interface DiamondData {
  id: string;
  stockNumber: string;
  carat: number;
  shape: string;
  color: string;
  clarity: string;
  price: number;
  imageUrl?: string;
}

interface EnhancedMotionDiamondCardProps {
  diamond: DiamondData;
}

export function EnhancedMotionDiamondCard({ diamond }: EnhancedMotionDiamondCardProps) {
  const { motionState, startMotionTracking, calibrateMotion, isAvailable } = useEnhancedTelegramMotion();
  const { imageUrl, cacheHit } = useCachedImage(diamond.imageUrl, diamond.stockNumber);

  return (
    <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300">
      <CardContent className="p-0">
        {/* Cache Status Indicator */}
        {cacheHit && (
          <Badge className="absolute top-2 right-2 z-10 bg-green-500 text-white">
            <Zap className="h-3 w-3 mr-1" />
            Cached
          </Badge>
        )}

        {/* Image Container */}
        <div className="aspect-square bg-gradient-to-br from-slate-100 to-slate-200 relative">
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

        {/* Motion Controls */}
        {isAvailable && (
          <div className="p-2 bg-slate-50 border-t">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1">
                <Settings className="h-3 w-3" />
                <span>Motion: {motionState.isActive ? 'ON' : 'OFF'}</span>
              </div>
              <div className="flex items-center gap-1">
                <Wifi className="h-3 w-3" />
                <span>Quality: {Math.round(motionState.quality.stability)}%</span>
              </div>
            </div>
          </div>
        )}

        {/* Diamond Info */}
        <div className="p-4">
          <h3 className="font-semibold text-lg">
            {diamond.carat}ct {diamond.shape}
          </h3>
          <p className="text-muted-foreground text-sm">
            {diamond.color} • {diamond.clarity}
          </p>
          <p className="text-xl font-bold text-primary mt-2">
            ${diamond.price.toLocaleString()}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
