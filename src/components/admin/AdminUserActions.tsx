
import React from 'react';
import { Button } from '@/components/ui/button';
import { Eye, Edit, UserCheck, UserX, Trash2 } from 'lucide-react';

interface AdminUserActionsProps {
  user: any;
  isBlocked: boolean;
  onViewUser: (user: any) => void;
  onEditUser: (user: any) => void;
  onToggleBlock: (user: any) => void;
  onDeleteUser: (user: any) => void;
}

export function AdminUserActions({ 
  user, 
  isBlocked, 
  onViewUser, 
  onEditUser, 
  onToggleBlock, 
  onDeleteUser 
}: AdminUserActionsProps) {
  
  const handleViewClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('👁️ View button clicked for user:', user.telegram_id);
    onViewUser(user);
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('✏️ Edit button clicked for user:', user.telegram_id);
    onEditUser(user);
  };

  const handleBlockClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('🚫 Block button clicked for user:', user.telegram_id, 'Currently blocked:', isBlocked);
    onToggleBlock(user);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('🗑️ Delete button clicked for user:', user.telegram_id);
    onDeleteUser(user);
  };

  return (
    <div className="flex gap-1 sm:gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={handleViewClick}
        className="bg-slate-800 border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white h-8 w-8 sm:h-9 sm:w-9 p-0"
        title="View user details"
      >
        <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
      </Button>
      
      <Button
        variant="outline"
        size="sm"
        onClick={handleEditClick}
        className="bg-slate-800 border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white h-8 w-8 sm:h-9 sm:w-9 p-0"
        title="Edit user"
      >
        <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
      </Button>
      
      <Button
        variant={isBlocked ? "outline" : "destructive"}
        size="sm"
        onClick={handleBlockClick}
        className={`h-8 w-8 sm:h-9 sm:w-9 p-0 ${
          isBlocked 
            ? 'bg-green-700 border-green-600 text-white hover:bg-green-600' 
            : 'bg-red-700 border-red-600 text-white hover:bg-red-600'
        }`}
        title={isBlocked ? "Unblock user" : "Block user"}
      >
        {isBlocked ? <UserCheck className="h-3 w-3 sm:h-4 sm:w-4" /> : <UserX className="h-3 w-3 sm:h-4 sm:w-4" />}
      </Button>
      
      <Button
        variant="destructive"
        size="sm"
        onClick={handleDeleteClick}
        className="bg-red-700 border-red-600 text-white hover:bg-red-600 h-8 w-8 sm:h-9 sm:w-9 p-0"
        title="Delete user permanently"
      >
        <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
      </Button>
    </div>
  );
}
