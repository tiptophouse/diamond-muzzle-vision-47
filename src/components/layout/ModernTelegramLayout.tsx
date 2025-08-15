
import React, { useEffect } from 'react';
import { useModernTelegramSDK } from '@/hooks/useModernTelegramSDK';

interface ModernTelegramLayoutProps {
  children: React.ReactNode;
}

export function ModernTelegramLayout({ children }: ModernTelegramLayoutProps) {
  const { 
    isInitialized, 
    webApp, 
    user, 
    expand, 
    error 
  } = useModernTelegramSDK();

  useEffect(() => {
    if (isInitialized && webApp) {
      // Expand the web app to full height
      expand();
      
      // Mark the app as ready
      if (webApp.ready) {
        webApp.ready();
      }
      
      console.log('🚀 Telegram Web App ready with user:', user);
    }
  }, [isInitialized, webApp, user, expand]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50">
        <div className="text-center p-6">
          <h2 className="text-xl font-semibold text-red-700 mb-2">
            שגיאה בטעינת Telegram
          </h2>
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">טוען Telegram SDK...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {children}
    </div>
  );
}
