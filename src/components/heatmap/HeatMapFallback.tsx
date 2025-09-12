import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TelegramHeatMapGrid } from './TelegramHeatMapGrid';
import { Flame, Grid3X3, Eye } from 'lucide-react';

interface DiamondHeatData {
  id: string;
  shape: string;
  carat: number;
  price: number;
  notificationCount: number;
  lastInteraction: Date;
  interestLevel: 'low' | 'medium' | 'high';
}

interface HeatMapFallbackProps {
  diamonds: DiamondHeatData[];
  onDiamondSelect?: (diamond: DiamondHeatData) => void;
  height?: number;
}

export function HeatMapFallback({ 
  diamonds, 
  onDiamondSelect, 
  height = 400 
}: HeatMapFallbackProps) {
  const stats = {
    total: diamonds.length,
    hot: diamonds.filter(d => d.interestLevel === 'high').length,
    medium: diamonds.filter(d => d.interestLevel === 'medium').length,
    totalViews: diamonds.reduce((sum, d) => sum + d.notificationCount, 0)
  };

  return (
    <div 
      className="w-full bg-gradient-to-br from-slate-50 to-blue-50 border border-slate-200 rounded-lg overflow-hidden" 
      style={{ height }}
    >
      {/* Header */}
      <div className="p-4 bg-white/80 backdrop-blur-sm border-b border-slate-200">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-orange-500" />
            <h3 className="font-semibold text-slate-800">Interest Heat Map</h3>
          </div>
          <Badge variant="secondary" className="text-xs">
            2D View
          </Badge>
        </div>
        
        {/* Stats */}
        <div className="flex gap-4 text-xs">
          <div className="flex items-center gap-1">
            <Grid3X3 className="w-3 h-3 text-slate-500" />
            <span className="text-slate-600">{stats.total} Diamonds</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            <span className="text-red-700">{stats.hot} Hot</span>
          </div>
          <div className="flex items-center gap-1">
            <Eye className="w-3 h-3 text-blue-500" />
            <span className="text-blue-700">{stats.totalViews} Views</span>
          </div>
        </div>
      </div>

      {/* Fallback Grid */}
      <div className="p-4 h-full overflow-auto">
        {diamonds.length > 0 ? (
          <TelegramHeatMapGrid 
            diamonds={diamonds}
            onDiamondSelect={onDiamondSelect}
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 flex items-center justify-center">
                <Flame className="w-8 h-8 text-slate-400" />
              </div>
              <h4 className="font-medium text-slate-700 mb-2">No Heat Data</h4>
              <p className="text-sm text-slate-500">
                Customer interactions will appear here
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}