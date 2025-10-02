# Telegram SDK 2.0 Migration Guide

## Overview
This guide covers the full migration from Telegram SDK 1.x to SDK 2.0 (Bot API 8.0+).

## What's New in SDK 2.0

### 1. Fullscreen API
Native fullscreen mode for immersive experiences.

**Use Cases:**
- Diamond 360° viewer
- Certificate viewer
- AI chat interface
- Media galleries

**Example Usage:**
```tsx
import { useTelegramFullscreen } from '@/hooks/useTelegramFullscreen';

function DiamondViewer() {
  const { isFullscreen, toggleFullscreen, isSupported } = useTelegramFullscreen();

  return (
    <div>
      {isSupported && (
        <button onClick={toggleFullscreen}>
          {isFullscreen ? 'Exit' : 'Enter'} Fullscreen
        </button>
      )}
    </div>
  );
}
```

### 2. Home Screen Integration
Add Mini App to device home screen for quick access.

**Trigger Conditions:**
- User saves 5+ diamonds
- Completes first upload
- 3+ days of active usage

**Example Usage:**
```tsx
import { useTelegramHomeScreen } from '@/hooks/useTelegramHomeScreen';

function AppPrompt() {
  const { promptAddToHomeScreen, checkShouldPrompt, isSupported } = useTelegramHomeScreen();

  useEffect(() => {
    const shouldPrompt = checkShouldPrompt({
      savedDiamonds: 5,
      uploadsCompleted: 1
    });

    if (shouldPrompt) {
      promptAddToHomeScreen(
        () => console.log('Added to home screen!'),
        () => console.log('User declined')
      );
    }
  }, []);

  return null;
}
```

### 3. Settings Button
Native settings button in Telegram UI.

**Example Usage:**
```tsx
import { useTelegramSettingsButton } from '@/hooks/useTelegramSettingsButton';
import { useNavigate } from 'react-router-dom';

function App() {
  const navigate = useNavigate();
  const settingsButton = useTelegramSettingsButton(() => {
    navigate('/settings');
  });

  useEffect(() => {
    // Auto-show on app launch
    settingsButton.show();
  }, []);

  return <YourApp />;
}
```

### 4. Enhanced Cloud Storage
Store user preferences, filters, recent searches (up to 1024 key-value pairs).

**Example Usage:**
```tsx
import { useTelegramCloudStorage } from '@/hooks/useTelegramCloudStorage';

function UserPreferences() {
  const cloudStorage = useTelegramCloudStorage();

  // Save preferences
  const saveFilters = async () => {
    await cloudStorage.savePreferences({
      sortBy: 'price',
      caratRange: [0.5, 2.0],
      colors: ['D', 'E', 'F']
    });
  };

  // Load preferences
  const loadFilters = async () => {
    const prefs = await cloudStorage.getPreferences();
    if (prefs) {
      console.log('User preferences:', prefs);
    }
  };

  // Save recent search
  const saveSearch = async (query: string) => {
    await cloudStorage.saveRecentSearch(query);
  };

  return <div>...</div>;
}
```

### 5. Feature Detection
Progressive enhancement with graceful degradation.

**Example Usage:**
```tsx
import { useTelegramSDK2 } from '@/hooks/useTelegramSDK2';

function FeatureAwareComponent() {
  const { features, isSDK2Compatible, availability } = useTelegramSDK2();

  return (
    <div>
      <h3>SDK Version: {features.version}</h3>
      <h3>Platform: {features.platform}</h3>
      
      {availability.fullscreen && <FullscreenButton />}
      {availability.homeScreen && <AddToHomeScreenPrompt />}
      {availability.cloudStorage && <PreferencesManager />}
      
      {!isSDK2Compatible && (
        <p>Some features require Telegram app update</p>
      )}
    </div>
  );
}
```

## Unified SDK Access Pattern

### Old Way (Multiple window.Telegram.WebApp calls)
```tsx
// ❌ Scattered throughout the app
const tg = window.Telegram?.WebApp;
tg?.MainButton.show();
```

### New Way (Unified Provider)
```tsx
// ✅ Single source of truth
import { useTelegramSDK2Context } from '@/providers/TelegramSDK2Provider';

function MyComponent() {
  const { webApp, fullscreen, cloudStorage, features } = useTelegramSDK2Context();
  
  return <div>...</div>;
}
```

## Migration Checklist

### Phase 1: Update Dependencies ✅
- [x] Update `@twa-dev/sdk` to latest
- [x] Update script tag in `index.html`
- [x] Add SDK version detection

### Phase 2: Implement SDK 2.0 Features ✅
- [x] Add Fullscreen API hook
- [x] Add Home Screen Integration hook
- [x] Add Settings Button hook
- [x] Enhance Cloud Storage hook
- [x] Add Feature Detection hook
- [x] Create Unified Provider

### Phase 3: Replace Old Patterns (TODO)
- [ ] Replace custom fullscreen modals with SDK fullscreen
- [ ] Remove custom settings navigation, use Settings Button
- [ ] Migrate localStorage to Cloud Storage where appropriate
- [ ] Add home screen prompts based on engagement

### Phase 4: iOS 17+ Optimizations (TODO)
- [ ] Fix scroll issues with proper CSS
- [ ] Enhance safe area handling
- [ ] Test on iPhone 15 Pro Max
- [ ] Remove deprecated `disableVerticalSwipes()`

### Phase 5: Testing (TODO)
- [ ] Test on iOS 17+
- [ ] Test on Android 13+
- [ ] Test all SDK 2.0 features
- [ ] Verify graceful degradation on older versions
- [ ] Performance testing

## iOS 17+ Specific Fixes

### Scroll Issues
```css
/* Use proper CSS instead of disableVerticalSwipes() */
.scrollable-content {
  overscroll-behavior-y: contain;
  -webkit-overflow-scrolling: touch;
}
```

### Safe Area Handling
```css
.app-container {
  padding-top: env(safe-area-inset-top);
  padding-bottom: env(safe-area-inset-bottom);
  padding-left: env(safe-area-inset-left);
  padding-right: env(safe-area-inset-right);
}
```

### Dynamic Island Support
```css
@supports (padding-top: env(safe-area-inset-top)) {
  .header {
    padding-top: max(env(safe-area-inset-top), 16px);
  }
}
```

## Breaking Changes

### Removed Methods
- `disableVerticalSwipes()` - Use CSS instead
- Manual fullscreen implementations - Use SDK fullscreen API

### Deprecated Patterns
- Direct `window.Telegram.WebApp` access - Use provider context
- localStorage for user preferences - Use Cloud Storage
- Custom settings navigation - Use Settings Button

## Performance Improvements

### Before
```tsx
// Multiple SDK initializations
const tg1 = window.Telegram?.WebApp;
const tg2 = window.Telegram?.WebApp;
```

### After
```tsx
// Single initialization via provider
const { webApp } = useTelegramSDK2Context();
```

## Resources

- [Telegram Bot API 8.0+ Docs](https://core.telegram.org/bots/api)
- [Telegram Web Apps Docs](https://core.telegram.org/bots/webapps)
- [@twa-dev/sdk Documentation](https://github.com/twa-dev/sdk)

## Support

For issues or questions:
1. Check feature detection: `useTelegramSDK2().features`
2. Verify SDK version: `useTelegramSDK2().version`
3. Test on latest Telegram app version
4. Check console for compatibility warnings
