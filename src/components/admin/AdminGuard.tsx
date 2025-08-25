
import React from 'react';
import { useTelegramAuth } from '@/hooks/useTelegramAuth';
import { getAdminTelegramId } from '@/lib/api/secureConfig';
import { Loader2, Shield } from 'lucide-react';

interface AdminGuardProps {
  children: React.ReactNode;
}

export function AdminGuard({ children }: AdminGuardProps) {
  const { user, isAuthenticated, isLoading } = useTelegramAuth();
  const [isAdmin, setIsAdmin] = React.useState<boolean | null>(null);

  React.useEffect(() => {
    const checkAdminStatus = async () => {
      if (user?.id) {
        const adminId = await getAdminTelegramId();
        setIsAdmin(user.id === adminId);
      } else {
        setIsAdmin(false);
      }
    };

    if (isAuthenticated && user) {
      checkAdminStatus();
    }
  }, [user, isAuthenticated]);

  if (isLoading || isAdmin === null) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Checking admin access...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Shield className="h-12 w-12 mx-auto text-destructive" />
          <h2 className="text-xl font-semibold">Access Denied</h2>
          <p className="text-muted-foreground">Admin access required</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
