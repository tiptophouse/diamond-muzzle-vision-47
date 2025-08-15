
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TelegramLayout } from '@/components/layout/TelegramLayout';
import { ChatContainer } from '@/components/chat/ChatContainer';
import { MCPEnhancedChat } from '@/components/chat/MCPEnhancedChat';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Brain, MessageCircle } from 'lucide-react';
import { useTelegramWebApp } from '@/hooks/useTelegramWebApp';

export default function ChatPage() {
  const navigate = useNavigate();
  const { hapticFeedback, backButton } = useTelegramWebApp();
  const [useMCP, setUseMCP] = useState(false);

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
        {/* Chat Mode Selector */}
        <div className="shrink-0 p-4 border-b border-border bg-background">
          <div className="flex items-center justify-center gap-2">
            <Button
              variant={!useMCP ? "default" : "outline"}
              size="sm"
              onClick={() => setUseMCP(false)}
              className="flex items-center gap-2"
            >
              <MessageCircle className="h-4 w-4" />
              Standard Chat
            </Button>
            <Button
              variant={useMCP ? "default" : "outline"}
              size="sm"
              onClick={() => setUseMCP(true)}
              className="flex items-center gap-2"
            >
              <Brain className="h-4 w-4" />
              MCP Enhanced
              <Badge variant="secondary" className="text-xs">Beta</Badge>
            </Button>
          </div>
        </div>

        {/* Chat Interface */}
        <div className="flex-1 overflow-hidden">
          {useMCP ? (
            <div className="h-full p-4">
              <MCPEnhancedChat />
            </div>
          ) : (
            <ChatContainer />
          )}
        </div>
      </div>
    </TelegramLayout>
  );
}
