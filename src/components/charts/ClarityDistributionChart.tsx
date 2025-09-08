import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { formatCurrency } from "@/utils/numberUtils";

interface ClarityDistribution {
  clarity: string;
  count: number;
  percentage: number;
  totalValue: number;
}

interface ClarityDistributionChartProps {
  data: ClarityDistribution[];
  loading?: boolean;
}

// Diamond clarity grade colors (from best to worst)
const CLARITY_COLORS = {
  'FL': '#10b981', // Flawless - emerald
  'IF': '#059669', // Internally Flawless
  'VVS1': '#0d9488', // Very Very Slightly Included
  'VVS2': '#0891b2',
  'VS1': '#0284c7', // Very Slightly Included
  'VS2': '#2563eb',
  'SI1': '#4f46e5', // Slightly Included
  'SI2': '#7c3aed',
  'I1': '#a855f7', // Included
  'I2': '#c084fc',
  'I3': '#d8b4fe',
  'Unknown': '#6b7280'
};

const getColorForClarity = (clarity: string): string => {
  return CLARITY_COLORS[clarity as keyof typeof CLARITY_COLORS] || '#3b82f6';
};

export function ClarityDistributionChart({ data, loading = false }: ClarityDistributionChartProps) {
  if (loading) {
    return (
      <Card className="bg-gradient-to-br from-emerald-50/30 to-teal-100/20 border-emerald-200/30">
        <CardHeader>
          <CardTitle className="text-emerald-700">Clarity Distribution</CardTitle>
          <CardDescription>Diamond clarity grade breakdown</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center">
            <div className="animate-pulse text-muted-foreground">Loading clarity data...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card className="bg-gradient-to-br from-emerald-50/30 to-teal-100/20 border-emerald-200/30">
        <CardHeader>
          <CardTitle className="text-emerald-700">Clarity Distribution</CardTitle>
          <CardDescription>Diamond clarity grade breakdown</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <div className="text-2xl mb-2">💎</div>
              <p>No clarity data available</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-background/95 backdrop-blur-sm border border-border rounded-lg p-3 shadow-lg">
          <p className="font-semibold text-foreground">Clarity Grade: {label}</p>
          <p className="text-sm text-muted-foreground">Count: {data.count} diamonds</p>
          <p className="text-sm text-muted-foreground">Percentage: {data.percentage.toFixed(1)}%</p>
          <p className="text-sm text-muted-foreground">Total Value: {formatCurrency(data.totalValue)}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="bg-gradient-to-br from-emerald-50/30 to-teal-100/20 border-emerald-200/30">
      <CardHeader>
        <CardTitle className="text-emerald-700 flex items-center gap-2">
          <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
          Clarity Distribution
        </CardTitle>
        <CardDescription>Diamond clarity grade breakdown • {data.reduce((sum, item) => sum + item.count, 0)} total</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
            <XAxis 
              dataKey="clarity" 
              tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
              axisLine={{ stroke: 'hsl(var(--border))' }}
            />
            <YAxis 
              tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
              axisLine={{ stroke: 'hsl(var(--border))' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar 
              dataKey="count" 
              radius={[4, 4, 0, 0]}
            >
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`}
                  fill={getColorForClarity(entry.clarity)}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        
        {/* Top clarity grades */}
        <div className="mt-4 pt-4 border-t border-border/30">
          <div className="grid grid-cols-3 gap-2 text-center">
            {data.slice(0, 3).map((item, index) => (
              <div key={item.clarity} className="bg-background/50 rounded-lg p-2">
                <div 
                  className="w-3 h-3 rounded-full mx-auto mb-1"
                  style={{ backgroundColor: getColorForClarity(item.clarity) }}
                />
                <p className="text-xs font-medium text-foreground truncate">{item.clarity}</p>
                <p className="text-xs text-muted-foreground">{item.count}</p>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}