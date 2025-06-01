
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
  Crown, 
  Phone,
  Eye,
  UserCheck,
  UserX,
  Download
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
      // TODO: Implement user deletion
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
    a.download = `admin_users_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-8">
          <div className="text-lg">Loading admin panel...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-red-800">👑 Admin User Management</h1>
          <p className="text-red-600 mt-2">Complete control over user accounts and data</p>
        </div>
        <div className="flex gap-3">
          <Button onClick={exportUserData} variant="outline" className="border-red-200">
            <Download className="h-4 w-4 mr-2" />
            Export Data
          </Button>
          <Button onClick={() => setShowAddUser(true)} className="bg-red-600 hover:bg-red-700">
            <UserPlus className="h-4 w-4 mr-2" />
            Add User
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card className="border-red-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-red-700">Total Registered</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-800">{stats.totalUsers}</div>
          </CardContent>
        </Card>

        <Card className="border-green-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-700">Active Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-800">{stats.activeToday}</div>
          </CardContent>
        </Card>

        <Card className="border-yellow-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-yellow-700">Premium Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-800">{stats.premiumUsers}</div>
          </CardContent>
        </Card>

        <Card className="border-blue-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-blue-700">Phone Verified</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-800">{stats.usersWithPhone}</div>
          </CardContent>
        </Card>

        <Card className="border-purple-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-purple-700">Blocked Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-800">{blockedUsers.length}</div>
          </CardContent>
        </Card>

        <Card className="border-orange-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-orange-700">Avg Engagement</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-800">
              {enhancedUsers.length > 0 
                ? Math.round(enhancedUsers.reduce((sum, u) => sum + getUserEngagementScore(u), 0) / enhancedUsers.length)
                : 0}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and User Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                User Management ({filteredUsers.length} users)
              </CardTitle>
              <CardDescription>
                Complete user database with management controls
              </CardDescription>
            </div>
          </div>
          
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, Telegram ID, username, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {filteredUsers.map((user) => {
              const blocked = isUserBlocked(user.telegram_id);
              const engagementScore = getUserEngagementScore(user);
              
              return (
                <div key={user.id} className={`flex items-center justify-between p-4 border rounded-lg ${blocked ? 'bg-red-50 border-red-200' : 'hover:bg-gray-50'}`}>
                  <div className="flex items-center gap-4 flex-1">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={user.photo_url} />
                      <AvatarFallback>
                        {user.first_name.charAt(0)}{user.last_name?.charAt(0) || ''}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-semibold">{user.first_name} {user.last_name}</span>
                        {user.is_premium && <Crown className="h-4 w-4 text-yellow-500" />}
                        {user.phone_number && <Phone className="h-4 w-4 text-green-500" />}
                        {blocked && <Shield className="h-4 w-4 text-red-500" />}
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <Badge variant="outline">ID: {user.telegram_id}</Badge>
                        {user.username && <span>@{user.username}</span>}
                        {user.phone_number && <span>{user.phone_number}</span>}
                        <Badge variant={user.subscription_status === 'premium' ? 'default' : 'secondary'}>
                          {user.subscription_status || 'free'}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <div className="text-sm font-medium">{user.total_visits}</div>
                      <div className="text-xs text-gray-500">Visits</div>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-sm font-medium">{engagementScore}%</div>
                      <div className="text-xs text-gray-500">Engagement</div>
                    </div>

                    <div className="text-right text-xs text-gray-500">
                      <div>Joined {formatDistanceToNow(new Date(user.created_at), { addSuffix: true })}</div>
                      {user.last_active && (
                        <div>Active {formatDistanceToNow(new Date(user.last_active), { addSuffix: true })}</div>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewUser(user)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditUser(user)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant={blocked ? "outline" : "destructive"}
                        size="sm"
                        onClick={() => handleToggleBlock(user)}
                      >
                        {blocked ? <UserCheck className="h-4 w-4" /> : <UserX className="h-4 w-4" />}
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteUser(user)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

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
