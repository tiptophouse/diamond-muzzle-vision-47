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
    <div className={cn("fixed z-40 pointer-events-none", className)}>
      <Button
        onClick={handleClick}
        size="lg"
        className={cn(
          // Base styling with Telegram theme integration
          "relative h-12 w-12 md:h-14 md:w-14 rounded-full shadow-lg hover:shadow-xl pointer-events-auto",
          "transition-all duration-200 hover:scale-105 active:scale-95",
          // Use Telegram button colors or fallback to primary
          "bg-[var(--tg-theme-button-color,hsl(var(--primary)))]",
          "hover:bg-[var(--tg-theme-button-color,hsl(var(--primary)))] hover:brightness-110",
          "text-[var(--tg-theme-button-text-color,hsl(var(--primary-foreground)))]",
          // Border for better definition
          "border border-white/20",
          // Subtle highlight for new notifications
          unreadCount > 0 && "ring-2 ring-primary/30",
          // Mobile optimizations
          "touch-manipulation select-none"
        )}
        style={{
          backgroundColor: themeParams?.button_color || undefined,
          color: themeParams?.button_text_color || undefined,
        }}
      >
        <Bell size={18} className="md:w-[22px] md:h-[22px] drop-shadow-sm" />
        
        {/* Unread count badge */}
        {unreadCount > 0 && (
          <div className={cn(
            "absolute -top-1 -right-1 min-w-[18px] h-[18px] md:min-w-[20px] md:h-5 px-1",
            "bg-destructive text-destructive-foreground",
            "rounded-full text-[10px] md:text-xs font-bold",
            "flex items-center justify-center",
            "border-2 border-background",
            "animate-scale-in"
          )}>
            {unreadCount > 99 ? '99+' : unreadCount}
          </div>
        )}
        
        {/* Subtle glow effect for active notifications */}
        {unreadCount > 0 && (
          <div className="absolute inset-0 rounded-full bg-[var(--tg-theme-button-color,hsl(var(--primary)))] opacity-20" />
        )}
      </Button>
    </div>
  );
}