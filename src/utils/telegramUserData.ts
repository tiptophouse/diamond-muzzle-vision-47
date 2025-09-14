import { TelegramUser } from '@/types/telegram';
import { supabase } from '@/integrations/supabase/client';

export interface ExtractedUserData {
  telegram_id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  is_premium?: boolean;
  language_code?: string;
  phone_number?: string;
}

export function extractTelegramUserData(telegramUser: TelegramUser): ExtractedUserData {
  return {
    telegram_id: telegramUser.id,
    first_name: telegramUser.first_name || 'Unknown',
    last_name: telegramUser.last_name || undefined,
    username: telegramUser.username || undefined,
    photo_url: telegramUser.photo_url || undefined,
    is_premium: telegramUser.is_premium || false,
    language_code: telegramUser.language_code || 'en',
    phone_number: telegramUser.phone_number || undefined
  };
}

export async function upsertUserProfile(userData: ExtractedUserData): Promise<void> {
  try {
    console.log('🔄 Upserting user profile with real data:', userData);
    
    const { error } = await supabase
      .from('user_profiles')
      .upsert({
        telegram_id: userData.telegram_id,
        first_name: userData.first_name,
        last_name: userData.last_name,
        username: userData.username,
        phone_number: userData.phone_number,
        photo_url: userData.photo_url,
        is_premium: userData.is_premium,
        language_code: userData.language_code,
        status: 'active',
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'telegram_id'
      });

    if (error) {
      console.error('❌ Error upserting user profile:', error);
    } else {
      console.log('✅ User profile upserted successfully');
      
      // Check if this is a new user and send welcome message
      await sendWelcomeMessageToNewUser(userData);
    }
  } catch (err) {
    console.error('❌ Failed to upsert user profile:', err);
  }
}

async function sendWelcomeMessageToNewUser(userData: ExtractedUserData): Promise<void> {
  try {
    // Check if user was created recently (within last 5 minutes) to determine if they're new
    const fiveMinutesAgo = new Date();
    fiveMinutesAgo.setMinutes(fiveMinutesAgo.getMinutes() - 5);

    const { data: existingUser } = await supabase
      .from('user_profiles')
      .select('created_at')
      .eq('telegram_id', userData.telegram_id)
      .single();

    const isNewUser = existingUser && new Date(existingUser.created_at) > fiveMinutesAgo;

    if (isNewUser) {
      console.log('🎉 New user detected, sending welcome message:', userData.first_name);
      
      // Send welcome message using edge function
      const { error } = await supabase.functions.invoke('send-welcome-message', {
        body: {
          user: {
            telegram_id: userData.telegram_id,
            first_name: userData.first_name,
            language_code: userData.language_code
          },
          isNewUser: true
        }
      });

      if (error) {
        console.error('❌ Failed to send welcome message:', error);
      } else {
        console.log('✅ Welcome message sent successfully');
      }
    }
  } catch (error) {
    console.error('❌ Error checking/sending welcome message:', error);
  }
}

export async function initializeUserAnalytics(telegramId: number): Promise<void> {
  try {
    const { error } = await supabase
      .from('user_analytics')
      .upsert({
        telegram_id: telegramId,
        total_visits: 1,
        last_active: new Date().toISOString(),
        subscription_status: 'free'
      }, {
        onConflict: 'telegram_id'
      });

    if (error) {
      console.error('❌ Error initializing user analytics:', error);
    }
  } catch (err) {
    console.error('❌ Failed to initialize user analytics:', err);
  }
}
