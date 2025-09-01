import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Crown, Users, CheckCircle, AlertTriangle, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface ProcessingStats {
  totalUsers: number;
  legacyUsers: number;
  freeUsers: number;
  errors: number;
}

export function LegacyUserManager() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [stats, setStats] = useState<ProcessingStats | null>(null);
  const [currentStep, setCurrentStep] = useState('');
  const { toast } = useToast();

  const processLegacyUsers = async () => {
    setIsProcessing(true);
    setStats(null);
    setCurrentStep('Initializing...');

    try {
      console.log('🚀 Starting legacy user assignment...');

      // Initialize stats
      const processingStats: ProcessingStats = {
        totalUsers: 0,
        legacyUsers: 0,
        freeUsers: 0,
        errors: 0
      };

      setCurrentStep('Getting all users ordered by creation...');
      
      // Get all users ordered by creation date (first 100 = legacy)
      const { data: allUsers, error: usersError } = await supabase
        .from('user_profiles')
        .select('telegram_id, first_name, last_name, created_at, is_premium, subscription_plan')
        .order('created_at', { ascending: true });

      if (usersError) {
        throw usersError;
      }

      if (!allUsers || allUsers.length === 0) {
        throw new Error('No users found in the system');
      }

      processingStats.totalUsers = allUsers.length;
      console.log(`📊 Found ${allUsers.length} total users`);

      // First 100 users = Legacy/Premium
      const first100Users = allUsers.slice(0, 100);
      const restUsers = allUsers.slice(100);

      processingStats.legacyUsers = first100Users.length;
      processingStats.freeUsers = restUsers.length;

      console.log(`👑 First ${first100Users.length} users will be LEGACY/PREMIUM`);
      console.log(`🆓 Remaining ${restUsers.length} users will be FREE`);

      // Update first 100 users to LEGACY/PREMIUM
      if (first100Users.length > 0) {
        setCurrentStep(`Setting first ${first100Users.length} users as LEGACY/PREMIUM...`);
        
        const legacyTelegramIds = first100Users.map(u => u.telegram_id);
        
        const { error: legacyUpdateError } = await supabase
          .from('user_profiles')
          .update({
            is_premium: true,
            subscription_plan: 'legacy',
            updated_at: new Date().toISOString()
          })
          .in('telegram_id', legacyTelegramIds);

        if (legacyUpdateError) {
          console.error('Error updating legacy users:', legacyUpdateError);
          processingStats.errors += first100Users.length;
        } else {
          console.log(`✅ Updated ${first100Users.length} users to LEGACY status`);
        }

        // Update analytics for legacy users
        const legacyAnalytics = legacyTelegramIds.map(telegramId => ({
          telegram_id: telegramId,
          subscription_status: 'legacy',
          updated_at: new Date().toISOString()
        }));

        await supabase
          .from('user_analytics')
          .upsert(legacyAnalytics, { onConflict: 'telegram_id' });
      }

      // Update remaining users to FREE
      if (restUsers.length > 0) {
        setCurrentStep(`Setting remaining ${restUsers.length} users as FREE...`);
        
        const freeTelegramIds = restUsers.map(u => u.telegram_id);
        
        const { error: freeUpdateError } = await supabase
          .from('user_profiles')
          .update({
            is_premium: false,
            subscription_plan: 'free',
            updated_at: new Date().toISOString()
          })
          .in('telegram_id', freeTelegramIds);

        if (freeUpdateError) {
          console.error('Error updating free users:', freeUpdateError);
          processingStats.errors += restUsers.length;
        } else {
          console.log(`✅ Updated ${restUsers.length} users to FREE status`);
        }

        // Update analytics for free users
        const freeAnalytics = freeTelegramIds.map(telegramId => ({
          telegram_id: telegramId,
          subscription_status: 'free',
          updated_at: new Date().toISOString()
        }));

        await supabase
          .from('user_analytics')
          .upsert(freeAnalytics, { onConflict: 'telegram_id' });
      }

      setStats(processingStats);
      setCurrentStep('✅ Processing complete!');

      console.log('🎉 Legacy user assignment completed!', processingStats);

      toast({
        title: "✅ Legacy Assignment Complete!",
        description: `First ${processingStats.legacyUsers} users are now LEGACY, ${processingStats.freeUsers} users are FREE`,
      });

    } catch (error: any) {
      console.error('❌ Error in legacy user assignment:', error);
      setCurrentStep('❌ Error occurred during processing');
      toast({
        title: "❌ Assignment Failed",
        description: error.message || "An error occurred during legacy user assignment",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Crown className="h-5 w-5 text-yellow-500" />
          Legacy User Manager
        </CardTitle>
        <CardDescription>
          Set first 100 users as LEGACY/PREMIUM, rest as FREE
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-4 rounded-lg border border-yellow-200">
          <div className="flex items-center gap-2 mb-3">
            <Crown className="h-5 w-5 text-yellow-600" />
            <span className="font-semibold text-yellow-800">Business Rule:</span>
          </div>
          <ul className="text-sm space-y-1 text-yellow-700">
            <li>👑 <strong>First 100 users:</strong> LEGACY/PREMIUM status</li>
            <li>🆓 <strong>All other users:</strong> FREE status</li>
            <li>📅 Based on account creation order (created_at)</li>
            <li>🔄 Updates user_profiles and user_analytics tables</li>
          </ul>
        </div>

        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-3 rounded-lg text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.totalUsers}</div>
              <div className="text-sm text-blue-700">Total Users</div>
            </div>
            <div className="bg-yellow-50 p-3 rounded-lg text-center">
              <div className="text-2xl font-bold text-yellow-600">{stats.legacyUsers}</div>
              <div className="text-sm text-yellow-700">Legacy Users</div>
            </div>
            <div className="bg-green-50 p-3 rounded-lg text-center">
              <div className="text-2xl font-bold text-green-600">{stats.freeUsers}</div>
              <div className="text-sm text-green-700">Free Users</div>
            </div>
            {stats.errors > 0 && (
              <div className="bg-red-50 p-3 rounded-lg text-center">
                <div className="text-2xl font-bold text-red-600">{stats.errors}</div>
                <div className="text-sm text-red-700">Errors</div>
              </div>
            )}
          </div>
        )}

        {isProcessing && (
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center gap-3">
              <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
              <div>
                <div className="font-medium text-blue-800">Processing users...</div>
                <div className="text-sm text-blue-600">{currentStep}</div>
              </div>
            </div>
          </div>
        )}

        <Button 
          onClick={processLegacyUsers} 
          disabled={isProcessing}
          className="w-full"
          size="lg"
        >
          {isProcessing ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Processing Legacy Assignment...
            </>
          ) : (
            <>
              <Crown className="h-4 w-4 mr-2" />
              Assign Legacy Status (First 100 = Premium)
            </>
          )}
        </Button>

        {stats && (
          <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center gap-2 text-green-800">
              <CheckCircle className="h-5 w-5" />
              <span className="font-semibold">Legacy assignment completed!</span>
            </div>
            <div className="text-sm text-green-700 mt-2">
              <div>👑 <strong>{stats.legacyUsers}</strong> users are now LEGACY/PREMIUM</div>
              <div>🆓 <strong>{stats.freeUsers}</strong> users are now FREE</div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}