
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Crown, Users, CheckCircle, RefreshCw, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface PremiumStats {
  totalUsers: number;
  premiumUsers: number;
  freeUsers: number;
  correctAssignment: boolean;
}

export function PremiumUserStatus() {
  const [stats, setStats] = useState<PremiumStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { toast } = useToast();

  const fetchPremiumStats = async () => {
    try {
      console.log('📊 Fetching premium user statistics...');

      // Get total counts
      const { count: totalUsers } = await supabase
        .from('user_profiles')
        .select('*', { count: 'exact', head: true });

      const { count: premiumUsers } = await supabase
        .from('user_profiles')
        .select('*', { count: 'exact', head: true })
        .eq('is_premium', true);

      // Verify first 100 users are premium
      const { data: first100Users } = await supabase
        .from('user_profiles')
        .select('telegram_id, is_premium, subscription_plan, created_at')
        .order('created_at', { ascending: true })
        .limit(100);

      const correctFirst100 = first100Users?.every(user => 
        user.is_premium === true && user.subscription_plan === 'premium'
      ) || false;

      // Verify users 101+ are free
      const { data: remainingUsers } = await supabase
        .from('user_profiles')
        .select('telegram_id, is_premium, subscription_plan, created_at')
        .order('created_at', { ascending: true })
        .range(100, (totalUsers || 0) - 1);

      const correctRemaining = remainingUsers?.every(user => 
        user.is_premium === false && user.subscription_plan === 'free'
      ) || false;

      const correctAssignment = correctFirst100 && correctRemaining && premiumUsers === 100;

      setStats({
        totalUsers: totalUsers || 0,
        premiumUsers: premiumUsers || 0,
        freeUsers: (totalUsers || 0) - (premiumUsers || 0),
        correctAssignment
      });

      console.log('📊 Premium Stats:', {
        totalUsers,
        premiumUsers,
        correctAssignment
      });

    } catch (error) {
      console.error('❌ Error fetching premium stats:', error);
      toast({
        title: "Error",
        description: "Failed to load premium statistics",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchPremiumStats();
  };

  useEffect(() => {
    fetchPremiumStats();
  }, []);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="ml-2">Loading premium statistics...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-yellow-500" />
              Premium User Status
            </CardTitle>
            <CardDescription>
              Current premium user assignment status
            </CardDescription>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {stats && (
          <>
            {/* Status Badge */}
            <div className="flex items-center justify-center">
              <Badge 
                variant={stats.correctAssignment ? "default" : "destructive"}
                className="px-4 py-2 text-sm"
              >
                {stats.correctAssignment ? (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Correct Assignment ✓
                  </>
                ) : (
                  <>
                    ❌ Incorrect Assignment
                  </>
                )}
              </Badge>
            </div>

            {/* Statistics Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-blue-600">{stats.totalUsers}</div>
                <div className="text-sm text-blue-700">Total Users</div>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-yellow-600">{stats.premiumUsers}</div>
                <div className="text-sm text-yellow-700">Premium Users</div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-green-600">{stats.freeUsers}</div>
                <div className="text-sm text-green-700">Free Users</div>
              </div>
            </div>

            {/* Assignment Rules */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Users className="h-5 w-5" />
                Assignment Rules
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span>👑 First 100 users (by registration date)</span>
                  <Badge variant={stats.premiumUsers === 100 ? "default" : "destructive"}>
                    {stats.premiumUsers === 100 ? 'Premium ✓' : `${stats.premiumUsers} Premium ❌`}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>🆓 Users 101+</span>
                  <Badge variant={stats.freeUsers === (stats.totalUsers - 100) ? "default" : "destructive"}>
                    {stats.freeUsers === (stats.totalUsers - 100) ? 'Free ✓' : `${stats.freeUsers} Free ❌`}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Success Message */}
            {stats.correctAssignment && (
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <div className="flex items-center gap-2 text-green-800">
                  <CheckCircle className="h-5 w-5" />
                  <span className="font-semibold">✅ Premium assignments are correct!</span>
                </div>
                <div className="text-sm text-green-700 mt-2">
                  <div>• First 100 users (by registration date) have premium status</div>
                  <div>• All other users have free status</div>
                  <div>• Both `is_premium` and `subscription_plan` fields are properly set</div>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
