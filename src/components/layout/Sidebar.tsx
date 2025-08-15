
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
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
  Diamond,
  TrendingUp,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Inventory', href: '/inventory', icon: Package },
  { name: 'Store', href: '/store', icon: Store },
  { name: 'Upload', href: '/upload', icon: Upload },
  { name: 'Insights', href: '/insights', icon: BarChart3 },
  { name: 'Chat', href: '/chat', icon: MessageCircle },
  { name: 'Wishlist', href: '/wishlist', icon: Heart },
  { 
    name: 'Investment Opportunity', 
    href: '/investment', 
    icon: TrendingUp,
    badge: 'NEW',
    badgeColor: 'bg-red-500 text-white',
    highlight: true
  },
  { name: 'Notifications', href: '/notifications', icon: Bell },
  { name: 'Profile', href: '/profile', icon: User },
  { name: 'Settings', href: '/settings', icon: Settings },
];

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const location = useLocation();

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
                    'flex items-center rounded-lg px-3 py-2 text-sm font-medium hover:bg-slate-100 transition-colors relative',
                    isActive
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-slate-700 hover:text-slate-900',
                    item.highlight && 'bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 hover:from-red-100 hover:to-orange-100'
                  )}
                >
                  <item.icon className={cn(
                    "mr-3 h-5 w-5",
                    item.highlight && "text-red-600"
                  )} />
                  <span className={item.highlight ? "text-red-700 font-semibold" : ""}>
                    {item.name}
                  </span>
                  {item.badge && (
                    <Badge 
                      className={cn(
                        "ml-auto text-xs px-1.5 py-0.5",
                        item.badgeColor || "bg-blue-500 text-white"
                      )}
                    >
                      {item.badge}
                    </Badge>
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
