
import { useEffect, useRef } from 'react';
import { TelegramUser } from '@/types/telegram';
import { supabase } from '@/integrations/supabase/client';
import { extractTelegramUserData, upsertUserProfile, initializeUserAnalytics } from '@/utils/telegramUserData';

const ADMIN_TELEGRAM_ID = 2138564172;

export function useUserDataPersistence(user: TelegramUser | null, isTelegramEnvironment: boolean) {
  const processedRef = useRef(new Set<number>());

  useEffect(() => {
    if (!user?.id || processedRef.current.has(user.id)) {
      return;
    }

    const persistUserData = async () => {
      try {
        console.log('📝 Processing user data for persistence:', user.id);
        
        // Mark as processed to prevent duplicates
        processedRef.current.add(user.id);

        // Extract user data
        const extractedData = extractTelegramUserData(user);
        
        // Everyone gets active status by default now
        let initialStatus = 'active';
        
        // Check if this is admin user
        if (user.id === ADMIN_TELEGRAM_ID) {
          console.log('👑 Admin user detected - setting active status');
        } else {
          console.log('✅ Regular user - setting active status (no authorization required)');
        }

        // Check if user already exists
        const { data: existingUser } = await supabase
          .from('user_profiles')
          .select('id, status, telegram_id')
          .eq('telegram_id', user.id)
          .single();

        if (existingUser) {
          console.log('✅ User already exists, updating data only');
          // Update existing user data without changing status
          const { error } = await supabase
            .from('user_profiles')
            .update({
              first_name: extractedData.first_name,
              last_name: extractedData.last_name,
              username: extractedData.username,
              photo_url: extractedData.photo_url,
              is_premium: extractedData.is_premium,
              language_code: extractedData.language_code,
              updated_at: new Date().toISOString()
            })
            .eq('telegram_id', user.id);

          if (error) {
            console.error('❌ Error updating user profile:', error);
          }
        } else {
          console.log('🆕 Creating new user with active status');
          // Create new user with active status
          const { error } = await supabase
            .from('user_profiles')
            .insert({
              telegram_id: extractedData.telegram_id,
              first_name: extractedData.first_name,
              last_name: extractedData.last_name,
              username: extractedData.username,
              photo_url: extractedData.photo_url,
              is_premium: extractedData.is_premium,
              language_code: extractedData.language_code,
              status: initialStatus
            });

          if (error) {
            console.error('❌ Error creating user profile:', error);
          } else {
            console.log('✅ User profile created successfully');
            
            // Initialize analytics for new users
            await initializeUserAnalytics(user.id);
          }
        }

      } catch (error) {
        console.error('❌ Error in user data persistence:', error);
        // Don't throw - this is a background operation
      }
    };

    // Add small delay to prevent race conditions
    const timeoutId = setTimeout(persistUserData, 500);
    
    return () => {
      clearTimeout(timeoutId);
    };
  }, [user?.id, isTelegramEnvironment]);

  return null; // This is a side-effect only hook
}
