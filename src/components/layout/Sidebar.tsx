
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
  X,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useFastApiNotifications } from '@/hooks/useFastApiNotifications';

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
  onClose?: () => void;
}

export function Sidebar({ className, onClose }: SidebarProps) {
  const location = useLocation();
  const { user } = useTelegramAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const { notifications } = useFastApiNotifications();

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
    <div className={cn(
      "h-full bg-card/95 backdrop-blur-xl border-r border-border/50 shadow-2xl",
      "flex flex-col relative",
      className
    )}>
      {/* Header Section */}
      <div className="flex items-center justify-between p-6 border-b border-border/50">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-3xl bg-gradient-to-br from-primary via-primary/90 to-primary/70 flex items-center justify-center shadow-xl ring-4 ring-primary/10">
            <Diamond className="h-6 w-6 text-primary-foreground" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-xl font-bold text-foreground tracking-tight">BrilliantBot</h1>
            <p className="text-xs text-muted-foreground font-medium">AI Diamond Assistant</p>
          </div>
        </div>
        {onClose && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="lg:hidden mobile-tap rounded-2xl hover:bg-accent/60"
          >
            <X className="h-5 w-5" />
          </Button>
        )}
      </div>

      {/* Navigation Section */}
      <div className="flex-1 p-4 space-y-2 overflow-y-auto ios-scroll">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href;
          const unreadCount = item.name === 'Notifications' ? notifications.filter(n => !n.read).length : 0;
          
          return (
            <Link
              key={item.name}
              to={item.href}
              onClick={onClose}
              className={cn(
                "group flex items-center gap-4 px-4 py-3 rounded-2xl font-medium transition-all duration-200 mobile-tap",
                "hover:bg-accent/60 hover:shadow-lg hover:scale-[1.02]",
                isActive 
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25 scale-[1.02]"
                  : "text-foreground/80 hover:text-foreground"
              )}
            >
              <div className={cn(
                "flex items-center justify-center w-9 h-9 rounded-xl transition-colors",
                isActive 
                  ? "bg-primary-foreground/20" 
                  : "bg-accent/30 group-hover:bg-accent/50"
              )}>
                <item.icon className="h-5 w-5" />
              </div>
              
              <span className="flex-1 text-sm font-semibold">{item.name}</span>
              
              {unreadCount > 0 && (
                <Badge className="h-6 w-6 p-0 flex items-center justify-center text-xs font-bold bg-destructive text-destructive-foreground border-0 shadow-lg">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </Badge>
              )}
            </Link>
          );
        })}
        
        {/* Admin Section */}
        {isAdmin && (
          <>
            <div className="h-px bg-border/50 my-6" />
            <div className="px-4 py-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                Administration
              </p>
              <Link
                to="/admin"
                onClick={onClose}
                className={cn(
                  "group flex items-center gap-4 px-4 py-3 rounded-2xl font-medium transition-all duration-200 mobile-tap",
                  "hover:bg-destructive/10 hover:shadow-lg hover:scale-[1.02]",
                  location.pathname === '/admin'
                    ? "bg-destructive text-destructive-foreground shadow-lg shadow-destructive/25 scale-[1.02]"
                    : "text-foreground/80 hover:text-destructive"
                )}
              >
                <div className={cn(
                  "flex items-center justify-center w-9 h-9 rounded-xl transition-colors",
                  location.pathname === '/admin'
                    ? "bg-destructive-foreground/20"
                    : "bg-destructive/10 group-hover:bg-destructive/20"
                )}>
                  <Shield className="h-5 w-5" />
                </div>
                <span className="flex-1 text-sm font-semibold">Admin Panel</span>
              </Link>
            </div>
          </>
        )}
      </div>

      {/* Footer Section */}
      <div className="p-4 border-t border-border/50">
        <div className="flex items-center gap-3 px-4 py-3 bg-accent/20 rounded-2xl">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg">
            <span className="text-sm font-bold text-primary-foreground">
              {user?.first_name?.charAt(0) || 'U'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground truncate">
              {user?.first_name || 'User'}
            </p>
            <p className="text-xs text-muted-foreground">Telegram User</p>
          </div>
        </div>
      </div>
    </div>
  );
}
