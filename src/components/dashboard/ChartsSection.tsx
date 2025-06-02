
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { InventoryChart } from "@/components/dashboard/InventoryChart";

interface Diamond {
  carat?: number;
  shape?: string;
  color?: string;
  clarity?: string;
  price?: number;
  stockNumber?: string;
}

interface ChartsData {
  name: string;
  value: number;
  color?: string;
}

interface ChartsSectionProps {
  chartData: ChartsData[];
  premiumDiamonds: Diamond[];
  inventoryLoading: boolean;
}

export function ChartsSection({ chartData, premiumDiamonds, inventoryLoading }: ChartsSectionProps) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Shape Distribution</CardTitle>
          <CardDescription className="text-sm">
            Your inventory breakdown
          </CardDescription>
        </CardHeader>
        <CardContent>
          <InventoryChart data={chartData} title="" loading={inventoryLoading} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Premium Collection</CardTitle>
          <CardDescription className="text-sm">
            Highest value diamonds
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-[300px] overflow-y-auto">
            {premiumDiamonds.slice(0, 8).map((diamond, index) => (
              <div key={index} className="flex justify-between items-center p-2 rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 border">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {diamond.carat}ct {diamond.shape} {diamond.color} {diamond.clarity}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Stock: {diamond.stockNumber}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-blue-600">
                    ${(diamond.price || 0).toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    ${Math.round((diamond.price || 0) / (diamond.carat || 1)).toLocaleString()}/ct
                  </p>
                </div>
              </div>
            ))}
            {premiumDiamonds.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                No premium diamonds in inventory
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
