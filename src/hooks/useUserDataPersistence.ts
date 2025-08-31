
import { useEffect, useRef } from 'react';
import { TelegramUser } from '@/types/telegram';
import { setCurrentUserId } from '@/lib/api';

export function useUserDataPersistence(user: TelegramUser | null, isTelegramEnvironment: boolean) {
  const persistenceCompleteRef = useRef(false);
  const welcomeMessageSentRef = useRef(false);

  useEffect(() => {
    if (!user || persistenceCompleteRef.current) return;

    console.log('💾 Starting background user data persistence for user:', user);
    
    // Set current user ID immediately (non-blocking)
    setCurrentUserId(user.id);
    
    // Background database operations (non-blocking)
    const saveUserToDatabase = async () => {
      try {
        const { extractTelegramUserData, upsertUserProfile, initializeUserAnalytics } = await import('@/utils/telegramUserData');
        const extractedData = extractTelegramUserData(user);
        console.log('📊 Extracted user data:', extractedData);
        
        // Pass the welcome message sent ref to prevent duplicates
        await upsertUserProfile(extractedData, welcomeMessageSentRef.current);
        await initializeUserAnalytics(user.id);
        
        welcomeMessageSentRef.current = true;
        persistenceCompleteRef.current = true;
        
        console.log('✅ Background: User data saved successfully for:', extractedData.first_name, extractedData.last_name);
      } catch (error) {
        console.warn('⚠️ Background: Failed to save user data, but continuing...', error);
      }
    };

    // Run database operations in background without blocking UI
    setTimeout(() => {
      saveUserToDatabase();
    }, 500);
  }, [user?.id, isTelegramEnvironment]);
}
