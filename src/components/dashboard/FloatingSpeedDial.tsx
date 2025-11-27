import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useTelegramHapticFeedback } from '@/hooks/useTelegramHapticFeedback';
import { Upload, Gavel, Share2, Plus, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export function FloatingSpeedDial() {
  const navigate = useNavigate();
  const { impactOccurred } = useTelegramHapticFeedback();
  const [isOpen, setIsOpen] = useState(false);

  const actions = [
    { 
      icon: Upload, 
      label: 'Upload Diamond', 
      route: '/upload', 
      color: 'bg-primary hover:bg-primary/90' 
    },
    { 
      icon: Gavel, 
      label: 'Create Auction', 
      route: '/auctions', 
      color: 'bg-blue-600 hover:bg-blue-700' 
    },
    { 
      icon: Share2, 
      label: 'Share to Group', 
      route: '/store', 
      color: 'bg-green-600 hover:bg-green-700' 
    },
  ];

  const handleToggle = () => {
    impactOccurred('light');
    setIsOpen(!isOpen);
  };

  const handleAction = (route: string) => {
    impactOccurred('medium');
    setIsOpen(false);
    navigate(route);
  };

  return (
    <div className="fixed bottom-20 right-4 z-40">
      {/* Speed dial actions */}
      <div 
        className={cn(
          "flex flex-col gap-3 mb-3 transition-all duration-300",
          isOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
        )}
      >
        {actions.map((action, index) => {
          const Icon = action.icon;
          return (
            <div
              key={action.label}
              className="flex items-center gap-3 animate-in slide-in-from-bottom-5"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <span className="bg-background/90 backdrop-blur-sm text-foreground text-sm px-3 py-2 rounded-lg shadow-lg border border-border/50 whitespace-nowrap">
                {action.label}
              </span>
              <Button
                onClick={() => handleAction(action.route)}
                size="icon"
                className={cn("h-12 w-12 rounded-full shadow-lg", action.color)}
              >
                <Icon className="h-5 w-5 text-white" />
              </Button>
            </div>
          );
        })}
      </div>

      {/* Main FAB */}
      <Button
        onClick={handleToggle}
        size="icon"
        className={cn(
          "h-14 w-14 rounded-full shadow-2xl transition-all duration-300",
          isOpen 
            ? "bg-destructive hover:bg-destructive/90 rotate-45" 
            : "bg-primary hover:bg-primary/90 scale-100 hover:scale-110"
        )}
      >
        {isOpen ? (
          <X className="h-6 w-6 text-white" />
        ) : (
          <Plus className="h-6 w-6 text-white" />
        )}
      </Button>
    </div>
  );
}
