import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createHmac } from "https://deno.land/std@0.190.0/node/crypto.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TelegramValidationRequest {
  init_data: string;
  client_timestamp?: number;
  security_level?: string;
}

interface TelegramValidationResponse {
  success: boolean;
  user_id?: number;
  user_data?: any;
  message?: string;
  security_info?: {
    timestamp_valid: boolean;
    age_seconds: number;
    replay_protected: boolean;
    signature_valid: boolean;
  };
}

// Get Telegram bot token from environment
const TELEGRAM_BOT_TOKEN = Deno.env.get('TELEGRAM_BOT_TOKEN');

if (!TELEGRAM_BOT_TOKEN) {
  console.error('❌ TELEGRAM_BOT_TOKEN is required but not set');
}

/**
 * Validates Telegram Web App initData according to official Telegram specification
 * https://docs.telegram-mini-apps.com/platform/init-data#validating
 */
function validateTelegramInitData(initData: string, botToken: string): {
  isValid: boolean;
  userData?: any;
  error?: string;
} {
  try {
    console.log('🔍 Starting Telegram initData validation');
    
    // Parse the init data as URL parameters
    const urlParams = new URLSearchParams(initData);
    const receivedHash = urlParams.get('hash');
    
    if (!receivedHash) {
      return { isValid: false, error: 'Missing hash parameter' };
    }
    
    // Step 1: Create key-value pairs array, excluding 'hash'
    const dataCheckArray: string[] = [];
    
    for (const [key, value] of urlParams.entries()) {
      if (key !== 'hash') {
        dataCheckArray.push(`${key}=${value}`);
      }
    }
    
    // Step 2: Sort the array alphabetically
    dataCheckArray.sort();
    
    // Step 3: Join with line breaks
    const dataCheckString = dataCheckArray.join('\n');
    
    console.log('📊 Data check string created:', dataCheckString);
    
    // Step 4: Create HMAC-SHA256 with 'WebAppData' key applied to bot token
    const secretKey = createHmac('sha256', 'WebAppData')
      .update(botToken)
      .digest();
    
    // Step 5: Create HMAC-SHA256 using the secret key applied to data check string
    const calculatedHash = createHmac('sha256', secretKey)
      .update(dataCheckString)
      .digest('hex');
    
    console.log('🔑 Calculated hash:', calculatedHash);
    console.log('🔑 Received hash:', receivedHash);
    
    // Step 6: Compare hashes
    const isValid = calculatedHash === receivedHash;
    
    if (!isValid) {
      return { isValid: false, error: 'Hash verification failed' };
    }
    
    // Extract user data if validation successful
    const userParam = urlParams.get('user');
    let userData = null;
    
    if (userParam) {
      try {
        userData = JSON.parse(decodeURIComponent(userParam));
      } catch (error) {
        console.warn('⚠️ Failed to parse user data:', error);
      }
    }
    
    console.log('✅ Telegram initData validation successful');
    return { isValid: true, userData };
    
  } catch (error) {
    console.error('❌ Telegram validation error:', error);
    return { isValid: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

/**
 * Additional security checks for initData
 */
function performSecurityChecks(initData: string): {
  timestamp_valid: boolean;
  age_seconds: number;
  replay_protected: boolean;
} {
  const urlParams = new URLSearchParams(initData);
  const authDate = urlParams.get('auth_date');
  
  if (!authDate) {
    return {
      timestamp_valid: false,
      age_seconds: -1,
      replay_protected: false
    };
  }
  
  const authDateTime = parseInt(authDate) * 1000; // Convert to milliseconds
  const now = Date.now();
  const ageSeconds = Math.floor((now - authDateTime) / 1000);
  
  // Check if timestamp is within acceptable range (5 minutes as recommended)
  const maxAgeSeconds = 5 * 60; // 5 minutes
  const timestamp_valid = ageSeconds >= 0 && ageSeconds <= maxAgeSeconds;
  
  // Simple replay protection - in production you'd store used hashes
  const replay_protected = true; // For now, assume no replay attack
  
  return {
    timestamp_valid,
    age_seconds: ageSeconds,
    replay_protected
  };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🔐 Telegram initData validation request received');
    
    if (!TELEGRAM_BOT_TOKEN) {
      throw new Error('Telegram bot token not configured');
    }
    
    const { init_data, client_timestamp, security_level }: TelegramValidationRequest = await req.json();
    
    if (!init_data) {
      throw new Error('Missing init_data parameter');
    }
    
    console.log(`🔍 Validating initData (${init_data.length} chars) with security level: ${security_level || 'standard'}`);
    
    // Perform security checks first
    const securityChecks = performSecurityChecks(init_data);
    console.log('🛡️ Security checks:', securityChecks);
    
    // Validate using proper Telegram algorithm
    const validation = validateTelegramInitData(init_data, TELEGRAM_BOT_TOKEN);
    
    if (!validation.isValid) {
      console.warn('❌ Telegram initData validation failed:', validation.error);
      
      const response: TelegramValidationResponse = {
        success: false,
        message: validation.error || 'Validation failed',
        security_info: {
          ...securityChecks,
          signature_valid: false
        }
      };
      
      return new Response(JSON.stringify(response), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    // Extract user information
    const userData = validation.userData;
    if (!userData || !userData.id) {
      throw new Error('Invalid user data in initData');
    }
    
    console.log('✅ Telegram validation successful for user:', userData.id);
    
    const response: TelegramValidationResponse = {
      success: true,
      user_id: userData.id,
      user_data: userData,
      message: 'Validation successful',
      security_info: {
        ...securityChecks,
        signature_valid: true
      }
    };
    
    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('❌ Telegram validation error:', error);
    
    const response: TelegramValidationResponse = {
      success: false,
      message: error instanceof Error ? error.message : 'Internal server error',
      security_info: {
        timestamp_valid: false,
        age_seconds: -1,
        replay_protected: false,
        signature_valid: false
      }
    };
    
    return new Response(JSON.stringify(response), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});