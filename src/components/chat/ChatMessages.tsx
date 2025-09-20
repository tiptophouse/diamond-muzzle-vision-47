
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

  if (isLoading && messages.length === 0) {
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
    <div className="flex-1 overflow-y-auto">
      {messages.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full text-center p-8">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <span className="text-2xl">💎</span>
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Welcome to Diamond Assistant
          </h3>
          <p className="text-muted-foreground text-sm max-w-sm leading-relaxed">
            Ask me anything about diamonds, inventory management, pricing, or market insights. 
            Try one of the quick questions below to get started.
          </p>
        </div>
      ) : (
        <div className="p-4 space-y-6">
          {messages.map((message) => (
            <ChatMessage
              key={message.id}
              message={message}
              user={{ id: currentUserId }}
            />
          ))}
          {isLoading && (
            <div className="flex gap-3">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-sm">🤖</span>
              </div>
              <div className="flex flex-col space-y-2 flex-1">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                  <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
