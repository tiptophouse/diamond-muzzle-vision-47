
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

export async function upsertUserProfile(userData: ExtractedUserData, welcomeMessageAlreadySent: boolean = false): Promise<void> {
  try {
    console.log('🔄 Upserting user profile with real data:', userData);
    
    // First check if user already exists
    const { data: existingUser, error: fetchError } = await supabase
      .from('user_profiles')
      .select('telegram_id, created_at')
      .eq('telegram_id', userData.telegram_id)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('❌ Error checking existing user:', fetchError);
      throw fetchError;
    }

    const isNewUser = !existingUser;
    console.log(`👤 User ${userData.telegram_id} is ${isNewUser ? 'NEW' : 'EXISTING'}`);

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
      throw error;
    } else {
      console.log('✅ User profile upserted successfully');
      
      // Only send welcome message for truly new users and if not already sent
      if (isNewUser && !welcomeMessageAlreadySent) {
        await sendWelcomeMessageToNewUser(userData);
      } else if (!isNewUser) {
        console.log('📝 Existing user - skipping welcome message');
      } else {
        console.log('📝 Welcome message already sent - skipping');
      }
    }
  } catch (err) {
    console.error('❌ Failed to upsert user profile:', err);
    throw err;
  }
}

async function sendWelcomeMessageToNewUser(userData: ExtractedUserData): Promise<void> {
  try {
    console.log('🎉 Sending welcome message to NEW user:', userData.first_name);
    
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
      throw error;
    } else {
      console.log('✅ Welcome message sent successfully to new user');
    }
  } catch (error) {
    console.error('❌ Error sending welcome message:', error);
    throw error;
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
