
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Loader2, Brain, Search, TrendingUp, Users, Zap } from 'lucide-react';
import { useMCPClient } from '@/hooks/useMCPClient';
import { useOpenAIChat } from '@/hooks/useOpenAIChat';
import { ChatMessages } from './ChatMessages';

export function MCPEnhancedChat() {
  const [input, setInput] = useState('');
  const [mcpContext, setMcpContext] = useState<any>({});
  const [showMCPTools, setShowMCPTools] = useState(false);
  
  const { 
    searchInventory, 
    getUserPreferences, 
    getMarketPricing, 
    getCampaignTargeting,
    isLoading: mcpLoading 
  } = useMCPClient();
  
  const { messages, sendMessage, isLoading: chatLoading, user } = useOpenAIChat();

  // Transform messages for display
  const transformedMessages = messages.map(msg => ({
    id: msg.id,
    content: msg.content,
    role: msg.role,
    user_id: user?.id?.toString() || null,
    created_at: msg.timestamp,
  }));

  const handleSendWithMCP = async (message: string) => {
    // Analyze message to determine if MCP tools should be used
    const needsInventorySearch = /search|find|show.*diamond|inventory/i.test(message);
    const needsPricing = /price|cost|market|expensive|cheap|competitive/i.test(message);
    const needsUserData = /preference|recommend|suggest|profile/i.test(message);

    let enhancedMessage = message;
    let contextData: any = {};

    try {
      // Gather MCP context based on message content
      if (needsInventorySearch) {
        console.log('🔍 Using MCP for inventory search...');
        const searchResult = await searchInventory({
          limit: 5 // Get recent diamonds for context
        });
        contextData.inventory = searchResult;
        enhancedMessage += `\n\n[MCP Context: Found ${searchResult.totalCount} diamonds in inventory, average price: $${searchResult.avgPrice}]`;
      }

      if (needsPricing && contextData.inventory?.diamonds?.[0]) {
        console.log('💰 Using MCP for market pricing...');
        const pricingData = await getMarketPricing(contextData.inventory.diamonds[0]);
        contextData.pricing = pricingData;
        enhancedMessage += `\n\n[MCP Market Analysis: ${pricingData.reasoning}]`;
      }

      if (needsUserData) {
        console.log('👤 Using MCP for user preferences...');
        const preferences = await getUserPreferences();
        contextData.preferences = preferences;
        enhancedMessage += `\n\n[MCP User Profile: Prefers ${preferences.favoriteShapes.join(', ')} shapes, budget range: $${preferences.priceRange.min}-${preferences.priceRange.max}]`;
      }

      setMcpContext(contextData);
      
    } catch (error) {
      console.error('MCP Enhancement Error:', error);
      // Continue with original message if MCP fails
    }

    // Send the enhanced message with MCP context
    await sendMessage(enhancedMessage);
  };

  const runMCPTool = async (tool: string) => {
    setShowMCPTools(false);
    
    switch (tool) {
      case 'inventory_search':
        await handleSendWithMCP('Show me my current diamond inventory with market analysis');
        break;
      case 'pricing_analysis':
        await handleSendWithMCP('Analyze my diamond pricing compared to market rates');
        break;
      case 'user_insights':
        await handleSendWithMCP('What are my customer preferences and buying patterns?');
        break;
      case 'campaign_targeting':
        try {
          const targeting = await getCampaignTargeting('promotional');
          await sendMessage(`Based on MCP analysis, here's optimal campaign targeting: ${JSON.stringify(targeting, null, 2)}`);
        } catch (error) {
          console.error('Campaign targeting error:', error);
        }
        break;
    }
  };

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto">
      <Card className="mb-4">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-primary" />
                MCP-Enhanced AI Assistant
              </CardTitle>
              <CardDescription>
                AI with real-time access to your inventory, market data, and user insights
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowMCPTools(!showMCPTools)}
              className="flex items-center gap-2"
            >
              <Zap className="h-4 w-4" />
              MCP Tools
            </Button>
          </div>
        </CardHeader>

        {showMCPTools && (
          <CardContent className="pt-0">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => runMCPTool('inventory_search')}
                disabled={mcpLoading}
                className="flex items-center gap-2"
              >
                <Search className="h-4 w-4" />
                Inventory Search
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => runMCPTool('pricing_analysis')}
                disabled={mcpLoading}
                className="flex items-center gap-2"
              >
                <TrendingUp className="h-4 w-4" />
                Price Analysis
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => runMCPTool('user_insights')}
                disabled={mcpLoading}
                className="flex items-center gap-2"
              >
                <Users className="h-4 w-4" />
                User Insights
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => runMCPTool('campaign_targeting')}
                disabled={mcpLoading}
                className="flex items-center gap-2"
              >
                <Brain className="h-4 w-4" />
                Campaign AI
              </Button>
            </div>
          </CardContent>
        )}
      </Card>

      {/* MCP Context Display */}
      {Object.keys(mcpContext).length > 0 && (
        <Card className="mb-4 border-primary/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Active MCP Context
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex flex-wrap gap-2">
              {mcpContext.inventory && (
                <Badge variant="secondary">
                  📊 {mcpContext.inventory.totalCount} diamonds loaded
                </Badge>
              )}
              {mcpContext.pricing && (
                <Badge variant="secondary">
                  💰 Market analysis: {mcpContext.pricing.competitivePosition}
                </Badge>
              )}
              {mcpContext.preferences && (
                <Badge variant="secondary">
                  👤 User profile: {mcpContext.preferences.buyingPattern}
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Chat Messages */}
      <div className="flex-1 min-h-0">
        <ChatMessages 
          messages={transformedMessages} 
          isLoading={chatLoading || mcpLoading}
          currentUserId={user?.id?.toString()}
        />
      </div>

      {/* Enhanced Input */}
      <div className="mt-4 flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask me about your inventory, pricing, or customers... (MCP-enhanced)"
          onKeyPress={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              if (input.trim()) {
                handleSendWithMCP(input.trim());
                setInput('');
              }
            }
          }}
          className="flex-1"
        />
        <Button
          onClick={() => {
            if (input.trim()) {
              handleSendWithMCP(input.trim());
              setInput('');
            }
          }}
          disabled={chatLoading || mcpLoading || !input.trim()}
        >
          {(chatLoading || mcpLoading) ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            'Send'
          )}
        </Button>
      </div>
    </div>
  );
}
