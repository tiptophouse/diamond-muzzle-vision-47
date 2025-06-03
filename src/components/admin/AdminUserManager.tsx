
import React, { useState } from 'react';
import { Settings } from 'lucide-react';
import { useEnhancedAnalytics } from '@/hooks/useEnhancedAnalytics';
import { useBlockedUsers } from '@/hooks/useBlockedUsers';
import { UserDetailsModal } from './UserDetailsModal';
import { AddUserModal } from './AddUserModal';
import { EditUserModal } from './EditUserModal';
import { AdminHeader } from './AdminHeader';
import { AdminStatsGrid } from './AdminStatsGrid';
import { AdminUserTable } from './AdminUserTable';
import { NotificationSender } from './NotificationSender';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface AdminUserManagerProps {}

export function AdminUserManager({}: AdminUserManagerProps) {
  const { enhancedUsers, isLoading, getUserEngagementScore, getUserStats, refetch } = useEnhancedAnalytics();
  const { isUserBlocked, blockUser, unblockUser, blockedUsers } = useBlockedUsers();
  const { toast } = useToast();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [showAddUser, setShowAddUser] = useState(false);
  const [showEditUser, setShowEditUser] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);

  const stats = getUserStats();

  const filteredUsers = enhancedUsers.filter(user => {
    const fullName = `${user.first_name} ${user.last_name || ''}`.toLowerCase();
    const searchLower = searchTerm.toLowerCase();
    return (
      fullName.includes(searchLower) ||
      user.telegram_id.toString().includes(searchTerm) ||
      user.username?.toLowerCase().includes(searchLower) ||
      user.phone_number?.includes(searchTerm)
    );
  });

  const handleViewUser = (user: any) => {
    setSelectedUser(user);
    setShowUserDetails(true);
  };

  const handleEditUser = (user: any) => {
    setEditingUser(user);
    setShowEditUser(true);
  };

  const handleDeleteUser = async (user: any) => {
    if (window.confirm(`Are you sure you want to delete ${user.first_name} ${user.last_name}? This action cannot be undone.`)) {
      console.log('Delete user:', user.telegram_id);
    }
  };

  const handleToggleBlock = async (user: any) => {
    const blocked = isUserBlocked(user.telegram_id);
    if (blocked) {
      const blockedUser = blockedUsers.find(bu => bu.telegram_id === user.telegram_id);
      if (blockedUser) {
        await unblockUser(blockedUser.id);
      }
    } else {
      await blockUser(user.telegram_id, 'Blocked by admin');
    }
  };

  const handleDeleteFakeUsers = async () => {
    const confirmDelete = window.confirm(
      'Are you sure you want to delete all fake/test users? This will remove users with names like "Test", "Telegram", "Emergency", "Timeout", etc. This action cannot be undone.'
    );
    
    if (!confirmDelete) return;

    try {
      const fakeUserPatterns = ['Test', 'Telegram', 'Emergency', 'Timeout', 'User'];
      
      const { error } = await supabase
        .from('user_profiles')
        .delete()
        .or(fakeUserPatterns.map(pattern => `first_name.ilike.%${pattern}%`).join(','));

      if (error) throw error;

      toast({
        title: "Success",
        description: "Fake users have been deleted successfully",
      });

      refetch();
    } catch (error) {
      console.error('Error deleting fake users:', error);
      toast({
        title: "Error",
        description: "Failed to delete fake users",
        variant: "destructive",
      });
    }
  };

  const exportUserData = () => {
    const csv = [
      ['ID', 'Telegram ID', 'Name', 'Username', 'Phone', 'Status', 'Premium', 'Created', 'Last Login', 'Cost USD'].join(','),
      ...filteredUsers.map(user => {
        const apiCalls = user.api_calls_count || 0;
        const costPerApiCall = 0.002;
        const storageCost = (user.storage_used_mb || 0) * 0.001;
        const totalCost = (apiCalls * costPerApiCall) + storageCost + 0.1;
        
        return [
          user.id,
          user.telegram_id,
          `"${user.first_name} ${user.last_name || ''}"`,
          user.username || '',
          user.phone_number || '',
          user.subscription_status || 'free',
          user.is_premium ? 'Yes' : 'No',
          user.created_at,
          user.last_active || 'Never',
          totalCost.toFixed(3)
        ].join(',');
      })
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `users_export_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 to-slate-900 p-4 sm:p-6">
        <div className="text-center py-12">
          <div className="relative inline-block">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-slate-700 border-t-slate-400 mx-auto mb-6"></div>
            <Settings className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-8 w-8 text-slate-400" />
          </div>
          <div className="text-xl font-semibold text-white">Loading dashboard...</div>
        </div>
      </div>
    );
  }

  const averageEngagement = enhancedUsers.length > 0 
    ? Math.round(enhancedUsers.reduce((sum, u) => sum + getUserEngagementScore(u), 0) / enhancedUsers.length)
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 to-slate-900 p-4 sm:p-6">
      <div className="container mx-auto space-y-6">
        <AdminHeader onExportData={exportUserData} onAddUser={() => setShowAddUser(true)} />

        <AdminStatsGrid 
          stats={stats} 
          blockedUsersCount={blockedUsers.length} 
          averageEngagement={averageEngagement}
          onDeleteFakeUsers={handleDeleteFakeUsers}
        />

        <Tabs defaultValue="users" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6 bg-slate-800 border-slate-700">
            <TabsTrigger value="users" className="data-[state=active]:bg-slate-700 data-[state=active]:text-white">User Management</TabsTrigger>
            <TabsTrigger value="notifications" className="data-[state=active]:bg-slate-700 data-[state=active]:text-white">Send Notifications</TabsTrigger>
          </TabsList>
          
          <TabsContent value="users">
            <AdminUserTable
              filteredUsers={filteredUsers}
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              getUserEngagementScore={getUserEngagementScore}
              isUserBlocked={isUserBlocked}
              onViewUser={handleViewUser}
              onEditUser={handleEditUser}
              onToggleBlock={handleToggleBlock}
              onDeleteUser={handleDeleteUser}
            />
          </TabsContent>
          
          <TabsContent value="notifications">
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl p-6 border border-slate-700">
              <NotificationSender onSendNotification={(notification) => console.log('Sent notification:', notification)} />
            </div>
          </TabsContent>
        </Tabs>

        {/* Modals */}
        {showUserDetails && selectedUser && (
          <UserDetailsModal
            user={selectedUser}
            isOpen={showUserDetails}
            onClose={() => setShowUserDetails(false)}
          />
        )}

        {showAddUser && (
          <AddUserModal
            isOpen={showAddUser}
            onClose={() => setShowAddUser(false)}
          />
        )}

        {showEditUser && editingUser && (
          <EditUserModal
            user={editingUser}
            isOpen={showEditUser}
            onClose={() => setShowEditUser(false)}
          />
        )}
      </div>
    </div>
  );
}
