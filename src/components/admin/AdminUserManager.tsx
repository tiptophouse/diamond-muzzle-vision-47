
import React from 'react';
import { useAdminUserManagement } from './AdminUserManagement';
import { AdminLoadingState } from './AdminLoadingState';
import { AdminErrorState } from './AdminErrorState';
import { AdminDataSourceStatus } from './AdminDataSourceStatus';
import { UserDetailsModal } from './UserDetailsModal';
import { AddUserModal } from './AddUserModal';
import { EditUserModal } from './EditUserModal';
import { AdminHeader } from './AdminHeader';
import { AdminStatsGrid } from './AdminStatsGrid';
import { AdminUserTable } from './AdminUserTable';
import { NotificationSender } from './NotificationSender';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export function AdminUserManager() {
  const {
    stats,
    users,
    filteredUsers,
    isLoading,
    error,
    dataSource,
    blockedUsers,
    averageEngagement,
    searchTerm,
    setSearchTerm,
    selectedUser,
    showUserDetails,
    setShowUserDetails,
    showAddUser,
    setShowAddUser,
    showEditUser,
    setShowEditUser,
    editingUser,
    getUserEngagementScore,
    isUserBlocked,
    handleViewUser,
    handleEditUser,
    handleDeleteUser,
    handleToggleBlock,
    exportUserData,
    refetch,
  } = useAdminUserManagement();

  if (isLoading) {
    return <AdminLoadingState />;
  }

  if (error) {
    return <AdminErrorState error={error} onRetry={refetch} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
        <AdminHeader onExportData={exportUserData} onAddUser={() => setShowAddUser(true)} />

        <AdminDataSourceStatus 
          dataSource={dataSource} 
          usersCount={users.length} 
          stats={stats} 
        />

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
              dataSource={dataSource}
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
