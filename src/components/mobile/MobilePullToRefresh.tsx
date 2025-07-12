import React, { useState, useRef, useCallback } from 'react';
import { RefreshCw } from 'lucide-react';

interface MobilePullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: React.ReactNode;
  enabled?: boolean;
}

export function MobilePullToRefresh({ onRefresh, children, enabled = true }: MobilePullToRefreshProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [startY, setStartY] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const REFRESH_THRESHOLD = 80;
  const MAX_PULL_DISTANCE = 120;

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (!enabled || isRefreshing) return;
    
    const container = containerRef.current;
    if (!container || container.scrollTop > 0) return;
    
    setStartY(e.touches[0].clientY);
  }, [enabled, isRefreshing]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!enabled || isRefreshing || startY === 0) return;
    
    const container = containerRef.current;
    if (!container || container.scrollTop > 0) return;
    
    const currentY = e.touches[0].clientY;
    const deltaY = currentY - startY;
    
    if (deltaY > 0) {
      e.preventDefault();
      const newPullDistance = Math.min(deltaY * 0.5, MAX_PULL_DISTANCE);
      setPullDistance(newPullDistance);
    }
  }, [enabled, isRefreshing, startY]);

  const handleTouchEnd = useCallback(async () => {
    if (!enabled || isRefreshing || pullDistance < REFRESH_THRESHOLD) {
      setPullDistance(0);
      setStartY(0);
      return;
    }

    setIsRefreshing(true);
    
    try {
      // Add haptic feedback if available
      if ((window as any).Telegram?.WebApp?.HapticFeedback) {
        (window as any).Telegram.WebApp.HapticFeedback.notificationOccurred('success');
      }
      
      await onRefresh();
    } catch (error) {
      console.error('Refresh failed:', error);
      
      // Error haptic feedback
      if ((window as any).Telegram?.WebApp?.HapticFeedback) {
        (window as any).Telegram.WebApp.HapticFeedback.notificationOccurred('error');
      }
    } finally {
      setIsRefreshing(false);
      setPullDistance(0);
      setStartY(0);
    }
  }, [enabled, isRefreshing, pullDistance, onRefresh]);

  const refreshProgress = Math.min(pullDistance / REFRESH_THRESHOLD, 1);
  const shouldTriggerRefresh = pullDistance >= REFRESH_THRESHOLD;

  return (
    <div 
      ref={containerRef}
      className="relative overflow-auto h-full"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Pull to refresh indicator */}
      {(pullDistance > 0 || isRefreshing) && (
        <div 
          className="absolute top-0 left-0 right-0 z-50 flex items-center justify-center"
          style={{
            height: isRefreshing ? '60px' : `${Math.max(pullDistance, 0)}px`,
            background: 'linear-gradient(to bottom, rgba(139, 92, 246, 0.1), transparent)',
          }}
        >
          <div className="flex flex-col items-center gap-2 text-primary">
            <RefreshCw 
              className={`w-6 h-6 transition-all duration-200 ${
                isRefreshing ? 'animate-spin' : shouldTriggerRefresh ? 'scale-110' : ''
              }`}
              style={{
                opacity: Math.max(refreshProgress, 0.3),
                transform: `rotate(${pullDistance * 2}deg)`,
              }}
            />
            {pullDistance > 20 && (
              <span className="text-xs font-medium">
                {isRefreshing 
                  ? 'Refreshing...' 
                  : shouldTriggerRefresh 
                    ? 'Release to refresh' 
                    : 'Pull to refresh'
                }
              </span>
            )}
          </div>
        </div>
      )}
      
      {/* Content */}
      <div 
        style={{
          transform: `translateY(${isRefreshing ? 60 : pullDistance}px)`,
          transition: isRefreshing || pullDistance === 0 ? 'transform 0.2s ease-out' : 'none',
        }}
      >
        {children}
      </div>
    </div>
  );
}