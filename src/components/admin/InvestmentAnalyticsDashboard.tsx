
import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useInvestmentAnalytics } from '@/hooks/useInvestmentAnalytics';
import { 
  Eye, 
  Users, 
  FileSignature, 
  Calendar, 
  TrendingUp,
  Clock,
  ExternalLink,
  Target
} from 'lucide-react';

export function InvestmentAnalyticsDashboard() {
  const { 
    analytics, 
    isLoading, 
    fetchInvestmentAnalytics 
  } = useInvestmentAnalytics();

  useEffect(() => {
    fetchInvestmentAnalytics();
  }, []);

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!analytics) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-gray-500">אין נתונים זמינים</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6" dir="rtl">
      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">סה״כ צפיות</CardTitle>
            <Eye className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-700">
              {analytics.totalViews.toLocaleString()}
            </div>
            <p className="text-xs text-blue-600">
              {analytics.uniqueViewers} צופים ייחודיים
            </p>
          </CardContent>
        </Card>

        <Card className="border-green-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">חתימות NDA</CardTitle>
            <FileSignature className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-700">
              {analytics.ndaSignatures}
            </div>
            <p className="text-xs text-green-600">
              מסמכים משפטיים חתומים
            </p>
          </CardContent>
        </Card>

        <Card className="border-purple-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">פגישות מתוזמנות</CardTitle>
            <Calendar className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-700">
              {analytics.meetingsScheduled}
            </div>
            <p className="text-xs text-purple-600">
              דרך Calendly
            </p>
          </CardContent>
        </Card>

        <Card className="border-orange-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">שיעור המרה</CardTitle>
            <TrendingUp className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-700">
              {analytics.conversionRate}%
            </div>
            <p className="text-xs text-orange-600">
              מצפייה לפגישה
            </p>
          </CardContent>
        </Card>
      </div>

      {/* User Journey Funnel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            משפך המרה - מסע המשקיע
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {analytics.userJourney.map((step, index) => {
            const previousStep = index > 0 ? analytics.userJourney[index - 1] : null;
            const conversionRate = previousStep 
              ? previousStep.users > 0 
                ? Math.round((step.users / previousStep.users) * 100)
                : 0
              : 100;

            return (
              <div key={step.step} className="space-y-2">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-semibold">{step.step}</h4>
                    <p className="text-sm text-gray-600">
                      {step.users} משתמשים
                      {index > 0 && (
                        <span className="mr-2">
                          ({conversionRate}% המרה)
                        </span>
                      )}
                    </p>
                  </div>
                  <Badge variant={step.users > 0 ? "default" : "secondary"}>
                    {step.users}
                  </Badge>
                </div>
                <Progress 
                  value={analytics.totalViews > 0 ? (step.users / analytics.totalViews) * 100 : 0} 
                  className="h-2" 
                />
                {step.dropoff > 0 && (
                  <p className="text-xs text-red-600">
                    {step.dropoff} משתמשים עזבו
                  </p>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Time Analytics */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              צפיות לפי שעה
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Object.entries(analytics.viewsByHour)
                .sort(([a], [b]) => parseInt(a) - parseInt(b))
                .slice(0, 6)
                .map(([hour, count]) => (
                  <div key={hour} className="flex justify-between items-center">
                    <span className="text-sm">{hour}</span>
                    <div className="flex items-center gap-2">
                      <Progress 
                        value={(count / Math.max(...Object.values(analytics.viewsByHour))) * 100} 
                        className="w-16 h-2" 
                      />
                      <span className="text-sm font-medium w-8">{count}</span>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ExternalLink className="h-5 w-5" />
              מקורות תנועה מובילים
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {analytics.topReferrers.map(({ referrer, count }) => (
                <div key={referrer} className="flex justify-between items-center">
                  <span className="text-sm truncate flex-1">
                    {referrer === 'direct' ? 'ישיר' : referrer}
                  </span>
                  <Badge variant="outline">{count}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Real-time Status */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-blue-900">
                🔴 מעקב בזמן אמת פעיל
              </h3>
              <p className="text-sm text-blue-700">
                כל האינטראקציות עם עמוד ההשקעה מתועדות אוטומטית
              </p>
            </div>
            <Badge className="bg-green-100 text-green-800">
              פעיל
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
