
import React from 'react';
import { Users } from 'lucide-react';
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
  dataSource?: 'fastapi' | 'supabase';
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
  onDeleteUser,
  dataSource = 'supabase'
}: AdminUserTableProps) {
  return (
    <div className="bg-gray-50 border border-gray-200">
      <div className="p-6 border-b border-gray-300 bg-white">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Users className="h-6 w-6 text-blue-600" />
              Real User Management ({filteredUsers.length} users)
            </h2>
            <p className="text-gray-600 text-sm mt-1">
              Complete user database with management controls
            </p>
            <div className="flex items-center gap-2 mt-2">
              <div className={`w-2 h-2 rounded-full ${dataSource === 'fastapi' ? 'bg-green-500' : 'bg-blue-500'}`}></div>
              <span className="text-xs text-gray-500">
                Data Source: {dataSource === 'fastapi' ? 'FastAPI Backend' : 'Supabase Database'}
              </span>
            </div>
          </div>
        </div>
        
        <AdminUserSearch searchTerm={searchTerm} onSearchChange={onSearchChange} />
      </div>

      <div className="bg-white divide-y divide-gray-200">
        {filteredUsers.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No users found matching your search criteria.</p>
          </div>
        ) : (
          filteredUsers.map((user) => {
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
          })
        )}
      </div>
    </div>
  );
}
