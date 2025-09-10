import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useProductionTelegramApp } from '@/hooks/useProductionTelegramApp';
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { ProductionBottomNavigation } from './ProductionBottomNavigation';
import { cn } from '@/lib/utils';

interface ProductionTelegramLayoutProps {
  children: React.ReactNode;
}

export function ProductionTelegramLayout({ children }: ProductionTelegramLayoutProps) {
  const { isReady, platform, colorScheme, viewportStableHeight, safeAreaInsets, backButton, haptic } = useProductionTelegramApp();
  const { isAuthenticated } = useTelegramAuth();
  const location = useLocation();
  const navigate = useNavigate();
  
  // Handle back button for detail pages
  useEffect(() => {
    const isDetailPage = location.pathname.includes('/diamond/') || 
                        location.pathname.includes('/secure-diamond/') ||
                        location.pathname.includes('/upload') ||
                        location.pathname === '/profile' ||
                        location.pathname === '/settings';
    
    if (isDetailPage && isAuthenticated) {
      backButton.show(() => {
        haptic.selection();
        navigate(-1);
      });
    } else {
      backButton.hide();
    }
  }, [location.pathname, isAuthenticated, backButton, navigate, haptic]);
  
  // Dynamic CSS properties for Telegram integration
  useEffect(() => {
    const root = document.documentElement;
    
    // Set platform-specific optimizations
    if (platform === 'ios') {
      root.style.setProperty('--webkit-overflow-scrolling', 'touch');
      root.style.setProperty('--overscroll-behavior-y', 'none');
    }
    
    // Set safe area insets
    root.style.setProperty('--safe-area-inset-top', `${safeAreaInsets.top}px`);
    root.style.setProperty('--safe-area-inset-bottom', `${safeAreaInsets.bottom}px`);
    root.style.setProperty('--safe-area-inset-left', `${safeAreaInsets.left}px`);
    root.style.setProperty('--safe-area-inset-right', `${safeAreaInsets.right}px`);
    
    // Set viewport height for proper mobile handling
    root.style.setProperty('--viewport-height', `${viewportStableHeight}px`);
  }, [platform, safeAreaInsets, viewportStableHeight]);
  
  if (!isReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-muted-foreground">Initializing Telegram Mini App...</p>
        </div>
      </div>
    );
  }
  
  // Don't render navigation for unauthenticated users
  if (!isAuthenticated) {
    return (
      <div 
        className="min-h-screen bg-background"
        style={{ 
          minHeight: viewportStableHeight ? `${viewportStableHeight}px` : '100vh',
          paddingTop: `max(${safeAreaInsets.top}px, 0px)`
        }}
      >
        {children}
      </div>
    );
  }
  
  return (
    <div 
      className={cn(
        "min-h-screen bg-background flex flex-col",
        platform === 'ios' && "ios-optimized",
        colorScheme === 'dark' && "dark"
      )}
      style={{ 
        minHeight: viewportStableHeight ? `${viewportStableHeight}px` : '100vh'
      }}
    >
      {/* Status Bar Spacer for iOS */}
      {platform === 'ios' && (
        <div 
          className="bg-background" 
          style={{ height: `${safeAreaInsets.top}px` }}
        />
      )}
      
      {/* Main Content Area */}
      <main 
        className={cn(
          "flex-1 overflow-y-auto",
          platform === 'ios' && "-webkit-overflow-scrolling-touch"
        )}
        style={{ 
          paddingBottom: `${Math.max(safeAreaInsets.bottom + 80, 80)}px` // Navigation height + safe area
        }}
      >
        {children}
      </main>
      
      {/* Production Bottom Navigation */}
      <ProductionBottomNavigation />
    </div>
  );
}