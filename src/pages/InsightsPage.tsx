
import { useState, useEffect } from "react";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { TrendingUp, TrendingDown, BarChartBig, RefreshCw } from "lucide-react";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import { api, apiEndpoints } from "@/lib/api";
import { useTelegramAuth } from "@/context/TelegramAuthContext";

interface MarketTrend {
  category: string;
  count: number;
  percentage: number;
}

export default function InsightsPage() {
  const { toast } = useToast();
  const { user, isAuthenticated } = useTelegramAuth();
  const [loading, setLoading] = useState(true);
  const [marketTrends, setMarketTrends] = useState<MarketTrend[]>([]);
  const [totalDiamonds, setTotalDiamonds] = useState(0);
  
  useEffect(() => {
    if (isAuthenticated && user) {
      fetchRealInsights();
    }
  }, [isAuthenticated, user]);
  
  const fetchRealInsights = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      console.log('Fetching real insights for user:', user.id);
      
      const response = await api.get<any[]>(apiEndpoints.getAllStones(user.id));
      
      if (response.data) {
        const diamonds = response.data.filter(d => 
          d.owners?.includes(user.id) || d.owner_id === user.id
        );
        
        setTotalDiamonds(diamonds.length);
        
        // Calculate real market trends by shape
        const shapeMap = new Map<string, number>();
        diamonds.forEach(diamond => {
          if (diamond.shape) {
            shapeMap.set(diamond.shape, (shapeMap.get(diamond.shape) || 0) + 1);
          }
        });
        
        const trends: MarketTrend[] = Array.from(shapeMap.entries())
          .map(([category, count]) => ({
            category,
            count,
            percentage: Math.round((count / diamonds.length) * 100)
          }))
          .sort((a, b) => b.count - a.count);
        
        setMarketTrends(trends);
        
        toast({
          title: "Insights loaded",
          description: `Analyzed ${diamonds.length} diamonds in your inventory.`,
        });
      }
    } catch (error) {
      console.error("Failed to fetch insights", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load insights. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };
  
  if (!isAuthenticated) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <Card>
            <CardHeader>
              <CardTitle>Authentication Required</CardTitle>
              <CardDescription>Please authenticate to view insights.</CardDescription>
            </CardHeader>
          </Card>
        </div>
      </Layout>
    );
  }
  
  if (loading) {
    return (
      <Layout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Market Insights</h1>
            <p className="text-muted-foreground">Real-time analytics from your inventory</p>
          </div>
          
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-diamond-500 mx-auto mb-4"></div>
              <p className="text-muted-foreground">Analyzing your inventory...</p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold">Market Insights</h1>
            <p className="text-muted-foreground">
              Real-time analytics from your {totalDiamonds} diamonds
            </p>
          </div>
          
          <Button onClick={fetchRealInsights} disabled={loading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Inventory Distribution by Shape</CardTitle>
              <CardDescription>
                Shape breakdown of your current inventory
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={marketTrends}>
                  <XAxis dataKey="category" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#8b5cf6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Shape Analysis</CardTitle>
              <CardDescription>
                Percentage breakdown of your inventory
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {marketTrends.slice(0, 6).map((trend, index) => (
                <div key={trend.category} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="w-12 justify-center">
                      #{index + 1}
                    </Badge>
                    <span className="font-medium">{trend.category}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      {trend.count} diamonds
                    </span>
                    <Badge className="bg-diamond-100 text-diamond-800">
                      {trend.percentage}%
                    </Badge>
                  </div>
                </div>
              ))}
              
              {marketTrends.length === 0 && (
                <p className="text-center text-muted-foreground py-4">
                  No data available. Upload your inventory to see insights.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
        
        {totalDiamonds > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Quick Stats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{totalDiamonds}</div>
                  <div className="text-sm text-green-700">Total Diamonds</div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{marketTrends.length}</div>
                  <div className="text-sm text-blue-700">Different Shapes</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    {marketTrends[0]?.category || 'N/A'}
                  </div>
                  <div className="text-sm text-purple-700">Most Common Shape</div>
                </div>
                <div className="text-center p-4 bg-amber-50 rounded-lg">
                  <div className="text-2xl font-bold text-amber-600">
                    {marketTrends[0]?.percentage || 0}%
                  </div>
                  <div className="text-sm text-amber-700">Top Shape Share</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}
