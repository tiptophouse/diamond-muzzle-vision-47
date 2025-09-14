import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useNotifications } from "@/hooks/useNotifications";
import { useTelegramWebApp } from "@/hooks/useTelegramWebApp";
import { cn } from "@/lib/utils";

interface FloatingNotificationButtonProps {
  className?: string;
}

export function FloatingNotificationButton({ className }: FloatingNotificationButtonProps) {
  const navigate = useNavigate();
  const { notifications } = useNotifications();
  const { hapticFeedback, themeParams } = useTelegramWebApp();

  // Count unread notifications
  const unreadCount = notifications.filter(n => !n.read).length;

  const handleClick = () => {
    hapticFeedback.selection();
    navigate('/notifications');
  };

  return (
    <div className={cn("fixed z-50", className)}>
      <Button
        onClick={handleClick}
        className={cn(
          // Base styling with Telegram theme integration
          "relative h-14 w-14 rounded-full shadow-lg hover:shadow-xl",
          "transition-all duration-200 hover:scale-105 active:scale-95",
          // Use Telegram button colors or fallback to primary
          "bg-[var(--tg-theme-button-color,hsl(var(--primary)))]",
          "hover:bg-[var(--tg-theme-button-color,hsl(var(--primary)))] hover:brightness-110",
          "text-[var(--tg-theme-button-text-color,hsl(var(--primary-foreground)))]",
          // Border for better definition
          "border border-white/20",
          // Animation for new notifications
          unreadCount > 0 && "animate-pulse"
        )}
        style={{
          backgroundColor: themeParams.button_color || undefined,
          color: themeParams.button_text_color || undefined,
        }}
      >
        <Bell size={22} className="drop-shadow-sm" />
        
        {/* Unread count badge */}
        {unreadCount > 0 && (
          <div className={cn(
            "absolute -top-1 -right-1 min-w-[20px] h-5 px-1",
            "bg-destructive text-destructive-foreground",
            "rounded-full text-xs font-bold",
            "flex items-center justify-center",
            "border-2 border-background",
            "animate-scale-in"
          )}>
            {unreadCount > 99 ? '99+' : unreadCount}
          </div>
        )}
        
        {/* Subtle glow effect for active notifications */}
        {unreadCount > 0 && (
          <div className="absolute inset-0 rounded-full bg-[var(--tg-theme-button-color,hsl(var(--primary)))] opacity-30 animate-ping" />
        )}
      </Button>
    </div>
  );
}