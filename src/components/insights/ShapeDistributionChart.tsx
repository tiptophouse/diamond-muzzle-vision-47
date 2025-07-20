
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";

interface MarketTrend {
  category: string;
  count: number;
  percentage: number;
  change?: number;
}

interface ShapeDistributionChartProps {
  marketTrends: MarketTrend[];
}

export function ShapeDistributionChart({ marketTrends }: ShapeDistributionChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Inventory Distribution by Shape</CardTitle>
        <CardDescription>
          Shape breakdown of your current inventory
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={marketTrends}>
            <XAxis 
              dataKey="category" 
              tick={{ fontSize: 12 }}
              angle={-45}
              textAnchor="end"
              height={60}
            />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip 
              formatter={(value, name) => [value, name === 'count' ? 'Diamonds' : name]}
              labelFormatter={(label) => `Shape: ${label}`}
            />
            <Bar 
              dataKey="count" 
              fill="hsl(var(--primary))" 
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
