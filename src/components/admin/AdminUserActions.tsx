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
    <div className="flex gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => onViewUser(user)}
        className="glass-card border-purple-500/30 text-purple-300 hover:bg-purple-500/20 touch-target min-h-[44px] min-w-[44px] p-2"
      >
        <Eye className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => onEditUser(user)}
        className="glass-card border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/20 touch-target min-h-[44px] min-w-[44px] p-2"
      >
        <Edit className="h-4 w-4" />
      </Button>
      <Button
        variant={isBlocked ? "outline" : "destructive"}
        size="sm"
        onClick={() => onToggleBlock(user)}
        className={`touch-target min-h-[44px] min-w-[44px] p-2 ${
          isBlocked 
            ? 'glass-card border-green-500/30 text-green-300 hover:bg-green-500/20' 
            : 'glass-card border-orange-500/30 text-orange-300 hover:bg-orange-500/20'
        }`}
      >
        {isBlocked ? <UserCheck className="h-4 w-4" /> : <UserX className="h-4 w-4" />}
      </Button>
      <Button
        variant="destructive"
        size="sm"
        onClick={() => onDeleteUser(user)}
        className="glass-card border-red-500/30 text-red-300 hover:bg-red-500/20 touch-target min-h-[44px] min-w-[44px] p-2"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}