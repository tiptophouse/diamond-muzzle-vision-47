
import React from 'react';
import { ChatHeader } from './ChatHeader';
import { ChatMessages } from './ChatMessages';
import { ChatInput } from './ChatInput';
import { ChatQuickPrompts } from './ChatQuickPrompts';
import { useOpenAIChat } from '@/hooks/useOpenAIChat';
import { useTelegramWebApp } from '@/hooks/useTelegramWebApp';

export function ChatContainer() {
  const { messages, sendMessage, isLoading, clearMessages, user } = useOpenAIChat();
  const { webApp } = useTelegramWebApp();

  // Transform ChatMessage to Message format expected by ChatMessages component
  const transformedMessages = messages.map(msg => ({
    id: msg.id,
    content: msg.content,
    role: msg.role,
    user_id: user?.id?.toString() || null,
    created_at: msg.timestamp,
  }));

  // Use Telegram viewport height or fallback to screen height
  const viewportHeight = webApp?.viewportStableHeight || (typeof window !== 'undefined' ? window.innerHeight : 600);
  
  return (
    <div 
      className="flex flex-col w-full mx-auto bg-background"
      style={{ height: `${viewportHeight}px` }}
    >
      <ChatHeader 
        title="Diamond Assistant" 
        subtitle="AI-powered diamond expert"
        onNewChat={clearMessages} 
      />
      
      <div className="flex-1 flex flex-col min-h-0 relative overflow-hidden">
        <div className="flex-1 min-h-0">
          <ChatMessages 
            messages={transformedMessages} 
            isLoading={isLoading} 
            currentUserId={user?.id?.toString()}
          />
        </div>
        
        {/* Fixed bottom section - always visible, no scrolling needed */}
        <div className="shrink-0 border-t border-border bg-background/95 backdrop-blur-sm">
          {/* Quick prompts - compact on mobile */}
          <div className="px-3 sm:px-4 pt-2 sm:pt-3">
            <ChatQuickPrompts onPromptClick={sendMessage} compact={true} />
          </div>
          
          {/* Input area - always accessible */}
          <div className="px-3 sm:px-4 pb-3 sm:pb-4 pt-1 sm:pt-2">
            <ChatInput onSendMessage={sendMessage} disabled={isLoading} />
          </div>
          
          {/* Safe area for iOS devices */}
          <div className="h-safe-area-inset-bottom" />
        </div>
      </div>
    </div>
  );
}
