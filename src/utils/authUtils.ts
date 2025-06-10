
import { 
  isTelegramWebAppEnvironment,
  getTelegramWebApp,
  parseTelegramInitData,
  validateTelegramInitData,
  initializeTelegramWebApp
} from '@/utils/telegramWebApp';
import { verifyTelegramUser } from '@/lib/api/auth';
import { setCurrentUserId } from '@/lib/api/config';
import { TelegramUser } from '@/types/auth';

const ADMIN_TELEGRAM_ID = 2138564172;

export function createAdminUser(): TelegramUser {
  return {
    id: ADMIN_TELEGRAM_ID,
    first_name: "Admin",
    last_name: "User",
    username: "admin",
    language_code: "en"
  };
}

export async function authenticateWithTelegramData(): Promise<TelegramUser | null> {
  console.log('🔐 Starting Telegram initData authentication...');
  
  try {
    // Check if we're in Telegram environment
    const inTelegram = isTelegramWebAppEnvironment();
    console.log('📱 Telegram environment:', inTelegram);
    
    if (!inTelegram) {
      // Development fallback - provide admin access
      console.log('🔧 Non-Telegram environment - providing admin access');
      const adminUser = createAdminUser();
      setCurrentUserId(adminUser.id);
      return adminUser;
    }

    // Initialize Telegram WebApp
    let tg = null;
    try {
      const initialized = await initializeTelegramWebApp();
      if (initialized) {
        tg = getTelegramWebApp();
      }
    } catch (error) {
      console.warn('⚠️ Telegram WebApp initialization failed, falling back to admin:', error);
      // Fallback to admin if initialization fails
      const adminUser = createAdminUser();
      setCurrentUserId(adminUser.id);
      return adminUser;
    }

    if (!tg) {
      console.log('❌ Telegram WebApp not available, providing admin access');
      const adminUser = createAdminUser();
      setCurrentUserId(adminUser.id);
      return adminUser;
    }

    console.log('📱 Telegram WebApp available:', {
      hasInitData: !!tg.initData,
      initDataLength: tg.initData?.length || 0,
      hasInitDataUnsafe: !!tg.initDataUnsafe,
      unsafeUser: tg.initDataUnsafe?.user
    });

    let authenticatedUser: TelegramUser | null = null;

    // Priority 1: Use real initData for backend verification
    if (tg.initData && tg.initData.length > 0) {
      console.log('🔍 Processing real initData for backend verification...');
      
      try {
        // First validate initData client-side
        const isValid = validateTelegramInitData(tg.initData);
        if (isValid) {
          console.log('✅ InitData client-side validation passed');
          
          // Try backend verification
          const verificationResult = await verifyTelegramUser(tg.initData);
          
          if (verificationResult && verificationResult.success) {
            console.log('✅ Backend verification successful');
            authenticatedUser = {
              id: verificationResult.user_id,
              first_name: verificationResult.user_data?.first_name || 'User',
              last_name: verificationResult.user_data?.last_name,
              username: verificationResult.user_data?.username,
              language_code: verificationResult.user_data?.language_code || 'en',
              is_premium: verificationResult.user_data?.is_premium,
              photo_url: verificationResult.user_data?.photo_url
            };
            setCurrentUserId(verificationResult.user_id);
          } else {
            console.warn('⚠️ Backend verification failed, trying client-side parsing');
            
            // Fall back to client-side parsing
            const initDataParsed = parseTelegramInitData(tg.initData);
            if (initDataParsed?.user) {
              console.log('✅ Client-side initData parsing successful');
              authenticatedUser = {
                id: initDataParsed.user.id,
                first_name: initDataParsed.user.first_name,
                last_name: initDataParsed.user.last_name,
                username: initDataParsed.user.username,
                language_code: initDataParsed.user.language_code || 'en',
                is_premium: initDataParsed.user.is_premium,
                photo_url: initDataParsed.user.photo_url
              };
              setCurrentUserId(initDataParsed.user.id);
            }
          }
        } else {
          console.warn('❌ InitData client-side validation failed');
        }
      } catch (error) {
        console.warn('⚠️ InitData processing failed:', error);
      }
    }

    // Priority 2: Use initDataUnsafe if available and no valid initData
    if (!authenticatedUser && tg.initDataUnsafe?.user) {
      const unsafeUser = tg.initDataUnsafe.user;
      console.log('🔍 Using initDataUnsafe as fallback:', unsafeUser);
      
      // Accept any user data from initDataUnsafe, including test data
      if (unsafeUser.id && unsafeUser.first_name) {
        console.log('✅ Using initDataUnsafe user data');
        authenticatedUser = {
          id: unsafeUser.id,
          first_name: unsafeUser.first_name,
          last_name: unsafeUser.last_name,
          username: unsafeUser.username,
          language_code: unsafeUser.language_code || 'en',
          is_premium: unsafeUser.is_premium,
          photo_url: unsafeUser.photo_url
        };
        setCurrentUserId(unsafeUser.id);
      }
    }

    // Priority 3: Final fallback to admin if no user found
    if (!authenticatedUser) {
      console.log('🔧 No valid user data found, providing admin access as fallback');
      const adminUser = createAdminUser();
      setCurrentUserId(adminUser.id);
      authenticatedUser = adminUser;
    }

    console.log('✅ Final authenticated user:', authenticatedUser.first_name, 'ID:', authenticatedUser.id);
    return authenticatedUser;
    
  } catch (error) {
    console.error('❌ Authentication error, falling back to admin:', error);
    // Always fall back to admin if there's any error
    const adminUser = createAdminUser();
    setCurrentUserId(adminUser.id);
    return adminUser;
  }
}
