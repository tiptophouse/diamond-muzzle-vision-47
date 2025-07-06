import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, Share, Phone, MessageCircle, Eye, FileText, Gem } from "lucide-react";
import { Diamond } from "@/components/inventory/InventoryTable";
import { Gem360Viewer } from "./Gem360Viewer";
import { useToast } from "@/hooks/use-toast";

interface DiamondDetailsModalProps {
  diamond: Diamond | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToWishlist?: (diamond: Diamond) => void;
  isInWishlist?: boolean;
}

export function DiamondDetailsModal({ 
  diamond, 
  isOpen, 
  onClose, 
  onAddToWishlist,
  isInWishlist = false 
}: DiamondDetailsModalProps) {
  const [imageError, setImageError] = useState(false);
  const { toast } = useToast();

  if (!diamond) return null;

  const handleShare = async () => {
    try {
      await navigator.share({
        title: `${diamond.carat} Carat ${diamond.shape} Diamond`,
        text: `Check out this beautiful ${diamond.carat} carat ${diamond.color}-${diamond.clarity} ${diamond.shape} diamond`,
        url: window.location.href
      });
    } catch (error) {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link copied!",
        description: "Diamond link copied to clipboard",
      });
    }
  };

  const handleAddToWishlist = () => {
    if (onAddToWishlist) {
      onAddToWishlist(diamond);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const gem360Url = diamond.gem360Url || 
    (diamond.certificateUrl?.includes('gem360') ? diamond.certificateUrl : null);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-4">
          <DialogTitle className="text-xl font-semibold">
            {diamond.carat} Carat {diamond.shape} Diamond
          </DialogTitle>
          
          {/* Price and Quick Actions */}
          <div className="flex items-center justify-between">
            <div className="text-2xl font-bold text-primary">
              {formatPrice(diamond.price)}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleAddToWishlist}
                disabled={isInWishlist}
                className={isInWishlist ? "text-red-500" : ""}
              >
                <Heart className={`h-4 w-4 mr-2 ${isInWishlist ? 'fill-current' : ''}`} />
                {isInWishlist ? 'In Wishlist' : 'Add to Wishlist'}
              </Button>
              <Button variant="outline" size="sm" onClick={handleShare}>
                <Share className="h-4 w-4 mr-2" />
                Share
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Left Column - Image/3D Viewer */}
          <div className="space-y-4">
            <Card>
              <CardContent className="p-0">
                <div className="aspect-square bg-gray-50 rounded-lg overflow-hidden">
                  {gem360Url ? (
                    <Gem360Viewer 
                      gem360Url={gem360Url}
                      stockNumber={diamond.stockNumber}
                      isInline={true}
                    />
                  ) : (
                    <>
                      {!imageError && diamond.imageUrl ? (
                        <img
                          src={diamond.imageUrl}
                          alt={`${diamond.shape} Diamond`}
                          className="w-full h-full object-cover"
                          onError={() => setImageError(true)}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                          <div className="w-32 h-32 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
                            <Gem className="w-16 h-16 text-blue-600" />
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Certificates */}
            {diamond.certificateUrl && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <FileText className="h-4 w-4" />
                    Certificate
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <Button variant="outline" size="sm" asChild className="w-full">
                    <a href={diamond.certificateUrl} target="_blank" rel="noopener noreferrer">
                      <Eye className="h-4 w-4 mr-2" />
                      View Certificate
                    </a>
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - Details */}
          <div className="space-y-4">
            {/* The 4 C's */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">The 4 C's</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-gray-500">Carat</div>
                    <div className="font-semibold">{diamond.carat}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Color</div>
                    <div className="font-semibold">{diamond.color}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Clarity</div>
                    <div className="font-semibold">{diamond.clarity}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Cut</div>
                    <div className="font-semibold">{diamond.cut}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Additional Details */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Additional Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-500">Stock Number</span>
                  <span className="font-medium">{diamond.stockNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Shape</span>
                  <span className="font-medium">{diamond.shape}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Status</span>
                  <Badge variant={diamond.status === 'Available' ? 'default' : 'secondary'}>
                    {diamond.status}
                  </Badge>
                </div>
                {diamond.lab && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Lab</span>
                    <span className="font-medium">{diamond.lab}</span>
                  </div>
                )}
                {diamond.certificateNumber && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Certificate Number</span>
                    <span className="font-medium">{diamond.certificateNumber}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Contact Owner */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Contact Owner</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-gray-600">
                  Interested in this diamond? Get in touch with the owner for more details or to make an offer.
                </p>
                <div className="flex gap-2">
                  <Button className="flex-1">
                    <Phone className="h-4 w-4 mr-2" />
                    Call Owner
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Message
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}