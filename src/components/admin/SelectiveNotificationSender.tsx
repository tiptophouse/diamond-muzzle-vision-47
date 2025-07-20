import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Send, Users, Search, UserCheck, UserX } from 'lucide-react';

interface UserProfile {
  telegram_id: number;
  first_name?: string;
  last_name?: string;
  username?: string;
  is_premium?: boolean;
  last_login?: string;
  diamond_count?: number;
}

export function SelectiveNotificationSender() {
  const { toast } = useToast();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<Set<number>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      // Get all user profiles
      const { data: userProfiles, error } = await supabase
        .from('user_profiles')
        .select(`
          telegram_id,
          first_name,
          last_name,
          username,
          is_premium,
          last_login
        `)
        .order('first_name', { ascending: true });

      if (error) throw error;
      if (!userProfiles) return;

      // Get diamond counts for each user
      const usersWithCounts = await Promise.all(
        userProfiles.map(async (user) => {
          const { count } = await supabase
            .from('inventory')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.telegram_id)
            .is('deleted_at', null);

          return {
            ...user,
            diamond_count: count || 0
          };
        })
      );

      setUsers(usersWithCounts);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: "Error",
        description: "Failed to load users. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user => {
    const searchLower = searchTerm.toLowerCase();
    const name = `${user.first_name || ''} ${user.last_name || ''}`.toLowerCase();
    const username = (user.username || '').toLowerCase();
    const telegramId = user.telegram_id.toString();
    
    return name.includes(searchLower) || 
           username.includes(searchLower) || 
           telegramId.includes(searchLower);
  });

  const handleUserToggle = (telegramId: number) => {
    const newSelected = new Set(selectedUsers);
    if (newSelected.has(telegramId)) {
      newSelected.delete(telegramId);
    } else {
      newSelected.add(telegramId);
    }
    setSelectedUsers(newSelected);
  };

  const selectAll = () => {
    setSelectedUsers(new Set(filteredUsers.map(user => user.telegram_id)));
  };

  const selectNone = () => {
    setSelectedUsers(new Set());
  };

  const selectZeroDiamonds = () => {
    const zeroDiamondUsers = filteredUsers.filter(user => user.diamond_count === 0);
    setSelectedUsers(new Set(zeroDiamondUsers.map(user => user.telegram_id)));
  };

  const sendUploadReminders = async () => {
    if (selectedUsers.size === 0) {
      toast({
        title: "No Users Selected",
        description: "Please select at least one user to send notifications to.",
        variant: "destructive",
      });
      return;
    }

    setSending(true);
    try {
      const selectedUserData = users
        .filter(user => selectedUsers.has(user.telegram_id))
        .map(user => ({
          telegram_id: user.telegram_id,
          first_name: user.first_name || user.username || 'User'
        }));

      const { data, error } = await supabase.functions.invoke('send-upload-reminder', {
        body: {
          users: selectedUserData,
          includeAdmin: false
        }
      });

      if (error) throw error;

      toast({
        title: "Notifications Sent!",
        description: `Upload reminder notifications sent to ${selectedUsers.size} users.`,
      });

      // Clear selection after successful send
      setSelectedUsers(new Set());

    } catch (error) {
      console.error('Error sending notifications:', error);
      toast({
        title: "Error",
        description: "Failed to send notifications. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  const getUserDisplayName = (user: UserProfile) => {
    if (user.first_name && user.last_name) {
      return `${user.first_name} ${user.last_name}`;
    }
    if (user.first_name) {
      return user.first_name;
    }
    if (user.username) {
      return `@${user.username}`;
    }
    return `User ${user.telegram_id}`;
  };

  const getLastLoginText = (lastLogin?: string) => {
    if (!lastLogin) return 'Never';
    const date = new Date(lastLogin);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Loading Users...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-2">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Select Users for Upload Reminders ({users.length} total)
        </CardTitle>
        <CardDescription>
          Choose specific users to receive upload reminder notifications with certificate scan buttons
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search and Controls */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users by name, username, or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={selectAll}>
              <UserCheck className="h-4 w-4 mr-1" />
              Select All ({filteredUsers.length})
            </Button>
            <Button variant="outline" size="sm" onClick={selectNone}>
              <UserX className="h-4 w-4 mr-1" />
              Select None
            </Button>
            <Button variant="outline" size="sm" onClick={selectZeroDiamonds}>
              Zero Diamonds ({filteredUsers.filter(u => u.diamond_count === 0).length})
            </Button>
          </div>

          {selectedUsers.size > 0 && (
            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
              <p className="text-sm font-medium mb-2">
                Selected: {selectedUsers.size} users
              </p>
              <Button 
                onClick={sendUploadReminders}
                disabled={sending}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                <Send className="h-4 w-4 mr-2" />
                {sending ? 'Sending...' : `Send Upload Reminders to ${selectedUsers.size} Users`}
              </Button>
            </div>
          )}
        </div>

        {/* User List */}
        <div className="max-h-96 overflow-y-auto space-y-2 border rounded-lg p-2">
          {filteredUsers.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No users found matching your search.</p>
            </div>
          ) : (
            filteredUsers.map((user) => (
              <div
                key={user.telegram_id}
                className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                  selectedUsers.has(user.telegram_id) 
                    ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800' 
                    : 'bg-muted/30 hover:bg-muted/50'
                }`}
              >
                <Checkbox
                  checked={selectedUsers.has(user.telegram_id)}
                  onCheckedChange={() => handleUserToggle(user.telegram_id)}
                />
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium truncate">
                      {getUserDisplayName(user)}
                    </span>
                    {user.is_premium && (
                      <Badge variant="secondary" className="text-xs">
                        Premium
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>ID: {user.telegram_id}</span>
                    <span>{user.diamond_count || 0} diamonds</span>
                    <span>Last login: {getLastLoginText(user.last_login)}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {user.diamond_count === 0 && (
                    <Badge variant="outline" className="text-xs text-orange-600">
                      No Diamonds
                    </Badge>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}