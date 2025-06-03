
import { useState } from 'react';
import { Menu, Bell, User, Diamond } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

export function Header() {
  const { user, isTelegramEnvironment } = useTelegramAuth();
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
      <div className="flex items-center justify-between">
        {/* Left side - Logo and mobile menu */}
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          
          <div className="flex items-center space-x-2">
            <Diamond className="h-6 w-6 text-blue-600" />
            <span className="font-bold text-xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              mazal-bot
            </span>
          </div>
        </div>

        {/* Right side - User menu and notifications */}
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm">
            <Bell className="h-5 w-5" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                <Avatar className="h-6 w-6">
                  <AvatarFallback className="text-xs">
                    {user?.first_name?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden md:block text-sm">
                  {user?.first_name || 'User'}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={toggleTheme}>
                Switch to {theme === 'light' ? 'Dark' : 'Light'} Mode
              </DropdownMenuItem>
              <DropdownMenuItem>Settings</DropdownMenuItem>
              {!isTelegramEnvironment && (
                <DropdownMenuItem>Logout</DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
