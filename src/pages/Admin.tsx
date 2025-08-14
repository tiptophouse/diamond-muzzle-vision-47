
import React from 'react';
import { AdminGuard } from '@/components/admin/AdminGuard';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { AdminStatsGrid } from '@/components/admin/AdminStatsGrid';
import { AdminUserManager } from '@/components/admin/AdminUserManager';
import { AdminCampaignManager } from '@/components/admin/AdminCampaignManager';
import { MCPDashboard } from '@/components/admin/MCPDashboard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TelegramLayout } from '@/components/layout/TelegramLayout';
import { useToast } from '@/hooks/use-toast';

export default function Admin() {
  const { toast } = useToast();

  const handleExportData = () => {
    toast({
      title: "Export Started",
      description: "Data export has been initiated",
    });
  };

  const handleAddUser = () => {
    toast({
      title: "Add User",
      description: "User creation modal would open here",
    });
  };

  // Mock stats for demo - in production these would come from your API
  const mockStats = {
    totalUsers: 1250,
    activeUsers: 342,
    premiumUsers: 89,
    totalRevenue: 45600.00,
    totalCosts: 12300.00,
    profit: 33300.00
  };

  return (
    <AdminGuard>
      <TelegramLayout>
        <div className="space-y-6">
          <AdminHeader 
            onExportData={handleExportData}
            onAddUser={handleAddUser} 
          />
          <AdminStatsGrid 
            stats={mockStats}
            blockedUsersCount={12}
            averageEngagement={68}
          />
          
          <Tabs defaultValue="users" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="users">User Management</TabsTrigger>
              <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
              <TabsTrigger value="mcp">MCP Intelligence</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>

            <TabsContent value="users">
              <AdminUserManager />
            </TabsContent>

            <TabsContent value="campaigns">
              <AdminCampaignManager />
            </TabsContent>

            <TabsContent value="mcp">
              <MCPDashboard />
            </TabsContent>

            <TabsContent value="analytics">
              <div className="text-center py-8">
                <p className="text-muted-foreground">Advanced analytics coming soon...</p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </TelegramLayout>
    </AdminGuard>
  );
}
