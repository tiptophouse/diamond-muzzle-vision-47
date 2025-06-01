
import React from 'react';
import { users } from 'lucide-react';
import { AdminUserSearch } from './AdminUserSearch';
import { AdminUserCard } from './AdminUserCard';

interface AdminUserTableProps {
  filteredUsers: any[];
  searchTerm: string;
  onSearchChange: (value: string) => void;
  getUserEngagementScore: (user: any) => number;
  isUserBlocked: (telegramId: number) => boolean;
  onViewUser: (user: any) => void;
  onEditUser: (user: any) => void;
  onToggleBlock: (user: any) => void;
  onDeleteUser: (user: any) => void;
}

export function AdminUserTable({ 
  filteredUsers, 
  searchTerm, 
  onSearchChange, 
  getUserEngagementScore, 
  isUserBlocked, 
  onViewUser, 
  onEditUser, 
  onToggleBlock, 
  onDeleteUser 
}: AdminUserTableProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
              <users className="h-6 w-6 text-blue-600" />
              User Management ({filteredUsers.length} users)
            </h2>
            <p className="text-gray-600 text-sm mt-1">
              Complete user database with management controls
            </p>
          </div>
        </div>
        
        <AdminUserSearch searchTerm={searchTerm} onSearchChange={onSearchChange} />
      </div>

      <div className="divide-y divide-gray-100">
        {filteredUsers.map((user) => {
          const blocked = isUserBlocked(user.telegram_id);
          const engagementScore = getUserEngagementScore(user);
          
          return (
            <AdminUserCard
              key={user.id}
              user={user}
              isBlocked={blocked}
              engagementScore={engagementScore}
              onViewUser={onViewUser}
              onEditUser={onEditUser}
              onToggleBlock={onToggleBlock}
              onDeleteUser={onDeleteUser}
            />
          );
        })}
      </div>
    </div>
  );
}
