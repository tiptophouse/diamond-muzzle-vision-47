
import React, { useState } from 'react';
import { Settings } from 'lucide-react';
import { useRealAdminData } from '@/hooks/useRealAdminData';
import { useBlockedUsers } from '@/hooks/useBlockedUsers';
import { UserDetailsModal } from './UserDetailsModal';
import { AddUserModal } from './AddUserModal';
import { EditUserModal } from './EditUserModal';
import { AdminHeader } from './AdminHeader';
import { AdminStatsGrid } from './AdminStatsGrid';
import { AdminUserTable } from './AdminUserTable';
import { NotificationSender } from './NotificationSender';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface AdminUserManagerProps {}

export function AdminUserManager({}: AdminUserManagerProps) {
  const { stats, users, isLoading, error, refetch, getUserEngagementScore } = useRealAdminData();
  const { isUserBlocked, blockUser, unblockUser, blockedUsers } = useBlockedUsers();
  const { toast } = useToast();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [showAddUser, setShowAddUser] = useState(false);
  const [showEditUser, setShowEditUser] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Filter users based on search term
  const filteredUsers = users.filter(user => {
    const searchLower = searchTerm.toLowerCase();
    
    const firstName = (user.first_name || '').toLowerCase();
    const lastName = (user.last_name || '').toLowerCase();
    const fullName = `${firstName} ${lastName}`.trim();
    const username = (user.username || '').toLowerCase();
    const telegramId = user.telegram_id.toString();
    const phoneNumber = user.phone_number || '';
    
    return (
      firstName.includes(searchLower) ||
      lastName.includes(searchLower) ||
      fullName.includes(searchLower) ||
      username.includes(searchLower) ||
      telegramId.includes(searchTerm) ||
      phoneNumber.includes(searchTerm) ||
      (user.username && `@${username}`.includes(searchLower))
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
    const displayName = user.first_name && !['Test', 'Telegram', 'Emergency'].includes(user.first_name)
      ? `${user.first_name} ${user.last_name || ''}`.trim()
      : `User ${user.telegram_id}`;
      
    if (window.confirm(`Are you sure you want to delete ${displayName}? This action cannot be undone.`)) {
      setIsDeleting(true);
      
      try {
        console.log('Deleting user via FastAPI:', user.telegram_id);
        
        // Try to delete via FastAPI first
        // Note: You may need to implement this endpoint in your FastAPI backend
        
        // Delete from Supabase as fallback
        const { error: analyticsError } = await supabase
          .from('user_analytics')
          .delete()
          .eq('telegram_id', user.telegram_id);

        if (analyticsError) {
          console.warn('Error deleting analytics:', analyticsError);
        }

        const { error: blockedError } = await supabase
          .from('blocked_users')
          .delete()
          .eq('telegram_id', user.telegram_id);

        if (blockedError) {
          console.warn('Error deleting blocked user:', blockedError);
        }

        const { error: profileError } = await supabase
          .from('user_profiles')
          .delete()
          .eq('telegram_id', user.telegram_id);

        if (profileError) {
          throw profileError;
        }

        toast({
          title: "User Deleted",
          description: `Successfully deleted ${displayName}`,
        });

        refetch();
      } catch (error: any) {
        console.error('Error deleting user:', error);
        toast({
          title: "Error",
          description: error.message || "Failed to delete user",
          variant: "destructive",
        });
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const handleToggleBlock = async (user: any) => {
    const blocked = isUserBlocked(user.telegram_id);
    if (blocked) {
      const blockedUser = blockedUsers.find(bu => bu.telegram_id === user.telegram_id);
      if (blockedUser) {
        const success = await unblockUser(blockedUser.id);
        if (success) {
          refetch();
        }
      }
    } else {
      const success = await blockUser(user.telegram_id, 'Blocked by admin');
      if (success) {
        refetch();
      }
    }
  };

  const exportUserData = () => {
    const csv = [
      ['ID', 'Telegram ID', 'Name', 'Username', 'Phone', 'Status', 'Premium', 'Created', 'Last Active', 'Visits', 'API Calls'].join(','),
      ...filteredUsers.map(user => {
        const displayName = user.first_name 
          ? `${user.first_name} ${user.last_name || ''}`
          : `User ${user.telegram_id}`;
          
        return [
          user.id,
          user.telegram_id,
          `"${displayName.trim()}"`,
          user.username || '',
          user.phone_number || '',
          user.subscription_status || 'free',
          user.is_premium ? 'Yes' : 'No',
          user.created_at,
          user.last_active || 'Never',
          user.total_visits || 0,
          user.api_calls_count || 0,
        ].join(',');
      })
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `real_users_export_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
        <div className="text-center py-12">
          <div className="relative inline-block">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto mb-6"></div>
            <Settings className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-8 w-8 text-blue-600" />
          </div>
          <div className="text-xl font-semibold text-gray-900">Loading real admin data from FastAPI...</div>
          <div className="text-sm text-gray-600 mt-2">Connecting to your backend database</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
        <div className="text-center py-12">
          <div className="text-xl font-semibold text-red-900 mb-4">Failed to Load Real Data</div>
          <div className="text-sm text-red-600 mb-6">{error}</div>
          <button
            onClick={refetch}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  const averageEngagement = users.length > 0 
    ? Math.round(users.reduce((sum, u) => sum + getUserEngagementScore(u), 0) / users.length)
    : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
        <AdminHeader onExportData={exportUserData} onAddUser={() => setShowAddUser(true)} />

        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-green-800 font-medium">
              Real Data Connected: {users.length} users from FastAPI backend
            </span>
          </div>
          {stats && (
            <div className="text-sm text-green-700 mt-2">
              Active Subscriptions: {stats.subscriptions.active} • 
              Trial Users: {stats.subscriptions.trial} • 
              Revenue: ${stats.totalRevenue.toFixed(2)}
            </div>
          )}
        </div>

        {stats && (
          <AdminStatsGrid 
            stats={stats} 
            blockedUsersCount={blockedUsers.length} 
            averageEngagement={averageEngagement} 
          />
        )}

        <Tabs defaultValue="users" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6 bg-white">
            <TabsTrigger value="users" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              Real User Management ({filteredUsers.length})
            </TabsTrigger>
            <TabsTrigger value="notifications" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">Send Notifications</TabsTrigger>
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
            <div className="bg-white rounded-lg border border-gray-200 p-6">
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
