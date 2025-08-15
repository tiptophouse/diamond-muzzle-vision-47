
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  MessageSquare, 
  BarChart3, 
  Settings, 
  Bell,
  TrendingUp,
  Diamond
} from 'lucide-react';

// Import admin components
import { AdminUserManager } from '@/components/admin/AdminUserManager';
import { NotificationSender } from '@/components/admin/NotificationSender';
import { AdminStatsGrid } from '@/components/admin/AdminStatsGrid';
import { CampaignAnalytics } from '@/components/admin/CampaignAnalytics';
import { InvestmentNotificationSender } from '@/components/admin/InvestmentNotificationSender';
import { InvestmentAnalyticsDashboard } from '@/components/admin/InvestmentAnalyticsDashboard';

export default function Admin() {
  const [activeTab, setActiveTab] = useState('users');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4" dir="rtl">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <Card className="border-2 border-blue-200 shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center">
                  <Diamond className="w-6 h-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-2xl text-gray-900">
                    פאנל ניהול BrilliantBot
                  </CardTitle>
                  <p className="text-gray-600">
                    ניהול משתמשים, הודעות וניתוח נתונים
                  </p>
                </div>
              </div>
              <Badge className="bg-green-100 text-green-800 px-3 py-1">
                פעיל
              </Badge>
            </div>
          </CardHeader>
        </Card>

        {/* Main Admin Interface */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 bg-white shadow-md">
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              משתמשים
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="w-4 h-4" />
              הודעות
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              ניתוחים
            </TabsTrigger>
            <TabsTrigger value="investment" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              השקעות
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              הגדרות
            </TabsTrigger>
          </TabsList>

          {/* Users Management */}
          <TabsContent value="users" className="space-y-6">
            <AdminUserManager />
          </TabsContent>

          {/* Notifications */}
          <TabsContent value="notifications" className="space-y-6">
            <NotificationSender />
          </TabsContent>

          {/* Analytics */}
          <TabsContent value="analytics" className="space-y-6">
            <AdminStatsGrid />
            <CampaignAnalytics />
          </TabsContent>

          {/* Investment Campaign */}
          <TabsContent value="investment" className="space-y-6">
            <div className="grid gap-6">
              <InvestmentNotificationSender />
              <InvestmentAnalyticsDashboard />
            </div>
          </TabsContent>

          {/* Settings */}
          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  הגדרות מערכת
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  הגדרות מערכת יתווספו בעדכון הבא
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
