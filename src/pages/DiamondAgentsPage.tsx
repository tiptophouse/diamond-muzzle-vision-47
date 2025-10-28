import React from 'react';
import { TelegramMiniAppLayout } from '@/components/layout/TelegramMiniAppLayout';
import { EnhancedChatContainer } from '@/components/chat/EnhancedChatContainer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Users, MessageCircle, TrendingUp, Brain } from 'lucide-react';
import { AILearningIndicator } from '@/components/ai/AILearningIndicator';

export default function DiamondAgentsPage() {
  return (
    <TelegramMiniAppLayout>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-primary/10 to-purple-500/10 border-b">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Diamond AI Agents</h1>
              <p className="text-sm text-muted-foreground">
                Specialized AI experts for diamond consultation
              </p>
            </div>
          </div>

          {/* Feature Highlights */}
          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center gap-2 p-2 bg-background/50 rounded-lg">
              <Users className="w-4 h-4 text-primary" />
              <div>
                <p className="text-xs font-medium">5 Specialists</p>
                <p className="text-xs text-muted-foreground">Expert agents</p>
              </div>
            </div>
            <div className="flex items-center gap-2 p-2 bg-background/50 rounded-lg">
              <MessageCircle className="w-4 h-4 text-green-600" />
              <div>
                <p className="text-xs font-medium">Smart Routing</p>
                <p className="text-xs text-muted-foreground">Auto-routing</p>
              </div>
            </div>
          </div>
        </div>

        {/* AI Learning Status */}
        <div className="p-4 space-y-3 bg-muted/20">
          <AILearningIndicator />
          
          <Card className="border border-primary/20">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <Brain className="w-4 h-4 text-primary" />
                  AI-Powered Diamond Expertise with Machine Learning
                </CardTitle>
                <Badge variant="secondary" className="text-xs">
                  Enhanced
                </Badge>
              </div>
              <CardDescription className="text-sm">
                Self-learning AI that gets smarter with every transaction, deal, and interaction
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-lg">💎</span>
                  <div>
                    <p className="font-medium">Grading Expert</p>
                    <p className="text-muted-foreground">4Cs & Certificates</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lg">📊</span>
                  <div>
                    <p className="font-medium">Inventory Analyst</p>
                    <p className="text-muted-foreground">Portfolio Optimization</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lg">💰</span>
                  <div>
                    <p className="font-medium">Pricing Expert</p>
                    <p className="text-muted-foreground">Market Analysis</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lg">🤝</span>
                  <div>
                    <p className="font-medium">Customer Service</p>
                    <p className="text-muted-foreground">Personalized Help</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Chat Interface */}
        <div className="flex-1 overflow-hidden">
          <EnhancedChatContainer />
        </div>
      </div>
    </TelegramMiniAppLayout>
  );
}