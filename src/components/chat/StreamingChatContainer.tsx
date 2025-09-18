import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { ChatMessages } from './ChatMessages';
import { ChatInput } from './ChatInput';
import { AgentSelector } from './AgentSelector';
import { AgentQuickPrompts } from './AgentQuickPrompts';
import { useAGUIClient, AgentType } from '@/hooks/useAGUIClient';
import { useTelegramWebApp } from '@/hooks/useTelegramWebApp';
import { Sparkles, Square, Wifi, WifiOff, Brain } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Enhanced chat container with AG-UI streaming support
 * Optimized for Telegram Mini App with mobile-first design
 */
export function StreamingChatContainer() {
  const { 
    messages, 
    sendMessage, 
    isStreaming,
    isConnected,
    agentThinking,
    clearMessages, 
    currentAgent, 
    switchAgent, 
    stopStreaming,
    getAgentContext,
    user 
  } = useAGUIClient();
  
  const { webApp } = useTelegramWebApp();
  const [showAgentSelector, setShowAgentSelector] = useState(false);
  const [streamingProgress, setStreamingProgress] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Simulate streaming progress for UI feedback
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isStreaming) {
      setStreamingProgress(0);
      interval = setInterval(() => {
        setStreamingProgress(prev => {
          if (prev >= 90) return prev;
          return prev + Math.random() * 10;
        });
      }, 200);
    } else {
      setStreamingProgress(100);
      setTimeout(() => setStreamingProgress(0), 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isStreaming]);

  // Calculate container height for Telegram viewport
  const containerHeight = webApp?.viewportHeight 
    ? `${webApp.viewportHeight - 120}px` 
    : 'calc(100vh - 120px)';

  // Transform messages for ChatMessages component
  const chatMessages = messages.map(msg => ({
    id: msg.id,
    role: msg.role,
    content: msg.content,
    user_id: msg.role === 'user' ? (user?.id?.toString() || null) : null,
    created_at: msg.timestamp,
    isStreaming: msg.isStreaming,
    complete: msg.complete,
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
      className="flex flex-col bg-background telegram-chat-container"
      style={{ height: containerHeight }}
    >
      {/* Enhanced Agent Status Header */}
      <Card className="rounded-none border-l-0 border-r-0 border-t-0 bg-gradient-to-r from-primary/5 to-purple-500/5">
        <CardContent className="px-4 py-3">
          {/* Connection & Streaming Status */}
          {(isStreaming || !isConnected) && (
            <div className="mb-3">
              {isStreaming && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 text-primary">
                      <Sparkles className="w-3 h-3 animate-spin" />
                      <span>AI Agent responding...</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={stopStreaming}
                      className="h-6 px-2 text-xs"
                    >
                      <Square className="w-3 h-3 mr-1" />
                      Stop
                    </Button>
                  </div>
                  {streamingProgress > 0 && (
                    <Progress value={streamingProgress} className="h-1" />
                  )}
                </div>
              )}
              
              {!isConnected && (
                <div className="flex items-center gap-2 text-xs text-destructive">
                  <WifiOff className="w-3 h-3" />
                  <span>Connection lost - Reconnecting...</span>
                </div>
              )}
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <span className="text-2xl">{currentAgentInfo.icon}</span>
                {agentThinking && (
                  <div className="absolute -top-1 -right-1">
                    <Brain className="w-3 h-3 text-primary animate-pulse" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-sm leading-tight truncate">
                    {currentAgentInfo.name}
                  </h3>
                  <div className="flex items-center gap-1">
                    <Badge variant={isConnected ? "default" : "destructive"} className="text-xs">
                      {isConnected ? (
                        <>
                          <Wifi className="w-3 h-3 mr-1" />
                          Active
                        </>
                      ) : (
                        <>
                          <WifiOff className="w-3 h-3 mr-1" />
                          Offline
                        </>
                      )}
                    </Badge>
                    {agentThinking && (
                      <Badge variant="secondary" className="text-xs animate-pulse">
                        Thinking
                      </Badge>
                    )}
                  </div>
                </div>
                <p className="text-xs text-muted-foreground leading-tight">
                  {currentAgentInfo.description}
                </p>
              </div>
            </div>

            <Dialog open={showAgentSelector} onOpenChange={setShowAgentSelector}>
              <DialogTrigger asChild>
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="min-h-[48px] px-4 telegram-button"
                  disabled={isStreaming}
                >
                  Switch Agent
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md mx-4 telegram-dialog">
                <DialogHeader>
                  <DialogTitle className="text-lg">Choose Diamond Expert</DialogTitle>
                </DialogHeader>
                <AgentSelector
                  currentAgent={currentAgent}
                  onAgentSelect={(agent) => {
                    switchAgent(agent);
                    setShowAgentSelector(false);
                  }}
                  isLoading={isStreaming}
                />
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Chat Messages Area */}
      <div className="flex-1 overflow-hidden">
        <ChatMessages 
          messages={chatMessages}
          isLoading={isStreaming}
          currentUserId={user?.id?.toString()}
        />
        <div ref={messagesEndRef} />
      </div>

      <Separator />

      {/* Quick Actions for Current Agent */}
      <div className="p-3 bg-muted/20">
        <AgentQuickPrompts
          agentType={currentAgent}
          onPromptSelect={handleQuickPrompt}
          isLoading={isStreaming}
        />
      </div>

      {/* Enhanced Chat Input */}
      <div className="p-4 bg-background border-t">
        <div className="flex items-center gap-2 mb-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              Chatting with {currentAgentInfo.icon} {currentAgentInfo.name}
            </span>
            {isConnected && (
              <Badge variant="outline" className="text-xs">
                <Wifi className="w-3 h-3 mr-1" />
                Live
              </Badge>
            )}
          </div>
          
          {messages.length > 0 && (
            <Button
              variant="ghost"
              size="default"
              onClick={clearMessages}
              disabled={isStreaming}
              className="text-sm min-h-[44px] px-3 ml-auto telegram-button"
            >
              Clear Chat
            </Button>
          )}
        </div>
        
        <ChatInput
          onSendMessage={handleSendMessage}
          disabled={isStreaming || !isConnected}
          placeholder={
            isStreaming 
              ? "AI is responding..." 
              : !isConnected 
                ? "Reconnecting..." 
                : `Ask ${currentAgentInfo.name} anything...`
          }
        />

        {/* Streaming Indicator */}
        {isStreaming && (
          <div className="mt-2 flex items-center justify-center">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <div className="flex gap-1">
                <div className="w-1 h-1 bg-primary rounded-full animate-bounce" />
                <div className="w-1 h-1 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                <div className="w-1 h-1 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
              </div>
              <span>Generating response with AG-UI protocol...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}