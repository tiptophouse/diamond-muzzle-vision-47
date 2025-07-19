import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useInventoryAnalytics, DeadStockAlert, VelocityMetric, DemandForecast } from '@/hooks/useInventoryAnalytics';
import { Diamond } from '@/components/inventory/InventoryTable';
import { AlertTriangle, TrendingUp, TrendingDown, Clock, DollarSign, Package, Zap } from 'lucide-react';

interface InventoryAnalyticsDashboardProps {
  diamonds: Diamond[];
}

export function InventoryAnalyticsDashboard({ diamonds }: InventoryAnalyticsDashboardProps) {
  const { analytics, loading, error } = useInventoryAnalytics(diamonds);

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
            <span className="text-sm text-muted-foreground">Analyzing inventory performance...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !analytics) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Analytics Error</AlertTitle>
        <AlertDescription>
          {error || "Unable to load analytics data. Please try again."}
        </AlertDescription>
      </Alert>
    );
  }

  const formatCurrency = (amount: number) => `$${amount.toLocaleString()}`;
  const formatDays = (days: number) => `${days} day${days === 1 ? '' : 's'}`;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Inventory Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(analytics.totalInventoryValue)}</div>
            <p className="text-xs text-muted-foreground">{diamonds.length} diamonds in stock</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Dead Stock Value</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{formatCurrency(analytics.deadStockValue)}</div>
            <p className="text-xs text-muted-foreground">{analytics.deadStockAlerts.length} items at risk</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Days on Market</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.avgDaysOnMarket}</div>
            <p className="text-xs text-muted-foreground">Across all inventory</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Performance</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex space-x-2">
              <span className="text-sm font-medium text-green-600">{analytics.fastMovingItems} Fast</span>
              <span className="text-sm font-medium text-red-600">{analytics.slowMovingItems} Slow</span>
            </div>
            <p className="text-xs text-muted-foreground">Moving categories</p>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Tabs */}
      <Tabs defaultValue="dead-stock" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="dead-stock">Dead Stock Alerts</TabsTrigger>
          <TabsTrigger value="velocity">Velocity Tracking</TabsTrigger>
          <TabsTrigger value="demand">Demand Forecast</TabsTrigger>
        </TabsList>

        <TabsContent value="dead-stock" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                <span>Dead Stock Alerts</span>
              </CardTitle>
              <CardDescription>
                Diamonds that have been in inventory for over 90 days
              </CardDescription>
            </CardHeader>
            <CardContent>
              {analytics.deadStockAlerts.length === 0 ? (
                <p className="text-center py-8 text-muted-foreground">
                  No dead stock detected. Great inventory management! 🎉
                </p>
              ) : (
                <div className="space-y-4">
                  {analytics.deadStockAlerts.map((alert, index) => (
                    <DeadStockAlertCard key={index} alert={alert} />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="velocity" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                <span>Velocity Tracking</span>
              </CardTitle>
              <CardDescription>
                How fast different categories of diamonds sell
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.velocityMetrics.map((metric, index) => (
                  <VelocityMetricCard key={index} metric={metric} />
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="demand" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                <span>Demand Forecasting</span>
              </CardTitle>
              <CardDescription>
                Recommended stock levels based on market demand
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.demandForecasts.map((forecast, index) => (
                  <DemandForecastCard key={index} forecast={forecast} />
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function DeadStockAlertCard({ alert }: { alert: DeadStockAlert }) {
  return (
    <Alert className="border-destructive/50">
      <AlertTriangle className="h-4 w-4" />
      <div className="ml-2 flex-1">
        <div className="flex items-center justify-between">
          <AlertTitle className="text-sm">
            {alert.diamond.shape} {alert.diamond.carat}ct #{alert.diamond.stockNumber}
          </AlertTitle>
          <Badge variant="destructive">{alert.daysOnMarket} days</Badge>
        </div>
        <AlertDescription className="mt-2">
          <div className="flex flex-col space-y-2">
            <div className="flex justify-between text-sm">
              <span>Current Price:</span>
              <span className="font-medium">${alert.diamond.price.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Estimated Loss:</span>
              <span className="font-medium text-destructive">${alert.estimatedLoss.toLocaleString()}</span>
            </div>
            <div className="mt-2">
              <p className="text-xs font-medium mb-1">Recommendations:</p>
              {alert.recommendations.map((rec, idx) => (
                <p key={idx} className="text-xs text-muted-foreground">• {rec}</p>
              ))}
            </div>
          </div>
        </AlertDescription>
      </div>
    </Alert>
  );
}

function VelocityMetricCard({ metric }: { metric: VelocityMetric }) {
  const getVelocityColor = (velocity: string) => {
    switch (velocity) {
      case 'fast': return 'text-green-600';
      case 'medium': return 'text-yellow-600';
      case 'slow': return 'text-red-600';
      default: return 'text-muted-foreground';
    }
  };

  const getVelocityIcon = (velocity: string) => {
    switch (velocity) {
      case 'fast': return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'medium': return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'slow': return <TrendingDown className="h-4 w-4 text-red-600" />;
      default: return <Package className="h-4 w-4" />;
    }
  };

  return (
    <div className="flex items-center justify-between p-4 border rounded-lg">
      <div className="flex items-center space-x-3">
        {getVelocityIcon(metric.velocity)}
        <div>
          <p className="font-medium">{metric.value}</p>
          <p className="text-sm text-muted-foreground">
            {metric.currentInventory} in stock, {metric.totalSold} sold
          </p>
        </div>
      </div>
      <div className="text-right">
        <p className={`font-medium ${getVelocityColor(metric.velocity)}`}>
          {metric.averageDaysToSell} days avg
        </p>
        <Badge variant={metric.velocity === 'fast' ? 'default' : metric.velocity === 'slow' ? 'destructive' : 'secondary'}>
          {metric.velocity}
        </Badge>
      </div>
    </div>
  );
}

function DemandForecastCard({ forecast }: { forecast: DemandForecast }) {
  const demandTrend = forecast.projectedDemand > forecast.currentDemand ? 'up' : 'down';
  
  return (
    <div className="p-4 border rounded-lg">
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="font-medium">
            {forecast.shape} {forecast.caratRange} {forecast.colorGrade}/{forecast.clarityGrade}
          </p>
          <div className="flex items-center space-x-2 mt-1">
            {demandTrend === 'up' ? (
              <TrendingUp className="h-4 w-4 text-green-600" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-600" />
            )}
            <span className="text-sm text-muted-foreground">
              Demand: {forecast.currentDemand} → {forecast.projectedDemand}
            </span>
          </div>
        </div>
        <Badge variant={forecast.profitPotential > 1000 ? 'default' : 'secondary'}>
          ${forecast.profitPotential.toFixed(0)} profit potential
        </Badge>
      </div>
      
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-muted-foreground">Recommended Stock:</p>
          <p className="font-medium">{forecast.recommendedStock} pieces</p>
        </div>
        <div>
          <p className="text-muted-foreground">Market Opportunity:</p>
          <p className={`font-medium ${demandTrend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
            {demandTrend === 'up' ? 'Growing' : 'Declining'}
          </p>
        </div>
      </div>
      
      <div className="mt-3">
        <div className="flex justify-between text-xs text-muted-foreground mb-1">
          <span>Demand Strength</span>
          <span>{forecast.projectedDemand}/25</span>
        </div>
        <Progress value={(forecast.projectedDemand / 25) * 100} className="h-2" />
      </div>
    </div>
  );
}