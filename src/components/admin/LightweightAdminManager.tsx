
import React, { useState, useCallback } from 'react';
import { Settings, Users, UserPlus, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useSimplifiedAnalytics } from '@/hooks/useSimplifiedAnalytics';
import { useBlockedUsers } from '@/hooks/useBlockedUsers';
import { LightweightAdminUserActions } from './LightweightAdminUserActions';
import { UserDetailsModal } from './UserDetailsModal';
import { EditUserModal } from './EditUserModal';
import { AddUserModal } from './AddUserModal';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export function LightweightAdminManager() {
  const { users, isLoading, error, getUserStats, refetch } = useSimplifiedAnalytics();
  const { isUserBlocked, blockUser, unblockUser, blockedUsers } = useBlockedUsers();
  const { toast } = useToast();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [showAddUser, setShowAddUser] = useState(false);
  const [showEditUser, setShowEditUser] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);

  const stats = getUserStats();

  const filteredUsers = users.filter(user => {
    const fullName = `${user.first_name} ${user.last_name || ''}`.toLowerCase();
    const searchLower = searchTerm.toLowerCase();
    return (
      fullName.includes(searchLower) ||
      user.telegram_id.toString().includes(searchTerm) ||
      user.username?.toLowerCase().includes(searchLower)
    );
  });

  const handleViewUser = useCallback((user: any) => {
    setSelectedUser(user);
    setShowUserDetails(true);
  }, []);

  const handleEditUser = useCallback((user: any) => {
    setEditingUser(user);
    setShowEditUser(true);
  }, []);

  const handleDeleteUser = useCallback(async (user: any) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete ${user.first_name} ${user.last_name}?`
    );
    
    if (!confirmDelete) return;

    try {
      const { error } = await supabase
        .from('user_profiles')
        .delete()
        .eq('telegram_id', user.telegram_id);

      if (error) throw error;

      toast({
        title: "User Deleted",
        description: `${user.first_name} ${user.last_name} has been deleted`,
      });

      refetch();
    } catch (error) {
      console.error('Error deleting user:', error);
      toast({
        title: "Error",
        description: "Failed to delete user",
        variant: "destructive",
      });
    }
  }, [toast, refetch]);

  const handleToggleBlock = useCallback(async (user: any) => {
    const blocked = isUserBlocked(user.telegram_id);
    
    try {
      if (blocked) {
        const blockedUser = blockedUsers.find(bu => bu.telegram_id === user.telegram_id);
        if (blockedUser) {
          await unblockUser(blockedUser.id);
          toast({
            title: "User Unblocked",
            description: `${user.first_name} ${user.last_name} has been unblocked`,
          });
        }
      } else {
        await blockUser(user.telegram_id, 'Blocked by admin');
        toast({
          title: "User Blocked",
          description: `${user.first_name} ${user.last_name} has been blocked`,
        });
      }
    } catch (error) {
      console.error('Error toggling block status:', error);
      toast({
        title: "Error",
        description: "Failed to update block status",
        variant: "destructive",
      });
    }
  }, [isUserBlocked, blockedUsers, unblockUser, blockUser, toast]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 to-slate-900 p-4">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-slate-700 border-t-slate-400 mx-auto mb-6"></div>
          <div className="text-xl font-semibold text-white">Loading admin panel...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 to-slate-900 p-4">
        <div className="text-center py-12">
          <div className="text-xl font-semibold text-red-400 mb-4">Error loading admin panel</div>
          <p className="text-slate-400 mb-6">{error}</p>
          <Button onClick={refetch} className="bg-slate-700 hover:bg-slate-600">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 to-slate-900 p-4">
      <div className="container mx-auto space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl p-6 border border-slate-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-slate-700 rounded-xl">
                <Settings className="h-8 w-8 text-slate-300" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
                <p className="text-slate-400">Lightweight user management</p>
              </div>
            </div>
            
            <div className="flex gap-3">
              <Button onClick={() => setShowAddUser(true)} className="bg-slate-700 hover:bg-slate-600">
                <UserPlus className="h-4 w-4 mr-2" />
                Add User
              </Button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-900 rounded-xl p-4 border border-slate-700">
            <div className="text-2xl font-bold text-white">{stats.totalUsers}</div>
            <div className="text-sm text-slate-400">Total Users</div>
          </div>
          <div className="bg-slate-900 rounded-xl p-4 border border-slate-700">
            <div className="text-2xl font-bold text-white">{stats.premiumUsers}</div>
            <div className="text-sm text-slate-400">Premium Users</div>
          </div>
          <div className="bg-slate-900 rounded-xl p-4 border border-slate-700">
            <div className="text-2xl font-bold text-white">{stats.usersWithPhone}</div>
            <div className="text-sm text-slate-400">Phone Verified</div>
          </div>
          <div className="bg-slate-900 rounded-xl p-4 border border-slate-700">
            <div className="text-2xl font-bold text-white">{blockedUsers.length}</div>
            <div className="text-sm text-slate-400">Blocked Users</div>
          </div>
        </div>

        {/* User Management */}
        <div className="bg-slate-900 rounded-xl p-6 border border-slate-700">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Users className="h-6 w-6" />
              User Management ({filteredUsers.length} users)
            </h2>
          </div>
          
          <div className="mb-6">
            <Input
              placeholder="Search by name, ID, or username..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-slate-800 border-slate-600 text-white"
            />
          </div>

          <div className="space-y-3 max-h-96 overflow-y-auto">
            {filteredUsers.map((user) => {
              const blocked = isUserBlocked(user.telegram_id);
              
              return (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-4 bg-slate-800 rounded-lg border border-slate-700"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div>
                        <div className="font-medium text-white">
                          {user.first_name} {user.last_name}
                        </div>
                        <div className="text-sm text-slate-400">
                          ID: {user.telegram_id} • {user.username && `@${user.username} • `}
                          {user.subscription_status}
                        </div>
                      </div>
                      {user.is_premium && (
                        <span className="px-2 py-1 bg-yellow-600 text-white text-xs rounded">
                          Premium
                        </span>
                      )}
                      {blocked && (
                        <span className="px-2 py-1 bg-red-600 text-white text-xs rounded">
                          Blocked
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <LightweightAdminUserActions
                    user={user}
                    isBlocked={blocked}
                    onViewUser={handleViewUser}
                    onEditUser={handleEditUser}
                    onToggleBlock={handleToggleBlock}
                    onDeleteUser={handleDeleteUser}
                  />
                </div>
              );
            })}
          </div>
        </div>

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
            onSave={refetch}
          />
        )}
      </div>
    </div>
  );
}
