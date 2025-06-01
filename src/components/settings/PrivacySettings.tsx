
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Shield, Eye, Users, BarChart3, Save } from 'lucide-react';

export function PrivacySettings() {
  const { toast } = useToast();
  
  const [privacy, setPrivacy] = useState({
    profileVisibility: true,
    activityTracking: true,
    dataSharing: false,
    analyticsCollection: true,
    thirdPartyIntegrations: false,
    locationTracking: false,
    contactSync: true,
    searchVisibility: true
  });

  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast({
        title: "Privacy settings saved",
        description: "Your privacy preferences have been updated.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save privacy settings.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateSetting = (key: keyof typeof privacy) => {
    setPrivacy(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Privacy & Security
        </CardTitle>
        <CardDescription>
          Control your privacy settings and data sharing preferences
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Visibility Settings
          </h3>
          <div className="space-y-3 ml-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="profileVisibility" className="text-sm font-normal">
                  Profile visibility
                </Label>
                <p className="text-xs text-gray-500">Allow others to see your profile information</p>
              </div>
              <Switch
                id="profileVisibility"
                checked={privacy.profileVisibility}
                onCheckedChange={() => updateSetting('profileVisibility')}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="searchVisibility" className="text-sm font-normal">
                  Search visibility
                </Label>
                <p className="text-xs text-gray-500">Allow your profile to appear in search results</p>
              </div>
              <Switch
                id="searchVisibility"
                checked={privacy.searchVisibility}
                onCheckedChange={() => updateSetting('searchVisibility')}
              />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Data Collection
          </h3>
          <div className="space-y-3 ml-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="activityTracking" className="text-sm font-normal">
                  Activity tracking
                </Label>
                <p className="text-xs text-gray-500">Track your app usage for personalized experience</p>
              </div>
              <Switch
                id="activityTracking"
                checked={privacy.activityTracking}
                onCheckedChange={() => updateSetting('activityTracking')}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="analyticsCollection" className="text-sm font-normal">
                  Analytics collection
                </Label>
                <p className="text-xs text-gray-500">Help improve the app with anonymous usage data</p>
              </div>
              <Switch
                id="analyticsCollection"
                checked={privacy.analyticsCollection}
                onCheckedChange={() => updateSetting('analyticsCollection')}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="locationTracking" className="text-sm font-normal">
                  Location tracking
                </Label>
                <p className="text-xs text-gray-500">Use location data for relevant features</p>
              </div>
              <Switch
                id="locationTracking"
                checked={privacy.locationTracking}
                onCheckedChange={() => updateSetting('locationTracking')}
              />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
            <Users className="h-4 w-4" />
            Data Sharing
          </h3>
          <div className="space-y-3 ml-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="dataSharing" className="text-sm font-normal">
                  Third-party data sharing
                </Label>
                <p className="text-xs text-gray-500">Share data with trusted partners for better services</p>
              </div>
              <Switch
                id="dataSharing"
                checked={privacy.dataSharing}
                onCheckedChange={() => updateSetting('dataSharing')}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="thirdPartyIntegrations" className="text-sm font-normal">
                  Third-party integrations
                </Label>
                <p className="text-xs text-gray-500">Allow connections to external services</p>
              </div>
              <Switch
                id="thirdPartyIntegrations"
                checked={privacy.thirdPartyIntegrations}
                onCheckedChange={() => updateSetting('thirdPartyIntegrations')}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="contactSync" className="text-sm font-normal">
                  Contact synchronization
                </Label>
                <p className="text-xs text-gray-500">Sync contacts for better networking features</p>
              </div>
              <Switch
                id="contactSync"
                checked={privacy.contactSync}
                onCheckedChange={() => updateSetting('contactSync')}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <Button onClick={handleSave} disabled={isLoading} className="bg-blue-600 hover:bg-blue-700">
            <Save className="h-4 w-4 mr-2" />
            {isLoading ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
