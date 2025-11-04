import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Brain, TrendingUp, Users, Target, CheckCircle2, TrendingDown, Package, PackageX, Zap } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface CampaignSegmentsProps {
  stats: {
    totalUsers: number;
    activeUsers: number;
    inactiveUsers: number;
    usersWithStock: number;
    usersWithoutStock: number;
  };
  onRefresh: () => void;
}

export function CampaignSegments({ stats, onRefresh }: CampaignSegmentsProps) {
  const segments = [
    {
      id: 'inactive_no_stock',
      name: 'Inactive Without Stock',
      description: 'Users who haven\'t been active and have no diamonds',
      count: Math.round(stats.inactiveUsers * 0.4), // Estimate
      icon: TrendingDown,
      color: 'red',
      priority: 'HIGH',
      action: 'Re-engage with onboarding help',
      bgClass: 'bg-red-500/10 border-red-500/30'
    },
    {
      id: 'inactive_with_stock',
      name: 'Inactive With Stock',
      description: 'Users with diamonds but inactive recently',
      count: Math.round(stats.inactiveUsers * 0.6), // Estimate
      icon: Package,
      color: 'orange',
      priority: 'HIGH',
      action: 'Remind about inventory & features',
      bgClass: 'bg-orange-500/10 border-orange-500/30'
    },
    {
      id: 'active_no_stock',
      name: 'Active Without Stock',
      description: 'Active users but haven\'t uploaded diamonds',
      count: Math.round(stats.activeUsers * 0.3), // Estimate
      icon: PackageX,
      color: 'yellow',
      priority: 'MEDIUM',
      action: 'Encourage first upload',
      bgClass: 'bg-yellow-500/10 border-yellow-500/30'
    },
    {
      id: 'active_with_stock',
      name: 'Active With Stock',
      description: 'Engaged users with active inventory',
      count: Math.round(stats.activeUsers * 0.7), // Estimate
      icon: TrendingUp,
      color: 'green',
      priority: 'LOW',
      action: 'Upsell premium features',
      bgClass: 'bg-green-500/10 border-green-500/30'
    }
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            User Segments
          </CardTitle>
          <CardDescription>
            AI-powered segmentation for targeted campaigns
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {segments.map((segment) => {
              const Icon = segment.icon;
              return (
                <Card key={segment.id} className={`border-2 ${segment.bgClass}`}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4 flex-1">
                        <div className={`p-3 rounded-lg bg-${segment.color}-500/20`}>
                          <Icon className={`h-6 w-6 text-${segment.color}-600`} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-lg">{segment.name}</h3>
                            <Badge variant={segment.priority === 'HIGH' ? 'destructive' : 'secondary'}>
                              {segment.priority}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {segment.description}
                          </p>
                          <div className="flex items-center gap-4 text-sm">
                            <span className="font-bold text-2xl">{segment.count}</span>
                            <span className="text-muted-foreground">users</span>
                            <span className="text-xs bg-background px-2 py-1 rounded">
                              💡 {segment.action}
                            </span>
                          </div>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" className="gap-2">
                        <Zap className="h-4 w-4" />
                        Launch
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card className="border-2 border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingDown className="h-5 w-5 text-red-500" />
            Critical Insight
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-lg mb-4">
            <strong className="text-red-500">{stats.inactiveUsers}</strong> users are inactive.
            The AI recommends prioritizing <strong>Inactive With Stock</strong> segment first,
            as they've already shown interest by uploading diamonds.
          </p>
          <Button className="gap-2">
            <Brain className="h-4 w-4" />
            Auto-Launch AI Campaign
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
