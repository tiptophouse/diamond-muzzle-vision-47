
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface ChatQuickPromptsProps {
  onPromptClick: (prompt: string) => void;
  compact?: boolean;
}

const quickPrompts = [
  "📊 How many diamonds do I have?",
  "💰 What's my total inventory value?",
  "💎 Show me my most expensive diamonds",
  "📈 What's my average diamond price?",
  "🔍 Which shapes do I have the most of?",
  "⚡ Show me diamonds over 2 carats",
  "🎨 What's my color grade distribution?",
  "📅 Which diamonds have been in stock longest?"
];

export function ChatQuickPrompts({ onPromptClick, compact = false }: ChatQuickPromptsProps) {
  if (compact) {
    return (
      <div className="mb-3">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {quickPrompts.slice(0, 4).map((prompt, index) => (
            <Button
              key={index}
              variant="outline"
              size="sm"
              className="flex-shrink-0 text-xs whitespace-nowrap rounded-full border-primary/20 text-primary hover:bg-primary/5"
              onClick={() => onPromptClick(prompt)}
            >
              {prompt}
            </Button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 border-b border-border">
      <h3 className="text-sm font-medium mb-3 text-muted-foreground">Quick Questions</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {quickPrompts.map((prompt, index) => (
          <Button
            key={index}
            variant="outline"
            size="sm"
            className="text-left justify-start h-auto p-3 text-xs whitespace-normal rounded-lg border-muted hover:bg-accent hover:border-primary/20"
            onClick={() => onPromptClick(prompt)}
          >
            {prompt}
          </Button>
        ))}
      </div>
    </div>
  );
}
