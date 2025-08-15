
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { RefreshCw, TrendingUp, Users, Target, Clock } from 'lucide-react';
import { useCampaignAnalytics } from '@/hooks/useCampaignAnalytics';
import { formatDistanceToNow } from 'date-fns';

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#0088FE', '#00C49F'];

export function CampaignAnalytics() {
  const { analytics, isLoading, fetchCampaignAnalytics } = useCampaignAnalytics();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 animate-spin" />
            טוען נתוני קמפיינים...
          </CardTitle>
        </CardHeader>
      </Card>
    );
  }

  if (!analytics) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>אין נתוני קמפיינים</CardTitle>
          <CardDescription>לא נמצאו נתוני קמפיינים לתצוגה</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const campaignTypeData = Object.entries(analytics.campaignsByType).map(([type, count]) => ({
    name: type,
    count,
    percentage: Math.round((count / analytics.totalCampaigns) * 100)
  }));

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">סה״כ קמפיינים</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalCampaigns}</div>
            <p className="text-xs text-muted-foreground">ב-30 הימים האחרונים</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">ממוצע מעלים</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.averageUploaders}</div>
            <p className="text-xs text-muted-foreground">בזמן שליחת קמפיין</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">שיעור המרה</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.conversionRate}%</div>
            <p className="text-xs text-muted-foreground">מהודעה להרשמה</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">סוגי קמפיינים</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Object.keys(analytics.campaignsByType).length}</div>
            <p className="text-xs text-muted-foreground">סוגים שונים</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart className="h-5 w-5" />
              קמפיינים לפי סוג
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={campaignTypeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              התפלגות סוגי קמפיינים
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={campaignTypeData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="count"
                >
                  {campaignTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Campaigns */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              קמפיינים אחרונים
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchCampaignAnalytics()}
              disabled={isLoading}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              רענן
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {analytics.recentCampaigns.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">לא נמצאו קמפיינים אחרונים</p>
            </div>
          ) : (
            <div className="space-y-4">
              {analytics.recentCampaigns.map((campaign) => (
                <div key={campaign.id} className="flex items-start justify-between p-4 border rounded-lg">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{campaign.campaign_type}</Badge>
                      <span className="font-medium">{campaign.campaign_name}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {campaign.current_uploaders} מעלים | {campaign.hours_remaining} שעות נותרו
                    </p>
                    <div className="text-xs text-muted-foreground">
                      נשלח: {formatDistanceToNow(new Date(campaign.sent_at), { addSuffix: true })}
                    </div>
                  </div>
                  <Badge variant="secondary">{campaign.target_group}</Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
