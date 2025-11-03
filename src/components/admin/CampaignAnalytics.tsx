import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { BarChart3, MousePointerClick, Users, Clock } from 'lucide-react';

interface Campaign {
  id: string;
  campaign_name: string;
  message_text: string;
  sent_at: string;
  total_clicks: number;
  unique_users_clicked: number;
}

interface ButtonClick {
  id: string;
  telegram_user_id: number;
  user_first_name: string;
  user_username: string;
  button_label: string;
  target_page: string;
  clicked_at: string;
}

export default function CampaignAnalytics() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [buttonClicks, setButtonClicks] = useState<ButtonClick[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchCampaignData();
  }, []);

  const fetchCampaignData = async () => {
    try {
      // Fetch campaigns
      const { data: campaignsData, error: campaignsError } = await supabase
        .from('telegram_group_campaigns')
        .select('*')
        .order('sent_at', { ascending: false })
        .limit(10);

      if (campaignsError) throw campaignsError;

      // Fetch button clicks
      const { data: clicksData, error: clicksError } = await supabase
        .from('telegram_button_clicks')
        .select('*')
        .order('clicked_at', { ascending: false })
        .limit(50);

      if (clicksError) throw clicksError;

      setCampaigns(campaignsData || []);
      setButtonClicks(clicksData || []);
    } catch (error) {
      console.error('Error fetching campaign data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const totalClicks = buttonClicks.length;
  const uniqueUsers = new Set(buttonClicks.map(c => c.telegram_user_id)).size;
  const mostClickedButton = buttonClicks.reduce((acc, click) => {
    acc[click.button_label] = (acc[click.button_label] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const topButton = Object.entries(mostClickedButton).sort(([, a], [, b]) => b - a)[0];

  if (isLoading) {
    return (
      <Card className="bg-card">
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">סך הקמפיינים</p>
                <p className="text-2xl font-bold text-foreground">{campaigns.length}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">סך לחיצות</p>
                <p className="text-2xl font-bold text-foreground">{totalClicks}</p>
              </div>
              <MousePointerClick className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">משתמשים ייחודיים</p>
                <p className="text-2xl font-bold text-foreground">{uniqueUsers}</p>
              </div>
              <Users className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">כפתור פופולרי</p>
                <p className="text-sm font-medium text-foreground truncate">
                  {topButton ? topButton[0] : 'אין נתונים'}
                </p>
                <p className="text-xs text-muted-foreground">
                  {topButton ? `${topButton[1]} לחיצות` : ''}
                </p>
              </div>
              <MousePointerClick className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Campaigns */}
      <Card className="bg-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            קמפיינים אחרונים
          </CardTitle>
          <CardDescription>סטטיסטיקות לחיצות לפי קמפיין</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {campaigns.map((campaign) => (
              <div key={campaign.id} className="flex items-center justify-between p-4 rounded-lg border bg-background">
                <div className="space-y-1">
                  <p className="font-medium text-foreground">{campaign.campaign_name}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(campaign.sent_at).toLocaleDateString('he-IL', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
                <div className="text-left space-y-1">
                  <p className="text-sm font-medium text-foreground">
                    {campaign.total_clicks} לחיצות
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {campaign.unique_users_clicked} משתמשים ייחודיים
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Button Clicks */}
      <Card className="bg-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            לחיצות אחרונות
          </CardTitle>
          <CardDescription>פעילות משתמשים בזמן אמת</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {buttonClicks.slice(0, 15).map((click) => (
              <div key={click.id} className="flex items-center justify-between p-3 rounded-lg border bg-background">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-sm font-medium text-primary">
                      {click.user_first_name?.charAt(0) || '?'}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {click.user_first_name || 'משתמש לא ידוע'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      לחץ על "{click.button_label}" → {click.target_page}
                    </p>
                  </div>
                </div>
                <div className="text-left">
                  <p className="text-xs text-muted-foreground">
                    {new Date(click.clicked_at).toLocaleDateString('he-IL', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
