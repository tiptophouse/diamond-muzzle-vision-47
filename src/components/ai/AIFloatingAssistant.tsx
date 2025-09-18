import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bot, MessageSquare, X, Sparkles, TrendingUp, AlertTriangle } from 'lucide-react';
import { useDiamondAgents, AGENT_TYPES } from '@/hooks/useDiamondAgents';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface AIFloatingAssistantProps {
  className?: string;
}

export function AIFloatingAssistant({ className }: AIFloatingAssistantProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const navigate = useNavigate();
  const { switchAgent, sendMessage } = useDiamondAgents();

  if (!isVisible) return null;

  const quickSuggestions = [
    {
      text: "📊 Show my inventory summary",
      agent: 'inventory' as const,
      prompt: "Give me a quick overview of my current inventory status and key metrics"
    },
    {
      text: "💰 Market pricing analysis",
      agent: 'pricing' as const,
      prompt: "Analyze current market pricing for my top diamonds and suggest optimizations"
    },
    {
      text: "🎯 Business intelligence report",
      agent: 'business_intelligence' as const,
      prompt: "Generate my daily business intelligence report with actionable insights"
    }
  ];

  const handleQuickAction = (suggestion: typeof quickSuggestions[0]) => {
    switchAgent(suggestion.agent);
    navigate('/diamond-agents');
    setTimeout(() => {
      sendMessage(suggestion.prompt, suggestion.agent);
    }, 500);
    setIsExpanded(false);
  };

  const handleOpenChat = () => {
    navigate('/diamond-agents');
    setIsExpanded(false);
  };

  return (
    <div className={cn("fixed bottom-6 right-6 z-50", className)}>
      {isExpanded ? (
        <Card className="w-80 shadow-2xl border-2 border-primary/20 bg-background/95 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-primary/20 rounded-full">
                  <Bot className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm">AI Assistant</h4>
                  <p className="text-xs text-muted-foreground">How can I help?</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(false)}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-2 mb-4">
              {quickSuggestions.map((suggestion, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  className="w-full justify-start text-left h-auto p-3 hover:bg-primary/5 hover:border-primary/30"
                  onClick={() => handleQuickAction(suggestion)}
                >
                  <span className="text-xs">{suggestion.text}</span>
                </Button>
              ))}
            </div>

            <div className="flex gap-2">
              <Button 
                onClick={handleOpenChat}
                className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
                size="sm"
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Open Chat
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsVisible(false)}
                className="px-3"
              >
                Hide
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Button
          onClick={() => setIsExpanded(true)}
          className="h-14 w-14 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-2xl hover:scale-110 transition-all duration-200"
          size="sm"
        >
          <div className="relative">
            <Bot className="h-6 w-6" />
            <div className="absolute -top-1 -right-1">
              <div className="h-3 w-3 bg-green-500 rounded-full animate-pulse" />
            </div>
          </div>
        </Button>
      )}
    </div>
  );
}