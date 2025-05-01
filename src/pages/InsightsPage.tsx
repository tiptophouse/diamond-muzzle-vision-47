
import { useState, useEffect } from "react";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import { TrendingUp, TrendingDown, Chart, Search, MessageSquare } from "lucide-react";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";

// Types for our AI insights data
interface DiamondInsight {
  id: string;
  stockNumber: string;
  shape: string;
  carat: number;
  color: string;
  clarity: string;
  price: number;
  recommendation: "Buy" | "Sell" | "Hold";
  confidenceScore: number;
  reason: string;
}

interface MarketTrend {
  category: string;
  trending: number;
  previous: number;
}

interface MessageMatch {
  messageId: string;
  timestamp: string;
  messageText: string;
  diamondId: string;
  stockNumber: string;
  confidence: number;
}

export default function InsightsPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [insights, setInsights] = useState<DiamondInsight[]>([]);
  const [marketTrends, setMarketTrends] = useState<MarketTrend[]>([]);
  const [messageMatches, setMessageMatches] = useState<MessageMatch[]>([]);
  
  useEffect(() => {
    const fetchInsights = async () => {
      setLoading(true);
      try {
        // Simulate API calls
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Mock data for diamond insights
        const mockInsights: DiamondInsight[] = [
          {
            id: "d-1",
            stockNumber: "D10001",
            shape: "Round",
            carat: 2.1,
            color: "D",
            clarity: "VS1",
            price: 15000,
            recommendation: "Sell",
            confidenceScore: 87,
            reason: "High current demand for D color rounds with increased inquiries in Telegram group"
          },
          {
            id: "d-2",
            stockNumber: "D10002",
            shape: "Princess",
            carat: 1.75,
            color: "F",
            clarity: "VVS2",
            price: 10500,
            recommendation: "Hold",
            confidenceScore: 73,
            reason: "Princess cuts showing seasonal demand downturn, expected to recover in 3 months"
          },
          {
            id: "d-3",
            stockNumber: "D10003",
            shape: "Emerald",
            carat: 3.0,
            color: "G",
            clarity: "VS2",
            price: 18000,
            recommendation: "Buy",
            confidenceScore: 92,
            reason: "Emerald cuts trending in social media, significant price appreciation forecasted"
          },
          {
            id: "d-4",
            stockNumber: "D10004",
            shape: "Oval",
            carat: 1.5,
            color: "E",
            clarity: "SI1",
            price: 8500,
            recommendation: "Sell",
            confidenceScore: 81,
            reason: "Multiple recent Telegram inquiries match this specification exactly"
          },
        ];
        
        // Mock data for market trends
        const mockTrends: MarketTrend[] = [
          { category: "Round", trending: 10, previous: 8 },
          { category: "Princess", trending: 4, previous: 7 },
          { category: "Cushion", trending: 7, previous: 6 },
          { category: "Emerald", trending: 12, previous: 5 },
          { category: "Oval", trending: 8, previous: 9 },
          { category: "Pear", trending: 5, previous: 6 },
        ];
        
        // Mock data for message matches
        const mockMatches: MessageMatch[] = [
          { 
            messageId: "m1", 
            timestamp: "2025-05-01T14:23:45Z", 
            messageText: "Looking for a 2ct round D color VS1 or better", 
            diamondId: "d-1", 
            stockNumber: "D10001", 
            confidence: 95 
          },
          { 
            messageId: "m2", 
            timestamp: "2025-05-01T08:12:33Z", 
            messageText: "Does anyone have an oval around 1.5ct, E or F color?", 
            diamondId: "d-4", 
            stockNumber: "D10004", 
            confidence: 88 
          },
          { 
            messageId: "m3", 
            timestamp: "2025-04-30T19:45:12Z", 
            messageText: "Need a large emerald cut, preferably G color, at least 2.5ct", 
            diamondId: "d-3", 
            stockNumber: "D10003", 
            confidence: 86 
          },
        ];
        
        setInsights(mockInsights);
        setMarketTrends(mockTrends);
        setMessageMatches(mockMatches);
        
      } catch (error) {
        console.error("Failed to fetch insights", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load AI insights. Please try again later.",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchInsights();
  }, []);
  
  const getRecommendationClass = (recommendation: string) => {
    switch (recommendation) {
      case "Buy": return "bg-green-100 text-green-800 border-green-300";
      case "Sell": return "bg-blue-100 text-blue-800 border-blue-300";
      case "Hold": return "bg-amber-100 text-amber-800 border-amber-300";
      default: return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };
  
  const getRecommendationIcon = (recommendation: string) => {
    switch (recommendation) {
      case "Buy": return <TrendingUp className="h-4 w-4 text-green-600" />;
      case "Sell": return <TrendingDown className="h-4 w-4 text-blue-600" />;
      case "Hold": return <Chart className="h-4 w-4 text-amber-600" />;
      default: return null;
    }
  };
  
  if (loading) {
    return (
      <Layout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">AI Insights</h1>
            <p className="text-muted-foreground">
              Market analysis and inventory recommendations
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader className="pb-2">
                  <div className="h-5 bg-gray-200 rounded w-1/3"></div>
                  <div className="h-4 bg-gray-100 rounded w-2/3"></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="h-24 bg-gray-100 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">AI Insights</h1>
          <p className="text-muted-foreground">
            Market analysis and inventory recommendations powered by GPT
          </p>
        </div>
        
        <Tabs defaultValue="recommendations" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-3 mb-6">
            <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
            <TabsTrigger value="trends">Market Trends</TabsTrigger>
            <TabsTrigger value="matches">Message Matches</TabsTrigger>
          </TabsList>
          
          <TabsContent value="recommendations" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {insights.map((insight) => (
                <Card key={insight.id} className="overflow-hidden border-t-4" 
                      style={{ 
                        borderTopColor: insight.recommendation === "Buy" ? "#22c55e" : 
                                       insight.recommendation === "Sell" ? "#3b82f6" : "#f59e0b" 
                      }}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{insight.stockNumber}</CardTitle>
                        <CardDescription>
                          {insight.shape} {insight.carat}ct {insight.color}-{insight.clarity}
                        </CardDescription>
                      </div>
                      <Badge 
                        className={`${getRecommendationClass(insight.recommendation)} flex items-center gap-1 px-2 py-1`}
                        variant="outline"
                      >
                        {getRecommendationIcon(insight.recommendation)}
                        {insight.recommendation}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <p className="text-sm">{insight.reason}</p>
                      <div className="flex items-center justify-between text-sm">
                        <div>Price: ${insight.price.toLocaleString()}</div>
                        <div className="flex items-center gap-1">
                          <span>Confidence:</span>
                          <span className="font-semibold">{insight.confidenceScore}%</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            <div className="flex justify-center">
              <Button>
                <Chart className="mr-2 h-4 w-4" />
                Refresh Analysis
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="trends">
            <Card>
              <CardHeader>
                <CardTitle>Diamond Market Trends</CardTitle>
                <CardDescription>
                  Shape popularity based on Telegram group analysis and market data
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={marketTrends}>
                    <XAxis dataKey="category" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="previous" name="Previous Month" fill="#94a3b8" />
                    <Bar dataKey="trending" name="Current Trend" fill="#a855f7" />
                  </BarChart>
                </ResponsiveContainer>
                
                <div className="grid grid-cols-2 gap-4 mt-6">
                  <div className="space-y-2">
                    <h4 className="font-semibold flex items-center">
                      <TrendingUp className="mr-2 h-4 w-4 text-green-500" />
                      Rising Demand
                    </h4>
                    <ul className="text-sm space-y-1">
                      <li className="flex justify-between">
                        <span>Emerald</span>
                        <span className="text-green-500">+140%</span>
                      </li>
                      <li className="flex justify-between">
                        <span>Round</span>
                        <span className="text-green-500">+25%</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-semibold flex items-center">
                      <TrendingDown className="mr-2 h-4 w-4 text-red-500" />
                      Falling Demand
                    </h4>
                    <ul className="text-sm space-y-1">
                      <li className="flex justify-between">
                        <span>Princess</span>
                        <span className="text-red-500">-43%</span>
                      </li>
                      <li className="flex justify-between">
                        <span>Oval</span>
                        <span className="text-red-500">-11%</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="matches">
            <Card>
              <CardHeader>
                <CardTitle>Inventory-Message Matches</CardTitle>
                <CardDescription>
                  Recent Telegram messages that match your inventory
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {messageMatches.map((match) => (
                  <div key={match.messageId} className="border rounded-lg p-4 space-y-2">
                    <div className="flex justify-between items-start">
                      <div className="text-sm text-muted-foreground">
                        {new Date(match.timestamp).toLocaleString()}
                      </div>
                      <Badge className="bg-diamond-100 text-diamond-800 hover:bg-diamond-200">
                        {match.confidence}% Match
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-5 w-5 text-gray-500 flex-shrink-0" />
                      <p className="text-sm">"{match.messageText}"</p>
                    </div>
                    
                    <Separator />
                    
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="text-sm font-medium">Matches your inventory:</div>
                        <div className="text-sm">Stock #{match.stockNumber}</div>
                      </div>
                      
                      <Button size="sm" variant="outline">
                        <MessageSquare className="mr-2 h-3.5 w-3.5" />
                        Reply
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
