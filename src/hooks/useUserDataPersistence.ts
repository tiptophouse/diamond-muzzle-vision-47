
import { useEffect, useRef } from 'react';
import { TelegramUser } from '@/types/telegram';
import { setCurrentUserId } from '@/lib/api';

import { logger } from '@/utils/logger';

export function useUserDataPersistence(user: TelegramUser | null, isTelegramEnvironment: boolean) {
  const persistenceCompleteRef = useRef(false);
  const welcomeMessageSentRef = useRef(false);

  useEffect(() => {
    if (!user || persistenceCompleteRef.current) return;

    logger.debug('Starting background user data persistence for user', { userId: user.id });
    
    // Set current user ID immediately (non-blocking)
    setCurrentUserId(user.id);
    
    // Background database operations (non-blocking)
    const saveUserToDatabase = async () => {
      try {
        const { extractTelegramUserData, upsertUserProfile, initializeUserAnalytics } = await import('@/utils/telegramUserData');
        const extractedData = extractTelegramUserData(user);
        
        // Pass the welcome message sent ref to prevent duplicates
        await upsertUserProfile(extractedData, welcomeMessageSentRef.current);
        await initializeUserAnalytics(user.id);
        
        welcomeMessageSentRef.current = true;
        persistenceCompleteRef.current = true;
        
        logger.info('Background user data saved successfully', { 
          userId: user.id, 
          firstName: extractedData.first_name, 
          lastName: extractedData.last_name 
        });
      } catch (error) {
        logger.warn('Failed to save user data, but continuing', { userId: user.id, error });
      }
    };

    // Run database operations in background without blocking UI
    setTimeout(() => {
      saveUserToDatabase();
    }, 500);
  }, [user?.id, isTelegramEnvironment]);
}
