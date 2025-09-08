import { useState, useEffect } from 'react';
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { Diamond, Package, TrendingUp, AlertCircle, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { api } from '@/lib/api/client';

interface DashboardData {
  totalDiamonds: number;
  totalValue: number;
  diamonds: any[];
  loading: boolean;
  error: string | null;
}

export default function SimpleDashboard() {
  const { user, isAuthenticated } = useTelegramAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [data, setData] = useState<DashboardData>({
    totalDiamonds: 0,
    totalValue: 0,
    diamonds: [],
    loading: true,
    error: null
  });

  const fetchDashboardData = async () => {
    if (!user || !isAuthenticated) {
      setData(prev => ({ ...prev, loading: false, error: 'Not authenticated' }));
      return;
    }

    try {
      setData(prev => ({ ...prev, loading: true, error: null }));
      
      console.log('🔍 Simple Dashboard: Fetching data for user:', user.id);
      
      // Use the proper API client with JWT authentication
      const response = await api.get<any[]>(`/api/v1/get_all_stones?user_id=${user.id}`);
      
      if (response.error) {
        throw new Error(response.error);
      }
      
      const diamonds = response.data || [];
      console.log('✅ Simple Dashboard: Received', diamonds.length, 'diamonds');

      if (Array.isArray(diamonds)) {
        const totalValue = diamonds.reduce((sum, diamond) => {
          const price = Number(diamond.price_per_carat || diamond.price || 0);
          const weight = Number(diamond.weight || diamond.carat || 0);
          return sum + (price * weight);
        }, 0);

        setData({
          totalDiamonds: diamonds.length,
          totalValue,
          diamonds: diamonds.slice(0, 5), // Show only first 5 for preview
          loading: false,
          error: null
        });

        toast({
          title: "Dashboard Updated",
          description: `Loaded ${diamonds.length} diamonds from your inventory`,
        });
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('❌ Simple Dashboard: Error fetching data:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to load data';
      
      setData(prev => ({
        ...prev,
        loading: false,
        error: errorMessage
      }));

      // Only show toast for non-authentication errors (auth errors are handled by API client)
      if (!errorMessage.includes('JWT token') && !errorMessage.includes('Authentication')) {
        toast({
          variant: "destructive",
          title: "Failed to load dashboard",
          description: errorMessage,
        });
      }
    }
  };

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchDashboardData();
    }
  }, [isAuthenticated]); // Only run when authentication status changes

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <AlertCircle className="w-12 h-12 text-destructive mx-auto" />
              <h2 className="text-xl font-semibold">Authentication Required</h2>
              <p className="text-muted-foreground">Please log in to view your dashboard</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {user.first_name}</p>
        </div>
        <Button 
          onClick={fetchDashboardData}
          disabled={data.loading}
          variant="outline"
          size="sm"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${data.loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Diamonds</CardTitle>
            <Diamond className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.loading ? '...' : data.totalDiamonds.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <TrendingUp className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.loading ? '...' : `$${data.totalValue.toLocaleString()}`}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inventory</CardTitle>
            <Package className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Active</div>
            <p className="text-xs text-muted-foreground">All systems operational</p>
          </CardContent>
        </Card>
      </div>

      {/* Error State */}
      {data.error && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-destructive" />
              <div>
                <h3 className="font-semibold text-destructive">Error Loading Dashboard</h3>
                <p className="text-sm text-muted-foreground">{data.error}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Diamonds Preview */}
      {!data.loading && !data.error && data.diamonds.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Diamonds</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.diamonds.map((diamond, index) => (
                <div key={diamond.id || index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                      <Diamond className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{diamond.stock || `Diamond ${index + 1}`}</p>
                      <p className="text-sm text-muted-foreground">
                        {diamond.weight || diamond.carat || 0}ct • {diamond.shape || 'Round'} • {diamond.color || 'D'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">${((diamond.price_per_carat || 0) * (diamond.weight || diamond.carat || 0)).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t">
              <Button 
                onClick={() => navigate('/inventory')}
                className="w-full"
                variant="outline"
              >
                View All Diamonds
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {!data.loading && !data.error && data.totalDiamonds === 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <Package className="w-12 h-12 text-muted-foreground mx-auto" />
              <div>
                <h3 className="font-semibold">No Diamonds Found</h3>
                <p className="text-sm text-muted-foreground">Start by uploading your diamond inventory</p>
              </div>
              <Button onClick={() => navigate('/upload')}>
                Upload Diamonds
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Button variant="outline" onClick={() => navigate('/upload')} className="h-20 flex flex-col">
          <Package className="w-6 h-6 mb-2" />
          Upload
        </Button>
        <Button variant="outline" onClick={() => navigate('/inventory')} className="h-20 flex flex-col">
          <Diamond className="w-6 h-6 mb-2" />
          Inventory
        </Button>
        <Button variant="outline" onClick={() => navigate('/store')} className="h-20 flex flex-col">
          <TrendingUp className="w-6 h-6 mb-2" />
          Store
        </Button>
        <Button variant="outline" onClick={() => navigate('/settings')} className="h-20 flex flex-col">
          <RefreshCw className="w-6 h-6 mb-2" />
          Settings
        </Button>
      </div>
    </div>
  );
}