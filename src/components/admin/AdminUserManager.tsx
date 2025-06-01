
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Users, 
  UserPlus, 
  Search, 
  Edit, 
  Trash2, 
  Shield, 
  Star, 
  Phone,
  Eye,
  UserCheck,
  UserX,
  Download,
  Sparkles
} from 'lucide-react';
import { useEnhancedAnalytics } from '@/hooks/useEnhancedAnalytics';
import { useBlockedUsers } from '@/hooks/useBlockedUsers';
import { formatDistanceToNow } from 'date-fns';
import { UserDetailsModal } from './UserDetailsModal';
import { AddUserModal } from './AddUserModal';
import { EditUserModal } from './EditUserModal';

interface AdminUserManagerProps {}

export function AdminUserManager({}: AdminUserManagerProps) {
  const { enhancedUsers, isLoading, getUserEngagementScore, getUserStats } = useEnhancedAnalytics();
  const { isUserBlocked, blockUser, unblockUser, blockedUsers } = useBlockedUsers();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [showAddUser, setShowAddUser] = useState(false);
  const [showEditUser, setShowEditUser] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);

  const stats = getUserStats();

  const filteredUsers = enhancedUsers.filter(user => {
    const fullName = `${user.first_name} ${user.last_name || ''}`.toLowerCase();
    const searchLower = searchTerm.toLowerCase();
    return (
      fullName.includes(searchLower) ||
      user.telegram_id.toString().includes(searchTerm) ||
      user.username?.toLowerCase().includes(searchLower) ||
      user.phone_number?.includes(searchTerm)
    );
  });

  const handleViewUser = (user: any) => {
    setSelectedUser(user);
    setShowUserDetails(true);
  };

  const handleEditUser = (user: any) => {
    setEditingUser(user);
    setShowEditUser(true);
  };

  const handleDeleteUser = async (user: any) => {
    if (window.confirm(`Are you sure you want to delete ${user.first_name} ${user.last_name}? This action cannot be undone.`)) {
      console.log('Delete user:', user.telegram_id);
    }
  };

  const handleToggleBlock = async (user: any) => {
    const blocked = isUserBlocked(user.telegram_id);
    if (blocked) {
      const blockedUser = blockedUsers.find(bu => bu.telegram_id === user.telegram_id);
      if (blockedUser) {
        await unblockUser(blockedUser.id);
      }
    } else {
      await blockUser(user.telegram_id, 'Blocked by admin');
    }
  };

  const exportUserData = () => {
    const csv = [
      ['ID', 'Telegram ID', 'Name', 'Username', 'Phone', 'Status', 'Premium', 'Created', 'Last Login'].join(','),
      ...filteredUsers.map(user => [
        user.id,
        user.telegram_id,
        `"${user.first_name} ${user.last_name || ''}"`,
        user.username || '',
        user.phone_number || '',
        user.subscription_status || 'free',
        user.is_premium ? 'Yes' : 'No',
        user.created_at,
        user.last_active || 'Never'
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cosmic_users_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-4 sm:p-6">
        <div className="text-center py-12">
          <div className="relative inline-block">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-500/30 border-t-cyan-400 mx-auto mb-6"></div>
            <Sparkles className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-8 w-8 text-purple-400 animate-pulse" />
          </div>
          <div className="text-xl cosmic-text font-bold">Loading cosmic dashboard...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 space-y-6 particle-bg">
      {/* Cosmic Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-3xl sm:text-4xl font-bold cosmic-text flex items-center gap-3">
            🦄 Cosmic User Control
            <Sparkles className="h-8 w-8 text-purple-400 animate-pulse" />
          </h1>
          <p className="text-cyan-300 text-sm sm:text-base">
            Master the unicorn realm with ultimate user management powers
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <Button 
            onClick={exportUserData} 
            variant="outline" 
            className="glass-card border-purple-500/30 text-purple-300 hover:bg-purple-500/20 w-full sm:w-auto"
          >
            <Download className="h-4 w-4 mr-2" />
            Export Data
          </Button>
          <Button onClick={() => setShowAddUser(true)} className="cosmic-button w-full sm:w-auto">
            <UserPlus className="h-4 w-4 mr-2" />
            Add User
          </Button>
        </div>
      </div>

      {/* Cosmic Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        <div className="cosmic-stats">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium text-purple-300">Total Registered</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold cosmic-text">{stats.totalUsers}</div>
          </CardContent>
        </div>

        <div className="cosmic-stats">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium text-green-300">Active Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold text-green-400">{stats.activeToday}</div>
          </CardContent>
        </div>

        <div className="cosmic-stats">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium text-yellow-300">Premium Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold text-yellow-400">{stats.premiumUsers}</div>
          </CardContent>
        </div>

        <div className="cosmic-stats">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium text-blue-300">Phone Verified</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold text-blue-400">{stats.usersWithPhone}</div>
          </CardContent>
        </div>

        <div className="cosmic-stats">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium text-purple-300">Blocked Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold text-purple-400">{blockedUsers.length}</div>
          </CardContent>
        </div>

        <div className="cosmic-stats">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium text-orange-300">Avg Engagement</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold text-orange-400">
              {enhancedUsers.length > 0 
                ? Math.round(enhancedUsers.reduce((sum, u) => sum + getUserEngagementScore(u), 0) / enhancedUsers.length)
                : 0}%
            </div>
          </CardContent>
        </div>
      </div>

      {/* Search and User Management */}
      <div className="glass-card rounded-xl p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold cosmic-text flex items-center gap-2">
              <Users className="h-6 w-6" />
              User Management ({filteredUsers.length} users)
            </h2>
            <p className="text-cyan-300 text-sm mt-1">
              Complete cosmic user database with management controls
            </p>
          </div>
        </div>
        
        <div className="relative mb-6">
          <Search className="absolute left-3 top-3 h-4 w-4 text-purple-400" />
          <Input
            placeholder="Search by name, Telegram ID, username, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="cosmic-input pl-10"
          />
        </div>

        <div className="space-y-3 max-h-96 overflow-y-auto">
          {filteredUsers.map((user) => {
            const blocked = isUserBlocked(user.telegram_id);
            const engagementScore = getUserEngagementScore(user);
            
            return (
              <div 
                key={user.id} 
                className={`glass-card rounded-lg p-3 sm:p-4 transition-all duration-300 hover:neon-glow ${
                  blocked ? 'border-purple-500/50' : ''
                }`}
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <Avatar className="h-10 w-10 sm:h-12 sm:w-12 neon-glow">
                      <AvatarImage src={user.photo_url} />
                      <AvatarFallback className="bg-gradient-to-br from-purple-500 to-cyan-500 text-white">
                        {user.first_name.charAt(0)}{user.last_name?.charAt(0) || ''}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span className="font-semibold text-white text-sm sm:text-base truncate">
                          {user.first_name} {user.last_name}
                        </span>
                        {user.is_premium && <Star className="h-4 w-4 text-yellow-400" />}
                        {user.phone_number && <Phone className="h-4 w-4 text-green-400" />}
                        {blocked && <Shield className="h-4 w-4 text-purple-400" />}
                      </div>
                      
                      <div className="flex items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-300 flex-wrap">
                        <Badge variant="outline" className="border-purple-500/30 text-purple-300">
                          ID: {user.telegram_id}
                        </Badge>
                        {user.username && <span>@{user.username}</span>}
                        {user.phone_number && <span className="hidden sm:inline">{user.phone_number}</span>}
                        <Badge 
                          variant={user.subscription_status === 'premium' ? 'default' : 'secondary'}
                          className="bg-gradient-to-r from-purple-600 to-cyan-600 text-white"
                        >
                          {user.subscription_status || 'free'}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto">
                    <div className="grid grid-cols-2 gap-2 sm:flex sm:gap-4 flex-1 sm:flex-initial">
                      <div className="text-center">
                        <div className="text-sm font-medium text-cyan-400">{user.total_visits}</div>
                        <div className="text-xs text-gray-400">Visits</div>
                      </div>
                      
                      <div className="text-center">
                        <div className="text-sm font-medium text-purple-400">{engagementScore}%</div>
                        <div className="text-xs text-gray-400">Engagement</div>
                      </div>
                    </div>

                    <div className="hidden sm:block text-right text-xs text-gray-400 max-w-[120px]">
                      <div>Joined {formatDistanceToNow(new Date(user.created_at), { addSuffix: true })}</div>
                      {user.last_active && (
                        <div>Active {formatDistanceToNow(new Date(user.last_active), { addSuffix: true })}</div>
                      )}
                    </div>

                    <div className="flex gap-1 sm:gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewUser(user)}
                        className="glass-card border-purple-500/30 text-purple-300 hover:bg-purple-500/20 h-8 w-8 sm:h-9 sm:w-9 p-0"
                      >
                        <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditUser(user)}
                        className="glass-card border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/20 h-8 w-8 sm:h-9 sm:w-9 p-0"
                      >
                        <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
                      </Button>
                      <Button
                        variant={blocked ? "outline" : "destructive"}
                        size="sm"
                        onClick={() => handleToggleBlock(user)}
                        className={`h-8 w-8 sm:h-9 sm:w-9 p-0 ${
                          blocked 
                            ? 'glass-card border-green-500/30 text-green-300 hover:bg-green-500/20' 
                            : 'glass-card border-orange-500/30 text-orange-300 hover:bg-orange-500/20'
                        }`}
                      >
                        {blocked ? <UserCheck className="h-3 w-3 sm:h-4 sm:w-4" /> : <UserX className="h-3 w-3 sm:h-4 sm:w-4" />}
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteUser(user)}
                        className="glass-card border-pink-500/30 text-pink-300 hover:bg-pink-500/20 h-8 w-8 sm:h-9 sm:w-9 p-0"
                      >
                        <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modals */}
      {showUserDetails && selectedUser && (
        <UserDetailsModal
          user={selectedUser}
          isOpen={showUserDetails}
          onClose={() => setShowUserDetails(false)}
        />
      )}

      {showAddUser && (
        <AddUserModal
          isOpen={showAddUser}
          onClose={() => setShowAddUser(false)}
        />
      )}

      {showEditUser && editingUser && (
        <EditUserModal
          user={editingUser}
          isOpen={showEditUser}
          onClose={() => setShowEditUser(false)}
        />
      )}
    </div>
  );
}
