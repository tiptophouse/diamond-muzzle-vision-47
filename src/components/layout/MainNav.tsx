
import React from 'react';
import { useLocation } from 'react-router-dom';

export function MainNav() {
  const location = useLocation();
  
  const navigation = [
    { name: 'Dashboard', href: '/dashboard' },
    { name: 'Inventory', href: '/inventory' },
    { name: 'Upload', href: '/upload' },
    { name: 'Settings', href: '/settings' },
  ];

  return (
    <nav className="flex space-x-8">
      {navigation.map((item) => (
        <a
          key={item.name}
          href={item.href}
          className={`text-sm font-medium transition-colors hover:text-primary ${
            location.pathname === item.href
              ? 'text-black'
              : 'text-muted-foreground'
          }`}
        >
          {item.name}
        </a>
      ))}
    </nav>
  );
}
