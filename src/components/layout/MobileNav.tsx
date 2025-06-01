
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Settings, MessageSquare, BarChart3 } from 'lucide-react';

export function MobileNav() {
  const location = useLocation();

  const navItems = [
    { path: '/', icon: Home, label: 'Inventory' },
    { path: '/chat', icon: MessageSquare, label: 'Chat' },
    { path: '/analytics', icon: BarChart3, label: 'Analytics' },
    { path: '/settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border">
      <nav className="flex justify-around items-center py-2">
        {navItems.map(({ path, icon: Icon, label }) => (
          <Link
            key={path}
            to={path}
            className={`flex flex-col items-center p-2 ${
              location.pathname === path
                ? 'text-primary'
                : 'text-muted-foreground'
            }`}
          >
            <Icon size={20} />
            <span className="text-xs mt-1">{label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}
