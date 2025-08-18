
import React from 'react';
import { ChatHeader } from '@/components/chat/ChatHeader';
import { ChatMessages } from '@/components/chat/ChatMessages';
import { ChatInput } from '@/components/chat/ChatInput';
import { UserIsolationGuard } from '@/components/security/UserIsolationGuard';
import { useSecureChat } from '@/hooks/useSecureChat';
import { useSecureUser } from '@/contexts/SecureUserContext';
import { useTelegramWebApp } from '@/hooks/useTelegramWebApp';
import { Shield, Lock } from 'lucide-react';

export default function SecureChatPage() {
  const { messages, sendMessage, clearMessages, isLoading, user } = useSecureChat();
  const { currentUserId } = useSecureUser();
  const { webApp } = useTelegramWebApp();

  // Transform messages for ChatMessages component
  const transformedMessages = messages.map(msg => ({
    id: msg.id,
    content: msg.content,
    role: msg.role,
    user_id: msg.user_id,
    created_at: msg.created_at,
  }));

  // Use Telegram viewport height or fallback
  const viewportHeight = webApp?.viewportStableHeight || (typeof window !== 'undefined' ? window.innerHeight : 600);
  
  return (
    <UserIsolationGuard>
      <div 
        className="flex flex-col w-full mx-auto bg-background"
        style={{ height: `${viewportHeight}px` }}
      >
        {/* Security Header */}
        <div className="bg-green-50 border-b border-green-200 px-4 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-green-700">
              <Shield className="h-4 w-4" />
              <span>Secure Chat • User {currentUserId}</span>
            </div>
            <Lock className="h-4 w-4 text-green-600" />
          </div>
        </div>

        <ChatHeader 
          title="Secure Diamond Assistant" 
          subtitle="Your private AI consultant"
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
          
          {/* Fixed bottom input */}
          <div className="shrink-0 border-t border-border bg-background/95 backdrop-blur-sm">
            <div className="px-3 sm:px-4 pb-3 sm:pb-4 pt-3">
              <ChatInput onSendMessage={sendMessage} disabled={isLoading} />
            </div>
            <div className="h-safe-area-inset-bottom" />
          </div>
        </div>
      </div>
    </UserIsolationGuard>
  );
}
