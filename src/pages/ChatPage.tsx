
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { TelegramLayout } from '@/components/layout/TelegramLayout';
import { ChatContainer } from '@/components/chat/ChatContainer';
import { useTelegramWebApp } from '@/hooks/useTelegramWebApp';

export default function ChatPage() {
  const navigate = useNavigate();
  const { hapticFeedback } = useTelegramWebApp();

  const handleBack = () => {
    hapticFeedback.impact('light');
    navigate(-1);
  };

  return (
    <TelegramLayout
      showBackButton={true}
      onBackClick={handleBack}
      title="AI Assistant"
      className="h-screen flex flex-col"
    >
      <div className="flex-1 overflow-hidden">
        <ChatContainer />
      </div>
    </TelegramLayout>
  );
}
