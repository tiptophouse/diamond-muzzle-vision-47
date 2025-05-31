
import React, { useEffect, useRef } from 'react';
import { ChatMessage } from './ChatMessage';
import { Skeleton } from '@/components/ui/skeleton';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  user_id: string | null;
  created_at: string;
}

interface ChatMessagesProps {
  messages: Message[];
  isLoading: boolean;
  currentUserId?: string;
}

export const ChatMessages: React.FC<ChatMessagesProps> = ({ 
  messages, 
  isLoading, 
  currentUserId 
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  if (isLoading) {
    return (
      <div className="flex-1 p-4 space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-16 w-3/4" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full text-center">
          <div className="text-6xl mb-4">💎</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Welcome to Diamond Assistant
          </h3>
          <p className="text-gray-500 max-w-sm">
            Ask me anything about diamonds, inventory management, pricing, or market insights.
          </p>
        </div>
      ) : (
        <>
          {messages.map((message) => (
            <ChatMessage
              key={message.id}
              message={message}
              isOwnMessage={message.user_id === currentUserId}
            />
          ))}
          <div ref={messagesEndRef} />
        </>
      )}
    </div>
  );
};
