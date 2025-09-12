
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useTelegramAuth } from './useTelegramAuth';
import { useTelegramWebApp } from './useTelegramWebApp';
import { toast } from '@/components/ui/use-toast';
import { API_BASE_URL } from '@/lib/api/config';
import { getBackendAccessToken } from '@/lib/api/secureConfig';
import { getButtonClicked, isFastAPIResponse } from '@/types/groupCTA';

export function useGroupCTATracking() {
  const { user } = useTelegramAuth();
  const { webApp } = useTelegramWebApp();
  const [isLoading, setIsLoading] = useState(false);

  const registerUserWithFastAPI = async (initData: string) => {
    try {
      console.log('🔐 רושם משתמש ב-FastAPI');
      
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
        throw new Error(`רישום נכשל: ${response.status} ${errorText}`);
      }

      const result = await response.json();
      return { success: true, token: result.token };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'שגיאה לא ידועה';
      return { success: false, error: errorMessage };
    }
  };

  const trackCTAClick = async (startParameter: string, sourceGroupId?: number, buttonClicked?: string) => {
    if (!user?.id) {
      console.warn('⚠️ לא ניתן לעקוב אחר לחיצה - אין מזהה משתמש');
      return false;
    }
    
    setIsLoading(true);
    try {
      console.log('📊 עוקב אחר לחיצת CTA עם רישום:', { 
        telegram_id: user.id, 
        startParameter, 
        sourceGroupId,
        buttonClicked 
      });

      // Get Telegram initData for registration
      const initData = webApp?.initData;
      let registrationResult = null;
      
      if (initData && startParameter === 'group_activation') {
        console.log('🔐 מנסה לרשום משתמש...');
        registrationResult = await registerUserWithFastAPI(initData);
      }

      const clickData = {
        telegram_id: user.id,
        start_parameter: startParameter,
        source_group_id: sourceGroupId,
        user_agent: navigator.userAgent,
        registration_attempted: !!initData && startParameter === 'group_activation',
        registration_success: registrationResult?.success || false,
        registration_token: registrationResult?.token || null,
        registration_error: registrationResult?.error || null,
        fastapi_response: {
          ...registrationResult,
          button_clicked: buttonClicked,
          utm_source: 'group_cta',
          timestamp: new Date().toISOString()
        }
      };

      const { data, error } = await supabase
        .from('group_cta_clicks')
        .insert(clickData)
        .select();

      if (error) {
        console.error('❌ שגיאה בעקיבת לחיצת CTA:', error);
        toast({
          title: "❌ מעקב נכשל",
          description: `נכשל במעקב אחר לחיצת CTA: ${error.message}`,
          variant: "destructive",
        });
        return false;
      }

      console.log('✅ לחיצת CTA נעקבה בהצלחה:', data);
      
      // Show appropriate message based on registration result
      if (registrationResult?.success) {
        toast({
          title: "✅ רישום הצליח!",
          description: "לחיצת הקבוצה נרשמה והמשתמש נרשם בהצלחה במערכת",
          duration: 3000,
        });
      } else if (registrationResult?.error) {
        toast({
          title: "⚠️ לחיצה נרשמה",
          description: `הלחיצה נרשמה אבל הרישום נכשל: ${registrationResult.error}`,
          variant: "destructive",
          duration: 4000,
        });
      } else {
        toast({
          title: "✅ לחיצה נרשמה",
          description: "אינטראקציית קבוצה נרשמה בהצלחה",
          duration: 2000,
        });
      }
      
      return true;
    } catch (err) {
      console.error('❌ שגיאה בעקיבת לחיצת CTA:', err);
      toast({
        title: "❌ שגיאת מעקב", 
        description: "נכשל ברישום אינטראקציית הקבוצה",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const getCTAAnalytics = async (daysBack = 7) => {
    try {
      const fromDate = new Date();
      fromDate.setDate(fromDate.getDate() - daysBack);

      const { data, error } = await supabase
        .from('group_cta_clicks')
        .select('*')
        .gte('clicked_at', fromDate.toISOString())
        .order('clicked_at', { ascending: false });

      if (error) {
        console.error('❌ שגיאה בקבלת אנליטיקת CTA:', error);
        throw error;
      }

      console.log('📊 אנליטיקת CTA התקבלה:', data);

      // Calculate registration metrics
      const totalClicks = data?.length || 0;
      const registrationAttempts = data?.filter(click => click.registration_attempted).length || 0;
      const successfulRegistrations = data?.filter(click => click.registration_success).length || 0;
      const failedRegistrations = registrationAttempts - successfulRegistrations;
      
      const conversionRate = totalClicks > 0 ? (successfulRegistrations / totalClicks) * 100 : 0;

      // Track button clicks by type - safely handle Json type
      const buttonClicksByType = data?.reduce((acc: any, click) => {
        const buttonType = getButtonClicked(click.fastapi_response);
        acc[buttonType] = (acc[buttonType] || 0) + 1;
        return acc;
      }, {});

      return {
        totalClicks,
        registrationAttempts,
        successfulRegistrations,
        failedRegistrations,
        conversionRate: Math.round(conversionRate * 100) / 100,
        buttonClicksByType,
        clicksByDay: data?.reduce((acc: any, click) => {
          const day = new Date(click.clicked_at).toDateString();
          acc[day] = (acc[day] || 0) + 1;
          return acc;
        }, {}),
        uniqueUsers: [...new Set(data?.map(click => click.telegram_id))].length,
        data: data || []
      };
    } catch (err) {
      console.error('❌ שגיאה בקבלת אנליטיקת CTA:', err);
      return null;
    }
  };

  // Auto-track if user comes from group_activation with enhanced URL parameter tracking
  useEffect(() => {
    if (!user?.id) {
      console.log('🔍 אין מזהה משתמש זמין למעקב אוטומטי');
      return;
    }

    const urlParams = new URLSearchParams(window.location.search);
    const startParam = urlParams.get('start');
    const buttonClicked = urlParams.get('button_clicked');
    const utmSource = urlParams.get('utm_source');
    
    console.log('🔍 בודק פרמטרי URL:', { startParam, buttonClicked, utmSource, url: window.location.href });
    
    if (startParam && utmSource === 'group_cta') {
      console.log('🎯 זוהתה הפעלת קבוצה, עוקב אחר לחיצת CTA...', { startParam, buttonClicked });
      trackCTAClick(startParam, undefined, buttonClicked);
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [user?.id]);

  return {
    trackCTAClick,
    getCTAAnalytics,
    isLoading
  };
}
