import { useState, useEffect, useRef } from "react";
import { MessageCircle, Gem, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Diamond } from "@/components/inventory/InventoryTable";
import { useTelegramAuth } from "@/context/TelegramAuthContext";
import { useTelegramAccelerometer } from "@/hooks/useTelegramAccelerometer";
import { useTelegramHapticFeedback } from "@/hooks/useTelegramHapticFeedback";
import { Gem360Viewer } from "./Gem360Viewer";

interface MotionDiamondCardProps {
  diamond: Diamond;
  index: number;
  onViewDetails?: (diamond: Diamond) => void;
}

export function MotionDiamondCard({ diamond, index, onViewDetails }: MotionDiamondCardProps) {
  const [imageError, setImageError] = useState(false);
  const [isMotionMode, setIsMotionMode] = useState(true); // Auto-enable motion mode
  const [showViewer, setShowViewer] = useState(false);
  const { user } = useTelegramAuth();
  const { accelerometerData, orientationData, isSupported, startAccelerometer, stopAccelerometer } = useTelegramAccelerometer(isMotionMode, 60);
  const { impactOccurred, selectionChanged } = useTelegramHapticFeedback();
  const cardRef = useRef<HTMLDivElement>(null);

  // Auto-start motion mode when component mounts
  useEffect(() => {
    if (isSupported && isMotionMode) {
      startAccelerometer();
    }
    return () => {
      if (isSupported) {
        stopAccelerometer();
      }
    };
  }, [isSupported, startAccelerometer, stopAccelerometer, isMotionMode]);

  // Calculate diamond image rotation based on device tilt
  const getDiamondImageTransform = () => {
    if (!isMotionMode) return '';
    
    // Use orientation data for precise motion tracking
    const { beta, gamma } = orientationData;
    
    // Convert orientation to rotation values (max ±10° as specified)
    const rotateX = Math.max(-10, Math.min(10, beta * 0.5));
    const rotateY = Math.max(-10, Math.min(10, gamma * 0.5));
    
    return `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
  };

  // Toggle motion mode
  const toggleMotionMode = () => {
    if (!isSupported) {
      impactOccurred('heavy');
      return;
    }

    setIsMotionMode(prev => {
      const newMode = !prev;
      if (newMode) {
        impactOccurred('medium');
        startAccelerometer();
      } else {
        impactOccurred('light');
        stopAccelerometer();
      }
      return newMode;
    });
    selectionChanged();
  };

  const handleContactOwner = () => {
    const message = `Hi! I'm interested in your diamond:\n\n` +
      `Stock #: ${diamond.stockNumber}\n` +
      `Shape: ${diamond.shape}\n` +
      `Carat: ${diamond.carat}\n` +
      `Color: ${diamond.color}\n` +
      `Clarity: ${diamond.clarity}\n` +
      `Price: $${diamond.price.toLocaleString()}\n\n` +
      `Could you please provide more details?`;

    const encodedMessage = encodeURIComponent(message);
    const telegramUrl = `https://t.me/share/url?url=${encodedMessage}`;
    
    try {
      window.open(telegramUrl, '_blank');
      impactOccurred('light');
    } catch (error) {
      console.error('Failed to open Telegram:', error);
      window.open(telegramUrl, '_blank');
    }
  };

  const handleViewDetails = () => {
    impactOccurred('medium');
    if (onViewDetails) {
      onViewDetails(diamond);
    }
  };

  const hasGem360 = diamond.gem360Url && diamond.gem360Url.includes('gem360');

  return (
    <div 
      ref={cardRef}
      className={`bg-white rounded-xl shadow-sm border border-slate-200 hover:shadow-lg transition-all duration-300 group animate-fade-in ${
        isMotionMode ? 'motion-card' : 'hover:-translate-y-1'
      }`}
      style={{ 
        animationDelay: `${index * 100}ms`
      }}
    >
      {/* Image Container */}
      <div className="relative h-64 bg-white rounded-t-xl overflow-hidden">
        {hasGem360 ? (
          // Show interactive 3D viewer
          <div className="w-full h-full">
            <Gem360Viewer 
              gem360Url={diamond.gem360Url!}
              stockNumber={diamond.stockNumber}
              isInline={true}
            />
          </div>
        ) : diamond.imageUrl && !imageError ? (
          <img
            src={diamond.imageUrl}
            alt={`Diamond ${diamond.stockNumber}`}
            className={`w-full h-full object-cover transition-transform duration-200 ease-out ${
              isMotionMode ? 'scale-110' : 'group-hover:scale-105'
            }`}
            style={{
              transform: isMotionMode ? getDiamondImageTransform() : '',
              transformStyle: 'preserve-3d'
            }}
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="flex items-center justify-center h-full bg-gradient-to-br from-blue-50 to-purple-50">
            <div className="relative">
              <div 
                className={`w-32 h-32 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center shadow-2xl transition-transform duration-200 ease-out ${
                  isMotionMode ? 'scale-125' : ''
                }`}
                style={{
                  transform: isMotionMode ? getDiamondImageTransform() : '',
                  transformStyle: 'preserve-3d'
                }}
              >
                <Gem className="h-16 w-16 text-white" />
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg">
                <div className="w-3 h-3 bg-white rounded-full"></div>
              </div>
            </div>
          </div>
        )}
        
        {/* Status Badge */}
        <div className="absolute top-3 left-3">
          <Badge 
            className={`${
              diamond.status === "Available" 
                ? "bg-emerald-100 text-emerald-800 border-emerald-300" 
                : "bg-blue-100 text-blue-800 border-blue-300"
            }`}
            variant="outline"
          >
            {diamond.status}
          </Badge>
        </div>

        {/* 3D Badge */}
        {hasGem360 && (
          <div className="absolute bottom-3 left-3">
            <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs px-2 py-1">
              ✨ 3D
            </Badge>
          </div>
        )}
      </div>

      {/* Card Content */}
      <div className="p-4 space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono text-slate-500 bg-slate-100 px-2 py-1 rounded">
            #{diamond.stockNumber}
          </span>
          <span className="text-lg font-bold text-slate-900">
            ${diamond.price.toLocaleString()}
          </span>
        </div>

        {/* Diamond Details */}
        <div className="space-y-2">
          <h3 className="font-semibold text-slate-900 text-lg">
            {diamond.carat} ct {diamond.shape}
          </h3>
          
          <div className="grid grid-cols-3 gap-2 text-sm">
            <div className="text-center">
              <p className="text-slate-500">Color</p>
              <Badge variant="outline" className="text-xs">{diamond.color}</Badge>
            </div>
            <div className="text-center">
              <p className="text-slate-500">Clarity</p>
              <Badge variant="outline" className="text-xs">{diamond.clarity}</Badge>
            </div>
            <div className="text-center">
              <p className="text-slate-500">Cut</p>
              <Badge variant="outline" className="text-xs">{diamond.cut}</Badge>
            </div>
          </div>
        </div>

        {/* Fixed Action Buttons with proper Telegram styling */}
        <div className="flex gap-2">
          <Button 
            onClick={handleViewDetails}
            variant="outline"
            className="flex-1 border-blue-200 text-blue-600 hover:bg-blue-50 min-h-[44px] touch-target bg-white"
          >
            <Eye className="h-4 w-4 mr-2 flex-shrink-0" />
            <span className="text-sm font-medium">View Details</span>
          </Button>
          
          <Button 
            onClick={handleContactOwner}
            className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 min-h-[44px] touch-target"
          >
            <MessageCircle className="h-4 w-4 mr-2 flex-shrink-0" />
            <span className="text-sm font-medium">Contact</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
