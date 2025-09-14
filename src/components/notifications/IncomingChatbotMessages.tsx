import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useChatbotMessageListener } from '@/hooks/useChatbotMessageListener';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { MessageCircle, User, Clock, Target, CheckCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { he } from 'date-fns/locale';

export function IncomingChatbotMessages() {
  const { 
    messages, 
    isLoading, 
    markAsProcessed, 
    getHighConfidenceMessages,
    getUnprocessedMessages 
  } = useChatbotMessageListener();

  const highConfidenceMessages = getHighConfidenceMessages();
  const unprocessedMessages = getUnprocessedMessages();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            טוען הודעות מהצ'אטבוט...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <MessageCircle className="h-4 w-4 text-muted-foreground" />
              <div className="ml-2">
                <p className="text-sm font-medium">סה"כ הודעות</p>
                <p className="text-2xl font-bold">{messages.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Target className="h-4 w-4 text-green-600" />
              <div className="ml-2">
                <p className="text-sm font-medium">ביטחון גבוה</p>
                <p className="text-2xl font-bold text-green-600">{highConfidenceMessages.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <CheckCircle className="h-4 w-4 text-orange-600" />
              <div className="ml-2">
                <p className="text-sm font-medium">לא מעובד</p>
                <p className="text-2xl font-bold text-orange-600">{unprocessedMessages.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Messages List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            הודעות נכנסות מהצ'אטבוט
          </CardTitle>
        </CardHeader>
        <CardContent>
          {messages.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>אין הודעות מהצ'אטבוט עדיין</p>
            </div>
          ) : (
            <ScrollArea className="h-[600px]">
              <div className="space-y-4">
                {messages.map((message, index) => (
                  <div key={message.id}>
                    <div className="flex items-start space-x-4 rtl:space-x-reverse">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                          <User className="h-5 w-5 text-primary" />
                        </div>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium text-foreground">
                              {message.sender_info.first_name}
                              {message.sender_info.last_name && ` ${message.sender_info.last_name}`}
                            </p>
                            {message.sender_info.username && (
                              <Badge variant="outline" className="text-xs">
                                @{message.sender_info.username}
                              </Badge>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Badge 
                              variant={message.confidence_score >= 0.7 ? "default" : 
                                     message.confidence_score >= 0.5 ? "secondary" : "outline"}
                            >
                              {Math.round(message.confidence_score * 100)}% ביטחון
                            </Badge>
                            
                            {message.processed && (
                              <Badge variant="outline" className="text-green-600">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                מעובד
                              </Badge>
                            )}
                          </div>
                        </div>
                        
                        <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                          <Clock className="h-3 w-3" />
                          {formatDistanceToNow(new Date(message.message_timestamp), { 
                            addSuffix: true, 
                            locale: he 
                          })}
                          {message.chat_title && (
                            <>
                              <span className="mx-1">•</span>
                              <span>{message.chat_title}</span>
                            </>
                          )}
                        </p>
                        
                        <div className="mt-2 p-3 bg-muted rounded-lg">
                          <p className="text-sm text-foreground">{message.message_text}</p>
                        </div>
                        
                        {message.parsed_data && message.parsed_data.keywords.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {message.parsed_data.keywords.map((keyword, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                {keyword}
                              </Badge>
                            ))}
                          </div>
                        )}
                        
                        {!message.processed && (
                          <div className="mt-3">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => markAsProcessed(message.id)}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              סמן כמעובד
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {index < messages.length - 1 && <Separator className="mt-4" />}
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
}