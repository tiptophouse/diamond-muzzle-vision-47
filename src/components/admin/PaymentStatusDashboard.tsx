import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { RefreshCw, TrendingUp, TrendingDown, DollarSign, Users } from 'lucide-react';

interface PaymentStatusUser {
  telegram_id: number;
  first_name: string;
  last_name?: string;
  is_paying: boolean;
  inventory_count: number;
  notifications_today: number;
  last_active?: string;
}

export function PaymentStatusDashboard() {
  const [users, setUsers] = useState<PaymentStatusUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalPaying: 0,
    payingWithInventory: 0,
    payingNoInventory: 0,
    freeWithInventory: 0,
    freeNoInventory: 0,
  });
  const { toast } = useToast();

  useEffect(() => {
    loadPaymentStatus();
  }, []);

  const loadPaymentStatus = async () => {
    setIsLoading(true);
    try {
      // Fetch payment status from FastAPI
      const paymentResponse = await fetch('https://acadia.diamondmazalbot.workers.dev/api/v1/payment-status');
      const paymentData = await paymentResponse.json();
      const payingUsers = new Set(paymentData.paying_users || []);

      console.log('💰 Paying users:', Array.from(payingUsers));

      // Get all users
      const { data: allUsers, error: usersError } = await supabase
        .from('user_profiles')
        .select('telegram_id, first_name, last_name, last_active')
        .not('telegram_id', 'is', null);

      if (usersError) throw usersError;

      // Get inventory counts for all users
      const usersWithData: PaymentStatusUser[] = [];
      let payingCount = 0;
      let payingWithInv = 0;
      let payingNoInv = 0;
      let freeWithInv = 0;
      let freeNoInv = 0;

      for (const user of allUsers || []) {
        const isPaying = payingUsers.has(user.telegram_id);

        // Get inventory count
        const { count: inventoryCount } = await supabase
          .from('inventory')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.telegram_id)
          .is('deleted_at', null);

        // Get today's notifications
        const today = new Date().toISOString().split('T')[0];
        const { count: notifCount } = await supabase
          .from('notifications')
          .select('*', { count: 'exact', head: true })
          .eq('telegram_id', user.telegram_id)
          .gte('created_at', `${today}T00:00:00.000Z`);

        const userData: PaymentStatusUser = {
          telegram_id: user.telegram_id,
          first_name: user.first_name,
          last_name: user.last_name,
          is_paying: isPaying,
          inventory_count: inventoryCount || 0,
          notifications_today: notifCount || 0,
          last_active: user.last_active,
        };

        usersWithData.push(userData);

        // Update stats
        if (isPaying) {
          payingCount++;
          if (inventoryCount && inventoryCount > 0) {
            payingWithInv++;
          } else {
            payingNoInv++;
          }
        } else {
          if (inventoryCount && inventoryCount > 0) {
            freeWithInv++;
          } else {
            freeNoInv++;
          }
        }
      }

      // Sort by paying status first, then by inventory count
      usersWithData.sort((a, b) => {
        if (a.is_paying !== b.is_paying) return a.is_paying ? -1 : 1;
        return b.inventory_count - a.inventory_count;
      });

      setUsers(usersWithData);
      setStats({
        totalPaying: payingCount,
        payingWithInventory: payingWithInv,
        payingNoInventory: payingNoInv,
        freeWithInventory: freeWithInv,
        freeNoInventory: freeNoInv,
      });

      toast({
        title: 'נתונים נטענו',
        description: `${usersWithData.length} משתמשים נטענו בהצלחה`,
      });
    } catch (error) {
      console.error('Error loading payment status:', error);
      toast({
        title: 'שגיאה',
        description: 'נכשל בטעינת נתוני תשלום',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              סה"כ משלמים
            </CardDescription>
            <CardTitle className="text-3xl font-bold text-green-600">
              {stats.totalPaying}
            </CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              משלמים + מלאי
            </CardDescription>
            <CardTitle className="text-2xl font-bold">
              {stats.payingWithInventory}
            </CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-orange-600" />
              משלמים ללא מלאי
            </CardDescription>
            <CardTitle className="text-2xl font-bold text-orange-600">
              {stats.payingNoInventory}
            </CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-600" />
              חינם + מלאי
            </CardDescription>
            <CardTitle className="text-2xl font-bold">
              {stats.freeWithInventory}
            </CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <Users className="h-4 w-4 text-gray-400" />
              חינם ללא מלאי
            </CardDescription>
            <CardTitle className="text-2xl font-bold text-gray-500">
              {stats.freeNoInventory}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>מצב תשלום משתמשים</CardTitle>
              <CardDescription>
                מעקב אחר משתמשים משלמים ומלאי היהלומים שלהם
              </CardDescription>
            </div>
            <Button
              onClick={loadPaymentStatus}
              disabled={isLoading}
              variant="outline"
              size="sm"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              רענן
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-sm text-gray-500">טוען נתונים...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-right p-2">משתמש</th>
                    <th className="text-center p-2">מצב תשלום</th>
                    <th className="text-center p-2">מלאי</th>
                    <th className="text-center p-2">התראות היום</th>
                    <th className="text-center p-2">פעיל לאחרונה</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.telegram_id} className="border-b hover:bg-gray-50">
                      <td className="p-2">
                        <div>
                          <div className="font-medium">
                            {user.first_name} {user.last_name || ''}
                          </div>
                          <div className="text-xs text-gray-500">
                            ID: {user.telegram_id}
                          </div>
                        </div>
                      </td>
                      <td className="p-2 text-center">
                        <Badge
                          variant={user.is_paying ? 'default' : 'secondary'}
                          className={user.is_paying ? 'bg-green-600' : 'bg-gray-400'}
                        >
                          {user.is_paying ? '💰 משלם' : '🆓 חינם'}
                        </Badge>
                      </td>
                      <td className="p-2 text-center">
                        <Badge
                          variant={user.inventory_count > 0 ? 'default' : 'outline'}
                          className={
                            user.inventory_count > 0
                              ? 'bg-blue-600'
                              : 'text-gray-400 border-gray-300'
                          }
                        >
                          {user.inventory_count} יהלומים
                        </Badge>
                      </td>
                      <td className="p-2 text-center">
                        {user.notifications_today > 0 ? (
                          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-300">
                            🔔 {user.notifications_today}
                          </Badge>
                        ) : (
                          <span className="text-gray-400 text-sm">אין</span>
                        )}
                      </td>
                      <td className="p-2 text-center text-sm text-gray-500">
                        {user.last_active
                          ? new Date(user.last_active).toLocaleDateString('he-IL')
                          : 'לא ידוע'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
