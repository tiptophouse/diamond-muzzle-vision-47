
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MessageSquare, Edit2, Eye, BarChart3 } from 'lucide-react';
import { useUserActions } from '@/hooks/useUserActions';
import { AdminUserActions } from './AdminUserActions';

interface UserActionButtonsProps {
  user: any;
  isBlocked: boolean;
  onViewUser: (user: any) => void;
  onEditUser: (user: any) => void;
  onToggleBlock: (user: any) => void;
  onDeleteUser: (user: any) => void;
}

export function UserActionButtons({
  user,
  isBlocked,
  onViewUser,
  onEditUser,
  onToggleBlock,
  onDeleteUser
}: UserActionButtonsProps) {
  const [messageOpen, setMessageOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [usageOpen, setUsageOpen] = useState(false);
  const { sendMessage, isLoading } = useUserActions();

  const handleSendMessage = async () => {
    if (!message.trim()) return;
    
    const success = await sendMessage(user.telegram_id, message);
    if (success) {
      setMessage('');
      setMessageOpen(false);
    }
  };

  return (
    <div className="flex gap-1 sm:gap-2">
      {/* View User */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => onViewUser(user)}
        className="h-8 w-8 p-0"
      >
        <Eye className="h-3 w-3" />
      </Button>

      {/* Send Message */}
      <Dialog open={messageOpen} onOpenChange={setMessageOpen}>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="h-8 w-8 p-0"
          >
            <MessageSquare className="h-3 w-3" />
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Message to {user.first_name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message here..."
                rows={4}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setMessageOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSendMessage} disabled={isLoading || !message.trim()}>
                {isLoading ? 'Sending...' : 'Send Message'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Usage/Analytics */}
      <Dialog open={usageOpen} onOpenChange={setUsageOpen}>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="h-8 w-8 p-0"
          >
            <BarChart3 className="h-3 w-3" />
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{user.first_name}'s Usage Analytics</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-blue-50 rounded">
                <div className="text-sm text-blue-600">Total Visits</div>
                <div className="text-xl font-bold text-blue-900">{user.total_visits || 0}</div>
              </div>
              <div className="p-3 bg-green-50 rounded">
                <div className="text-sm text-green-600">API Calls</div>
                <div className="text-xl font-bold text-green-900">{user.api_calls_count || 0}</div>
              </div>
              <div className="p-3 bg-purple-50 rounded">
                <div className="text-sm text-purple-600">Subscription</div>
                <div className="text-xl font-bold text-purple-900">{user.subscription_status || 'free'}</div>
              </div>
              <div className="p-3 bg-orange-50 rounded">
                <div className="text-sm text-orange-600">Last Active</div>
                <div className="text-sm font-bold text-orange-900">
                  {user.last_active ? new Date(user.last_active).toLocaleDateString() : 'Never'}
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Standard Admin Actions */}
      <AdminUserActions
        user={user}
        isBlocked={isBlocked}
        onViewUser={onViewUser}
        onEditUser={onEditUser}
        onToggleBlock={onToggleBlock}
        onDeleteUser={onDeleteUser}
      />
    </div>
  );
}
