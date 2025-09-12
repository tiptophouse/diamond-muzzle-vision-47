import { memo, useState, useCallback } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Diamond } from '@/components/inventory/InventoryTable';
import { useTelegramWebApp } from '@/hooks/useTelegramWebApp';
import { 
  Share2, 
  Copy, 
  ExternalLink, 
  Play, 
  Image as ImageIcon,
  FileText,
  Bookmark,
  Star
} from 'lucide-react';
import { toast } from 'sonner';

interface TelegramDetailsSheetProps {
  diamond: Diamond | null;
  isOpen: boolean;
  onClose: () => void;
  onContact: (diamond: Diamond) => void;
}

export const TelegramDetailsSheet = memo(function TelegramDetailsSheet({
  diamond,
  isOpen,
  onClose,
  onContact
}: TelegramDetailsSheetProps) {
  const { webApp, hapticFeedback, share } = useTelegramWebApp();
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const formatPrice = useCallback((price: number) => {
    return `$${price.toLocaleString()}`;
  }, []);

  const handleContact = useCallback(() => {
    if (!diamond) return;
    hapticFeedback.impact('medium');
    onContact(diamond);
    onClose();
  }, [diamond, hapticFeedback, onContact, onClose]);

  const handleShare = useCallback(async () => {
    if (!diamond) return;
    
    hapticFeedback.selection();
    
    const shareText = `🔹 ${diamond.carat}ct ${diamond.shape} Diamond
💎 Color: ${diamond.color} | Clarity: ${diamond.clarity}
${diamond.price > 0 ? `💰 Price: ${formatPrice(diamond.price)}` : ''}
📋 Stock: ${diamond.stockNumber}`;

    try {
      await share(shareText, `https://t.me/diamondmazalbot?start=diamond_${diamond.stockNumber}`);
      hapticFeedback.notification('success');
    } catch (error) {
      console.error('Share failed:', error);
    }
  }, [diamond, hapticFeedback, share, formatPrice]);

  const handleCopyLink = useCallback(async () => {
    if (!diamond) return;
    
    hapticFeedback.selection();
    
    const link = `https://t.me/diamondmazalbot?start=diamond_${diamond.stockNumber}`;
    
    try {
      await navigator.clipboard.writeText(link);
      toast.success('Link copied!');
      hapticFeedback.notification('success');
    } catch (error) {
      toast.error('Failed to copy link');
    }
  }, [diamond, hapticFeedback]);

  const handleViewCertificate = useCallback(() => {
    if (!diamond?.certificateUrl) return;
    
    hapticFeedback.impact('light');
    webApp?.openLink(diamond.certificateUrl, { try_instant_view: true });
  }, [diamond, hapticFeedback, webApp]);

  const handleSaveToTelegram = useCallback(() => {
    if (!diamond) return;
    
    hapticFeedback.selection();
    
    const saveText = `💎 Saved Diamond
🔹 ${diamond.carat}ct ${diamond.shape}
💎 ${diamond.color} | ${diamond.clarity}
${diamond.price > 0 ? `💰 ${formatPrice(diamond.price)}` : ''}
📋 ${diamond.stockNumber}`;

    const telegramUrl = `tg://msg_url?url=${encodeURIComponent(`https://t.me/diamondmazalbot?start=diamond_${diamond.stockNumber}`)}&text=${encodeURIComponent(saveText)}`;
    
    try {
      webApp?.openTelegramLink(telegramUrl);
    } catch (error) {
      // Fallback to copy
      navigator.clipboard.writeText(saveText);
      toast.success('Details copied to clipboard!');
    }
  }, [diamond, formatPrice, hapticFeedback, webApp]);

  if (!diamond) return null;

  const has3D = diamond.gem360Url && diamond.gem360Url.trim() !== '';
  const hasImage = diamond.imageUrl && diamond.imageUrl !== 'default' && diamond.imageUrl.trim() !== '';

  const specs = [
    { label: 'Carat', value: diamond.carat },
    { label: 'Shape', value: diamond.shape },
    { label: 'Color', value: diamond.color },
    { label: 'Clarity', value: diamond.clarity },
    { label: 'Cut', value: diamond.cut },
    { label: 'Lab', value: diamond.lab },
    { label: 'Certificate', value: diamond.certificateNumber },
  ].filter(spec => spec.value);

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent 
        side="bottom" 
        className="h-[85vh] p-0 bg-[var(--tg-bg)]"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <SheetHeader className="px-4 py-3 border-b border-[var(--tg-hint)]/20">
          <SheetTitle style={{ color: 'var(--tg-text)' }}>
            {diamond.carat}ct {diamond.shape}
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto">
          {/* Media Carousel */}
          <div className="p-4">
            <div className="relative aspect-[4/3] bg-gray-100 rounded-xl overflow-hidden">
              {hasImage && !imageError ? (
                <>
                  <img
                    src={diamond.imageUrl}
                    alt={`${diamond.shape} ${diamond.carat}ct`}
                    className={`w-full h-full object-cover transition-opacity duration-300 ${
                      imageLoaded ? 'opacity-100' : 'opacity-0'
                    }`}
                    onLoad={() => setImageLoaded(true)}
                    onError={() => setImageError(true)}
                  />
                  {!imageLoaded && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-8 h-8 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
                    </div>
                  )}
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                  {has3D ? <Play className="h-8 w-8 text-gray-400" /> : 
                   hasImage ? <ImageIcon className="h-8 w-8 text-gray-400" /> :
                   <FileText className="h-8 w-8 text-gray-400" />}
                </div>
              )}
              
              {/* Media Badges */}
              <div className="absolute top-3 right-3 flex gap-2">
                {diamond.status === 'Available' && (
                  <Badge className="bg-green-100 text-green-800 border-0">
                    Available
                  </Badge>
                )}
                {has3D && (
                  <Badge className="bg-purple-100 text-purple-800 border-0">
                    3D View
                  </Badge>
                )}
              </div>
            </div>

            {/* 3D Viewer Button */}
            {has3D && (
              <Button
                className="w-full mt-3"
                onClick={() => webApp?.openLink(diamond.gem360Url!, { try_instant_view: true })}
                style={{
                  backgroundColor: 'var(--tg-btn)',
                  color: 'var(--tg-btn-text)'
                }}
              >
                <Play className="h-4 w-4 mr-2" />
                View in 3D
              </Button>
            )}
          </div>

          {/* Specs Grid */}
          <div className="px-4 pb-4">
            <h3 className="font-semibold mb-3" style={{ color: 'var(--tg-text)' }}>
              Specifications
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {specs.map(({ label, value }) => (
                <div 
                  key={label}
                  className="p-3 bg-[var(--tg-secondary-bg)] rounded-lg border border-[var(--tg-hint)]/20"
                >
                  <p className="text-xs mb-1" style={{ color: 'var(--tg-hint)' }}>
                    {label}
                  </p>
                  <p className="font-medium" style={{ color: 'var(--tg-text)' }}>
                    {value}
                  </p>
                </div>
              ))}
            </div>

            {/* Price */}
            {diamond.price > 0 && (
              <div className="mt-4 p-4 bg-[var(--tg-secondary-bg)] rounded-lg border border-[var(--tg-hint)]/20">
                <p className="text-xs mb-1" style={{ color: 'var(--tg-hint)' }}>
                  Price
                </p>
                <p className="text-2xl font-bold" style={{ color: 'var(--tg-text)' }}>
                  {formatPrice(diamond.price)}
                </p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="p-4 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                onClick={handleShare}
                className="border-[var(--tg-hint)]/30"
                style={{ color: 'var(--tg-text)' }}
              >
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
              <Button
                variant="outline"
                onClick={handleCopyLink}
                className="border-[var(--tg-hint)]/30"
                style={{ color: 'var(--tg-text)' }}
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy Link
              </Button>
            </div>

            {diamond.certificateUrl && (
              <Button
                variant="outline"
                onClick={handleViewCertificate}
                className="w-full border-[var(--tg-hint)]/30"
                style={{ color: 'var(--tg-text)' }}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                View Certificate
              </Button>
            )}

            <Button
              variant="outline"
              onClick={handleSaveToTelegram}
              className="w-full border-[var(--tg-hint)]/30"
              style={{ color: 'var(--tg-text)' }}
            >
              <Bookmark className="h-4 w-4 mr-2" />
              Save to Telegram
            </Button>

            <Button
              onClick={handleContact}
              className="w-full"
              style={{
                backgroundColor: 'var(--tg-btn)',
                color: 'var(--tg-btn-text)'
              }}
            >
              Contact Seller
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
});