
import { useState, useEffect, useRef } from "react";
import { MessageCircle, Gem, Eye, Calibrate, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Diamond } from "@/components/inventory/InventoryTable";
import { useTelegramAuth } from "@/context/TelegramAuthContext";
import { useEnhancedTelegramMotion } from "@/hooks/useEnhancedTelegramMotion";
import { useTelegramHapticFeedback } from "@/hooks/useTelegramHapticFeedback";
import { useCachedImage } from "@/hooks/useCachedImage";
import { Gem360Viewer } from "./Gem360Viewer";

interface EnhancedMotionDiamondCardProps {
  diamond: Diamond;
  index: number;
  onViewDetails?: (diamond: Diamond) => void;
}

export function EnhancedMotionDiamondCard({ diamond, index, onViewDetails }: EnhancedMotionDiamondCardProps) {
  const [isMotionMode, setIsMotionMode] = useState(false);
  const [showCalibration, setShowCalibration] = useState(false);
  const [motionConfig, setMotionConfig] = useState({
    refreshRate: 60,
    sensitivity: 1.0,
    smoothing: true,
    deadzone: 0.05
  });

  const { user } = useTelegramAuth();
  const { 
    motionData, 
    isSupported, 
    isActive, 
    startMotionTracking, 
    stopMotionTracking, 
    calibrateMotion,
    resetCalibration 
  } = useEnhancedTelegramMotion(isMotionMode, motionConfig);
  
  const { impactOccurred, selectionChanged, notificationOccurred } = useTelegramHapticFeedback();
  const { imageUrl, isLoading: imageLoading, cacheHit } = useCachedImage(
    diamond.imageUrl || '', 
    diamond.stockNumber
  );
  
  const cardRef = useRef<HTMLDivElement>(null);

  // Calculate enhanced diamond transform based on motion fusion
  const getDiamondTransform = () => {
    if (!isMotionMode || !isActive) return '';
    
    const { orientation, acceleration, motionState } = motionData;
    
    // Use both orientation and acceleration for more responsive control
    const baseRotateX = Math.max(-15, Math.min(15, orientation.beta * 0.3));
    const baseRotateY = Math.max(-15, Math.min(15, orientation.gamma * 0.3));
    
    // Add micro-movements from acceleration for fine control
    const accelInfluence = 2;
    const microRotateX = acceleration.y * accelInfluence;
    const microRotateY = acceleration.x * accelInfluence;
    
    const finalRotateX = baseRotateX + microRotateX;
    const finalRotateY = baseRotateY + microRotateY;
    
    // Add subtle scale based on motion intensity
    const scaleMultiplier = motionState.intensity === 'still' ? 1.0 : 
                           motionState.intensity === 'gentle' ? 1.02 :
                           motionState.intensity === 'moderate' ? 1.05 : 1.08;
    
    return `rotateX(${finalRotateX}deg) rotateY(${finalRotateY}deg) scale(${scaleMultiplier})`;
  };

  // Enhanced motion toggle with calibration
  const toggleMotionMode = async () => {
    if (!isSupported.accelerometer) {
      impactOccurred('heavy');
      notificationOccurred('error');
      return;
    }

    if (!isMotionMode) {
      // Starting motion mode
      impactOccurred('medium');
      const started = startMotionTracking();
      if (started) {
        setIsMotionMode(true);
        notificationOccurred('success');
        
        // Auto-calibrate after 1 second
        setTimeout(async () => {
          const calibrated = await calibrateMotion(30);
          if (calibrated) {
            impactOccurred('light');
          }
        }, 1000);
      }
    } else {
      // Stopping motion mode
      impactOccurred('light');
      stopMotionTracking();
      setIsMotionMode(false);
    }
    selectionChanged();
  };

  // Manual calibration
  const handleCalibration = async () => {
    setShowCalibration(true);
    impactOccurred('medium');
    
    const success = await calibrateMotion(50);
    
    setShowCalibration(false);
    if (success) {
      notificationOccurred('success');
      impactOccurred('light');
    } else {
      notificationOccurred('error');
      impactOccurred('heavy');
    }
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

  // Motion quality indicator
  const getQualityColor = () => {
    const { reliability } = motionData.quality;
    if (reliability > 0.8) return 'bg-green-500';
    if (reliability > 0.6) return 'bg-yellow-500';
    if (reliability > 0.4) return 'bg-orange-500';
    return 'bg-red-500';
  };

  return (
    <div 
      ref={cardRef}
      className={`bg-white rounded-xl shadow-sm border border-slate-200 hover:shadow-lg transition-all duration-300 group animate-fade-in ${
        isMotionMode ? 'motion-card ring-2 ring-blue-500/20' : 'hover:-translate-y-1'
      }`}
      style={{ 
        animationDelay: `${index * 100}ms`
      }}
    >
      {/* Image Container */}
      <div className="relative h-48 bg-gradient-to-br from-slate-50 to-slate-100 rounded-t-xl overflow-hidden">
        {hasGem360 ? (
          <div className="w-full h-full">
            <Gem360Viewer 
              gem360Url={diamond.gem360Url!}
              stockNumber={diamond.stockNumber}
              isInline={true}
            />
          </div>
        ) : imageUrl ? (
          <img
            src={imageUrl}
            alt={`Diamond ${diamond.stockNumber}`}
            className={`w-full h-full object-cover transition-all duration-200 ease-out ${
              isMotionMode ? 'scale-105' : 'group-hover:scale-105'
            } ${imageLoading ? 'opacity-50' : 'opacity-100'}`}
            style={{
              transform: isMotionMode ? getDiamondTransform() : '',
              transformStyle: 'preserve-3d',
              transformOrigin: 'center center'
            }}
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="relative">
              <div 
                className={`w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center shadow-lg transition-all duration-200 ease-out ${
                  isMotionMode ? 'scale-110' : ''
                }`}
                style={{
                  transform: isMotionMode ? getDiamondTransform() : '',
                  transformStyle: 'preserve-3d'
                }}
              >
                <Gem className="h-8 w-8 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full"></div>
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

        {/* Cache Hit Indicator */}
        {cacheHit && (
          <div className="absolute top-3 left-20">
            <Badge className="bg-green-100 text-green-800 text-xs px-1 py-0.5">
              ⚡ Cached
            </Badge>
          </div>
        )}

        {/* Enhanced Motion Controls */}
        {isSupported.accelerometer && (
          <div className="absolute top-3 right-3 flex gap-1">
            {/* Motion Quality Indicator */}
            {isActive && (
              <div className={`w-2 h-2 rounded-full ${getQualityColor()} animate-pulse`} />
            )}
            
            {/* Calibration Button */}
            {isMotionMode && (
              <Button
                size="sm"
                variant="outline"
                onClick={handleCalibration}
                disabled={showCalibration}
                className="w-8 h-8 p-0 rounded-full bg-white/80 backdrop-blur-sm border-white/50 text-slate-600 hover:bg-white"
              >
                {showCalibration ? (
                  <div className="w-3 h-3 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Calibrate className="h-3 w-3" />
                )}
              </Button>
            )}
            
            {/* Main Motion Toggle */}
            <Button
              size="sm"
              variant={isMotionMode ? "default" : "outline"}
              onClick={toggleMotionMode}
              className={`w-8 h-8 p-0 rounded-full transition-all duration-300 ${
                isMotionMode 
                  ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg' 
                  : 'bg-white/80 backdrop-blur-sm border-white/50 text-slate-600 hover:bg-white'
              }`}
            >
              <Gem className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* 3D Badge */}
        {hasGem360 && (
          <div className="absolute bottom-3 left-3">
            <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs px-2 py-1">
              ✨ 3D
            </Badge>
          </div>
        )}

        {/* Motion Info Display */}
        {isMotionMode && isActive && (
          <div className="absolute bottom-3 right-3 bg-black/70 text-white text-xs px-2 py-1 rounded backdrop-blur-sm">
            {motionData.motionState.intensity} • {motionData.quality.reliability.toFixed(1)}
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

        {/* Enhanced Action Buttons */}
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
