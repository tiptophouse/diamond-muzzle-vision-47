
import { useState } from 'react';
import { api, apiEndpoints } from '@/lib/api';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

interface FastAPIUser {
  id: number;
  telegram_id: number;
  first_name: string;
  last_name: string;
  phone?: string;
  email?: string;
  status: string;
  last_active?: string;
  created_at: string;
}

interface SyncStats {
  fastApiUsers: number;
  supabaseUsers: number;
  missingUsers: number;
  syncedUsers: number;
  errors: string[];
}

export function useSyncFastAPIUsers() {
  const [isLoading, setIsLoading] = useState(false);
  const [syncStats, setSyncStats] = useState<SyncStats | null>(null);
  const { toast } = useToast();

  const fetchFastAPIUsers = async (): Promise<FastAPIUser[]> => {
    console.log('🔍 Fetching users from FastAPI /api/v1/clients...');
    
    const response = await api.get<FastAPIUser[]>(apiEndpoints.getAllClients());
    
    if (response.error || !response.data) {
      throw new Error(response.error || 'Failed to fetch FastAPI users');
    }

    const users = Array.isArray(response.data) ? response.data : [];
    console.log(`✅ Fetched ${users.length} users from FastAPI`);
    return users;
  };

  const fetchSupabaseUsers = async (): Promise<number[]> => {
    console.log('🔍 Fetching existing Supabase user telegram_ids...');
    
    const { data, error } = await supabase
      .from('user_profiles')
      .select('telegram_id');

    if (error) {
      throw new Error(`Supabase error: ${error.message}`);
    }

    const telegramIds = data?.map(user => user.telegram_id) || [];
    console.log(`✅ Found ${telegramIds.length} existing users in Supabase`);
    return telegramIds;
  };

  const createUserInSupabase = async (user: FastAPIUser, userIndex: number): Promise<boolean> => {
    try {
      // Create user profile
      const { error: profileError } = await supabase
        .from('user_profiles')
        .insert({
          telegram_id: user.telegram_id,
          first_name: user.first_name || 'Unknown',
          last_name: user.last_name || '',
          phone_number: user.phone || null,
          email: user.email || null,
          is_premium: true,
          subscription_plan: 'premium',
          status: 'active',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (profileError) {
        console.error(`❌ Error creating profile for ${user.telegram_id}:`, profileError);
        return false;
      }

      // Create subscription with pricing logic ($50 for first 100, $75 for others)
      const amount = userIndex < 100 ? 50 : 75;
      
      const { error: subscriptionError } = await supabase
        .from('subscriptions')
        .insert({
          telegram_id: user.telegram_id,
          plan_name: 'premium',
          status: 'active',
          amount: amount,
          currency: 'USD',
          billing_cycle: 'monthly',
          start_date: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (subscriptionError) {
        console.warn(`⚠️ Error creating subscription for ${user.telegram_id}:`, subscriptionError);
        // Don't return false here, profile creation succeeded
      }

      console.log(`✅ Created user ${user.telegram_id} with $${amount} subscription`);
      return true;
    } catch (error) {
      console.error(`❌ Failed to create user ${user.telegram_id}:`, error);
      return false;
    }
  };

  const syncUsers = async (): Promise<SyncStats> => {
    setIsLoading(true);
    const errors: string[] = [];
    
    try {
      // Fetch data from both sources
      const [fastApiUsers, existingTelegramIds] = await Promise.all([
        fetchFastAPIUsers(),
        fetchSupabaseUsers()
      ]);

      // Find missing users
      const missingUsers = fastApiUsers.filter(user => 
        !existingTelegramIds.includes(user.telegram_id)
      );

      console.log(`📊 Sync Analysis:
        - FastAPI Users: ${fastApiUsers.length}
        - Supabase Users: ${existingTelegramIds.length}
        - Missing Users: ${missingUsers.length}`);

      if (missingUsers.length === 0) {
        const stats: SyncStats = {
          fastApiUsers: fastApiUsers.length,
          supabaseUsers: existingTelegramIds.length,
          missingUsers: 0,
          syncedUsers: 0,
          errors: []
        };
        
        toast({
          title: "✅ Sync Complete",
          description: "All FastAPI users are already in Supabase",
        });
        
        return stats;
      }

      // Sync missing users
      let syncedCount = 0;
      
      for (let i = 0; i < missingUsers.length; i++) {
        const user = missingUsers[i];
        const success = await createUserInSupabase(user, existingTelegramIds.length + i);
        
        if (success) {
          syncedCount++;
        } else {
          errors.push(`Failed to sync user ${user.telegram_id} (${user.first_name})`);
        }
      }

      const stats: SyncStats = {
        fastApiUsers: fastApiUsers.length,
        supabaseUsers: existingTelegramIds.length,
        missingUsers: missingUsers.length,
        syncedUsers: syncedCount,
        errors
      };

      if (syncedCount > 0) {
        toast({
          title: "✅ Sync Successful",
          description: `Synced ${syncedCount} users from FastAPI to Supabase`,
        });
      }

      if (errors.length > 0) {
        toast({
          title: "⚠️ Partial Sync",
          description: `${errors.length} users failed to sync`,
          variant: "destructive",
        });
      }

      return stats;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      errors.push(errorMessage);
      
      toast({
        title: "❌ Sync Failed",
        description: errorMessage,
        variant: "destructive",
      });

      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const performSync = async () => {
    try {
      const stats = await syncUsers();
      setSyncStats(stats);
    } catch (error) {
      console.error('❌ Sync operation failed:', error);
    }
  };

  return {
    syncUsers: performSync,
    isLoading,
    syncStats,
  };
}
