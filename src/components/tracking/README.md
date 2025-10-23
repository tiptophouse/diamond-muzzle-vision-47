# Button Click Tracking System

## Overview
This system allows you to track which buttons users click, when they click them, and analyze button performance across the entire application.

## How to Use

### 1. Using TrackableButton Component (Recommended)

Replace regular `Button` components with `TrackableButton`:

```tsx
import { TrackableButton } from '@/components/tracking/TrackableButton';

// Basic usage
<TrackableButton
  trackId="subscription_start_button"
  trackLabel="Start Subscription"
>
  לחץ כאן להתחלה
</TrackableButton>

// With context (for additional metadata)
<TrackableButton
  trackId="contact_buyer_button"
  trackLabel="Contact Buyer"
  trackContext={{ buyerId: buyer.id, diamondId: diamond.id }}
  onClick={() => contactBuyer()}
>
  צ'אט עם קונה
</TrackableButton>

// Disable haptic feedback if needed
<TrackableButton
  trackId="cancel_button"
  hapticFeedback={false}
>
  Cancel
</TrackableButton>
```

### 2. Using the Hook Directly

For custom tracking scenarios:

```tsx
import { useButtonClickTracking } from '@/hooks/useButtonClickTracking';

function MyComponent() {
  const { trackButtonClick } = useButtonClickTracking();

  const handleCustomAction = async () => {
    await trackButtonClick(
      'custom_action_button',
      'Custom Action',
      { additionalData: 'value' }
    );
    
    // Your custom logic here
  };

  return <button onClick={handleCustomAction}>Custom Button</button>;
}
```

## Button ID Naming Convention

Use descriptive, consistent IDs:

- `{feature}_{action}_button` - e.g., `subscription_start_button`, `diamond_add_button`
- `{page}_{element}_click` - e.g., `home_hero_click`, `store_filter_click`
- Be specific and unique across the app

## Tracking Data Structure

Each button click records:
- **button_id**: Unique identifier
- **button_label**: Display text (Hebrew or English)
- **page_path**: Where the click occurred
- **user_telegram_id**: Who clicked
- **user_name**: User's name
- **timestamp**: When clicked
- **user_agent**: Device/browser info
- **session_id**: Telegram session ID
- **context**: Additional metadata (optional)

## View Analytics

Navigate to `/button-analytics` to see:
- Total clicks per button
- Unique users per button
- Recent activity
- Time-based filtering (1h, 24h, 7d, 30d)
- Button performance rankings

## Examples

### Subscription Button
```tsx
<TrackableButton
  trackId="subscription_monthly_start"
  trackLabel="Start Monthly Subscription"
  trackContext={{ plan: 'monthly', price: 99 }}
>
  לחץ כאן להתחלה
</TrackableButton>
```

### Contact Buyer Button
```tsx
<TrackableButton
  trackId="notification_contact_buyer"
  trackLabel="Contact Buyer from Notification"
  trackContext={{ 
    notificationId: notification.id,
    buyerId: buyer.telegram_id,
    matchCount: matches.length 
  }}
  onClick={() => openChat(buyer.telegram_id)}
>
  צ'אט עם קונה {buyer.name}
</TrackableButton>
```

### Navigation Card Click
```tsx
<TrackableButton
  trackId="dashboard_navigation"
  trackLabel="Navigate to Dashboard"
  variant="outline"
  className="w-full"
  onClick={() => navigate('/dashboard')}
>
  Dashboard
</TrackableButton>
```

## Database Schema

Stored in `button_click_events` table:
```sql
CREATE TABLE button_click_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  telegram_id BIGINT NOT NULL,
  button_id TEXT NOT NULL,
  button_label TEXT NOT NULL,
  page_path TEXT NOT NULL,
  user_name TEXT,
  user_agent TEXT,
  session_id TEXT,
  context JSONB,
  clicked_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Performance Insights

Use the analytics page to answer:
- Which buttons get the most clicks?
- Which buttons are ignored by users?
- Who are your most active users?
- What time of day do users click most?
- Which features are most popular?

## Tips

1. **Be Consistent**: Use the same tracking IDs across similar buttons
2. **Add Context**: Include relevant metadata for deeper analysis
3. **Review Regularly**: Check analytics weekly to understand user behavior
4. **A/B Testing**: Use different IDs for button variants to compare performance
5. **Monitor Trends**: Watch for changes after UI updates
