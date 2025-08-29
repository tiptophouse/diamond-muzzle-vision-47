
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Upload, Store, Users, Settings, BarChart3 } from 'lucide-react';
import { useTelegramWebApp } from '@/hooks/useTelegramWebApp';

interface TelegramMiniAppLayoutProps {
  children: React.ReactNode;
}

const navigationItems = [
  {
    to: '/',
    icon: Home,
    label: 'Home',
  },
  {
    to: '/upload',
    icon: Upload,
    label: 'Upload',
  },
  {
    to: '/store',
    icon: Store,
    label: 'Store',
  },
  {
    to: '/clients',
    icon: Users,
    label: 'Clients',
  },
  {
    to: '/admin',
    icon: BarChart3,
    label: 'Admin',
  }
];

export function TelegramMiniAppLayout({ children }: TelegramMiniAppLayoutProps) {
  const location = useLocation();
  const { hapticFeedback } = useTelegramWebApp();

  const handleNavClick = (path: string) => {
    if (location.pathname !== path) {
      hapticFeedback?.selection();
    }
  };

  return (
    <div 
      className="flex flex-col h-screen bg-background overflow-hidden"
      style={{ 
        height: 'var(--tg-viewport-height, 100vh)',
        paddingTop: 'var(--tg-safe-area-inset-top, 0px)',
        paddingBottom: 'var(--tg-safe-area-inset-bottom, 0px)'
      }}
    >
      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto pb-16">
        {children}
      </main>

      {/* Persistent Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-background border-t border-border z-50">
        <div className="flex items-center justify-around h-16 px-2">
          {navigationItems.map((item) => {
            const isActive = location.pathname === item.to;
            
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => handleNavClick(item.to)}
                className={`flex flex-col items-center justify-center p-2 min-w-0 flex-1 rounded-lg transition-all duration-200 active:scale-95 ${
                  isActive
                    ? 'text-primary bg-primary/10'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                }`}
              >
                <item.icon 
                  className={`h-5 w-5 mb-1 ${isActive ? 'text-primary' : ''}`} 
                />
                <span 
                  className={`text-xs font-medium truncate ${
                    isActive ? 'text-primary' : ''
                  }`}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
