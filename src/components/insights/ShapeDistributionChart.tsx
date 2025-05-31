
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";

interface MarketTrend {
  category: string;
  count: number;
  percentage: number;
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
  );
}
