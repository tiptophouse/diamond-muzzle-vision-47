
import React, { useState, useEffect } from 'react';
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { ChatHeader } from './ChatHeader';
import { ChatMessages } from './ChatMessages';
import { ChatInput } from './ChatInput';
import { useChatSession } from '@/hooks/useChatSession';
import { useChatMessages } from '@/hooks/useChatMessages';

export const ChatContainer = () => {
  const { user } = useTelegramAuth();
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  
  const { 
    sessions, 
    createSession, 
    isLoading: sessionsLoading 
  } = useChatSession(user?.id || null);
  
  const { 
    messages, 
    addMessage, 
    isLoading: messagesLoading 
  } = useChatMessages(currentSessionId);

  useEffect(() => {
    if (sessions.length > 0 && !currentSessionId) {
      setCurrentSessionId(sessions[0].id);
    } else if (sessions.length === 0 && !sessionsLoading && user) {
      // Create initial session
      createSession('Diamond Assistant Chat').then((session) => {
        if (session) {
          setCurrentSessionId(session.id);
        }
      });
    }
  }, [sessions, currentSessionId, sessionsLoading, user, createSession]);

  const handleSendMessage = async (content: string) => {
    if (!currentSessionId || !user) return;
    
    await addMessage(content, 'user', user.id.toString());
    
    // Simulate AI response (you can replace this with actual AI integration)
    setTimeout(async () => {
      await addMessage(
        `I understand you're asking about: "${content}". As your diamond assistant, I'm here to help with inventory management, pricing, and diamond analysis. How can I assist you further?`,
        'assistant',
        'ai'
      );
    }, 1000);
  };

  return (
    <div className="flex flex-col h-full bg-white">
      <ChatHeader 
        title="Diamond Assistant"
        subtitle="AI-powered diamond expert"
      />
      
      <div className="flex-1 overflow-hidden">
        <ChatMessages 
          messages={messages}
          isLoading={messagesLoading}
          currentUserId={user?.id?.toString()}
        />
      </div>
      
      <ChatInput 
        onSendMessage={handleSendMessage}
        disabled={!currentSessionId || messagesLoading}
      />
    </div>
  );
};
