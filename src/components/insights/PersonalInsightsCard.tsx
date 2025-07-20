import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DollarSign, TrendingUp, Crown, AlertCircle } from "lucide-react";

interface PersonalInsight {
  inventoryValue: number;
  mostProfitableShape: string;
  leastProfitableShape: string;
  avgPricePerCarat: number;
  portfolioGrowth: number;
}

interface PersonalInsightsCardProps {
  personalInsights: PersonalInsight | null;
}

export function PersonalInsightsCard({ personalInsights }: PersonalInsightsCardProps) {
  if (!personalInsights) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-primary" />
            Personal Portfolio Insights
          </CardTitle>
          <CardDescription>
            Your inventory performance analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <DollarSign className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              Add diamonds to see personal insights
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-primary" />
          Personal Portfolio Insights
        </CardTitle>
        <CardDescription>
          Your inventory performance analysis
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="text-center p-4 bg-success/5 rounded-lg">
            <DollarSign className="h-6 w-6 text-success mx-auto mb-2" />
            <div className="text-2xl font-bold text-success">
              ${personalInsights.inventoryValue.toLocaleString()}
            </div>
            <div className="text-sm text-muted-foreground">Total Value</div>
          </div>
          
          <div className="text-center p-4 bg-primary/5 rounded-lg">
            <TrendingUp className="h-6 w-6 text-primary mx-auto mb-2" />
            <div className="text-2xl font-bold text-primary">
              +{personalInsights.portfolioGrowth}%
            </div>
            <div className="text-sm text-muted-foreground">Growth</div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Crown className="h-4 w-4 text-warning" />
              <span className="text-sm font-medium">Top Performer</span>
            </div>
            <Badge className="bg-warning/10 text-warning border-warning/20">
              {personalInsights.mostProfitableShape}
            </Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Needs Attention</span>
            </div>
            <Badge variant="outline">
              {personalInsights.leastProfitableShape}
            </Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Avg. Price/Carat</span>
            </div>
            <Badge variant="secondary">
              ${personalInsights.avgPricePerCarat.toLocaleString()}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}