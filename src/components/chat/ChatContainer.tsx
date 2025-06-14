
import React from 'react';
import { ChatHeader } from './ChatHeader';
import { ChatMessages } from './ChatMessages';
import { ChatInput } from './ChatInput';
import { ChatQuickPrompts } from './ChatQuickPrompts';
import { useOpenAIChat } from '@/hooks/useOpenAIChat';

export function ChatContainer() {
  const { messages, sendMessage, isLoading, clearMessages, user } = useOpenAIChat();

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto">
      <ChatHeader onClear={clearMessages} />
      
      <div className="flex-1 flex flex-col min-h-0">
        <ChatMessages messages={messages} isLoading={isLoading} />
        
        {messages.length === 0 && (
          <div className="px-4 pb-4">
            <ChatQuickPrompts onPromptSelect={sendMessage} />
          </div>
        )}
        
        <div className="px-4 pb-4">
          <ChatInput onSendMessage={sendMessage} isLoading={isLoading} />
        </div>
      </div>
    </div>
  );
}
