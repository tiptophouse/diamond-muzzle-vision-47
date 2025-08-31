
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { 
  Home, 
  Package, 
  Store, 
  MessageCircle, 
  BarChart3 
} from 'lucide-react';
import { useTelegramHapticFeedback } from '@/hooks/useTelegramHapticFeedback';

const navigationItems = [
  { 
    name: 'Home', 
    href: '/dashboard', 
    icon: Home,
    label: 'Home'
  },
  { 
    name: 'Inventory', 
    href: '/inventory', 
    icon: Package,
    label: 'Inventory'
  },
  { 
    name: 'Store', 
    href: '/store', 
    icon: Store,
    label: 'Store'
  },
  { 
    name: 'Chat', 
    href: '/chat', 
    icon: MessageCircle,
    label: 'Chat'
  },
  { 
    name: 'Insights', 
    href: '/insights', 
    icon: BarChart3,
    label: 'Insights'
  },
];

export function BottomNavigation() {
  const location = useLocation();
  const { impactOccurred } = useTelegramHapticFeedback();

  const handleNavClick = () => {
    impactOccurred('light');
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-t border-border/20">
      {/* iPhone safe area padding */}
      <div className="pb-[env(safe-area-inset-bottom,0px)]">
        <div className="flex items-center justify-around px-2 py-2">
          {navigationItems.map((item) => {
            const isActive = location.pathname === item.href || 
              (item.href === '/dashboard' && location.pathname === '/');
            
            return (
              <Link
                key={item.name}
                to={item.href}
                onClick={handleNavClick}
                className={cn(
                  "flex flex-col items-center justify-center min-w-[60px] py-2 px-3 rounded-xl transition-all duration-200",
                  "min-h-[44px]", // iOS minimum touch target
                  isActive 
                    ? "bg-primary/10 text-primary" 
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                )}
              >
                <item.icon 
                  className={cn(
                    "h-5 w-5 mb-1 transition-transform duration-200",
                    isActive && "scale-110"
                  )} 
                />
                <span className={cn(
                  "text-xs font-medium tracking-tight",
                  isActive && "font-semibold"
                )}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
