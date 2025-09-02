import React from 'react';
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { Navigate } from 'react-router-dom';

interface PublicRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
}

export function PublicRoute({ children, redirectTo = '/dashboard' }: PublicRouteProps) {
  const { isAuthenticated, isLoading } = useTelegramAuth();

  // Don't redirect while still loading
  if (isLoading) {
    return <>{children}</>;
  }

  // If user is authenticated, redirect to protected area
  if (isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  // User is not authenticated - show public content
  return <>{children}</>;
}