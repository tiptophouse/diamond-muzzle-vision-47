
import React from 'react';
import { Button } from '@/components/ui/button';
import { RotateCcw, Settings, Diamond } from 'lucide-react';

interface ChatHeaderProps {
  title: string;
  subtitle?: string;
  onNewChat: () => void;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({ title, subtitle, onNewChat }) => {
  return (
    <div className="border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-10">
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
            <Diamond className="text-white h-4 w-4" />
          </div>
          <div>
            <h1 className="font-semibold text-foreground text-base">{title}</h1>
            {subtitle && (
              <p className="text-xs text-muted-foreground">{subtitle}</p>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onNewChat}
            className="text-muted-foreground hover:text-foreground"
          >
            <RotateCcw size={16} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-foreground"
          >
            <Settings size={16} />
          </Button>
        </div>
      </div>
    </div>
  );
};
