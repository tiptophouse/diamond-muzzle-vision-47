
import { ReactNode, useEffect, useState } from 'react';
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { Shield, AlertTriangle, Settings, Crown, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { getAdminTelegramId } from '@/lib/api/secureConfig';

interface AdminGuardProps {
  children: ReactNode;
}

export function AdminGuard({ children }: AdminGuardProps) {
  const { user, isLoading, isTelegramEnvironment, isAuthenticated } = useTelegramAuth();
  const navigate = useNavigate();
  const [adminTelegramId, setAdminTelegramId] = useState<number | null>(null);
  const [isLoadingAdmin, setIsLoadingAdmin] = useState(true);

  useEffect(() => {
    const loadAdminConfig = async () => {
      try {
        const adminId = await getAdminTelegramId();
        setAdminTelegramId(adminId);
      } catch (error) {
        console.error('❌ Failed to load admin configuration:', error);
        setAdminTelegramId(2138564172); // fallback
      } finally {
        setIsLoadingAdmin(false);
      }
    };

    loadAdminConfig();
  }, []);

  console.log('🔍 AdminGuard - Current user:', user);
  console.log('🔍 AdminGuard - User ID:', user?.id);
  console.log('🔍 AdminGuard - Admin ID:', adminTelegramId);
  console.log('🔍 AdminGuard - Is Loading:', isLoading || isLoadingAdmin);
  console.log('🔍 AdminGuard - Is Authenticated:', isAuthenticated);

  if (isLoading || isLoadingAdmin) {
    console.log('⏳ AdminGuard - Still loading...');
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-xl shadow-lg max-w-md mx-4 border">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto mb-6"></div>
            <Settings className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-6 w-6 text-blue-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Verifying Admin Access</h3>
          <p className="text-gray-600 text-sm">Checking administrator permissions...</p>
        </div>
      </div>
    );
  }

  // Check if user is authenticated first
  if (!isAuthenticated || !user) {
    console.log('❌ AdminGuard - User not authenticated');
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-xl shadow-lg max-w-md mx-4 border">
          <div className="bg-red-50 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="h-10 w-10 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Authentication Required</h2>
          <p className="text-gray-600 mb-6">
            You must be logged in to access the admin panel.
          </p>
          <button
            onClick={() => window.location.hash = '#/dashboard'}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors w-full"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Enhanced admin verification using secure configuration
  const isAdmin = adminTelegramId && user.id === adminTelegramId;
  
  console.log('🔍 AdminGuard - Is Admin?', isAdmin);
  
  if (!isAdmin) {
    console.log('❌ AdminGuard - Access denied for user:', user.id);
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-xl shadow-lg max-w-md mx-4 border">
          <div className="bg-red-50 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="h-10 w-10 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Restricted</h2>
          <p className="text-gray-600 mb-6">
            This area is restricted to authorized administrators only.
          </p>
          <div className="text-sm text-gray-500 mb-8 bg-gray-50 p-4 rounded">
            <p><strong>Your ID:</strong> {user.id}</p>
            <p><strong>Required Admin ID:</strong> {adminTelegramId}</p>
            <p><strong>Environment:</strong> {isTelegramEnvironment ? 'Telegram' : 'Browser'}</p>
          </div>
          
          <button
            onClick={() => {
              console.log('🔄 Redirecting to dashboard');
              window.location.hash = '#/dashboard';
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors w-full"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  console.log('✅ AdminGuard - Access granted to verified admin user');
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="bg-white border-b sticky top-0 z-50 shadow-sm">
        <div className="flex items-center justify-between gap-3 p-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/dashboard')}
              className="h-8 w-8 text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            >
              <Home className="h-4 w-4" />
            </Button>
            <Crown className="h-5 w-5 text-yellow-600" />
            <span className="font-semibold text-gray-900">
              Admin Dashboard - Welcome, {user.first_name}
            </span>
          </div>
          <div className="text-xs bg-green-100 text-green-800 px-3 py-1 rounded-full">
            Verified ID: {user.id}
          </div>
        </div>
      </div>
      {children}
    </div>
  );
}
