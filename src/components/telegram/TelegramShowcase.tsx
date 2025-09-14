/**
 * Telegram Mini App Features Showcase
 * Demonstrates all the latest Telegram Mini App SDK capabilities
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useTelegramSDK } from '@/hooks/useTelegramSDK';
import { 
  Smartphone, 
  Zap, 
  Cloud, 
  Fingerprint, 
  MapPin, 
  Maximize, 
  Home, 
  Bell, 
  QrCode,
  Share2,
  Palette,
  Settings,
  ArrowLeft,
  Copy,
  ExternalLink,
  Eye,
  AlertTriangle,
  CheckCircle,
  Info,
  X
} from 'lucide-react';

export function TelegramShowcase() {
  const telegram = useTelegramSDK();
  const [demoData, setDemoData] = useState({
    cloudKey: 'demo_key',
    cloudValue: 'Hello from Cloud Storage!',
    alertMessage: 'This is a demo alert message',
    confirmMessage: 'Are you sure you want to continue?',
    shareQuery: 'Check out this amazing Diamond Store! 💎',
    headerColor: '#3390ec',
    backgroundColor: '#ffffff',
    badgeCount: 5,
    qrText: 'Scan this QR code to discover diamonds',
    locationReason: 'We need your location to show nearby diamond stores',
    biometricReason: 'Use biometric authentication for secure access',
  });

  const [results, setResults] = useState<Record<string, any>>({});
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Monitor fullscreen changes
  useEffect(() => {
    setIsFullscreen(telegram.device.isFullscreen);
  }, [telegram.device.isFullscreen]);

  // Demo actions
  const testCloudStorage = async () => {
    try {
      const success = await telegram.cloudStorage.setItem(demoData.cloudKey, demoData.cloudValue);
      if (success) {
        const retrieved = await telegram.cloudStorage.getItem(demoData.cloudKey);
        setResults(prev => ({ 
          ...prev, 
          cloudStorage: { success: true, retrieved, timestamp: new Date().toISOString() }
        }));
        telegram.haptic.notification('success');
      } else {
        setResults(prev => ({ 
          ...prev, 
          cloudStorage: { success: false, error: 'Failed to store data' }
        }));
        telegram.haptic.notification('error');
      }
    } catch (error) {
      setResults(prev => ({ 
        ...prev, 
        cloudStorage: { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
      }));
      telegram.haptic.notification('error');
    }
  };

  const testBiometric = async () => {
    try {
      if (!telegram.biometric.isAvailable()) {
        setResults(prev => ({ 
          ...prev, 
          biometric: { available: false, message: 'Biometric authentication not available' }
        }));
        return;
      }

      const hasAccess = await telegram.biometric.requestAccess(demoData.biometricReason);
      if (hasAccess) {
        const authenticated = await telegram.biometric.authenticate(demoData.biometricReason);
        setResults(prev => ({ 
          ...prev, 
          biometric: { 
            available: true, 
            authenticated, 
            type: telegram.biometric.getType(),
            timestamp: new Date().toISOString()
          }
        }));
        telegram.haptic.notification(authenticated ? 'success' : 'error');
      }
    } catch (error) {
      setResults(prev => ({ 
        ...prev, 
        biometric: { error: error instanceof Error ? error.message : 'Authentication failed' }
      }));
      telegram.haptic.notification('error');
    }
  };

  const testLocation = async () => {
    try {
      if (!telegram.location.isAvailable()) {
        setResults(prev => ({ 
          ...prev, 
          location: { available: false, message: 'Location services not available' }
        }));
        return;
      }

      const location = await telegram.location.getLocation();
      if (location) {
        setResults(prev => ({ 
          ...prev, 
          location: { 
            available: true, 
            location,
            timestamp: new Date().toISOString()
          }
        }));
        telegram.haptic.notification('success');
      }
    } catch (error) {
      setResults(prev => ({ 
        ...prev, 
        location: { error: error instanceof Error ? error.message : 'Location access failed' }
      }));
      telegram.haptic.notification('error');
    }
  };

  const testQrScanner = async () => {
    try {
      const qrResult = await telegram.scanQr(demoData.qrText);
      setResults(prev => ({ 
        ...prev, 
        qrScanner: { 
          success: !!qrResult, 
          result: qrResult,
          timestamp: new Date().toISOString()
        }
      }));
      telegram.haptic.notification(qrResult ? 'success' : 'warning');
    } catch (error) {
      setResults(prev => ({ 
        ...prev, 
        qrScanner: { error: error instanceof Error ? error.message : 'QR scan failed' }
      }));
      telegram.haptic.notification('error');
    }
  };

  const toggleFullscreen = async () => {
    if (isFullscreen) {
      telegram.exitFullscreen();
    } else {
      const success = await telegram.requestFullscreen();
      if (!success) {
        telegram.showAlert('Fullscreen mode not supported on this device');
      }
    }
  };

  const FeatureCard = ({ 
    icon: Icon, 
    title, 
    description, 
    available, 
    children 
  }: { 
    icon: any; 
    title: string; 
    description: string; 
    available: boolean; 
    children: React.ReactNode; 
  }) => (
    <Card className={`${available ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon className={`h-5 w-5 ${available ? 'text-green-600' : 'text-gray-400'}`} />
            <CardTitle className="text-sm">{title}</CardTitle>
          </div>
          <Badge variant={available ? 'default' : 'secondary'} className="text-xs">
            {available ? 'Available' : 'Unavailable'}
          </Badge>
        </div>
        <CardDescription className="text-xs">{description}</CardDescription>
      </CardHeader>
      <CardContent className="pt-0 space-y-3">
        {children}
      </CardContent>
    </Card>
  );

  const ResultDisplay = ({ result, type }: { result: any; type: string }) => {
    if (!result) return null;

    return (
      <div className="mt-2 p-2 bg-slate-100 rounded text-xs">
        <div className="flex items-center gap-1 mb-1">
          {result.success || result.authenticated || result.available ? (
            <CheckCircle className="h-3 w-3 text-green-600" />
          ) : result.error ? (
            <X className="h-3 w-3 text-red-600" />
          ) : (
            <Info className="h-3 w-3 text-blue-600" />
          )}
          <span className="font-medium">{type} Result</span>
        </div>
        <pre className="whitespace-pre-wrap">{JSON.stringify(result, null, 2)}</pre>
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-2 flex items-center justify-center gap-2">
          <Smartphone className="h-6 w-6 text-blue-600" />
          Telegram Mini App SDK Showcase
        </h1>
        <p className="text-muted-foreground text-sm">
          Experience all the latest features and capabilities
        </p>
        
        {/* Status Indicators */}
        <div className="flex items-center justify-center gap-4 mt-4">
          <Badge variant={telegram.isInitialized ? 'default' : 'destructive'}>
            {telegram.isInitialized ? '✅ Initialized' : '❌ Not Initialized'}
          </Badge>
          {telegram.user && (
            <Badge variant="outline">
              👤 {telegram.user.first_name}
            </Badge>
          )}
          <Badge variant="secondary">
            📱 {telegram.device.platform} v{telegram.device.version}
          </Badge>
          <Badge variant={telegram.theme.colorScheme === 'dark' ? 'default' : 'outline'}>
            {telegram.theme.colorScheme === 'dark' ? '🌙 Dark' : '☀️ Light'}
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="ui-controls" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="ui-controls">UI Controls</TabsTrigger>
          <TabsTrigger value="interactions">Interactions</TabsTrigger>
          <TabsTrigger value="storage-auth">Storage & Auth</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>

        {/* UI Controls Tab */}
        <TabsContent value="ui-controls" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Main Button */}
            <FeatureCard
              icon={Zap}
              title="Main Button"
              description="Primary action button at the bottom"
              available={telegram.isInitialized}
            >
              <div className="space-y-2">
                <Button 
                  onClick={() => telegram.mainButton.show('Demo Action', () => {
                    telegram.haptic.impact('medium');
                    telegram.showAlert('Main button clicked!');
                  })}
                  size="sm" 
                  className="w-full"
                >
                  Show Main Button
                </Button>
                <Button 
                  onClick={() => telegram.mainButton.hide()}
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                >
                  Hide Main Button
                </Button>
              </div>
            </FeatureCard>

            {/* Back Button */}
            <FeatureCard
              icon={ArrowLeft}
              title="Back Button"
              description="Navigation back button"
              available={telegram.isInitialized}
            >
              <div className="space-y-2">
                <Button 
                  onClick={() => telegram.backButton.show(() => {
                    telegram.haptic.selection();
                    telegram.showAlert('Back button clicked!');
                  })}
                  size="sm" 
                  className="w-full"
                >
                  Show Back Button
                </Button>
                <Button 
                  onClick={() => telegram.backButton.hide()}
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                >
                  Hide Back Button
                </Button>
              </div>
            </FeatureCard>

            {/* Settings Button */}
            <FeatureCard
              icon={Settings}
              title="Settings Button"
              description="Settings menu button"
              available={telegram.isInitialized}
            >
              <div className="space-y-2">
                <Button 
                  onClick={() => telegram.settingsButton.show(() => {
                    telegram.haptic.selection();
                    telegram.showAlert('Settings button clicked!');
                  })}
                  size="sm" 
                  className="w-full"
                >
                  Show Settings Button
                </Button>
                <Button 
                  onClick={() => telegram.settingsButton.hide()}
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                >
                  Hide Settings Button
                </Button>
              </div>
            </FeatureCard>

            {/* Theme Controls */}
            <FeatureCard
              icon={Palette}
              title="Theme Controls"
              description="Customize app appearance"
              available={telegram.isInitialized}
            >
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label htmlFor="header-color" className="text-xs">Header</Label>
                  <Input
                    id="header-color"
                    type="color"
                    value={demoData.headerColor}
                    onChange={(e) => setDemoData(prev => ({ ...prev, headerColor: e.target.value }))}
                    className="w-12 h-8 p-0 border"
                  />
                  <Button 
                    onClick={() => telegram.setHeaderColor(demoData.headerColor)}
                    size="sm"
                    variant="outline"
                  >
                    Apply
                  </Button>
                </div>
                <div className="flex items-center gap-2">
                  <Label htmlFor="bg-color" className="text-xs">Background</Label>
                  <Input
                    id="bg-color"
                    type="color"
                    value={demoData.backgroundColor}
                    onChange={(e) => setDemoData(prev => ({ ...prev, backgroundColor: e.target.value }))}
                    className="w-12 h-8 p-0 border"
                  />
                  <Button 
                    onClick={() => telegram.setBackgroundColor(demoData.backgroundColor)}
                    size="sm"
                    variant="outline"
                  >
                    Apply
                  </Button>
                </div>
              </div>
            </FeatureCard>
          </div>
        </TabsContent>

        {/* Interactions Tab */}
        <TabsContent value="interactions" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Haptic Feedback */}
            <FeatureCard
              icon={Zap}
              title="Haptic Feedback"
              description="Physical feedback for user interactions"
              available={telegram.isInitialized}
            >
              <div className="grid grid-cols-2 gap-2">
                <Button onClick={() => telegram.haptic.impact('light')} size="sm" variant="outline">
                  Light
                </Button>
                <Button onClick={() => telegram.haptic.impact('medium')} size="sm" variant="outline">
                  Medium
                </Button>
                <Button onClick={() => telegram.haptic.impact('heavy')} size="sm" variant="outline">
                  Heavy
                </Button>
                <Button onClick={() => telegram.haptic.selection()} size="sm" variant="outline">
                  Selection
                </Button>
                <Button onClick={() => telegram.haptic.notification('success')} size="sm" variant="outline">
                  Success
                </Button>
                <Button onClick={() => telegram.haptic.notification('error')} size="sm" variant="outline">
                  Error
                </Button>
              </div>
            </FeatureCard>

            {/* Popups */}
            <FeatureCard
              icon={AlertTriangle}
              title="Popups & Alerts"
              description="Show alerts and confirmations"
              available={telegram.isInitialized}
            >
              <div className="space-y-2">
                <Input
                  placeholder="Alert message"
                  value={demoData.alertMessage}
                  onChange={(e) => setDemoData(prev => ({ ...prev, alertMessage: e.target.value }))}
                  className="text-xs"
                />
                <Button 
                  onClick={() => telegram.showAlert(demoData.alertMessage)}
                  size="sm" 
                  className="w-full"
                >
                  Show Alert
                </Button>
                <Input
                  placeholder="Confirm message"
                  value={demoData.confirmMessage}
                  onChange={(e) => setDemoData(prev => ({ ...prev, confirmMessage: e.target.value }))}
                  className="text-xs"
                />
                <Button 
                  onClick={async () => {
                    const result = await telegram.showConfirm(demoData.confirmMessage);
                    telegram.showAlert(`You clicked: ${result ? 'OK' : 'Cancel'}`);
                  }}
                  size="sm" 
                  variant="outline"
                  className="w-full"
                >
                  Show Confirm
                </Button>
              </div>
            </FeatureCard>

            {/* QR Scanner */}
            <FeatureCard
              icon={QrCode}
              title="QR Scanner"
              description="Scan QR codes with camera"
              available={telegram.isInitialized}
            >
              <div className="space-y-2">
                <Input
                  placeholder="QR popup text"
                  value={demoData.qrText}
                  onChange={(e) => setDemoData(prev => ({ ...prev, qrText: e.target.value }))}
                  className="text-xs"
                />
                <Button 
                  onClick={testQrScanner}
                  size="sm" 
                  className="w-full"
                >
                  Scan QR Code
                </Button>
                <ResultDisplay result={results.qrScanner} type="QR Scanner" />
              </div>
            </FeatureCard>

            {/* Sharing */}
            <FeatureCard
              icon={Share2}
              title="Inline Sharing"
              description="Share content via inline queries"
              available={telegram.isInitialized}
            >
              <div className="space-y-2">
                <Input
                  placeholder="Share message"
                  value={demoData.shareQuery}
                  onChange={(e) => setDemoData(prev => ({ ...prev, shareQuery: e.target.value }))}
                  className="text-xs"
                />
                <Button 
                  onClick={() => telegram.share(demoData.shareQuery)}
                  size="sm" 
                  className="w-full"
                >
                  Share Content
                </Button>
              </div>
            </FeatureCard>
          </div>
        </TabsContent>

        {/* Storage & Auth Tab */}
        <TabsContent value="storage-auth" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Cloud Storage */}
            <FeatureCard
              icon={Cloud}
              title="Cloud Storage"
              description="Store data in Telegram's cloud"
              available={telegram.features.cloudStorage}
            >
              <div className="space-y-2">
                <Input
                  placeholder="Storage key"
                  value={demoData.cloudKey}
                  onChange={(e) => setDemoData(prev => ({ ...prev, cloudKey: e.target.value }))}
                  className="text-xs"
                />
                <Input
                  placeholder="Storage value"
                  value={demoData.cloudValue}
                  onChange={(e) => setDemoData(prev => ({ ...prev, cloudValue: e.target.value }))}
                  className="text-xs"
                />
                <Button 
                  onClick={testCloudStorage}
                  size="sm" 
                  className="w-full"
                >
                  Test Storage
                </Button>
                <ResultDisplay result={results.cloudStorage} type="Cloud Storage" />
              </div>
            </FeatureCard>

            {/* Biometric Auth */}
            <FeatureCard
              icon={Fingerprint}
              title="Biometric Auth"
              description="Fingerprint and face recognition"
              available={telegram.features.biometric}
            >
              <div className="space-y-2">
                <Textarea
                  placeholder="Biometric reason"
                  value={demoData.biometricReason}
                  onChange={(e) => setDemoData(prev => ({ ...prev, biometricReason: e.target.value }))}
                  className="text-xs h-16"
                />
                <div className="flex gap-2">
                  <Button 
                    onClick={testBiometric}
                    size="sm" 
                    className="flex-1"
                  >
                    Authenticate
                  </Button>
                  {telegram.biometric.isAvailable() && (
                    <Badge variant="outline" className="text-xs">
                      {telegram.biometric.getType()}
                    </Badge>
                  )}
                </div>
                <ResultDisplay result={results.biometric} type="Biometric" />
              </div>
            </FeatureCard>

            {/* Location */}
            <FeatureCard
              icon={MapPin}
              title="Location Services"
              description="Access user's location"
              available={telegram.features.location}
            >
              <div className="space-y-2">
                <Textarea
                  placeholder="Location reason"
                  value={demoData.locationReason}
                  onChange={(e) => setDemoData(prev => ({ ...prev, locationReason: e.target.value }))}
                  className="text-xs h-16"
                />
                <Button 
                  onClick={testLocation}
                  size="sm" 
                  className="w-full"
                >
                  Get Location
                </Button>
                <ResultDisplay result={results.location} type="Location" />
              </div>
            </FeatureCard>

            {/* Clipboard */}
            <FeatureCard
              icon={Copy}
              title="Clipboard Access"
              description="Read from device clipboard"
              available={telegram.isInitialized}
            >
              <Button 
                onClick={async () => {
                  const clipboard = await telegram.readClipboard();
                  setResults(prev => ({ 
                    ...prev, 
                    clipboard: { content: clipboard, timestamp: new Date().toISOString() }
                  }));
                }}
                size="sm" 
                className="w-full"
              >
                Read Clipboard
              </Button>
              <ResultDisplay result={results.clipboard} type="Clipboard" />
            </FeatureCard>
          </div>
        </TabsContent>

        {/* Advanced Tab */}
        <TabsContent value="advanced" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Fullscreen */}
            <FeatureCard
              icon={Maximize}
              title="Fullscreen Mode"
              description="Toggle fullscreen display (2024 feature)"
              available={telegram.features.fullscreen}
            >
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={isFullscreen}
                    onCheckedChange={toggleFullscreen}
                  />
                  <Label className="text-xs">
                    {isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
                  </Label>
                </div>
                <Badge variant={isFullscreen ? 'default' : 'outline'} className="text-xs">
                  {isFullscreen ? '🖥️ Fullscreen Active' : '📱 Normal Mode'}
                </Badge>
              </div>
            </FeatureCard>

            {/* Home Screen */}
            <FeatureCard
              icon={Home}
              title="Add to Home Screen"
              description="Add app icon to home screen (2024 feature)"
              available={telegram.features.homeScreen}
            >
              <Button 
                onClick={async () => {
                  const success = await telegram.addToHomeScreen();
                  setResults(prev => ({ 
                    ...prev, 
                    homeScreen: { success, timestamp: new Date().toISOString() }
                  }));
                  telegram.haptic.notification(success ? 'success' : 'error');
                }}
                size="sm" 
                className="w-full"
              >
                Add to Home Screen
              </Button>
              <ResultDisplay result={results.homeScreen} type="Home Screen" />
            </FeatureCard>

            {/* App Badge */}
            <FeatureCard
              icon={Bell}
              title="App Badge"
              description="Set notification badge count"
              available={telegram.isInitialized}
            >
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    placeholder="Badge count"
                    value={demoData.badgeCount}
                    onChange={(e) => setDemoData(prev => ({ ...prev, badgeCount: parseInt(e.target.value) || 0 }))}
                    className="text-xs flex-1"
                  />
                  <Button 
                    onClick={() => telegram.setBadge(demoData.badgeCount)}
                    size="sm"
                  >
                    Set
                  </Button>
                </div>
                <Button 
                  onClick={() => telegram.clearBadge()}
                  size="sm" 
                  variant="outline"
                  className="w-full"
                >
                  Clear Badge
                </Button>
              </div>
            </FeatureCard>

            {/* Links */}
            <FeatureCard
              icon={ExternalLink}
              title="Link Opening"
              description="Open external and Telegram links"
              available={telegram.isInitialized}
            >
              <div className="space-y-2">
                <Button 
                  onClick={() => telegram.openLink('https://telegram.org', { try_instant_view: true })}
                  size="sm" 
                  className="w-full"
                >
                  Open External Link
                </Button>
                <Button 
                  onClick={() => telegram.openTelegramLink('https://t.me/telegram')}
                  size="sm" 
                  variant="outline"
                  className="w-full"
                >
                  Open Telegram Link
                </Button>
              </div>
            </FeatureCard>
          </div>
        </TabsContent>
      </Tabs>

      {/* Device Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Device Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            <div>
              <Label className="text-muted-foreground">Platform</Label>
              <div className="font-mono">{telegram.device.platform}</div>
            </div>
            <div>
              <Label className="text-muted-foreground">Version</Label>
              <div className="font-mono">{telegram.device.version}</div>
            </div>
            <div>
              <Label className="text-muted-foreground">Viewport Height</Label>
              <div className="font-mono">{telegram.device.viewportHeight}px</div>
            </div>
            <div>
              <Label className="text-muted-foreground">Stable Height</Label>
              <div className="font-mono">{telegram.device.viewportStableHeight}px</div>
            </div>
            <div>
              <Label className="text-muted-foreground">Color Scheme</Label>
              <div className="font-mono">{telegram.theme.colorScheme}</div>
            </div>
            <div>
              <Label className="text-muted-foreground">Expanded</Label>
              <div className="font-mono">{telegram.device.isExpanded ? 'Yes' : 'No'}</div>
            </div>
            <div>
              <Label className="text-muted-foreground">Fullscreen</Label>
              <div className="font-mono">{telegram.device.isFullscreen ? 'Yes' : 'No'}</div>
            </div>
            <div>
              <Label className="text-muted-foreground">User ID</Label>
              <div className="font-mono">{telegram.user?.id || 'N/A'}</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}