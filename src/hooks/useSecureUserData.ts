
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { getCurrentUserId } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { useEffect, useState } from 'react';

interface SecureUserDataState {
  isUserValid: boolean;
  userId: number | null;
  isLoading: boolean;
  error: string | null;
}

export function useSecureUserData() {
  const { user, isAuthenticated } = useTelegramAuth();
  const { toast } = useToast();
  const [state, setState] = useState<SecureUserDataState>({
    isUserValid: false,
    userId: null,
    isLoading: true,
    error: null
  });

  useEffect(() => {
    const validateUser = async () => {
      try {
        if (!isAuthenticated || !user) {
          setState({
            isUserValid: false,
            userId: null,
            isLoading: false,
            error: 'User not authenticated'
          });
          return;
        }

        const currentUserId = getCurrentUserId();
        
        // Ensure user ID matches authenticated user
        if (!currentUserId || currentUserId !== user.id) {
          console.error('🚫 SECURITY: User ID mismatch detected');
          toast({
            variant: "destructive",
            title: "🚫 Security Error",
            description: "Authentication validation failed. Please log in again.",
          });
          
          setState({
            isUserValid: false,
            userId: null,
            isLoading: false,
            error: 'User validation failed'
          });
          return;
        }

        console.log('✅ SECURITY: User validation successful for:', currentUserId);
        setState({
          isUserValid: true,
          userId: currentUserId,
          isLoading: false,
          error: null
        });

      } catch (error) {
        console.error('❌ SECURITY: User validation error:', error);
        setState({
          isUserValid: false,
          userId: null,
          isLoading: false,
          error: error instanceof Error ? error.message : 'Validation failed'
        });
      }
    };

    validateUser();
  }, [isAuthenticated, user, toast]);

  const validateUserAccess = (requiredUserId?: number): boolean => {
    if (!state.isUserValid || !state.userId) {
      toast({
        variant: "destructive",
        title: "🚫 Access Denied",
        description: "You must be logged in to access this data.",
      });
      return false;
    }

    if (requiredUserId && state.userId !== requiredUserId) {
      console.error('🚫 SECURITY: Attempted access to other user data');
      toast({
        variant: "destructive",
        title: "🚫 Access Denied",
        description: "You can only access your own data.",
      });
      return false;
    }

    return true;
  };

  return {
    ...state,
    validateUserAccess
  };
}
