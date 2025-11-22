import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useIsAdmin } from '@/hooks/useIsAdmin';
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { cn } from '@/lib/utils';

interface FloatingAdminButtonProps {
  className?: string;
}

export function FloatingAdminButton({ className }: FloatingAdminButtonProps) {
  const { isAdmin, loading } = useIsAdmin();
  const { user } = useTelegramAuth();
  const navigate = useNavigate();
  const [isPressed, setIsPressed] = useState(false);

  // Debug logging
  console.log('🔍 FloatingAdminButton Debug:', {
    isAdmin,
    loading,
    userId: user?.id,
    userFirstName: user?.first_name
  });

  if (loading || !isAdmin) {
    return null;
  }

  const handleClick = () => {
    console.log('🚀 Admin button clicked, navigating to /admin');
    navigate('/admin');
  };

  return (
    <div className={cn("fixed z-40 pointer-events-none", className)}>
      <Button
        onClick={handleClick}
        onMouseDown={() => setIsPressed(true)}
        onMouseUp={() => setIsPressed(false)}
        onMouseLeave={() => setIsPressed(false)}
        size="lg"
        variant="secondary"
        className={cn(
          // Base styling with admin-specific colors
          "relative h-12 w-12 md:h-14 md:w-14 rounded-full shadow-lg hover:shadow-xl pointer-events-auto",
          "transition-all duration-200 hover:scale-105 active:scale-95",
          // Admin theme colors
          "bg-orange-500 hover:bg-orange-600 text-white",
          "border-2 border-orange-400/50",
          // Animation and mobile optimizations
          "touch-manipulation select-none",
          // Pressed state
          isPressed && "scale-95 shadow-md",
          // Subtle glow effect
          "hover:shadow-orange-500/30"
        )}
        title="Admin Panel"
      >
        <Shield size={18} className="md:w-[22px] md:h-[22px] drop-shadow-sm" />
        
        {/* Admin indicator dot */}
        <div className={cn(
          "absolute -top-1 -right-1 w-4 h-4 md:w-5 md:h-5",
          "bg-green-500 text-white",
          "rounded-full text-[8px] md:text-[10px] font-bold",
          "flex items-center justify-center",
          "border-2 border-white",
          "animate-pulse"
        )}>
          <Settings size={8} className="md:w-[10px] md:h-[10px]" />
        </div>
      </Button>
    </div>
  );
}