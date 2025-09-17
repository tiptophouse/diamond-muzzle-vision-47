import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ChatMessages } from './ChatMessages';
import { ChatInput } from './ChatInput';
import { AgentSelector } from './AgentSelector';
import { AgentQuickPrompts } from './AgentQuickPrompts';
import { useDiamondAgents, AgentType } from '@/hooks/useDiamondAgents';
import { useTelegramWebApp } from '@/hooks/useTelegramWebApp';

export function EnhancedChatContainer() {
  const { 
    messages, 
    sendMessage, 
    isLoading, 
    clearMessages, 
    currentAgent, 
    switchAgent, 
    getAgentContext,
    user 
  } = useDiamondAgents();
  
  const { webApp } = useTelegramWebApp();
  const [showAgentSelector, setShowAgentSelector] = useState(false);

  // Calculate container height considering Telegram viewport
  const containerHeight = webApp?.viewportHeight 
    ? `${webApp.viewportHeight - 120}px` 
    : 'calc(100vh - 120px)';

  // Transform messages for ChatMessages component
  const chatMessages = messages.map(msg => ({
    id: msg.id,
    role: msg.role,
    content: msg.content,
    user_id: msg.role === 'user' ? (user?.id?.toString() || null) : null,
    created_at: msg.timestamp
  }));

  const handleSendMessage = (content: string) => {
    sendMessage(content, currentAgent);
  };

  const handleQuickPrompt = (prompt: string, targetAgent?: AgentType) => {
    if (targetAgent && targetAgent !== currentAgent) {
      switchAgent(targetAgent);
    }
    sendMessage(prompt, targetAgent || currentAgent);
  };

  const currentAgentInfo = getAgentContext(currentAgent);

  return (
    <div 
      className="flex flex-col bg-background"
      style={{ height: containerHeight }}
    >
      {/* Agent Status Header */}
      <Card className="rounded-none border-l-0 border-r-0 border-t-0">
        <CardContent className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{currentAgentInfo.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-sm leading-tight truncate">
                    {currentAgentInfo.name}
                  </h3>
                  <Badge variant="outline" className="text-xs">
                    Active
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground leading-tight">
                  {currentAgentInfo.description}
                </p>
              </div>
            </div>

            <Dialog open={showAgentSelector} onOpenChange={setShowAgentSelector}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  Switch Agent
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Choose Diamond Expert</DialogTitle>
                </DialogHeader>
                <AgentSelector
                  currentAgent={currentAgent}
                  onAgentSelect={(agent) => {
                    switchAgent(agent);
                    setShowAgentSelector(false);
                  }}
                  isLoading={isLoading}
                />
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      {/* Chat Messages Area */}
      <div className="overflow-hidden">
        <ChatMessages 
          messages={chatMessages}
          isLoading={isLoading}
          currentUserId={user?.id?.toString()}
        />
      </div>

      <Separator />

      {/* Quick Actions for Current Agent */}
      <div className="p-3 bg-muted/20">
        <AgentQuickPrompts
          agentType={currentAgent}
          onPromptSelect={handleQuickPrompt}
          isLoading={isLoading}
        />
      </div>

      {/* Chat Input */}
      <div className="p-4 bg-background border-t">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs text-muted-foreground">
            Chatting with {currentAgentInfo.icon} {currentAgentInfo.name}
          </span>
          {messages.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearMessages}
              className="text-xs h-6 px-2"
            >
              Clear Chat
            </Button>
          )}
        </div>
        
        <ChatInput
          onSendMessage={handleSendMessage}
          disabled={isLoading}
        />
      </div>
    </div>
  );
}