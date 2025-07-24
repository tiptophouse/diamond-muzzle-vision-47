import React from 'react';
import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LayoutDashboard, Package, Upload, MessageSquare, TrendingUp, FileText, Settings, Bell, Users, BarChart3, Store } from 'lucide-react';
const ADMIN_TELEGRAM_ID = 2138564172;
interface SidebarProps {
  onClose?: () => void;
}
const Sidebar = ({
  onClose
}: SidebarProps) => {
  const {
    user
  } = useTelegramAuth();
  const isAdmin = user?.id === ADMIN_TELEGRAM_ID;
  const navigation = [{
    name: 'Dashboard',
    href: '/',
    icon: LayoutDashboard
  }, {
    name: 'Inventory',
    href: '/inventory',
    icon: Package
  }, {
    name: 'Store',
    href: '/store',
    icon: Store
  }, {
    name: 'Upload',
    href: '/upload',
    icon: Upload
  }, {
    name: 'Chat',
    href: '/chat',
    icon: MessageSquare
  }, {
    name: 'Insights',
    href: '/insights',
    icon: TrendingUp
  }, {
    name: 'Settings',
    href: '/settings',
    icon: Settings
  }, {
    name: 'Notifications',
    href: '/notifications',
    icon: Bell
  }];
  const adminNavigation = [{
    name: 'Admin Analytics',
    href: '/admin',
    icon: BarChart3
  }];
  const handleNavClick = () => {
    // Close sidebar on mobile when navigation item is clicked
    onClose?.();
  };
  return (
    <aside className="w-64 bg-card/60 backdrop-blur-xl border-r border-border/30 flex flex-col h-full shadow-lg">
      {/* Header with close button for mobile */}
      <div className="p-4 border-b border-border/30 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-lg">💎</span>
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-xl font-bold text-foreground tracking-tight truncate bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">
              Diamond Mazal
            </h1>
            <p className="text-xs text-muted-foreground truncate font-medium">Premium Platform</p>
          </div>
        </div>
        {onClose && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onClose} 
            className="lg:hidden p-1 hover:bg-accent/50"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
      
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto scrollbar-hide">
        {navigation.map((item, index) => (
          <NavLink 
            key={item.name} 
            to={item.href} 
            onClick={handleNavClick}
            className={({ isActive }) => cn(
              'flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all duration-300 w-full group relative overflow-hidden',
              isActive 
                ? 'bg-gradient-to-r from-primary/10 to-primary/5 text-primary border border-primary/20 shadow-md' 
                : 'text-muted-foreground hover:bg-accent/80 hover:text-accent-foreground hover:shadow-md'
            )}
          >
            <item.icon className="h-5 w-5 flex-shrink-0 transition-all duration-300 group-hover:scale-110 z-10" />
            <span className="truncate z-10">{item.name}</span>
            {/* Hover effect overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </NavLink>
        ))}
        
        {isAdmin && (
          <div className="pt-4 border-t border-border/30 mt-4">
            <div className="px-4 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
              Admin Panel
            </div>
            {adminNavigation.map((item) => (
              <NavLink 
                key={item.name} 
                to={item.href} 
                onClick={handleNavClick}
                className={({ isActive }) => cn(
                  'flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all duration-300 w-full group relative overflow-hidden',
                  isActive 
                    ? 'bg-gradient-to-r from-primary/15 to-primary/10 text-primary border border-primary/25 shadow-md' 
                    : 'text-muted-foreground hover:bg-accent/80 hover:text-accent-foreground hover:shadow-md'
                )}
              >
                <item.icon className="h-5 w-5 flex-shrink-0 transition-all duration-300 group-hover:scale-110 z-10" />
                <span className="truncate z-10">{item.name}</span>
                {/* Hover effect overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-primary/8 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </NavLink>
            ))}
          </div>
        )}
      </nav>
    </aside>
  );
};
export default Sidebar;