
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Brain, Activity, TrendingUp, Users, MessageSquare, Zap } from 'lucide-react';
import { useMCPClient } from '@/hooks/useMCPClient';

interface MCPMetrics {
  totalRequests: number;
  successRate: number;
  averageResponseTime: number;
  activeTools: string[];
  aiDecisions: Array<{
    timestamp: string;
    tool: string;
    reasoning: string;
    outcome: 'success' | 'failure';
  }>;
}

export function MCPDashboard() {
  const [metrics, setMetrics] = useState<MCPMetrics>({
    totalRequests: 42,
    successRate: 94.2,
    averageResponseTime: 1.3,
    activeTools: ['inventory_search', 'pricing_analysis', 'user_insights', 'campaign_targeting'],
    aiDecisions: [
      {
        timestamp: '2025-01-14T10:30:00Z',
        tool: 'pricing_analysis',
        reasoning: 'User asked about diamond pricing. Detected market comparison intent.',
        outcome: 'success'
      },
      {
        timestamp: '2025-01-14T10:25:00Z',
        tool: 'inventory_search',
        reasoning: 'Query contained "show diamonds" - triggered inventory search.',
        outcome: 'success'
      },
      {
        timestamp: '2025-01-14T10:20:00Z',
        tool: 'user_insights',
        reasoning: 'Customer preference question detected. Loaded user profile data.',
        outcome: 'success'
      }
    ]
  });

  const { isLoading } = useMCPClient();

  const getToolIcon = (tool: string) => {
    switch (tool) {
      case 'inventory_search': return <Activity className="h-4 w-4" />;
      case 'pricing_analysis': return <TrendingUp className="h-4 w-4" />;
      case 'user_insights': return <Users className="h-4 w-4" />;
      case 'campaign_targeting': return <MessageSquare className="h-4 w-4" />;
      default: return <Brain className="h-4 w-4" />;
    }
  };

  const formatToolName = (tool: string) => {
    return tool.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary" />
          MCP Intelligence Dashboard
        </CardTitle>
        <CardDescription>
          Monitor AI decision-making and FastAPI MCP integration performance
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <Tabs defaultValue="metrics" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="metrics">Performance Metrics</TabsTrigger>
            <TabsTrigger value="decisions">AI Decisions</TabsTrigger>
            <TabsTrigger value="tools">MCP Tools</TabsTrigger>
          </TabsList>

          <TabsContent value="metrics" className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total MCP Requests</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{metrics.totalRequests}</div>
                  <Badge variant="secondary" className="mt-1">Today</Badge>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{metrics.successRate}%</div>
                  <Badge variant="secondary" className="mt-1">Last 24h</Badge>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{metrics.averageResponseTime}s</div>
                  <Badge variant="secondary" className="mt-1">FastAPI</Badge>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Active Tools</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{metrics.activeTools.length}</div>
                  <Badge variant="secondary" className="mt-1">Enabled</Badge>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">MCP Integration Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span>FastAPI Backend Connection</span>
                  <Badge variant="outline" className="text-yellow-600">Development Mode</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Real-time Data Access</span>
                  <Badge variant="secondary">Mock Data Active</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>AI Context Enhancement</span>
                  <Badge variant="default">Active</Badge>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="decisions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Recent AI Decisions</CardTitle>
                <CardDescription>
                  How the AI chooses which MCP tools to use based on user queries
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {metrics.aiDecisions.map((decision, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {getToolIcon(decision.tool)}
                          <span className="font-medium">{formatToolName(decision.tool)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge 
                            variant={decision.outcome === 'success' ? 'default' : 'destructive'}
                          >
                            {decision.outcome}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {new Date(decision.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">{decision.reasoning}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tools" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {metrics.activeTools.map((tool) => (
                <Card key={tool}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      {getToolIcon(tool)}
                      {formatToolName(tool)}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Status:</span>
                        <Badge variant="default">Active</Badge>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Calls Today:</span>
                        <span>{Math.floor(Math.random() * 20) + 5}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Success Rate:</span>
                        <span>{Math.floor(Math.random() * 10) + 90}%</span>
                      </div>
                    </div>
                    <div className="mt-3 text-xs text-muted-foreground">
                      {getToolDescription(tool)}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Setup FastAPI MCP Integration</CardTitle>
                <CardDescription>
                  To enable real data access, configure your FastAPI backend
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="bg-muted p-4 rounded-lg">
                  <code className="text-sm">
                    pip install fastapi-mcp
                  </code>
                </div>
                <p className="text-sm text-muted-foreground">
                  Add MCP endpoints to your FastAPI app to enable real-time data access for the AI assistant.
                </p>
                <Button variant="outline" size="sm">
                  <Zap className="h-4 w-4 mr-2" />
                  View Integration Guide
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

function getToolDescription(tool: string): string {
  switch (tool) {
    case 'inventory_search':
      return 'Searches diamond inventory based on user criteria and provides real-time results.';
    case 'pricing_analysis':
      return 'Analyzes market pricing and provides competitive positioning insights.';
    case 'user_insights':
      return 'Retrieves user preferences and buying patterns for personalized recommendations.';
    case 'campaign_targeting':
      return 'Identifies optimal user segments and generates personalized campaign messages.';
    default:
      return 'MCP tool for enhanced AI capabilities.';
  }
}
