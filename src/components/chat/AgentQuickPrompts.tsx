import React from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AgentType } from '@/hooks/useDiamondAgents';

interface QuickPrompt {
  text: string;
  prompt: string;
  targetAgent?: AgentType;
  icon?: string;
}

interface AgentQuickPromptsProps {
  agentType: AgentType;
  onPromptSelect: (prompt: string, targetAgent?: AgentType) => void;
  isLoading: boolean;
}

const QUICK_PROMPTS: Record<AgentType, QuickPrompt[]> = {
  main: [
    {
      text: '📊 Analyze My Portfolio',
      prompt: 'Please provide a comprehensive analysis of my diamond portfolio including total value, distribution by 4Cs, and recommendations for optimization.',
      targetAgent: 'inventory',
      icon: '📊'
    },
    {
      text: '💰 Market Valuation',
      prompt: 'What are the current market valuations for my diamond inventory? Please analyze pricing trends and suggest optimal pricing strategies.',
      targetAgent: 'pricing',
      icon: '💰'
    },
    {
      text: '🔍 Grade This Diamond',
      prompt: 'I need help understanding diamond grading. Can you explain the 4Cs and help me evaluate diamond quality?',
      targetAgent: 'grading',
      icon: '🔍'
    },
    {
      text: '🤝 Customer Recommendations',
      prompt: 'Help me provide personalized diamond recommendations for customers based on their preferences and budget.',
      targetAgent: 'customer_service',
      icon: '🤝'
    }
  ],
  grading: [
    {
      text: 'Explain 4Cs',
      prompt: 'Please explain the 4Cs of diamond grading (Cut, Carat, Color, Clarity) and how each affects quality and value.',
      icon: '💎'
    },
    {
      text: 'Certificate Analysis',
      prompt: 'How do I verify a GIA certificate and what should I look for to ensure authenticity?',
      icon: '📜'
    },
    {
      text: 'Quality Assessment',
      prompt: 'What are the key factors to consider when assessing diamond quality beyond the basic 4Cs?',
      icon: '⭐'
    },
    {
      text: 'Cut Quality Guide',
      prompt: 'Explain diamond cut quality - what makes an Excellent cut and how does it affect brilliance?',
      icon: '✨'
    },
    {
      text: 'Color Grading Tips',
      prompt: 'Help me understand diamond color grading from D to Z and the visual differences between grades.',
      icon: '🌈'
    }
  ],
  inventory: [
    {
      text: 'Portfolio Overview',
      prompt: 'Give me a complete overview of my diamond inventory including statistics, value distribution, and performance metrics.',
      icon: '📈'
    },
    {
      text: 'Slow Movers Analysis',
      prompt: 'Which diamonds in my inventory are slow-moving and what strategies can improve their turnover?',
      icon: '⏰'
    },
    {
      text: 'Investment Strategy',
      prompt: 'Based on my current inventory, what types of diamonds should I acquire next for optimal ROI?',
      icon: '💹'
    },
    {
      text: 'Inventory Balance',
      prompt: 'Analyze my inventory balance - do I have the right mix of shapes, sizes, and qualities?',
      icon: '⚖️'
    },
    {
      text: 'Profit Optimization',
      prompt: 'How can I optimize my inventory for maximum profitability and faster turnover?',
      icon: '🎯'
    }
  ],
  pricing: [
    {
      text: 'Market Analysis',
      prompt: 'What are the current market trends for diamonds and how should I adjust my pricing strategy?',
      icon: '📊'
    },
    {
      text: 'Price Optimization',
      prompt: 'Help me optimize pricing for specific diamonds based on current market conditions.',
      icon: '💰'
    },
    {
      text: 'Competitive Pricing',
      prompt: 'How should I price my diamonds competitively while maintaining healthy profit margins?',
      icon: '🏆'
    },
    {
      text: 'ROI Calculator',
      prompt: 'Calculate the ROI potential for different diamond types and help me make investment decisions.',
      icon: '🧮'
    },
    {
      text: 'Market Forecast',
      prompt: 'What are the market forecasts for different diamond categories and how should I position my inventory?',
      icon: '🔮'
    }
  ],
  customer_service: [
    {
      text: 'Match Customer Needs',
      prompt: 'Help me find the perfect diamond recommendations for a customer based on their specific requirements.',
      icon: '🎯'
    },
    {
      text: 'Education Guide',
      prompt: 'How do I educate customers about diamond quality in a way that builds trust and confidence?',
      icon: '🎓'
    },
    {
      text: 'Objection Handling',
      prompt: 'What are effective ways to handle common customer objections about diamond pricing and quality?',
      icon: '💬'
    },
    {
      text: 'Value Proposition',
      prompt: 'How do I communicate the value proposition of different diamonds to different customer segments?',
      icon: '💎'
    },
    {
      text: 'Relationship Building',
      prompt: 'What strategies work best for building long-term relationships with diamond customers?',
      icon: '🤝'
    }
  ]
};

export function AgentQuickPrompts({ agentType, onPromptSelect, isLoading }: AgentQuickPromptsProps) {
  const prompts = QUICK_PROMPTS[agentType] || [];

  if (prompts.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      <h4 className="text-sm font-medium text-muted-foreground">
        Quick Actions for {agentType === 'main' ? 'All Agents' : 'Current Agent'}
      </h4>
      
      <ScrollArea className="w-full">
        <div className="flex gap-2 pb-2">
          {prompts.map((prompt, index) => (
            <Button
              key={index}
              variant="outline"
              size="sm"
              className="whitespace-nowrap text-xs h-8 px-3 flex-shrink-0"
              onClick={() => onPromptSelect(prompt.prompt, prompt.targetAgent)}
              disabled={isLoading}
            >
              {prompt.icon && (
                <span className="mr-1.5 text-sm">{prompt.icon}</span>
              )}
              {prompt.text}
            </Button>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}