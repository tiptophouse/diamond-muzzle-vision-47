import { useState, useEffect } from 'react';
import { Gem, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SegomaViewerProps {
  segomaUrl: string;
  stockNumber: string;
  isInline?: boolean;
  className?: string;
}

export function SegomaViewer({ 
  segomaUrl, 
  stockNumber, 
  isInline = false,
  className = "" 
}: SegomaViewerProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Enhanced debugging for Segoma URLs - Monitor specific users (38166518, 2084882603)
  console.log('🔍 SEGOMA VIEWER:', {
    stockNumber,
    segomaUrl,
    isInline,
    isSegomaUrl: segomaUrl?.includes('segoma.com'),
    hasVAspx: segomaUrl?.includes('v.aspx'),
    hasTypeView: segomaUrl?.includes('type=view'),
    isCorrectFormat: /segoma\.com\/v\.aspx\?type=view&id=/.test(segomaUrl)
  });

  useEffect(() => {
    setIsLoading(true);
    setHasError(false);
    
    // Log when Segoma URL changes for debugging
    console.log('🔄 SEGOMA VIEWER: URL Changed:', {
      stockNumber,
      newUrl: segomaUrl,
      timestamp: new Date().toISOString()
    });
  }, [segomaUrl, stockNumber]);

  // Fallback when iframe is blocked by X-Frame-Options (onError may not fire)
  useEffect(() => {
    if (!isInline) return;
    const timer = setTimeout(() => {
      if (isLoading) {
        console.warn('Segoma iframe likely blocked, falling back to external link', { stockNumber, segomaUrl });
        setHasError(true);
        setIsLoading(false);
      }
    }, 2500);
    return () => clearTimeout(timer);
  }, [isInline, isLoading, segomaUrl, stockNumber]);

  const handleLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  const openInNewTab = () => {
    try {
      const tg = window.Telegram?.WebApp as any;
      if (tg?.openLink) {
        tg.openLink(segomaUrl, { try_instant_view: false });
      } else {
        window.open(segomaUrl, '_blank', 'noopener,noreferrer');
      }
    } catch (e) {
      console.error('Failed to open Segoma link via Telegram SDK, falling back', e);
      window.open(segomaUrl, '_blank', 'noopener,noreferrer');
    }
  };

  if (hasError) {
    return (
      <div className={`flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50 ${className}`}>
        <div className="text-center p-6">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-blue-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <Gem className="h-8 w-8 text-purple-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Segoma Viewer</h3>
          <p className="text-sm text-gray-600 mb-4">High-quality diamond imaging</p>
          <Button 
            size="sm" 
            variant="outline" 
            onClick={openInNewTab}
            className="text-purple-600 border-purple-300 hover:bg-purple-50"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            View Diamond
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative bg-white ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50 z-10">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-sm text-purple-600 font-medium">Loading Segoma Viewer...</p>
          </div>
        </div>
      )}
      
      {isInline ? (
        <iframe
          src={segomaUrl}
          title={`Segoma Diamond Viewer - ${stockNumber}`}
          className="w-full h-full border-0"
          onLoad={handleLoad}
          onError={handleError}
          allow="fullscreen"
          allowFullScreen
          loading="lazy"
        />
      ) : (
        <div className="flex items-center justify-center h-full bg-gradient-to-br from-purple-50 to-blue-50">
          <div className="text-center p-6">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-blue-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <Gem className="h-10 w-10 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Segoma Diamond Viewer</h3>
            <p className="text-sm text-gray-600 mb-4">Professional diamond imaging and analysis</p>
            <Button 
              onClick={openInNewTab}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              View Full Diamond Details
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}