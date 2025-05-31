
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface MarketTrend {
  category: string;
  count: number;
  percentage: number;
}

interface QuickStatsGridProps {
  totalDiamonds: number;
  marketTrends: MarketTrend[];
}

export function QuickStatsGrid({ totalDiamonds, marketTrends }: QuickStatsGridProps) {
  return (
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
  );
}
