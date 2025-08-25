
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { UnifiedLayout } from '@/components/layout/UnifiedLayout';
import { useUnifiedTelegramNavigation } from '@/hooks/useUnifiedTelegramNavigation';

export default function Index() {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading } = useTelegramAuth();
  const { isReady } = useUnifiedTelegramNavigation();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      // Redirect authenticated users to dashboard
      navigate('/dashboard', { replace: true });
    } else if (!isLoading && !isAuthenticated) {
      // Show welcome/login page for unauthenticated users
      // For now, redirect to dashboard as well (authentication is handled there)
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate]);

  if (isLoading || !isReady) {
    return (
      <UnifiedLayout showBottomNav={false}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </UnifiedLayout>
    );
  }

  return (
    <UnifiedLayout showBottomNav={false}>
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold">BrilliantBot</h1>
          <p className="text-muted-foreground">Loading your diamond marketplace...</p>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        </div>
      </div>
    </UnifiedLayout>
  );
}
