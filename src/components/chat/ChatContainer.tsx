
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
    user_id: user?.id || null,
    created_at: msg.timestamp,
  }));

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto">
      <ChatHeader 
        title="Diamond Assistant" 
        subtitle="Your AI-powered diamond expert"
        onNewChat={clearMessages} 
      />
      
      <div className="flex-1 flex flex-col min-h-0">
        <ChatMessages 
          messages={transformedMessages} 
          isLoading={isLoading} 
          currentUserId={user?.id}
        />
        
        {messages.length === 0 && (
          <div className="px-4 pb-4">
            <ChatQuickPrompts onPromptClick={sendMessage} />
          </div>
        )}
        
        <div className="px-4 pb-4">
          <ChatInput onSendMessage={sendMessage} disabled={isLoading} />
        </div>
      </div>
    </div>
  );
}
