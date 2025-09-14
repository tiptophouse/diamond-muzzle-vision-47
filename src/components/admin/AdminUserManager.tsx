
import React, { useState } from 'react';
import { Settings } from 'lucide-react';
import { useAllUsers } from '@/hooks/useAllUsers';
import { useBlockedUsers } from '@/hooks/useBlockedUsers';
import { UserDetailsModal } from './UserDetailsModal';
import { AddUserModal } from './AddUserModal';
import { EditUserModal } from './EditUserModal';
import { SendMessageDialog } from './SendMessageDialog';
import { AdminHeader } from './AdminHeader';
import { AdminStatsGrid } from './AdminStatsGrid';
import { AdminUserTable } from './AdminUserTable';
import { NotificationSender } from './NotificationSender';
import { BulkUserAdder } from './BulkUserAdder';
import { BulkSubscriptionManager } from './BulkSubscriptionManager';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface AdminUserManagerProps {}

export function AdminUserManager({}: AdminUserManagerProps) {
  const { allUsers, isLoading, getUserEngagementScore, getUserStats, refetch } = useAllUsers();
  const { isUserBlocked, blockUser, unblockUser, blockedUsers } = useBlockedUsers();
  const { toast } = useToast();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [showAddUser, setShowAddUser] = useState(false);
  const [showEditUser, setShowEditUser] = useState(false);
  const [showSendMessage, setShowSendMessage] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const stats = getUserStats();

  console.log(`👥 AdminUserManager: Total users loaded: ${allUsers.length}`);
  console.log(`📊 User stats:`, stats);

  const filteredUsers = allUsers.filter(user => {
    // Create a comprehensive search that includes real names
    const searchLower = searchTerm.toLowerCase();
    
    // Primary search fields
    const firstName = (user.first_name || '').toLowerCase();
    const lastName = (user.last_name || '').toLowerCase();
    const fullName = `${firstName} ${lastName}`.trim();
    const username = (user.username || '').toLowerCase();
    const telegramId = user.telegram_id.toString();
    const phoneNumber = user.phone_number || '';
    
    // Enhanced search logic
    return (
      firstName.includes(searchLower) ||
      lastName.includes(searchLower) ||
      fullName.includes(searchLower) ||
      username.includes(searchLower) ||
      telegramId.includes(searchTerm) ||
      phoneNumber.includes(searchTerm) ||
      // Also search by display logic for cases where first_name might be "Telegram" etc
      (user.username && `@${username}`.includes(searchLower))
    );
  });

  console.log(`🔍 Filtered users: ${filteredUsers.length} out of ${allUsers.length} total`);

  const handleViewUser = (user: any) => {
    setSelectedUser(user);
    setShowUserDetails(true);
  };

  const handleEditUser = (user: any) => {
    setEditingUser(user);
    setShowEditUser(true);
  };

  const handleSendMessage = (user: any) => {
    setSelectedUser(user);
    setShowSendMessage(true);
  };

  const handleDeleteUser = async (user: any) => {
    const displayName = user.first_name && !['Test', 'Telegram', 'Emergency'].includes(user.first_name)
      ? `${user.first_name} ${user.last_name || ''}`.trim()
      : `User ${user.telegram_id}`;
      
    if (window.confirm(`Are you sure you want to delete ${displayName}? This action cannot be undone.`)) {
      setIsDeleting(true);
      
      try {
        console.log('Deleting user:', user.telegram_id);
        
        // Delete from user_analytics first (foreign key constraint)
        const { error: analyticsError } = await supabase
          .from('user_analytics')
          .delete()
          .eq('telegram_id', user.telegram_id);

        if (analyticsError) {
          console.warn('Error deleting analytics:', analyticsError);
        }

        // Delete from blocked_users if exists
        const { error: blockedError } = await supabase
          .from('blocked_users')
          .delete()
          .eq('telegram_id', user.telegram_id);

        if (blockedError) {
          console.warn('Error deleting blocked user:', blockedError);
        }

        // Delete from user_profiles
        const { error: profileError } = await supabase
          .from('user_profiles')
          .delete()
          .eq('telegram_id', user.telegram_id);

        if (profileError) {
          throw profileError;
        }

        // Log admin action
        await supabase
          .from('user_management_log')
          .insert({
            admin_telegram_id: 2138564172,
            action_type: 'deleted',
            target_telegram_id: user.telegram_id,
            reason: 'User deleted via admin panel'
          });

        toast({
          title: "User Deleted",
          description: `Successfully deleted ${displayName}`,
        });

        // Refresh the data
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

  const deleteMockData = async () => {
    if (window.confirm('Are you sure you want to delete ALL mock/test data? This will remove users with names like "Test", "Telegram", "Emergency", etc.')) {
      try {
        console.log('Deleting all mock data...');
        
        // Delete mock users from analytics first
        const { error: analyticsError } = await supabase
          .from('user_analytics')
          .delete()
          .in('telegram_id', [2138564172, 1000000000]); // Known mock IDs

        // Delete mock users where first_name indicates test data
        const { error: profileError } = await supabase
          .from('user_profiles')
          .delete()
          .or('first_name.ilike.%test%,first_name.ilike.%telegram%,first_name.ilike.%emergency%,first_name.ilike.%unknown%');

        if (profileError) {
          throw profileError;
        }

        toast({
          title: "Mock Data Deleted",
          description: "All mock/test data has been removed",
        });

        refetch();
      } catch (error: any) {
        console.error('Error deleting mock data:', error);
        toast({
          title: "Error",
          description: "Failed to delete mock data",
          variant: "destructive",
        });
      }
    }
  };

  const exportUserData = () => {
    const csv = [
      ['ID', 'Telegram ID', 'Name', 'Username', 'Phone', 'Status', 'Premium', 'Created', 'Last Active', 'Data Type'].join(','),
      ...filteredUsers.map(user => {
        const isReal = user.first_name && !['Test', 'Telegram', 'Emergency', 'Unknown'].includes(user.first_name);
        const displayName = isReal 
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
          isReal ? 'Real' : 'Mock'
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
      <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
        <div className="text-center py-12">
          <div className="relative inline-block">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto mb-6"></div>
            <Settings className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-8 w-8 text-blue-600" />
          </div>
          <div className="text-xl font-semibold text-gray-900">Loading user management...</div>
          <div className="text-sm text-gray-600 mt-2">Fetching all users from user_profiles table...</div>
        </div>
      </div>
    );
  }

  const averageEngagement = allUsers.length > 0 
    ? Math.round(allUsers.reduce((sum, u) => sum + getUserEngagementScore(u), 0) / allUsers.length)
    : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
        <AdminHeader onExportData={exportUserData} onAddUser={() => setShowAddUser(true)} />

        <div className="flex gap-4 mb-6">
          <button
            onClick={deleteMockData}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          >
            Delete All Mock Data
          </button>
          <div className="text-sm text-gray-600 flex items-center">
            📊 Showing {allUsers.length} total users from database
          </div>
        </div>

        <AdminStatsGrid 
          stats={stats} 
          blockedUsersCount={blockedUsers.length} 
          averageEngagement={averageEngagement} 
        />

        <Tabs defaultValue="users" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6 bg-white">
            <TabsTrigger value="users" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              User Management ({allUsers.length} users total)
            </TabsTrigger>
            <TabsTrigger value="bulk-add" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              הוספה בכמות
            </TabsTrigger>
            <TabsTrigger value="bulk-subscriptions" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              ניהול מנויים
            </TabsTrigger>
            <TabsTrigger value="notifications" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              Send Notifications
            </TabsTrigger>
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
              onSendMessage={handleSendMessage}
            />
          </TabsContent>

          <TabsContent value="bulk-add">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <BulkUserAdder onUsersAdded={refetch} />
            </div>
          </TabsContent>

          <TabsContent value="bulk-subscriptions">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <BulkSubscriptionManager onComplete={refetch} />
            </div>
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

        {showSendMessage && selectedUser && (
          <SendMessageDialog
            user={selectedUser}
            open={showSendMessage}
            onOpenChange={setShowSendMessage}
          />
        )}
      </div>
    </div>
  );
}
