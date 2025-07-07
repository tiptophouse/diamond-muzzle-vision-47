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
  return <aside className="w-64 premium-card border-r border-border/50 flex flex-col h-full">
      {/* Header with close button for mobile */}
      <div className="p-4 border-b border-border/50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-md">
            <span className="text-white font-bold text-sm">💎</span>
          </div>
          <div>
            <h1 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Diamond mazal</h1>
            <p className="text-xs text-muted-foreground">Premium Platform</p>
          </div>
        </div>
        {onClose && <Button variant="ghost" size="sm" onClick={onClose} className="lg:hidden p-1">
            <X className="h-4 w-4" />
          </Button>}
      </div>
      
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navigation.map((item, index) => <NavLink key={item.name} to={item.href} onClick={handleNavClick} style={{
        animationDelay: `${index * 0.05}s`
      }} className={({
        isActive
      }) => cn('flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 w-full group hover:scale-105 hover:shadow-md animate-fade-in-up', isActive ? 'bg-gradient-to-r from-blue-500/10 to-purple-500/10 text-primary border border-primary/20 shadow-md' : 'text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground')}>
            <item.icon className="h-4 w-4 flex-shrink-0 group-hover:scale-110 transition-transform duration-300" />
            <span className="truncate">{item.name}</span>
          </NavLink>)}
        
        {isAdmin && <div className="pt-3 border-t border-border/50 mt-3">
            <div className="px-3 py-2 text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-gradient-to-r from-purple-500 to-cyan-500 animate-pulse-subtle"></div>
              Admin Panel
            </div>
            {adminNavigation.map((item, index) => <NavLink key={item.name} to={item.href} onClick={handleNavClick} style={{
          animationDelay: `${(navigation.length + index) * 0.05}s`
        }} className={({
          isActive
        }) => cn('flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 w-full group hover:scale-105 hover:shadow-md animate-fade-in-up', isActive ? 'bg-gradient-to-r from-purple-500/10 to-cyan-500/10 text-purple-700 border border-purple-200 shadow-md' : 'text-muted-foreground hover:bg-gradient-to-r hover:from-purple-50 hover:to-cyan-50 hover:text-purple-700')}>
                <item.icon className="h-4 w-4 flex-shrink-0 group-hover:scale-110 transition-transform duration-300" />
                <span className="truncate">{item.name}</span>
              </NavLink>)}
          </div>}
      </nav>
    </aside>;
};
export default Sidebar;