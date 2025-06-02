
import React, { useState, useEffect } from 'react';
import { Clock, Check, X, User, UserCheck } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface PendingUser {
  id: string;
  telegram_id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  created_at: string;
  status: string;
}

export function PendingUsersManager() {
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  const fetchPendingUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('id, telegram_id, first_name, last_name, username, created_at, status')
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPendingUsers(data || []);
    } catch (error) {
      console.error('Error fetching pending users:', error);
      toast({
        title: "Error",
        description: "Failed to load pending users",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const approveUser = async (user: PendingUser) => {
    setProcessingIds(prev => new Set(prev).add(user.id));
    
    try {
      // Update user status to active
      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({ 
          status: 'active',
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (updateError) throw updateError;

      // Log admin action
      await supabase
        .from('user_management_log')
        .insert({
          admin_telegram_id: 2138564172,
          action_type: 'approved',
          target_telegram_id: user.telegram_id,
          reason: 'User approved by admin'
        });

      toast({
        title: "User Approved",
        description: `${user.first_name} can now access the application`,
      });

      // Remove from pending list
      setPendingUsers(prev => prev.filter(u => u.id !== user.id));
    } catch (error: any) {
      console.error('Error approving user:', error);
      toast({
        title: "Error",
        description: "Failed to approve user",
        variant: "destructive",
      });
    } finally {
      setProcessingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(user.id);
        return newSet;
      });
    }
  };

  const rejectUser = async (user: PendingUser) => {
    setProcessingIds(prev => new Set(prev).add(user.id));
    
    try {
      // Block the user instead of deleting
      const { error: blockError } = await supabase
        .from('blocked_users')
        .insert({
          telegram_id: user.telegram_id,
          blocked_by_telegram_id: 2138564172,
          reason: 'User rejected during approval process'
        });

      if (blockError) throw blockError;

      // Update user status to rejected
      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({ 
          status: 'rejected',
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (updateError) throw updateError;

      // Log admin action
      await supabase
        .from('user_management_log')
        .insert({
          admin_telegram_id: 2138564172,
          action_type: 'rejected',
          target_telegram_id: user.telegram_id,
          reason: 'User rejected during approval process'
        });

      toast({
        title: "User Rejected",
        description: `${user.first_name} has been rejected and blocked`,
      });

      // Remove from pending list
      setPendingUsers(prev => prev.filter(u => u.id !== user.id));
    } catch (error: any) {
      console.error('Error rejecting user:', error);
      toast({
        title: "Error",
        description: "Failed to reject user",
        variant: "destructive",
      });
    } finally {
      setProcessingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(user.id);
        return newSet;
      });
    }
  };

  useEffect(() => {
    fetchPendingUsers();
    
    // Set up real-time subscription for new pending users
    const channel = supabase
      .channel('pending-users')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'user_profiles',
          filter: 'status=eq.pending'
        },
        () => {
          fetchPendingUsers();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg border p-6">
        <div className="flex items-center gap-3 mb-4">
          <Clock className="h-5 w-5 text-orange-600" />
          <h3 className="text-lg font-semibold">Pending Approvals</h3>
        </div>
        <div className="animate-pulse space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-16 bg-gray-100 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border p-6">
      <div className="flex items-center gap-3 mb-4">
        <Clock className="h-5 w-5 text-orange-600" />
        <h3 className="text-lg font-semibold">Pending Approvals</h3>
        <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded text-sm">
          {pendingUsers.length}
        </span>
      </div>

      {pendingUsers.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <UserCheck className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p>No pending approvals</p>
        </div>
      ) : (
        <div className="space-y-3">
          {pendingUsers.map((user) => {
            const isProcessing = processingIds.has(user.id);
            const displayName = user.first_name && !['Test', 'Telegram', 'Emergency'].includes(user.first_name)
              ? `${user.first_name} ${user.last_name || ''}`.trim()
              : `User ${user.telegram_id}`;

            return (
              <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg bg-gray-50">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-100 rounded-full p-2">
                    <User className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <div className="font-medium">{displayName}</div>
                    <div className="text-sm text-gray-500">
                      @{user.username || 'no_username'} • ID: {user.telegram_id}
                    </div>
                    <div className="text-xs text-gray-400">
                      Requested: {new Date(user.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => approveUser(user)}
                    disabled={isProcessing}
                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-3 py-2 rounded-lg text-sm transition-colors"
                  >
                    <Check className="h-4 w-4" />
                    {isProcessing ? 'Processing...' : 'Approve'}
                  </button>
                  <button
                    onClick={() => rejectUser(user)}
                    disabled={isProcessing}
                    className="flex items-center gap-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white px-3 py-2 rounded-lg text-sm transition-colors"
                  >
                    <X className="h-4 w-4" />
                    Reject
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
