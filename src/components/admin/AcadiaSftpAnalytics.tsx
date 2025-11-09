import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAcadiaSftpAnalytics } from '@/hooks/admin/useAcadiaSftpAnalytics';
import { TrendingUp, Users, CheckCircle, Send } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export function AcadiaSftpAnalytics() {
  const { analytics, isLoading, refetch } = useAcadiaSftpAnalytics();

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center space-x-2">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            <span>Loading analytics...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!analytics) return null;

  const getEventLabel = (eventType: string) => {
    switch (eventType) {
      case 'button_click': return 'Button Click';
      case 'credentials_generated': return 'Credentials Generated';
      case 'credentials_sent': return 'Credentials Sent';
      default: return eventType;
    }
  };

  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case 'button_click': return '🖱️';
      case 'credentials_generated': return '🔑';
      case 'credentials_sent': return '📧';
      default: return '📊';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Acadia SFTP Campaign Analytics
        </CardTitle>
        <CardDescription>
          Track user engagement with SFTP connection campaign
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium">Button Clicks</span>
            </div>
            <p className="text-2xl font-bold text-blue-600">{analytics.totalButtonClicks}</p>
          </div>

          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium">Credentials Generated</span>
            </div>
            <p className="text-2xl font-bold text-green-600">{analytics.totalCredentialsGenerated}</p>
          </div>

          <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Send className="h-4 w-4 text-purple-600" />
              <span className="text-sm font-medium">Credentials Sent</span>
            </div>
            <p className="text-2xl font-bold text-purple-600">{analytics.totalCredentialsSent}</p>
          </div>

          <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-orange-600" />
              <span className="text-sm font-medium">Conversion Rate</span>
            </div>
            <p className="text-2xl font-bold text-orange-600">{analytics.conversionRate}%</p>
            <p className="text-xs text-muted-foreground mt-1">Click to Generate</p>
          </div>
        </div>

        {/* Recent Activity */}
        <div>
          <h3 className="font-semibold mb-3">Recent Activity</h3>
          <div className="space-y-2">
            {analytics.recentActivity.length > 0 ? (
              analytics.recentActivity.map((activity, index) => (
                <div 
                  key={index}
                  className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{getEventIcon(activity.event_type)}</span>
                    <div>
                      <p className="text-sm font-medium">{getEventLabel(activity.event_type)}</p>
                      <p className="text-xs text-muted-foreground">
                        User ID: {activity.telegram_id}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-center p-6 bg-muted/30 rounded-lg">
                <p className="text-sm text-muted-foreground">No activity yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Insights */}
        {analytics.totalButtonClicks > 0 && (
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-700">
            <h4 className="font-medium mb-2 text-blue-800 dark:text-blue-200">💡 Insights</h4>
            <ul className="text-sm space-y-1 text-blue-700 dark:text-blue-300">
              <li>
                • {analytics.totalButtonClicks} users clicked the SFTP button
              </li>
              <li>
                • {analytics.conversionRate}% conversion rate from click to credential generation
              </li>
              {analytics.conversionRate < 50 && (
                <li className="text-orange-600 dark:text-orange-400">
                  ⚠️ Consider following up with users who clicked but didn't generate credentials
                </li>
              )}
              {analytics.totalCredentialsSent > 0 && (
                <li>
                  • {analytics.totalCredentialsSent} users successfully received their SFTP credentials
                </li>
              )}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}