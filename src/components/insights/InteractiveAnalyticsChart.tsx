import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Diamond } from '@/components/inventory/InventoryTable';

interface InteractiveAnalyticsChartProps {
  diamonds: Diamond[];
}

const COLORS = ['#059669', '#0ea5e9', '#8b5cf6', '#f59e0b', '#ef4444', '#84cc16', '#f97316'];

export function InteractiveAnalyticsChart({ diamonds }: InteractiveAnalyticsChartProps) {
  const [metric, setMetric] = useState<'shape' | 'color' | 'clarity' | 'cut' | 'status'>('shape');

  const processData = (selectedMetric: string) => {
    const counts: Record<string, number> = {};
    const values: Record<string, number> = {};

    diamonds.forEach((diamond) => {
      const key = diamond[selectedMetric as keyof Diamond] as string || 'לא ידוע';
      counts[key] = (counts[key] || 0) + 1;
      values[key] = (values[key] || 0) + (diamond.price || 0);
    });

    return Object.entries(counts).map(([name, count]) => ({
      name,
      count,
      value: values[name] || 0,
      percentage: ((count / diamonds.length) * 100).toFixed(1)
    })).sort((a, b) => b.count - a.count);
  };

  const data = processData(metric);
  const [chartType, setChartType] = useState<'bar' | 'pie'>('bar');

  const metricLabels = {
    shape: 'צורה',
    color: 'צבע',
    clarity: 'ניקיון',
    cut: 'חיתוך',
    status: 'סטטוס'
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>ניתוח אינטראקטיבי של המלאי</CardTitle>
        <CardDescription>בחר פרמטר לניתוח מפורט של המלאי שלך</CardDescription>
        <div className="flex gap-4">
          <Select value={metric} onValueChange={(value: any) => setMetric(value)}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="shape">צורה</SelectItem>
              <SelectItem value="color">צבע</SelectItem>
              <SelectItem value="clarity">ניקיון</SelectItem>
              <SelectItem value="cut">חיתוך</SelectItem>
              <SelectItem value="status">סטטוס</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={chartType} onValueChange={(value: any) => setChartType(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="bar">עמודות</SelectItem>
              <SelectItem value="pie">עוגה</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            {chartType === 'bar' ? (
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip 
                  formatter={(value, name) => [
                    name === 'count' ? `${value} יחידות` : `$${Number(value).toLocaleString()}`,
                    name === 'count' ? 'כמות' : 'ערך'
                  ]}
                />
                <Bar dataKey="count" fill="#059669" />
              </BarChart>
            ) : (
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percentage }) => `${name} (${percentage}%)`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value} יחידות`, 'כמות']} />
              </PieChart>
            )}
          </ResponsiveContainer>
        </div>
        
        <div className="mt-6 grid grid-cols-2 md:grid-cols-3 gap-4">
          {data.slice(0, 6).map((item, index) => (
            <div key={item.name} className="text-center p-3 bg-muted/30 rounded-lg">
              <div 
                className="w-4 h-4 rounded-full mx-auto mb-2"
                style={{ backgroundColor: COLORS[index % COLORS.length] }}
              ></div>
              <p className="font-medium text-sm">{item.name}</p>
              <p className="text-xs text-muted-foreground">
                {item.count} יחידות ({item.percentage}%)
              </p>
              <p className="text-xs font-medium">
                ${item.value.toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}