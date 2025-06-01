
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface ChatHeaderProps {
  title: string;
  subtitle?: string;
  isOnline?: boolean;
  onNewChat?: () => void;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({ 
  title, 
  subtitle, 
  isOnline = true,
  onNewChat 
}) => {
  return (
    <div className="flex items-center gap-3 p-4 border-b bg-white sticky top-0 z-10">
      <Avatar className="h-10 w-10">
        <AvatarImage src="/placeholder.svg" />
        <AvatarFallback className="bg-blue-500 text-white">💎</AvatarFallback>
      </Avatar>
      
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <h2 className="font-semibold text-gray-900">{title}</h2>
          {isOnline && (
            <Badge variant="secondary" className="bg-green-100 text-green-700 text-xs">
              Online
            </Badge>
          )}
        </div>
        {subtitle && (
          <p className="text-sm text-gray-500">{subtitle}</p>
        )}
      </div>

      {onNewChat && (
        <Button
          variant="outline"
          size="sm"
          onClick={onNewChat}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          New Chat
        </Button>
      )}
    </div>
  );
};
