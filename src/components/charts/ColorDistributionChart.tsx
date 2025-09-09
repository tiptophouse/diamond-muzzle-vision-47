import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Palette } from 'lucide-react';
import { useTelegramHapticFeedback } from '@/hooks/useTelegramHapticFeedback';

interface ColorDistribution {
  color: string;
  count: number;
}

interface ColorDistributionChartProps {
  distribution: ColorDistribution[];
  isLoading: boolean;
}

// Diamond industry standard color grading with accurate colors
const DIAMOND_COLORS = {
  'D': '#ffffff',
  'E': '#fefefe', 
  'F': '#fdfdfd',
  'G': '#fbfbfb',
  'H': '#f9f9f9',
  'I': '#f5f5dc',
  'J': '#f0e68c', // Light yellow
  'K': '#daa520', // Golden yellow  
  'L': '#cd853f', // Light orange
  'M': '#d2691e', // Orange
  'N': '#a0522d', // Brown/gray
  'O': '#8b4513', // Darker brown
  'P': '#654321', // Dark brown
  'Q': '#5d4037',
  'R': '#4e342e',
  'S': '#3e2723',
  'T': '#2e1609',
  'U': '#1e0e06',
  'V': '#0f0703',
  'W': '#0a0502',
  'X': '#050201',
  'Y': '#030100',
  'Z': '#020100'
};

export function ColorDistributionChart({ distribution, isLoading }: ColorDistributionChartProps) {
  const { selectionChanged } = useTelegramHapticFeedback();

  const chartData = distribution.map(item => ({
    color: item.color,
    count: item.count,
    name: `Grade ${item.color}`
  }));

  const handleChartClick = () => {
    selectionChanged();
  };

  return (
    <Card className="bg-background/60 backdrop-blur-sm border-primary/10">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Palette className="w-5 h-5 text-primary" />
          Color Distribution
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="h-48 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : chartData.length === 0 ? (
          <div className="h-48 flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <Palette className="w-8 h-8 mx-auto mb-2 text-muted-foreground/50" />
              <p>No color data available</p>
            </div>
          </div>
        ) : (
          <div className="h-48" onClick={handleChartClick}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={25}
                  outerRadius={65}
                  paddingAngle={2}
                  dataKey="count"
                >
                   {chartData.map((entry, index) => (
                     <Cell 
                       key={`cell-${index}`} 
                       fill={DIAMOND_COLORS[entry.color as keyof typeof DIAMOND_COLORS] || 'hsl(var(--muted))'} 
                       stroke="hsl(var(--border))"
                       strokeWidth={1}
                     />
                   ))}
                </Pie>
                 <Tooltip 
                   formatter={(value, name, props) => [
                     `${value} diamonds`,
                     `Grade ${props.payload.color}`
                   ]}
                   contentStyle={{
                     backgroundColor: 'hsl(var(--popover))',
                     border: '1px solid hsl(var(--border))',
                     borderRadius: '8px',
                     fontSize: '12px',
                     boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                   }}
                 />
                <Legend 
                  verticalAlign="bottom"
                  height={20}
                  formatter={(value) => `${value}`}
                  iconType="circle"
                  wrapperStyle={{ fontSize: '11px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}