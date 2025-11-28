# BrilliantBot - Complete Kickstart Prompt for New Lovable Project

## 🎯 Project Overview

Create a production-ready Telegram Mini App for B2B diamond trading called **BrilliantBot**. This is a mobile-first React application that runs inside Telegram, integrating with a FastAPI backend for diamond inventory management, real-time notifications, auctions, and AI-powered features.

---

## ⚡ CRITICAL: Telegram Mini App Requirements

### 1. Telegram SDK Initialization (NON-NEGOTIABLE)

**MUST use `@telegram-apps/sdk` v3.11.8** with this exact initialization pattern:

```typescript
import { init, viewport, themeParams, miniApp, initData, retrieveLaunchParams } from '@telegram-apps/sdk';

// Initialize SDK
init();

// Mount components
if (viewport.mount.isAvailable()) {
  viewport.mount();
  viewport.expand();
}

if (miniApp.mount.isAvailable()) {
  miniApp.mount();
  miniApp.ready();
}

// Essential settings
miniApp.disableVerticalSwipes();
miniApp.enableClosingConfirmation();

// Listen to theme changes
themeParams.on('change', () => {
  // Update CSS variables dynamically
});
```

**Create hook: `src/hooks/useTelegramSDK.ts`** that handles:
- SDK initialization on mount
- Theme synchronization (Telegram themeParams → CSS variables)
- Viewport management (expand, safe area insets)
- Back button handling
- Haptic feedback wrapper
- Cloud Storage access

### 2. Authentication Flow (CRITICAL FOR ALL API CALLS)

**Backend endpoint:** `POST https://api.mazalbot.com/api/v1/sign-in/`

**Authentication sequence:**
1. Extract `initData` from `window.Telegram.WebApp.initData`
2. If `initData` is empty/missing → Show blocking error screen: "Please open this app from Telegram"
3. POST to `/api/v1/sign-in/` with `{ init_data: initData }`
4. Backend returns `{ token: "jwt_token", has_subscription: boolean, user: {...} }`
5. Store JWT in memory + localStorage
6. Extract `telegram_id` from JWT payload
7. Call Supabase RPC: `supabase.rpc('set_user_context', { telegram_id: <number> })`
8. ALL subsequent FastAPI calls include header: `Authorization: Bearer <jwt_token>`

**Create these files:**
- `src/lib/api/auth.ts` - Authentication logic
- `src/contexts/AuthContext.tsx` - Auth state management
- `src/components/auth/TelegramAuthGuard.tsx` - Route protection

**Error Handling:**
- If `initData` missing after 3 retries (500ms between) → Block UI with error message
- If `/api/v1/sign-in/` fails → Show detailed error (status code, message, retry button)
- If JWT expires → Auto-refresh or redirect to re-authenticate

### 3. Deep Link Routing (START PARAMETERS)

Telegram deep links use `?startapp=<parameter>` format. Create **`src/hooks/useDeepLinkRouter.ts`** to handle:

```typescript
// Launch params from SDK
const { initData } = retrieveLaunchParams();
const startParam = initData?.startParam;

// Route mappings
switch (startParam) {
  case 'dashboard':
    navigate('/dashboard');
    break;
  case 'notifications':
    navigate('/notifications');
    break;
  case 'store':
    navigate('/store');
    break;
  case startParam?.startsWith('diamond_'):
    // Format: diamond_<stockNumber>_<ownerTelegramId>
    const [_, stockNumber, ownerId] = startParam.split('_');
    navigate(`/public/diamond/${stockNumber}?seller=${ownerId}`);
    break;
  case startParam?.startsWith('auction_'):
    // Format: auction_<auctionId>
    const auctionId = startParam.replace('auction_', '');
    navigate(`/public/auction/${auctionId}`);
    break;
  case startParam?.startsWith('store_'):
    // Format: store_<userId>
    const sellerId = startParam.replace('store_', '');
    navigate(`/store?seller=${sellerId}`);
    break;
}
```

---

## 🏗️ Tech Stack

### Frontend
- **React 18** + **TypeScript** (strict mode)
- **Vite** for build tooling
- **TailwindCSS** + **shadcn/ui** components
- **React Router v6** for routing
- **TanStack Query v5** for server state management
- **@telegram-apps/sdk v3.11.8** for Telegram integration
- **Zod** for validation

### Backend Integration
- **FastAPI** backend at `https://api.mazalbot.com`
- **Supabase** for:
  - Database (PostgreSQL with RLS)
  - Edge Functions (Telegram bot messaging)
  - Storage (diamond images, certificates)
  - Realtime (auction bids, notifications)

### AI Integration
- **Lovable Cloud AI** for:
  - Diamond chat assistant
  - Buyer message generation
  - Pricing recommendations
- **n8n MCP** (optional) for workflow automation

---

## 🔌 FastAPI Backend Integration

### Base Configuration

**Create `src/lib/api/config.ts`:**
```typescript
export const API_BASE_URL = "https://api.mazalbot.com";

export function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem('jwt_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
}
```

### Authentication Endpoint

**POST `/api/v1/sign-in/`**
- Request: `{ init_data: string }`
- Response: `{ token: string, has_subscription: boolean, user: { telegram_id: number, first_name: string, last_name?: string, username?: string } }`

### Diamond CRUD Endpoints

**GET `/api/v1/get_all_stones`**
- Returns: `DiamondDataSchema[]`
- Query params: None (user inferred from JWT)

**POST `/api/v1/diamonds`**
- Request body: `DiamondCreateRequest` (snake_case)
```json
{
  "stock": "D12345",
  "shape": "Round",
  "weight": 1.50,
  "color": "D",
  "clarity": "VVS1",
  "cut": "Excellent",
  "polish": "Excellent",
  "symmetry": "Excellent",
  "fluorescence": "None",
  "lab": "GIA",
  "certificate_number": 123456789,
  "certificate_url": "https://...",
  "price_per_carat": 8000,
  "picture": "https://...",
  "video_url": "https://...",
  "v360_url": "https://...",
  "culet": "None",
  "depth_percentage": 61.5,
  "table_percentage": 57.0,
  "measurements": "7.40 x 7.43 x 4.56"
}
```

**PUT `/api/v1/diamonds/{diamond_id}`**
- Path param: `diamond_id` (integer)
- Request body: `DiamondUpdateRequest` (partial, snake_case)

**DELETE `/api/v1/delete_stone/{diamond_id}`**
- Path param: `diamond_id` (integer)
- Returns: `{ message: "Diamond deleted successfully" }`

**POST `/api/v1/diamonds/batch`**
- Request body: `{ diamonds: DiamondCreateRequest[] }`
- Returns: `{ created: number, failed: number, errors: any[] }`

### Notification Endpoints

**GET `/api/v1/get_search_results`**
- Returns: `SearchResultSchema[]` (buyer matches)
- Query params: `limit`, `offset`

**GET `/api/v1/get_search_results_count`**
- Returns: `{ count: number }`

### Billing Endpoints

**POST `/api/v1/payment_request`**
- Request: `{ amount: number, currency: string, description: string }`
- Returns: `{ payment_url: string, invoice_id: string }`

---

## 🔄 Data Transformation Layer (CRITICAL)

**Frontend uses camelCase, Backend expects snake_case.**

**Create `src/lib/api/transformers.ts`:**

```typescript
// Frontend diamond type (camelCase)
export interface DiamondFormData {
  stockNumber: string;
  shape: string;
  weight: number;
  color: string;
  clarity: string;
  cut?: string;
  polish?: string;
  symmetry?: string;
  fluorescence?: string;
  certificateNumber?: number;
  certificateUrl?: string;
  pricePerCarat?: number;
  picture?: string;
  videoUrl?: string;
  v360Url?: string;
  // ... other fields
}

// Backend request type (snake_case)
export interface DiamondCreateRequest {
  stock: string;
  shape: string;
  weight: number;
  color: string;
  clarity: string;
  cut?: string;
  polish?: string;
  symmetry?: string;
  fluorescence?: string;
  certificate_number?: number;
  certificate_url?: string;
  price_per_carat?: number;
  picture?: string;
  video_url?: string;
  v360_url?: string;
  // ... other fields
}

// Transform frontend → backend
export function transformToFastAPICreate(data: DiamondFormData): DiamondCreateRequest {
  return {
    stock: data.stockNumber,
    shape: data.shape,
    weight: data.weight,
    color: data.color,
    clarity: data.clarity,
    cut: data.cut,
    polish: data.polish,
    symmetry: data.symmetry,
    fluorescence: data.fluorescence,
    certificate_number: data.certificateNumber,
    certificate_url: data.certificateUrl,
    price_per_carat: data.pricePerCarat,
    picture: data.picture,
    video_url: data.videoUrl,
    v360_url: data.v360Url,
    // ... map all fields
  };
}

// Transform backend → frontend
export function transformFromFastAPI(data: any): DiamondFormData {
  return {
    stockNumber: data.stock,
    shape: data.shape,
    weight: data.weight,
    color: data.color,
    clarity: data.clarity,
    cut: data.cut,
    polish: data.polish,
    symmetry: data.symmetry,
    fluorescence: data.fluorescence,
    certificateNumber: data.certificate_number,
    certificateUrl: data.certificate_url,
    pricePerCarat: data.price_per_carat,
    picture: data.picture,
    videoUrl: data.video_url,
    v360Url: data.v360_url,
    // ... map all fields
  };
}
```

---

## 📄 Page Structure & Routes

### Public Routes (No Auth Required)

**`/public/diamond/:stockNumber`**
- Display single diamond details
- Query param: `?seller=<telegram_id>`
- Features: Image gallery, certificate view, price, specs, contact button
- Shareable via Telegram deep links

**`/public/auction/:auctionId`**
- Live auction page with real-time bidding
- Shows: current price, countdown timer, bid history, spectator count
- Inline bid buttons (web_app format)

**`/blocked`**
- Shown to blocked users
- Message: "Your account is blocked. Contact admin to regain access."
- Button: "Contact Admin" → Opens Telegram chat with admin

### Protected Routes (Auth Required)

**`/dashboard`** (Home)
- **Dealer-Focused Layout (NOT analytics-heavy)**
- Section 1: "Buyer Demand NOW" → Horizontal carousel of recent search queries
- Section 2: "New Matches" → Cards of diamonds that match buyer searches
- Section 3: "Action Alerts" → Missing photos, pricing issues, expiring auctions
- Section 4: "Recent Opportunities" → Last 5 high-value matches
- Bottom Navigation: Dashboard, Inventory, Notifications, Store, AI Chat

**`/inventory`**
- Tabs: "My Diamonds" | "Add Single" | "Bulk Upload"
- Display modes: Card Grid | Table View (toggle button)
- Features: Search, filters (shape, color, clarity, price range), sort
- Actions per diamond: Edit, Delete, Share to Group, Share to Story, Create Auction
- Bulk actions: Delete selected, Update prices
- Mobile-optimized: Fixed viewport, bottom sheet for filters

**`/inventory/add`**
- Form with all diamond fields
- Client-side validation (Zod schema)
- Image upload to Supabase Storage
- On submit → Transform to snake_case → POST `/api/v1/diamonds`
- Success → Toast + Navigate to `/inventory`
- Error → Detailed toast (status code, error message, request body first 500 chars)

**`/inventory/edit/:id`**
- Pre-fill form with existing diamond data
- Same validation as add form
- On submit → PUT `/api/v1/diamonds/{diamond_id}`
- Handle 404 (diamond not found), 403 (not owner)

**`/inventory/bulk-upload`**
- CSV/Excel file upload
- Preview table before submission
- Validation: Required fields, enum values, numeric ranges
- Progress bar during batch upload
- Summary: "X diamonds created, Y failed"
- Failed records displayed with error reasons

**`/notifications`**
- List of buyer search matches
- Each card shows: Buyer name, search criteria, matched diamonds (carousel)
- Action buttons: "Generate Message" (AI), "Send to Telegram", "Dismiss"
- Real-time updates via Supabase Realtime
- Pagination: Load more on scroll

**`/store`**
- Public-facing dealer store
- Shows only diamonds with `store_visible: true`
- Filterable catalog
- Share button → Generates deep link `?startapp=store_<userId>`
- Can be embedded in Telegram groups

**`/auctions`**
- List of active/past auctions
- Create new auction button
- Filters: Active, Ended, My Auctions
- Sorting: End date, current price, bid count

**`/auctions/create`**
- Select diamond from inventory
- Set starting price, min increment, duration
- Preview auction card
- On submit → Supabase RPC `create_auction_with_context`
- Automatically shares to B2B group via edge function

**`/ai-chat`**
- Diamond expertise chatbot
- Uses Lovable Cloud AI
- Context: User's inventory, market trends
- Features: Diamond valuation, pricing suggestions, market insights

### Admin Routes (Role-Based)

**`/admin/users`**
- User list with stats
- Actions: Block, Delete, View Profile
- Search by telegram_id, name

**`/admin/analytics`**
- User metrics, revenue, growth charts
- Diamond distribution (shape, color, clarity)
- Auction performance
- Top dealers

---

## 🎨 Core Features Implementation

### 1. Diamond CRUD (Priority 1)

**React Query Hooks (`src/hooks/api/useDiamonds.ts`):**

```typescript
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { transformToFastAPICreate, transformFromFastAPI } from '@/lib/api/transformers';

export function useDiamonds() {
  return useQuery({
    queryKey: ['diamonds'],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/api/v1/get_all_stones`, {
        headers: getAuthHeaders()
      });
      if (!response.ok) throw new Error('Failed to fetch diamonds');
      const data = await response.json();
      return data.map(transformFromFastAPI);
    }
  });
}

export function useCreateDiamond() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (formData: DiamondFormData) => {
      const payload = transformToFastAPICreate(formData);
      const response = await fetch(`${API_BASE_URL}/api/v1/diamonds`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload)
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API Error ${response.status}: ${errorText}`);
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['diamonds'] });
      // Show success toast
      // Trigger haptic feedback: miniApp.hapticFeedback.notificationOccurred('success')
    },
    onError: (error) => {
      // Show detailed error toast with status, message, request body
    }
  });
}

export function useUpdateDiamond() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<DiamondFormData> }) => {
      const payload = transformToFastAPICreate(data as DiamondFormData);
      const response = await fetch(`${API_BASE_URL}/api/v1/diamonds/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload)
      });
      if (!response.ok) throw new Error('Failed to update diamond');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['diamonds'] });
    }
  });
}

export function useDeleteDiamond() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (diamondId: number) => {
      const response = await fetch(`${API_BASE_URL}/api/v1/delete_stone/${diamondId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      if (!response.ok) throw new Error('Failed to delete diamond');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['diamonds'] });
      // Show success toast + haptic feedback
    },
    onError: (error) => {
      // Show error toast with details
    }
  });
}
```

**Best Practices:**
- NO optimistic updates (caused desync issues in old project)
- Always refetch after mutations
- Show loading states (skeleton, spinner)
- Haptic feedback on success/error
- Detailed error toasts

### 2. Diamond Display Components

**`src/components/diamonds/DiamondCard.tsx`**
- Compact card view for mobile
- Image with fallback
- Key specs: carat, shape, color, clarity, price
- Action buttons: Edit, Delete, Share
- Long-press → Quick actions menu

**`src/components/diamonds/DiamondTable.tsx`**
- Table view for desktop/tablet
- Sortable columns
- Row selection for bulk actions
- Virtualized for large lists (react-window)

**`src/components/diamonds/DiamondFilters.tsx`**
- Collapsible filter panel
- Filters: Shape (multi-select), Color range, Clarity range, Price range, Carat range
- "Clear All" button
- Apply filters → Update URL query params

**`src/components/diamonds/DiamondForm.tsx`**
- Reusable form for Add/Edit
- Zod validation schema
- Image upload with preview
- Enum dropdowns (Shape, Color, Clarity, Cut, Polish, Symmetry)
- Certificate number input
- Price calculator (price per carat × weight)

### 3. Telegram Sharing Features

**Share to Group (`src/hooks/useTelegramSharing.ts`):**

```typescript
export function useShareToGroup() {
  return async (diamond: Diamond) => {
    // Call Supabase Edge Function
    const { data, error } = await supabase.functions.invoke('send-diamond-to-group', {
      body: {
        diamonds: [{
          stock_number: diamond.stockNumber,
          shape: diamond.shape,
          carat: diamond.weight,
          color: diamond.color,
          clarity: diamond.clarity,
          cut: diamond.cut,
          price: diamond.pricePerCarat * diamond.weight,
          picture: diamond.picture,
          certificate_url: diamond.certificateUrl
        }],
        group_id: -1001234567890, // B2B_GROUP_ID from secrets
        seller_telegram_id: currentUserId
      }
    });
    
    if (error) {
      // Show error toast
      return;
    }
    
    // Success toast + haptic feedback
  };
}
```

**Share to Story (Telegram 7.2+):**

```typescript
import { shareStory } from '@telegram-apps/sdk';

export function useShareToStory() {
  return async (diamond: Diamond) => {
    if (!shareStory.isAvailable()) {
      toast({
        title: "Update Required",
        description: "Story sharing requires Telegram 7.2+. Please update your app.",
        variant: "destructive"
      });
      return;
    }
    
    const deepLink = `https://t.me/${BOT_USERNAME}?startapp=diamond_${diamond.stockNumber}_${currentUserId}`;
    
    await shareStory(diamond.picture, {
      text: `💎 ${diamond.weight}ct ${diamond.shape} - $${(diamond.pricePerCarat * diamond.weight).toLocaleString()}`,
      widgetLink: {
        url: deepLink,
        name: "View Diamond"
      }
    });
    
    // Track story share in analytics
  };
}
```

**Deep Links:**
- Format: `https://t.me/{bot_username}?startapp=<parameter>`
- Handled by `useDeepLinkRouter` hook on app mount

### 4. Notifications Page

**`src/pages/NotificationsPage.tsx`**
- Fetch buyer matches: GET `/api/v1/get_search_results`
- Display cards with buyer info + matched diamonds
- "Generate Message" button → Calls Supabase Edge Function `generate-buyer-message`
- "Send to Telegram" button → Calls `send-rich-diamond-message` edge function
- Real-time updates via Supabase Realtime subscription

**`src/components/notifications/BuyerMatchCard.tsx`**
- Buyer name, search criteria
- Matched diamonds carousel (horizontal scroll)
- Action buttons
- Message preview (if generated)

### 5. Auction System

**Database Schema (Supabase):**

```sql
-- auctions table
CREATE TABLE auctions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stock_number TEXT NOT NULL,
  starting_price NUMERIC NOT NULL,
  current_price NUMERIC NOT NULL,
  min_increment NUMERIC NOT NULL,
  currency TEXT DEFAULT 'USD',
  starts_at TIMESTAMPTZ DEFAULT now(),
  ends_at TIMESTAMPTZ NOT NULL,
  status TEXT DEFAULT 'active', -- active, ended, cancelled
  seller_telegram_id BIGINT NOT NULL,
  winner_telegram_id BIGINT,
  bid_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- auction_diamonds (immutable snapshot)
CREATE TABLE auction_diamonds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auction_id UUID REFERENCES auctions(id) ON DELETE CASCADE,
  stock_number TEXT NOT NULL,
  shape TEXT,
  weight NUMERIC,
  color TEXT,
  clarity TEXT,
  cut TEXT,
  picture TEXT,
  certificate_url TEXT,
  price_per_carat NUMERIC,
  total_price NUMERIC,
  -- ... other diamond fields
  created_at TIMESTAMPTZ DEFAULT now()
);

-- auction_bids
CREATE TABLE auction_bids (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auction_id UUID REFERENCES auctions(id) ON DELETE CASCADE,
  bidder_telegram_id BIGINT NOT NULL,
  bid_amount NUMERIC NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- auction_presence (real-time spectators)
CREATE TABLE auction_presence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auction_id UUID NOT NULL,
  telegram_id BIGINT NOT NULL,
  joined_at TIMESTAMPTZ DEFAULT now(),
  last_heartbeat TIMESTAMPTZ DEFAULT now()
);

-- auction_reactions
CREATE TABLE auction_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auction_id UUID NOT NULL,
  telegram_id BIGINT NOT NULL,
  reaction_type TEXT NOT NULL, -- fire, heart, eyes, clap
  created_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ DEFAULT (now() + interval '5 seconds')
);
```

**RLS Policies:**
- Use `get_current_user_telegram_id()` function
- Insert auctions: `seller_telegram_id = get_current_user_telegram_id()`
- Insert bids: Anyone can bid (public)
- Update auction price: Only via RPC function (atomic operation)

**RPC Function for Auction Creation:**

```sql
CREATE OR REPLACE FUNCTION create_auction_with_context(
  p_stock_number TEXT,
  p_starting_price NUMERIC,
  p_min_increment NUMERIC,
  p_currency TEXT,
  p_ends_at TIMESTAMPTZ,
  p_seller_telegram_id BIGINT,
  -- Diamond snapshot fields
  p_diamond_shape TEXT,
  p_diamond_weight NUMERIC,
  p_diamond_color TEXT,
  p_diamond_clarity TEXT,
  p_diamond_cut TEXT,
  p_diamond_picture TEXT,
  p_diamond_certificate_url TEXT,
  p_diamond_price_per_carat NUMERIC
) RETURNS JSON AS $$
DECLARE
  v_auction_id UUID;
BEGIN
  -- Set user context for RLS
  PERFORM set_config('app.current_user_id', p_seller_telegram_id::text, false);
  
  -- Insert auction
  INSERT INTO auctions (
    stock_number, starting_price, current_price, min_increment, 
    currency, ends_at, seller_telegram_id
  ) VALUES (
    p_stock_number, p_starting_price, p_starting_price, p_min_increment,
    p_currency, p_ends_at, p_seller_telegram_id
  ) RETURNING id INTO v_auction_id;
  
  -- Insert diamond snapshot
  INSERT INTO auction_diamonds (
    auction_id, stock_number, shape, weight, color, clarity, cut,
    picture, certificate_url, price_per_carat, total_price
  ) VALUES (
    v_auction_id, p_stock_number, p_diamond_shape, p_diamond_weight,
    p_diamond_color, p_diamond_clarity, p_diamond_cut, p_diamond_picture,
    p_diamond_certificate_url, p_diamond_price_per_carat,
    p_diamond_price_per_carat * p_diamond_weight
  );
  
  -- Return auction data
  RETURN (SELECT row_to_json(auctions) FROM auctions WHERE id = v_auction_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

**Auction Real-Time Features:**
- Supabase Realtime subscription on `auction_bids` table
- Update UI instantly when new bid arrives
- Spectator count via Presence (Supabase Realtime Presence API)
- Reactions via `auction_reactions` table + Realtime

**`src/pages/PublicAuctionPage.tsx`:**
- Real-time bid updates
- Countdown timer (with auto-extend if bids in last 5 min)
- Bid button → Calls Telegram bot callback (via webhook)
- Spectator avatars
- Reaction floating animations

### 6. AI Integration

**Lovable Cloud AI Chat Assistant (`src/pages/AIChatPage.tsx`):**

```typescript
import { useChat } from '@ai-sdk/react';

export function AIChatPage() {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: '/api/ai/chat', // Lovable Cloud AI endpoint
    initialMessages: [{
      role: 'system',
      content: 'You are a diamond expert assistant. Help users with diamond valuation, pricing, and market insights.'
    }]
  });
  
  return (
    <div className="flex flex-col h-screen">
      <div className="flex-1 overflow-y-auto p-4">
        {messages.map(msg => (
          <div key={msg.id} className={msg.role === 'user' ? 'text-right' : 'text-left'}>
            <div className="inline-block bg-muted p-3 rounded-lg">
              {msg.content}
            </div>
          </div>
        ))}
      </div>
      <form onSubmit={handleSubmit} className="p-4 border-t">
        <input
          value={input}
          onChange={handleInputChange}
          placeholder="Ask about diamonds..."
          className="w-full p-2 border rounded"
          disabled={isLoading}
        />
      </form>
    </div>
  );
}
```

**AI Message Generation (Edge Function):**

```typescript
// supabase/functions/generate-buyer-message/index.ts
import { createClient } from '@supabase/supabase-js';

Deno.serve(async (req) => {
  const { diamonds, buyerName, searchQuery } = await req.json();
  
  // Call Lovable Cloud AI
  const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${Deno.env.get('LOVABLE_API_KEY')}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [{
        role: 'system',
        content: 'Generate a warm, professional Hebrew message for a diamond dealer to send to a buyer.'
      }, {
        role: 'user',
        content: `Buyer: ${buyerName}\nSearch: ${searchQuery}\nMatching diamonds: ${JSON.stringify(diamonds)}`
      }]
    })
  });
  
  const data = await response.json();
  const message = data.choices[0].message.content;
  
  return new Response(JSON.stringify({ message }), {
    headers: { 'Content-Type': 'application/json' }
  });
});
```

---

## 🎨 UI/UX Requirements

### Mobile-First Telegram Design

**CSS Base (`src/index.css`):**

```css
:root {
  /* Telegram theme colors (from SDK) */
  --tg-theme-bg-color: #ffffff;
  --tg-theme-text-color: #000000;
  --tg-theme-hint-color: #999999;
  --tg-theme-link-color: #2481cc;
  --tg-theme-button-color: #2481cc;
  --tg-theme-button-text-color: #ffffff;
  
  /* Custom semantic tokens */
  --background: 0 0% 100%;
  --foreground: 0 0% 0%;
  --primary: 210 100% 47%;
  --primary-foreground: 0 0% 100%;
  /* ... rest of shadcn tokens */
}

html, body, #root {
  height: 100vh;
  overflow: hidden;
  margin: 0;
  padding: 0;
}

#root {
  display: flex;
  flex-direction: column;
}

/* Telegram safe area insets */
body {
  padding-top: env(safe-area-inset-top);
  padding-bottom: env(safe-area-inset-bottom);
}

.main-content {
  flex: 1;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}
```

**Dynamic Theme Sync:**

```typescript
import { themeParams } from '@telegram-apps/sdk';

themeParams.on('change', () => {
  const root = document.documentElement;
  root.style.setProperty('--tg-theme-bg-color', themeParams.backgroundColor());
  root.style.setProperty('--tg-theme-text-color', themeParams.textColor());
  // ... sync all theme params
});
```

### Haptic Feedback

**Wrapper function (`src/lib/telegram/haptics.ts`):**

```typescript
import { miniApp } from '@telegram-apps/sdk';

export const haptics = {
  light: () => miniApp.hapticFeedback.impactOccurred('light'),
  medium: () => miniApp.hapticFeedback.impactOccurred('medium'),
  heavy: () => miniApp.hapticFeedback.impactOccurred('heavy'),
  success: () => miniApp.hapticFeedback.notificationOccurred('success'),
  error: () => miniApp.hapticFeedback.notificationOccurred('error'),
  warning: () => miniApp.hapticFeedback.notificationOccurred('warning'),
  selection: () => miniApp.hapticFeedback.selectionChanged()
};
```

**Usage:**
- Button click → `haptics.light()`
- Form submit success → `haptics.success()`
- Delete action → `haptics.heavy()`
- Error → `haptics.error()`
- Tab switch → `haptics.selection()`

### Bottom Navigation

**`src/components/layout/BottomNav.tsx`:**
- Fixed position at bottom
- 5 items max: Dashboard, Inventory, Notifications, Store, AI Chat
- Active state styling
- Haptic feedback on tap
- Safe area inset padding

---

## 🗄️ Database Schema (Supabase)

### Core Tables

```sql
-- user_profiles
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  telegram_id BIGINT UNIQUE NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT,
  username TEXT,
  phone_number TEXT,
  is_premium BOOLEAN DEFAULT false,
  has_active_subscription BOOLEAN DEFAULT false,
  subscription_expires_at TIMESTAMPTZ,
  trial_expires_at TIMESTAMPTZ DEFAULT (now() + interval '7 days'),
  shares_remaining INTEGER DEFAULT 5,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  last_active TIMESTAMPTZ
);

-- auctions (defined above)
-- auction_diamonds (defined above)
-- auction_bids (defined above)
-- auction_presence (defined above)
-- auction_reactions (defined above)

-- admin_roles
CREATE TABLE admin_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  telegram_id BIGINT UNIQUE NOT NULL,
  role TEXT DEFAULT 'admin', -- admin, super_admin
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  created_by TEXT
);
```

### RLS Policies

**Enable RLS on all tables:**

```sql
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE auctions ENABLE ROW LEVEL SECURITY;
-- ... enable for all tables
```

**Key policies:**

```sql
-- user_profiles: Users can view/update their own profile
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (telegram_id = get_current_user_telegram_id());

CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (telegram_id = get_current_user_telegram_id());

-- auctions: Anyone can view, only seller can create
CREATE POLICY "Anyone can view auctions" ON auctions
  FOR SELECT USING (true);

CREATE POLICY "Sellers can create auctions" ON auctions
  FOR INSERT WITH CHECK (seller_telegram_id = get_current_user_telegram_id());

-- auction_bids: Anyone can view/insert (public bidding)
CREATE POLICY "Anyone can view bids" ON auction_bids
  FOR SELECT USING (true);

CREATE POLICY "Anyone can place bids" ON auction_bids
  FOR INSERT WITH CHECK (true);
```

**Helper functions:**

```sql
-- Extract telegram_id from session context
CREATE OR REPLACE FUNCTION get_current_user_telegram_id() 
RETURNS BIGINT AS $$
  SELECT COALESCE(
    (current_setting('app.current_user_id', true))::bigint,
    0
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Set user context (called after JWT validation)
CREATE OR REPLACE FUNCTION set_user_context(telegram_id BIGINT)
RETURNS VOID AS $$
BEGIN
  PERFORM set_config('app.current_user_id', telegram_id::text, false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

## 📨 Edge Functions (Supabase)

### 1. `send-diamond-to-group`

**Purpose:** Send diamond card to Telegram group with inline buttons

**Endpoint:** `supabase.functions.invoke('send-diamond-to-group', { body })`

**Request:**
```json
{
  "diamonds": [{
    "stock_number": "D12345",
    "shape": "Round",
    "carat": 1.50,
    "color": "D",
    "clarity": "VVS1",
    "cut": "Excellent",
    "price": 12000,
    "picture": "https://...",
    "certificate_url": "https://..."
  }],
  "group_id": -1001234567890,
  "seller_telegram_id": 123456789
}
```

**Logic:**
- Use Telegram Bot API: `sendPhoto` with `caption` and `reply_markup`
- Inline buttons use `web_app` format (NOT `url` with `?startapp=`)
- Button URL: `https://mazalbot.app/public/diamond/{stockNumber}?seller={sellerId}`

**Example button:**
```typescript
{
  inline_keyboard: [[
    { 
      text: "💎 View Details", 
      web_app: { url: `${WEBAPP_URL}/public/diamond/${diamond.stock_number}?seller=${seller_telegram_id}` }
    },
    { 
      text: "📞 Contact", 
      url: `https://t.me/${BOT_USERNAME}?start=contact_${seller_telegram_id}` 
    }
  ]]
}
```

### 2. `send-rich-diamond-message`

**Purpose:** Send personalized message to individual buyer with diamond carousel

**Request:**
```json
{
  "buyer_telegram_id": 987654321,
  "message": "Hi John, I have these diamonds matching your search...",
  "diamonds": [...]
}
```

**Logic:**
- Use `sendMessage` with HTML formatting
- Include diamond images as media group
- Inline buttons for each diamond

### 3. `generate-buyer-message`

**Purpose:** AI-generated personalized message for buyer

**Request:**
```json
{
  "buyer_name": "John Doe",
  "search_query": "1.5ct Round D VVS1",
  "diamonds": [...]
}
```

**Response:**
```json
{
  "message": "שלום ג'ון,\n\nמצאתי עבורך יהלומים מתאימים...",
  "diamonds_with_images": [...],
  "total_value": 50000
}
```

### 4. `send-auction-message`

**Purpose:** Share auction to Telegram group with bid buttons

**Request:**
```json
{
  "auction_id": "uuid",
  "group_id": -1001234567890,
  "diamond": {...},
  "starting_price": 10000,
  "ends_at": "2025-01-15T18:00:00Z"
}
```

**Logic:**
- Inline bid buttons (increments: +$100, +$500, +$1000)
- Button callback_data: `bid_<auctionId>_<amount>`
- Countdown in message caption (updated every minute via edit)

### 5. `telegram-webhook`

**Purpose:** Handle Telegram bot callbacks (bids, reactions, interactions)

**Setup:**
- Set webhook URL: `https://<project-ref>.supabase.co/functions/v1/telegram-webhook`
- Verify requests with `TELEGRAM_WEBHOOK_SECRET`

**Handles:**
- `callback_query` for bid buttons
- Process bid → Insert into `auction_bids` → Update auction price
- Send confirmation message to bidder
- Edit original auction message with new price

---

## 🚨 Error Handling (CRITICAL)

### NO SILENT FAILURES

**Every operation must show detailed feedback:**

**Success toast:**
```typescript
toast({
  title: "✅ Diamond Created",
  description: `Stock #${diamond.stockNumber} added successfully`,
});
haptics.success();
```

**Error toast (with debugging info):**
```typescript
toast({
  title: "❌ Failed to Create Diamond",
  description: (
    <div className="space-y-2 text-xs">
      <p><strong>Error:</strong> {error.message}</p>
      <p><strong>Status:</strong> {response.status}</p>
      <p><strong>URL:</strong> {requestUrl}</p>
      <details>
        <summary>Request Body</summary>
        <pre className="mt-2 overflow-auto max-h-32">
          {JSON.stringify(requestBody, null, 2).slice(0, 500)}...
        </pre>
      </details>
    </div>
  ),
  variant: "destructive",
  duration: 10000 // Longer duration for errors
});
haptics.error();
```

**Network error handling:**
```typescript
try {
  const response = await fetch(url, options);
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`HTTP ${response.status}: ${errorText}`);
  }
  
  const data = await response.json();
  return data;
} catch (error) {
  console.error('❌ API Error:', {
    url,
    method: options.method,
    body: options.body,
    error: error.message
  });
  
  // Show detailed toast (as above)
  throw error;
}
```

**Loading states:**
- Skeleton loaders (not spinners for large lists)
- Disable buttons during mutations
- Show progress for bulk operations

---

## 📁 Suggested File Structure

```
src/
├── components/
│   ├── auth/
│   │   ├── TelegramAuthGuard.tsx
│   │   └── BlockedUserScreen.tsx
│   ├── diamonds/
│   │   ├── DiamondCard.tsx
│   │   ├── DiamondTable.tsx
│   │   ├── DiamondFilters.tsx
│   │   ├── DiamondForm.tsx
│   │   └── DiamondGallery.tsx
│   ├── auctions/
│   │   ├── AuctionCard.tsx
│   │   ├── AuctionCountdown.tsx
│   │   ├── AuctionBidButton.tsx
│   │   ├── AuctionPresence.tsx
│   │   └── AuctionReactions.tsx
│   ├── notifications/
│   │   ├── BuyerMatchCard.tsx
│   │   └── DiamondCarousel.tsx
│   ├── layout/
│   │   ├── BottomNav.tsx
│   │   ├── AppLayout.tsx
│   │   └── PageHeader.tsx
│   └── ui/ (shadcn components)
├── pages/
│   ├── DashboardPage.tsx
│   ├── InventoryPage.tsx
│   ├── NotificationsPage.tsx
│   ├── StorePage.tsx
│   ├── AIChatPage.tsx
│   ├── AuctionsPage.tsx
│   ├── PublicDiamondPage.tsx
│   ├── PublicAuctionPage.tsx
│   └── admin/
│       ├── UsersPage.tsx
│       └── AnalyticsPage.tsx
├── hooks/
│   ├── useTelegramSDK.ts
│   ├── useDeepLinkRouter.ts
│   ├── useTelegramSharing.ts
│   ├── useHaptics.ts
│   └── api/
│       ├── useDiamonds.ts
│       ├── useNotifications.ts
│       ├── useAuctions.ts
│       └── useBilling.ts
├── lib/
│   ├── api/
│   │   ├── config.ts
│   │   ├── auth.ts
│   │   ├── transformers.ts
│   │   └── endpoints.ts
│   ├── telegram/
│   │   ├── haptics.ts
│   │   ├── theme.ts
│   │   └── deepLinks.ts
│   └── utils.ts
├── contexts/
│   ├── AuthContext.tsx
│   └── TelegramContext.tsx
├── types/
│   ├── diamond.ts
│   ├── auction.ts
│   └── api.ts
└── App.tsx
```

---

## 🔧 Implementation Order (Recommended)

### Phase 1: Foundation (Week 1)
1. **Telegram SDK Setup**
   - Install `@telegram-apps/sdk`
   - Create `useTelegramSDK.ts` hook
   - Implement theme sync, viewport management
2. **Authentication**
   - Implement `/api/v1/sign-in/` integration
   - Create `AuthContext` and `TelegramAuthGuard`
   - Add Supabase RLS context setting
3. **Layout & Navigation**
   - Create `AppLayout` with bottom nav
   - Implement deep link router
   - Add haptic feedback wrapper

### Phase 2: Diamond Management (Week 2)
1. **API Integration**
   - Create data transformers (camelCase ↔ snake_case)
   - Implement TanStack Query hooks for CRUD
   - Add error handling with detailed toasts
2. **Inventory Page**
   - Diamond card/table views
   - Filters and sorting
   - Add/Edit forms with validation
3. **Bulk Upload**
   - CSV parser
   - Batch create API call
   - Progress tracking

### Phase 3: Store & Sharing (Week 3)
1. **Public Diamond Page**
   - Image gallery
   - Specs display
   - Contact button (opens Telegram chat)
2. **Telegram Sharing**
   - Share to group (edge function)
   - Share to story (SDK 7.2+)
   - Deep link generation
3. **Store Page**
   - Public dealer catalog
   - Filters
   - Share button

### Phase 4: Notifications & AI (Week 4)
1. **Notifications Page**
   - Fetch buyer matches
   - Diamond carousel
   - AI message generation
2. **AI Chat Assistant**
   - Lovable Cloud AI integration
   - Chat UI with message history
   - Context: user inventory + market data
3. **Send to Telegram**
   - Rich message with carousel
   - Individual buyer messaging

### Phase 5: Auctions (Week 5)
1. **Auction Creation**
   - Form + diamond selection
   - Supabase RPC function
   - Share to group
2. **Public Auction Page**
   - Real-time bid updates (Supabase Realtime)
   - Countdown timer
   - Spectator presence
3. **Auction Mechanics**
   - Bid button callbacks (webhook)
   - Auto-extend on late bids
   - Reactions system

### Phase 6: Admin & Analytics (Week 6)
1. **Admin Panel**
   - User management (block, delete)
   - Auction moderation
2. **Analytics Dashboard**
   - User metrics
   - Revenue charts
   - Diamond distribution

---

## 🔐 Secrets Required (Supabase)

Create these secrets in Supabase Dashboard → Edge Functions → Secrets:

```
TELEGRAM_BOT_TOKEN=<bot_token_from_@BotFather>
TELEGRAM_BOT_USERNAME=<bot_username>
B2B_GROUP_ID=<telegram_group_chat_id>
BACKEND_URL=https://api.mazalbot.com
BACKEND_ACCESS_TOKEN=<fastapi_bearer_token>
WEBAPP_URL=https://mazalbot.app
LOVABLE_API_KEY=<lovable_cloud_ai_key>
TELEGRAM_WEBHOOK_SECRET=<random_secret_for_webhook_validation>
```

Access in edge functions:
```typescript
const botToken = Deno.env.get('TELEGRAM_BOT_TOKEN');
```

---

## ✅ Success Criteria

**After implementation, verify:**

1. ✅ App opens ONLY from Telegram (blocks if `initData` missing)
2. ✅ Authentication works → JWT stored → Supabase RLS context set
3. ✅ Deep links route correctly (`?startapp=diamond_123_456`)
4. ✅ Diamond CRUD: Create, Read, Update, Delete (with FastAPI endpoints)
5. ✅ Bulk upload CSV works (batch endpoint)
6. ✅ Share to group sends message with inline buttons
7. ✅ Share to story works (Telegram 7.2+)
8. ✅ Notifications page shows buyer matches
9. ✅ AI message generation works (Lovable Cloud AI)
10. ✅ Auction creation → Shares to group → Real-time bids
11. ✅ Haptic feedback on all interactions
12. ✅ Theme syncs with Telegram (light/dark mode)
13. ✅ NO SILENT FAILURES (detailed error toasts)
14. ✅ Mobile-first responsive design
15. ✅ Bottom nav always visible and accessible

---

## 🎬 Final Notes

**Key Principles:**
- **FastAPI is the single source of truth** for diamond data
- **Telegram SDK 3.11.8** must be properly initialized
- **NO optimistic updates** (caused sync issues)
- **Detailed error feedback** (never fail silently)
- **Mobile-first** design (fixed viewport, bottom nav)
- **Haptic feedback** on all interactions
- **Deep links** for viral sharing

**Testing Checklist:**
1. Test in actual Telegram app (iOS/Android)
2. Verify authentication with real `initData`
3. Test all CRUD operations with FastAPI backend
4. Verify RLS policies (try accessing other user's data)
5. Test deep links from Telegram groups
6. Verify edge functions deploy and run
7. Test real-time auction updates
8. Verify haptic feedback works
9. Test theme switching (light/dark)
10. Test on small screen (iPhone SE)

---

## 🚀 Ready to Build?

This prompt contains EVERYTHING needed to rebuild BrilliantBot from scratch with best practices. Follow the implementation order, respect the FastAPI contract, use the Telegram SDK correctly, and you'll have a production-ready app in 6 weeks.

**IMPORTANT:** This is a COMPLETE specification. Do NOT deviate from:
- FastAPI endpoint contracts (paths, methods, payloads)
- Telegram SDK initialization sequence
- Data transformation layer (camelCase ↔ snake_case)
- RLS policies and user context setting
- Error handling requirements (no silent failures)

Good luck! 💎