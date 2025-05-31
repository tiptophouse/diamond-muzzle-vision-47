
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Legend } from "recharts";
import { Badge } from "@/components/ui/badge";

interface PriceComparisonData {
  shape: string;
  userAverage: number;
  marketAverage: number;
  count: number;
  similarStonesCount: number;
  priceRange: {
    min: number;
    max: number;
  };
}

interface DetailedComparison {
  selectedStone: any;
  similarStones: any[];
  averagePrice: number;
  pricePosition: 'below' | 'average' | 'above';
  percentageDifference: number;
}

interface PriceComparisonChartProps {
  data: PriceComparisonData[];
  selectedStoneComparison?: DetailedComparison | null;
  loading?: boolean;
}

const chartConfig = {
  userAverage: {
    label: "Your Average Price",
    color: "#8b5cf6",
  },
  marketAverage: {
    label: "Market Average Price",
    color: "#06b6d4",
  },
};

export function PriceComparisonChart({ data, selectedStoneComparison, loading = false }: PriceComparisonChartProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Price Comparison Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] bg-gray-100 animate-pulse rounded" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Price Comparison: Your Prices vs Market Average</CardTitle>
          <p className="text-sm text-muted-foreground">
            Market averages calculated based on similar stones in your inventory with comparable characteristics
          </p>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                <XAxis 
                  dataKey="shape" 
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis 
                  tickFormatter={(value) => `$${value.toLocaleString()}`}
                />
                <ChartTooltip 
                  content={
                    <ChartTooltipContent 
                      formatter={(value, name, props) => {
                        const payload = props.payload;
                        return [
                          `$${Number(value).toLocaleString()}/ct`,
                          name === "userAverage" ? "Your Average" : `Market Average (${payload?.similarStonesCount || 0} similar stones)`
                        ];
                      }}
                    />
                  }
                />
                <Legend />
                <Bar 
                  dataKey="userAverage" 
                  fill="var(--color-userAverage)" 
                  name="Your Average Price/ct"
                  radius={[4, 4, 0, 0]}
                />
                <Bar 
                  dataKey="marketAverage" 
                  fill="var(--color-marketAverage)" 
                  name="Market Average Price/ct"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
          
          {/* Summary badges */}
          <div className="flex flex-wrap gap-2 mt-4">
            {data.map((item) => (
              <Badge key={item.shape} variant="outline" className="text-xs">
                {item.shape}: {item.count} stones, avg {item.similarStonesCount} similar per stone
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Detailed stone comparison */}
      {selectedStoneComparison && (
        <Card>
          <CardHeader>
            <CardTitle>Detailed Stone Analysis</CardTitle>
            <p className="text-sm text-muted-foreground">
              Compare your selected stone against similar stones
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Selected stone details */}
              <div className="space-y-4">
                <h4 className="font-semibold">Your Stone</h4>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>Shape: <span className="font-medium">{selectedStoneComparison.selectedStone.shape}</span></div>
                    <div>Weight: <span className="font-medium">{selectedStoneComparison.selectedStone.carat}ct</span></div>
                    <div>Color: <span className="font-medium">{selectedStoneComparison.selectedStone.color}</span></div>
                    <div>Clarity: <span className="font-medium">{selectedStoneComparison.selectedStone.clarity}</span></div>
                    <div>Cut: <span className="font-medium">{selectedStoneComparison.selectedStone.cut || 'N/A'}</span></div>
                    <div>Price/ct: <span className="font-medium">
                      ${Math.round(selectedStoneComparison.selectedStone.price / selectedStoneComparison.selectedStone.carat).toLocaleString()}
                    </span></div>
                  </div>
                </div>
              </div>

              {/* Comparison results */}
              <div className="space-y-4">
                <h4 className="font-semibold">Market Comparison</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Similar stones found:</span>
                    <Badge variant="secondary">{selectedStoneComparison.similarStones.length}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Average market price:</span>
                    <span className="font-medium">${selectedStoneComparison.averagePrice.toLocaleString()}/ct</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Your position:</span>
                    <Badge 
                      variant={
                        selectedStoneComparison.pricePosition === 'above' ? 'destructive' :
                        selectedStoneComparison.pricePosition === 'below' ? 'default' :
                        'secondary'
                      }
                    >
                      {selectedStoneComparison.percentageDifference > 0 ? '+' : ''}
                      {selectedStoneComparison.percentageDifference}% 
                      ({selectedStoneComparison.pricePosition} market)
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
