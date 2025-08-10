
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, TrendingDown, DollarSign, Target, AlertTriangle } from "lucide-react";

interface ProfitabilityData {
  totalInventoryValue: number;
  averageMargin: number;
  topPerformingShapes: Array<{
    shape: string;
    avgPrice: number;
    margin: number;
    trend: 'up' | 'down' | 'stable';
  }>;
  underperformingStones: Array<{
    shape: string;
    daysInInventory: number;
    priceAdjustmentSuggestion: number;
  }>;
}

interface ProfitabilityInsightsProps {
  data: ProfitabilityData;
}

export function ProfitabilityInsights({ data }: ProfitabilityInsightsProps) {
  const formatCurrency = (value: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Portfolio Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-success" />
            Portfolio Performance
          </CardTitle>
          <CardDescription>Your inventory's financial health</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center p-6 bg-success/5 rounded-lg">
            <div className="text-3xl font-bold text-success">{formatCurrency(data.totalInventoryValue)}</div>
            <div className="text-sm text-muted-foreground">Total Portfolio Value</div>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Average Margin</span>
              <Badge variant={data.averageMargin > 20 ? 'default' : 'secondary'}>
                {data.averageMargin.toFixed(1)}%
              </Badge>
            </div>
            <Progress value={data.averageMargin} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Top Performers */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Top Performing Shapes
          </CardTitle>
          <CardDescription>Your most profitable diamond categories</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.topPerformingShapes.map((shape, index) => (
              <div key={shape.shape} className="flex items-center justify-between p-3 rounded-lg bg-accent/30">
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="w-8 justify-center">#{index + 1}</Badge>
                  <div>
                    <p className="font-medium">{shape.shape}</p>
                    <p className="text-sm text-muted-foreground">
                      Avg: {formatCurrency(shape.avgPrice)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={`${
                    shape.margin > 25 ? 'bg-success/10 text-success border-success/20' :
                    shape.margin > 15 ? 'bg-warning/10 text-warning border-warning/20' :
                    'bg-destructive/10 text-destructive border-destructive/20'
                  }`}>
                    {shape.margin.toFixed(1)}%
                  </Badge>
                  {shape.trend === 'up' ? (
                    <TrendingUp className="h-4 w-4 text-success" />
                  ) : shape.trend === 'down' ? (
                    <TrendingDown className="h-4 w-4 text-destructive" />
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Optimization Opportunities */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-warning" />
            Optimization Opportunities
          </CardTitle>
          <CardDescription>Diamonds that need attention to improve profitability</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.underperformingStones.map((stone, index) => (
              <div key={`${stone.shape}-${index}`} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold">{stone.shape}</h4>
                  <Badge variant="outline" className="text-warning border-warning/20">
                    {stone.daysInInventory} days
                  </Badge>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Suggested price adjustment:
                  </p>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-primary/10 text-primary">
                      {stone.priceAdjustmentSuggestion > 0 ? '+' : ''}{stone.priceAdjustmentSuggestion.toFixed(1)}%
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      to improve movement
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
