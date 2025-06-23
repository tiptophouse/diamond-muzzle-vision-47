
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { useToast } from '@/components/ui/use-toast';

interface UserProfile {
  id?: string;
  telegram_id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  email?: string;
  phone_number?: string;
  company?: string;
  website?: string;
  bio?: string;
  language_code?: string;
  timezone?: string;
  photo_url?: string;
  is_premium?: boolean;
}

export function useUserProfile() {
  const { user } = useTelegramAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const loadProfile = async () => {
    if (!user?.id) {
      setIsLoading(false);
      return;
    }

    try {
      console.log('🔄 Loading user profile for telegram_id:', user.id);
      
      // Set session context for RLS
      await supabase.functions.invoke('set-session-context', {
        body: {
          setting_name: 'app.current_user_id',
          setting_value: user.id.toString()
        }
      });

      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('telegram_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('❌ Error loading profile:', error);
        throw error;
      }

      if (data) {
        console.log('✅ Profile loaded:', data);
        setProfile(data);
      } else {
        // Create initial profile if it doesn't exist
        const initialProfile = {
          telegram_id: user.id,
          first_name: user.first_name || 'User',
          last_name: user.last_name,
          username: user.username,
          photo_url: user.photo_url,
          is_premium: user.is_premium,
          language_code: user.language_code || 'en',
          timezone: 'UTC'
        };
        
        const { data: newProfile, error: createError } = await supabase
          .from('user_profiles')
          .insert(initialProfile)
          .select()
          .single();

        if (createError) {
          console.error('❌ Error creating profile:', createError);
          throw createError;
        }

        console.log('✅ Profile created:', newProfile);
        setProfile(newProfile);
      }
    } catch (error) {
      console.error('❌ Failed to load profile:', error);
      toast({
        title: "Error",
        description: "Failed to load profile information.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const saveProfile = async (updates: Partial<UserProfile>) => {
    if (!user?.id || !profile) {
      toast({
        title: "Error",
        description: "No profile to update.",
        variant: "destructive",
      });
      return false;
    }

    setIsSaving(true);
    try {
      console.log('🔄 Saving profile updates:', updates);

      // Set session context for RLS
      await supabase.functions.invoke('set-session-context', {
        body: {
          setting_name: 'app.current_user_id',
          setting_value: user.id.toString()
        }
      });

      const { data, error } = await supabase
        .from('user_profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('telegram_id', user.id)
        .select()
        .single();

      if (error) {
        console.error('❌ Error saving profile:', error);
        throw error;
      }

      console.log('✅ Profile saved:', data);
      setProfile(data);
      
      toast({
        title: "Success",
        description: "Profile updated successfully.",
      });
      
      return true;
    } catch (error) {
      console.error('❌ Failed to save profile:', error);
      toast({
        title: "Error",
        description: "Failed to save profile changes.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, [user?.id]);

  return {
    profile,
    isLoading,
    isSaving,
    saveProfile,
    reloadProfile: loadProfile
  };
}
