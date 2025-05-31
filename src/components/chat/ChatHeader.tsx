
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

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
    <div className="flex items-center gap-3 p-4 border-b bg-white sticky top-0 z-10">
      <Avatar className="h-10 w-10">
        <AvatarImage src="/placeholder.svg" />
        <AvatarFallback className="bg-blue-500 text-white">AI</AvatarFallback>
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
    </div>
  );
};
