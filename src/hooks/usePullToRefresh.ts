import { useState, useEffect, useRef, useCallback } from 'react';
import { useTelegramHapticFeedback } from './useTelegramHapticFeedback';

interface UsePullToRefreshProps {
  onRefresh: () => Promise<void>;
  threshold?: number;
  resistance?: number;
}

export function usePullToRefresh({
  onRefresh,
  threshold = 80,
  resistance = 2.5,
}: UsePullToRefreshProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const startY = useRef(0);
  const isDragging = useRef(false);
  const isRefreshingRef = useRef(false); // Guard against multiple refreshes
  const { impactOccurred, notificationOccurred } = useTelegramHapticFeedback();

  const handleTouchStart = useCallback((e: TouchEvent) => {
    // Only start if we're at the top of the page
    if (window.scrollY === 0) {
      startY.current = e.touches[0].clientY;
      isDragging.current = true;
    }
  }, []);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!isDragging.current || isRefreshingRef.current) return;

    const currentY = e.touches[0].clientY;
    const diff = currentY - startY.current;

    if (diff > 0 && window.scrollY === 0) {
      // Prevent default scrolling
      e.preventDefault();
      
      // Apply resistance
      const distance = Math.min(diff / resistance, threshold * 1.5);
      setPullDistance(distance);

      // Haptic feedback at threshold
      if (distance >= threshold && pullDistance < threshold) {
        impactOccurred('medium');
      }
    }
  }, [threshold, resistance, pullDistance, impactOccurred]);

  const handleTouchEnd = useCallback(async () => {
    if (!isDragging.current || isRefreshingRef.current) return;
    
    isDragging.current = false;

    if (pullDistance >= threshold) {
      isRefreshingRef.current = true;
      setIsRefreshing(true);
      impactOccurred('heavy');
      
      try {
        await onRefresh();
        notificationOccurred('success');
      } catch (error) {
        console.error('Refresh failed:', error);
        notificationOccurred('error');
      } finally {
        setIsRefreshing(false);
        isRefreshingRef.current = false;
        setPullDistance(0);
      }
    } else {
      // Reset pull distance with animation
      setPullDistance(0);
    }
  }, [pullDistance, threshold, onRefresh, impactOccurred, notificationOccurred]);

  useEffect(() => {
    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd);

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  return {
    isRefreshing,
    pullDistance,
    isPulling: pullDistance > 0,
    isThresholdReached: pullDistance >= threshold,
  };
}
