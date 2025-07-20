import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface DemandInsight {
  shape: string;
  color: string;
  clarity: string;
  demandLevel: 'high' | 'medium' | 'low';
  searchCount: number;
  avgPrice: number;
}

interface MarketDemandCardProps {
  demandInsights: DemandInsight[];
}

export function MarketDemandCard({ demandInsights }: MarketDemandCardProps) {
  const getDemandIcon = (level: string) => {
    switch (level) {
      case 'high': return <TrendingUp className="h-4 w-4 text-success" />;
      case 'low': return <TrendingDown className="h-4 w-4 text-destructive" />;
      default: return <Minus className="h-4 w-4 text-warning" />;
    }
  };

  const getDemandColor = (level: string) => {
    switch (level) {
      case 'high': return 'bg-success/10 text-success border-success/20';
      case 'low': return 'bg-destructive/10 text-destructive border-destructive/20';
      default: return 'bg-warning/10 text-warning border-warning/20';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          Market Demand Analysis
        </CardTitle>
        <CardDescription>
          What's trending in the diamond market based on group activity
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {demandInsights.slice(0, 5).map((insight, index) => (
          <div key={`${insight.shape}-${insight.color}-${insight.clarity}`} 
               className="flex items-center justify-between p-3 rounded-lg bg-accent/30">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                {getDemandIcon(insight.demandLevel)}
                <Badge variant="outline" className={getDemandColor(insight.demandLevel)}>
                  {insight.demandLevel} demand
                </Badge>
              </div>
              <div>
                <p className="font-medium">
                  {insight.shape} {insight.color} {insight.clarity}
                </p>
                <p className="text-sm text-muted-foreground">
                  {insight.searchCount} searches this month
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-semibold text-primary">
                ${insight.avgPrice.toLocaleString()}/ct
              </p>
              <p className="text-xs text-muted-foreground">avg price</p>
            </div>
          </div>
        ))}
        
        {demandInsights.length === 0 && (
          <div className="text-center py-8">
            <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              Analyzing market demand patterns...
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}