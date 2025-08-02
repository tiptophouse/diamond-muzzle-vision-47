
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { Loader2 } from 'lucide-react';

export default function HomePage() {
  const { user, isAuthenticated } = useTelegramAuth();

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Authenticating...</span>
      </div>
    );
  }

  // Redirect to dashboard for authenticated users
  return <Navigate to="/dashboard" replace />;
}
