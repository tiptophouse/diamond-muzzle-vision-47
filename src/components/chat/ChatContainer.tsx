
import React from 'react';
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { ChatHeader } from './ChatHeader';
import { ChatMessages } from './ChatMessages';
import { ChatInput } from './ChatInput';
import { useSmartChat } from '@/hooks/useSmartChat';

export const ChatContainer = () => {
  const { user } = useTelegramAuth();
  const { messages, sendMessage, isLoading, clearMessages } = useSmartChat();

  const handleSendMessage = async (content: string) => {
    await sendMessage(content);
  };

  const handleNewChat = () => {
    clearMessages();
  };

  return (
    <div className="flex flex-col h-full bg-background">
      <ChatHeader 
        title="Diamond Assistant"
        subtitle="AI-powered diamond expert with live inventory access"
        isOnline={true}
        onNewChat={handleNewChat}
      />
      
      <div className="flex-1 overflow-hidden">
        <ChatMessages 
          messages={messages.map(msg => ({
            id: msg.id,
            content: msg.content,
            role: msg.role,
            user_id: msg.role === 'user' ? user?.id?.toString() || null : 'ai',
            created_at: msg.timestamp,
          }))}
          isLoading={isLoading}
          currentUserId={user?.id?.toString()}
        />
      </div>
      
      <ChatInput 
        onSendMessage={handleSendMessage}
        disabled={isLoading}
      />
    </div>
  );
};
