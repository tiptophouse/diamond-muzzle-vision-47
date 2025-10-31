import React from 'react';
import { TelegramMiniAppLayout } from '@/components/layout/TelegramMiniAppLayout';
import { ExecutiveAgentsDashboard } from '@/components/admin/ExecutiveAgentsDashboard';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Database, TrendingUp, AlertTriangle } from 'lucide-react';

export default function ExecutiveAgentsPage() {
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
              <h1 className="text-xl font-bold">Executive AI Agents</h1>
              <p className="text-sm text-muted-foreground">
                CTO, CEO, and Marketing insights powered by real data
              </p>
            </div>
          </div>

          {/* Feature Highlights */}
          <div className="grid grid-cols-3 gap-2">
            <div className="flex flex-col items-center gap-1 p-2 bg-background/50 rounded-lg">
              <Database className="w-4 h-4 text-primary" />
              <p className="text-xs font-medium">27K+ Diamonds</p>
              <p className="text-xs text-muted-foreground">FastAPI</p>
            </div>
            <div className="flex flex-col items-center gap-1 p-2 bg-background/50 rounded-lg">
              <TrendingUp className="w-4 h-4 text-green-600" />
              <p className="text-xs font-medium">Live Analytics</p>
              <p className="text-xs text-muted-foreground">Real-time</p>
            </div>
            <div className="flex flex-col items-center gap-1 p-2 bg-background/50 rounded-lg">
              <AlertTriangle className="w-4 h-4 text-orange-600" />
              <p className="text-xs font-medium">Log Analysis</p>
              <p className="text-xs text-muted-foreground">Errors & Events</p>
            </div>
          </div>
        </div>

        {/* Important Notice */}
        <div className="p-4 bg-muted/20">
          <Card className="border border-orange-500/20 bg-orange-500/5">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h3 className="text-sm font-semibold mb-1">Connected to Production Data</h3>
                  <p className="text-xs text-muted-foreground">
                    These agents access your live FastAPI backend with 27,000+ diamonds, 
                    real user analytics, system logs, and error reports. All insights are 
                    based on current production data.
                  </p>
                  <div className="flex gap-2 mt-2">
                    <Badge variant="secondary" className="text-xs">
                      <Database className="w-3 h-3 mr-1" />
                      FastAPI Connected
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      Supabase Logs
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Dashboard */}
        <div className="flex-1 overflow-auto p-4">
          <ExecutiveAgentsDashboard />
        </div>
      </div>
    </TelegramMiniAppLayout>
  );
}
