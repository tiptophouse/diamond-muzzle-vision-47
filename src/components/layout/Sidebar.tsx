
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
    <div className={cn('pb-12 min-h-screen bg-white border-r border-gray-200', className)}>
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <div className="flex items-center mb-6 px-4">
            <Diamond className="h-8 w-8 text-blue-600" />
            <span className="ml-2 text-xl font-bold text-slate-800">BrilliantBot</span>
          </div>
          <div className="space-y-1">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    'flex items-center rounded-lg px-3 py-2 text-sm font-medium hover:bg-slate-100 transition-colors',
                    isActive
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-slate-700 hover:text-slate-900'
                  )}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
            
            {/* Admin-only navigation */}
            {isAdmin && (
              <div className="border-t border-gray-200 pt-4 mt-4">
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide px-3 mb-2">
                  Admin
                </div>
                <Link
                  to="/admin"
                  className={cn(
                    'flex items-center rounded-lg px-3 py-2 text-sm font-medium hover:bg-red-50 transition-colors',
                    location.pathname === '/admin'
                      ? 'bg-red-100 text-red-700'
                      : 'text-slate-700 hover:text-red-600'
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
