import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { CreditCard, Users, DollarSign, RefreshCw, CheckCircle, XCircle, Clock } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BACKEND_URL } from '@/lib/config';

interface UserPaymentStatus {
  telegram_id: number;
  first_name: string;
  last_name?: string;
  is_active: boolean;
  subscription_type?: string;
  expiration_date?: string;
  is_renewable?: boolean;
}

export function PaymentStatusDashboard() {
  const [loading, setLoading] = useState(false);
  const [payingUsers, setPayingUsers] = useState<UserPaymentStatus[]>([]);
  const [nonPayingUsers, setNonPayingUsers] = useState<UserPaymentStatus[]>([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeSubscriptions: 0,
    expiringSoon: 0,
    revenue: 0
  });

  useEffect(() => {
    fetchPaymentStatuses();
  }, []);

  const fetchPaymentStatuses = async () => {
    setLoading(true);
    try {
      // Get all users
      const { data: users, error: usersError } = await supabase
        .from('user_profiles')
        .select('telegram_id, first_name, last_name')
        .order('first_name');

      if (usersError) throw usersError;

      const paying: UserPaymentStatus[] = [];
      const nonPaying: UserPaymentStatus[] = [];
      let expiringSoonCount = 0;

      // Check subscription status for each user via FastAPI
      for (const user of users || []) {
        try {
          const response = await fetch(`${BACKEND_URL}/api/v1/user/active-subscription`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ user_id: user.telegram_id })
          });

          if (!response.ok) {
            console.error(`Error checking subscription for user ${user.telegram_id}:`, response.statusText);
            nonPaying.push({
              ...user,
              is_active: false,
              subscription_type: 'none'
            });
            continue;
          }

          const subData = await response.json();

          const userStatus: UserPaymentStatus = {
            telegram_id: user.telegram_id,
            first_name: user.first_name,
            last_name: user.last_name,
            is_active: subData?.is_active || false,
            subscription_type: subData?.subscription_type || 'none',
            expiration_date: subData?.expiration_date,
            is_renewable: subData?.is_renewable
          };

          if (subData?.is_active) {
            paying.push(userStatus);
            
            // Check if expiring within 7 days
            if (subData?.expiration_date) {
              const expiryDate = new Date(subData.expiration_date);
              const daysUntilExpiry = Math.floor((expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
              if (daysUntilExpiry <= 7 && daysUntilExpiry >= 0) {
                expiringSoonCount++;
              }
            }
          } else {
            nonPaying.push(userStatus);
          }

          // Small delay to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 100));
        } catch (error) {
          console.error(`Error processing user ${user.telegram_id}:`, error);
          nonPaying.push({
            ...user,
            is_active: false,
            subscription_type: 'error'
          });
        }
      }

      setPayingUsers(paying);
      setNonPayingUsers(nonPaying);
      setStats({
        totalUsers: users?.length || 0,
        activeSubscriptions: paying.length,
        expiringSoon: expiringSoonCount,
        revenue: paying.length * 50 // Estimate: $50 per subscription
      });

      toast.success(`Payment status loaded: ${paying.length} active subscribers`);
    } catch (error) {
      console.error('Error fetching payment statuses:', error);
      toast.error('Failed to load payment statuses');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getDaysUntilExpiry = (dateString?: string) => {
    if (!dateString) return null;
    const expiryDate = new Date(dateString);
    const days = Math.floor((expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return days;
  };

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.activeSubscriptions}</div>
            <p className="text-xs text-muted-foreground">
              {((stats.activeSubscriptions / stats.totalUsers) * 100).toFixed(1)}% conversion
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expiring Soon</CardTitle>
            <Clock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.expiringSoon}</div>
            <p className="text-xs text-muted-foreground">Within 7 days</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Est. Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.revenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Monthly</p>
          </CardContent>
        </Card>
      </div>

      {/* User Lists */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Payment Status Overview
              </CardTitle>
              <CardDescription>
                Real-time subscription status from FastAPI
              </CardDescription>
            </div>
            <Button 
              onClick={fetchPaymentStatuses} 
              disabled={loading}
              size="sm"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="paying" className="space-y-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="paying" className="gap-2">
                <CheckCircle className="h-4 w-4" />
                Paying ({payingUsers.length})
              </TabsTrigger>
              <TabsTrigger value="non-paying" className="gap-2">
                <XCircle className="h-4 w-4" />
                Not Paying ({nonPayingUsers.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="paying" className="space-y-2">
              {loading ? (
                <div className="text-center py-8">
                  <RefreshCw className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
                  <p className="text-sm text-muted-foreground mt-2">Loading payment statuses...</p>
                </div>
              ) : payingUsers.length === 0 ? (
                <div className="text-center py-8">
                  <XCircle className="h-8 w-8 mx-auto text-muted-foreground" />
                  <p className="text-sm text-muted-foreground mt-2">No active subscriptions found</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {payingUsers.map((user) => {
                    const daysLeft = getDaysUntilExpiry(user.expiration_date);
                    const isExpiringSoon = daysLeft !== null && daysLeft <= 7 && daysLeft >= 0;
                    
                    return (
                      <div 
                        key={user.telegram_id}
                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                            <CheckCircle className="h-5 w-5 text-green-600" />
                          </div>
                          <div>
                            <p className="font-medium">
                              {user.first_name} {user.last_name || ''}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              ID: {user.telegram_id}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Badge variant={isExpiringSoon ? 'destructive' : 'default'}>
                            {user.subscription_type}
                          </Badge>
                          {user.expiration_date && (
                            <div className="text-right">
                              <p className="text-xs font-medium">
                                {formatDate(user.expiration_date)}
                              </p>
                              {daysLeft !== null && (
                                <p className={`text-xs ${isExpiringSoon ? 'text-orange-600 font-medium' : 'text-muted-foreground'}`}>
                                  {daysLeft > 0 ? `${daysLeft} days left` : 'Expired'}
                                </p>
                              )}
                            </div>
                          )}
                          {user.is_renewable && (
                            <Badge variant="outline" className="text-xs">
                              Auto-renew
                            </Badge>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </TabsContent>

            <TabsContent value="non-paying" className="space-y-2">
              {loading ? (
                <div className="text-center py-8">
                  <RefreshCw className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
                  <p className="text-sm text-muted-foreground mt-2">Loading users...</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {nonPayingUsers.map((user) => (
                    <div 
                      key={user.telegram_id}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                          <XCircle className="h-5 w-5 text-gray-600" />
                        </div>
                        <div>
                          <p className="font-medium">
                            {user.first_name} {user.last_name || ''}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            ID: {user.telegram_id}
                          </p>
                        </div>
                      </div>
                      
                      <Badge variant="secondary">
                        {user.subscription_type || 'Free'}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
