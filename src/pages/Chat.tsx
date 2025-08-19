
import React, { useEffect } from 'react';
import { useEnhancedTelegramWebApp } from '@/hooks/useEnhancedTelegramWebApp';
import { ChatContainer } from '@/components/chat/ChatContainer';

export default function Chat() {
  const { navigation, isInitialized } = useEnhancedTelegramWebApp();

  useEffect(() => {
    if (!isInitialized) return;

    // Configure navigation for chat - no navigation buttons needed during chat
    navigation.hideBackButton();
    navigation.hideMainButton();

    return () => {
      // Cleanup not needed as we're hiding buttons
    };
  }, [isInitialized, navigation]);

  return <ChatContainer />;
}
