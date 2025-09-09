import { useState } from 'react';
import { AlertTriangle, ExternalLink, Wrench } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SegomaViewer } from './SegomaViewer';
import { V360Viewer } from './V360Viewer';
import { Gem360Viewer } from './Gem360Viewer';
import { AWSS3HTMLViewer } from './AWSS3HTMLViewer';
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

  // Enhanced detection for all client storage formats
  const detectProvider = (url: string) => {
    const cleanUrl = url.toLowerCase().trim();
    
    // Segoma detection (segoma.com URLs)
    if (cleanUrl.includes('segoma.com')) {
      return { provider: 'segoma', type: '360_interactive', supported: true };
    }
    
    // V360 detection (v360.in URLs)
    if (cleanUrl.includes('v360.in')) {
      return { provider: 'v360', type: '360_interactive', supported: true };
    }
    
    // AWS S3 HTML detection (my360.fab and other HTML files)
    if (cleanUrl.includes('s3.') && cleanUrl.includes('amazonaws.com') && cleanUrl.endsWith('.html')) {
      return { provider: 'aws_s3_html', type: '360_html', supported: true };
    }
    
    // AWS S3 my360.fab HTML detection (specific pattern)
    if (cleanUrl.includes('my360.fab') && cleanUrl.endsWith('.html')) {
      return { provider: 'aws_s3_html', type: '360_html', supported: true };
    }
    
    // AWS S3 static image detection (my360.sela and other static images)
    if ((cleanUrl.includes('s3.') && cleanUrl.includes('amazonaws.com')) || cleanUrl.includes('my360.sela')) {
      if (cleanUrl.match(/\.(jpg|jpeg|png)(\?.*)?$/)) {
        return { provider: 'aws_s3_image', type: '360_static', supported: true };
      }
    }
    
    // Generic 360 image detection
    if (cleanUrl.includes('360') || cleanUrl.includes('my360') || cleanUrl.includes('dan')) {
      return { provider: 'generic_360', type: '360_static', supported: true };
    }
    
    // Static image fallback
    if (cleanUrl.match(/\.(jpg|jpeg|png|gif|webp)(\?.*)?$/)) {
      return { provider: 'static_image', type: 'static', supported: true };
    }
    
    // Unsupported format
    return { provider: 'unknown', type: 'unknown', supported: false };
  };

  const detection = detectProvider(imageUrl);

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

    // Route to appropriate viewer component based on provider
    switch (provider) {
      case 'segoma':
        return (
          <SegomaViewer 
            segomaUrl={imageUrl}
            stockNumber={stockNumber}
            isInline={isInline}
            className={className}
          />
        );
        
      case 'v360':
        return (
          <V360Viewer 
            v360Url={imageUrl}
            stockNumber={stockNumber}
            isInline={isInline}
            className={className}
          />
        );
        
      case 'aws_s3_html':
        return (
          <AWSS3HTMLViewer 
            htmlUrl={imageUrl}
            stockNumber={stockNumber}
            isInline={isInline}
            className={className}
          />
        );
        
      case 'aws_s3_image':
      case 'generic_360':
        return (
          <Gem360Viewer 
            gem360Url={imageUrl}
            stockNumber={stockNumber}
            isInline={isInline}
            className={className}
          />
        );
        
      case 'static_image':
      default:
        return (
          <OptimizedDiamondImage
            imageUrl={imageUrl}
            stockNumber={stockNumber}
            shape="round"
            className={className}
          />
        );
    }
  };

  return (
    <div className="relative">
      {/* Provider detection badge for debugging */}
      {process.env.NODE_ENV === 'development' && (
        <Badge 
          variant="outline" 
          className="absolute top-2 right-2 z-50 text-xs bg-white/90"
        >
          {detection.provider}
        </Badge>
      )}
      
      {renderViewer()}
    </div>
  );
}