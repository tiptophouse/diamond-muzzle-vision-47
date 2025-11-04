import { useState } from 'react';
import { AlertTriangle, ExternalLink, Wrench } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { OptimizedDiamondImage } from './OptimizedDiamondImage';

interface UniversalImageHandlerProps {
  imageUrl: string;
  stockNumber: string;
  isInline?: boolean;
  className?: string;
}

export function UniversalImageHandler({ 
  imageUrl, 
  stockNumber, 
  isInline = false, 
  className = "" 
}: UniversalImageHandlerProps) {
  const [isFixing, setIsFixing] = useState(false);

  // ENHANCED DEBUGGING for user 2084882603 - Segoma detection
  console.log('🔍 UNIVERSAL IMAGE HANDLER DEBUG:', {
    stockNumber,
    imageUrl, 
    imageUrlType: typeof imageUrl,
    imageUrlLength: imageUrl?.length,
    isSegoma: imageUrl?.includes('segoma.com'),
    isVAspx: imageUrl?.includes('v.aspx'),
    hasTypeView: imageUrl?.includes('type=view'),
    isSegomaPattern: /segoma\.com.*v\.aspx/.test(imageUrl || ''),
    fullUrlCheck: imageUrl
  });

  // Special logging for user 2084882603's Segoma URLs
  if (stockNumber === '105604' || imageUrl?.includes('segoma.com')) {
    console.log('🔍 SEGOMA SPECIFIC DEBUG:', {
      stockNumber,
      imageUrl,
      containsSegoma: imageUrl?.includes('segoma.com'),
      containsVAspx: imageUrl?.includes('v.aspx'),
      containsTypeView: imageUrl?.includes('type=view'),
      urlPattern: imageUrl ? imageUrl.match(/segoma\.com.*/) : null
    });
  }

  // Enhanced detection for all client storage formats with improved Segoma support
  const detectProvider = (url: string) => {
    const cleanUrl = url.toLowerCase().trim();
    
    // ENHANCED Segoma detection with comprehensive pattern matching
    if (cleanUrl.includes('segoma.com') || 
        cleanUrl.includes('v.aspx') ||
        cleanUrl.includes('type=view') ||
        /segoma\.com.*v\.aspx/.test(cleanUrl)) {
      console.log('🔍 SEGOMA DETECTED:', {
        originalUrl: url,
        cleanUrl: cleanUrl,
        pattern: 'segoma_detected'
      });
      return { provider: 'segoma', type: '360_interactive', supported: true };
    }
    
    // V360 detection (v360.in URLs)
    if (cleanUrl.includes('v360.in')) {
      return { provider: 'v360', type: '360_interactive', supported: true };
    }
    
    // Universal HTML viewer detection (catches all HTML-based viewers)
    if ((cleanUrl.includes('s3.') && cleanUrl.includes('amazonaws.com') && cleanUrl.endsWith('.html')) ||
        (cleanUrl.includes('my360.') && cleanUrl.endsWith('.html')) ||
        (cleanUrl.includes('.html') && (cleanUrl.includes('360') || cleanUrl.includes('diamond') || cleanUrl.includes('gem')))) {
      return { provider: 'aws_s3_html', type: '360_html', supported: true };
    }
    
    // Universal static image detection (AWS S3 and other providers)
    if ((cleanUrl.includes('s3.') && cleanUrl.includes('amazonaws.com')) || 
        cleanUrl.includes('my360.') || 
        cleanUrl.includes('360') || 
        cleanUrl.includes('dan')) {
      if (cleanUrl.match(/\.(jpg|jpeg|png)(\?.*)?$/)) {
        return { provider: 'aws_s3_image', type: '360_static', supported: true };
      }
    }
    
    // Static image fallback
    if (cleanUrl.match(/\.(jpg|jpeg|png|gif|webp)(\?.*)?$/)) {
      return { provider: 'static_image', type: 'static', supported: true };
    }
    
    // Unsupported format
    return { provider: 'unknown', type: 'unknown', supported: false };
  };

  const detection = detectProvider(imageUrl);

  // ENHANCED DEBUGGING for detection results
  console.log('🔍 PROVIDER DETECTION RESULT:', {
    stockNumber,
    imageUrl,
    detection,
    isSegoma: imageUrl?.includes('segoma.com')
  });

  const attemptAutoFix = () => {
    setIsFixing(true);
    // Simulate auto-fix attempt
    setTimeout(() => {
      setIsFixing(false);
      console.log('🔧 AUTO-FIX ATTEMPTED for:', imageUrl);
      // In a real implementation, this would try different URL patterns
    }, 2000);
  };

  // Render appropriate viewer based on detection
  const renderViewer = () => {
    const { provider, supported } = detection;
    
    if (!supported) {
      return (
        <div className={`flex flex-col items-center justify-center h-full bg-gradient-to-br from-red-50 to-orange-50 rounded-lg p-6 ${className}`}>
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="h-8 w-8 text-red-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Unsupported Format</h3>
          <p className="text-sm text-gray-600 mb-4 text-center max-w-xs">
            This image format is not yet supported by our viewers.
          </p>
          <div className="flex gap-2">
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => window.open(imageUrl, '_blank')}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Open Direct
            </Button>
            <Button 
              size="sm" 
              variant="outline"
              onClick={attemptAutoFix}
              disabled={isFixing}
            >
              <Wrench className="h-4 w-4 mr-2" />
              {isFixing ? 'Fixing...' : 'Auto-Fix'}
            </Button>
          </div>
          <Badge variant="secondary" className="mt-3 text-xs">
            URL: {imageUrl.substring(0, 50)}...
          </Badge>
        </div>
      );
    }

    // For 360 viewers, just show the URL instead of embedding
    if (provider === 'segoma' || provider === 'v360' || provider === 'aws_s3_html' || provider === 'aws_s3_image' || provider === 'generic_360') {
      return (
        <div className={`flex flex-col items-center justify-center h-full bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg p-6 ${className}`}>
          <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
            <ExternalLink className="h-8 w-8 text-purple-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">360° View Available</h3>
          <Badge variant="secondary" className="mb-3 text-xs">
            {provider.toUpperCase()}
          </Badge>
          <div className="w-full max-w-md p-3 bg-white rounded border border-gray-200 mb-4">
            <a 
              href={imageUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-xs text-blue-600 hover:text-blue-800 break-all"
            >
              {imageUrl}
            </a>
          </div>
          <Button 
            size="sm" 
            onClick={() => window.open(imageUrl, '_blank')}
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Open 360° View
          </Button>
        </div>
      );
    }

    // For static images, show the image
    return (
      <OptimizedDiamondImage
        imageUrl={imageUrl}
        stockNumber={stockNumber}
        shape="round"
        className={className}
      />
    );
  };

  return (
    <div className="relative">
      {/* Provider detection badge for debugging */}
      {process.env.NODE_ENV === 'development' && (
        <Badge 
          variant="outline" 
          className="absolute top-2 right-2 z-50 text-xs bg-white/90"
        >
          {detection.provider} | {stockNumber}
        </Badge>
      )}
      
      {renderViewer()}
    </div>
  );
}