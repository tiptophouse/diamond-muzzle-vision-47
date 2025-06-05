
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface ChatQuickPromptsProps {
  onPromptClick: (prompt: string) => void;
}

const quickPrompts = [
  "How many diamonds do I have in my inventory?",
  "What's the total value of my stock?",
  "Show me my most expensive diamonds",
  "What's my average diamond price?",
  "Which shapes do I have the most of?",
  "Show me diamonds over 2 carats",
  "What's my inventory by color grade?",
  "Which diamonds have been in stock the longest?",
  "Show me my clarity distribution",
  "What's my price per carat range?",
  "Which diamonds are marked as 'Available'?",
  "Show me round diamonds only",
  "What fancy shapes do I have?",
  "Find diamonds with excellent cut grade",
  "Show me my fluorescence breakdown",
  "What's my polish and symmetry distribution?",
  "Which diamonds need price updates?",
  "Show me inventory trends this month",
  "Create a market analysis report",
  "What are my best performing diamond categories?",
  "Show me diamonds under $5,000",
  "Which color grades sell fastest?",
  "Compare my prices to market rates",
  "What's my inventory turnover rate?",
  "Show me diamonds with certificates",
  "Find diamonds suitable for engagement rings",
  "What's my profit margin analysis?",
  "Show me seasonal inventory trends",
  "Which diamonds should I promote?",
  "Create a pricing strategy recommendation"
];

export function ChatQuickPrompts({ onPromptClick }: ChatQuickPromptsProps) {
  return (
    <Card className="mb-4">
      <CardContent className="p-4">
        <h3 className="text-sm font-semibold mb-3 text-gray-700">Quick Questions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-60 overflow-y-auto">
          {quickPrompts.map((prompt, index) => (
            <Button
              key={index}
              variant="ghost"
              size="sm"
              className="text-left justify-start h-auto p-2 text-xs whitespace-normal"
              onClick={() => onPromptClick(prompt)}
            >
              {prompt}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
