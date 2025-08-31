
import React from 'react';
import { ChatContainer } from '@/components/chat/ChatContainer';
import { UnifiedLayout } from '@/components/layout/UnifiedLayout';
import { useUnifiedTelegramNavigation } from '@/hooks/useUnifiedTelegramNavigation';

const ChatPage = () => {
  // Clear any navigation buttons for chat page
  useUnifiedTelegramNavigation();

  return (
    <UnifiedLayout>
      <div className="w-full bg-background overflow-hidden">
        <ChatContainer />
      </div>
    </UnifiedLayout>
  );
};

export default ChatPage;
