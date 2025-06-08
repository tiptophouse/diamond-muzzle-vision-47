
import React from 'react';
import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LayoutDashboard, Package, Upload, MessageSquare, TrendingUp, FileText, Settings, Bell, Users, BarChart3 } from 'lucide-react';

const ADMIN_TELEGRAM_ID = 2138564172;

interface SidebarProps {
  onClose?: () => void;
}

const Sidebar = ({ onClose }: SidebarProps) => {
  const { user } = useTelegramAuth();
  const isAdmin = user?.id === ADMIN_TELEGRAM_ID;
  
  const navigation = [
    {
      name: 'Dashboard',
      href: '/',
      icon: LayoutDashboard
    },
    {
      name: 'Inventory',
      href: '/inventory',
      icon: Package
    },
    {
      name: 'Upload',
      href: '/upload',
      icon: Upload
    },
    {
      name: 'Chat',
      href: '/chat',
      icon: MessageSquare
    },
    {
      name: 'Insights',
      href: '/insights',
      icon: TrendingUp
    },
    {
      name: 'Reports',
      href: '/reports',
      icon: FileText
    },
    {
      name: 'Settings',
      href: '/settings',
      icon: Settings
    },
    {
      name: 'Notifications',
      href: '/notifications',
      icon: Bell
    }
  ];

  const adminNavigation = [
    {
      name: 'Admin Analytics',
      href: '/admin',
      icon: BarChart3
    }
  ];

  const handleNavClick = () => {
    // Close sidebar on mobile when navigation item is clicked
    onClose?.();
  };

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col h-full">
      {/* Header with close button for mobile */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-gray-900">mazal-bot</h1>
        </div>
        {onClose && (
          <Button variant="ghost" size="sm" onClick={onClose} className="lg:hidden p-1">
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
      
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            onClick={handleNavClick}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors w-full',
                isActive
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              )
            }
          >
            <item.icon className="h-4 w-4 flex-shrink-0" />
            <span className="truncate">{item.name}</span>
          </NavLink>
        ))}
        
        {isAdmin && (
          <div className="pt-3 border-t border-gray-200 mt-3">
            <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Admin Panel
            </div>
            {adminNavigation.map((item) => (
              <NavLink
                key={item.name}
                to={item.href}
                onClick={handleNavClick}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors w-full',
                    isActive
                      ? 'bg-gradient-to-r from-purple-100 to-cyan-100 text-purple-700 border border-purple-200'
                      : 'text-gray-600 hover:bg-gradient-to-r hover:from-purple-50 hover:to-cyan-50 hover:text-purple-700'
                  )
                }
              >
                <item.icon className="h-4 w-4 flex-shrink-0" />
                <span className="truncate">{item.name}</span>
              </NavLink>
            ))}
          </div>
        )}
      </nav>
    </aside>
  );
};

export default Sidebar;
