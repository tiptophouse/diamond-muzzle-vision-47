import React from 'react';
import { Bell, Settings, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { useFastApiNotifications } from '@/hooks/useFastApiNotifications';
import { useTelegramHapticFeedback } from '@/hooks/useTelegramHapticFeedback';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface MobileOptimizedHeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  showNotifications?: boolean;
  className?: string;
}

export function MobileOptimizedHeader({ 
  title, 
  subtitle, 
  actions, 
  showNotifications = true,
  className 
}: MobileOptimizedHeaderProps) {
  const { user } = useTelegramAuth();
  const { notifications } = useFastApiNotifications();
  const { selectionChanged } = useTelegramHapticFeedback();
  const navigate = useNavigate();

  const unreadCount = notifications?.filter(n => !n.read).length || 0;

  const handleNavigation = (path: string) => {
    selectionChanged();
    navigate(path);
  };

  return (
    <div className={cn("telegram-header", className)}>
      <div className="px-3 md:px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Title Section */}
          <div className="flex-1 min-w-0">
            <h1 className="text-lg sm:text-xl font-semibold text-[var(--tg-theme-text-color)] truncate">
              {title}
            </h1>
            {subtitle && (
              <p className="text-sm text-[var(--tg-theme-hint-color)] truncate">
                {subtitle}
              </p>
            )}
          </div>

          {/* Actions Section */}
          <div className="flex items-center gap-2 ml-4">
            {actions}
            
            {/* Notifications Button */}
            {showNotifications && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleNavigation('/notifications')}
                className="relative h-9 w-9 p-0 touch-target"
              >
                <Bell className="h-5 w-5 text-[var(--tg-theme-hint-color)]" />
                {unreadCount > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center text-xs p-0 min-w-[20px] rounded-full"
                  >
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </Badge>
                )}
              </Button>
            )}

            {/* User Avatar/Profile */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleNavigation('/profile')}
              className="h-9 w-9 p-0 rounded-full touch-target"
            >
              {user?.photo_url ? (
                <img 
                  src={user.photo_url} 
                  alt={user.first_name}
                  className="h-7 w-7 rounded-full"
                />
              ) : (
                <User className="h-5 w-5 text-[var(--tg-theme-hint-color)]" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}