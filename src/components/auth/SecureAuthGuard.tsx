
import { useState, useEffect } from 'react';
import { SimpleLogin } from './SimpleLogin';

interface SecureAuthGuardProps {
  children: React.ReactNode;
}

export function SecureAuthGuard({ children }: SecureAuthGuardProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is already authenticated
    const authToken = sessionStorage.getItem('brilliant_bot_admin_auth');
    const authTimestamp = sessionStorage.getItem('brilliant_bot_auth_timestamp');
    
    if (authToken && authTimestamp) {
      const now = Date.now();
      const authTime = parseInt(authTimestamp);
      const maxSessionTime = 24 * 60 * 60 * 1000; // 24 hours
      
      if (now - authTime < maxSessionTime) {
        console.log('✅ Valid admin session found');
        setIsAuthenticated(true);
      } else {
        console.log('⚠️ Admin session expired');
        sessionStorage.removeItem('brilliant_bot_admin_auth');
        sessionStorage.removeItem('brilliant_bot_auth_timestamp');
      }
    }
    
    setIsLoading(false);
  }, []);

  const handleLogin = () => {
    console.log('✅ Admin authenticated successfully');
    sessionStorage.setItem('brilliant_bot_admin_auth', 'true');
    sessionStorage.setItem('brilliant_bot_auth_timestamp', Date.now().toString());
    setIsAuthenticated(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <SimpleLogin onLogin={handleLogin} />;
  }

  return <>{children}</>;
}
