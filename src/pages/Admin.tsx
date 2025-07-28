
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TelegramLayout } from '@/components/layout/TelegramLayout';
import { AdminGuard } from '@/components/admin/AdminGuard';
import { AdminStatsGrid } from '@/components/admin/AdminStatsGrid';
import { AdminUserTable } from '@/components/admin/AdminUserTable';
import { NotificationCenter } from '@/components/admin/NotificationCenter';
import { WelcomeMessageSender } from '@/components/admin/WelcomeMessageSender';
import { PersonalizedOutreachSystem } from '@/components/admin/PersonalizedOutreachSystem';
import { TestNotificationSender } from '@/components/admin/TestNotificationSender';
import { DiamondShareAnalytics } from '@/components/admin/DiamondShareAnalytics';
import { UploadReminderNotifier } from '@/components/admin/UploadReminderNotifier';
import { ZeroDiamondUsersNotifier } from '@/components/admin/ZeroDiamondUsersNotifier';
import { SelectiveNotificationSender } from '@/components/admin/SelectiveNotificationSender';
import { UserUploadAnalysis } from '@/components/admin/UserUploadAnalysis';
import { Settings, Users, Bell, MessageSquare, BarChart3, Upload, Heart, Calendar } from 'lucide-react';

const AdminPage = () => {
  return (
    <AdminGuard>
      <TelegramLayout>
        <div className="container mx-auto px-4 py-6 max-w-7xl">
          <div className="mb-6">
            <h1 className="text-3xl font-bold mb-2">מרכז ניהול מנהלים</h1>
            <p className="text-muted-foreground">
              ניהול משתמשים, התראות ואנליטיקה מתקדמת
            </p>
          </div>
          
          <Tabs defaultValue="stats" className="space-y-6">
            <TabsList className="grid grid-cols-3 lg:grid-cols-8 gap-1">
              <TabsTrigger value="stats" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                <span className="hidden sm:inline">סטטיסטיקות</span>
              </TabsTrigger>
              <TabsTrigger value="users" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span className="hidden sm:inline">משתמשים</span>
              </TabsTrigger>
              <TabsTrigger value="notifications" className="flex items-center gap-2">
                <Bell className="h-4 w-4" />
                <span className="hidden sm:inline">התראות</span>
              </TabsTrigger>
              <TabsTrigger value="outreach" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span className="hidden sm:inline">פגישות</span>
              </TabsTrigger>
              <TabsTrigger value="welcome" className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                <span className="hidden sm:inline">ברוכים</span>
              </TabsTrigger>
              <TabsTrigger value="analytics" className="flex items-center gap-2">
                <Heart className="h-4 w-4" />
                <span className="hidden sm:inline">שיתופים</span>
              </TabsTrigger>
              <TabsTrigger value="uploads" className="flex items-center gap-2">
                <Upload className="h-4 w-4" />
                <span className="hidden sm:inline">העלאות</span>
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                <span className="hidden sm:inline">הגדרות</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="stats" className="space-y-6">
              <AdminStatsGrid />
            </TabsContent>

            <TabsContent value="users" className="space-y-6">
              <AdminUserTable />
            </TabsContent>

            <TabsContent value="notifications" className="space-y-6">
              <NotificationCenter />
              <div className="grid gap-6 lg:grid-cols-2">
                <TestNotificationSender />
                <SelectiveNotificationSender />
              </div>
            </TabsContent>

            <TabsContent value="outreach" className="space-y-6">
              <PersonalizedOutreachSystem />
            </TabsContent>

            <TabsContent value="welcome" className="space-y-6">
              <WelcomeMessageSender />
              <div className="grid gap-6 lg:grid-cols-2">
                <UploadReminderNotifier />
                <ZeroDiamondUsersNotifier />
              </div>
            </TabsContent>

            <TabsContent value="analytics" className="space-y-6">
              <DiamondShareAnalytics />
            </TabsContent>

            <TabsContent value="uploads" className="space-y-6">
              <UserUploadAnalysis />
            </TabsContent>

            <TabsContent value="settings" className="space-y-6">
              <div className="text-center p-8">
                <Settings className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold mb-2">הגדרות מערכת</h3>
                <p className="text-muted-foreground">
                  תכונות הגדרות נוספות יתווספו בקרוב
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </TelegramLayout>
    </AdminGuard>
  );
};

export default AdminPage;
