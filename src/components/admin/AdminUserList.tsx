
import React from 'react';
import { AdminUserTable } from './AdminUserTable';
import { UserDataManager } from './UserDataManager';
import { useToast } from '@/components/ui/use-toast';

interface AdminUserListProps {
  filteredUsers: any[];
  searchTerm: string;
  onSearchChange: (value: string) => void;
  getUserEngagementScore: (user: any) => number;
  isUserBlocked: (telegramId: number) => boolean;
  blockedUsers: any[];
  onViewUser: (user: any) => void;
  onEditUser: (user: any) => void;
  onDeleteUser: (user: any) => void;
  onToggleBlock: (user: any) => void;
  onRefetch: () => void;
}

export function AdminUserList({
  filteredUsers,
  searchTerm,
  onSearchChange,
  getUserEngagementScore,
  isUserBlocked,
  blockedUsers,
  onViewUser,
  onEditUser,
  onDeleteUser,
  onToggleBlock,
  onRefetch
}: AdminUserListProps) {
  const { toast } = useToast();

  const handleBlockUser = async (user: any) => {
    // This will be handled by the parent component
    onToggleBlock(user);
  };

  const handleUnblockUser = async (user: any) => {
    // This will be handled by the parent component
    onToggleBlock(user);
  };

  const handleViewDetails = (user: any) => {
    onViewUser(user);
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="space-y-4">
        <AdminUserTable
          filteredUsers={filteredUsers}
          searchTerm={searchTerm}
          onSearchChange={onSearchChange}
          getUserEngagementScore={getUserEngagementScore}
          isUserBlocked={isUserBlocked}
          onBlockUser={handleBlockUser}
          onUnblockUser={handleUnblockUser}
          onViewDetails={handleViewDetails}
          onViewUser={onViewUser}
          onEditUser={onEditUser}
          onToggleBlock={onToggleBlock}
          onDeleteUser={onDeleteUser}
          renderExtraActions={(user) => (
            <UserDataManager
              user={user}
              onDataCleared={() => {
                toast({
                  title: "Data Cleared",
                  description: `All data for user has been removed.`,
                });
                onRefetch();
              }}
            />
          )}
        />
      </div>
    </div>
  );
}
