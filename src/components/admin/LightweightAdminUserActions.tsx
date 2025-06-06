
import React from 'react';
import { Button } from '@/components/ui/button';
import { Eye, Edit, UserCheck, UserX, Trash2, MoreHorizontal } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

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
  const isMobile = useIsMobile();
  
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

  // Mobile: Use dropdown menu for better touch experience
  if (isMobile) {
    return (
      <div className="w-full">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="w-full h-9 bg-slate-800 border-slate-600 text-slate-300 hover:bg-slate-700"
            >
              <MoreHorizontal className="h-4 w-4 mr-2" />
              Actions
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent 
            align="end" 
            className="w-48 bg-slate-800 border-slate-600 z-50"
          >
            <DropdownMenuItem 
              onClick={handleViewClick}
              className="text-slate-300 hover:bg-slate-700 hover:text-white focus:bg-slate-700 focus:text-white"
            >
              <Eye className="h-4 w-4 mr-2" />
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={handleEditClick}
              className="text-slate-300 hover:bg-slate-700 hover:text-white focus:bg-slate-700 focus:text-white"
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit User
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={handleBlockClick}
              className={`hover:bg-slate-700 hover:text-white focus:bg-slate-700 focus:text-white ${
                isBlocked ? 'text-green-400' : 'text-red-400'
              }`}
            >
              {isBlocked ? (
                <>
                  <UserCheck className="h-4 w-4 mr-2" />
                  Unblock User
                </>
              ) : (
                <>
                  <UserX className="h-4 w-4 mr-2" />
                  Block User
                </>
              )}
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={handleDeleteClick}
              className="text-red-400 hover:bg-red-900 hover:text-red-300 focus:bg-red-900 focus:text-red-300"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete User
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  }

  // Desktop: Show individual buttons
  return (
    <div className="flex gap-1">
      <Button
        variant="outline"
        size="sm"
        onClick={handleViewClick}
        className="h-8 w-8 p-0 bg-slate-800 border-slate-600 text-slate-300 hover:bg-slate-700"
        title="View user"
      >
        <Eye className="h-3 w-3" />
      </Button>
      
      <Button
        variant="outline"
        size="sm"
        onClick={handleEditClick}
        className="h-8 w-8 p-0 bg-slate-800 border-slate-600 text-slate-300 hover:bg-slate-700"
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
