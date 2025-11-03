# Telegram Mini App SDK 2.0 Implementation Guide

## Overview

This diamond marketplace is now a **native-looking Telegram Mini App** with SDK 2.0 integration, inline keyboard buttons, and deep linking support.

---

## 🎨 Native Design System

### Telegram Theme Integration

The app uses Telegram's theme parameters for native appearance:

**File: `src/lib/telegram-theme.ts`**
- Auto-detects Telegram theme colors (dark/light mode)
- Applies theme to CSS variables
- Updates dynamically when user changes Telegram theme
- Expands mini app to full screen on launch

**Usage:**
```typescript
import { applyTelegramTheme, expandTelegramWebApp } from '@/lib/telegram-theme';

// Apply on app mount
useEffect(() => {
  applyTelegramTheme();
  expandTelegramWebApp();
}, []);
```

---

## 🔘 Inline Keyboard Buttons with Web App Deep Links

### How It Works

1. **Seller sends message** → AI generates message with diamond data
2. **Bot sends message** → Includes inline buttons for each diamond
3. **Buyer clicks button** → Opens mini app directly to that diamond

### Implementation

**Edge Function: `supabase/functions/send-seller-message/index.ts`**

```typescript
// Creates inline keyboard with web_app URLs
const inlineKeyboard = diamonds_data?.slice(0, 5).map((diamond: any) => [{
  text: `💎 ${diamond.shape} ${diamond.weight}ct - $${diamond.price}`,
  web_app: {
    url: `https://t.me/${botUsername}/app?startapp=diamond_${diamond.stock}`
  }
}]);

// Sends buttons after message
await fetch(`${TELEGRAM_API}/sendMessage`, {
  method: 'POST',
  body: JSON.stringify({
    chat_id: telegram_id,
    text: '🔽 לחץ על יהלום לצפייה מלאה באפליקציה:',
    reply_markup: {
      inline_keyboard: inlineKeyboard
    }
  })
});
```

**Format:**
- `https://t.me/mazalbot_bot/app?startapp=diamond_STOCK123`
- Telegram passes `startapp` as `start_param` to mini app

---

## 🔗 Deep Linking System

### Hook: `src/hooks/useTelegramDeepLink.ts`

Handles incoming deep links from Telegram inline buttons:

```typescript
export function useTelegramDeepLink() {
  const navigate = useNavigate();

  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    const startParam = tg?.initDataUnsafe?.start_param;
    
    if (startParam?.startsWith('diamond_')) {
      const stockNumber = startParam.replace('diamond_', '');
      navigate(`/inventory?stock=${stockNumber}`);
    }
  }, [navigate]);
}
```

### Inventory Page: `src/pages/InventoryPage.tsx`

Handles `?stock=STOCK123` query parameter:

```typescript
useEffect(() => {
  const stockParam = searchParams.get('stock');
  if (stockParam && displayDiamonds.length > 0) {
    const diamond = displayDiamonds.find(
      d => d.stockNumber === stockParam || d.stock === stockParam
    );
    
    if (diamond) {
      setSearchQuery(stockParam);
      toast.success('יהלום נמצא!');
    }
  }
}, [searchParams, displayDiamonds]);
```

---

## 📱 Telegram SDK 2.0 Features

### MainButton (Bottom CTA)

```typescript
const { webApp } = useTelegramWebApp();

webApp?.MainButton.setText('Send Message');
webApp?.MainButton.show();
webApp?.MainButton.onClick(handleSendMessage);
```

### Haptic Feedback

```typescript
import { useTelegramHapticFeedback } from '@/hooks/useTelegramHapticFeedback';

const { impactOccurred, notificationOccurred } = useTelegramHapticFeedback();

impactOccurred('medium'); // On button click
notificationOccurred('success'); // On success
```

### Theme Colors

```typescript
const tg = window.Telegram?.WebApp;
const bgColor = tg?.themeParams.bg_color || '#ffffff';
const buttonColor = tg?.themeParams.button_color || '#3390ec';
```

---

## 🚀 Full User Flow

1. **Buyer searches** → Notification created for sellers
2. **Seller clicks notification** → Opens `EnhancedContactDialog`
3. **Dialog fetches fresh data** → From FastAPI `get_all_stones`
4. **Seller selects diamonds** → Checkboxes to choose which to send
5. **AI generates message** → Hebrew message with diamond details
6. **Message sent to buyer** → With images + inline buttons
7. **Buyer clicks button** → Mini app opens to specific diamond
8. **Deep link handled** → Auto-searches for diamond in inventory

---

## 🛠️ Architecture Diagram

```
┌─────────────────┐
│   Telegram      │
│   Mini App      │
│  (Buyer Side)   │
└────────┬────────┘
         │ 1. Deep Link
         │    diamond_STOCK123
         ▼
┌─────────────────┐
│ useTelegramDeep │ ──► Parse startapp param
│     Link        │ ──► Navigate to /inventory?stock=STOCK123
└────────┬────────┘
         │ 2. Load Page
         ▼
┌─────────────────┐
│  InventoryPage  │ ──► Search for diamond
│                 │ ──► Show toast notification
└─────────────────┘

┌─────────────────┐
│   Telegram      │
│   Mini App      │
│  (Seller Side)  │
└────────┬────────┘
         │ 3. Contact Buyer
         ▼
┌─────────────────┐
│  Enhanced       │ ──► Fetch diamonds from FastAPI
│  ContactDialog  │ ──► Generate AI response
└────────┬────────┘
         │ 4. Send Message
         ▼
┌─────────────────┐
│  send-seller    │ ──► Create inline keyboard
│  -message       │ ──► Send via Bot API
└────────┬────────┘
         │ 5. Telegram Bot API
         ▼
┌─────────────────┐
│   Buyer's       │ ◄─ Message + Images
│   Telegram      │ ◄─ Inline Buttons
└─────────────────┘
```

---

## 📋 Checklist

### ✅ Completed
- [x] Telegram theme integration
- [x] Native-looking design (not Telegram UI)
- [x] Inline keyboard buttons with web_app URLs
- [x] Deep linking to specific diamonds
- [x] Diamond selection checkboxes
- [x] FastAPI image fetching (multiple field names)
- [x] AI message generation with Hebrew
- [x] Haptic feedback
- [x] Toast notifications
- [x] Query parameter handling

### 🔧 Configuration Needed

1. **Bot Username**: Update in edge function if needed
   - Currently using bot info from `getMe` API
   - Format: `https://t.me/{username}/app?startapp=diamond_{stock}`

2. **FastAPI Image Fields**: Checks multiple fields:
   - `picture`
   - `image_url`
   - `image`
   
3. **Theme Colors**: Auto-detected from Telegram
   - Falls back to default light theme if not available

---

## 🎯 Best Practices

### DO ✅
- Use semantic tokens from design system
- Apply Telegram theme on mount and theme change
- Expand mini app to full screen
- Handle deep links gracefully
- Show loading states and toasts
- Use haptic feedback for better UX

### DON'T ❌
- Don't hardcode colors (use theme params)
- Don't use Telegram UI style (make it native)
- Don't ignore deep link errors
- Don't send messages without inline buttons
- Don't block UI during AI generation

---

## 📚 Resources

- [Telegram Mini Apps Docs](https://core.telegram.org/bots/webapps)
- [Telegram Bot API](https://core.telegram.org/bots/api)
- [Inline Keyboards](https://core.telegram.org/bots/api#inlinekeyboardmarkup)
- [Web App Deep Linking](https://core.telegram.org/bots/webapps#initializing-mini-apps)

---

## 🐛 Debugging

### Check if Mini App is running in Telegram:
```typescript
const isTelegram = !!(window as any).Telegram?.WebApp;
console.log('Running in Telegram:', isTelegram);
```

### Check deep link params:
```typescript
const tg = (window as any).Telegram?.WebApp;
console.log('Start param:', tg?.initDataUnsafe?.start_param);
```

### Check theme params:
```typescript
const tg = (window as any).Telegram?.WebApp;
console.log('Theme:', tg?.themeParams);
```

### Check bot info in edge function logs:
```bash
# Edge function logs will show:
🤖 Bot username: mazalbot_bot
🔘 Created inline buttons: 5
```

---

## 🎉 Result

- **Native iOS/Android look** with Telegram theme
- **Inline buttons** that open specific diamonds
- **Deep linking** from Telegram messages to app
- **Diamond selection** before sending
- **AI-powered messages** in Hebrew
- **Professional UX** with haptics and toasts
