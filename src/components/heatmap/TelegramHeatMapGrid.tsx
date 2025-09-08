import React, { useState, useCallback, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useTelegramHeatMapIntegration } from '@/hooks/useTelegramHeatMapIntegration';
import { useFastApiNotifications } from '@/hooks/useFastApiNotifications';

interface DiamondHeatData {
  id: string;
  shape: string;
  carat: number;
  price: number;
  notificationCount: number;
  lastInteraction: Date;
  interestLevel: 'low' | 'medium' | 'high';
}

interface TelegramHeatMapGridProps {
  diamonds: DiamondHeatData[];
  onDiamondSelect?: (diamond: DiamondHeatData) => void;
}

export function TelegramHeatMapGrid({ diamonds, onDiamondSelect }: TelegramHeatMapGridProps) {
  const [selectedDiamond, setSelectedDiamond] = useState<DiamondHeatData | null>(null);
  const { 
    onHeatMapCellTap, 
    onHeatMapCellHover, 
    onHotDiamondFound,
    configureHeatMapNavigation,
    sendHeatMapReport 
  } = useTelegramHeatMapIntegration();

  // Configure navigation based on selection
  useEffect(() => {
    configureHeatMapNavigation(selectedDiamond || undefined);
  }, [selectedDiamond, configureHeatMapNavigation]);

  // Send weekly heat map report
  useEffect(() => {
    if (diamonds.length > 0) {
      sendHeatMapReport(diamonds);
    }
  }, [diamonds, sendHeatMapReport]);

  const handleDiamondTap = useCallback((diamond: DiamondHeatData) => {
    // Telegram haptic feedback
    onHeatMapCellTap(diamond);
    
    // Update selection
    setSelectedDiamond(diamond);
    onDiamondSelect?.(diamond);
    
    // Trigger hot diamond notification if applicable
    if (diamond.interestLevel === 'high') {
      onHotDiamondFound(diamond);
    }
  }, [onHeatMapCellTap, onHotDiamondFound, onDiamondSelect]);

  const getHeatColor = useCallback((interestLevel: 'low' | 'medium' | 'high') => {
    switch (interestLevel) {
      case 'high': return 'bg-red-500/90 border-red-600';
      case 'medium': return 'bg-orange-400/80 border-orange-500';
      case 'low': return 'bg-blue-400/60 border-blue-500';
      default: return 'bg-muted/50 border-border';
    }
  }, []);

  const getInterestIcon = useCallback((interestLevel: 'low' | 'medium' | 'high') => {
    switch (interestLevel) {
      case 'high': return '🔥';
      case 'medium': return '⚡';
      case 'low': return '💎';
      default: return '💤';
    }
  }, []);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 p-4">
      {diamonds.map((diamond) => (
        <Card
          key={diamond.id}
          className={`
            relative cursor-pointer transition-all duration-200 
            ${getHeatColor(diamond.interestLevel)}
            ${selectedDiamond?.id === diamond.id ? 'ring-2 ring-primary scale-105' : ''}
            hover:scale-102 active:scale-95
            min-h-[120px] touch-manipulation
          `}
          onClick={() => handleDiamondTap(diamond)}
          onMouseEnter={onHeatMapCellHover}
          // Telegram-optimized touch targets (min 44px)
          style={{ minHeight: '44px', minWidth: '44px' }}
        >
          <CardContent className="p-3 h-full flex flex-col justify-between">
            {/* Interest indicator */}
            <div className="flex justify-between items-start mb-2">
              <span className="text-lg" role="img" aria-label={`${diamond.interestLevel} interest`}>
                {getInterestIcon(diamond.interestLevel)}
              </span>
              <span className="text-xs font-semibold bg-black/20 px-2 py-1 rounded text-white">
                {diamond.notificationCount}
              </span>
            </div>

            {/* Diamond info */}
            <div className="text-xs text-white space-y-1">
              <div className="font-medium">{diamond.shape}</div>
              <div>{diamond.carat}ct</div>
              <div className="font-semibold">${diamond.price.toLocaleString()}</div>
            </div>

            {/* Last interaction indicator */}
            <div className="text-xs text-white/80 mt-2">
              {diamond.lastInteraction.toLocaleDateString()}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}