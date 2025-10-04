import React from 'react';
import { TelegramMiniAppLayout } from '@/components/layout/TelegramMiniAppLayout';
import { StreamingChatContainer } from '@/components/chat/StreamingChatContainer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Users, MessageCircle, TrendingUp } from 'lucide-react';

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

        {/* Agent Information Cards - Collapsible */}
        <div className="p-4 space-y-3 bg-muted/20">
          <Card className="border border-primary/20">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-primary" />
                  AI-Powered Diamond Expertise
                </CardTitle>
                <Badge variant="secondary" className="text-xs">
                  Enhanced
                </Badge>
              </div>
              <CardDescription className="text-sm">
                Advanced AI agents with FastAPI integration for real-time inventory analysis
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

        {/* AG-UI Streaming Chat Interface */}
        <div className="flex-1 overflow-hidden">
          <StreamingChatContainer />
        </div>
      </div>
    </TelegramMiniAppLayout>
  );
}