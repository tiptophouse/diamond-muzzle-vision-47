
import React, { useState } from 'react';
import { useAdminData } from '@/hooks/useAdminData';
import { useBlockedUsers } from '@/hooks/useBlockedUsers';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

export function useAdminUserManagement() {
  const { stats, users, isLoading, error, dataSource, refetch, getUserEngagementScore } = useAdminData();
  const { isUserBlocked, blockUser, unblockUser, blockedUsers } = useBlockedUsers();
  const { toast } = useToast();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [showAddUser, setShowAddUser] = useState(false);
  const [showEditUser, setShowEditUser] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);

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
    const displayName = user.first_name 
      ? `${user.first_name} ${user.last_name || ''}`.trim()
      : `User ${user.telegram_id}`;
      
    if (window.confirm(`Are you sure you want to delete ${displayName}? This action cannot be undone.`)) {
      try {
        console.log('Deleting user from Supabase:', user.telegram_id);
        
        // Delete from related tables first
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
    a.download = `admin_users_export_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const averageEngagement = users.length > 0 
    ? Math.round(users.reduce((sum, u) => sum + getUserEngagementScore(u), 0) / users.length)
    : 0;

  return {
    // Data
    stats,
    users,
    filteredUsers,
    isLoading,
    error,
    dataSource,
    blockedUsers,
    averageEngagement,
    
    // State
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
    
    // Functions
    getUserEngagementScore,
    isUserBlocked,
    handleViewUser,
    handleEditUser,
    handleDeleteUser,
    handleToggleBlock,
    exportUserData,
    refetch,
  };
}
