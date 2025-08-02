import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useTelegramHapticFeedback } from '@/hooks/useTelegramHapticFeedback';

interface AccelerometerData {
  x: number;
  y: number;
  z: number;
}

interface Custom360ImageViewerProps {
  imageFrames: string[];
  stockNumber: string;
  accelerometerData?: AccelerometerData;
  className?: string;
}

export function Custom360ImageViewer({
  imageFrames,
  stockNumber,
  accelerometerData,
  className = ''
}: Custom360ImageViewerProps) {
  const [currentFrame, setCurrentFrame] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [loadedImages, setLoadedImages] = useState<HTMLImageElement[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [lastMouseX, setLastMouseX] = useState(0);
  const [lastTouchX, setLastTouchX] = useState(0);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const lastTiltX = useRef(0);
  const { impactOccurred } = useTelegramHapticFeedback();

  // Preload all images
  useEffect(() => {
    const loadImages = async () => {
      setIsLoading(true);
      const images: HTMLImageElement[] = [];
      
      for (let i = 0; i < imageFrames.length; i++) {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
          img.src = imageFrames[i];
        }).catch(() => {
          console.warn(`Failed to load image frame ${i}: ${imageFrames[i]}`);
        });
        
        images.push(img);
      }
      
      setLoadedImages(images);
      setIsLoading(false);
    };

    if (imageFrames.length > 0) {
      loadImages();
    }
  }, [imageFrames]);

  // Handle accelerometer tilt rotation
  useEffect(() => {
    if (accelerometerData && loadedImages.length > 0) {
      const tiltX = accelerometerData.x;
      const sensitivity = 2; // Adjust sensitivity
      const deadzone = 2; // Ignore small movements
      
      if (Math.abs(tiltX - lastTiltX.current) > deadzone) {
        // Map tilt (-90 to 90) to frame index (0 to frameCount-1)
        const normalizedTilt = Math.max(-45, Math.min(45, tiltX)); // Limit to ±45°
        const frameIndex = Math.round(((normalizedTilt + 45) / 90) * (loadedImages.length - 1));
        const clampedFrame = Math.max(0, Math.min(loadedImages.length - 1, frameIndex));
        
        if (clampedFrame !== currentFrame) {
          setCurrentFrame(clampedFrame);
          // Haptic feedback every 5 frames for smooth feel
          if (Math.abs(clampedFrame - currentFrame) >= 5) {
            impactOccurred('light');
          }
        }
        
        lastTiltX.current = tiltX;
      }
    }
  }, [accelerometerData, loadedImages.length, currentFrame, impactOccurred]);

  // Draw current frame to canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !loadedImages[currentFrame]) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = loadedImages[currentFrame];
    
    // Set canvas size to match container
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
    
    // Calculate aspect ratio and draw centered
    const imgAspect = img.width / img.height;
    const canvasAspect = canvas.width / canvas.height;
    
    let drawWidth, drawHeight, drawX, drawY;
    
    if (imgAspect > canvasAspect) {
      drawWidth = canvas.width;
      drawHeight = canvas.width / imgAspect;
      drawX = 0;
      drawY = (canvas.height - drawHeight) / 2;
    } else {
      drawWidth = canvas.height * imgAspect;
      drawHeight = canvas.height;
      drawX = (canvas.width - drawWidth) / 2;
      drawY = 0;
    }
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
  }, [currentFrame, loadedImages]);

  // Mouse drag handlers
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    setIsDragging(true);
    setLastMouseX(e.clientX);
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging || loadedImages.length === 0) return;
    
    const deltaX = e.clientX - lastMouseX;
    const sensitivity = 3;
    
    if (Math.abs(deltaX) > sensitivity) {
      const direction = deltaX > 0 ? 1 : -1;
      const newFrame = (currentFrame + direction + loadedImages.length) % loadedImages.length;
      setCurrentFrame(newFrame);
      setLastMouseX(e.clientX);
      impactOccurred('light');
    }
  }, [isDragging, lastMouseX, currentFrame, loadedImages.length, impactOccurred]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Touch handlers for mobile
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (accelerometerData) return; // Prefer tilt when available
    
    setIsDragging(true);
    setLastTouchX(e.touches[0].clientX);
  }, [accelerometerData]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDragging || loadedImages.length === 0 || accelerometerData) return;
    
    const deltaX = e.touches[0].clientX - lastTouchX;
    const sensitivity = 3;
    
    if (Math.abs(deltaX) > sensitivity) {
      const direction = deltaX > 0 ? 1 : -1;
      const newFrame = (currentFrame + direction + loadedImages.length) % loadedImages.length;
      setCurrentFrame(newFrame);
      setLastTouchX(e.touches[0].clientX);
      impactOccurred('light');
    }
  }, [isDragging, lastTouchX, currentFrame, loadedImages.length, accelerometerData, impactOccurred]);

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center bg-muted/10 rounded-lg ${className}`}>
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2"></div>
          <p className="text-sm text-muted-foreground">Loading 360° view...</p>
        </div>
      </div>
    );
  }

  if (loadedImages.length === 0) {
    return (
      <div className={`flex items-center justify-center bg-muted/10 rounded-lg ${className}`}>
        <p className="text-sm text-muted-foreground">360° images not available</p>
      </div>
    );
  }

  return (
    <div className={`relative bg-background rounded-lg overflow-hidden ${className}`}>
      <canvas
        ref={canvasRef}
        className="w-full h-full cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      />
      
      {/* Frame indicator */}
      <div className="absolute top-2 left-2 bg-background/90 text-foreground px-2 py-1 rounded text-xs">
        Frame {currentFrame + 1}/{loadedImages.length}
      </div>
      
      {/* Rotation hint */}
      {!accelerometerData && (
        <div className="absolute bottom-2 left-2 right-2 text-center">
          <div className="bg-background/90 text-foreground px-2 py-1 rounded text-xs">
            ↔️ Drag to rotate
          </div>
        </div>
      )}
    </div>
  );
}