import { useState } from 'react';
import { useBlockedUsers, useBlockUser } from '@/hooks/useBlockUser';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { ShieldBan, ShieldCheck, Search } from 'lucide-react';
import { format } from 'date-fns';

export function BlockedUsersTable() {
  const { data: blockedUsers, isLoading } = useBlockedUsers();
  const { blockUser, unblockUser, isBlocking, isUnblocking } = useBlockUser();
  const [searchTerm, setSearchTerm] = useState('');
  const [isBlockDialogOpen, setIsBlockDialogOpen] = useState(false);
  const [newBlockTelegramId, setNewBlockTelegramId] = useState('');
  const [newBlockReason, setNewBlockReason] = useState('');

  const filteredUsers = blockedUsers?.filter(user => 
    user.telegram_id.toString().includes(searchTerm) ||
    user.reason?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleBlockUser = () => {
    const telegramId = parseInt(newBlockTelegramId);
    if (isNaN(telegramId)) return;

    blockUser(
      { telegramId, reason: newBlockReason },
      {
        onSuccess: () => {
          setIsBlockDialogOpen(false);
          setNewBlockTelegramId('');
          setNewBlockReason('');
        },
      }
    );
  };

  const handleUnblock = (telegramId: number) => {
    if (confirm('Are you sure you want to unblock this user?')) {
      unblockUser(telegramId);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <ShieldBan className="h-5 w-5" />
              Blocked Users Management
            </CardTitle>
            <CardDescription>
              Manage users who are blocked from accessing the platform
            </CardDescription>
          </div>
          <Dialog open={isBlockDialogOpen} onOpenChange={setIsBlockDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="destructive">
                <ShieldBan className="h-4 w-4 mr-2" />
                Block User
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Block User</DialogTitle>
                <DialogDescription>
                  Enter the Telegram ID of the user you want to block
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="telegram-id">Telegram ID</Label>
                  <Input
                    id="telegram-id"
                    type="number"
                    placeholder="123456789"
                    value={newBlockTelegramId}
                    onChange={(e) => setNewBlockTelegramId(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reason">Reason (Optional)</Label>
                  <Textarea
                    id="reason"
                    placeholder="Enter the reason for blocking this user..."
                    value={newBlockReason}
                    onChange={(e) => setNewBlockReason(e.target.value)}
                    rows={3}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsBlockDialogOpen(false)}
                  disabled={isBlocking}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleBlockUser}
                  disabled={isBlocking || !newBlockTelegramId}
                >
                  {isBlocking ? 'Blocking...' : 'Block User'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by Telegram ID or reason..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>

          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              Loading blocked users...
            </div>
          ) : filteredUsers && filteredUsers.length > 0 ? (
            <div className="space-y-3">
              {filteredUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-semibold">
                        Telegram ID: {user.telegram_id}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        Blocked by: {user.blocked_by_telegram_id}
                      </span>
                    </div>
                    {user.reason && (
                      <p className="text-sm text-muted-foreground">
                        Reason: {user.reason}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Blocked on: {format(new Date(user.created_at), 'PPpp')}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleUnblock(user.telegram_id)}
                    disabled={isUnblocking}
                  >
                    <ShieldCheck className="h-4 w-4 mr-2" />
                    Unblock
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              {searchTerm ? 'No matching blocked users found' : 'No blocked users'}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
