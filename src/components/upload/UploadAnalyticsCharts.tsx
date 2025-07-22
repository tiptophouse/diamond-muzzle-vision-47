
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from "recharts";
import { UploadAnalytics } from "@/services/uploadAnalytics";

interface UploadAnalyticsChartsProps {
  analytics: UploadAnalytics;
}

const COLORS = ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#6366f1'];

export function UploadAnalyticsCharts({ analytics }: UploadAnalyticsChartsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Shape Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Shape Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer 
            config={{}} 
            className="h-[200px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={analytics.shapeDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, percentage }) => `${name} (${percentage}%)`}
                >
                  {analytics.shapeDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent />} />
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Price Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Price Range Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer 
            config={{}} 
            className="h-[200px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.priceDistribution.ranges}>
                <XAxis dataKey="range" />
                <YAxis />
                <Bar dataKey="count" fill="#8b5cf6" />
                <ChartTooltip content={<ChartTooltipContent />} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Color Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Color Grade Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer 
            config={{}} 
            className="h-[200px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.qualityDistribution.colorGrades.slice(0, 8)}>
                <XAxis dataKey="grade" />
                <YAxis />
                <Bar dataKey="count" fill="#06b6d4" />
                <ChartTooltip content={<ChartTooltipContent />} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Size Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Size Categories</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer 
            config={{}} 
            className="h-[200px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={analytics.sizeDistribution.categories}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  dataKey="count"
                  label={({ category, percentage }) => `${category} (${percentage}%)`}
                >
                  {analytics.sizeDistribution.categories.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent />} />
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}
