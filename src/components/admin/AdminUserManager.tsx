
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

interface AdminUserManagerProps {}

export function AdminUserManager({}: AdminUserManagerProps) {
  const { enhancedUsers, isLoading, getUserEngagementScore, getUserStats } = useEnhancedAnalytics();
  const { isUserBlocked, blockUser, unblockUser, blockedUsers } = useBlockedUsers();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [showAddUser, setShowAddUser] = useState(false);
  const [showEditUser, setShowEditUser] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);

  const stats = getUserStats();

  const filteredUsers = enhancedUsers.filter(user => {
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
          <div className="text-xl font-semibold text-gray-900">Loading dashboard...</div>
        </div>
      </div>
    );
  }

  const averageEngagement = enhancedUsers.length > 0 
    ? Math.round(enhancedUsers.reduce((sum, u) => sum + getUserEngagementScore(u), 0) / enhancedUsers.length)
    : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
        <AdminHeader onExportData={exportUserData} onAddUser={() => setShowAddUser(true)} />

        <AdminStatsGrid 
          stats={stats} 
          blockedUsersCount={blockedUsers.length} 
          averageEngagement={averageEngagement} 
        />

        <Tabs defaultValue="users" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6 bg-white">
            <TabsTrigger value="users" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">User Management</TabsTrigger>
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
