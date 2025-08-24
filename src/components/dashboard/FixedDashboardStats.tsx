
import { Card, CardContent } from "@/components/ui/card";
import { Diamond, TrendingUp, DollarSign, Package } from "lucide-react";
import { Diamond as DiamondType } from "@/components/inventory/InventoryTable";
import { processDiamondDataForDashboard, formatCurrency } from "@/services/dashboardDataProcessor";
import { useRealTimeUserCount } from "@/hooks/useRealTimeUserCount";

interface FixedDashboardStatsProps {
  diamonds: DiamondType[];
}

export function FixedDashboardStats({ diamonds }: FixedDashboardStatsProps) {
  const { stats } = processDiamondDataForDashboard(diamonds);
  const { userCount } = useRealTimeUserCount();
  
  return (
    <div className="grid grid-cols-2 gap-4 mb-6">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <Diamond className="h-5 w-5 text-blue-500" />
            <span className="text-xs text-green-600 font-medium">+12%</span>
          </div>
          <div className="text-2xl font-bold">{stats.totalDiamonds.toLocaleString()}</div>
          <div className="text-sm text-muted-foreground">Inventory</div>
          <div className="text-xs text-muted-foreground">Total stones</div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <DollarSign className="h-5 w-5 text-blue-500" />
            <span className="text-xs text-green-600 font-medium">+8%</span>
          </div>
          <div className="text-2xl font-bold">{formatCurrency(stats.totalValue)}</div>
          <div className="text-sm text-muted-foreground">Value</div>
          <div className="text-xs text-muted-foreground">Portfolio</div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <Package className="h-5 w-5 text-blue-500" />
            <span className="text-xs text-green-600 font-medium">+5%</span>
          </div>
          <div className="text-2xl font-bold">{stats.totalDiamonds.toLocaleString()}</div>
          <div className="text-sm text-muted-foreground">Available</div>
          <div className="text-xs text-muted-foreground">Ready to sell</div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="h-5 w-5 text-blue-500" />
            <span className="text-xs text-red-600 font-medium">2%</span>
          </div>
          <div className="text-2xl font-bold">{formatCurrency(stats.averagePrice)}</div>
          <div className="text-sm text-muted-foreground">Price/Ct</div>
          <div className="text-xs text-muted-foreground">Average</div>
        </CardContent>
      </Card>

      {userCount > 0 && (
        <Card className="col-span-2">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="font-semibold">{userCount} user{userCount !== 1 ? 's' : ''} online</span>
              </div>
              <span className="text-sm text-muted-foreground">Live count</span>
              <div className="ml-auto text-2xl font-bold text-blue-500">{userCount}</div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
