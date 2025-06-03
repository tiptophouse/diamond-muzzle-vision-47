
import React from 'react';
import { Button } from '@/components/ui/button';
import { Eye, Edit, UserCheck, UserX, Trash2 } from 'lucide-react';

interface LightweightAdminUserActionsProps {
  user: any;
  isBlocked: boolean;
  onViewUser: (user: any) => void;
  onEditUser: (user: any) => void;
  onToggleBlock: (user: any) => void;
  onDeleteUser: (user: any) => void;
}

export function LightweightAdminUserActions({ 
  user, 
  isBlocked, 
  onViewUser, 
  onEditUser, 
  onToggleBlock, 
  onDeleteUser 
}: LightweightAdminUserActionsProps) {
  
  const handleViewClick = React.useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onViewUser(user);
  }, [user, onViewUser]);

  const handleEditClick = React.useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onEditUser(user);
  }, [user, onEditUser]);

  const handleBlockClick = React.useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onToggleBlock(user);
  }, [user, onToggleBlock]);

  const handleDeleteClick = React.useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onDeleteUser(user);
  }, [user, onDeleteUser]);

  return (
    <div className="flex gap-1">
      <Button
        variant="outline"
        size="sm"
        onClick={handleViewClick}
        className="h-8 w-8 p-0"
        title="View user"
      >
        <Eye className="h-3 w-3" />
      </Button>
      
      <Button
        variant="outline"
        size="sm"
        onClick={handleEditClick}
        className="h-8 w-8 p-0"
        title="Edit user"
      >
        <Edit className="h-3 w-3" />
      </Button>
      
      <Button
        variant={isBlocked ? "outline" : "destructive"}
        size="sm"
        onClick={handleBlockClick}
        className="h-8 w-8 p-0"
        title={isBlocked ? "Unblock user" : "Block user"}
      >
        {isBlocked ? <UserCheck className="h-3 w-3" /> : <UserX className="h-3 w-3" />}
      </Button>
      
      <Button
        variant="destructive"
        size="sm"
        onClick={handleDeleteClick}
        className="h-8 w-8 p-0"
        title="Delete user"
      >
        <Trash2 className="h-3 w-3" />
      </Button>
    </div>
  );
}
