
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Sparkles } from 'lucide-react';

interface ChatHeaderProps {
  title: string;
  subtitle?: string;
  isOnline?: boolean;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({ 
  title, 
  subtitle, 
  isOnline = true 
}) => {
  return (
    <div className="flex items-center gap-3 p-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-10">
      <Avatar className="h-10 w-10">
        <AvatarFallback className="bg-gradient-to-br from-diamond-500 to-purple-600 text-white">
          <Sparkles className="h-5 w-5" />
        </AvatarFallback>
      </Avatar>
      
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <h2 className="font-semibold text-foreground">{title}</h2>
          <Badge variant="secondary" className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse" />
            OpenAI Connected
          </Badge>
        </div>
        {subtitle && (
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        )}
      </div>
    </div>
  );
};
