import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { NativeMobileSelector } from '@/components/ui/NativeMobileSelector';
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { User, Mail, Phone, Globe, Save } from 'lucide-react';
export function AccountSettings() {
  const {
    user
  } = useTelegramAuth();
  const {
    toast
  } = useToast();
  const [profile, setProfile] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    bio: '',
    company: '',
    website: '',
    language: 'en',
    timezone: 'UTC'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  // Load user profile from Supabase
  useEffect(() => {
    const loadProfile = async () => {
      if (!user?.id) return;
      try {
        const {
          data,
          error
        } = await supabase.from('user_profiles').select('*').eq('telegram_id', user.id).single();
        if (error && error.code !== 'PGRST116') {
          console.error('Error loading profile:', error);
          return;
        }
        if (data) {
          setProfile({
            firstName: data.first_name || '',
            lastName: data.last_name || '',
            email: data.email || '',
            phone: data.phone_number || '',
            bio: data.bio || '',
            company: data.company || '',
            website: data.website || '',
            language: data.language || 'en',
            timezone: data.timezone || 'UTC'
          });
        } else {
          // Set defaults from Telegram user if no profile exists
          setProfile(prev => ({
            ...prev,
            firstName: user.first_name || '',
            lastName: user.last_name || ''
          }));
        }
      } catch (error) {
        console.error('Error loading profile:', error);
      } finally {
        setIsLoadingProfile(false);
      }
    };
    loadProfile();
  }, [user]);
  const handleSave = async () => {
    if (!user?.id) return;
    setIsLoading(true);
    try {
      const {
        error
      } = await supabase.from('user_profiles').upsert({
        telegram_id: user.id,
        first_name: profile.firstName,
        last_name: profile.lastName,
        email: profile.email || null,
        phone_number: profile.phone || null,
        bio: profile.bio || null,
        company: profile.company || null,
        website: profile.website || null,
        language: profile.language,
        timezone: profile.timezone,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'telegram_id'
      });
      if (error) {
        throw error;
      }
      toast({
        title: "Settings saved",
        description: "Your account settings have been updated successfully."
      });
    } catch (error) {
      console.error('Error saving profile:', error);
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  return <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Account Information
        </CardTitle>
        <CardDescription>
          Manage your personal information and account preferences
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">First Name</Label>
            <Input id="firstName" value={profile.firstName} onChange={e => setProfile(prev => ({
            ...prev,
            firstName: e.target.value
          }))} placeholder="Enter your first name" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">Last Name</Label>
            <Input id="lastName" value={profile.lastName} onChange={e => setProfile(prev => ({
            ...prev,
            lastName: e.target.value
          }))} placeholder="Enter your last name" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input id="email" type="email" value={profile.email} onChange={e => setProfile(prev => ({
              ...prev,
              email: e.target.value
            }))} placeholder="your.email@example.com" className="pl-10" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input id="phone" value={profile.phone} onChange={e => setProfile(prev => ({
              ...prev,
              phone: e.target.value
            }))} placeholder="+1 (555) 123-4567" className="pl-10" />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="bio">Bio</Label>
          <Textarea id="bio" value={profile.bio} onChange={e => setProfile(prev => ({
          ...prev,
          bio: e.target.value
        }))} placeholder="Tell us about yourself..." rows={3} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="company">Company</Label>
            <Input id="company" value={profile.company} onChange={e => setProfile(prev => ({
            ...prev,
            company: e.target.value
          }))} placeholder="Your company name" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="website">Website</Label>
            <div className="relative">
              <Globe className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input id="website" value={profile.website} onChange={e => setProfile(prev => ({
              ...prev,
              website: e.target.value
            }))} placeholder="https://yourwebsite.com" className="pl-10" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6">
          <NativeMobileSelector id="language" label="Language" value={profile.language} onValueChange={value => setProfile(prev => ({
          ...prev,
          language: value
        }))} options={['English', 'Hebrew']} columns={2} />
          
          <NativeMobileSelector id="timezone" label="Timezone" value={profile.timezone} onValueChange={value => setProfile(prev => ({
          ...prev,
          timezone: value
        }))} options={['UTC', 'America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles', 'Europe/London', 'Europe/Paris', 'Asia/Tokyo']} columns={2} />
        </div>

        <div className="flex justify-center pt-4">
          <Button onClick={handleSave} disabled={isLoading || isLoadingProfile} className="bg-primary hover:bg-primary/90 px-[80px]">
            <Save className="h-4 w-4 mr-2" />
            {isLoading ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </CardContent>
    </Card>;
}