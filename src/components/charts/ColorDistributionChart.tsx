import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { formatCurrency } from "@/utils/numberUtils";

interface ColorDistribution {
  color: string;
  count: number;
  percentage: number;
  totalValue: number;
}

interface ColorDistributionChartProps {
  data: ColorDistribution[];
  loading?: boolean;
}

// Diamond color grade colors
const COLOR_PALETTE = {
  'D': '#f8fafc', // Near colorless - lightest
  'E': '#f1f5f9',
  'F': '#e2e8f0',
  'G': '#cbd5e1',
  'H': '#94a3b8',
  'I': '#64748b',
  'J': '#475569',
  'K': '#334155',
  'L': '#1e293b',
  'M': '#0f172a', // Most colored - darkest
  'Unknown': '#6b7280'
};

const getColorForGrade = (color: string): string => {
  return COLOR_PALETTE[color as keyof typeof COLOR_PALETTE] || '#3b82f6';
};

export function ColorDistributionChart({ data, loading = false }: ColorDistributionChartProps) {
  if (loading) {
    return (
      <Card className="bg-gradient-to-br from-amber-50/30 to-yellow-100/20 border-amber-200/30">
        <CardHeader>
          <CardTitle className="text-amber-700">Color Distribution</CardTitle>
          <CardDescription>Diamond color grade breakdown</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center">
            <div className="animate-pulse text-muted-foreground">Loading color data...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card className="bg-gradient-to-br from-amber-50/30 to-yellow-100/20 border-amber-200/30">
        <CardHeader>
          <CardTitle className="text-amber-700">Color Distribution</CardTitle>
          <CardDescription>Diamond color grade breakdown</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <div className="text-2xl mb-2">💎</div>
              <p>No color data available</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-background/95 backdrop-blur-sm border border-border rounded-lg p-3 shadow-lg">
          <p className="font-semibold text-foreground">Color Grade: {data.color}</p>
          <p className="text-sm text-muted-foreground">Count: {data.count} diamonds</p>
          <p className="text-sm text-muted-foreground">Percentage: {data.percentage.toFixed(1)}%</p>
          <p className="text-sm text-muted-foreground">Total Value: {formatCurrency(data.totalValue)}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="bg-gradient-to-br from-amber-50/30 to-yellow-100/20 border-amber-200/30">
      <CardHeader>
        <CardTitle className="text-amber-700 flex items-center gap-2">
          <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
          Color Distribution
        </CardTitle>
        <CardDescription>Diamond color grade breakdown • {data.reduce((sum, item) => sum + item.count, 0)} total</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={110}
              paddingAngle={2}
              dataKey="count"
            >
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={getColorForGrade(entry.color)}
                  stroke="hsl(var(--background))"
                  strokeWidth={2}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              verticalAlign="bottom" 
              height={36}
              formatter={(value, entry: any) => (
                <span className="text-xs font-medium" style={{ color: entry.color }}>
                  {value} ({entry.payload.count})
                </span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
        
        {/* Summary stats */}
        <div className="mt-4 pt-4 border-t border-border/30">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <p className="text-lg font-bold text-foreground">{data.length}</p>
              <p className="text-xs text-muted-foreground">Different Grades</p>
            </div>
            <div>
              <p className="text-lg font-bold text-foreground">
                {formatCurrency(data.reduce((sum, item) => sum + item.totalValue, 0))}
              </p>
              <p className="text-xs text-muted-foreground">Total Value</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}