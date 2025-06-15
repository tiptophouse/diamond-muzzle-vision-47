
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Send, Sparkles, Heart, Diamond, Gem } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface FlowState {
  step: 'welcome' | 'education' | 'budget' | 'style_selection' | 'design_generation' | 'refinement' | 'final';
  education_progress: {
    cut: boolean;
    color: boolean;
    clarity: boolean;
    carat: boolean;
  };
  budget?: number;
  preferences: {
    cut?: string;
    color?: string;
    clarity?: string;
    carat?: number;
    style?: 'classic' | 'vintage' | 'modern';
  };
  generated_images: string[];
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export function DiamondEducationFlow() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [flowState, setFlowState] = useState<FlowState>({
    step: 'welcome',
    education_progress: {
      cut: false,
      color: false,
      clarity: false,
      carat: false,
    },
    preferences: {},
    generated_images: [],
  });
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);

  useEffect(() => {
    // Send welcome message
    const welcomeMessage: ChatMessage = {
      id: '1',
      role: 'assistant',
      content: "Hi there! 👋 I'm your personal diamond expert, and I'm excited to help you learn about diamonds and design your perfect engagement ring! \n\nLet's start with the basics - the 4Cs of diamonds: Cut, Color, Clarity, and Carat. These determine a diamond's beauty and value.\n\nWhat would you like to learn about first? Or do you have a budget in mind? 💎",
      timestamp: new Date().toISOString(),
    };
    setMessages([welcomeMessage]);
  }, []);

  const sendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: content.trim(),
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setCurrentMessage('');
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('ring-design-chat', {
        body: {
          message: content,
          flow_state: flowState,
        },
      });

      if (error) {
        throw error;
      }

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response,
        timestamp: new Date().toISOString(),
      };

      setMessages(prev => [...prev, assistantMessage]);
      
      if (data.flow_state) {
        setFlowState(data.flow_state);
      }

      // Check if we should generate a ring image
      if (data.flow_state?.step === 'design_generation' && !generatedImage) {
        await generateRingImage(data.flow_state);
      }

    } catch (error) {
      console.error('Error sending message:', error);
      
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I'm having a little trouble right now, but I'm still here to help! Could you try asking your question again? 😊",
        timestamp: new Date().toISOString(),
      };
      
      setMessages(prev => [...prev, errorMessage]);
      
      toast({
        title: "Connection Issue",
        description: "I had trouble processing that. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const generateRingImage = async (state: FlowState) => {
    try {
      const { data, error } = await supabase.functions.invoke('ring-design-chat', {
        body: {
          action: 'generate_ring_image',
          flow_state: state,
        },
      });

      if (error) {
        throw error;
      }

      if (data.image_url) {
        setGeneratedImage(data.image_url);
        
        const imageMessage: ChatMessage = {
          id: Date.now().toString(),
          role: 'assistant',
          content: `Here's your custom ring design! ✨ What do you think? You can ask me to make changes like "make it more sparkly" or "add vintage details" - I'll create a new version for you!`,
          timestamp: new Date().toISOString(),
        };
        
        setMessages(prev => [...prev, imageMessage]);
        setFlowState(prev => ({ ...prev, step: 'refinement' }));
      }

    } catch (error) {
      console.error('Error generating ring image:', error);
      toast({
        title: "Image Generation Failed",
        description: "I had trouble creating your ring design. Let me try again in a moment.",
        variant: "destructive",
      });
    }
  };

  const getProgressSteps = () => {
    const steps = [
      { key: 'cut', label: 'Cut', completed: flowState.education_progress.cut },
      { key: 'color', label: 'Color', completed: flowState.education_progress.color },
      { key: 'clarity', label: 'Clarity', completed: flowState.education_progress.clarity },
      { key: 'carat', label: 'Carat', completed: flowState.education_progress.carat },
    ];
    return steps;
  };

  const handleQuickAction = (action: string) => {
    sendMessage(action);
  };

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-pink-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white border-b border-pink-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Diamond className="h-6 w-6 text-pink-600" />
            <div>
              <h1 className="text-lg font-semibold text-gray-900">Diamond Learning Journey</h1>
              <p className="text-sm text-gray-500">Your personal diamond expert</p>
            </div>
          </div>
          {flowState.step === 'education' && (
            <div className="flex gap-1">
              {getProgressSteps().map((step) => (
                <div
                  key={step.key}
                  className={`w-3 h-3 rounded-full ${
                    step.completed ? 'bg-pink-500' : 'bg-gray-200'
                  }`}
                  title={step.label}
                />
              ))}
            </div>
          )}
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
                ? 'bg-pink-500 text-white' 
                : 'bg-white border-pink-200'
            }`}>
              <CardContent className="p-3">
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              </CardContent>
            </Card>
          </div>
        ))}

        {/* Generated Ring Image */}
        {generatedImage && (
          <div className="flex justify-center">
            <Card className="max-w-md">
              <CardContent className="p-4">
                <img 
                  src={generatedImage} 
                  alt="Your custom ring design"
                  className="w-full rounded-lg shadow-lg"
                />
                <p className="text-sm text-gray-600 mt-2 text-center">
                  Your Custom Ring Design ✨
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {isLoading && (
          <div className="flex justify-start">
            <Card className="bg-white border-pink-200">
              <CardContent className="p-3">
                <div className="flex items-center gap-2">
                  <div className="animate-spin">💎</div>
                  <span className="text-sm text-gray-600">Thinking...</span>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      {flowState.step === 'welcome' && (
        <div className="p-4 bg-white border-t border-pink-200">
          <div className="grid grid-cols-2 gap-2 mb-4">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => handleQuickAction("Tell me about diamond cut")}
              className="border-pink-200 text-pink-700 hover:bg-pink-50"
            >
              <Gem className="h-4 w-4 mr-1" />
              Learn Cut
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => handleQuickAction("What's my budget options?")}
              className="border-pink-200 text-pink-700 hover:bg-pink-50"
            >
              <Heart className="h-4 w-4 mr-1" />
              Budget Guide
            </Button>
          </div>
        </div>
      )}

      {/* Style Selection */}
      {flowState.step === 'style_selection' && !flowState.preferences.style && (
        <div className="p-4 bg-white border-t border-pink-200">
          <p className="text-sm text-gray-600 mb-3">Choose your ring style:</p>
          <div className="grid grid-cols-3 gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => handleQuickAction("I love classic style")}
              className="border-pink-200 text-pink-700 hover:bg-pink-50"
            >
              Classic
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => handleQuickAction("I prefer vintage style")}
              className="border-pink-200 text-pink-700 hover:bg-pink-50"
            >
              Vintage
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => handleQuickAction("I want modern style")}
              className="border-pink-200 text-pink-700 hover:bg-pink-50"
            >
              Modern
            </Button>
          </div>
        </div>
      )}

      {/* Input */}
      <div className="p-4 bg-white border-t border-pink-200">
        <div className="flex gap-2">
          <Input
            value={currentMessage}
            onChange={(e) => setCurrentMessage(e.target.value)}
            placeholder="Ask me anything about diamonds..."
            onKeyPress={(e) => e.key === 'Enter' && sendMessage(currentMessage)}
            disabled={isLoading}
            className="border-pink-200 focus:border-pink-400"
          />
          <Button 
            onClick={() => sendMessage(currentMessage)}
            disabled={isLoading || !currentMessage.trim()}
            className="bg-pink-500 hover:bg-pink-600"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
