
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { useToast } from '@/components/ui/use-toast';

interface UserProfile {
  first_name: string;
  last_name: string | null;
  email: string | null;
  phone_number: string | null;
  business_name: string | null;
}

export function useUserProfile() {
  const { user } = useTelegramAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<UserProfile>({
    first_name: '',
    last_name: null,
    email: null,
    phone_number: null,
    business_name: null
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const fetchProfile = async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('first_name, last_name, email, phone_number, business_name')
        .eq('telegram_id', user.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setProfile(data);
      } else {
        // Initialize with user data from Telegram
        setProfile({
          first_name: user.first_name || '',
          last_name: user.last_name || null,
          email: null,
          phone_number: null,
          business_name: null
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load profile data",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const saveProfile = async (updatedProfile: UserProfile) => {
    if (!user?.id) return false;

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('user_profiles')
        .upsert({
          telegram_id: user.id,
          first_name: updatedProfile.first_name,
          last_name: updatedProfile.last_name,
          email: updatedProfile.email,
          phone_number: updatedProfile.phone_number,
          business_name: updatedProfile.business_name,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'telegram_id'
        });

      if (error) throw error;

      setProfile(updatedProfile);
      toast({
        title: "Settings saved ✅",
        description: "Your profile has been updated successfully",
      });
      return true;
    } catch (error) {
      console.error('Error saving profile:', error);
      toast({
        variant: "destructive",
        title: "Save Failed ❌",
        description: "Failed to save your settings. Please try again.",
      });
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [user?.id]);

  return {
    profile,
    setProfile,
    saveProfile,
    isLoading,
    isSaving
  };
}
