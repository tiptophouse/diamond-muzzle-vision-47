
import { useState } from 'react';
import { useTelegramWebApp } from './useTelegramWebApp';
import { toast } from '@/components/ui/use-toast';
import { API_BASE_URL } from '@/lib/api/config';
import { getBackendAccessToken } from '@/lib/api/secureConfig';

interface RegistrationResult {
  success: boolean;
  token?: string;
  error?: string;
}

export function useGroupCTARegistration() {
  const { webApp } = useTelegramWebApp();
  const [isRegistering, setIsRegistering] = useState(false);

  const registerUserWithFastAPI = async (initData: string): Promise<RegistrationResult> => {
    try {
      console.log('🔐 רושם משתמש ב-FastAPI עם initData');
      
      const backendToken = await getBackendAccessToken();
      if (!backendToken) {
        throw new Error('אין אסימון גישה לשרת');
      }

      const response = await fetch(`${API_BASE_URL}/api/v1/sign-in/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${backendToken}`,
        },
        body: JSON.stringify({
          init_data: initData
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ רישום נכשל:', response.status, errorText);
        throw new Error(`רישום נכשל: ${response.status} ${errorText}`);
      }

      const result = await response.json();
      console.log('✅ רישום הצליח:', result);
      
      return {
        success: true,
        token: result.token
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'שגיאה לא ידועה';
      console.error('❌ שגיאת רישום:', errorMessage);
      
      return {
        success: false,
        error: errorMessage
      };
    }
  };

  const testCTAClickWithRegistration = async () => {
    setIsRegistering(true);
    
    try {
      console.log('🧪 בודק לחיצת CTA עם רישום משתמש');
      
      // Get Telegram initData
      const initData = webApp?.initData;
      if (!initData) {
        toast({
          title: "❌ שגיאה",
          description: "לא ניתן לקבל נתוני Telegram. ודא שאתה באפליקציית Telegram.",
          variant: "destructive",
        });
        return false;
      }

      console.log('📱 נתוני Telegram התקבלו:', initData.substring(0, 50) + '...');

      // Attempt registration
      const registrationResult = await registerUserWithFastAPI(initData);
      
      // Record the test click with registration result
      const { supabase } = await import('@/integrations/supabase/client');
      
      const clickData = {
        telegram_id: webApp?.initDataUnsafe?.user?.id || 0,
        start_parameter: 'test_cta_click',
        user_agent: navigator.userAgent,
        registration_attempted: true,
        registration_success: registrationResult.success,
        registration_token: registrationResult.token || null,
        registration_error: registrationResult.error || null,
        fastapi_response: registrationResult
      };

      console.log('📊 רושם נתוני לחיצה:', clickData);

      const { error: insertError } = await supabase
        .from('group_cta_clicks')
        .insert(clickData);

      if (insertError) {
        console.error('❌ שגיאה ברישום הלחיצה:', insertError);
        toast({
          title: "⚠️ אזהרה",
          description: `הרישום הצליח אבל לא נרשם באנליטיקה: ${insertError.message}`,
          variant: "destructive",
        });
      }

      // Show user feedback
      if (registrationResult.success) {
        toast({
          title: "✅ בדיקה הצליחה!",
          description: `משתמש נרשם בהצלחה ב-FastAPI. אסימון התקבל: ${registrationResult.token?.substring(0, 20)}...`,
          duration: 5000,
        });
      } else {
        toast({
          title: "❌ רישום נכשל",
          description: `בדיקת הלחיצה נרשמה אבל הרישום נכשל: ${registrationResult.error}`,
          variant: "destructive",
          duration: 5000,
        });
      }

      return registrationResult.success;
    } catch (error) {
      console.error('❌ שגיאה כללית בבדיקה:', error);
      toast({
        title: "❌ שגיאה בבדיקה",
        description: "לא ניתן לבצע את בדיקת הרישום. בדוק את החיבור לאינטרנט.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsRegistering(false);
    }
  };

  return {
    testCTAClickWithRegistration,
    isRegistering
  };
}
