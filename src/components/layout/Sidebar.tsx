
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { 
  LayoutDashboard, 
  Package, 
  Store, 
  Upload, 
  MessageSquare, 
  BarChart3, 
  Bell, 
  Settings, 
  FileText,
  Users,
  Workflow
} from 'lucide-react';

const ADMIN_TELEGRAM_ID = 2138564172;

export function Sidebar() {
  const location = useLocation();
  const { user } = useTelegramAuth();
  const isAdmin = user?.id === ADMIN_TELEGRAM_ID;

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Store', href: '/store', icon: Store },
    { name: 'Inventory', href: '/inventory', icon: Package },
    { name: 'Upload', href: '/upload', icon: Upload },
    { name: 'Chat', href: '/chat', icon: MessageSquare },
    { name: 'Insights', href: '/insights', icon: BarChart3 },
    { name: 'Notifications', href: '/notifications', icon: Bell },
    { name: 'Reports', href: '/reports', icon: FileText },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  // Admin-only routes
  if (isAdmin) {
    navigation.push(
      { name: 'Admin', href: '/admin', icon: Users },
      { name: 'MCP Tools', href: '/mcp', icon: Workflow }
    );
  }

  return (
    <aside className="fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 pt-16">
      <div className="flex flex-col h-full">
        <nav className="flex-1 px-4 py-6 space-y-2">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            const Icon = item.icon;
            
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Icon className={`h-5 w-5 ${isActive ? 'text-blue-600' : 'text-gray-500'}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
