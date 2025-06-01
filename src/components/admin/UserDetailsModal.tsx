
import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Crown, Phone, Shield, Calendar, Clock, TrendingUp, DollarSign } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useBlockedUsers } from '@/hooks/useBlockedUsers';

interface UserDetailsModalProps {
  user: any;
  isOpen: boolean;
  onClose: () => void;
}

export function UserDetailsModal({ user, isOpen, onClose }: UserDetailsModalProps) {
  const { isUserBlocked } = useBlockedUsers();
  const blocked = isUserBlocked(user.telegram_id);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={user.photo_url} />
              <AvatarFallback>
                {user.first_name.charAt(0)}{user.last_name?.charAt(0) || ''}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                {user.first_name} {user.last_name}
                {user.is_premium && <Crown className="h-5 w-5 text-yellow-500" />}
                {user.phone_number && <Phone className="h-5 w-5 text-green-500" />}
                {blocked && <Shield className="h-5 w-5 text-red-500" />}
              </div>
              <div className="text-sm text-muted-foreground">@{user.username || user.telegram_id}</div>
            </div>
          </DialogTitle>
          <DialogDescription>
            Complete user profile and analytics data
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">First Name</label>
                  <div className="text-sm">{user.first_name}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Last Name</label>
                  <div className="text-sm">{user.last_name || 'Not provided'}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Username</label>
                  <div className="text-sm">@{user.username || 'Not set'}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Telegram ID</label>
                  <div className="text-sm font-mono">{user.telegram_id}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Phone Number</label>
                  <div className="text-sm">{user.phone_number || 'Not provided'}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Language</label>
                  <div className="text-sm">{user.language_code?.toUpperCase() || 'Not set'}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Account Status */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Account Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Status</label>
                  <div>
                    <Badge variant={blocked ? "destructive" : "default"}>
                      {blocked ? 'Blocked' : 'Active'}
                    </Badge>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Premium</label>
                  <div>
                    <Badge variant={user.is_premium ? "default" : "secondary"}>
                      {user.is_premium ? 'Premium' : 'Free'}
                    </Badge>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Subscription</label>
                  <div className="text-sm">{user.subscription_status || 'free'}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Payment Status</label>
                  <div className="text-sm">{user.payment_status || 'none'}</div>
                </div>
              </div>
              
              {user.notes && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Admin Notes</label>
                  <div className="text-sm bg-gray-50 p-2 rounded border">{user.notes}</div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Activity Analytics */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Activity Analytics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Total Visits</label>
                  <div className="text-lg font-semibold">{user.total_visits}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">API Calls</label>
                  <div className="text-lg font-semibold">{user.api_calls_count}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Storage Used</label>
                  <div className="text-sm">{user.storage_used_mb || 0} MB</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Time Spent</label>
                  <div className="text-sm">{user.total_time_spent || 'N/A'}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Financial Data */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Financial Data
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Lifetime Value</label>
                  <div className="text-lg font-semibold">${user.lifetime_value || 0}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Revenue/User</label>
                  <div className="text-lg font-semibold">${user.revenue_per_user || 0}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Cost/User</label>
                  <div className="text-sm">${user.cost_per_user || 0}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Profit/Loss</label>
                  <div className={`text-sm font-semibold ${(user.profit_loss || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    ${user.profit_loss || 0}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Timestamps */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Account Created</label>
                  <div className="text-sm">{new Date(user.created_at).toLocaleString()}</div>
                  <div className="text-xs text-gray-400">
                    {formatDistanceToNow(new Date(user.created_at), { addSuffix: true })}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Last Active</label>
                  <div className="text-sm">
                    {user.last_active ? new Date(user.last_active).toLocaleString() : 'Never'}
                  </div>
                  {user.last_active && (
                    <div className="text-xs text-gray-400">
                      {formatDistanceToNow(new Date(user.last_active), { addSuffix: true })}
                    </div>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Last Login</label>
                  <div className="text-sm">
                    {user.last_login ? new Date(user.last_login).toLocaleString() : 'Never'}
                  </div>
                  {user.last_login && (
                    <div className="text-xs text-gray-400">
                      {formatDistanceToNow(new Date(user.last_login), { addSuffix: true })}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
