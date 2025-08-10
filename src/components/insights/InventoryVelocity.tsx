
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, PieChart, Pie, Cell } from "recharts";
import { Clock, Zap, AlertCircle, Package } from "lucide-react";

interface InventoryVelocityData {
  turnoverRate: number;
  avgTimeToSell: number;
  fastMovers: Array<{
    shape: string;
    avgDaysToSell: number;
    volume: number;
  }>;
  slowMovers: Array<{
    shape: string;
    avgDaysInStock: number;
    count: number;
  }>;
  velocityTrend: Array<{
    month: string;
    turnoverRate: number;
    avgDaysToSell: number;
  }>;
  agingBreakdown: Array<{
    category: string;
    count: number;
    value: number;
    color: string;
  }>;
}

interface InventoryVelocityProps {
  data: InventoryVelocityData;
}

export function InventoryVelocity({ data }: InventoryVelocityProps) {
  const getVelocityRating = (turnoverRate: number) => {
    if (turnoverRate > 4) return { label: 'Excellent', color: 'bg-success/10 text-success border-success/20' };
    if (turnoverRate > 2) return { label: 'Good', color: 'bg-primary/10 text-primary border-primary/20' };
    if (turnoverRate > 1) return { label: 'Average', color: 'bg-warning/10 text-warning border-warning/20' };
    return { label: 'Needs Improvement', color: 'bg-destructive/10 text-destructive border-destructive/20' };
  };

  const velocityRating = getVelocityRating(data.turnoverRate);

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Zap className="h-5 w-5 text-warning" />
              Turnover Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">{data.turnoverRate.toFixed(1)}x</div>
              <Badge className={velocityRating.color}>{velocityRating.label}</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Clock className="h-5 w-5 text-primary" />
              Avg. Time to Sell
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-3xl font-bold">{data.avgTimeToSell}</div>
              <div className="text-sm text-muted-foreground">days</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Package className="h-5 w-5 text-secondary" />
              Inventory Health
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-2xl font-bold text-success">
                {((data.fastMovers.length / (data.fastMovers.length + data.slowMovers.length)) * 100).toFixed(0)}%
              </div>
              <div className="text-sm text-muted-foreground">Fast Moving</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Velocity Trend */}
      <Card>
        <CardHeader>
          <CardTitle>Velocity Trend Analysis</CardTitle>
          <CardDescription>Track how quickly your inventory moves over time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.velocityTrend}>
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="turnoverRate" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  name="Turnover Rate"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Fast vs Slow Movers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-success" />
              Fast Movers
            </CardTitle>
            <CardDescription>Shapes that sell quickly</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.fastMovers.map((shape, index) => (
                <div key={shape.shape} className="flex items-center justify-between p-3 bg-success/5 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="w-8 justify-center">#{index + 1}</Badge>
                    <div>
                      <p className="font-medium">{shape.shape}</p>
                      <p className="text-sm text-muted-foreground">{shape.volume} sold</p>
                    </div>
                  </div>
                  <Badge className="bg-success/10 text-success">
                    {shape.avgDaysToSell} days
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-warning" />
              Slow Movers
            </CardTitle>
            <CardDescription>Inventory that needs attention</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.slowMovers.map((shape, index) => (
                <div key={shape.shape} className="flex items-center justify-between p-3 bg-warning/5 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="w-8 justify-center text-warning border-warning/20">!</Badge>
                    <div>
                      <p className="font-medium">{shape.shape}</p>
                      <p className="text-sm text-muted-foreground">{shape.count} in stock</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-warning border-warning/20">
                    {shape.avgDaysInStock} days
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Aging Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Inventory Aging Analysis</CardTitle>
          <CardDescription>Breakdown of inventory by age categories</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.agingBreakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    dataKey="count"
                    label={({ category, count }) => `${category}: ${count}`}
                  >
                    {data.agingBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            <div className="space-y-4">
              {data.agingBreakdown.map((category) => (
                <div key={category.category} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-4 h-4 rounded-full" 
                      style={{ backgroundColor: category.color }}
                    />
                    <div>
                      <p className="font-medium">{category.category}</p>
                      <p className="text-sm text-muted-foreground">{category.count} diamonds</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">${category.value.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">total value</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
