
import React from 'react';
import { Button } from '@/components/ui/button';
import { useTelegramWebApp } from '@/hooks/useTelegramWebApp';

export function Header() {
  const { hapticFeedback } = useTelegramWebApp();

  const handleMenuClick = () => {
    hapticFeedback.impact('light');
  };

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 flex">
          <a className="mr-6 flex items-center space-x-2" href="/">
            <span className="font-bold">Diamond Manager</span>
          </a>
        </div>
        
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <Button variant="ghost" size="sm" onClick={handleMenuClick}>
            Menu
          </Button>
        </div>
      </div>
    </header>
  );
}
