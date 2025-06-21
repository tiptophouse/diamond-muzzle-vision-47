
import React from 'react';
import { DataDrivenDashboard } from '@/components/dashboard/DataDrivenDashboard';
import { RealTimeAnalyticsDashboard } from '@/components/analytics/RealTimeAnalyticsDashboard';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function Dashboard() {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Diamond Management Dashboard</h1>
            <p className="text-gray-600 mt-2">Manage your diamond inventory with real-time insights</p>
          </div>

          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6 bg-white">
              <TabsTrigger value="overview" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                Overview
              </TabsTrigger>
              <TabsTrigger value="analytics" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                Real-Time Analytics
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview">
              <DataDrivenDashboard />
            </TabsContent>
            
            <TabsContent value="analytics">
              <RealTimeAnalyticsDashboard />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AuthGuard>
  );
}
