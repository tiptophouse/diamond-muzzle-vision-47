import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useCampaignSummary } from '@/hooks/admin/useCampaignSummary';
import { useNavigate } from 'react-router-dom';
import { Rocket, Send, TrendingUp, Clock } from 'lucide-react';

export function DashboardCampaignSummary() {
  const { summary, isLoading } = useCampaignSummary();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Campaign Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground">Loading...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Campaign Overview</CardTitle>
        <Button 
          size="sm" 
          onClick={() => navigate('/admin?tab=campaigns')}
          className="gap-2"
        >
          <Rocket className="h-4 w-4" />
          View All
        </Button>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span className="text-xs">Active Campaigns</span>
            </div>
            <div className="text-2xl font-bold">{summary.activeCampaigns}</div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Send className="h-4 w-4" />
              <span className="text-xs">Messages This Week</span>
            </div>
            <div className="text-2xl font-bold">{summary.messagesSent}</div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-muted-foreground">
              <TrendingUp className="h-4 w-4" />
              <span className="text-xs">Avg Click Rate</span>
            </div>
            <div className="text-2xl font-bold">{summary.avgClickRate}%</div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Rocket className="h-4 w-4" />
              <span className="text-xs">Total Reach</span>
            </div>
            <div className="text-2xl font-bold">{summary.totalReach}</div>
          </div>
        </div>

        {summary.recentCampaigns.length > 0 && (
          <div className="mt-4 pt-4 border-t">
            <h4 className="text-sm font-semibold mb-2">Recent Campaigns</h4>
            <div className="space-y-2">
              {summary.recentCampaigns.map((campaign) => (
                <div key={campaign.id} className="flex items-center justify-between text-xs">
                  <span className="truncate flex-1">{campaign.name}</span>
                  <span className="text-muted-foreground">{campaign.sent} sent</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
