
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { TutorialTriggerButton } from '@/components/tutorial/TutorialTriggerButton';
import { ChevronLeft, Menu, Search } from 'lucide-react';
import { useTelegramWebApp } from '@/hooks/useTelegramWebApp';

interface HeaderProps {
  onMenuToggle?: () => void;
}

export function Header({ onMenuToggle }: HeaderProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { webApp } = useTelegramWebApp();

  const canGoBack = location.pathname !== '/' && location.pathname !== '/inventory';

  const handleBack = () => {
    if (canGoBack) {
      navigate(-1);
    }
  };

  const getPageTitle = () => {
    switch (location.pathname) {
      case '/':
      case '/inventory':
        return 'My Diamonds';
      case '/store':
        return 'Diamond Store';
      case '/upload':
        return 'Upload Inventory';
      case '/chat':
        return 'AI Assistant';
      case '/insights':
        return 'Market Insights';
      case '/settings':
        return 'Settings';
      default:
        return 'Mazal Bot';
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
      <div className="flex h-14 items-center px-4">
        {/* Left side */}
        <div className="flex items-center gap-2">
          {canGoBack ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBack}
              className="h-8 w-8 p-0 md:hidden"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={onMenuToggle}
              className="h-8 w-8 p-0 md:hidden"
            >
              <Menu className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Center - Title */}
        <div className="flex-1 text-center">
          <h1 className="text-lg font-semibold text-foreground truncate">
            {getPageTitle()}
          </h1>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2">
          <TutorialTriggerButton />
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
          >
            <Search className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}
