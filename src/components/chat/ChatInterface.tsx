import { useState, useRef, useEffect } from "react";
import { Send, Mic, MicOff, Paperclip, Gem, User, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useTelegramHapticFeedback } from "@/hooks/useTelegramHapticFeedback";
import { useTelegramWebApp } from "@/hooks/useTelegramWebApp";
import { useChat } from "@/hooks/useChat";
import { ChatMessage } from "./ChatMessage";
import { DiamondSuggestions } from "./DiamondSuggestions";
import { formatCurrency } from "@/utils/numberUtils";

interface ChatInterfaceProps {
  className?: string;
}

export function ChatInterface({ className = "" }: ChatInterfaceProps) {
  const [message, setMessage] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const { impactOccurred } = useTelegramHapticFeedback();
  const { user } = useTelegramWebApp();
  const { 
    messages, 
    isLoading, 
    sendMessage, 
    suggestedDiamonds,
    isTyping 
  } = useChat();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSendMessage = async () => {
    if (!message.trim()) return;
    
    impactOccurred('light');
    await sendMessage(message);
    setMessage("");
    inputRef.current?.focus();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleVoiceToggle = () => {
    impactOccurred('medium');
    setIsRecording(!isRecording);
    // Voice recording functionality will be implemented later
  };

  const quickMessages = [
    "Show me round diamonds",
    "What's available under $10k?",
    "I need a 1+ carat diamond",
    "Show fancy colors",
    "Looking for investment grade"
  ];

  return (
    <div className={`flex flex-col h-full bg-background ${className}`}>
      {/* Chat Header */}
      <div className="flex items-center gap-3 p-4 border-b bg-card">
        <Avatar className="h-10 w-10">
          <AvatarImage src="/bot-avatar.png" />
          <AvatarFallback className="bg-primary text-primary-foreground">
            <Bot className="h-5 w-5" />
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <h3 className="font-semibold text-foreground">Diamond Assistant</h3>
          <p className="text-sm text-muted-foreground">
            AI-powered diamond expert
          </p>
        </div>
        <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-300">
          Online
        </Badge>
      </div>

      {/* Messages Area */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.length === 0 && (
            <div className="text-center py-8">
              <Gem className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h4 className="font-medium text-foreground mb-2">
                Welcome to Diamond Chat
              </h4>
              <p className="text-sm text-muted-foreground mb-4">
                Ask me anything about diamonds, get personalized recommendations, or browse our inventory.
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                {quickMessages.slice(0, 3).map((msg, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => setMessage(msg)}
                    className="text-xs"
                  >
                    {msg}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {messages.map((message) => (
            <ChatMessage
              key={message.id}
              message={message}
              user={user}
            />
          ))}

          {isTyping && (
            <div className="flex items-start gap-3">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary text-primary-foreground">
                  <Bot className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              <div className="bg-muted rounded-lg p-3 max-w-[80%]">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Diamond Suggestions */}
      {suggestedDiamonds.length > 0 && (
        <div className="border-t p-4">
          <DiamondSuggestions diamonds={suggestedDiamonds} />
        </div>
      )}

      {/* Quick Actions */}
      {messages.length === 0 && (
        <div className="p-4 border-t">
          <p className="text-xs text-muted-foreground mb-3">Quick actions:</p>
          <div className="flex flex-wrap gap-2">
            {quickMessages.map((msg, index) => (
              <Button
                key={index}
                variant="ghost"
                size="sm"
                onClick={() => setMessage(msg)}
                className="text-xs border border-border hover:bg-accent"
              >
                {msg}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="p-4 border-t bg-card">
        <div className="flex items-end gap-2">
          <div className="flex-1 relative">
            <Input
              ref={inputRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask about diamonds, prices, or availability..."
              className="pr-12 resize-none"
              disabled={isLoading}
            />
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
              onClick={() => {}} // Attachment functionality
            >
              <Paperclip className="h-4 w-4" />
            </Button>
          </div>
          
          <Button
            variant={isRecording ? "destructive" : "outline"}
            size="sm"
            onClick={handleVoiceToggle}
            className="h-10 w-10 p-0"
          >
            {isRecording ? (
              <MicOff className="h-4 w-4" />
            ) : (
              <Mic className="h-4 w-4" />
            )}
          </Button>
          
          <Button
            onClick={handleSendMessage}
            disabled={!message.trim() || isLoading}
            className="h-10 w-10 p-0"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        
        {isRecording && (
          <div className="mt-2 flex items-center gap-2 text-sm text-destructive">
            <div className="w-2 h-2 bg-destructive rounded-full animate-pulse"></div>
            Recording... Tap to stop
          </div>
        )}
      </div>
    </div>
  );
}