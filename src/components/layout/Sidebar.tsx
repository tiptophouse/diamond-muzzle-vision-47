
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { getAdminTelegramId } from '@/lib/api/secureConfig';
import {
  Home,
  Package,
  Store,
  Upload,
  BarChart3,
  MessageCircle,
  Bell,
  User,
  Settings,
  Heart,
  Diamond,
  Shield,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useFastApiNotifications } from '@/hooks/useFastApiNotifications';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Inventory', href: '/inventory', icon: Package },
  { name: 'Store', href: '/store', icon: Store },
  { name: 'Upload', href: '/upload', icon: Upload },
  { name: 'Insights', href: '/insights', icon: BarChart3 },
  { name: 'Chat', href: '/chat', icon: MessageCircle },
  { name: 'Wishlist', href: '/wishlist', icon: Heart },
  { name: 'Notifications', href: '/notifications', icon: Bell },
  { name: 'Profile', href: '/profile', icon: User },
  { name: 'Settings', href: '/settings', icon: Settings },
];

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const location = useLocation();
  const { user } = useTelegramAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const { notifications } = useFastApiNotifications();

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (user?.id) {
        try {
          const adminId = await getAdminTelegramId();
          setIsAdmin(user.id === adminId);
        } catch (error) {
          console.error('Error checking admin status:', error);
          setIsAdmin(false);
        }
      }
    };
    
    checkAdminStatus();
  }, [user?.id]);

  return (
    <div className={cn('pb-12 min-h-screen bg-white border-r border-gray-200 shadow-lg', className)}>
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <div className="flex items-center mb-6 px-4 py-3 bg-blue-50 rounded-lg mx-2">
            <Diamond className="h-8 w-8 text-blue-600" />
            <span className="ml-2 text-xl font-bold text-gray-900">BrilliantBot</span>
          </div>
          <div className="space-y-1">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              const unreadCount = item.name === 'Notifications' ? notifications.filter(n => !n.read).length : 0;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                   className={cn(
                     'flex items-center rounded-lg px-3 py-2 text-sm font-medium hover:bg-gray-100 transition-colors relative',
                     isActive
                       ? 'bg-blue-600 text-white shadow-md'
                       : 'text-gray-700 hover:text-gray-900'
                   )}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.name}
                  {unreadCount > 0 && (
                    <Badge 
                      variant="destructive" 
                      className="ml-auto h-5 w-5 p-0 flex items-center justify-center text-xs"
                    >
                      {unreadCount}
                    </Badge>
                  )}
                </Link>
              );
            })}
            
            {/* Admin-only navigation */}
            {isAdmin && (
              <div className="border-t border-gray-200 pt-4 mt-4">
                <div className="text-xs font-semibold text-gray-600 uppercase tracking-wide px-3 mb-2">
                  Admin
                </div>
                <Link
                  to="/admin"
                  className={cn(
                    'flex items-center rounded-lg px-3 py-2 text-sm font-medium hover:bg-red-50 transition-colors',
                    location.pathname === '/admin'
                      ? 'bg-red-600 text-white shadow-md'
                      : 'text-gray-700 hover:text-red-600'
                  )}
                >
                  <Shield className="mr-3 h-5 w-5" />
                  Admin Panel
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
