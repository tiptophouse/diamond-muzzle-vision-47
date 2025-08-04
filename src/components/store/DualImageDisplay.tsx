
import { useState } from "react";
import { ChevronLeft, ChevronRight, FileImage, Gem } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface DualImageDisplayProps {
  diamondImage?: string;
  certificateImage?: string;
  stockNumber: string;
  className?: string;
}

export function DualImageDisplay({ 
  diamondImage, 
  certificateImage, 
  stockNumber,
  className = "" 
}: DualImageDisplayProps) {
  const [currentImage, setCurrentImage] = useState<'diamond' | 'certificate'>('diamond');
  const [imageError, setImageError] = useState<Record<string, boolean>>({});
  
  const hasValidDiamondImage = !!(
    diamondImage && 
    diamondImage.trim() && 
    diamondImage !== 'default' &&
    diamondImage.startsWith('http') &&
    diamondImage.length > 10 &&
    diamondImage.match(/\.(jpg|jpeg|png|webp|gif)(\?.*)?$/i) &&
    !imageError[diamondImage]
  );

  const hasValidCertificateImage = !!(
    certificateImage && 
    certificateImage.trim() && 
    certificateImage !== 'default' &&
    certificateImage.startsWith('http') &&
    certificateImage.length > 10 &&
    (certificateImage.match(/\.(jpg|jpeg|png|webp|gif)(\?.*)?$/i) || 
     certificateImage.includes('certificate') ||
     certificateImage.includes('cert')) &&
    !imageError[certificateImage]
  );

  const totalImages = (hasValidDiamondImage ? 1 : 0) + (hasValidCertificateImage ? 1 : 0);
  
  if (totalImages === 0) {
    return null; // No images to display
  }

  // If only one image type available, show it directly
  if (totalImages === 1) {
    const imageToShow = hasValidDiamondImage ? diamondImage : certificateImage;
    const imageType = hasValidDiamondImage ? 'diamond' : 'certificate';
    
    return (
      <div className={`relative aspect-square bg-gray-50 overflow-hidden ${className}`}>
        <img
          src={imageToShow}
          alt={`${imageType === 'diamond' ? 'Diamond' : 'Certificate'} ${stockNumber}`}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={() => setImageError(prev => ({ ...prev, [imageToShow!]: true }))}
        />
        <div className="absolute top-2 left-2">
          <Badge className={`text-xs font-medium border-0 text-white px-2 py-0.5 ${
            imageType === 'diamond' 
              ? 'bg-blue-500' 
              : 'bg-green-600'
          }`}>
            {imageType === 'diamond' ? (
              <>
                <Gem className="h-3 w-3 mr-1" />
                Diamond
              </>
            ) : (
              <>
                <FileImage className="h-3 w-3 mr-1" />
                Certificate
              </>
            )}
          </Badge>
        </div>
      </div>
    );
  }

  // Show carousel for multiple images
  const currentImageUrl = currentImage === 'diamond' ? diamondImage : certificateImage;
  const isValidCurrentImage = currentImage === 'diamond' ? hasValidDiamondImage : hasValidCertificateImage;

  const switchImage = () => {
    if (currentImage === 'diamond' && hasValidCertificateImage) {
      setCurrentImage('certificate');
    } else if (currentImage === 'certificate' && hasValidDiamondImage) {
      setCurrentImage('diamond');
    }
  };

  return (
    <div className={`relative aspect-square bg-gray-50 overflow-hidden ${className}`}>
      {isValidCurrentImage && currentImageUrl ? (
        <img
          src={currentImageUrl}
          alt={`${currentImage === 'diamond' ? 'Diamond' : 'Certificate'} ${stockNumber}`}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={() => setImageError(prev => ({ ...prev, [currentImageUrl]: true }))}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-gray-100">
          <div className="text-center">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-2">
              {currentImage === 'diamond' ? (
                <Gem className="h-8 w-8 text-gray-400" />
              ) : (
                <FileImage className="h-8 w-8 text-gray-400" />
              )}
            </div>
            <p className="text-sm text-gray-500">Image Error</p>
          </div>
        </div>
      )}

      {/* Image Type Badge */}
      <div className="absolute top-2 left-2">
        <Badge className={`text-xs font-medium border-0 text-white px-2 py-0.5 ${
          currentImage === 'diamond' 
            ? 'bg-blue-500' 
            : 'bg-green-600'
        }`}>
          {currentImage === 'diamond' ? (
            <>
              <Gem className="h-3 w-3 mr-1" />
              Diamond
            </>
          ) : (
            <>
              <FileImage className="h-3 w-3 mr-1" />
              Certificate
            </>
          )}
        </Badge>
      </div>

      {/* Navigation Controls */}
      <div className="absolute top-2 right-2 flex gap-1">
        <Button
          size="sm"
          variant="secondary"
          className="w-8 h-8 p-0 bg-white/90 hover:bg-white"
          onClick={switchImage}
          title={`Switch to ${currentImage === 'diamond' ? 'certificate' : 'diamond'}`}
        >
          {currentImage === 'diamond' ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Image Counter */}
      <div className="absolute bottom-2 right-2">
        <div className="bg-black/70 text-white text-xs px-2 py-1 rounded">
          {currentImage === 'diamond' ? '1' : '2'} / {totalImages}
        </div>
      </div>
    </div>
  );
}
