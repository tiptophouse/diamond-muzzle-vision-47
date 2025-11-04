import { Button } from '@/components/ui/button';
import { useBilling } from '@/hooks/useBilling';
import { useTelegramAuth } from '@/context/TelegramAuthContext';

export function SubscriptionTestButton() {
  const { checkSubscriptionStatus, loading } = useBilling();
  const { user } = useTelegramAuth();

  const handleTest = async () => {
    if (!user?.id) {
      console.error('❌ No user ID available');
      return;
    }

    console.log('🧪 Testing subscription API for user:', user.id);
    const result = await checkSubscriptionStatus(user.id);
    
    if (result) {
      console.log('✅ API Response:', {
        user_id: result.user_id,
        is_active: result.is_active,
        subscription_type: result.subscription_type,
        expiration_date: result.expiration_date,
        is_renewable: result.is_renewable
      });
    }
  };

  return (
    <Button 
      onClick={handleTest} 
      disabled={loading || !user?.id}
      variant="outline"
      size="sm"
    >
      {loading ? '⏳ Testing...' : '🧪 Test Subscription API'}
    </Button>
  );
}
