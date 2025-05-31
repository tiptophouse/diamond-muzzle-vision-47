
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Legend } from "recharts";

interface PriceComparisonData {
  shape: string;
  userAverage: number;
  marketAverage: number;
  count: number;
}

interface PriceComparisonChartProps {
  data: PriceComparisonData[];
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

export function PriceComparisonChart({ data, loading = false }: PriceComparisonChartProps) {
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
    <Card>
      <CardHeader>
        <CardTitle>Price Comparison: Your Prices vs Market Average</CardTitle>
        <p className="text-sm text-muted-foreground">
          Compare your average prices per carat with market averages by diamond shape
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
                    formatter={(value, name) => [
                      `$${Number(value).toLocaleString()}/ct`,
                      name === "userAverage" ? "Your Average" : "Market Average"
                    ]}
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
      </CardContent>
    </Card>
  );
}
