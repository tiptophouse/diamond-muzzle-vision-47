import React from 'react';
import { Link } from 'react-router-dom';
import { useTelegramWebApp } from '@/hooks/useTelegramWebApp';
import { UserMenu } from '@/components/UserMenu';
import { ThemeToggle } from '@/components/ThemeToggle';
import { MobileSidebar } from './MobileSidebar';
import { TutorialTriggerButton } from '@/components/tutorial/TutorialTriggerButton';

export function Header() {
  const { backButton, MainButton, hapticFeedback } = useTelegramWebApp();

  const handleGoBack = () => {
    hapticFeedback.impact('light');
    backButton.offClick(handleGoBack);
    window.history.back();
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur-md">
      <div className="flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <Link to="/" className="flex items-center gap-2 font-semibold">
            <img src="/logo.png" alt="Diamond Mazal Logo" className="h-8 w-auto" />
            <span className="hidden sm:block">Diamond Mazal</span>
          </Link>
          <nav className="hidden lg:flex items-center gap-6 text-sm">
            <Link to="/inventory" className="hover:text-primary transition-colors">Inventory</Link>
            <Link to="/store" className="hover:text-primary transition-colors">Store</Link>
            <Link to="/upload" className="hover:text-primary transition-colors">Upload</Link>
            <Link to="/chat" className="hover:text-primary transition-colors">Chat</Link>
            <Link to="/insights" className="hover:text-primary transition-colors">Insights</Link>
            {/* <Link to="/settings" className="hover:text-primary transition-colors">Settings</Link> */}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          {/* Add tutorial trigger button */}
          <TutorialTriggerButton variant="ghost" size="sm" />
          
          <ThemeToggle />
          <UserMenu />
          <MobileSidebar />
        </div>
      </div>
    </header>
  );
}
