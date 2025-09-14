import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useProductionTelegramApp } from '@/hooks/useProductionTelegramApp';
import { 
  Home, 
  Package, 
  Store, 
  MessageCircle, 
  BarChart3,
  Plus,
  Search
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navigationItems = [
  {
    to: '/dashboard',
    icon: Home,
    label: 'Home',
    activePattern: /^\/(dashboard)?$/
  },
  {
    to: '/inventory',
    icon: Package,
    label: 'Inventory',
    activePattern: /^\/inventory/
  },
  {
    to: '/store',
    icon: Store,
    label: 'Store',
    activePattern: /^\/store|catalog/
  },
  {
    to: '/insights',
    icon: BarChart3,
    label: 'Insights',
    activePattern: /^\/insights|analytics/
  }
];

export function ProductionBottomNavigation() {
  const location = useLocation();
  const navigate = useNavigate();
  const { haptic, safeAreaInsets, platform } = useProductionTelegramApp();
  
  const isActive = (pattern: RegExp) => pattern.test(location.pathname);
  
  const handleNavigation = (to: string) => {
    haptic.selection();
    navigate(to);
  };
  
  const handleAddAction = () => {
    haptic.impact('medium');
    navigate('/upload-single-stone');
  };
  
  return (
    <nav 
      className={cn(
        "fixed bottom-0 left-0 right-0 z-50",
        "bg-background/95 backdrop-blur-lg border-t border-border/50",
        "shadow-lg shadow-black/10"
      )}
      style={{ 
        paddingBottom: `${Math.max(safeAreaInsets.bottom, 16)}px`,
        background: platform === 'ios' 
          ? 'rgba(var(--background), 0.95)' 
          : 'hsl(var(--background) / 0.95)'
      }}
    >
      <div className="px-4 pt-2">
        <div className="flex items-center justify-between max-w-sm mx-auto relative">
          {/* Left side navigation items */}
          <div className="flex items-center justify-around flex-1 mr-16">
            {navigationItems.slice(0, 2).map((item) => {
              const Icon = item.icon;
              const active = isActive(item.activePattern);
              
              return (
                <button
                  key={item.to}
                  onClick={() => handleNavigation(item.to)}
                  className={cn(
                    "flex flex-col items-center justify-center py-2 px-3",
                    "min-w-[60px] min-h-[48px] rounded-xl transition-all duration-200",
                    "active:scale-95 transform",
                    active 
                      ? "text-primary bg-primary/10" 
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  )}
                >
                  <Icon className={cn("h-5 w-5 mb-1", active && "text-primary")} />
                  <span className={cn("text-xs font-medium", active && "text-primary")}>
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>
          
          {/* Center floating action button */}
          <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-2">
            <button
              onClick={handleAddAction}
              className={cn(
                "w-14 h-14 rounded-full bg-primary text-primary-foreground",
                "shadow-lg shadow-primary/25 active:scale-95 transform transition-all duration-200",
                "flex items-center justify-center",
                "hover:shadow-xl hover:shadow-primary/30"
              )}
            >
              <Plus className="h-6 w-6" />
            </button>
          </div>
          
          {/* Right side navigation items */}
          <div className="flex items-center justify-around flex-1 ml-16">
            {navigationItems.slice(2, 4).map((item) => {
              const Icon = item.icon;
              const active = isActive(item.activePattern);
              
              return (
                <button
                  key={item.to}
                  onClick={() => handleNavigation(item.to)}
                  className={cn(
                    "flex flex-col items-center justify-center py-2 px-3",
                    "min-w-[60px] min-h-[48px] rounded-xl transition-all duration-200",
                    "active:scale-95 transform",
                    active 
                      ? "text-primary bg-primary/10" 
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  )}
                >
                  <Icon className={cn("h-5 w-5 mb-1", active && "text-primary")} />
                  <span className={cn("text-xs font-medium", active && "text-primary")}>
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}