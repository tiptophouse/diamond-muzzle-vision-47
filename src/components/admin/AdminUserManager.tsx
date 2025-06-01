
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
  Sparkles, 
  Star, 
  Phone,
  Eye,
  UserCheck,
  UserX,
  Download,
  Zap
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
    a.download = `unicorn_users_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 cosmic-bg min-h-screen">
        <div className="text-center py-8">
          <div className="cosmic-gradient w-16 h-16 rounded-full mx-auto mb-4 animate-spin neon-glow"></div>
          <div className="text-xl text-purple-200 cosmic-text">Loading unicorn dashboard...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6 cosmic-bg min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold cosmic-text mb-2 floating-animation">
            🦄 Unicorn User Management
          </h1>
          <p className="text-purple-200 text-lg">Complete cosmic control over user realms and data</p>
        </div>
        <div className="flex gap-3">
          <Button 
            onClick={exportUserData} 
            variant="outline" 
            className="glass-card cosmic-border hover:neon-glow text-purple-200 border-purple-400"
          >
            <Download className="h-4 w-4 mr-2" />
            Export Data
          </Button>
          <Button 
            onClick={() => setShowAddUser(true)} 
            className="cosmic-gradient hover:neon-glow text-white font-bold"
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Add Unicorn
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card className="glass-card cosmic-border neon-glow floating-animation">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-purple-300 flex items-center gap-2">
              <Users className="h-4 w-4" />
              Total Registered
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold cosmic-text">{stats.totalUsers}</div>
          </CardContent>
        </Card>

        <Card className="glass-card cosmic-border neon-glow floating-animation" style={{ animationDelay: '0.1s' }}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-300 flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Active Today
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-400">{stats.activeToday}</div>
          </CardContent>
        </Card>

        <Card className="glass-card cosmic-border neon-glow floating-animation" style={{ animationDelay: '0.2s' }}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-yellow-300 flex items-center gap-2">
              <Star className="h-4 w-4 sparkle" />
              Premium Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-400">{stats.premiumUsers}</div>
          </CardContent>
        </Card>

        <Card className="glass-card cosmic-border neon-glow floating-animation" style={{ animationDelay: '0.3s' }}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-blue-300 flex items-center gap-2">
              <Phone className="h-4 w-4" />
              Phone Verified
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-400">{stats.usersWithPhone}</div>
          </CardContent>
        </Card>

        <Card className="glass-card cosmic-border neon-glow floating-animation" style={{ animationDelay: '0.4s' }}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-purple-300 flex items-center gap-2">
              <UserX className="h-4 w-4" />
              Blocked Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-400">{blockedUsers.length}</div>
          </CardContent>
        </Card>

        <Card className="glass-card cosmic-border neon-glow floating-animation" style={{ animationDelay: '0.5s' }}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-cyan-300 flex items-center gap-2">
              <Sparkles className="h-4 w-4 sparkle" />
              Avg Engagement
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-cyan-400">
              {enhancedUsers.length > 0 
                ? Math.round(enhancedUsers.reduce((sum, u) => sum + getUserEngagementScore(u), 0) / enhancedUsers.length)
                : 0}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and User Table */}
      <Card className="glass-card cosmic-border neon-glow">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 cosmic-text text-2xl">
                <Users className="h-6 w-6" />
                Unicorn Management ({filteredUsers.length} beings)
              </CardTitle>
              <CardDescription className="text-purple-200">
                Complete cosmic database with management controls
              </CardDescription>
            </div>
          </div>
          
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-purple-400" />
            <Input
              placeholder="Search by name, Telegram ID, username, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 glass-card cosmic-border text-purple-100 placeholder-purple-300"
            />
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {filteredUsers.map((user, index) => {
              const blocked = isUserBlocked(user.telegram_id);
              const engagementScore = getUserEngagementScore(user);
              
              return (
                <div 
                  key={user.id} 
                  className={`flex items-center justify-between p-4 glass-card cosmic-border rounded-lg hover:neon-glow transition-all duration-300 floating-animation ${blocked ? 'border-red-400/50' : ''}`}
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className="flex items-center gap-4 flex-1">
                    <Avatar className="h-12 w-12 cosmic-border">
                      <AvatarImage src={user.photo_url} />
                      <AvatarFallback className="cosmic-gradient text-white font-bold">
                        {user.first_name.charAt(0)}{user.last_name?.charAt(0) || ''}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-semibold text-purple-100">{user.first_name} {user.last_name}</span>
                        {user.is_premium && <Star className="h-4 w-4 text-yellow-400 sparkle" />}
                        {user.phone_number && <Phone className="h-4 w-4 text-green-400" />}
                        {blocked && <UserX className="h-4 w-4 text-red-400" />}
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-purple-300">
                        <Badge variant="outline" className="cosmic-border text-purple-200">ID: {user.telegram_id}</Badge>
                        {user.username && <span>@{user.username}</span>}
                        {user.phone_number && <span>{user.phone_number}</span>}
                        <Badge className={user.subscription_status === 'premium' ? 'cosmic-gradient' : 'glass-card'}>
                          {user.subscription_status || 'free'}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <div className="text-sm font-medium text-purple-200">{user.total_visits}</div>
                      <div className="text-xs text-purple-400">Visits</div>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-sm font-medium text-cyan-300">{engagementScore}%</div>
                      <div className="text-xs text-purple-400">Engagement</div>
                    </div>

                    <div className="text-right text-xs text-purple-300">
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
                        className="glass-card cosmic-border hover:neon-glow text-purple-200"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditUser(user)}
                        className="glass-card cosmic-border hover:neon-glow text-purple-200"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant={blocked ? "outline" : "destructive"}
                        size="sm"
                        onClick={() => handleToggleBlock(user)}
                        className={blocked ? "glass-card cosmic-border text-green-400" : "bg-red-500/20 border-red-400 text-red-300 hover:bg-red-500/30"}
                      >
                        {blocked ? <UserCheck className="h-4 w-4" /> : <UserX className="h-4 w-4" />}
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteUser(user)}
                        className="bg-red-500/20 border-red-400 text-red-300 hover:bg-red-500/30"
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
