
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { InventoryData, formatCurrency } from "@/services/dashboardDataProcessor";

export interface MarketInsightsProps {
  data: InventoryData[];
  matchedPairs: number;
  totalLeads: number;
}

export function MarketInsights({ data, matchedPairs, totalLeads }: MarketInsightsProps) {
  return (
    <div className="bg-white rounded-lg border p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Market Insights</h3>
        <div className="flex gap-4 text-sm text-muted-foreground">
          <span>Matched Pairs: {matchedPairs}</span>
          <span>Total Leads: {totalLeads}</span>
        </div>
      </div>
      
      {data.length > 0 ? (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="shape" 
              tick={{ fontSize: 12 }}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip 
              formatter={(value: number, name: string) => [
                name === 'totalValue' ? formatCurrency(value) : value,
                name === 'totalValue' ? 'Total Value' : 'Count'
              ]}
            />
            <Bar dataKey="count" fill="#8884d8" />
            <Bar dataKey="totalValue" fill="#82ca9d" />
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <div className="flex items-center justify-center h-[300px] text-muted-foreground">
          No market data available
        </div>
      )}
    </div>
  );
}
