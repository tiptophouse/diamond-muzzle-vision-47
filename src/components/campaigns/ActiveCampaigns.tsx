import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Send, Users, MousePointerClick, TrendingUp, Eye } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

export function ActiveCampaigns() {
  const [campaigns, setCampaigns] = useState<any[]>([]);

  useEffect(() => {
    loadCampaigns();
  }, []);

  const loadCampaigns = async () => {
    try {
      const { data, error } = await supabase
        .from('bot_usage_analytics')
        .select('*')
        .eq('message_type', 'campaign')
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;

      const formatted = data?.map((c, idx) => {
        const msgData = c.message_data as any;
        return {
          id: c.id,
          name: msgData?.campaign || `Campaign #${idx + 1}`,
          segment: msgData?.segment || 'All Users',
          sent: msgData?.success || 0,
          clicked: msgData?.clicks || 0,
          ctr: msgData?.success ? 
            Math.round(((msgData?.clicks || 0) / msgData.success) * 100) : 0,
          status: 'completed',
          date: new Date(c.created_at).toLocaleDateString(),
          time: new Date(c.created_at).toLocaleTimeString()
        };
      }) || [];

      setCampaigns(formatted);
    } catch (error) {
      console.error('Error loading campaigns:', error);
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="h-5 w-5" />
            Campaign History
          </CardTitle>
          <CardDescription>
            Recent campaigns and their performance metrics
          </CardDescription>
        </CardHeader>
        <CardContent>
          {campaigns.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Send className="h-12 w-12 mx-auto mb-4 opacity-30" />
              <p>No campaigns yet. Create your first campaign to get started!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {campaigns.map((campaign) => (
                <Card key={campaign.id} className="border-l-4 border-l-primary">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold">{campaign.name}</h3>
                          <Badge variant="outline">{campaign.segment}</Badge>
                          <Badge variant="default">Completed</Badge>
                        </div>
                        
                        <div className="grid grid-cols-4 gap-4 mt-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Users className="h-3 w-3" />
                              Sent
                            </div>
                            <div className="text-2xl font-bold">{campaign.sent}</div>
                          </div>
                          
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <MousePointerClick className="h-3 w-3" />
                              Clicked
                            </div>
                            <div className="text-2xl font-bold text-blue-600">{campaign.clicked}</div>
                          </div>
                          
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <TrendingUp className="h-3 w-3" />
                              CTR
                            </div>
                            <div className="text-2xl font-bold text-green-600">{campaign.ctr}%</div>
                          </div>
                          
                          <div className="space-y-1">
                            <div className="text-sm text-muted-foreground">Sent</div>
                            <div className="text-sm font-medium">
                              {campaign.date} {campaign.time}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
