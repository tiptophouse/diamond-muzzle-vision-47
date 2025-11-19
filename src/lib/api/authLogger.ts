import { supabase } from '@/integrations/supabase/client';

interface AuthLogData {
  telegram_id?: number;
  event_type: 'attempt' | 'success' | 'failure' | 'error' | 'token_refresh' | 'init_check' | 'dev_mode';
  event_data?: any;
  init_data_present?: boolean;
  init_data_length?: number;
  has_valid_token?: boolean;
  error_message?: string;
  error_stack?: string;
}

export async function logAuthEvent(data: AuthLogData) {
  try {
    const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : undefined;
    
    await supabase
      .from('auth_debug_logs')
      .insert({
        telegram_id: data.telegram_id,
        event_type: data.event_type,
        event_data: data.event_data,
        init_data_present: data.init_data_present,
        init_data_length: data.init_data_length,
        has_valid_token: data.has_valid_token,
        error_message: data.error_message,
        error_stack: data.error_stack,
        user_agent: userAgent,
        timestamp: new Date().toISOString()
      });
    
    console.log(`📝 AUTH LOG: ${data.event_type}`, data);
  } catch (error) {
    // Silent fail - don't let logging errors break auth flow
    console.warn('⚠️ Failed to log auth event:', error);
  }
}
