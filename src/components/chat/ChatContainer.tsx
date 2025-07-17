
import React from 'react';
import { ChatHeader } from './ChatHeader';
import { ChatMessages } from './ChatMessages';
import { ChatInput } from './ChatInput';
import { ChatQuickPrompts } from './ChatQuickPrompts';
import { useOpenAIChat } from '@/hooks/useOpenAIChat';

export function ChatContainer() {
  const { messages, sendMessage, isLoading, clearMessages, user } = useOpenAIChat();

  // Transform ChatMessage to Message format expected by ChatMessages component
  const transformedMessages = messages.map(msg => ({
    id: msg.id,
    content: msg.content,
    role: msg.role,
    user_id: user?.id?.toString() || null,
    created_at: msg.timestamp,
  }));

  return (
    <div 
      className="flex flex-col max-w-4xl mx-auto bg-background"
      style={{ 
        height: 'var(--tg-viewport-height, 100vh)',
        maxHeight: 'var(--tg-viewport-height, 100vh)'
      }}
    >
      <ChatHeader 
        title="Diamond Assistant" 
        subtitle="AI-powered diamond expert"
        onNewChat={clearMessages} 
      />
      
      <div className="flex-1 flex flex-col min-h-0 relative overflow-hidden">
        <div className="flex-1 overflow-auto">
          <ChatMessages 
            messages={transformedMessages} 
            isLoading={isLoading} 
            currentUserId={user?.id?.toString()}
          />
        </div>
        
        {/* Fixed bottom section for input and quick prompts */}
        <div className="border-t border-border bg-background shrink-0">
          {/* Always visible quick prompts */}
          <div className="px-4 pt-3">
            <ChatQuickPrompts onPromptClick={sendMessage} compact={true} />
          </div>
          
          {/* Input at the bottom */}
          <div className="px-4 pb-4 pt-2" style={{ paddingBottom: 'max(16px, var(--tg-safe-area-inset-bottom, 16px))' }}>
            <ChatInput onSendMessage={sendMessage} disabled={isLoading} />
          </div>
        </div>
      </div>
    </div>
  );
}
