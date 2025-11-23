
import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Crown, Phone, Shield, Calendar, Clock, TrendingUp, DollarSign, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useBlockedUsers } from '@/hooks/useBlockedUsers';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface UserDetailsModalProps {
  user: any;
  isOpen: boolean;
  onClose: () => void;
}

interface SubscriptionStatus {
  has_active_subscription: boolean;
  message: string;
}

export function UserDetailsModal({ user, isOpen, onClose }: UserDetailsModalProps) {
  const { isUserBlocked } = useBlockedUsers();
  const blocked = isUserBlocked(user.telegram_id);
  
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus | null>(null);
  const [loadingSubscription, setLoadingSubscription] = useState(true);

  useEffect(() => {
    if (isOpen && user?.telegram_id) {
      fetchSubscriptionStatus();
    }
  }, [isOpen, user?.telegram_id]);

  const fetchSubscriptionStatus = async () => {
    setLoadingSubscription(true);
    try {
      console.log('🔍 Fetching subscription status for user:', user.telegram_id);
      
      const { data, error } = await supabase.functions.invoke('check-subscription-status', {
        body: { user_id: user.telegram_id }
      });

      if (error) {
        console.error('❌ Error fetching subscription:', error);
        toast.error('Failed to fetch subscription status');
        setSubscriptionStatus(null);
      } else {
        console.log('✅ Subscription data:', data);
        setSubscriptionStatus(data);
      }
    } catch (error) {
      console.error('❌ Exception fetching subscription:', error);
      setSubscriptionStatus(null);
    } finally {
      setLoadingSubscription(false);
    }
  };

  // Get real display name
  const getDisplayName = () => {
    if (user.first_name && user.first_name.trim()) {
      const lastName = user.last_name ? ` ${user.last_name.trim()}` : '';
      return `${user.first_name.trim()}${lastName}`;
    }
    if (user.username) {
      return `@${user.username}`;
    }
    return `User ${user.telegram_id}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white">
        <DialogHeader className="border-b border-gray-200 pb-4">
          <DialogTitle className="flex items-center gap-3">
            <Avatar className="h-12 w-12 border-2 border-gray-200">
              <AvatarImage src={user.photo_url} />
              <AvatarFallback className="bg-blue-100 text-blue-700">
                {user.first_name?.charAt(0) || 'U'}{user.last_name?.charAt(0) || ''}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                {getDisplayName()}
                {user.is_premium && <Crown className="h-5 w-5 text-yellow-500" />}
                {user.phone_number && <Phone className="h-5 w-5 text-green-500" />}
                {blocked && <Shield className="h-5 w-5 text-red-500" />}
              </div>
              <div className="text-sm text-muted-foreground">
                Telegram ID: {user.telegram_id}
                {user.username && ` • @${user.username}`}
              </div>
            </div>
          </DialogTitle>
          <DialogDescription>
            Complete user profile and analytics data
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          {/* Basic Information */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              Basic Information
            </h3>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">First Name</label>
                  <div className="text-sm font-semibold">{user.first_name || 'Not provided'}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Last Name</label>
                  <div className="text-sm font-semibold">{user.last_name || 'Not provided'}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Username</label>
                  <div className="text-sm font-semibold">{user.username ? `@${user.username}` : 'Not set'}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Phone Number</label>
                  <div className="text-sm font-semibold">{user.phone_number || 'Not provided'}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Language</label>
                  <div className="text-sm font-semibold">{user.language_code?.toUpperCase() || 'Not set'}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Telegram ID</label>
                  <div className="text-sm font-mono font-semibold">{user.telegram_id}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Account Status */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Shield className="h-5 w-5 text-purple-600" />
              Account Status
            </h3>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Account Status</label>
                  <div>
                    <Badge variant={blocked ? "destructive" : "default"} className={blocked ? 'bg-red-600' : 'bg-green-600'}>
                      {blocked ? 'Blocked' : 'Active'}
                    </Badge>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Subscription Status</label>
                  <div className="flex items-center gap-2">
                    {loadingSubscription ? (
                      <div className="flex items-center gap-1 text-sm">
                        <Loader2 className="h-3 w-3 animate-spin" />
                        <span className="text-gray-500">Checking...</span>
                      </div>
                    ) : subscriptionStatus ? (
                      <div className="flex items-center gap-1">
                        {subscriptionStatus.has_active_subscription ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <XCircle className="h-4 w-4 text-gray-400" />
                        )}
                        <Badge 
                          variant={subscriptionStatus.has_active_subscription ? "default" : "secondary"}
                          className={subscriptionStatus.has_active_subscription ? 'bg-green-600' : 'bg-gray-400'}
                        >
                          {subscriptionStatus.has_active_subscription ? 'PAID' : 'NOT PAID'}
                        </Badge>
                      </div>
                    ) : (
                      <Badge variant="secondary" className="bg-gray-400">
                        Unknown
                      </Badge>
                    )}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Payment Status</label>
                  <div className="text-sm font-semibold">
                    {loadingSubscription ? (
                      <span className="text-gray-400">Loading...</span>
                    ) : subscriptionStatus?.has_active_subscription ? (
                      <span className="text-green-600 font-bold">Active</span>
                    ) : (
                      <span className="text-gray-500">Inactive</span>
                    )}
                  </div>
                </div>
              </div>
              
              {subscriptionStatus?.message && (
                <div className="pt-2 border-t border-gray-200">
                  <label className="text-sm font-medium text-gray-600">Subscription Info</label>
                  <div className="text-sm bg-blue-50 p-2 rounded border border-blue-200">
                    {subscriptionStatus.message}
                  </div>
                </div>
              )}
              
              {user.notes && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Admin Notes</label>
                  <div className="text-sm bg-white p-3 rounded border font-semibold">{user.notes}</div>
                </div>
              )}
            </div>
          </div>

          {/* Activity Analytics */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              Activity Analytics
            </h3>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Total Visits</label>
                  <div className="text-xl font-bold text-blue-600">{user.total_visits || 0}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">API Calls</label>
                  <div className="text-xl font-bold text-purple-600">{user.api_calls_count || 0}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Storage Used</label>
                  <div className="text-sm font-semibold">{user.storage_used_mb || 0} MB</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Time Spent</label>
                  <div className="text-sm font-semibold">{user.total_time_spent || 'N/A'}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Financial Data */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              Financial Data
            </h3>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Lifetime Value</label>
                  <div className="text-xl font-bold text-green-600">${user.lifetime_value || 0}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Revenue/User</label>
                  <div className="text-xl font-bold text-blue-600">${user.revenue_per_user || 0}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Cost/User</label>
                  <div className="text-sm font-semibold">${user.cost_per_user || 0}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Profit/Loss</label>
                  <div className={`text-sm font-bold ${(user.profit_loss || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    ${user.profit_loss || 0}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="md:col-span-2 bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-indigo-600" />
              Timeline
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Account Created</label>
                <div className="text-sm font-semibold">{new Date(user.created_at).toLocaleString()}</div>
                <div className="text-xs text-gray-500">
                  {formatDistanceToNow(new Date(user.created_at), { addSuffix: true })}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Last Active</label>
                <div className="text-sm font-semibold">
                  {user.last_active ? new Date(user.last_active).toLocaleString() : 'Never'}
                </div>
                {user.last_active && (
                  <div className="text-xs text-gray-500">
                    {formatDistanceToNow(new Date(user.last_active), { addSuffix: true })}
                  </div>
                )}
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Last Login</label>
                <div className="text-sm font-semibold">
                  {user.last_login ? new Date(user.last_login).toLocaleString() : 'Never'}
                </div>
                {user.last_login && (
                  <div className="text-xs text-gray-500">
                    {formatDistanceToNow(new Date(user.last_login), { addSuffix: true })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
