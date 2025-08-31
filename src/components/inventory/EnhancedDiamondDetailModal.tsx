
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Diamond } from '@/types/diamond';
import { Gem360Viewer } from '@/components/store/Gem360Viewer';
import { ExternalLink, Copy, Share2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface EnhancedDiamondDetailModalProps {
  diamond: Diamond | null;
  isOpen: boolean;
  onClose: () => void;
}

export function EnhancedDiamondDetailModal({ diamond, isOpen, onClose }: EnhancedDiamondDetailModalProps) {
  const { toast } = useToast();

  if (!diamond) return null;

  const handleCopyStock = () => {
    navigator.clipboard.writeText(diamond.stockNumber || diamond.stock_number || '');
    toast({
      title: "📋 Copied",
      description: "Stock number copied to clipboard",
    });
  };

  const handleShare = () => {
    const shareData = {
      title: `Diamond ${diamond.stockNumber}`,
      text: `${diamond.carat}ct ${diamond.shape} ${diamond.color} ${diamond.clarity}`,
      url: window.location.href,
    };

    if (navigator.share) {
      navigator.share(shareData);
    } else {
      navigator.clipboard.writeText(`${shareData.title} - ${shareData.text} - ${shareData.url}`);
      toast({
        title: "📋 Copied",
        description: "Diamond details copied to clipboard",
      });
    }
  };

  const imageUrl = diamond.imageUrl || diamond.picture || diamond.Image || diamond.image;
  const certificateUrl = diamond.certificateUrl || diamond.certificate_url;
  const gem360Url = diamond.gem360Url || diamond['Video link'] || diamond.videoLink;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Diamond Details - {diamond.stockNumber || diamond.stock_number}</span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleCopyStock}>
                <Copy className="h-4 w-4 mr-1" />
                Copy Stock
              </Button>
              <Button variant="outline" size="sm" onClick={handleShare}>
                <Share2 className="h-4 w-4 mr-1" />
                Share
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Image and 360° Viewer */}
          <div className="space-y-4">
            {imageUrl && (
              <div className="aspect-square bg-gray-50 rounded-lg overflow-hidden">
                <img
                  src={imageUrl}
                  alt={`Diamond ${diamond.stockNumber}`}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
            )}
            
            {gem360Url && (
              <div className="aspect-square bg-gray-50 rounded-lg overflow-hidden">
                <Gem360Viewer
                  gem360Url={gem360Url}
                  stockNumber={diamond.stockNumber || diamond.stock_number || ''}
                  isInline={true}
                  className="w-full h-full"
                />
              </div>
            )}
          </div>

          {/* Diamond Details */}
          <div className="space-y-6">
            {/* Basic Information */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Basic Information</h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-sm text-gray-500">Shape</span>
                  <p className="font-medium">{diamond.shape}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Carat</span>
                  <p className="font-medium">{diamond.carat || diamond.weight}ct</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Color</span>
                  <p className="font-medium">{diamond.color}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Clarity</span>
                  <p className="font-medium">{diamond.clarity}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Cut</span>
                  <p className="font-medium">{diamond.cut}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Polish</span>
                  <p className="font-medium">{diamond.polish}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Symmetry</span>
                  <p className="font-medium">{diamond.symmetry}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Fluorescence</span>
                  <p className="font-medium">{diamond.fluorescence}</p>
                </div>
              </div>
            </div>

            {/* Measurements */}
            {(diamond.length || diamond.width || diamond.depth) && (
              <div>
                <h3 className="text-lg font-semibold mb-3">Measurements</h3>
                <div className="grid grid-cols-2 gap-3">
                  {diamond.length && (
                    <div>
                      <span className="text-sm text-gray-500">Length</span>
                      <p className="font-medium">{diamond.length}mm</p>
                    </div>
                  )}
                  {diamond.width && (
                    <div>
                      <span className="text-sm text-gray-500">Width</span>
                      <p className="font-medium">{diamond.width}mm</p>
                    </div>
                  )}
                  {diamond.depth && (
                    <div>
                      <span className="text-sm text-gray-500">Depth</span>
                      <p className="font-medium">{diamond.depth}mm</p>
                    </div>
                  )}
                  {diamond.ratio && (
                    <div>
                      <span className="text-sm text-gray-500">Ratio</span>
                      <p className="font-medium">{diamond.ratio}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Certificate Information */}
            {(diamond.lab || diamond.certificateNumber) && (
              <div>
                <h3 className="text-lg font-semibold mb-3">Certificate</h3>
                <div className="space-y-2">
                  {diamond.lab && (
                    <div>
                      <span className="text-sm text-gray-500">Lab</span>
                      <p className="font-medium">{diamond.lab}</p>
                    </div>
                  )}
                  {diamond.certificateNumber && (
                    <div>
                      <span className="text-sm text-gray-500">Certificate Number</span>
                      <p className="font-medium">{diamond.certificateNumber || diamond.certificate_number}</p>
                    </div>
                  )}
                  {certificateUrl && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(certificateUrl, '_blank')}
                      className="mt-2"
                    >
                      <ExternalLink className="h-4 w-4 mr-1" />
                      View Certificate
                    </Button>
                  )}
                </div>
              </div>
            )}

            {/* Pricing */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Pricing</h3>
              <div className="grid grid-cols-2 gap-3">
                {diamond.price_per_carat && (
                  <div>
                    <span className="text-sm text-gray-500">Price per Carat</span>
                    <p className="font-medium">${diamond.price_per_carat?.toLocaleString()}</p>
                  </div>
                )}
                <div>
                  <span className="text-sm text-gray-500">Total Price</span>
                  <p className="font-medium text-lg">
                    ${((diamond.price_per_carat || diamond.price || 0) * (diamond.carat || diamond.weight || 1)).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Status */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Status</h3>
              <div className="flex gap-2">
                <Badge variant={diamond.store_visible ? "default" : "secondary"}>
                  {diamond.store_visible ? "Visible in Store" : "Hidden from Store"}
                </Badge>
                <Badge variant="outline">{diamond.status}</Badge>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
