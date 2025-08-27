
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RefreshCw, Users, Database, ArrowRight, CheckCircle, AlertCircle } from 'lucide-react';
import { useSyncFastAPIUsers } from '@/hooks/useSyncFastAPIUsers';
import { api, apiEndpoints } from '@/lib/api';
import { supabase } from '@/integrations/supabase/client';

export function FastAPIUserSync() {
  const { syncUsers, isLoading, syncStats } = useSyncFastAPIUsers();
  const [quickStats, setQuickStats] = useState<{
    fastApiCount: number;
    supabaseCount: number;
  } | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(false);

  const loadQuickStats = async () => {
    setIsLoadingStats(true);
    try {
      // Get FastAPI user count
      const fastApiResponse = await api.get(apiEndpoints.getAllClients());
      const fastApiUsers = Array.isArray(fastApiResponse.data) ? fastApiResponse.data : [];
      
      // Get Supabase user count
      const { count: supabaseCount } = await supabase
        .from('user_profiles')
        .select('*', { count: 'exact', head: true });

      setQuickStats({
        fastApiCount: fastApiUsers.length,
        supabaseCount: supabaseCount || 0
      });
    } catch (error) {
      console.error('❌ Failed to load quick stats:', error);
    } finally {
      setIsLoadingStats(false);
    }
  };

  useEffect(() => {
    loadQuickStats();
  }, []);

  const handleSync = async () => {
    await syncUsers();
    // Refresh stats after sync
    await loadQuickStats();
  };

  const missingCount = quickStats ? quickStats.fastApiCount - quickStats.supabaseCount : 0;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          FastAPI Users Sync
        </CardTitle>
        <CardDescription>
          Sync users from your FastAPI backend to Supabase user profiles
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {isLoadingStats ? '...' : quickStats?.fastApiCount || 0}
            </div>
            <div className="text-sm text-blue-600 flex items-center justify-center gap-1">
              <Users className="h-4 w-4" />
              FastAPI Users
            </div>
          </div>
          
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {isLoadingStats ? '...' : quickStats?.supabaseCount || 0}
            </div>
            <div className="text-sm text-green-600 flex items-center justify-center gap-1">
              <Database className="h-4 w-4" />
              Supabase Users
            </div>
          </div>
          
          <div className="text-center p-3 bg-orange-50 rounded-lg">
            <div className="text-2xl font-bold text-orange-600">
              {isLoadingStats ? '...' : Math.max(0, missingCount)}
            </div>
            <div className="text-sm text-orange-600 flex items-center justify-center gap-1">
              <ArrowRight className="h-4 w-4" />
              Missing Users
            </div>
          </div>
        </div>

        {/* Sync Button */}
        <div className="flex justify-center">
          <Button 
            onClick={handleSync}
            disabled={isLoading || isLoadingStats || missingCount <= 0}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            {isLoading ? 'Syncing Users...' : `Sync ${missingCount} Missing Users`}
          </Button>
        </div>

        {/* Sync Results */}
        {syncStats && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-semibold mb-2 flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              Sync Results
            </h4>
            <div className="space-y-2 text-sm">
              <div>✅ Successfully synced: <strong>{syncStats.syncedUsers}</strong> users</div>
              <div>📊 FastAPI Users: <strong>{syncStats.fastApiUsers}</strong></div>
              <div>🏪 Supabase Users: <strong>{syncStats.supabaseUsers + syncStats.syncedUsers}</strong></div>
              {syncStats.errors.length > 0 && (
                <div className="text-red-600">
                  <AlertCircle className="h-4 w-4 inline mr-1" />
                  {syncStats.errors.length} errors occurred
                </div>
              )}
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="text-xs text-gray-600 bg-gray-50 p-3 rounded">
          <strong>How it works:</strong>
          <ul className="mt-1 space-y-1 list-disc list-inside">
            <li>Fetches all users from your FastAPI <code>/api/v1/clients</code> endpoint</li>
            <li>Compares with existing Supabase user_profiles</li>
            <li>Creates missing users with premium subscriptions</li>
            <li>First 100 users get $50/month, others get $75/month</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
