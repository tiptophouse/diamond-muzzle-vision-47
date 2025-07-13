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
    <aside className="w-64 bg-card/50 backdrop-blur-md border-r border-border/20 flex flex-col h-full">
      {/* Header with close button for mobile */}
      <div className="p-4 border-b border-border/20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#0088cc] to-[#229ED9] flex items-center justify-center shadow-sm">
            <span className="text-white font-bold text-sm">💎</span>
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-lg font-semibold text-foreground tracking-tight truncate">
              Diamond Mazal
            </h1>
            <p className="text-xs text-muted-foreground truncate">Premium Platform</p>
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
      
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto scrollbar-hide">
        {navigation.map((item, index) => (
          <NavLink 
            key={item.name} 
            to={item.href} 
            onClick={handleNavClick}
            className={({ isActive }) => cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 w-full group',
              isActive 
                ? 'bg-[#0088cc]/10 text-[#0088cc] border border-[#0088cc]/20 shadow-sm' 
                : 'text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground'
            )}
          >
            <item.icon className="h-4 w-4 flex-shrink-0 transition-transform duration-200 group-hover:scale-110" />
            <span className="truncate">{item.name}</span>
          </NavLink>
        ))}
        
        {isAdmin && (
          <div className="pt-3 border-t border-border/20 mt-3">
            <div className="px-3 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#0088cc] animate-pulse"></div>
              Admin Panel
            </div>
            {adminNavigation.map((item) => (
              <NavLink 
                key={item.name} 
                to={item.href} 
                onClick={handleNavClick}
                className={({ isActive }) => cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 w-full group',
                  isActive 
                    ? 'bg-[#0088cc]/10 text-[#0088cc] border border-[#0088cc]/20 shadow-sm' 
                    : 'text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground'
                )}
              >
                <item.icon className="h-4 w-4 flex-shrink-0 transition-transform duration-200 group-hover:scale-110" />
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