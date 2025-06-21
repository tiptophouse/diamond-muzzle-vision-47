
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { api, apiEndpoints } from '@/lib/api';
import { useSecureUserData } from '@/hooks/useSecureUserData';

export interface UserProfile {
  telegram_id: number;
  first_name: string;
  last_name?: string;
  email?: string;
  phone_number?: string;
  bio?: string;
  company?: string;
  website?: string;
  language_code?: string;
  timezone?: string;
  username?: string;
  photo_url?: string;
}

export function useUserProfile() {
  const { userId, isUserValid, validateUserAccess } = useSecureUserData();
  const { toast } = useToast();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const fetchProfile = async () => {
    if (!isUserValid || !userId || !validateUserAccess()) {
      return;
    }

    setIsLoading(true);
    try {
      console.log('👤 PROFILE: Fetching profile for user:', userId);
      
      const response = await api.get(apiEndpoints.getUserProfile(userId));
      
      if (response.error) {
        throw new Error(response.error);
      }

      if (response.data) {
        setProfile(response.data);
        console.log('✅ PROFILE: Profile loaded successfully');
      }
    } catch (error) {
      console.error('❌ PROFILE: Failed to fetch profile:', error);
      toast({
        variant: "destructive",
        title: "❌ Failed to Load Profile",
        description: "Could not load your profile information. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (updatedProfile: Partial<UserProfile>): Promise<boolean> => {
    if (!isUserValid || !userId || !validateUserAccess()) {
      return false;
    }

    setIsSaving(true);
    try {
      console.log('👤 PROFILE: Updating profile for user:', userId, updatedProfile);
      
      const response = await api.put(apiEndpoints.updateUserProfile(userId), {
        ...updatedProfile,
        telegram_id: userId
      });
      
      if (response.error) {
        throw new Error(response.error);
      }

      console.log('✅ PROFILE: Profile updated successfully');
      
      // Update local state
      setProfile(prev => prev ? { ...prev, ...updatedProfile } : null);
      
      toast({
        title: "✅ Profile Updated",
        description: "Your profile has been updated successfully.",
      });
      
      return true;
    } catch (error) {
      console.error('❌ PROFILE: Failed to update profile:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to update profile';
      
      toast({
        variant: "destructive",
        title: "❌ Failed to Update Profile",
        description: errorMessage,
      });
      
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  // Load profile when user is validated
  useEffect(() => {
    if (isUserValid && userId) {
      fetchProfile();
    }
  }, [isUserValid, userId]);

  return {
    profile,
    isLoading,
    isSaving,
    updateProfile,
    refetchProfile: fetchProfile
  };
}
