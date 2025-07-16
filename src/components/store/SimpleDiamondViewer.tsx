import { useState, useEffect } from 'react';
import { Diamond } from "@/components/inventory/InventoryTable";
import { useTelegramHapticFeedback } from "@/hooks/useTelegramHapticFeedback";
import { Button } from "@/components/ui/button";
import { Share2, FileText, Image as ImageIcon } from "lucide-react";
import { toast } from 'sonner';

interface SimpleDiamondViewerProps {
  diamond: Diamond;
}

export function SimpleDiamondViewer({ diamond }: SimpleDiamondViewerProps) {
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const { selectionChanged } = useTelegramHapticFeedback();

  useEffect(() => {
    // Check if Telegram WebApp is available
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      const webApp = window.Telegram.WebApp;
      
      // Enable device orientation if available
      if (window.DeviceOrientationEvent) {
        const handleOrientation = (event: DeviceOrientationEvent) => {
          const beta = event.beta || 0; // X-axis rotation
          const gamma = event.gamma || 0; // Y-axis rotation
          
          setTilt({
            x: Math.max(-15, Math.min(15, gamma / 6)), // Limit tilt range
            y: Math.max(-15, Math.min(15, beta / 6))
          });
        };

        // Request permission for iOS devices
        if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
          (DeviceOrientationEvent as any).requestPermission()
            .then((response: string) => {
              if (response === 'granted') {
                window.addEventListener('deviceorientation', handleOrientation);
              }
            });
        } else {
          // For Android and other devices
          window.addEventListener('deviceorientation', handleOrientation);
        }

        return () => {
          window.removeEventListener('deviceorientation', handleOrientation);
        };
      }
    }
  }, []);

  const handleShare = () => {
    selectionChanged();
    const shareText = `Check out this ${diamond.shape} diamond: ${diamond.carat}ct, ${diamond.color}, ${diamond.clarity} - Stock: ${diamond.stockNumber}`;
    const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(shareText)}`;
    
    if (window.Telegram?.WebApp) {
      // Open Telegram share in new window
      window.open(shareUrl, '_blank');
    } else {
      navigator.clipboard?.writeText(window.location.href);
      toast.success('Share link copied!');
    }
  };

  const isGem360 = diamond.imageUrl?.includes('diamondview.aspx') || diamond.gem360Url;

  return (
    <div className="max-w-sm mx-auto bg-white rounded-2xl shadow-lg overflow-hidden">
      {/* Diamond Image/Viewer */}
      <div 
        className="relative h-64 bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center overflow-hidden"
        style={{
          transform: `perspective(1000px) rotateX(${tilt.y}deg) rotateY(${tilt.x}deg)`,
          transition: 'transform 0.1s ease-out'
        }}
      >
        {isGem360 ? (
          <iframe
            src={diamond.imageUrl || diamond.gem360Url}
            className="w-full h-full border-0"
            style={{
              transform: `rotateX(${tilt.y * 0.5}deg) rotateY(${tilt.x * 0.5}deg)`,
              transition: 'transform 0.1s ease-out'
            }}
            title="3D Diamond Viewer"
          />
        ) : diamond.imageUrl ? (
          <img
            src={diamond.imageUrl}
            alt={`Diamond ${diamond.stockNumber}`}
            className="w-full h-full object-cover"
            style={{
              transform: `rotateX(${tilt.y * 0.3}deg) rotateY(${tilt.x * 0.3}deg)`,
              transition: 'transform 0.1s ease-out'
            }}
          />
        ) : (
          <div className="w-16 h-16 bg-slate-300 rounded-full flex items-center justify-center">
            <ImageIcon className="w-8 h-8 text-slate-500" />
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="p-6 space-y-4">
        {/* Specification Button */}
        <Button 
          className="w-full bg-orange-500 hover:bg-orange-600 text-white rounded-lg py-3"
          onClick={() => {
            selectionChanged();
            toast.info(`${diamond.shape} ${diamond.carat}ct ${diamond.color} ${diamond.clarity} ${diamond.cut || ''}`);
          }}
        >
          <FileText className="w-4 h-4 mr-2" />
          Specification
        </Button>

        {/* Diamond Name */}
        <div className="bg-orange-500 text-white text-center py-2 rounded-lg">
          <span className="font-medium">Name: {diamond.stockNumber}</span>
        </div>

        {/* Image Button */}
        <Button 
          className="w-full bg-orange-500 hover:bg-orange-600 text-white rounded-lg py-3"
          onClick={() => {
            selectionChanged();
            if (diamond.imageUrl) {
              window.open(diamond.imageUrl, '_blank');
            } else {
              toast.info('No image available');
            }
          }}
        >
          <ImageIcon className="w-4 h-4 mr-2" />
          Image
        </Button>

        {/* Share Section */}
        <div className="bg-orange-500 text-white rounded-lg p-3">
          <div className="flex items-center justify-between">
            <span className="font-medium">Share</span>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="secondary"
                className="w-8 h-8 p-0 bg-blue-600 hover:bg-blue-700 text-white"
                onClick={handleShare}
              >
                <Share2 className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="secondary"
                className="w-8 h-8 p-0 bg-blue-500 hover:bg-blue-600 text-white"
                onClick={handleShare}
              >
                f
              </Button>
              <Button
                size="sm"
                variant="secondary"
                className="w-8 h-8 p-0 bg-orange-600 hover:bg-orange-700 text-white"
                onClick={handleShare}
              >
                ✉
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}