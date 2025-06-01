
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useBlockedUsers } from '@/hooks/useBlockedUsers';
import { Shield, UserX, Trash2, Plus } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export function BlockedUsersManager() {
  const { blockedUsers, isLoading, blockUser, unblockUser } = useBlockedUsers();
  const [newTelegramId, setNewTelegramId] = useState('');
  const [blockReason, setBlockReason] = useState('');
  const [isBlocking, setIsBlocking] = useState(false);

  const handleBlockUser = async () => {
    const telegramId = parseInt(newTelegramId);
    if (!telegramId || isNaN(telegramId)) {
      return;
    }

    setIsBlocking(true);
    const success = await blockUser(telegramId, blockReason);
    if (success) {
      setNewTelegramId('');
      setBlockReason('');
    }
    setIsBlocking(false);
  };

  const handleUnblockUser = async (blockedUserId: string) => {
    await unblockUser(blockedUserId);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading blocked users...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Blocked Users Management
        </CardTitle>
        <CardDescription>
          Manage blocked users by their Telegram ID
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Block New User Section */}
        <div className="border rounded-lg p-4 space-y-4">
          <h3 className="font-medium flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Block New User
          </h3>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="telegram-id" className="text-sm font-medium">
                Telegram ID
              </label>
              <Input
                id="telegram-id"
                type="number"
                placeholder="Enter Telegram ID"
                value={newTelegramId}
                onChange={(e) => setNewTelegramId(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="reason" className="text-sm font-medium">
                Reason (Optional)
              </label>
              <Textarea
                id="reason"
                placeholder="Reason for blocking..."
                value={blockReason}
                onChange={(e) => setBlockReason(e.target.value)}
                rows={2}
              />
            </div>
          </div>
          <Button 
            onClick={handleBlockUser}
            disabled={!newTelegramId || isBlocking}
            className="w-full md:w-auto"
          >
            <UserX className="h-4 w-4 mr-2" />
            {isBlocking ? 'Blocking...' : 'Block User'}
          </Button>
        </div>

        {/* Blocked Users List */}
        <div className="space-y-4">
          <h3 className="font-medium">Currently Blocked Users ({blockedUsers.length})</h3>
          
          {blockedUsers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No users are currently blocked
            </div>
          ) : (
            <div className="space-y-3">
              {blockedUsers.map((blockedUser) => (
                <div key={blockedUser.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Badge variant="destructive">{blockedUser.telegram_id}</Badge>
                      <span className="text-sm text-muted-foreground">
                        Blocked {formatDistanceToNow(new Date(blockedUser.created_at), { addSuffix: true })}
                      </span>
                    </div>
                    {blockedUser.reason && (
                      <p className="text-sm text-muted-foreground">
                        Reason: {blockedUser.reason}
                      </p>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleUnblockUser(blockedUser.id)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Unblock
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
