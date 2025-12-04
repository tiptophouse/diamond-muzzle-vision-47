import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useBulkUserDiamondCounts } from '@/hooks/admin/useBulkUserDiamondCounts';
import { 
  Users, 
  Diamond, 
  Search, 
  RefreshCw,
  TrendingUp,
  AlertCircle,
  Clock,
  Crown,
  Wifi,
  WifiOff,
  AlertTriangle,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

export function OptimizedUserDiamondCounts() {
  const {
    userCounts,
    stats,
    loading,
    lastUpdated,
    forceRefresh,
    progress,
    cacheInfo
  } = useBulkUserDiamondCounts();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'with_diamonds' | 'zero_diamonds' | 'premium' | 'fastapi_connected' | 'fastapi_no_data'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 50;

  const filteredUsers = useMemo(() => {
    return userCounts.filter(user => {
      const matchesSearch = !searchTerm || 
        user.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.telegram_id.toString().includes(searchTerm);
      
      const matchesFilter = 
        filterStatus === 'all' || 
        (filterStatus === 'with_diamonds' && user.diamond_count > 0) ||
        (filterStatus === 'zero_diamonds' && user.diamond_count === 0) ||
        (filterStatus === 'premium' && user.is_premium) ||
        (filterStatus === 'fastapi_connected' && user.fastapi_status === 'connected') ||
        (filterStatus === 'fastapi_no_data' && user.fastapi_status === 'no_data');
      
      return matchesSearch && matchesFilter;
    });
  }, [userCounts, searchTerm, filterStatus]);

  const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);
  const paginatedUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredUsers.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredUsers, currentPage]);

  const getDiamondBadgeColor = (count: number) => {
    if (count === 0) return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
    if (count < 10) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
    if (count < 50) return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
    return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
  };

  const getFastApiBadge = (status: string) => {
    switch (status) {
      case 'connected':
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"><Wifi className="h-3 w-3 mr-1" />Connected</Badge>;
      case 'no_data':
        return <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"><WifiOff className="h-3 w-3 mr-1" />No Data</Badge>;
      case 'error':
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"><AlertTriangle className="h-3 w-3 mr-1" />Error</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300">Unknown</Badge>;
    }
  };

  const formatLastUpdated = (date: Date | null) => {
    if (!date) return 'Never';
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  if (loading && userCounts.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="flex items-center space-x-2">
              <RefreshCw className="h-6 w-6 animate-spin text-primary" />
              <span className="font-medium">Loading real diamond data from FastAPI...</span>
            </div>
            {progress && (
              <div className="w-full max-w-md space-y-2">
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Fetching user {progress.current} of {progress.total}</span>
                  <span>{progress.percentage}%</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary transition-all duration-300"
                    style={{ width: `${progress.percentage}%` }}
                  />
                </div>
                {progress.currentUser && (
                  <div className="text-xs text-muted-foreground text-center">
                    Processing: {progress.currentUser}
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Enhanced Stats Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-7 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Users className="h-8 w-8 mx-auto mb-2 text-blue-600" />
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <div className="text-sm text-muted-foreground">Total Users</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <Crown className="h-8 w-8 mx-auto mb-2 text-purple-600" />
            <div className="text-2xl font-bold">{stats.premiumUsers}</div>
            <div className="text-sm text-muted-foreground">Premium Users</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <Wifi className="h-8 w-8 mx-auto mb-2 text-green-600" />
            <div className="text-2xl font-bold">{stats.fastapiConnectedUsers}</div>
            <div className="text-sm text-muted-foreground">FastAPI Connected</div>
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
            <div className="text-sm text-muted-foreground">No Diamonds</div>
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

      {/* Optimized User Diamond Counts Table with Virtual Scrolling */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              All Users & Diamond Data ({filteredUsers.length} Showing / {stats.totalUsers} Total)
              {loading && <RefreshCw className="h-4 w-4 animate-spin ml-2" />}
            </CardTitle>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>Last updated: {formatLastUpdated(lastUpdated)}</span>
            </div>
          </div>
          
          {/* Progress bar for refresh */}
          {loading && progress && (
            <div className="mt-2 space-y-1">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Refreshing: {progress.current}/{progress.total} users</span>
                <span>{progress.percentage}%</span>
              </div>
              <div className="h-1 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary transition-all duration-300"
                  style={{ width: `${progress.percentage}%` }}
                />
              </div>
            </div>
          )}
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
            
            <div className="flex gap-2 flex-wrap">
              <Button
                variant={filterStatus === 'all' ? 'default' : 'outline'}
                onClick={() => setFilterStatus('all')}
                size="sm"
              >
                All ({stats.totalUsers})
              </Button>
              <Button
                variant={filterStatus === 'premium' ? 'default' : 'outline'}
                onClick={() => setFilterStatus('premium')}
                size="sm"
              >
                Premium ({stats.premiumUsers})
              </Button>
              <Button
                variant={filterStatus === 'fastapi_connected' ? 'default' : 'outline'}
                onClick={() => setFilterStatus('fastapi_connected')}
                size="sm"
              >
                FastAPI Data ({stats.fastapiConnectedUsers})
              </Button>
              <Button
                variant={filterStatus === 'with_diamonds' ? 'default' : 'outline'}
                onClick={() => setFilterStatus('with_diamonds')}
                size="sm"
              >
                With Diamonds ({stats.usersWithDiamonds})
              </Button>
            </div>
            
            <Button onClick={forceRefresh} variant="outline" size="sm" disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>

          {/* Table Header */}
          <div className="border-b font-medium bg-muted/50 px-4 py-3 grid grid-cols-6 gap-4 text-sm">
            <div>User</div>
            <div>Telegram ID</div>
            <div className="text-center">Premium</div>
            <div className="text-center">FastAPI Status</div>
            <div className="text-center">Diamond Count</div>
            <div>Registered</div>
          </div>

          {/* Paginated User List */}
          <div className="border rounded-b-lg">
            {paginatedUsers.length > 0 ? (
              <>
                {paginatedUsers.map((user, index) => (
                  <div key={user.telegram_id} className="flex items-center border-b px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800">
                    <div className="flex-1 min-w-0 grid grid-cols-6 gap-4 items-center">
                      <div className="truncate">
                        <div className="font-medium">
                          {user.first_name} {user.last_name || ''}
                        </div>
                        {user.username && (
                          <div className="text-sm text-muted-foreground truncate">@{user.username}</div>
                        )}
                      </div>
                      
                      <div className="font-mono text-sm truncate">{user.telegram_id}</div>
                      
                      <div className="text-center">
                        {user.is_premium ? (
                          <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300">
                            <Crown className="h-3 w-3 mr-1" />Premium
                          </Badge>
                        ) : (
                          <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300">Free</Badge>
                        )}
                      </div>
                      
                      <div className="text-center">
                        {getFastApiBadge(user.fastapi_status)}
                      </div>
                      
                      <div className="text-center">
                        <Badge className={getDiamondBadgeColor(user.diamond_count)}>
                          {user.diamond_count} diamonds
                        </Badge>
                      </div>
                      
                      <div className="text-sm text-muted-foreground">
                        {new Date(user.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}
                
                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between px-4 py-3 border-t">
                    <div className="text-sm text-muted-foreground">
                      Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, filteredUsers.length)} of {filteredUsers.length} users
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <span className="text-sm">
                        Page {currentPage} of {totalPages}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No users found matching your criteria.
              </div>
            )}
          </div>
          
          {cacheInfo.isValid && (
            <div className="mt-4 text-xs text-muted-foreground text-center">
              ⚡ Data cached for performance - {cacheInfo.userCount} users cached
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}