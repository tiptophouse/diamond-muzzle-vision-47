import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useWeeklyKPIs } from '@/hooks/useWeeklyKPIs';
import { 
  TrendingUp, 
  Users, 
  Eye, 
  Share2, 
  MessageSquare, 
  DollarSign,
  Package,
  Activity,
  Mail,
  MousePointerClick,
  BarChart3,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { startOfWeek, endOfWeek, format } from 'date-fns';

export function WeeklyKPIDashboard() {
  const { kpis, isLoading, error, refetch } = useWeeklyKPIs();

  const weekStart = startOfWeek(new Date(), { weekStartsOn: 0 });
  const weekEnd = endOfWeek(new Date(), { weekStartsOn: 0 });

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full border-destructive">
        <CardContent className="py-6">
          <p className="text-destructive text-center">Error: {error}</p>
          <Button onClick={refetch} className="mt-4 mx-auto block">
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!kpis) return null;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('en-US').format(value);
  };

  const kpiCards = [
    // Inventory Section
    {
      title: 'Diamonds Added',
      value: formatNumber(kpis.diamondsAdded),
      icon: Package,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      title: 'Inventory Value',
      value: formatCurrency(kpis.totalInventoryValue),
      icon: DollarSign,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
    },
    {
      title: 'Avg Diamond Price',
      value: formatCurrency(kpis.avgDiamondPrice),
      icon: TrendingUp,
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-500/10',
    },
    
    // User Metrics
    {
      title: 'New Users',
      value: formatNumber(kpis.newUsers),
      icon: Users,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
    },
    {
      title: 'Active Users',
      value: formatNumber(kpis.activeUsers),
      icon: Activity,
      color: 'text-pink-500',
      bgColor: 'bg-pink-500/10',
    },
    {
      title: 'Total Users',
      value: formatNumber(kpis.totalUsers),
      icon: Users,
      color: 'text-indigo-500',
      bgColor: 'bg-indigo-500/10',
    },
    
    // Engagement Metrics
    {
      title: 'Total Shares',
      value: formatNumber(kpis.totalShares),
      icon: Share2,
      color: 'text-cyan-500',
      bgColor: 'bg-cyan-500/10',
    },
    {
      title: 'Total Views',
      value: formatNumber(kpis.totalViews),
      icon: Eye,
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10',
    },
    {
      title: 'Total Offers',
      value: formatNumber(kpis.totalOffers),
      icon: DollarSign,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-500/10',
    },
    
    // Offer Metrics
    {
      title: 'Total Offers Value',
      value: formatCurrency(kpis.totalOffersValue),
      icon: TrendingUp,
      color: 'text-lime-500',
      bgColor: 'bg-lime-500/10',
    },
    {
      title: 'Avg Offer Value',
      value: formatCurrency(kpis.avgOfferValue),
      icon: BarChart3,
      color: 'text-teal-500',
      bgColor: 'bg-teal-500/10',
    },
    
    // Bot Metrics
    {
      title: 'Bot Messages',
      value: formatNumber(kpis.botMessages),
      icon: MessageSquare,
      color: 'text-violet-500',
      bgColor: 'bg-violet-500/10',
    },
    {
      title: 'Bot Commands',
      value: formatNumber(kpis.botCommands),
      icon: Activity,
      color: 'text-fuchsia-500',
      bgColor: 'bg-fuchsia-500/10',
    },
    
    // Campaign Metrics
    {
      title: 'Campaigns Sent',
      value: formatNumber(kpis.campaignsSent),
      icon: Mail,
      color: 'text-rose-500',
      bgColor: 'bg-rose-500/10',
    },
    {
      title: 'Campaign Clicks',
      value: formatNumber(kpis.campaignClicks),
      icon: MousePointerClick,
      color: 'text-amber-500',
      bgColor: 'bg-amber-500/10',
    },
    
    // Analytics
    {
      title: 'Page Visits',
      value: formatNumber(kpis.pageVisits),
      icon: Eye,
      color: 'text-sky-500',
      bgColor: 'bg-sky-500/10',
    },
    {
      title: 'Sessions',
      value: formatNumber(kpis.sessionCount),
      icon: Activity,
      color: 'text-slate-500',
      bgColor: 'bg-slate-500/10',
    },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold">Weekly KPI Dashboard</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {format(weekStart, 'MMM d')} - {format(weekEnd, 'MMM d, yyyy')}
              </p>
            </div>
            <Button onClick={refetch} variant="outline" size="sm">
              <Activity className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((kpi, index) => {
          const Icon = kpi.icon;
          return (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">
                      {kpi.title}
                    </p>
                    <p className="text-2xl font-bold">
                      {kpi.value}
                    </p>
                  </div>
                  <div className={`p-2 rounded-lg ${kpi.bgColor}`}>
                    <Icon className={`h-5 w-5 ${kpi.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5">
          <CardHeader>
            <CardTitle className="text-lg">Engagement Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {kpis.totalViews > 0 
                ? ((kpis.totalOffers / kpis.totalViews) * 100).toFixed(1) 
                : '0'}%
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Offers per view
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500/10 to-green-600/5">
          <CardHeader>
            <CardTitle className="text-lg">Share Effectiveness</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {kpis.totalShares > 0 
                ? (kpis.totalViews / kpis.totalShares).toFixed(1) 
                : '0'}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Views per share
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/5">
          <CardHeader>
            <CardTitle className="text-lg">User Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {kpis.totalUsers > 0 
                ? ((kpis.activeUsers / kpis.totalUsers) * 100).toFixed(1) 
                : '0'}%
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Active user rate
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
