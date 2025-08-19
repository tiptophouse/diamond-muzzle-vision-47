
import { useState } from "react";
import { Link, useLocation } from 'react-router-dom';
import { Diamond } from "lucide-react";
import { cn } from '@/lib/utils';
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
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Inventory', href: '/inventory', icon: Package },
  { name: 'Store', href: '/store', icon: Store },
  { name: 'Upload', href: '/upload', icon: Upload },
  { name: 'Insights', href: '/insights', icon: BarChart3 },
  { name: 'Chat', href: '/chat', icon: MessageCircle },
  { name: 'Wishlist', href: '/wishlist', icon: Heart },
  { name: 'Profile', href: '/profile', icon: User },
];

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const location = useLocation();
  
  return (
    <div className="min-h-screen w-full flex flex-col bg-background">
      {/* Top Header */}
      <div className="flex items-center justify-center h-14 sm:h-16 px-3 sm:px-4 border-b border-border/20 bg-card/80 backdrop-blur-md">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1 justify-center">
          <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-xl bg-gradient-to-br from-[#0088cc] to-[#229ED9] flex items-center justify-center shadow-sm flex-shrink-0">
            <Diamond className="text-white h-3 w-3 sm:h-4 sm:w-4" />
          </div>
          <h1 className="font-semibold text-foreground text-base sm:text-lg tracking-tight truncate">
            BrilliantBot
          </h1>
        </div>
      </div>
      
      {/* Main Content */}
      <main className="flex-1 w-full min-w-0 overflow-x-hidden bg-background pb-20">
        <div className="w-full max-w-full h-full p-3 sm:p-4 lg:p-6">
          <div className="w-full max-w-none overflow-x-hidden">
            {children}
          </div>
        </div>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
        <div className="grid grid-cols-4 h-16">
          {navigation.slice(0, 4).map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  'flex flex-col items-center justify-center gap-1 p-2 text-xs font-medium transition-colors',
                  isActive
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                )}
              >
                <item.icon className="h-5 w-5" />
                <span className="truncate">{item.name}</span>
              </Link>
            );
          })}
        </div>
        
        {/* Secondary Navigation Row */}
        <div className="grid grid-cols-4 h-12 border-t border-gray-100 bg-gray-50">
          {navigation.slice(4).map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  'flex flex-col items-center justify-center gap-0.5 p-1 text-xs font-medium transition-colors',
                  isActive
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                )}
              >
                <item.icon className="h-4 w-4" />
                <span className="truncate text-[10px]">{item.name}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
