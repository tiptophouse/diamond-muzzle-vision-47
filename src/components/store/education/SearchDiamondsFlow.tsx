
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Send, ArrowLeft } from "lucide-react";

interface SearchDiamondsFlowProps {
  onBack: () => void;
}

export function SearchDiamondsFlow({ onBack }: SearchDiamondsFlowProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [messages, setMessages] = useState([
    {
      id: '1',
      role: 'assistant' as const,
      content: '🔍 Search Diamonds\n\nHere you can write the diamond you\'re looking for. 💎\n\nNow you can look for diamonds 💎 in natural language 🌐. You can type whatever you want ✍️',
      timestamp: new Date().toISOString(),
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    const userMessage = {
      id: Date.now().toString(),
      role: 'user' as const,
      content: searchQuery,
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setSearchQuery('');
    setIsLoading(true);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse = {
        id: (Date.now() + 1).toString(),
        role: 'assistant' as const,
        content: `I'm searching for diamonds matching: "${userMessage.content}"\n\n💎 Let me find the perfect diamonds for you! This will connect you with our diamond exchange members who have matching stones.\n\n*Please note that we only trust GIA certificates that truly reflect what is inside the diamonds and provide the actual data.*\n\nFor any questions, feel free to contact us:\n📞 Phone: +972548081663\n🕒 Business hours: Sunday-Thursday between 9:00-17:00`,
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, aiResponse]);
      setIsLoading(false);
    }, 1500);
  };

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-blue-50 via-white to-blue-50">
      {/* Header */}
      <div className="bg-white border-b border-blue-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="text-2xl">🔍</div>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">Search Diamonds</h1>
              <p className="text-sm text-gray-500">Natural language diamond search</p>
            </div>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={onBack}
            className="border-blue-200 text-blue-700 hover:bg-blue-50"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <Card className={`max-w-[80%] ${
              message.role === 'user' 
                ? 'bg-blue-500 text-white' 
                : 'bg-white border-blue-200'
            }`}>
              <CardContent className="p-3">
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              </CardContent>
            </Card>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <Card className="bg-white border-blue-200">
              <CardContent className="p-3">
                <div className="flex items-center gap-2">
                  <div className="animate-spin">💎</div>
                  <span className="text-sm text-gray-600">Searching for diamonds...</span>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-4 bg-white border-t border-blue-200">
        <div className="flex gap-2">
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Describe the diamond you're looking for..."
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            disabled={isLoading}
            className="border-blue-200 focus:border-blue-400"
          />
          <Button 
            onClick={handleSearch}
            disabled={isLoading || !searchQuery.trim()}
            className="bg-blue-500 hover:bg-blue-600"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
