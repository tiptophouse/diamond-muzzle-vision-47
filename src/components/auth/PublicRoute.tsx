import React, { useState, useEffect } from 'react';
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { Navigate } from 'react-router-dom';
import { getAdminTelegramId } from '@/lib/api/secureConfig';

interface PublicRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
}

export function PublicRoute({ children, redirectTo }: PublicRouteProps) {
  const { isAuthenticated, isLoading, user } = useTelegramAuth();
  const [adminTelegramId, setAdminTelegramId] = useState<number | null>(null);
  const [isCheckingAdmin, setIsCheckingAdmin] = useState(true);

  useEffect(() => {
    const loadAdminConfig = async () => {
      try {
        const adminId = await getAdminTelegramId();
        setAdminTelegramId(adminId);
      } catch (error) {
        console.error('Failed to load admin configuration:', error);
        setAdminTelegramId(2138564172); // fallback
      } finally {
        setIsCheckingAdmin(false);
      }
    };

    if (isAuthenticated && user) {
      loadAdminConfig();
    } else {
      setIsCheckingAdmin(false);
    }
  }, [isAuthenticated, user]);

  // Don't redirect while still loading
  if (isLoading || isCheckingAdmin) {
    return <>{children}</>;
  }

  // If user is authenticated, redirect based on admin status
  if (isAuthenticated && user) {
    // Check if user is admin
    const isAdmin = adminTelegramId && user.id === adminTelegramId;
    
    // Use custom redirectTo if provided, otherwise redirect admins to /admin-stats and users to /dashboard
    const targetRoute = redirectTo || (isAdmin ? '/admin-stats' : '/dashboard');
    
    return <Navigate to={targetRoute} replace />;
  }

  // User is not authenticated - show public content
  return <>{children}</>;
}