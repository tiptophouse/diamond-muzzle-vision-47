
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useTelegramAuth } from '@/context/TelegramAuthContext';

interface VisitorData {
  telegram_id?: number;
  user_agent: string;
  visit_timestamp: string;
  page_path: string;
  referrer?: string;
  is_authenticated: boolean;
}

export function useVisitorTracking() {
  const { user, isAuthenticated } = useTelegramAuth();
  const [visitorId, setVisitorId] = useState<string | null>(null);

  const trackVisitor = async (pagePath: string) => {
    try {
      const visitorData: VisitorData = {
        telegram_id: user?.id,
        user_agent: navigator.userAgent,
        visit_timestamp: new Date().toISOString(),
        page_path: pagePath,
        referrer: document.referrer || undefined,
        is_authenticated: isAuthenticated
      };

      // Track page visit
      const { data, error } = await supabase
        .from('page_visits')
        .insert({
          page_path: pagePath,
          page_title: document.title,
          visit_timestamp: visitorData.visit_timestamp,
          referrer: visitorData.referrer
        })
        .select()
        .single();

      if (error) {
        console.error('Error tracking visitor:', error);
        return;
      }

      setVisitorId(data.id);

      // If user is authenticated via Telegram, ensure they're in user_profiles
      if (user && isAuthenticated) {
        await ensureUserProfile(user);
      }

      console.log('✅ Visitor tracked successfully');
    } catch (error) {
      console.error('❌ Error in visitor tracking:', error);
    }
  };

  const ensureUserProfile = async (telegramUser: any) => {
    try {
      // Check if user already exists
      const { data: existingUser } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('telegram_id', telegramUser.id)
        .single();

      if (!existingUser) {
        // Create new user profile
        const { error: insertError } = await supabase
          .from('user_profiles')
          .insert({
            telegram_id: telegramUser.id,
            first_name: telegramUser.first_name || 'Telegram User',
            last_name: telegramUser.last_name,
            username: telegramUser.username,
            language_code: telegramUser.language_code,
            is_premium: telegramUser.is_premium || false,
            photo_url: telegramUser.photo_url,
            status: 'active',
            subscription_plan: 'free'
          });

        if (insertError) {
          console.error('Error creating user profile:', insertError);
        } else {
          console.log('✅ New user profile created for:', telegramUser.first_name);
        }
      }

      // Update last login
      await supabase
        .from('user_profiles')
        .update({ 
          last_login: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('telegram_id', telegramUser.id);

      // Track user login
      await supabase
        .from('user_logins')
        .insert({
          telegram_id: telegramUser.id,
          first_name: telegramUser.first_name,
          last_name: telegramUser.last_name,
          username: telegramUser.username,
          language_code: telegramUser.language_code,
          is_premium: telegramUser.is_premium || false,
          photo_url: telegramUser.photo_url,
          user_agent: navigator.userAgent,
          login_timestamp: new Date().toISOString()
        });

    } catch (error) {
      console.error('Error ensuring user profile:', error);
    }
  };

  return {
    trackVisitor,
    visitorId
  };
}
