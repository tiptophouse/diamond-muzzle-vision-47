
import React, { useState } from 'react';
import { Settings } from 'lucide-react';
import { useAdminUsers } from '@/hooks/useAdminUsers';
import { UserDetailsModal } from './UserDetailsModal';
import { AddUserModal } from './AddUserModal';
import { EditUserModal } from './EditUserModal';
import { AdminHeader } from './AdminHeader';
import { AdminStatsGrid } from './AdminStatsGrid';
import { AdminUserTable } from './AdminUserTable';
import { NotificationSender } from './NotificationSender';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';

interface AdminUserManagerProps {}

export function AdminUserManager({}: AdminUserManagerProps) {
  const { 
    users, 
    stats, 
    isLoading, 
    blockUser, 
    unblockUser, 
    sendMessageToUser, 
    removeUserPayments,
    getUserEngagementScore, 
    refetch 
  } = useAdminUsers();
  
  const { toast } = useToast();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [showAddUser, setShowAddUser] = useState(false);
  const [showEditUser, setShowEditUser] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const filteredUsers = users.filter(user => {
    const searchLower = searchTerm.toLowerCase();
    const firstName = (user.first_name || '').toLowerCase();
    const lastName = (user.last_name || '').toLowerCase();
    const fullName = `${firstName} ${lastName}`.trim();
    const username = (user.username || '').toLowerCase();
    const telegramId = user.telegram_id.toString();
    const phoneNumber = user.phone || '';
    
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
        // For now, we'll use the block user functionality as a "soft delete"
        // until the FastAPI backend has a proper delete endpoint
        const success = await blockUser(user.telegram_id, 'User deleted via admin panel');
        
        if (success) {
          toast({
            title: "User Blocked",
            description: `Successfully blocked ${displayName} (delete functionality will be added to FastAPI)`,
          });
        }
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
    // Check if user is blocked (you might need to add this info to the user object from FastAPI)
    const isBlocked = user.status === 'blocked';
    
    if (isBlocked) {
      await unblockUser(user.telegram_id);
    } else {
      await blockUser(user.telegram_id, 'Blocked by admin');
    }
  };

  const handleRemovePayments = async (user: any) => {
    if (window.confirm(`Remove all payments for ${user.first_name} ${user.last_name}?`)) {
      await removeUserPayments(user.telegram_id);
    }
  };

  const exportUserData = () => {
    const csv = [
      ['ID', 'Telegram ID', 'Name', 'Username', 'Phone', 'Status', 'Premium', 'Created', 'Last Active', 'Subscription'].join(','),
      ...filteredUsers.map(user => {
        const displayName = user.first_name 
          ? `${user.first_name} ${user.last_name || ''}`
          : `User ${user.telegram_id}`;
          
        return [
          user.id,
          user.telegram_id,
          `"${displayName.trim()}"`,
          user.username || '',
          user.phone || '',
          user.status || 'active',
          user.is_premium ? 'Yes' : 'No',
          user.created_at,
          user.last_active || 'Never',
          user.subscription_status || 'free'
        ].join(',');
      })
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fastapi_users_export_${new Date().toISOString().split('T')[0]}.csv`;
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
          <div className="text-xl font-semibold text-gray-900">Loading users from FastAPI...</div>
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

        <AdminStatsGrid 
          stats={stats || { totalUsers: 0, activeUsers: 0, premiumUsers: 0, totalRevenue: 0, totalCosts: 0, profit: 0 }} 
          blockedUsersCount={users.filter(u => u.status === 'blocked').length} 
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
              isUserBlocked={(telegramId) => users.find(u => u.telegram_id === telegramId)?.status === 'blocked'}
              onViewUser={handleViewUser}
              onEditUser={handleEditUser}
              onToggleBlock={handleToggleBlock}
              onDeleteUser={handleDeleteUser}
              onRemovePayments={handleRemovePayments}
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
