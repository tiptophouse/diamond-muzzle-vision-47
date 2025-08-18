
import React from 'react';
import { AdminGuard } from '@/components/admin/AdminGuard';
import { AdminUserManager } from '@/components/admin/AdminUserManager';
import { UserDiamondCounts } from '@/components/admin/UserDiamondCounts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function AdminAnalytics() {
  return (
    <AdminGuard>
      <div className="container mx-auto p-4 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Admin Analytics Dashboard</h1>
        </div>
        
        <Tabs defaultValue="users" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="users">User Management</TabsTrigger>
            <TabsTrigger value="diamonds">Diamond Counts</TabsTrigger>
          </TabsList>
          
          <TabsContent value="users" className="space-y-4">
            <AdminUserManager />
          </TabsContent>
          
          <TabsContent value="diamonds" className="space-y-4">
            <UserDiamondCounts />
          </TabsContent>
        </Tabs>
      </div>
    </AdminGuard>
  );
}
