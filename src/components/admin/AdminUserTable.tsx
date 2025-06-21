import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, UserCheck, UserX, Shield, Crown, Activity } from 'lucide-react';

interface AdminUserTableProps {
  filteredUsers: any[];
  searchTerm: string;
  onSearchChange: (value: string) => void;
  getUserEngagementScore: (user: any) => number;
  isUserBlocked: (telegramId: number) => boolean;
  onBlockUser: (user: any) => void;
  onUnblockUser: (user: any) => void;
  onViewDetails: (user: any) => void;
  onViewUser: (user: any) => void;
  onEditUser: (user: any) => void;
  renderExtraActions?: (user: any) => React.ReactNode;
}

export function AdminUserTable({
  filteredUsers,
  searchTerm,
  onSearchChange,
  getUserEngagementScore,
  isUserBlocked,
  onBlockUser,
  onUnblockUser,
  onViewDetails,
  onViewUser,
  onEditUser,
  renderExtraActions
}: AdminUserTableProps) {
  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search users by name, username, or Telegram ID..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Telegram ID</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Engagement</TableHead>
              <TableHead>Last Active</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.map((user) => (
              <TableRow key={user.telegram_id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div>
                      <div className="font-medium">
                        {user.first_name} {user.last_name}
                      </div>
                      {user.username && (
                        <div className="text-sm text-gray-500">@{user.username}</div>
                      )}
                    </div>
                    {user.is_premium && (
                      <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                        <Crown className="h-3 w-3 mr-1" />
                        Premium
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell className="font-mono text-sm">{user.telegram_id}</TableCell>
                <TableCell>
                  <Badge variant={isUserBlocked(user.telegram_id) ? "destructive" : "default"}>
                    {isUserBlocked(user.telegram_id) ? "Blocked" : "Active"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Activity className="h-4 w-4 text-gray-400" />
                    <span className="text-sm">{getUserEngagementScore(user)}/100</span>
                  </div>
                </TableCell>
                <TableCell className="text-sm text-gray-500">
                  {user.last_active ? new Date(user.last_active).toLocaleDateString() : 'Never'}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onViewDetails(user)}
                    >
                      <Shield className="h-4 w-4" />
                    </Button>
                    {isUserBlocked(user.telegram_id) ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onUnblockUser(user)}
                      >
                        <UserCheck className="h-4 w-4" />
                      </Button>
                    ) : (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => onBlockUser(user)}
                      >
                        <UserX className="h-4 w-4" />
                      </Button>
                    )}
                    {renderExtraActions?.(user)}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
