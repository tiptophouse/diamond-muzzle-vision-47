
import { useEffect, useRef } from 'react';
import { TelegramUser } from '@/types/telegram';
import { setCurrentUserId } from '@/lib/api';

export function useUserDataPersistence(user: TelegramUser | null, isTelegramEnvironment: boolean) {
  const persistenceCompleteRef = useRef(false);

  useEffect(() => {
    if (!user || persistenceCompleteRef.current) return;

    console.log('💾 Starting background user data persistence...');
    
    // Set current user ID immediately (non-blocking)
    setCurrentUserId(user.id);
    
    // Background database operations (non-blocking)
    const saveUserToDatabase = async () => {
      try {
        const { extractTelegramUserData, upsertUserProfile, initializeUserAnalytics } = await import('@/utils/telegramUserData');
        const extractedData = extractTelegramUserData(user);
        await upsertUserProfile(extractedData);
        await initializeUserAnalytics(user.id);
        console.log('✅ Background: User data saved successfully');
      } catch (error) {
        console.warn('⚠️ Background: Failed to save user data, but continuing...', error);
      }
    };

    // Run database operations in background without blocking UI
    setTimeout(() => {
      saveUserToDatabase();
    }, 500);

    persistenceCompleteRef.current = true;
  }, [user, isTelegramEnvironment]);
}
