import React, { useState, useEffect } from 'react';
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { Navigate } from 'react-router-dom';
import { isAdminTelegramId } from '@/lib/secureAdmin';

interface PublicRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
}

export function PublicRoute({ children, redirectTo }: PublicRouteProps) {
  const { isAuthenticated, isLoading, user } = useTelegramAuth();
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isCheckingAdmin, setIsCheckingAdmin] = useState(true);

  useEffect(() => {
    const checkAdmin = async () => {
      if (!user?.id) {
        setIsAdmin(false);
        setIsCheckingAdmin(false);
        return;
      }

      try {
        const adminStatus = await isAdminTelegramId(user.id);
        setIsAdmin(adminStatus);
      } catch (error) {
        console.error('Failed to check admin status:', error);
        setIsAdmin(false);
      } finally {
        setIsCheckingAdmin(false);
      }
    };

    if (isAuthenticated && user) {
      checkAdmin();
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
    // Use custom redirectTo if provided, otherwise redirect admins to /admin and users to /dashboard
    const targetRoute = redirectTo || (isAdmin ? '/admin' : '/dashboard');
    
    return <Navigate to={targetRoute} replace />;
  }

  // User is not authenticated - show public content
  return <>{children}</>;
}