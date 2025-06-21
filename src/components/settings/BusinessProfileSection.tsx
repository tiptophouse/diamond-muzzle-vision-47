
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { Building2, Save, Loader2, CheckCircle } from 'lucide-react';

interface BusinessProfile {
  companyName: string;
  businessType: string;
  address: string;
  city: string;
  country: string;
  phone: string;
  email: string;
  website: string;
  description: string;
  taxId: string;
}

export function BusinessProfileSection() {
  const { user } = useTelegramAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<BusinessProfile>({
    companyName: '',
    businessType: '',
    address: '',
    city: '',
    country: '',
    phone: '',
    email: '',
    website: '',
    description: '',
    taxId: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  useEffect(() => {
    loadBusinessProfile();
  }, [user]);

  const loadBusinessProfile = () => {
    if (!user?.id) return;
    
    setIsLoading(true);
    try {
      // Load from localStorage for now
      const storageKey = `business_profile_${user.id}`;
      const saved = localStorage.getItem(storageKey);
      
      if (saved) {
        const parsedProfile = JSON.parse(saved);
        setProfile(parsedProfile);
        setLastSaved(new Date(parsedProfile.lastSaved || Date.now()));
      }
    } catch (error) {
      console.error('Failed to load business profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user?.id) {
      toast({
        title: "❌ Authentication Required",
        description: "Please log in to save your business profile",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      // Save to localStorage with user context
      const storageKey = `business_profile_${user.id}`;
      const profileWithMetadata = {
        ...profile,
        lastSaved: new Date().toISOString(),
        userId: user.id
      };
      
      localStorage.setItem(storageKey, JSON.stringify(profileWithMetadata));
      setLastSaved(new Date());
      
      toast({
        title: "✅ Business Profile Saved",
        description: "Your business information has been securely saved",
      });
    } catch (error) {
      console.error('Failed to save business profile:', error);
      toast({
        title: "❌ Save Failed",
        description: "Failed to save business profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (field: keyof BusinessProfile, value: string) => {
    setProfile(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            <span>Loading business profile...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          Business Profile
        </CardTitle>
        {lastSaved && (
          <p className="text-sm text-gray-500 flex items-center gap-1">
            <CheckCircle className="h-3 w-3" />
            Last saved: {lastSaved.toLocaleString()}
          </p>
        )}
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Company Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="companyName">Company Name *</Label>
            <Input
              id="companyName"
              value={profile.companyName}
              onChange={(e) => handleChange('companyName', e.target.value)}
              placeholder="Your Diamond Company Ltd."
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="businessType">Business Type</Label>
            <Input
              id="businessType"
              value={profile.businessType}
              onChange={(e) => handleChange('businessType', e.target.value)}
              placeholder="Diamond Retailer, Wholesaler, etc."
            />
          </div>
        </div>

        {/* Contact Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="email">Business Email</Label>
            <Input
              id="email"
              type="email"
              value={profile.email}
              onChange={(e) => handleChange('email', e.target.value)}
              placeholder="info@yourcompany.com"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Business Phone</Label>
            <Input
              id="phone"
              value={profile.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              placeholder="+1 (555) 123-4567"
            />
          </div>
        </div>

        {/* Address Information */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="address">Business Address</Label>
            <Input
              id="address"
              value={profile.address}
              onChange={(e) => handleChange('address', e.target.value)}
              placeholder="123 Diamond District, Suite 456"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                value={profile.city}
                onChange={(e) => handleChange('city', e.target.value)}
                placeholder="New York"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                value={profile.country}
                onChange={(e) => handleChange('country', e.target.value)}
                placeholder="United States"
              />
            </div>
          </div>
        </div>

        {/* Additional Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="website">Website</Label>
            <Input
              id="website"
              value={profile.website}
              onChange={(e) => handleChange('website', e.target.value)}
              placeholder="https://yourcompany.com"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="taxId">Tax ID / Registration Number</Label>
            <Input
              id="taxId"
              value={profile.taxId}
              onChange={(e) => handleChange('taxId', e.target.value)}
              placeholder="123-45-6789"
            />
          </div>
        </div>

        {/* Business Description */}
        <div className="space-y-2">
          <Label htmlFor="description">Business Description</Label>
          <Textarea
            id="description"
            value={profile.description}
            onChange={(e) => handleChange('description', e.target.value)}
            placeholder="Describe your diamond business, specialties, and services..."
            rows={4}
          />
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-4">
          <Button 
            onClick={handleSave} 
            disabled={isSaving}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Business Profile
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
