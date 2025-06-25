
import React from 'react';
import { useLocation } from 'react-router-dom';

export function MobileNav() {
  const location = useLocation();
  
  const navigation = [
    { name: 'Dashboard', href: '/dashboard' },
    { name: 'Inventory', href: '/inventory' },
    { name: 'Upload', href: '/upload' },
    { name: 'Settings', href: '/settings' },
  ];

  return (
    <nav className="flex flex-col space-y-3 mt-6">
      {navigation.map((item) => (
        <a
          key={item.name}
          href={item.href}
          className={`text-sm font-medium transition-colors hover:text-primary py-2 px-3 rounded-md ${
            location.pathname === item.href
              ? 'bg-accent text-accent-foreground'
              : 'text-muted-foreground hover:bg-accent/50'
          }`}
        >
          {item.name}
        </a>
      ))}
    </nav>
  );
}
