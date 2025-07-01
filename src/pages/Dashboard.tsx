
import { Layout } from "@/components/layout/Layout";
import { StonesList } from "@/components/inventory/StonesList";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Gem, TrendingUp, DollarSign } from "lucide-react";
import { useStones } from "@/hooks/useStones";
import { useTelegramAuth } from "@/context/TelegramAuthContext";

export default function Dashboard() {
  const { user } = useTelegramAuth();
  const { stones, isLoading } = useStones();

  const totalStones = stones.length;
  const availableStones = stones.filter(stone => stone.status === 'available').length;
  const totalValue = stones.reduce((sum, stone) => 
    sum + ((stone.price_per_carat || 0) * stone.weight), 0
  );

  return (
    <Layout>
      <div className="space-y-6">
        {/* Welcome Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-lg">
          <h1 className="text-2xl font-bold mb-2">
            Welcome back, {user?.first_name}! 💎
          </h1>
          <p className="opacity-90">
            Manage your diamond inventory with ease
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Stones</CardTitle>
              <Gem className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalStones}</div>
              <p className="text-xs text-muted-foreground">
                {availableStones} available
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Value</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${totalValue.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                Inventory value
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Price/ct</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${totalStones > 0 ? Math.round(totalValue / stones.reduce((sum, s) => sum + s.weight, 0)).toLocaleString() : 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Per carat average
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Inventory Section */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Your Inventory</CardTitle>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Stone
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <StonesList />
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
