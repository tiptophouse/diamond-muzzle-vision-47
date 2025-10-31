import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useExecutiveAgents, ExecutiveAgentType, EXECUTIVE_AGENT_TYPES } from '@/hooks/useExecutiveAgents';
import { Sparkles, Send, Trash2, TrendingUp, AlertCircle, Database } from 'lucide-react';

const QUICK_PROMPTS: Record<ExecutiveAgentType, string[]> = {
  cto: [
    "Analyze current system errors and their impact",
    "Review FastAPI performance with 27,000+ diamonds",
    "Identify technical debt and optimization opportunities",
    "Check database query performance issues",
    "Evaluate API response times and bottlenecks"
  ],
  ceo: [
    "What's our current revenue vs costs breakdown?",
    "Analyze user growth trends this month",
    "Calculate total inventory value from FastAPI data",
    "Show customer retention metrics",
    "Identify our most profitable user segments"
  ],
  marketing: [
    "Analyze diamond view patterns and engagement",
    "Which diamonds get the most shares?",
    "Review last campaign effectiveness",
    "Identify re-engagement opportunities",
    "Show conversion funnel drop-off points"
  ]
};

export function ExecutiveAgentsDashboard() {
  const {
    messages,
    sendMessage,
    isLoading,
    clearMessages,
    currentAgent,
    switchAgent,
    getAgentContext,
    availableAgents
  } = useExecutiveAgents();

  const [inputMessage, setInputMessage] = useState('');
  const agentContext = getAgentContext(currentAgent);

  const handleSendMessage = () => {
    if (inputMessage.trim()) {
      sendMessage(inputMessage, currentAgent);
      setInputMessage('');
    }
  };

  const handleQuickPrompt = (prompt: string) => {
    sendMessage(prompt, currentAgent);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-purple-500/5">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-2xl">Executive AI Agents</CardTitle>
              <CardDescription>
                Data-driven insights from logs, analytics, and 27,000+ diamonds via FastAPI
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Agent Tabs */}
      <Tabs value={currentAgent} onValueChange={(value) => switchAgent(value as ExecutiveAgentType)}>
        <TabsList className="grid w-full grid-cols-3">
          {Object.entries(availableAgents).map(([key, agent]) => (
            <TabsTrigger key={key} value={key} className="gap-2">
              <span className="text-lg">{agent.icon}</span>
              <span className="hidden sm:inline">{agent.name.split(' ')[0]}</span>
              <span className="sm:hidden">{agent.icon}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {/* Agent Details & Chat */}
        {Object.entries(availableAgents).map(([key, agent]) => (
          <TabsContent key={key} value={key} className="space-y-4">
            {/* Agent Info Card */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <span className="text-2xl">{agent.icon}</span>
                      {agent.name}
                    </CardTitle>
                    <CardDescription className="mt-1">{agent.description}</CardDescription>
                  </div>
                  <Badge variant="secondary">
                    <Database className="w-3 h-3 mr-1" />
                    Live Data
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" />
                      Expertise
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {agent.expertise.map((exp, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {exp}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      Data Sources
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {agent.dataAccess.map((source, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {source}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Prompts */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Quick Analysis Prompts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-2">
                  {QUICK_PROMPTS[key as ExecutiveAgentType].map((prompt, idx) => (
                    <Button
                      key={idx}
                      variant="outline"
                      size="sm"
                      className="justify-start h-auto py-2 px-3 text-xs text-left whitespace-normal"
                      onClick={() => handleQuickPrompt(prompt)}
                      disabled={isLoading}
                    >
                      {prompt}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Chat Area */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">Conversation</CardTitle>
                  {messages.length > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearMessages}
                      className="h-8"
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Clear
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Messages */}
                <ScrollArea className="h-[400px] pr-4">
                  {messages.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <Sparkles className="w-12 h-12 mx-auto mb-3 opacity-20" />
                      <p className="text-sm">Ask me anything about your business, systems, or marketing</p>
                      <p className="text-xs mt-1">I have access to real-time data from FastAPI and all logs</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[85%] rounded-lg px-4 py-2 ${
                              message.role === 'user'
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted'
                            }`}
                          >
                            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                            {message.metrics && Object.keys(message.metrics).length > 0 && (
                              <div className="mt-2 pt-2 border-t border-border/50">
                                <p className="text-xs opacity-70">
                                  📊 Data analyzed: {Object.keys(message.metrics).join(', ')}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                      {isLoading && (
                        <div className="flex justify-start">
                          <div className="max-w-[85%] rounded-lg px-4 py-2 bg-muted">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
                              <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:0.2s]" />
                              <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:0.4s]" />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </ScrollArea>

                {/* Input */}
                <div className="flex gap-2">
                  <Textarea
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder={`Ask ${agentContext.name} anything...`}
                    className="min-h-[60px] resize-none"
                    disabled={isLoading}
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!inputMessage.trim() || isLoading}
                    size="icon"
                    className="h-[60px] w-[60px]"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
