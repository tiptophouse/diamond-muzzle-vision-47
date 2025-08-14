
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { TelegramLayout } from '@/components/layout/TelegramLayout';
import { ChatContainer } from '@/components/chat/ChatContainer';
import { useTelegramWebApp } from '@/hooks/useTelegramWebApp';

export default function ChatPage() {
  const navigate = useNavigate();
  const { hapticFeedback, backButton } = useTelegramWebApp();

  const handleBack = () => {
    hapticFeedback.impact('light');
    navigate(-1);
  };

  // Configure back button for chat
  React.useEffect(() => {
    backButton.show(handleBack);
    return () => backButton.hide();
  }, [handleBack]);

  return (
    <TelegramLayout>
      <div className="flex-1 overflow-hidden h-screen flex flex-col">
        <ChatContainer />
      </div>
    </TelegramLayout>
  );
}
