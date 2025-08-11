
import { ReactNode, useEffect, useState } from 'react';
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { Shield, AlertTriangle, Settings, Crown, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { getAdminTelegramId } from '@/lib/api/secureConfig';
import { supabase } from '@/integrations/supabase/client';

interface AdminGuardProps {
  children: ReactNode;
}

export function AdminGuard({ children }: AdminGuardProps) {
  const { user, isLoading, isTelegramEnvironment, isAuthenticated } = useTelegramAuth();
  const navigate = useNavigate();
  const [adminTelegramId, setAdminTelegramId] = useState<number | null>(null);
  const [isLoadingAdmin, setIsLoadingAdmin] = useState(true);
  const [supabaseUser, setSupabaseUser] = useState<any>(null);
  const [isCheckingSupabase, setIsCheckingSupabase] = useState(true);

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

  useEffect(() => {
    // Check Supabase authentication
    const checkSupabaseAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setSupabaseUser(session?.user || null);
      } catch (error) {
        console.error('Error checking Supabase auth:', error);
      } finally {
        setIsCheckingSupabase(false);
      }
    };

    checkSupabaseAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSupabaseUser(session?.user || null);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  console.log('🔍 AdminGuard - Current user:', user);
  console.log('🔍 AdminGuard - Supabase user:', supabaseUser);
  console.log('🔍 AdminGuard - User ID:', user?.id);
  console.log('🔍 AdminGuard - Admin ID:', adminTelegramId);
  console.log('🔍 AdminGuard - Is Loading:', isLoading || isLoadingAdmin || isCheckingSupabase);
  console.log('🔍 AdminGuard - Is Authenticated:', isAuthenticated);

  if (isLoading || isLoadingAdmin || isCheckingSupabase) {
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

  // If no Supabase authentication, redirect to admin login
  if (!supabaseUser) {
    console.log('❌ AdminGuard - No Supabase authentication, redirecting to login');
    navigate('/admin-login');
    return null;
  }

  // Check if Supabase user is admin
  const supabaseUserTelegramId = supabaseUser.user_metadata?.telegram_id;
  const isSupabaseAdmin = adminTelegramId && supabaseUserTelegramId === adminTelegramId;

  // If Telegram user exists and is admin, allow access
  const isTelegramAdmin = adminTelegramId && user?.id === adminTelegramId;

  // Allow access if either Supabase auth is admin OR Telegram auth is admin
  const isAdmin = isSupabaseAdmin || isTelegramAdmin;
  
  console.log('🔍 AdminGuard - Is Supabase Admin?', isSupabaseAdmin);
  console.log('🔍 AdminGuard - Is Telegram Admin?', isTelegramAdmin);
  console.log('🔍 AdminGuard - Final Admin Status?', isAdmin);
  
  if (!isAdmin) {
    console.log('❌ AdminGuard - Access denied for user');
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
            <p><strong>Your ID:</strong> {user?.id || supabaseUser?.id || 'Unknown'}</p>
            <p><strong>Environment:</strong> {isTelegramEnvironment ? 'Telegram' : 'Browser'}</p>
            <p><strong>Auth Method:</strong> {supabaseUser ? 'Email/Password' : 'Telegram'}</p>
          </div>
          
          <div className="space-y-3">
            <button
              onClick={() => navigate('/admin-login')}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors w-full"
            >
              Admin Login
            </button>
            <button
              onClick={() => {
                console.log('🔄 Redirecting to dashboard');
                window.location.hash = '#/dashboard';
              }}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-6 rounded-lg transition-colors w-full"
            >
              Return to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  console.log('✅ AdminGuard - Access granted to verified admin user');
  const displayName = user?.first_name || supabaseUser?.email || 'Admin';
  
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
              Admin Dashboard - Welcome, {displayName}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-xs bg-green-100 text-green-800 px-3 py-1 rounded-full">
              Verified: {supabaseUser ? 'Email Auth' : 'Telegram Auth'}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={async () => {
                if (supabaseUser) {
                  await supabase.auth.signOut();
                }
                navigate('/admin-login');
              }}
              className="text-xs"
            >
              Logout
            </Button>
          </div>
        </div>
      </div>
      {children}
    </div>
  );
}
