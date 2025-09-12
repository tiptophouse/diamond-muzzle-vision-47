import { memo } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Filter, SortAsc, Sparkles } from 'lucide-react';
import { useTelegramWebApp } from '@/hooks/useTelegramWebApp';

interface MediaCounts {
  total: number;
  with3D: number;
  withImages: number;
  infoOnly: number;
}

interface TelegramStoreHeaderProps {
  mediaCounts: MediaCounts;
  activeFiltersCount: number;
  currentSegment: '3d' | 'photos' | 'info';
  onSegmentChange: (segment: '3d' | 'photos' | 'info') => void;
  onOpenFilters: () => void;
  onOpenSort: () => void;
}

export const TelegramStoreHeader = memo(function TelegramStoreHeader({
  mediaCounts,
  activeFiltersCount,
  currentSegment,
  onSegmentChange,
  onOpenFilters,
  onOpenSort
}: TelegramStoreHeaderProps) {
  const { hapticFeedback } = useTelegramWebApp();

  const handleSegmentChange = (segment: '3d' | 'photos' | 'info') => {
    hapticFeedback.selection();
    onSegmentChange(segment);
  };

  return (
    <div 
      className="sticky top-0 z-30 backdrop-blur-md supports-[backdrop-filter]:bg-[var(--tg-bg)]/80 border-b border-[var(--tg-hint)]/20"
      style={{
        paddingTop: 'env(safe-area-inset-top)',
        backgroundColor: 'var(--tg-bg)'
      }}
    >
      {/* Main Header */}
      <div className="px-4 py-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold flex items-center gap-2" style={{ color: 'var(--tg-text)' }}>
              <Sparkles className="h-5 w-5" style={{ color: 'var(--tg-link)' }} />
              Catalog
            </h1>
            <div className="text-xs space-y-1" style={{ color: 'var(--tg-hint)' }}>
              <p>{mediaCounts.total} available</p>
              <div className="flex items-center gap-3">
                {mediaCounts.with3D > 0 && (
                  <span className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    {mediaCounts.with3D} 3D
                  </span>
                )}
                {mediaCounts.withImages > 0 && (
                  <span className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    {mediaCounts.withImages} photos
                  </span>
                )}
                {mediaCounts.infoOnly > 0 && (
                  <span className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                    {mediaCounts.infoOnly} info
                  </span>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline" 
              size="sm"
              onClick={onOpenSort}
              className="h-8 px-2 text-xs border-[var(--tg-hint)]/30"
              style={{ 
                color: 'var(--tg-text)',
                borderColor: 'var(--tg-hint)'
              }}
            >
              <SortAsc className="h-3 w-3 mr-1" />
              Sort
            </Button>
            <Button
              variant="outline" 
              size="sm"
              onClick={onOpenFilters}
              className="h-8 px-2 text-xs relative border-[var(--tg-hint)]/30"
              style={{ 
                color: 'var(--tg-text)',
                borderColor: 'var(--tg-hint)'
              }}
            >
              <Filter className="h-3 w-3 mr-1" />
              Filter
              {activeFiltersCount > 0 && (
                <Badge 
                  className="absolute -top-1 -right-1 h-3 w-3 p-0 text-xs flex items-center justify-center"
                  style={{
                    backgroundColor: 'var(--tg-btn)',
                    color: 'var(--tg-btn-text)'
                  }}
                >
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Segmented Control */}
      <div className="px-4 pb-3">
        <div className="flex bg-[var(--tg-secondary-bg)] rounded-xl p-1 border border-[var(--tg-hint)]/20">
          {[
            { key: '3d' as const, label: '3D', count: mediaCounts.with3D },
            { key: 'photos' as const, label: 'Photos', count: mediaCounts.withImages },
            { key: 'info' as const, label: 'Info', count: mediaCounts.infoOnly }
          ].map(({ key, label, count }) => (
            <button
              key={key}
              onClick={() => handleSegmentChange(key)}
              className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                currentSegment === key
                  ? 'shadow-sm'
                  : ''
              }`}
              style={{
                backgroundColor: currentSegment === key ? 'var(--tg-btn)' : 'transparent',
                color: currentSegment === key ? 'var(--tg-btn-text)' : 'var(--tg-text)'
              }}
            >
              <span className="block">{label}</span>
              <span className="text-xs opacity-70">({count})</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
});