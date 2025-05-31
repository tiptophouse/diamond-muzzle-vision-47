
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface MarketTrend {
  category: string;
  count: number;
  percentage: number;
}

interface ShapeAnalysisCardProps {
  marketTrends: MarketTrend[];
}

export function ShapeAnalysisCard({ marketTrends }: ShapeAnalysisCardProps) {
  return (
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
  );
}
