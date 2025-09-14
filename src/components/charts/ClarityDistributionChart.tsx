import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Eye } from 'lucide-react';
import { useTelegramHapticFeedback } from '@/hooks/useTelegramHapticFeedback';

interface ClarityDistribution {
  clarity: string;
  count: number;
}

interface ClarityDistributionChartProps {
  distribution: ClarityDistribution[];
  isLoading: boolean;
}

export function ClarityDistributionChart({ distribution, isLoading }: ClarityDistributionChartProps) {
  const { selectionChanged } = useTelegramHapticFeedback();

  const chartData = distribution.map(item => ({
    clarity: item.clarity,
    count: item.count,
    name: item.clarity
  }));

  const handleChartClick = () => {
    selectionChanged();
  };

  return (
    <Card className="bg-background/60 backdrop-blur-sm border-primary/10">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Eye className="w-5 h-5 text-primary" />
          Clarity Distribution
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
              <Eye className="w-8 h-8 mx-auto mb-2 text-muted-foreground/50" />
              <p>No clarity data available</p>
            </div>
          </div>
        ) : (
          <div className="h-48" onClick={handleChartClick}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 15, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
                <XAxis 
                  dataKey="clarity" 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={10}
                  tickMargin={5}
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={10}
                  width={30}
                />
                <Tooltip 
                  formatter={(value) => [`${value} diamonds`, 'Count']}
                  labelFormatter={(label) => `Clarity: ${label}`}
                  contentStyle={{
                    backgroundColor: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }}
                />
                <Bar 
                  dataKey="count" 
                  fill="hsl(var(--primary))"
                  radius={[3, 3, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}