
import { Layout } from '@/components/layout/Layout';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { AdminStatsGrid } from '@/components/admin/AdminStatsGrid';
import { AdminUserManager } from '@/components/admin/AdminUserManager';
import { NotificationCenter } from '@/components/admin/NotificationCenter';
import { NotificationSender } from '@/components/admin/NotificationSender';
import { PaymentManagement } from '@/components/admin/PaymentManagement';
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { useEffect, useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { Gem, Sparkles, ShieldCheck, Users, Trophy } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Placeholder image for dashboard hero
const HERO_IMAGE = "https://images.unsplash.com/photo-1605810230434-7631ac76ec81?auto=format&fit=crop&w=800&q=80";

export default function Admin() {
  const { user, isAuthenticated, isLoading } = useTelegramAuth();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState([]);

  // Mock stats data
  const stats = {
    totalUsers: 1250,
    activeUsers: 890,
    premiumUsers: 156,
    totalRevenue: 25600,
    totalCosts: 8400,
    profit: 17200
  };

  const blockedUsersCount = 23;
  const averageEngagement = 74;

  useEffect(() => {
    console.log('🔍 Admin page mounted');
    console.log('🔍 User:', user);
    console.log('🔍 Is authenticated:', isAuthenticated);
    console.log('🔍 Is loading:', isLoading);
  }, [user, isAuthenticated, isLoading]);

  const handleExportData = () => {
    console.log('Exporting data...');
    toast({
      title: "Export Started",
      description: "Your data export is being prepared",
    });
  };

  const handleAddUser = () => {
    console.log('Adding new user...');
    toast({
      title: "Add User",
      description: "User creation feature coming soon",
    });
  };

  const handleRefreshNotifications = () => {
    console.log('Refreshing notifications...');
    toast({
      title: "Notifications Refreshed",
      description: "Notification data has been updated",
    });
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading admin panel...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
            <p className="text-gray-600">You need to be authenticated to access the admin panel.</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Million Dollar Dashboard Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-700 to-fuchsia-700 pb-12 sm:pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 pt-10 pb-14 flex flex-col md:flex-row items-center gap-10">
          <div className="flex-1 space-y-5">
            <div className="flex items-center gap-2">
              <Sparkles className="h-7 w-7 text-fuchsia-200 animate-fade-in" />
              <span className="uppercase tracking-wider font-bold text-white/80 text-xs">Admin Dashboard</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-white drop-shadow mb-2 leading-tight">
              Welcome, {user.first_name || 'Admin'}
            </h1>
            <h2 className="text-lg md:text-xl text-indigo-100/90 font-medium max-w-2xl leading-relaxed">
              <span className="bg-gradient-to-r from-amber-200/80 via-fuchsia-100/60 to-indigo-100/90 bg-clip-text text-transparent">
                All your platform <span className="text-amber-200">control</span> and <span className="text-sky-200">intelligence</span> in one beautiful, secure place.
              </span>
            </h2>
            <ul className="mt-6 flex gap-4 flex-wrap">
              <li className="flex items-center gap-2 bg-fuchsia-100/20 px-3 py-1.5 rounded-full text-white text-xs font-medium">
                <Gem className="h-4 w-4 text-amber-200" />  Enterprise-grade Security
              </li>
              <li className="flex items-center gap-2 bg-indigo-300/20 px-3 py-1.5 rounded-full text-white text-xs font-medium">
                <Trophy className="h-4 w-4 text-amber-100" />  Premium Analytics
              </li>
              <li className="flex items-center gap-2 bg-purple-100/20 px-3 py-1.5 rounded-full text-white text-xs font-medium">
                <ShieldCheck className="h-4 w-4 text-fuchsia-200" />  24/7 Protection
              </li>
            </ul>
          </div>
          <div className="flex-shrink-0 w-[320px] hidden md:block">
            <div className="bg-gradient-to-br from-amber-300/60 to-fuchsia-400/30 p-2 rounded-xl shadow-xl ring-4 ring-amber-100/40">
              <img 
                src={HERO_IMAGE}
                alt="Dashboard visual"
                className="rounded-lg object-cover w-full h-64 shadow-2xl"
                style={{ minHeight: '16rem', background: '#e3d7fd' }}
              />
            </div>
          </div>
        </div>
        {/* Soft curve BG */}
        <div className="absolute inset-x-0 bottom-0">
          <svg viewBox="0 0 1920 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full min-h-[64px]">
            <path fill="white" fillOpacity="1" d="M0,60 Q960,180 1920,60 L1920,80 L0,80 Z" />
          </svg>
        </div>
      </section>

      <section className="-mt-12 md:-mt-16 relative z-10 pb-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          {/* Million $ Header with shimmering border */}
          <div className="rounded-2xl shadow-2xl ring-1 ring-fuchsia-200/40 mb-6 overflow-hidden" style={{ background: "linear-gradient(105deg, #f8fafc 93%, #f5d0fe 100%)" }}>
            <AdminHeader
              onExportData={handleExportData}
              onAddUser={handleAddUser}
            />
          </div>
          
          {/* Stat grid with modern cards */}
          <div className="mb-8">
            <AdminStatsGrid
              stats={stats}
              blockedUsersCount={blockedUsersCount}
              averageEngagement={averageEngagement}
            />
          </div>
        </div>
      </section>

      {/* Updated tabs section with payment management */}
      <section className="relative bg-gradient-to-tr from-fuchsia-50/50 via-indigo-50/60 to-white/90 border-y border-fuchsia-100 py-6 md:py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <Tabs defaultValue="users" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6 bg-white">
              <TabsTrigger value="users" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">User Management</TabsTrigger>
              <TabsTrigger value="notifications" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">Send Notifications</TabsTrigger>
              <TabsTrigger value="payments" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">Payment Management</TabsTrigger>
            </TabsList>
            
            <TabsContent value="users">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="rounded-2xl shadow-lg bg-white/90 border border-fuchsia-100/40">
                  <AdminUserManager />
                </div>
                <div className="rounded-2xl shadow-lg bg-gradient-to-tl from-fuchsia-100/60 via-white to-indigo-50/40 border border-fuchsia-100/40">
                  <NotificationCenter notifications={notifications} onRefresh={handleRefreshNotifications} />
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="notifications">
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <NotificationSender onSendNotification={(notification) => console.log('Sent notification:', notification)} />
              </div>
            </TabsContent>

            <TabsContent value="payments">
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <PaymentManagement />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Debug info in development */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-6 p-4 bg-gray-100 rounded-lg text-sm max-w-4xl mx-auto">
          <h4 className="font-bold mb-2">🔧 Admin Debug Info</h4>
          <div className="space-y-1 text-xs">
            <p>User ID: {user.id}</p>
            <p>User Name: {user.first_name} {user.last_name}</p>
            <p>Username: {user.username}</p>
            <p>Authenticated: {isAuthenticated ? 'Yes' : 'No'}</p>
            <p>Loading: {isLoading ? 'Yes' : 'No'}</p>
            <p>Page Rendered: {new Date().toLocaleTimeString()}</p>
          </div>
        </div>
      )}
    </Layout>
  );
}
