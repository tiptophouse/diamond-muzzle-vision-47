
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function MarketInsights() {
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Market Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Portfolio Growth</span>
              <span className="text-sm font-semibold text-green-600">+12.5%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Market Index</span>
              <span className="text-sm font-semibold text-blue-600">+8.2%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Outperformance</span>
              <span className="text-sm font-semibold text-purple-600">+4.3%</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="text-sm">
              <span className="font-medium">Best Performers:</span> Round, Princess
            </div>
            <div className="text-sm">
              <span className="font-medium">Trending:</span> Fancy colors
            </div>
            <div className="text-sm">
              <span className="font-medium">Recommend:</span> Increase 1-2ct inventory
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>New inquiry</span>
              <span className="text-muted-foreground">2h ago</span>
            </div>
            <div className="flex justify-between">
              <span>Price updated</span>
              <span className="text-muted-foreground">4h ago</span>
            </div>
            <div className="flex justify-between">
              <span>Inventory sync</span>
              <span className="text-muted-foreground">6h ago</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
