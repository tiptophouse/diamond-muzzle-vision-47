
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell } from "recharts";
import { TrendingUp, Eye, BarChart3 } from "lucide-react";

interface MarketComparisonData {
  yourPosition: {
    avgPricePerCarat: number;
    marketRank: 'premium' | 'competitive' | 'value';
    percentileRank: number;
  };
  shapeComparison: Array<{
    shape: string;
    yourAvgPrice: number;
    marketAvgPrice: number;
    difference: number;
    marketShare: number;
  }>;
  competitiveAdvantages: string[];
  recommendations: string[];
}

interface MarketComparisonProps {
  data: MarketComparisonData;
}

export function MarketComparison({ data }: MarketComparisonProps) {
  const formatCurrency = (value: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);

  const getRankColor = (rank: string) => {
    switch (rank) {
      case 'premium': return 'bg-purple-500/10 text-purple-600 border-purple-500/20';
      case 'competitive': return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
      case 'value': return 'bg-green-500/10 text-green-600 border-green-500/20';
      default: return 'bg-gray-500/10 text-gray-600 border-gray-500/20';
    }
  };

  const getBarColor = (difference: number) => {
    if (difference > 10) return '#10b981'; // green
    if (difference > 0) return '#3b82f6'; // blue
    if (difference > -10) return '#f59e0b'; // yellow
    return '#ef4444'; // red
  };

  return (
    <div className="space-y-6">
      {/* Market Position */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            Your Market Position
          </CardTitle>
          <CardDescription>How you compare to the broader diamond market</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-primary/5 rounded-lg">
              <div className="text-2xl font-bold text-primary">
                {formatCurrency(data.yourPosition.avgPricePerCarat)}
              </div>
              <div className="text-sm text-muted-foreground">Your Avg Price/Carat</div>
            </div>
            
            <div className="text-center p-4 bg-accent/50 rounded-lg">
              <Badge className={getRankColor(data.yourPosition.marketRank)}>
                {data.yourPosition.marketRank.toUpperCase()} TIER
              </Badge>
              <div className="text-sm text-muted-foreground mt-2">Market Classification</div>
            </div>
            
            <div className="text-center p-4 bg-secondary/10 rounded-lg">
              <div className="text-2xl font-bold">{data.yourPosition.percentileRank}%</div>
              <div className="text-sm text-muted-foreground">Market Percentile</div>
              <Progress value={data.yourPosition.percentileRank} className="mt-2 h-2" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Shape-by-Shape Comparison */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-success" />
            Price Comparison by Shape
          </CardTitle>
          <CardDescription>Your pricing vs market averages</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.shapeComparison}>
                <XAxis 
                  dataKey="shape" 
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Bar dataKey="difference" radius={[4, 4, 0, 0]}>
                  {data.shapeComparison.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getBarColor(entry.difference)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
            {data.shapeComparison.slice(0, 4).map((shape) => (
              <div key={shape.shape} className="flex items-center justify-between p-3 bg-accent/20 rounded-lg">
                <div>
                  <p className="font-medium">{shape.shape}</p>
                  <p className="text-sm text-muted-foreground">
                    You: {formatCurrency(shape.yourAvgPrice)} | Market: {formatCurrency(shape.marketAvgPrice)}
                  </p>
                </div>
                <Badge className={shape.difference > 0 ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'}>
                  {shape.difference > 0 ? '+' : ''}{shape.difference.toFixed(1)}%
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Insights & Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-primary" />
              Your Competitive Advantages
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.competitiveAdvantages.map((advantage, index) => (
                <div key={index} className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-success rounded-full mt-2 flex-shrink-0" />
                  <p className="text-sm">{advantage}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Strategic Recommendations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.recommendations.map((recommendation, index) => (
                <div key={index} className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-warning rounded-full mt-2 flex-shrink-0" />
                  <p className="text-sm">{recommendation}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
