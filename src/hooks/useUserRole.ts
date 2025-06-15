
import { useTelegramAuth } from "@/context/TelegramAuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type UserRole = 'PAID_USER' | 'FREE_USER' | 'ADMIN';

interface UserProfile {
  telegram_id: number;
  payment_status: string;
  is_premium: boolean;
  subscription_plan: string;
}

const ADMIN_TELEGRAM_ID = 2138564172;

export function useUserRole() {
  const { user, isAuthenticated } = useTelegramAuth();

  const { data: userProfile, isLoading } = useQuery({
    queryKey: ['userProfile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      const { data, error } = await supabase
        .from('user_profiles')
        .select('telegram_id, payment_status, is_premium, subscription_plan')
        .eq('telegram_id', user.id)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
        return null;
      }

      return data as UserProfile;
    },
    enabled: !!user?.id && isAuthenticated,
  });

  const getUserRole = (): UserRole => {
    if (!user?.id) return 'FREE_USER';
    
    // TEMPORARILY FORCE FREE USER EXPERIENCE FOR TESTING
    // Comment out the admin check to see the free user experience
    // if (user.id === ADMIN_TELEGRAM_ID) return 'PAID_USER';
    
    // Force all users to be FREE_USER for testing the B2C experience
    return 'FREE_USER';
    
    // Original logic (commented out for testing):
    /*
    if (!userProfile) return 'FREE_USER';
    
    // Check if user is paid
    const isPaid = userProfile.payment_status === 'paid' || 
                   userProfile.is_premium === true || 
                   (userProfile.subscription_plan && userProfile.subscription_plan !== 'free');
    
    return isPaid ? 'PAID_USER' : 'FREE_USER';
    */
  };

  return {
    userRole: getUserRole(),
    isLoading,
    userProfile,
    isPaidUser: getUserRole() === 'PAID_USER',
    isFreeUser: getUserRole() === 'FREE_USER',
  };
}
