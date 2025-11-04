import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Users, UserCheck, UserX, TrendingUp, Send, Clock } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface UserSegment {
  segment: string;
  count: number;
  description: string;
  isPaying: boolean;
  hasInventory: boolean;
}

export function CustomerRetentionPanel() {
  const [loading, setLoading] = useState(false);
  const [segments, setSegments] = useState<UserSegment[]>([]);
  const [selectedSegment, setSelectedSegment] = useState<string>('onboarding');
  const [daysSinceSignup, setDaysSinceSignup] = useState<number>(1);
  const [testMode, setTestMode] = useState(true);
  const [campaignHistory, setCampaignHistory] = useState<any[]>([]);

  useEffect(() => {
    loadUserSegments();
    loadCampaignHistory();
  }, []);

  const loadUserSegments = async () => {
    try {
      // Get all users
      const { data: users, error } = await supabase
        .from('user_profiles')
        .select('telegram_id, created_at');

      if (error) throw error;

      const segmentData: UserSegment[] = [];

      for (const user of users || []) {
        // Check inventory
        const { count: inventoryCount } = await supabase
          .from('inventory')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', user.telegram_id)
          .is('deleted_at', null);

        const hasInventory = (inventoryCount || 0) > 0;

        // Check subscription via edge function
        const { data: subData } = await supabase.functions.invoke('check-subscription-status', {
          body: { user_id: user.telegram_id }
        });

        const isPaying = subData?.is_active === true;

        // Calculate days since signup
        const daysSinceSignup = Math.floor(
          (Date.now() - new Date(user.created_at).getTime()) / (1000 * 60 * 60 * 24)
        );

        // Classify user
        if (daysSinceSignup <= 4 && !hasInventory) {
          const existing = segmentData.find(s => s.segment === 'onboarding');
          if (existing) {
            existing.count++;
          } else {
            segmentData.push({
              segment: 'onboarding',
              count: 1,
              description: 'New users (1-4 days) without inventory',
              isPaying: false,
              hasInventory: false
            });
          }
        } else if (isPaying && !hasInventory) {
          const existing = segmentData.find(s => s.segment === 'no_inventory');
          if (existing) {
            existing.count++;
          } else {
            segmentData.push({
              segment: 'no_inventory',
              count: 1,
              description: 'Paying users without inventory',
              isPaying: true,
              hasInventory: false
            });
          }
        } else if (isPaying && hasInventory) {
          const existing = segmentData.find(s => s.segment === 'with_inventory');
          if (existing) {
            existing.count++;
          } else {
            segmentData.push({
              segment: 'with_inventory',
              count: 1,
              description: 'Paying users with inventory (daily reports)',
              isPaying: true,
              hasInventory: true
            });
          }
        }
      }

      setSegments(segmentData);
    } catch (error) {
      console.error('Error loading segments:', error);
      toast.error('Failed to load user segments');
    }
  };

  const loadCampaignHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('retention_campaigns')
        .select('*')
        .order('sent_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setCampaignHistory(data || []);
    } catch (error) {
      console.error('Error loading campaign history:', error);
    }
  };

  const sendRetentionCampaign = async () => {
    if (!selectedSegment) {
      toast.error('Please select a segment');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('customer-retention', {
        body: {
          segment: selectedSegment,
          test_mode: testMode,
          days_since_signup: daysSinceSignup
        }
      });

      if (error) throw error;

      toast.success(`Campaign sent! ${data.sent} messages delivered`);
      await loadCampaignHistory();
    } catch (error) {
      console.error('Error sending campaign:', error);
      toast.error('Failed to send retention campaign');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Customer Retention System
          </CardTitle>
          <CardDescription>
            Automated messaging based on user segments and payment status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="segments" className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="segments">User Segments</TabsTrigger>
              <TabsTrigger value="campaign">Send Campaign</TabsTrigger>
              <TabsTrigger value="history">Campaign History</TabsTrigger>
            </TabsList>

            <TabsContent value="segments" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                {segments.map((segment) => (
                  <Card key={segment.segment}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <Badge variant={segment.isPaying ? 'default' : 'secondary'}>
                          {segment.isPaying ? 'Paying' : 'Free'}
                        </Badge>
                        {segment.hasInventory ? (
                          <UserCheck className="h-4 w-4 text-green-600" />
                        ) : (
                          <UserX className="h-4 w-4 text-orange-600" />
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{segment.count}</div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {segment.description}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="campaign" className="space-y-4">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Select Segment</label>
                  <Select value={selectedSegment} onValueChange={setSelectedSegment}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose segment" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="onboarding">
                        🎯 Onboarding (1-4 days, no inventory)
                      </SelectItem>
                      <SelectItem value="no_inventory">
                        💎 Paying Users - No Inventory
                      </SelectItem>
                      <SelectItem value="with_inventory">
                        📊 Paying Users - With Inventory (Daily Reports)
                      </SelectItem>
                      <SelectItem value="all">
                        🌟 All Segments
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {selectedSegment === 'onboarding' && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Days Since Signup</label>
                    <Select 
                      value={daysSinceSignup.toString()} 
                      onValueChange={(v) => setDaysSinceSignup(Number(v))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">Day 1</SelectItem>
                        <SelectItem value="2">Day 2</SelectItem>
                        <SelectItem value="3">Day 3</SelectItem>
                        <SelectItem value="4">Day 4</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="testMode"
                    checked={testMode}
                    onChange={(e) => setTestMode(e.target.checked)}
                    className="rounded"
                  />
                  <label htmlFor="testMode" className="text-sm">
                    Test Mode (Admin only)
                  </label>
                </div>

                <Button 
                  onClick={sendRetentionCampaign} 
                  disabled={loading}
                  className="w-full"
                >
                  <Send className="h-4 w-4 mr-2" />
                  {loading ? 'Sending...' : 'Send Campaign'}
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="history" className="space-y-4">
              <div className="space-y-2">
                {campaignHistory.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    No campaigns sent yet
                  </p>
                ) : (
                  campaignHistory.map((campaign) => (
                    <Card key={campaign.id}>
                      <CardContent className="pt-4">
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <Badge>{campaign.campaign_type}</Badge>
                              {campaign.is_paying && <Badge variant="default">Paying</Badge>}
                              {campaign.has_inventory && <Badge variant="secondary">Has Inventory</Badge>}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              User: {campaign.user_telegram_id}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Days since signup: {campaign.days_since_signup}
                            </p>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {new Date(campaign.sent_at).toLocaleString()}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
