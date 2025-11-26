/**
 * Immersive Diamond Viewer with Motion Controls
 * Full-screen diamond viewing with tilt-to-rotate, pinch-to-zoom
 * Includes offer functionality and contact seller
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { useTelegramSensors } from '@/hooks/useTelegramSensors';
import { useTelegramSDK } from '@/hooks/useTelegramSDK';
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { useTelegramWebApp } from '@/hooks/useTelegramWebApp';
import { useTelegramAdvanced } from '@/hooks/useTelegramAdvanced';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { 
  Hand, 
  RotateCw, 
  ZoomIn, 
  ZoomOut, 
  MessageCircle, 
  DollarSign,
  Info,
  ArrowLeft,
  Smartphone,
  Share2
} from 'lucide-react';
import { Diamond } from '@/components/inventory/InventoryTable';
import { toast } from 'sonner';

interface ImmersiveDiamondViewerProps {
  diamond: Diamond;
  isOwner: boolean;
  onBack: () => void;
}

export function ImmersiveDiamondViewer({ diamond, isOwner, onBack }: ImmersiveDiamondViewerProps) {
  const { 
    orientation, 
    isOrientationStarted, 
    startOrientation, 
    stopOrientation,
    isSensorsAvailable 
  } = useTelegramSensors();
  const { webApp } = useTelegramWebApp();
  const { haptic } = useTelegramSDK();
  const { user } = useTelegramAuth();
  const { shareStory, features } = useTelegramAdvanced();
  
  const [rotation, setRotation] = useState({ x: 0, y: 0, z: 0 });
  const [zoom, setZoom] = useState(1);
  const [showInstructions, setShowInstructions] = useState(true);
  const [showOfferDialog, setShowOfferDialog] = useState(false);
  const [offerPrice, setOfferPrice] = useState('');
  const [offerMessage, setOfferMessage] = useState('');
  const [isSubmittingOffer, setIsSubmittingOffer] = useState(false);
  const [calibration, setCalibration] = useState({ alpha: 0, beta: 0, gamma: 0 });
  
  const imageRef = useRef<HTMLDivElement>(null);
  const touchStartDistance = useRef<number>(0);
  const lastTouchPos = useRef({ x: 0, y: 0 });
  const viewStartTime = useRef(Date.now());
  const animationFrameId = useRef<number | null>(null);

  const hasMotionSupport = isSensorsAvailable && !!webApp?.DeviceOrientation;

  // Track view session
  useEffect(() => {
    const sessionId = crypto.randomUUID();
    const startTime = Date.now();

    // Track initial view
    supabase.from('diamond_views').insert({
      diamond_id: diamond.stockNumber,
      session_id: sessionId,
      viewer_telegram_id: user?.id,
      device_type: /Mobile|Android|iPhone|iPad/.test(navigator.userAgent) ? 'mobile' : 'desktop',
      user_agent: navigator.userAgent,
      referrer: document.referrer
    }).then(({ error }) => {
      if (error) console.error('Failed to track view:', error);
    });

    // Track session duration on unmount
    return () => {
      const duration = Math.floor((Date.now() - startTime) / 1000);
      supabase.from('diamond_views')
        .update({ 
          total_view_time: duration,
          last_interaction: new Date().toISOString()
        })
        .eq('session_id', sessionId)
        .then(({ error }) => {
          if (error) console.error('Failed to update view duration:', error);
        });
    };
  }, [diamond.stockNumber, user?.id]);

  // Update rotation based on device orientation (60 FPS smooth animation)
  useEffect(() => {
    if (!isOrientationStarted) return;

    const updateRotation = () => {
      // Apply calibration offset and map to diamond rotation
      // Beta: -180 to 180 (X-axis tilt, forward/backward)
      // Gamma: -90 to 90 (Y-axis tilt, left/right)
      // Alpha: 0 to 360 (Z-axis rotation)
      
      const rotX = ((orientation.beta - calibration.beta) * 0.5);
      const rotY = ((orientation.gamma - calibration.gamma) * 0.8);
      const rotZ = ((orientation.alpha - calibration.alpha) * 0.1);
      
      setRotation({ 
        x: Math.max(-60, Math.min(60, rotX)), 
        y: Math.max(-60, Math.min(60, rotY)), 
        z: rotZ 
      });

      animationFrameId.current = requestAnimationFrame(updateRotation);
    };

    animationFrameId.current = requestAnimationFrame(updateRotation);

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [isOrientationStarted, orientation, calibration]);

  // Motion control for tilt-to-rotate using Telegram SDK 2.0
  const startMotionControl = useCallback(() => {
    if (!hasMotionSupport) {
      toast.error('Motion sensors not available on this device');
      return;
    }

    haptic?.impact?.('medium');
    setShowInstructions(false);

    try {
      // Calibrate to current position
      setCalibration({
        alpha: orientation.alpha,
        beta: orientation.beta,
        gamma: orientation.gamma
      });

      // Start Telegram SDK 2.0 DeviceOrientation (60Hz refresh rate)
      startOrientation(60);
      
      toast.success('🎯 Motion control enabled - tilt to rotate!');
      console.log('🚀 DeviceOrientation started at 60Hz');
    } catch (error) {
      console.error('Failed to start motion control:', error);
      toast.error('Failed to start motion sensors');
    }
  }, [hasMotionSupport, orientation, startOrientation, haptic]);

  const stopMotionControl = useCallback(() => {
    haptic?.impact?.('light');
    stopOrientation();
    setRotation({ x: 0, y: 0, z: 0 });
    
    if (animationFrameId.current) {
      cancelAnimationFrame(animationFrameId.current);
    }
  }, [stopOrientation, haptic]);

  // Pinch-to-zoom support
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      touchStartDistance.current = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY
      );
    } else if (e.touches.length === 1 && !isOrientationStarted) {
      lastTouchPos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      // Pinch to zoom
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const currentDistance = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY
      );
      
      const scale = currentDistance / touchStartDistance.current;
      setZoom(prev => Math.max(1, Math.min(3, prev * scale)));
      touchStartDistance.current = currentDistance;
      haptic?.selection?.();
    } else if (e.touches.length === 1 && !isOrientationStarted) {
      // Manual rotation with finger
      const deltaX = e.touches[0].clientX - lastTouchPos.current.x;
      const deltaY = e.touches[0].clientY - lastTouchPos.current.y;
      
      setRotation(prev => ({
        x: Math.max(-60, Math.min(60, prev.x + deltaY * 0.3)),
        y: Math.max(-60, Math.min(60, prev.y + deltaX * 0.3)),
        z: prev.z
      }));
      
      lastTouchPos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
  };

  const resetView = () => {
    haptic?.impact?.('medium');
    setRotation({ x: 0, y: 0, z: 0 });
    setZoom(1);
  };

  const handleZoomIn = () => {
    haptic?.selection?.();
    setZoom(prev => Math.min(3, prev + 0.25));
  };

  const handleZoomOut = () => {
    haptic?.selection?.();
    setZoom(prev => Math.max(1, prev - 0.25));
  };

  const handleContactSeller = () => {
    haptic?.impact?.('medium');
    
    const message = `💎 I'm interested in your diamond!

📋 Stock #: ${diamond.stockNumber}
⚖️ Weight: ${diamond.carat}ct
🔸 Shape: ${diamond.shape}
🎨 Color: ${diamond.color}
💎 Clarity: ${diamond.clarity}
💰 Price: $${diamond.price.toLocaleString()}

Can we discuss this further?`;

    // Try to open Telegram chat
    if (window.Telegram?.WebApp) {
      const shareUrl = `https://t.me/share/url?text=${encodeURIComponent(message)}`;
      window.open(shareUrl, '_blank');
    } else {
      // Fallback
      toast.success('Contact message copied to clipboard');
      navigator.clipboard.writeText(message);
    }
  };

  const handleShareToStory = async () => {
    console.log('📱 handleShareToStory called:', {
      hasStorySharing: features.hasStorySharing,
      hasImage: !!diamond.imageUrl,
      imageUrl: diamond.imageUrl
    });

    haptic?.impact?.('medium');

    if (!features.hasStorySharing) {
      console.warn('⚠️ Story sharing not available');
      toast.error('Story sharing not available (requires Telegram 7.2+)');
      return;
    }

    // Use imageUrl or picture as fallback
    const imageUrl = diamond.imageUrl || diamond.picture;
    if (!imageUrl) {
      console.warn('⚠️ No image URL found');
      toast.error('No image available for sharing');
      return;
    }

    if (!imageUrl.startsWith('http')) {
      console.error('❌ Invalid image URL:', imageUrl);
      toast.error('Invalid image URL (must be HTTPS)');
      return;
    }

    try {
      const botUsername = 'BrilliantBot_bot';
      const deepLink = `https://t.me/${botUsername}?startapp=diamond_${diamond.stockNumber}_${user?.id || 'guest'}_story`;
      
      console.log('🚀 Attempting story share:', { imageUrl, deepLink });
      
      const success = await shareStory(imageUrl, {
        text: `💎 ${diamond.carat}ct ${diamond.shape} Diamond - $${diamond.price.toLocaleString()}`,
        widgetLink: {
          url: deepLink,
          name: '💎 View Diamond'
        }
      });

      if (!success) {
        console.error('❌ Story share returned false');
        toast.error('Failed to share to story');
        return;
      }

      console.log('✅ Story shared successfully');

      // Track story share in database
      await supabase.from('diamond_story_shares').insert({
        diamond_stock_number: diamond.stockNumber,
        shared_by_telegram_id: user?.id,
        shared_by_name: `${user?.first_name || ''} ${user?.last_name || ''}`.trim(),
        deep_link: deepLink,
        share_type: 'telegram_story'
      });

      toast.success('🎉 Shared to your story! Watch the engagement roll in!');
    } catch (error) {
      console.error('❌ Story share error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to share to story');
    }
  };

  const handleSubmitOffer = async () => {
    if (!offerPrice || parseFloat(offerPrice) <= 0) {
      toast.error('Please enter a valid offer price');
      return;
    }

    if (!user?.id) {
      toast.error('You must be logged in to make an offer');
      return;
    }

    setIsSubmittingOffer(true);
    
    try {
      // Set session context for RLS
      await supabase.rpc('set_session_context', {
        key: 'app.current_user_id',
        value: user.id.toString()
      });

      const { error } = await supabase.from('diamond_offers').insert({
        diamond_stock_number: diamond.stockNumber,
        diamond_owner_telegram_id: 2138564172, // Default to admin as owner
        buyer_telegram_id: user.id,
        buyer_name: `${user.first_name} ${user.last_name || ''}`.trim(),
        buyer_contact: user.username,
        offered_price: parseFloat(offerPrice),
        message: offerMessage,
        status: 'pending'
      });

      if (error) throw error;

      toast.success('Offer submitted successfully!');
      setShowOfferDialog(false);
      setOfferPrice('');
      setOfferMessage('');

      // Send notification to owner (via Telegram bot)
      // This would be handled by a webhook or edge function
      
    } catch (error) {
      console.error('Failed to submit offer:', error);
      toast.error('Failed to submit offer. Please try again.');
    } finally {
      setIsSubmittingOffer(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 z-50 flex flex-col">
      {/* Header */}
      <div className="flex-shrink-0 bg-slate-900/95 backdrop-blur-sm border-b border-white/10 p-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <Button
            onClick={onBack}
            variant="ghost"
            size="sm"
            className="text-white hover:bg-white/10"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          
          <div className="text-white text-center">
            <p className="font-semibold">{diamond.carat}ct {diamond.shape}</p>
            <p className="text-xs text-slate-400">Stock #{diamond.stockNumber}</p>
          </div>

          <Badge variant={isOrientationStarted ? "default" : "secondary"} className="px-3 py-1.5">
            {isOrientationStarted ? '🎯 Gyro ON' : '📱 Touch'}
          </Badge>
        </div>
      </div>

      {/* Diamond Viewer */}
      <div 
        className="flex-1 relative overflow-hidden"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
      >
        {/* Instructions Overlay */}
        {showInstructions && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-10 flex items-center justify-center p-6">
            <Card className="max-w-md bg-white/95 p-6">
              <div className="text-center space-y-4">
                <Info className="h-12 w-12 mx-auto text-primary" />
                <h3 className="font-semibold text-lg">Interactive Diamond Viewer</h3>
                <ul className="text-sm space-y-2 text-left">
                  <li className="flex items-start gap-2">
                    <Smartphone className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <span><strong>Tilt device:</strong> Rotate diamond naturally</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Hand className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <span><strong>Two fingers:</strong> Pinch to zoom in/out</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Hand className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <span><strong>One finger:</strong> Drag to rotate manually</span>
                  </li>
                </ul>
                <Button 
                  onClick={() => setShowInstructions(false)}
                  className="w-full"
                >
                  Got it!
                </Button>
              </div>
            </Card>
          </div>
        )}

        {/* Diamond Image */}
        <div
          ref={imageRef}
          className="absolute inset-0 flex items-center justify-center"
          style={{
            transform: `
              perspective(1200px)
              rotateX(${rotation.x}deg)
              rotateY(${rotation.y}deg)
              rotateZ(${rotation.z * 0.3}deg)
              scale(${zoom})
            `,
            transformStyle: 'preserve-3d',
            transition: isOrientationStarted ? 'none' : 'transform 0.3s ease-out',
            willChange: isOrientationStarted ? 'transform' : 'auto',
          }}
        >
          <img
            src={diamond.imageUrl}
            alt={`${diamond.carat}ct ${diamond.shape} diamond`}
            className="max-w-[85%] max-h-[85%] object-contain drop-shadow-2xl"
            style={{
              filter: `brightness(${1.1 + Math.abs(rotation.y) * 0.002}) contrast(1.1)`,
            }}
          />
        </div>

        {/* Zoom Level Indicator */}
        <div className="absolute top-4 left-4">
          <Badge variant="secondary" className="bg-black/50 backdrop-blur-sm text-white">
            {Math.round(zoom * 100)}%
          </Badge>
        </div>
      </div>

      {/* Control Panel */}
      <div className="flex-shrink-0 bg-slate-900/95 backdrop-blur-sm border-t border-white/10 p-4">
        <div className="max-w-7xl mx-auto space-y-4">
          {/* Zoom Controls */}
          <div className="flex items-center justify-center gap-4">
            <Button
              onClick={handleZoomOut}
              size="sm"
              variant="outline"
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            
            <Button
              onClick={resetView}
              size="sm"
              variant="outline"
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              <RotateCw className="h-4 w-4 mr-2" />
              Reset
            </Button>

            <Button
              onClick={handleZoomIn}
              size="sm"
              variant="outline"
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
          </div>

          {/* Motion Toggle - Telegram SDK 2.0 DeviceOrientation */}
          {hasMotionSupport && (
            <Button
              onClick={isOrientationStarted ? stopMotionControl : startMotionControl}
              variant={isOrientationStarted ? "destructive" : "default"}
              className="w-full"
              size="lg"
            >
              <Smartphone className={`h-5 w-5 mr-2 ${isOrientationStarted ? 'animate-pulse' : ''}`} />
              {isOrientationStarted ? 'Stop' : 'Start'} Gyroscope Control
            </Button>
          )}
          
          {!hasMotionSupport && (
            <div className="text-center text-sm text-slate-400 py-2">
              <p>⚠️ Device motion sensors not available</p>
              <p className="text-xs">Use touch gestures to rotate</p>
            </div>
          )}

          {/* Action Buttons - Hide if owner */}
          {!isOwner && (
            <div className="space-y-3">
              {/* Primary Actions */}
              <div className="grid grid-cols-2 gap-3">
                <Button
                  onClick={() => setShowOfferDialog(true)}
                  variant="default"
                  size="lg"
                  className="gap-2"
                >
                  <DollarSign className="h-5 w-5" />
                  Make Offer
                </Button>
                
                <Button
                  onClick={handleContactSeller}
                  variant="outline"
                  size="lg"
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20 gap-2"
                >
                  <MessageCircle className="h-5 w-5" />
                  Contact
                </Button>
              </div>

              {/* Story Share Button - Telegram SDK 2.0 Viral Feature */}
              <Button
                onClick={handleShareToStory}
                variant="outline"
                size="lg"
                disabled={!features.hasStorySharing}
                title={!features.hasStorySharing ? "Requires Telegram 7.2+" : "Share to Story"}
                className="w-full bg-gradient-to-r from-pink-500/20 to-purple-500/20 border-pink-500/30 text-white hover:from-pink-500/30 hover:to-purple-500/30 gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Share2 className="h-5 w-5" />
                {features.hasStorySharing ? 'Share to Story (Viral 🚀)' : 'Story (Requires Telegram 7.2+)'}
              </Button>
            </div>
          )}

          {/* Diamond Info */}
          <div className="grid grid-cols-3 gap-2 text-xs text-white text-center">
            <div>
              <p className="text-slate-400">Color</p>
              <p className="font-semibold">{diamond.color}</p>
            </div>
            <div>
              <p className="text-slate-400">Clarity</p>
              <p className="font-semibold">{diamond.clarity}</p>
            </div>
            <div>
              <p className="text-slate-400">Cut</p>
              <p className="font-semibold">{diamond.cut}</p>
            </div>
          </div>

          <div className="text-center">
            <p className="text-2xl font-bold text-white">
              ${diamond.price.toLocaleString()}
            </p>
            {diamond.lab && diamond.certificateNumber && (
              <p className="text-xs text-slate-400 mt-1">
                {diamond.lab} #{diamond.certificateNumber}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Offer Dialog */}
      <Dialog open={showOfferDialog} onOpenChange={setShowOfferDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Make an Offer</DialogTitle>
            <DialogDescription>
              Submit your offer for this {diamond.carat}ct {diamond.shape} diamond
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Your Offer Price (USD)
              </label>
              <Input
                type="number"
                value={offerPrice}
                onChange={(e) => setOfferPrice(e.target.value)}
                placeholder="Enter your offer amount"
                min="0"
                step="100"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Listed price: ${diamond.price.toLocaleString()}
              </p>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                Message (Optional)
              </label>
              <Textarea
                value={offerMessage}
                onChange={(e) => setOfferMessage(e.target.value)}
                placeholder="Add a message to the seller..."
                rows={3}
              />
            </div>

            <div className="flex gap-2">
              <Button
                onClick={() => setShowOfferDialog(false)}
                variant="outline"
                className="flex-1"
                disabled={isSubmittingOffer}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmitOffer}
                className="flex-1"
                disabled={isSubmittingOffer || !offerPrice}
              >
                {isSubmittingOffer ? 'Submitting...' : 'Submit Offer'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
