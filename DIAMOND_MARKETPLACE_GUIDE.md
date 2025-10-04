# 💎 Diamond Marketplace System - Complete Guide

## Overview
Revolutionary diamond viewing and marketplace system with motion controls, analytics tracking, and buyer-seller interaction. Users can view diamonds in immersive 3D, make offers, and track performance metrics.

---

## 🎯 Core Features

### 1. **Immersive Diamond Viewer**
Full-screen diamond viewing with advanced motion controls.

**Access:** `/diamond/{stockNumber}/immersive`

**Features:**
- **Device Tilt Control**: Rotate diamond naturally by tilting phone
- **Pinch to Zoom**: Two-finger pinch gestures to zoom 1x-3x
- **Manual Rotation**: Single-finger drag to rotate manually
- **Reset View**: Quick reset button to return to default angle
- **Responsive**: Works on all mobile devices with motion sensors

**User Instructions (Auto-shown):**
```
📱 Tilt device: Rotate diamond naturally
✌️ Two fingers: Pinch to zoom in/out
☝️ One finger: Drag to rotate manually
🔄 Reset: Return to original view
```

**Motion Sensors Used:**
1. **DeviceOrientation** (Primary) - Most accurate, absolute angles
2. **Gyroscope** (Fallback) - Good rotation tracking
3. **Accelerometer** (Fallback) - Basic tilt detection

---

### 2. **Make an Offer System**
Buyers can submit price offers directly from the diamond viewer.

**Database:** `diamond_offers` table

**Offer Flow:**
1. Viewer opens diamond in immersive mode
2. Clicks "Make Offer" button
3. Enters offer price (USD)
4. Optionally adds message to seller
5. Submits offer
6. Owner receives notification (via Telegram bot)

**Offer Status:**
- `pending` - Waiting for owner response
- `accepted` - Owner accepted the offer
- `rejected` - Owner declined
- `countered` - Owner proposed different price

**Security (RLS Policies):**
- Buyers can create and view their own offers
- Owners can view offers on their diamonds
- Owners can update offer status
- All authenticated via Telegram session context

---

### 3. **Diamond Share Analytics Dashboard**
Track performance of shared diamonds (5 active shares limit).

**Access:** `/analytics/shares`

**Metrics Tracked:**
- **Total Views**: How many times diamond was viewed
- **Unique Viewers**: Number of different people who viewed
- **Average Time Spent**: How long viewers engaged
- **Re-shares**: How many times diamond was re-shared
- **Last Viewed**: Most recent viewing timestamp

**Dashboard Layout:**
```
┌─────────────────────────────────────────┐
│  Overview Stats (4 cards)               │
│  • Total Views | Unique Viewers         │
│  • Avg Time | Re-shares                 │
├─────────────────────────────────────────┤
│  Individual Diamond Cards               │
│  ┌─────────┬──────────────────────┐    │
│  │ Image   │ Analytics Details    │    │
│  │         │ - Views: 45          │    │
│  │         │ - Avg Time: 2m 30s   │    │
│  │         │ - Re-shares: 3       │    │
│  │         │ - Last View: 2h ago  │    │
│  └─────────┴──────────────────────┘    │
└─────────────────────────────────────────┘
```

**Share Limit:**
- **5 active shares** per user
- Deactivate old shares to track new ones
- Admin (owner) has unlimited shares

---

### 4. **Contact Seller**
Direct communication channel between buyer and seller.

**Methods:**
1. **Telegram Share URL**: Opens Telegram with pre-filled message
2. **Clipboard Fallback**: Copies contact message if Telegram unavailable

**Message Template:**
```
💎 I'm interested in your diamond!

📋 Stock #: {stockNumber}
⚖️ Weight: {carat}ct
🔸 Shape: {shape}
🎨 Color: {color}
💎 Clarity: {clarity}
💰 Price: ${price}

Can we discuss this further?
```

---

### 5. **Analytics Tracking**
Automatic tracking of viewer behavior and engagement.

**Tracked Events:**
- **View Start**: When user opens diamond
- **View Duration**: How long they engaged
- **Device Type**: Mobile vs Desktop
- **Interactions**: Zoom, rotate, offer actions
- **User Agent**: Browser/app information
- **Referrer**: Where they came from

**Database Tables:**
- `diamond_views` - Individual view sessions
- `diamond_share_analytics` - Aggregated metrics
- `diamond_offers` - Offer submissions

---

## 📊 For Diamond Owners

### How to Share Diamonds

1. **From Store/Catalog:**
   - Find your diamond
   - Click "Share to Group" button
   - Select Telegram group
   - Diamond shared with analytics tracking enabled

2. **View Analytics:**
   - Navigate to `/analytics/shares`
   - See all active shared diamonds (limit 5)
   - Track performance metrics in real-time

### Understanding Analytics

**Good Performance Indicators:**
- **High Unique Viewers**: Many different people interested
- **Long Avg Time**: Viewers engaging deeply with diamond
- **Re-shares**: Viewers sharing with their network
- **Multiple Offers**: Strong buyer interest

**Action Items:**
- Deactivate poorly performing shares
- Share high-engagement diamonds to more groups
- Respond quickly to offers
- Update pricing based on engagement data

---

## 📱 For Diamond Buyers

### How to View Diamonds

1. **Browse Catalog:** `/store` or `/catalog`
2. **Click Diamond Card**
3. **Options:**
   - **View Details**: Standard product page
   - **Immersive View**: Full-screen motion-controlled viewing

### Making an Offer

1. Open diamond in immersive viewer
2. Click "Make Offer" button
3. Enter your proposed price
4. Add message explaining offer (optional)
5. Submit
6. Seller will be notified and can respond

### Tips for Best Experience

**Motion Controls:**
- Hold phone naturally, tilt to explore
- Use both hands for stability
- Enable motion sensors if prompted
- Reset view if disoriented

**Offers:**
- Be realistic with pricing
- Explain why you're making lower offer
- Include contact info in message
- Respond quickly if seller counters

---

## 🔧 Technical Implementation

### Motion Sensor Integration

**Priority Order:**
1. **DeviceOrientation** (Best)
   ```typescript
   deviceOrientation.start((data) => {
     rotateX = data.beta; // Front-to-back tilt
     rotateY = data.gamma; // Left-to-right tilt
     rotateZ = data.alpha; // Compass direction
   });
   ```

2. **Gyroscope** (Fallback)
   ```typescript
   gyroscope.start((data) => {
     // Accumulate rotation velocity
     rotation.x += data.x * 0.5;
     rotation.y += data.y * 0.5;
   });
   ```

3. **Accelerometer** (Basic)
   ```typescript
   accelerometer.start((data) => {
     tilt.x = data.x * 10;
     tilt.y = data.y * 10;
   });
   ```

### Pinch-to-Zoom Implementation

```typescript
handleTouchStart(e) {
  if (e.touches.length === 2) {
    // Record initial distance between fingers
    touchStartDistance = distance(touch1, touch2);
  }
}

handleTouchMove(e) {
  if (e.touches.length === 2) {
    currentDistance = distance(touch1, touch2);
    scale = currentDistance / touchStartDistance;
    zoom = clamp(zoom * scale, 1, 3); // 1x to 3x zoom
  }
}
```

### Analytics Session Tracking

```typescript
useEffect(() => {
  const sessionId = crypto.randomUUID();
  const startTime = Date.now();

  // Track view start
  supabase.from('diamond_views').insert({
    diamond_id: stockNumber,
    session_id: sessionId,
    viewer_telegram_id: user.id,
    view_start: new Date()
  });

  // Track duration on unmount
  return () => {
    const duration = (Date.now() - startTime) / 1000;
    supabase.from('diamond_views')
      .update({ total_view_time: duration })
      .eq('session_id', sessionId);
  };
}, [stockNumber]);
```

---

## 🔐 Security & Privacy

### Row-Level Security (RLS)

**diamond_offers:**
- Buyers can create and view their own offers
- Owners can view all offers on their diamonds
- Owners can update offer status
- Uses Telegram session context for auth

**diamond_views:**
- Anyone can insert view analytics
- Owners can view analytics for their diamonds
- Viewers are tracked by Telegram ID (if logged in)

**inventory:**
- Only visible diamonds (`store_visible = true`) shown
- Owners can manage their own diamonds
- Public can view but not modify

### Privacy Considerations

**Tracked Data:**
- ✅ Viewing duration
- ✅ Device type
- ✅ General location (via referrer)
- ❌ NO personal messages stored
- ❌ NO payment info stored

**User Rights:**
- View their own offers
- See what they've viewed
- Request data deletion

---

## 📈 Performance Optimizations

### Image Loading
- Priority loading for visible diamonds
- Lazy loading for below-fold content
- WebP/AVIF compression
- CDN delivery

### Motion Rendering
- 60 FPS via GPU-accelerated CSS transforms
- RequestAnimationFrame for smooth animations
- Debounced sensor readings
- Efficient event listener management

### Analytics
- Batch view updates
- Debounced duration tracking
- Indexed queries for fast lookups
- Cached aggregations

---

## 🚀 Future Enhancements

### Phase 2
- [ ] **Multi-diamond comparison** - View 2-3 side-by-side
- [ ] **360° Video Recording** - Capture rotation clips
- [ ] **Social Sharing to Stories** - Share AR previews
- [ ] **Counter-Offer System** - Negotiate back and forth

### Phase 3
- [ ] **AI-powered inspection** - Highlight cut/clarity features
- [ ] **Virtual try-on** - See diamond on hand/finger
- [ ] **Real-time lighting** - Simulate different conditions
- [ ] **Blockchain certification** - Verify authenticity

### Phase 4
- [ ] **Live auctions** - Real-time bidding
- [ ] **Escrow integration** - Secure payments
- [ ] **Shipping tracking** - Track delivery
- [ ] **Review system** - Buyer/seller ratings

---

## 📞 Support

### Common Issues

**Motion not working:**
1. Check if device has motion sensors
2. Ensure HTTPS connection
3. Grant motion permissions if prompted
4. Try restarting app

**Can't submit offer:**
1. Verify logged in to Telegram
2. Check internet connection
3. Ensure valid price entered
4. Try refreshing page

**Analytics not updating:**
1. Wait a few seconds for sync
2. Refresh analytics page
3. Verify diamonds are marked `store_visible`
4. Check RLS policies are correct

---

## 🎓 Best Practices

### For Developers
1. Always check sensor availability before enabling
2. Provide clear fallbacks for unsupported devices
3. Clean up sensors on component unmount
4. Use haptic feedback for better UX
5. Test on real devices (not simulators)

### For Business
1. Feature-flag motion viewers for gradual rollout
2. A/B test motion vs static viewers
3. Monitor engagement metrics closely
4. Gather user feedback on sensitivity
5. Educate users with onboarding

### For Users
1. Hold phone naturally during motion control
2. Use two hands for stability
3. Take time to explore all angles
4. Make reasonable offers
5. Respond quickly to seller messages

---

**Built with ❤️ using Telegram SDK 2.0 Motion APIs**
