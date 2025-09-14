import { memo, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Diamond } from '@/components/inventory/InventoryTable';
import { useTelegramWebApp } from '@/hooks/useTelegramWebApp';
import { Play, Image as ImageIcon, FileText, ExternalLink } from 'lucide-react';

interface TelegramDiamondCardCompactProps {
  diamond: Diamond;
  onViewDetails: (diamond: Diamond) => void;
  onContact: (diamond: Diamond) => void;
}

export const TelegramDiamondCardCompact = memo(function TelegramDiamondCardCompact({
  diamond,
  onViewDetails,
  onContact
}: TelegramDiamondCardCompactProps) {
  const { hapticFeedback } = useTelegramWebApp();
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleViewDetails = useCallback(() => {
    hapticFeedback.impact('light');
    onViewDetails(diamond);
  }, [diamond, hapticFeedback, onViewDetails]);

  const handleContact = useCallback(() => {
    hapticFeedback.impact('medium');
    onContact(diamond);
  }, [diamond, hapticFeedback, onContact]);

  const hasMedia = diamond.gem360Url || (diamond.imageUrl && diamond.imageUrl !== 'default');
  const has3D = diamond.gem360Url && diamond.gem360Url.trim() !== '';
  const hasImage = diamond.imageUrl && diamond.imageUrl !== 'default' && diamond.imageUrl.trim() !== '';

  const getMediaIcon = () => {
    if (has3D) return <Play className="h-3 w-3" />;
    if (hasImage) return <ImageIcon className="h-3 w-3" />;
    return <FileText className="h-3 w-3" />;
  };

  const formatPrice = (price: number) => {
    if (price >= 1000000) return `$${(price / 1000000).toFixed(1)}M`;
    if (price >= 1000) return `$${(price / 1000).toFixed(0)}K`;
    return `$${price.toLocaleString()}`;
  };

  return (
    <div 
      className="bg-[var(--tg-secondary-bg)] rounded-xl border border-[var(--tg-hint)]/20 overflow-hidden shadow-sm"
      style={{ minHeight: '200px' }}
    >
      {/* Media Section */}
      <div className="relative aspect-[4/3] bg-gray-100 rounded-t-xl overflow-hidden">
        {hasImage && !imageError ? (
          <>
            <img
              src={diamond.imageUrl}
              alt={`${diamond.shape} ${diamond.carat}ct`}
              className={`w-full h-full object-cover transition-opacity duration-300 ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              loading="lazy"
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageError(true)}
            />
            {!imageLoaded && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                <div className="w-6 h-6 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
              </div>
            )}
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
            {getMediaIcon()}
          </div>
        )}
        
        {/* Media Badges */}
        <div className="absolute top-2 right-2 flex gap-1">
          {diamond.status === 'Available' && (
            <Badge 
              className="text-xs px-1.5 py-0.5 bg-green-100 text-green-800 border-0"
            >
              Available
            </Badge>
          )}
          {has3D && (
            <Badge 
              className="text-xs px-1.5 py-0.5 bg-purple-100 text-purple-800 border-0"
            >
              3D
            </Badge>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-3 space-y-2">
        {/* Title */}
        <div className="flex items-center justify-between">
          <p className="font-medium text-sm" style={{ color: 'var(--tg-text)' }}>
            {diamond.carat}ct • {diamond.shape}
          </p>
        </div>

        {/* Chips */}
        <div className="flex flex-wrap gap-1">
          <span className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded-md">
            {diamond.color}
          </span>
          <span className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded-md">
            {diamond.clarity}
          </span>
          {diamond.lab && (
            <span className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded-md">
              {diamond.lab}
            </span>
          )}
          {diamond.color_type === 'Fancy' && (
            <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs rounded-md">
              Fancy
            </span>
          )}
        </div>

        {/* Cut Quality */}
        {diamond.cut && (
          <div className="flex justify-end">
            <span className="text-xs px-2 py-0.5 bg-blue-50 text-blue-700 rounded-md">
              {diamond.cut}
            </span>
          </div>
        )}

        {/* Price */}
        {diamond.price > 0 && (
          <p className="font-semibold text-lg" style={{ color: 'var(--tg-text)' }}>
            {formatPrice(diamond.price)}
          </p>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-1">
          <Button
            variant="outline"
            size="sm"
            onClick={handleViewDetails}
            className="flex-1 h-8 text-xs border-[var(--tg-hint)]/30"
            style={{ color: 'var(--tg-text)' }}
          >
            <ExternalLink className="h-3 w-3 mr-1" />
            Details
          </Button>
          <Button
            size="sm"
            onClick={handleContact}
            className="flex-1 h-8 text-xs"
            style={{
              backgroundColor: 'var(--tg-btn)',
              color: 'var(--tg-btn-text)'
            }}
          >
            Contact
          </Button>
        </div>
      </div>
    </div>
  );
});