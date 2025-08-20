
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useTelegramWebApp } from '@/hooks/useTelegramWebApp';
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
  const { hapticFeedback } = useTelegramWebApp();

  const handleNavClick = () => {
    hapticFeedback.impact('light');
  };

  return (
    <div className={cn('pb-12 min-h-screen bg-white border-r border-gray-200 shadow-lg', className)}>
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
                  onClick={handleNavClick}
                  className={cn(
                    'flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors min-h-[44px]',
                    'hover:bg-slate-100 active:bg-slate-200',
                    isActive
                      ? 'bg-blue-100 text-blue-700 shadow-sm'
                      : 'text-slate-700 hover:text-slate-900'
                  )}
                >
                  <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
                  <span className="truncate">{item.name}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
