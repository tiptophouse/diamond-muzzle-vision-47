
import React from 'react';
import { Diamond, Bell, User, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SystemHealthIndicator } from '@/components/ui/SystemHealthIndicator';
import { useButtonFunctionality } from '@/hooks/useButtonFunctionality';

interface HeaderProps {
  onMenuClick?: () => void;
  showMenuButton?: boolean;
}

export function Header({ onMenuClick, showMenuButton = false }: HeaderProps) {
  const { navigationButton } = useButtonFunctionality();

  return (
    <header className="bg-white border-b border-gray-200 px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {showMenuButton && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onMenuClick}
              className="lg:hidden p-2 hover:bg-gray-100 touch-target"
            >
              <Menu className="h-5 w-5" />
            </Button>
          )}
          
          <div className="flex items-center gap-2">
            <Diamond className="h-7 w-7 text-blue-600" />
            <div>
              <h1 className="text-lg font-bold text-slate-800">BrilliantBot</h1>
              <p className="text-xs text-slate-600 hidden sm:block">Diamond Trading Assistant</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <SystemHealthIndicator />
          
          <Button
            variant="ghost"
            size="sm"
            onClick={navigationButton('/notifications')}
            className="relative p-2 hover:bg-gray-100 touch-target"
          >
            <Bell className="h-5 w-5 text-slate-600" />
            <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
              3
            </span>
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={navigationButton('/profile')}
            className="p-2 hover:bg-gray-100 touch-target"
          >
            <User className="h-5 w-5 text-slate-600" />
          </Button>
        </div>
      </div>
    </header>
  );
}
