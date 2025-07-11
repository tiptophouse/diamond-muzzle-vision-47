import { useState } from "react";
import { Diamond } from "@/components/inventory/InventoryTable";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, Share, Zap, Award, Eye, ArrowLeft, ArrowRight, Maximize2 } from "lucide-react";
import { Gem360Viewer } from "./Gem360Viewer";

interface LuxuryDiamondModalProps {
  diamond: Diamond;
  children: React.ReactNode;
}

export function LuxuryDiamondModal({ diamond, children }: LuxuryDiamondModalProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [showFullscreen, setShowFullscreen] = useState(false);
  
  // Generate multiple diamond images for gallery
  const diamondImages = [
    diamond.imageUrl || `https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&h=800&fit=crop&crop=center`,
    `https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800&h=800&fit=crop&crop=center`,
    `https://images.unsplash.com/photo-1506629905607-c072d1d043ba?w=800&h=800&fit=crop&crop=center`,
    `https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=800&h=800&fit=crop&crop=center`
  ].filter(Boolean);

  const gem360Url = diamond.gem360Url || diamond.certificateUrl;
  const hasGem360View = gem360Url && gem360Url.includes('gem360');

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % diamondImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + diamondImages.length) % diamondImages.length);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(price);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-7xl w-[95vw] h-[95vh] p-0 overflow-hidden bg-gradient-to-br from-slate-50 via-white to-purple-50/30">
        <div className="grid grid-cols-1 lg:grid-cols-2 h-full">
          {/* Left Side - Images/3D Viewer */}
          <div className="relative bg-gradient-to-br from-slate-100 to-slate-200 flex flex-col">
            {/* Image Gallery Header */}
            <div className="absolute top-4 left-4 z-20">
              <Badge className="bg-black/80 text-white backdrop-blur-sm">
                Premium Collection
              </Badge>
            </div>
            
            <div className="absolute top-4 right-4 z-20 flex gap-2">
              <Button
                size="icon"
                variant="ghost"
                className="bg-white/90 backdrop-blur-sm hover:bg-white"
                onClick={() => setShowFullscreen(true)}
              >
                <Maximize2 className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className={`backdrop-blur-sm hover:bg-white ${isLiked ? 'bg-red-50 text-red-500' : 'bg-white/90'}`}
                onClick={() => setIsLiked(!isLiked)}
              >
                <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
              </Button>
            </div>

            {/* Main Image/3D Viewer */}
            <div className="flex-1 relative overflow-hidden">
              {hasGem360View ? (
                <Gem360Viewer 
                  gem360Url={gem360Url!}
                  stockNumber={diamond.stockNumber}
                  isInline={true}
                />
              ) : (
                <div className="relative w-full h-full group">
                  <img
                    src={diamondImages[currentImageIndex]}
                    alt={`${diamond.shape} Diamond`}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  
                  {/* Navigation Arrows */}
                  {diamondImages.length > 1 && (
                    <>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm hover:bg-white opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={prevImage}
                      >
                        <ArrowLeft className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm hover:bg-white opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={nextImage}
                      >
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                  
                  {/* Floating GIA Badge */}
                  <div className="absolute bottom-6 left-6">
                    <div className="bg-white/95 backdrop-blur-sm rounded-full px-4 py-2 flex items-center gap-2 shadow-lg">
                      <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs font-bold">G</span>
                      </div>
                      <span className="text-sm font-semibold text-gray-900">GIA Certified</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Thumbnail Gallery */}
            {!hasGem360View && diamondImages.length > 1 && (
              <div className="p-4 bg-white/50 backdrop-blur-sm">
                <div className="flex gap-2 overflow-x-auto">
                  {diamondImages.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                        index === currentImageIndex 
                          ? 'border-purple-500 shadow-lg' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <img
                        src={image}
                        alt={`View ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Side - Details */}
          <div className="flex flex-col overflow-y-auto">
            {/* Header */}
            <div className="p-6 border-b border-gray-200 bg-white/80 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-4">
                <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                  <Award className="w-3 h-3 mr-1" />
                  Premium
                </Badge>
                <Button variant="ghost" size="sm" className="text-gray-500">
                  <Share className="w-4 h-4 mr-2" />
                  Share
                </Button>
              </div>
              
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                {diamond.carat} Carat {diamond.color}-{diamond.clarity} {diamond.shape} Diamond
              </h1>
              
              <div className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                {formatPrice(diamond.price)}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="p-6 bg-gradient-to-r from-gray-50 to-purple-50/30">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-white rounded-xl shadow-sm">
                  <div className="text-2xl font-bold text-gray-900">{diamond.carat}</div>
                  <div className="text-sm text-gray-500">Carat Weight</div>
                </div>
                <div className="text-center p-4 bg-white rounded-xl shadow-sm">
                  <div className="text-2xl font-bold text-gray-900">{diamond.color}</div>
                  <div className="text-sm text-gray-500">Color Grade</div>
                </div>
                <div className="text-center p-4 bg-white rounded-xl shadow-sm">
                  <div className="text-2xl font-bold text-gray-900">{diamond.clarity}</div>
                  <div className="text-sm text-gray-500">Clarity</div>
                </div>
                <div className="text-center p-4 bg-white rounded-xl shadow-sm">
                  <div className="text-2xl font-bold text-gray-900">{diamond.cut}</div>
                  <div className="text-sm text-gray-500">Cut Quality</div>
                </div>
              </div>
            </div>

            {/* Detailed Description */}
            <div className="flex-1 p-6">
              <h3 className="text-lg font-semibold mb-4">Diamond Details</h3>
              
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium mb-2">Certification</h4>
                  <p className="text-sm text-gray-600">
                    This exceptional {diamond.shape.toLowerCase()} diamond has been meticulously graded by the 
                    Gemological Institute of America (GIA), ensuring the highest standards of quality and authenticity.
                  </p>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium mb-2">Cut Quality</h4>
                  <p className="text-sm text-gray-600">
                    The {diamond.cut.toLowerCase()} cut maximizes the diamond's brilliance and fire, 
                    creating exceptional light performance that showcases the stone's natural beauty.
                  </p>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium mb-2">Investment Value</h4>
                  <p className="text-sm text-gray-600">
                    High-quality diamonds like this {diamond.color}-{diamond.clarity} specimen have shown 
                    consistent appreciation over time, making it both a beautiful and valuable acquisition.
                  </p>
                </div>

                {hasGem360View && (
                  <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <h4 className="font-medium mb-2 text-purple-800">
                      <Eye className="w-4 h-4 inline mr-2" />
                      Interactive 3D Experience
                    </h4>
                    <p className="text-sm text-purple-700">
                      Explore this diamond in stunning 360° detail with our advanced 3D viewer technology.
                    </p>
                  </div>
                )}
              </div>

              {/* Technical Specifications */}
              <div className="mt-6 p-4 border border-gray-200 rounded-lg">
                <h4 className="font-medium mb-3">Technical Specifications</h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-gray-500">Stock Number:</span>
                    <span className="ml-2 font-medium">#{diamond.stockNumber}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Shape:</span>
                    <span className="ml-2 font-medium">{diamond.shape}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Polish:</span>
                    <span className="ml-2 font-medium">Excellent</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Symmetry:</span>
                    <span className="ml-2 font-medium">Excellent</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="p-6 border-t border-gray-200 bg-white">
              <div className="flex gap-3">
                <Button className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-3">
                  <Zap className="w-4 h-4 mr-2" />
                  Contact Seller
                </Button>
                <Button variant="outline" className="px-6 py-3">
                  <Heart className="w-4 h-4" />
                </Button>
              </div>
              
              <p className="text-xs text-gray-500 mt-3 text-center">
                Secure transaction • Certified authentic • 30-day return policy
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}