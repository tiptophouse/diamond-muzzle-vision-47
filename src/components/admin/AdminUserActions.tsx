
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
  return (
    <div className="flex gap-1 sm:gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => onViewUser(user)}
        className="glass-card border-purple-500/30 text-purple-300 hover:bg-purple-500/20 h-8 w-8 sm:h-9 sm:w-9 p-0"
      >
        <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => onEditUser(user)}
        className="glass-card border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/20 h-8 w-8 sm:h-9 sm:w-9 p-0"
      >
        <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
      </Button>
      <Button
        variant={isBlocked ? "outline" : "destructive"}
        size="sm"
        onClick={() => onToggleBlock(user)}
        className={`h-8 w-8 sm:h-9 sm:w-9 p-0 ${
          isBlocked 
            ? 'glass-card border-green-500/30 text-green-300 hover:bg-green-500/20' 
            : 'glass-card border-orange-500/30 text-orange-300 hover:bg-orange-500/20'
        }`}
      >
        {isBlocked ? <UserCheck className="h-3 w-3 sm:h-4 sm:w-4" /> : <UserX className="h-3 w-3 sm:h-4 sm:w-4" />}
      </Button>
      <Button
        variant="destructive"
        size="sm"
        onClick={() => onDeleteUser(user)}
        className="glass-card border-pink-500/30 text-pink-300 hover:bg-pink-500/20 h-8 w-8 sm:h-9 sm:w-9 p-0"
      >
        <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
      </Button>
    </div>
  );
}
