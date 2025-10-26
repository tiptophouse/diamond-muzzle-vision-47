import { useEffect, useState, useRef } from 'react';
import { Navigate } from 'react-router-dom';
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { useUserTracking } from '@/hooks/useUserTracking';
import { getFirstAdminTelegramId } from '@/lib/secureAdmin';
import { Plus, Gem, Store, PieChart, BarChart3, TrendingUp, Users, Search, MessageSquare } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AuthDiagnostics } from "@/components/debug/AuthDiagnostics";
import { SubscriptionPaywall } from '@/components/subscription/SubscriptionPaywall';

interface NavigationCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  href: string;
  className?: string;
}

function NavigationCard({ icon, title, description, href, className = "" }: NavigationCardProps) {
  return (
    <Card className={`hover:shadow-lg transition-all duration-200 hover:scale-105 ${className}`}>
      <CardContent className="p-6">
        <a href={href} className="block">
          <div className="flex items-center gap-4">
            <div className="flex-shrink-0">
              {icon}
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg mb-1">{title}</h3>
              <p className="text-sm opacity-90">{description}</p>
            </div>
          </div>
        </a>
      </CardContent>
    </Card>
  );
}

const Index = () => {
  const {
    user,
    isAuthenticated,
    isLoading,
    hasSubscription
  } = useTelegramAuth();
  const {
    trackPageVisit
  } = useUserTracking();
  const [debugInfo, setDebugInfo] = useState<string[]>([]);
  const [adminTelegramId, setAdminTelegramId] = useState<number | null>(null);
  const [loadingConfig, setLoadingConfig] = useState(true);
  const redirectHandledRef = useRef(false);
  
  useEffect(() => {
    const loadAdminId = async () => {
      try {
        const adminId = await getFirstAdminTelegramId();
        setAdminTelegramId(adminId);
      } catch (error) {
        console.error('Failed to load admin ID:', error);
        setAdminTelegramId(null); // No hardcoded fallback
      } finally {
        setLoadingConfig(false);
      }
    };
    loadAdminId();
  }, []);
  
  useEffect(() => {
    // Add debug info for troubleshooting
    const info = [
      `Loading: ${isLoading}`, 
      `Config Loading: ${loadingConfig}`, 
      `Authenticated: ${isAuthenticated}`, 
      `User ID: ${user?.id || 'none'}`, 
      `User Name: ${user?.first_name || 'none'}`, 
      `Admin ID: ${adminTelegramId || 'loading...'}`, 
      `Telegram Env: ${!!window.Telegram?.WebApp}`, 
      `URL: ${window.location.href}`, 
      `Redirect Handled: ${redirectHandledRef.current}`
    ];
    setDebugInfo(info);
    console.log('🔍 Index Debug Info:', info);
  }, [user, isAuthenticated, isLoading, adminTelegramId, loadingConfig]);
  
  useEffect(() => {
    if (!isLoading && !loadingConfig && !redirectHandledRef.current) {
      trackPageVisit('/', 'BrilliantBot - Home');
    }
  }, [trackPageVisit, isLoading, loadingConfig]);

  // Show loading state while auth is initializing
  if (isLoading || loadingConfig) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-background">
        <div className="text-center space-y-6 w-full max-w-xs">
          <div className="relative mx-auto w-16 h-16">
            <div className="absolute inset-0 rounded-full border-2 border-border animate-pulse"></div>
            <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-primary animate-spin"></div>
            <div className="absolute inset-3 rounded-full bg-primary/10 flex items-center justify-center">
              <Gem className="w-6 h-6 text-primary" />
            </div>
          </div>
          
          <div className="space-y-4">
            <h1 className="text-2xl font-bold text-foreground tracking-tight">
              BrilliantBot
            </h1>
            
            <p className="text-sm text-muted-foreground leading-relaxed">
              {loadingConfig ? 'Loading...' : 'AI-powered diamond trading'}
            </p>
            
            <div className="flex items-center justify-center gap-1">
              <div className="w-1 h-1 rounded-full bg-primary animate-pulse"></div>
              <div className="w-1 h-1 rounded-full bg-primary/60 animate-pulse" style={{animationDelay: '0.2s'}}></div>
              <div className="w-1 h-1 rounded-full bg-primary/30 animate-pulse" style={{animationDelay: '0.4s'}}></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Prevent multiple redirects
  if (redirectHandledRef.current) {
    return null;
  }

  // Check subscription status for non-admin users
  const isAdmin = isAuthenticated && user?.id === adminTelegramId;
  if (isAuthenticated && !isAdmin && !hasSubscription) {
    console.log('⚠️ User has no subscription - showing paywall');
    return <SubscriptionPaywall />;
  }

  // If user is admin, show admin navigation
  if (isAdmin) {
    console.log('✅ Admin user detected - showing admin navigation');
    redirectHandledRef.current = true;
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-primary text-primary-foreground flex items-center justify-center">
                <Gem className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground">BrilliantBot Admin</h1>
                <p className="text-muted-foreground">Welcome back, {user.first_name}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <NavigationCard
              icon={<Users className="h-8 w-8" />}
              title="Admin Dashboard"
              description="User management & analytics"
              href="/admin"
              className="bg-gradient-to-r from-red-500 to-orange-500 text-white hover:from-red-600 hover:to-orange-600"
            />

            <NavigationCard
              icon={<BarChart3 className="h-8 w-8" />}
              title="Analytics"
              description="Detailed system analytics"
              href="/admin/analytics"
              className="bg-gradient-to-r from-green-500 to-teal-500 text-white hover:from-green-600 hover:to-teal-600"
            />

            <NavigationCard
              icon={<Store className="h-8 w-8" />}
              title="Diamond Store"
              description="Browse premium diamonds"
              href="/store"
              className="bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600"
            />

            <NavigationCard
              icon={<MessageSquare className="h-8 w-8" />}
              title="Diamond Chat"
              description="AI assistant for diamonds"
              href="/chat"
              className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:from-blue-600 hover:to-cyan-600"
            />
          </div>
        </div>
      </div>
    );
  }

  // For regular users, show user navigation
  if (isAuthenticated && user) {
    console.log('✅ Regular user detected - showing user navigation');
    redirectHandledRef.current = true;
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-primary text-primary-foreground flex items-center justify-center">
                <Gem className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground">BrilliantBot</h1>
                <p className="text-muted-foreground">Welcome, {user.first_name}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <NavigationCard
              icon={<PieChart className="h-8 w-8" />}
              title="Dashboard"
              description="Your diamond portfolio"
              href="/dashboard"
              className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white hover:from-blue-600 hover:to-indigo-600"
            />

            <NavigationCard
              icon={<MessageSquare className="h-8 w-8" />}
              title="Diamond Chat"
              description="AI assistant for diamonds"
              href="/chat"
              className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:from-blue-600 hover:to-cyan-600"
            />

            <NavigationCard
              icon={<Store className="h-8 w-8" />}
              title="Diamond Store"
              description="Browse premium diamonds"
              href="/store"
              className="bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600"
            />

            <NavigationCard
              icon={<Plus className="h-8 w-8" />}
              title="Add Diamonds"
              description="Upload & manage inventory"
              href="/upload"
              className="bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:from-green-600 hover:to-emerald-600"
            />

            <NavigationCard
              icon={<TrendingUp className="h-8 w-8" />}
              title="Insights"
              description="Market analysis & trends"
              href="/insights"
              className="bg-gradient-to-r from-orange-500 to-red-500 text-white hover:from-orange-600 hover:to-red-600"
            />

            <NavigationCard
              icon={<Search className="h-8 w-8" />}
              title="Search"
              description="Find specific diamonds"
              href="/catalog"
              className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:from-cyan-600 hover:to-blue-600"
            />
          </div>
        </div>
      </div>
    );
  }

  // Fallback for unauthenticated users - Show full diagnostics
  return (
    <div className="min-h-screen flex flex-col items-center justify-start px-4 bg-background py-8">
      <div className="text-center space-y-6 w-full max-w-xs mb-8">
        <div className="mx-auto w-14 h-14 rounded-xl bg-card border flex items-center justify-center">
          <Gem className="w-7 h-7 text-primary" />
        </div>
        
        <div className="space-y-4">
          <h1 className="text-2xl font-bold text-foreground tracking-tight">
            BrilliantBot
          </h1>
          <p className="text-sm text-muted-foreground">
            Secure Telegram access required
          </p>
        </div>
        
        <div className="space-y-3">
          <div className="bg-muted/50 rounded-lg p-3 text-xs text-muted-foreground">
            <p className="font-medium mb-1">🔐 Telegram Only</p>
            <p>This app works within Telegram Mini App for security.</p>
          </div>
          
          <div className="space-y-2">
            <Button 
              onClick={() => window.location.reload()} 
              className="w-full"
              variant="outline"
            >
              🔄 Retry Authentication
            </Button>
            
            <Button 
              onClick={() => window.location.href = '/admin'} 
              className="w-full"
              variant="default"
            >
              👑 Go to Admin Dashboard
            </Button>
          </div>
        </div>
      </div>

      {/* Full Authentication Diagnostics */}
      <AuthDiagnostics />
    </div>
  );
};

export default Index;