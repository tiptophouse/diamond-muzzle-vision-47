
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  Upload, 
  MessageSquare, 
  TrendingUp, 
  FileText, 
  Heart, 
  Settings, 
  Bell,
  Shield
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTelegramAuth } from '@/context/TelegramAuthContext';

const ADMIN_TELEGRAM_ID = 2138564172;

export function Sidebar() {
  const location = useLocation();
  const { user } = useTelegramAuth();
  
  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Inventory', href: '/inventory', icon: Package },
    { name: 'Upload', href: '/upload', icon: Upload },
    { name: 'AI Chat', href: '/chat', icon: MessageSquare },
    { name: 'Insights', href: '/insights', icon: TrendingUp },
    { name: 'Reports', href: '/reports', icon: FileText },
    { name: 'Diamond Swipe', href: '/swipe', icon: Heart },
    { name: 'Notifications', href: '/notifications', icon: Bell },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  // Add admin navigation if user is admin
  if (user?.id === ADMIN_TELEGRAM_ID) {
    navigation.push({
      name: 'Admin Panel',
      href: '/admin',
      icon: Shield
    });
  }

  return (
    <div className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 h-full">
      <div className="p-6">
        <div className="space-y-1">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  'flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors',
                  isActive
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700'
                )}
              >
                <item.icon className="mr-3 h-5 w-5" />
                {item.name}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
