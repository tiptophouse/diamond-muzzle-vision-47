import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTelegramCloudStorage } from '@/hooks/useTelegramCloudStorage';
import { useTelegramBiometric } from '@/hooks/useTelegramBiometric';
import { useTelegramPopup } from '@/hooks/useTelegramPopup';
import { useTelegramFullscreen } from '@/hooks/useTelegramFullscreen';
import { useTelegramShare } from '@/hooks/useTelegramShare';
import { useTelegramSensors } from '@/hooks/useTelegramSensors';
import { useTelegramSettingsButton } from '@/hooks/useTelegramSettingsButton';
import { useTelegramHapticFeedback } from '@/hooks/useTelegramHapticFeedback';
import { 
  Cloud, Lock, Bell, Maximize, Share2, Gauge, Settings, 
  Vibrate, Smartphone, Check, X, Zap
} from 'lucide-react';

/**
 * Telegram Features Demo Component
 * Comprehensive demonstration of all Telegram SDK features
 * 
 * Use this as reference for implementing Telegram features in your app
 */

export function TelegramFeaturesDemo() {
  const cloudStorage = useTelegramCloudStorage();
  const biometric = useTelegramBiometric();
  const popup = useTelegramPopup();
  const fullscreen = useTelegramFullscreen();
  const share = useTelegramShare();
  const sensors = useTelegramSensors();
  const settingsButton = useTelegramSettingsButton();
  const haptic = useTelegramHapticFeedback();

  const [storageTest, setStorageTest] = useState('');

  return (
    <div className="min-h-screen bg-background p-4 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            Telegram SDK Features Demo
          </CardTitle>
          <CardDescription>
            Best practices implementation of all Telegram mini app features
          </CardDescription>
        </CardHeader>
      </Card>

      <Tabs defaultValue="storage" className="w-full">
        <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8">
          <TabsTrigger value="storage" className="text-xs">
            <Cloud className="h-3 w-3" />
          </TabsTrigger>
          <TabsTrigger value="biometric" className="text-xs">
            <Lock className="h-3 w-3" />
          </TabsTrigger>
          <TabsTrigger value="popup" className="text-xs">
            <Bell className="h-3 w-3" />
          </TabsTrigger>
          <TabsTrigger value="fullscreen" className="text-xs">
            <Maximize className="h-3 w-3" />
          </TabsTrigger>
          <TabsTrigger value="share" className="text-xs">
            <Share2 className="h-3 w-3" />
          </TabsTrigger>
          <TabsTrigger value="sensors" className="text-xs">
            <Gauge className="h-3 w-3" />
          </TabsTrigger>
          <TabsTrigger value="settings" className="text-xs">
            <Settings className="h-3 w-3" />
          </TabsTrigger>
          <TabsTrigger value="haptic" className="text-xs">
            <Vibrate className="h-3 w-3" />
          </TabsTrigger>
        </TabsList>

        {/* Cloud Storage */}
        <TabsContent value="storage">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Cloud className="h-5 w-5" />
                Cloud Storage
                {cloudStorage.isSupported && <Badge variant="outline">Available</Badge>}
              </CardTitle>
              <CardDescription>
                Persistent key-value storage in Telegram cloud (1024 keys max)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={storageTest}
                  onChange={(e) => setStorageTest(e.target.value)}
                  placeholder="Enter test value"
                  className="flex-1 px-3 py-2 border rounded-md"
                />
                <Button
                  onClick={async () => {
                    const success = await cloudStorage.setItem('test_key', storageTest);
                    if (success) haptic.notificationOccurred('success');
                  }}
                  disabled={false}
                >
                  Save
                </Button>
              </div>
              <Button
                variant="outline"
                onClick={async () => {
                  const value = await cloudStorage.getItem('test_key');
                  if (value) {
                    setStorageTest(value);
                    haptic.notificationOccurred('success');
                  }
                }}
              >
                Load
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Biometric */}
        <TabsContent value="biometric">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Biometric Authentication
                {biometric.isAvailable && (
                  <Badge variant="outline">{biometric.biometricType}</Badge>
                )}
              </CardTitle>
              <CardDescription>
                Face/fingerprint authentication for sensitive operations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-sm">Available:</span>
                {biometric.isAvailable ? (
                  <Check className="h-4 w-4 text-green-600" />
                ) : (
                  <X className="h-4 w-4 text-red-600" />
                )}
              </div>
              <Button
                onClick={async () => {
                  const granted = await biometric.requestAccess('Authenticate to access demo');
                  if (granted) haptic.notificationOccurred('success');
                }}
                disabled={!biometric.isAvailable}
              >
                Request Access
              </Button>
              <Button
                variant="outline"
                onClick={async () => {
                  const result = await biometric.authenticate('Confirm authentication');
                  if (result.success) {
                    haptic.notificationOccurred('success');
                    popup.showSuccess('Authentication successful!');
                  }
                }}
                disabled={!biometric.isAccessGranted}
              >
                Authenticate
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Popup */}
        <TabsContent value="popup">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Native Popups
              </CardTitle>
              <CardDescription>
                Telegram-styled alerts, confirms, and custom popups
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button onClick={() => popup.showAlert('This is a test alert')}>
                Show Alert
              </Button>
              <Button
                variant="outline"
                onClick={async () => {
                  const confirmed = await popup.showConfirm('Are you sure?');
                  if (confirmed) popup.showSuccess('Confirmed!');
                }}
              >
                Show Confirm
              </Button>
              <Button
                variant="secondary"
                onClick={() => popup.showSuccess('Operation successful!')}
              >
                Show Success
              </Button>
              <Button
                variant="destructive"
                onClick={async () => {
                  const confirmed = await popup.showDestructive(
                    'Delete this item?',
                    'Delete',
                    'Cancel'
                  );
                  if (confirmed) popup.showSuccess('Deleted!');
                }}
              >
                Show Destructive
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Fullscreen */}
        <TabsContent value="fullscreen">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Maximize className="h-5 w-5" />
                Fullscreen & Home Screen
                {fullscreen.isFullscreen && <Badge variant="default">Fullscreen</Badge>}
              </CardTitle>
              <CardDescription>
                Immersive fullscreen mode and home screen installation
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                onClick={fullscreen.toggleFullscreen}
                disabled={!fullscreen.isSupported}
              >
                {fullscreen.isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Share */}
        <TabsContent value="share">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Share2 className="h-5 w-5" />
                Share & Download
              </CardTitle>
              <CardDescription>
                Share to chats, stories, and download files
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                onClick={() =>
                  share.shareText({
                    text: '💎 Check out this amazing diamond app!',
                    url: 'https://t.me/your_bot',
                  })
                }
              >
                Share Text
              </Button>
              <Button
                variant="outline"
                onClick={() =>
                  share.shareToChat('💎 Diamond Deals Inside!', ['users', 'groups'])
                }
              >
                Share to Chat
              </Button>
              <Button
                variant="secondary"
                onClick={() => share.shareViaClipboard('Copied to clipboard!')}
              >
                Copy to Clipboard
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sensors */}
        <TabsContent value="sensors">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gauge className="h-5 w-5" />
                Device Sensors
                {sensors.isSensorsAvailable && <Badge variant="outline">Available</Badge>}
              </CardTitle>
              <CardDescription>
                Accelerometer, gyroscope, and device orientation
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-2">
                <Button
                  onClick={() => sensors.startAccelerometer()}
                  disabled={sensors.isAccelerometerStarted}
                  size="sm"
                >
                  Start Accel
                </Button>
                <Button
                  onClick={sensors.stopAccelerometer}
                  disabled={!sensors.isAccelerometerStarted}
                  variant="outline"
                  size="sm"
                >
                  Stop
                </Button>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => sensors.lockOrientation('portrait')}
                  size="sm"
                  variant="secondary"
                >
                  Lock Portrait
                </Button>
                <Button
                  onClick={sensors.unlockOrientation}
                  size="sm"
                  variant="outline"
                >
                  Unlock
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Button */}
        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Settings Button
                {settingsButton.isVisible && <Badge variant="default">Visible</Badge>}
              </CardTitle>
              <CardDescription>
                Native settings button in app header
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                onClick={() => settingsButton.show()}
                disabled={!settingsButton.isSupported || settingsButton.isVisible}
              >
                Show Settings Button
              </Button>
              <Button
                variant="outline"
                onClick={settingsButton.hide}
                disabled={!settingsButton.isVisible}
              >
                Hide Settings Button
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Haptic Feedback */}
        <TabsContent value="haptic">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Vibrate className="h-5 w-5" />
                Haptic Feedback
              </CardTitle>
              <CardDescription>
                Tactile feedback for better user experience
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="grid grid-cols-3 gap-2">
                <Button onClick={() => haptic.impactOccurred('light')} size="sm">
                  Light
                </Button>
                <Button onClick={() => haptic.impactOccurred('medium')} size="sm">
                  Medium
                </Button>
                <Button onClick={() => haptic.impactOccurred('heavy')} size="sm">
                  Heavy
                </Button>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <Button
                  onClick={() => haptic.notificationOccurred('success')}
                  variant="outline"
                  size="sm"
                >
                  Success
                </Button>
                <Button
                  onClick={() => haptic.notificationOccurred('warning')}
                  variant="outline"
                  size="sm"
                >
                  Warning
                </Button>
                <Button
                  onClick={() => haptic.notificationOccurred('error')}
                  variant="outline"
                  size="sm"
                >
                  Error
                </Button>
              </div>
              <Button onClick={haptic.selectionChanged} variant="secondary" className="w-full">
                Selection Changed
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
