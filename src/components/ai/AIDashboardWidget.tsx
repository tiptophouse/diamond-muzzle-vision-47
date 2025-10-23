import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Bot, Brain, TrendingUp, Search, DollarSign, AlertTriangle, Sparkles, MessageSquare, BarChart3, Zap } from 'lucide-react';
import { useAGUIClient, AgentType, AGENT_TYPES } from '@/hooks/useAGUIClient';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

interface AIDashboardWidgetProps {
  user: any;
  allDiamonds: any[];
}

export function AIDashboardWidget({ user, allDiamonds }: AIDashboardWidgetProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { currentAgent, switchAgent, sendMessage } = useAGUIClient();
  const [isGeneratingInsights, setIsGeneratingInsights] = useState(false);
  const [dailyInsights, setDailyInsights] = useState<any>(null);

  // Calculate real-time metrics
  const totalValue = allDiamonds.reduce((sum, d) => sum + (d.price_per_carat * d.weight || 0), 0);
  const averagePrice = allDiamonds.length > 0 ? totalValue / allDiamonds.length : 0;
  const premiumStones = allDiamonds.filter(d => d.price_per_carat > averagePrice * 1.2).length;

  const handleQuickAction = async (prompt: string, agentType: AgentType) => {
    switchAgent(agentType);
    navigate('/diamond-agents');
    
    // Small delay to ensure navigation completes
    setTimeout(() => {
      sendMessage(prompt, agentType);
    }, 500);
  };

  const generateDailyInsights = async () => {
    if (isGeneratingInsights) return;
    
    setIsGeneratingInsights(true);
    try {
      await sendMessage("Generate my daily business intelligence report with current market trends and inventory analysis", 'business_intelligence');
      toast({
        title: "✨ AI Analysis Started",
        description: "Your daily insights are being generated. Check the AI Agents tab for the complete report.",
      });
      navigate('/diamond-agents');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate insights. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingInsights(false);
    }
  };

  const quickActions = [
    {
      title: "Daily Intelligence",
      description: "Get market trends & insights",
      icon: BarChart3,
      color: "bg-blue-500",
      agent: 'business_intelligence' as AgentType,
      prompt: "Give me my daily business intelligence report with market analysis and actionable recommendations",
      badge: "Smart"
    },
    {
      title: "Inventory Analysis", 
      description: "Analyze stock performance",
      icon: Search,
      color: "bg-green-500", 
      agent: 'inventory' as AgentType,
      prompt: "Analyze my current inventory performance and identify optimization opportunities",
      badge: "Live"
    },
    {
      title: "Pricing Intelligence",
      description: "Market pricing analysis", 
      icon: DollarSign,
      color: "bg-purple-500",
      agent: 'pricing' as AgentType,
      prompt: "Analyze my pricing strategy compared to current market trends and suggest optimizations",
      badge: "Pro"
    },
    {
      title: "Customer Insights",
      description: "Analyze customer behavior",
      icon: TrendingUp,
      color: "bg-orange-500",
      agent: 'customer_service' as AgentType, 
      prompt: "Show me customer behavior insights and recommend engagement strategies",
      badge: "New"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Main AI Hero Section */}
      <Card className="relative overflow-hidden border-2 border-primary/20 bg-gradient-to-br from-primary/5 via-background to-secondary/5">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-secondary/10" />
        <CardHeader className="relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12 bg-primary/20 border-2 border-primary/30">
                <AvatarFallback className="bg-primary/10 text-primary">
                  <Bot className="h-6 w-6" />
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="flex items-center gap-2">
                  AI Diamond Intelligence
                  <Badge variant="secondary" className="text-xs bg-primary/20 text-primary border-primary/30">
                    <Sparkles className="h-3 w-3 mr-1" />
                    GPT-4 Powered
                  </Badge>
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Advanced AI agents managing your {allDiamonds.length} diamonds worth ${totalValue.toLocaleString()}
                </p>
              </div>
            </div>
            <Button 
              onClick={() => navigate('/diamond-agents')}
              className="bg-primary/90 hover:bg-primary text-primary-foreground shadow-lg"
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Chat with AI
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="relative space-y-4">
          {/* Real-time Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-background/50 rounded-lg border border-border/50">
              <div className="text-2xl font-bold text-primary">{allDiamonds.length}</div>
              <div className="text-xs text-muted-foreground">Total Inventory</div>
            </div>
            <div className="text-center p-3 bg-background/50 rounded-lg border border-border/50">
              <div className="text-2xl font-bold text-green-600">${totalValue.toLocaleString()}</div>
              <div className="text-xs text-muted-foreground">Portfolio Value</div>
            </div>
            <div className="text-center p-3 bg-background/50 rounded-lg border border-border/50">
              <div className="text-2xl font-bold text-purple-600">{premiumStones}</div>
              <div className="text-xs text-muted-foreground">Premium Stones</div>
            </div>
            <div className="text-center p-3 bg-background/50 rounded-lg border border-border/50">
              <div className="text-2xl font-bold text-orange-600">24/7</div>
              <div className="text-xs text-muted-foreground">AI Monitoring</div>
            </div>
          </div>

          <Separator />

          {/* Quick Actions Grid */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-sm">AI-Powered Quick Actions</h4>
              <Button 
                variant="outline" 
                size="sm"
                onClick={generateDailyInsights}
                disabled={isGeneratingInsights}
                className="h-7"
              >
                {isGeneratingInsights ? (
                  <>
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-primary mr-2" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Zap className="h-3 w-3 mr-2" />
                    Generate Report
                  </>
                )}
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {quickActions.map((action, index) => (
                <Card 
                  key={index}
                  className="cursor-pointer transition-all hover:shadow-md hover:scale-[1.02] border-border/50 bg-background/80"
                  onClick={() => handleQuickAction(action.prompt, action.agent)}
                >
                  <CardContent className="p-3">
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${action.color} text-white flex-shrink-0`}>
                        <action.icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h5 className="font-medium text-sm truncate">{action.title}</h5>
                          <Badge variant="outline" className="text-xs px-1.5 py-0.5 h-5">
                            {action.badge}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {action.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Agent Status Indicator */}
          <div className="flex items-center justify-between p-3 bg-background/50 rounded-lg border border-border/50">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-sm font-medium">AI Agents Active</span>
            </div>
            <div className="flex items-center gap-1">
              {Object.entries(AGENT_TYPES).slice(0, 4).map(([key, agent]) => (
                <div 
                  key={key}
                  className="text-lg opacity-80 hover:opacity-100 transition-opacity cursor-pointer"
                  title={agent.name}
                >
                  {agent.icon}
                </div>
              ))}
              <span className="text-xs text-muted-foreground ml-2">+3 more</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}