import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sparkles, Send, RefreshCw, Copy, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useTelegramHapticFeedback } from '@/hooks/useTelegramHapticFeedback';

interface QuickReplyMessage {
  id: string;
  content: string;
  tone: 'professional' | 'friendly' | 'enthusiastic';
  type: 'introduction' | 'match_highlight' | 'call_to_action';
}

interface QuickReplyWithGPTProps {
  notification: {
    id: string;
    data?: {
      customer_info?: {
        telegram_id?: number;
        name?: string;
      };
      matches?: Array<{
        stock_number: string;
        shape: string;
        weight: number;
        color: string;
        clarity: string;
        price?: number;
        confidence_score?: number;
      }>;
      search_query?: string;
    };
  };
  onMessageSent?: () => void;
}

export function QuickReplyWithGPT({ notification, onMessageSent }: QuickReplyWithGPTProps) {
  const [messages, setMessages] = useState<QuickReplyMessage[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<string | null>(null);
  const { toast } = useToast();
  const { impactOccurred, notificationOccurred } = useTelegramHapticFeedback();

  const generateMessages = async () => {
    setIsGenerating(true);
    impactOccurred('light');
    
    try {
      const customerInfo = notification.data?.customer_info;
      const matches = notification.data?.matches || [];
      const searchQuery = notification.data?.search_query;
      const bestMatch = matches[0];

      const { data, error } = await supabase.functions.invoke('generate-conversation-starter', {
        body: {
          customerInfo: {
            customerName: customerInfo?.name || 'Client',
            telegramId: customerInfo?.telegram_id,
            searchQuery,
            diamonds: matches.slice(0, 3), // Send top 3 matches
          },
          language: 'en'
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      const generatedMessages: QuickReplyMessage[] = data.conversationStarters.map((starter: any, index: number) => ({
        id: `msg_${index}`,
        content: starter.message,
        tone: starter.tone,
        type: starter.type
      }));

      setMessages(generatedMessages);
      notificationOccurred('success');
    } catch (error) {
      console.error('Failed to generate messages:', error);
      toast({
        title: "Generation Failed",
        description: "Could not generate quick replies. Please try again.",
        variant: "destructive",
      });
      notificationOccurred('error');
    } finally {
      setIsGenerating(false);
    }
  };

  const sendMessage = async (messageContent: string) => {
    if (!notification.data?.customer_info?.telegram_id) {
      toast({
        title: "Cannot Send Message",
        description: "Customer Telegram ID is missing.",
        variant: "destructive",
      });
      return;
    }

    setIsSending(true);
    impactOccurred('medium');

    try {
      const { data, error } = await supabase.functions.invoke('send-individual-message', {
        body: {
          telegramId: notification.data.customer_info.telegram_id,
          message: messageContent
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      console.log('✅ Message sent via Telegram bot:', data);

      toast({
        title: "✅ Message Sent",
        description: "Message delivered successfully via Telegram",
      });
      
      notificationOccurred('success');
      onMessageSent?.();
    } catch (error) {
      console.error('Failed to send message:', error);
      toast({
        title: "❌ Send Failed",
        description: error instanceof Error ? error.message : "Could not send message. Please try again.",
        variant: "destructive",
      });
      notificationOccurred('error');
    } finally {
      setIsSending(false);
    }
  };

  const copyToClipboard = (content: string) => {
    navigator.clipboard.writeText(content);
    impactOccurred('light');
    toast({
      title: "Copied!",
      description: "Message copied to clipboard",
    });
  };

  const getToneBadgeColor = (tone: string) => {
    switch (tone) {
      case 'professional': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'friendly': return 'bg-green-100 text-green-800 border-green-200';
      case 'enthusiastic': return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const customerInfo = notification.data?.customer_info;
  const matches = notification.data?.matches || [];
  const bestMatch = matches[0];

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Sparkles className="h-4 w-4 text-blue-500" />
          Quick Reply with AI
        </CardTitle>
        {customerInfo && (
          <div className="text-sm text-muted-foreground">
            Send to: <span className="font-medium">{customerInfo.name || 'Customer'}</span>
            {bestMatch && (
              <span className="block text-xs mt-1">
                Best match: {bestMatch.shape} {bestMatch.weight}ct {bestMatch.color} {bestMatch.clarity}
              </span>
            )}
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Generate Messages Button */}
        {messages.length === 0 && (
          <Button
            onClick={generateMessages}
            disabled={isGenerating}
            className="w-full"
            size="sm"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Generate Quick Replies
              </>
            )}
          </Button>
        )}

        {/* Generated Messages */}
        {messages.length > 0 && (
          <ScrollArea className="h-64">
            <div className="space-y-3">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`p-3 border rounded-lg cursor-pointer transition-all ${
                    selectedMessage === message.id 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-border hover:bg-muted/30'
                  }`}
                  onClick={() => setSelectedMessage(message.id)}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <Badge className={getToneBadgeColor(message.tone)}>
                      {message.tone}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        copyToClipboard(message.content);
                      }}
                      className="h-6 w-6 p-0"
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                  <p className="text-sm text-foreground leading-relaxed">
                    {message.content}
                  </p>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}

        {/* Action Buttons */}
        {messages.length > 0 && (
          <div className="flex gap-2">
            <Button
              onClick={generateMessages}
              variant="outline"
              size="sm"
              disabled={isGenerating}
              className="flex-1"
            >
              {isGenerating ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
            </Button>
            <Button
              onClick={() => {
                const message = messages.find(m => m.id === selectedMessage);
                if (message) {
                  sendMessage(message.content);
                }
              }}
              disabled={!selectedMessage || isSending}
              className="flex-1"
              size="sm"
            >
              {isSending ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Send Selected
                </>
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}