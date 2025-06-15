
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Send, Sparkles, Heart, Diamond, Gem, ArrowLeft } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface FlowState {
  step: 'style_selection' | 'style_refinement' | 'customization' | 'design_generation' | 'final';
  selected_style?: 'classic' | 'vintage' | 'modern';
  selected_substyle?: string;
  preferences: {
    cut?: string;
    color?: string;
    clarity?: string;
    carat?: number;
    style?: 'classic' | 'vintage' | 'modern';
    substyle?: string;
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
    step: 'style_selection',
    preferences: {},
    generated_images: [],
  });
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);

  useEffect(() => {
    // Send welcome message
    const welcomeMessage: ChatMessage = {
      id: '1',
      role: 'assistant',
      content: "Welcome! I'm here to help you design your perfect engagement ring! ✨\n\nLet's start by choosing a style that speaks to you. Take a look at these three main styles:",
      timestamp: new Date().toISOString(),
    };
    setMessages([welcomeMessage]);
  }, []);

  const handleStyleSelection = (style: 'classic' | 'vintage' | 'modern') => {
    setFlowState(prev => ({ 
      ...prev, 
      selected_style: style, 
      step: 'style_refinement',
      preferences: { ...prev.preferences, style }
    }));

    const styleMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'assistant',
      content: `Perfect choice! ${style === 'classic' ? 'Classic' : style === 'vintage' ? 'Vintage' : 'Modern'} rings are beautiful! 💍\n\nNow let's get more specific. Here are some ${style} variations to help narrow down your perfect style:`,
      timestamp: new Date().toISOString(),
    };
    setMessages(prev => [...prev, styleMessage]);
  };

  const handleSubstyleSelection = (substyle: string) => {
    setFlowState(prev => ({ 
      ...prev, 
      selected_substyle: substyle,
      step: 'customization',
      preferences: { ...prev.preferences, substyle }
    }));

    const customizationMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'assistant',
      content: `Excellent choice! I love the ${substyle} style! ✨\n\nNow you can tell me exactly what you want to change or customize. You can say things like:\n• "Make the diamond bigger"\n• "Add more sparkle"\n• "Change the band to rose gold"\n• "Make it more delicate"\n\nWhat would you like to customize about your ring?`,
      timestamp: new Date().toISOString(),
    };
    setMessages(prev => [...prev, customizationMessage]);
  };

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

      if (error) throw error;

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

      // Generate ring image when ready
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

      if (error) throw error;

      if (data.image_url) {
        setGeneratedImage(data.image_url);
        
        const imageMessage: ChatMessage = {
          id: Date.now().toString(),
          role: 'assistant',
          content: `Here's your custom ring design! ✨ What do you think? You can ask me to make changes like "make it more sparkly" or "add vintage details" - I'll create a new version for you!`,
          timestamp: new Date().toISOString(),
        };
        
        setMessages(prev => [...prev, imageMessage]);
        setFlowState(prev => ({ ...prev, step: 'final' }));
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

  const getStyleOptions = () => {
    return [
      {
        id: 'classic',
        name: 'Classic',
        description: 'Timeless elegance with clean lines',
        image: '/placeholder.svg?text=Classic+Ring',
      },
      {
        id: 'vintage',
        name: 'Vintage',
        description: 'Romantic details with antique charm',
        image: '/placeholder.svg?text=Vintage+Ring',
      },
      {
        id: 'modern',
        name: 'Modern',
        description: 'Contemporary designs with unique flair',
        image: '/placeholder.svg?text=Modern+Ring',
      },
    ];
  };

  const getSubstyleOptions = () => {
    const style = flowState.selected_style;
    
    if (style === 'classic') {
      return [
        { id: 'solitaire', name: 'Classic Solitaire', description: 'Single stone perfection', image: '/placeholder.svg?text=Solitaire' },
        { id: 'three-stone', name: 'Three Stone', description: 'Past, present, future', image: '/placeholder.svg?text=Three+Stone' },
        { id: 'halo', name: 'Classic Halo', description: 'Center stone with sparkling frame', image: '/placeholder.svg?text=Classic+Halo' },
      ];
    } else if (style === 'vintage') {
      return [
        { id: 'art-deco', name: 'Art Deco', description: 'Geometric patterns and bold lines', image: '/placeholder.svg?text=Art+Deco' },
        { id: 'victorian', name: 'Victorian', description: 'Intricate details and romantic elements', image: '/placeholder.svg?text=Victorian' },
        { id: 'edwardian', name: 'Edwardian', description: 'Delicate filigree and lace-like patterns', image: '/placeholder.svg?text=Edwardian' },
      ];
    } else {
      return [
        { id: 'geometric', name: 'Geometric', description: 'Bold shapes and clean angles', image: '/placeholder.svg?text=Geometric' },
        { id: 'tension', name: 'Tension Setting', description: 'Diamond appears to float', image: '/placeholder.svg?text=Tension' },
        { id: 'asymmetric', name: 'Asymmetric', description: 'Unique and unexpected design', image: '/placeholder.svg?text=Asymmetric' },
      ];
    }
  };

  const goBackToStyleSelection = () => {
    setFlowState(prev => ({ 
      ...prev, 
      step: 'style_selection',
      selected_style: undefined,
      selected_substyle: undefined
    }));
  };

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-pink-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white border-b border-pink-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Diamond className="h-6 w-6 text-pink-600" />
            <div>
              <h1 className="text-lg font-semibold text-gray-900">Ring Design Assistant</h1>
              <p className="text-sm text-gray-500">Let's create your perfect ring</p>
            </div>
          </div>
          {flowState.step !== 'style_selection' && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={goBackToStyleSelection}
              className="border-pink-200 text-pink-700 hover:bg-pink-50"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
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

        {/* Style Selection Grid */}
        {flowState.step === 'style_selection' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              {getStyleOptions().map((style) => (
                <Card 
                  key={style.id}
                  className="cursor-pointer hover:shadow-lg transition-shadow border-pink-200 hover:border-pink-300"
                  onClick={() => handleStyleSelection(style.id as 'classic' | 'vintage' | 'modern')}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center">
                        <img 
                          src={style.image} 
                          alt={style.name}
                          className="w-16 h-16 object-cover rounded"
                        />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{style.name}</h3>
                        <p className="text-sm text-gray-600">{style.description}</p>
                      </div>
                      <div className="text-pink-500">
                        <Diamond className="h-5 w-5" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Substyle Selection Grid */}
        {flowState.step === 'style_refinement' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-3">
              {getSubstyleOptions().map((substyle) => (
                <Card 
                  key={substyle.id}
                  className="cursor-pointer hover:shadow-lg transition-shadow border-pink-200 hover:border-pink-300"
                  onClick={() => handleSubstyleSelection(substyle.name)}
                >
                  <CardContent className="p-3">
                    <div className="flex items-center gap-3">
                      <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                        <img 
                          src={substyle.image} 
                          alt={substyle.name}
                          className="w-12 h-12 object-cover rounded"
                        />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{substyle.name}</h4>
                        <p className="text-xs text-gray-600">{substyle.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

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
                  <span className="text-sm text-gray-600">Creating your design...</span>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Input - Only show during customization phase */}
      {flowState.step === 'customization' && (
        <div className="p-4 bg-white border-t border-pink-200">
          <div className="flex gap-2">
            <Input
              value={currentMessage}
              onChange={(e) => setCurrentMessage(e.target.value)}
              placeholder="Tell me what you'd like to customize..."
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
      )}
    </div>
  );
}
