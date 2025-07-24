import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { api, apiEndpoints } from '@/lib/api';
import { 
  Users, 
  Diamond, 
  Search, 
  RefreshCw,
  TrendingUp,
  AlertCircle 
} from 'lucide-react';

interface UserDiamondCount {
  telegram_id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  created_at: string;
  diamond_count: number;
  last_upload?: string;
  status: 'active' | 'inactive';
}

export function UserDiamondCounts() {
  const [userCounts, setUserCounts] = useState<UserDiamondCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'with_diamonds' | 'zero_diamonds'>('all');
  const { toast } = useToast();

  const [stats, setStats] = useState({
    totalUsers: 0,
    usersWithDiamonds: 0,
    usersWithZeroDiamonds: 0,
    totalDiamonds: 0,
    avgDiamondsPerUser: 0
  });

  useEffect(() => {
    loadUserDiamondCounts();
  }, []);

  const loadUserDiamondCounts = async () => {
    setLoading(true);
    try {
      console.log('📊 Loading user diamond counts...');

      // Get all users from Supabase
      const { data: users, error: usersError } = await supabase
        .from('user_profiles')
        .select('telegram_id, first_name, last_name, username, created_at, status')
        .order('created_at', { ascending: false });

      if (usersError) {
        throw usersError;
      }

      console.log(`👥 Found ${users?.length || 0} users, fetching diamond counts...`);

      // For each user, get their actual diamond count from FastAPI
      const userDiamondCounts: UserDiamondCount[] = [];
      
      for (const user of users || []) {
        try {
          console.log(`💎 Fetching diamonds for user ${user.telegram_id}...`);
          
          const response = await api.get(apiEndpoints.getAllStones(user.telegram_id));
          
          let diamondCount = 0;
          let lastUpload: string | undefined;
          
          if (response.data && Array.isArray(response.data)) {
            diamondCount = response.data.length;
            
            // Find the most recent diamond upload
            if (response.data.length > 0) {
              const sortedDiamonds = response.data.sort((a, b) => 
                new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
              );
              lastUpload = sortedDiamonds[0]?.created_at;
            }
          }

          userDiamondCounts.push({
            telegram_id: user.telegram_id,
            first_name: user.first_name,
            last_name: user.last_name,
            username: user.username,
            created_at: user.created_at,
            diamond_count: diamondCount,
            last_upload: lastUpload,
            status: (user.status === 'inactive') ? 'inactive' : 'active'
          });

          console.log(`✅ User ${user.telegram_id}: ${diamondCount} diamonds`);
        } catch (error) {
          console.error(`❌ Failed to fetch diamonds for user ${user.telegram_id}:`, error);
          
          // Add user with 0 diamonds if API fails
          userDiamondCounts.push({
            telegram_id: user.telegram_id,
            first_name: user.first_name,
            last_name: user.last_name,
            username: user.username,
            created_at: user.created_at,
            diamond_count: 0,
            status: (user.status === 'inactive') ? 'inactive' : 'active'
          });
        }
      }

      // Sort by diamond count (highest first)
      userDiamondCounts.sort((a, b) => b.diamond_count - a.diamond_count);

      // Calculate statistics
      const totalUsers = userDiamondCounts.length;
      const usersWithDiamonds = userDiamondCounts.filter(u => u.diamond_count > 0).length;
      const usersWithZeroDiamonds = userDiamondCounts.filter(u => u.diamond_count === 0).length;
      const totalDiamonds = userDiamondCounts.reduce((sum, u) => sum + u.diamond_count, 0);
      const avgDiamondsPerUser = totalUsers > 0 ? totalDiamonds / totalUsers : 0;

      setStats({
        totalUsers,
        usersWithDiamonds,
        usersWithZeroDiamonds,
        totalDiamonds,
        avgDiamondsPerUser: Math.round(avgDiamondsPerUser * 10) / 10
      });

      setUserCounts(userDiamondCounts);
      
      console.log('📊 User diamond counts loaded:', {
        totalUsers,
        usersWithDiamonds,
        usersWithZeroDiamonds,
        totalDiamonds
      });

      toast({
        title: "✅ Diamond Counts Loaded",
        description: `Loaded diamond counts for ${totalUsers} users. Found ${totalDiamonds} total diamonds.`,
      });

    } catch (error) {
      console.error('❌ Error loading user diamond counts:', error);
      toast({
        title: "❌ Error",
        description: "Failed to load user diamond counts",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = userCounts.filter(user => {
    const matchesSearch = !searchTerm || 
      user.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.telegram_id.toString().includes(searchTerm);
    
    const matchesFilter = 
      filterStatus === 'all' || 
      (filterStatus === 'with_diamonds' && user.diamond_count > 0) ||
      (filterStatus === 'zero_diamonds' && user.diamond_count === 0);
    
    return matchesSearch && matchesFilter;
  });

  const getDiamondBadgeColor = (count: number) => {
    if (count === 0) return 'bg-red-100 text-red-800';
    if (count < 10) return 'bg-yellow-100 text-yellow-800';
    if (count < 50) return 'bg-blue-100 text-blue-800';
    return 'bg-green-100 text-green-800';
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center space-x-2">
            <RefreshCw className="h-6 w-6 animate-spin" />
            <span>Loading real diamond counts from FastAPI...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistics Overview */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Users className="h-8 w-8 mx-auto mb-2 text-blue-600" />
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <div className="text-sm text-muted-foreground">Total Users</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <TrendingUp className="h-8 w-8 mx-auto mb-2 text-green-600" />
            <div className="text-2xl font-bold">{stats.usersWithDiamonds}</div>
            <div className="text-sm text-muted-foreground">With Diamonds</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <AlertCircle className="h-8 w-8 mx-auto mb-2 text-red-600" />
            <div className="text-2xl font-bold">{stats.usersWithZeroDiamonds}</div>
            <div className="text-sm text-muted-foreground">Zero Diamonds</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <Diamond className="h-8 w-8 mx-auto mb-2 text-purple-600" />
            <div className="text-2xl font-bold">{stats.totalDiamonds}</div>
            <div className="text-sm text-muted-foreground">Total Diamonds</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <TrendingUp className="h-8 w-8 mx-auto mb-2 text-orange-600" />
            <div className="text-2xl font-bold">{stats.avgDiamondsPerUser}</div>
            <div className="text-sm text-muted-foreground">Avg per User</div>
          </CardContent>
        </Card>
      </div>

      {/* User Diamond Counts Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Diamond className="h-5 w-5" />
            Real User Diamond Counts (From FastAPI)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, username, or Telegram ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button
                variant={filterStatus === 'all' ? 'default' : 'outline'}
                onClick={() => setFilterStatus('all')}
                size="sm"
              >
                All ({stats.totalUsers})
              </Button>
              <Button
                variant={filterStatus === 'with_diamonds' ? 'default' : 'outline'}
                onClick={() => setFilterStatus('with_diamonds')}
                size="sm"
              >
                With Diamonds ({stats.usersWithDiamonds})
              </Button>
              <Button
                variant={filterStatus === 'zero_diamonds' ? 'default' : 'outline'}
                onClick={() => setFilterStatus('zero_diamonds')}
                size="sm"
              >
                Zero Diamonds ({stats.usersWithZeroDiamonds})
              </Button>
            </div>
            
            <Button onClick={loadUserDiamondCounts} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>

          {/* User List */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">User</th>
                  <th className="text-left p-2">Telegram ID</th>
                  <th className="text-center p-2">Diamond Count</th>
                  <th className="text-left p-2">Last Upload</th>
                  <th className="text-left p-2">Registered</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.telegram_id.toString()} className="border-b hover:bg-gray-50">
                    <td className="p-2">
                      <div>
                        <div className="font-medium">
                          {user.first_name} {user.last_name || ''}
                        </div>
                        {user.username && (
                          <div className="text-sm text-muted-foreground">@{user.username}</div>
                        )}
                      </div>
                    </td>
                    <td className="p-2 font-mono text-sm">{user.telegram_id.toString()}</td>
                    <td className="p-2 text-center">
                      <Badge className={getDiamondBadgeColor(user.diamond_count)}>
                        {user.diamond_count} diamonds
                      </Badge>
                    </td>
                    <td className="p-2 text-sm">
                      {user.last_upload 
                        ? new Date(user.last_upload).toLocaleDateString()
                        : 'Never'
                      }
                    </td>
                    <td className="p-2 text-sm">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {filteredUsers.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No users found matching your criteria.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
