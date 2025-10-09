# TELEGRAM MINI APP - DIAMOND INVENTORY SYSTEM
## Complete Technical Specification for Cloning

Build a production-ready Telegram Mini App for diamond inventory management with B2B matching capabilities.

---

## TECH STACK
- **Frontend**: React 18.3, TypeScript, Vite, Tailwind CSS, RTL support (Hebrew/English)
- **Backend**: Supabase (PostgreSQL, RLS, Edge Functions), FastAPI (https://api.mazalbot.com)
- **Telegram**: @twa-dev/sdk ^8.0.2 for Telegram Web App integration
- **Payments**: CardCom API integration
- **UI**: shadcn/ui components, Radix UI primitives, Lucide icons
- **State**: React hooks, @tanstack/react-query
- **Forms**: react-hook-form, zod validation
- **Excel**: xlsx library for import/export
- **3D Models**: @react-three/fiber, @react-three/drei

---

## TELEGRAM WEB APP INTEGRATION

### 1. SDK Configuration
```typescript
// Use @twa-dev/sdk package
import WebApp from '@twa-dev/sdk'

// Initialize on app load
WebApp.ready()
WebApp.expand()

// Theme integration
const tg = window.Telegram?.WebApp
tg?.themeParams // Use for dynamic theming
```

### 2. Authentication Flow
- Extract `initData` from Telegram Web App SDK
- Parse user data: `id`, `first_name`, `last_name`, `username`, `photo_url`
- Send to FastAPI backend `/api/v1/sign-in/` with initData
- Backend returns JWT token + user profile
- Store token in localStorage as `jwtToken`
- Set current user ID globally for API calls

### 3. User Context Setup
```typescript
interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
  photo_url?: string;
}

// Context must provide:
- user: TelegramUser | null
- isAuthenticated: boolean
- isTelegramEnvironment: boolean
- isLoading: boolean
```

### 4. Haptic Feedback
```typescript
// Use on all user interactions
WebApp.HapticFeedback.impactOccurred('light')
WebApp.HapticFeedback.notificationOccurred('success')
WebApp.HapticFeedback.selectionChanged()
```

### 5. Deep Linking
```typescript
// Format: https://t.me/YOUR_BOT?start=diamond_STOCKNUMBER
// Extract from: WebApp.initDataUnsafe.start_param
```

---

## DATABASE SCHEMA (Supabase)

### Core Tables

#### 1. user_profiles
```sql
- id: uuid (primary key, default: gen_random_uuid())
- telegram_id: bigint (unique, not null)
- first_name: text (not null)
- last_name: text
- username: text
- phone_number: text
- email: text
- is_premium: boolean (default: false)
- language_code: text (default: 'he')
- photo_url: text
- shares_remaining: integer (default: 5)
- last_active: timestamp with time zone
- created_at: timestamp with time zone (default: now())
- updated_at: timestamp with time zone (default: now())
```

#### 2. inventory
```sql
- id: uuid (primary key, default: gen_random_uuid())
- user_id: bigint (not null, references user_profiles.telegram_id)
- stock_number: text (not null, unique per user)
- shape: text (not null) -- Round, Princess, Emerald, etc.
- weight: numeric (not null) -- Carat weight
- color: text (not null) -- D-Z
- clarity: text (not null) -- FL, IF, VVS1, VVS2, VS1, VS2, SI1, SI2, SI3, I1, I2, I3
- cut: text -- Excellent, Very Good, Good, Poor
- polish: text -- Excellent, Very Good, Good, Poor
- symmetry: text -- Excellent, Very Good, Good, Poor
- fluorescence: text -- None, Faint, Medium, Strong, Very Strong
- price_per_carat: integer
- rapnet: integer
- status: text (default: 'Available') -- Available, Reserved, Sold, On Hold
- lab: text -- GIA, AGS, EGL, GSI, IGI, Other
- certificate_number: bigint
- certificate_url: text
- certificate_comment: text
- picture: text -- URL to diamond image
- video_url: text
- v360_url: text
- gem360_url: text
- gia_report_pdf: text
- certificate_image_url: text
- length: numeric
- width: numeric
- depth: numeric
- ratio: numeric
- table_percentage: integer
- depth_percentage: numeric
- gridle: text
- culet: text -- None, Very Small, Small, Medium, Slightly Large, Large, Very Large
- store_visible: boolean (default: false) -- Public visibility
- deleted_at: timestamp with time zone
- created_at: timestamp with time zone (default: now())
- updated_at: timestamp with time zone (default: now())
```

#### 3. admin_roles
```sql
- id: uuid (primary key, default: gen_random_uuid())
- telegram_id: bigint (not null, unique)
- role: text (not null, default: 'admin') -- 'admin' or 'super_admin'
- is_active: boolean (default: true)
- created_by: uuid
- created_at: timestamp with time zone (default: now())
- updated_at: timestamp with time zone (default: now())
```

#### 4. diamond_offers
```sql
- id: uuid (primary key, default: gen_random_uuid())
- diamond_stock_number: text (not null)
- diamond_owner_telegram_id: bigint (not null)
- buyer_telegram_id: bigint (not null)
- buyer_name: text
- buyer_contact: text
- offered_price: numeric (not null)
- message: text
- status: text (default: 'pending') -- pending, accepted, rejected, countered
- responded_at: timestamp with time zone
- created_at: timestamp with time zone (default: now())
- updated_at: timestamp with time zone (default: now())
```

#### 5. keshett_agreements (B2B Contract System)
```sql
- id: uuid (primary key, default: gen_random_uuid())
- seller_telegram_id: bigint (not null)
- buyer_telegram_id: bigint (not null)
- diamond_stock_number: text (not null)
- diamond_data: jsonb (not null) -- Full diamond details snapshot
- agreed_price: numeric (not null)
- terms: jsonb (default: '{}')
- status: text (default: 'pending') -- pending, active, completed, cancelled, expired
- expiry_at: timestamp with time zone (not null)
- accepted_at: timestamp with time zone
- completed_at: timestamp with time zone
- notes: text
- created_at: timestamp with time zone (default: now())
- updated_at: timestamp with time zone (default: now())
```

#### 6. user_share_quotas
```sql
- user_telegram_id: bigint (primary key)
- shares_used: integer (default: 0)
- shares_granted: integer (default: 5)
- last_reset_at: timestamp with time zone (default: now())
- created_at: timestamp with time zone (default: now())
- updated_at: timestamp with time zone (default: now())
```

#### 7. diamond_share_analytics
```sql
- id: uuid (primary key, default: gen_random_uuid())
- owner_telegram_id: bigint (not null)
- diamond_stock_number: text (not null)
- viewer_telegram_id: bigint
- viewer_ip_address: inet
- viewer_user_agent: text
- device_type: text
- referrer: text
- session_id: uuid
- view_timestamp: timestamp with time zone (default: now())
- time_spent_seconds: integer
- returned_visitor: boolean (default: false)
- viewed_other_diamonds: boolean (default: false)
- created_at: timestamp with time zone (default: now())
```

#### 8. bot_usage_analytics
```sql
- id: uuid (primary key, default: gen_random_uuid())
- telegram_id: bigint (not null)
- chat_id: bigint (not null)
- message_type: text (not null) -- command, text, callback, etc.
- command: text
- chat_type: text (default: 'private') -- private, group, supergroup
- bot_token_type: text (default: 'main') -- main, clients, sellers
- message_data: jsonb (default: '{}')
- user_info: jsonb (default: '{}')
- response_sent: boolean (default: false)
- response_time_ms: integer
- processed_at: timestamp with time zone
- created_at: timestamp with time zone (default: now())
```

### Database Functions (CRITICAL)

```sql
-- Get current user telegram_id from session context
CREATE OR REPLACE FUNCTION get_current_user_telegram_id()
RETURNS bigint
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (current_setting('app.current_user_id', true))::bigint,
    0
  );
$$;

-- Check if user is admin
CREATE OR REPLACE FUNCTION check_is_admin_role(check_telegram_id bigint)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM admin_roles 
    WHERE telegram_id = check_telegram_id 
    AND is_active = true
  );
$$;

-- Use share quota (admin bypass)
CREATE OR REPLACE FUNCTION use_share_quota(
  p_user_telegram_id bigint,
  p_diamond_stock_number text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_shares_remaining integer;
  v_is_admin boolean;
BEGIN
  -- Admin bypass
  SELECT check_is_admin_role(p_user_telegram_id) INTO v_is_admin;
  
  IF v_is_admin THEN
    INSERT INTO user_share_history (
      user_telegram_id, diamond_stock_number, shares_remaining_after,
      analytics_data
    ) VALUES (
      p_user_telegram_id, p_diamond_stock_number, 999,
      jsonb_build_object('timestamp', now(), 'admin_bypass', true)
    );
    RETURN TRUE;
  END IF;
  
  -- Regular user logic
  SELECT shares_remaining INTO v_shares_remaining
  FROM user_profiles
  WHERE telegram_id = p_user_telegram_id;
  
  IF v_shares_remaining IS NULL OR v_shares_remaining <= 0 THEN
    RETURN FALSE;
  END IF;
  
  UPDATE user_profiles
  SET shares_remaining = shares_remaining - 1
  WHERE telegram_id = p_user_telegram_id;
  
  RETURN TRUE;
END;
$$;
```

### Row-Level Security (RLS) Policies

```sql
-- inventory table
CREATE POLICY "Users manage own inventory"
ON inventory FOR ALL
USING (user_id = get_current_user_telegram_id())
WITH CHECK (user_id = get_current_user_telegram_id());

CREATE POLICY "Admins manage all inventory"
ON inventory FOR ALL
USING (check_is_admin_role(get_current_user_telegram_id()))
WITH CHECK (check_is_admin_role(get_current_user_telegram_id()));

-- user_profiles table
CREATE POLICY "Users view own profile"
ON user_profiles FOR SELECT
USING (telegram_id = get_current_user_telegram_id());

CREATE POLICY "Admins view all profiles"
ON user_profiles FOR ALL
USING (check_is_admin_role(get_current_user_telegram_id()))
WITH CHECK (check_is_admin_role(get_current_user_telegram_id()));

-- diamond_offers table
CREATE POLICY "Buyers create offers"
ON diamond_offers FOR INSERT
WITH CHECK (buyer_telegram_id = get_current_user_telegram_id());

CREATE POLICY "Owners manage offer responses"
ON diamond_offers FOR UPDATE
USING (diamond_owner_telegram_id = get_current_user_telegram_id());
```

---

## FASTAPI BACKEND INTEGRATION

### Base Configuration
```typescript
const API_BASE_URL = "https://api.mazalbot.com";

// Store user_id globally after sign-in
let currentUserId: number | null = null;

function setCurrentUserId(userId: number) {
  currentUserId = userId;
}
```

### Critical API Endpoints

#### 1. Authentication
```typescript
POST /api/v1/sign-in/
Body: { init_data: string } // From Telegram WebApp
Response: { 
  token: string, 
  user: { id: number, first_name: string, ... }
}
```

#### 2. Inventory Management
```typescript
// Get all diamonds for user
GET /api/v1/get_all_stones
Headers: { Authorization: Bearer <token> }
Query: { user_id: number }

// Create single diamond
POST /api/v1/diamonds
Headers: { Authorization: Bearer <token> }
Body: DiamondCreateRequest

// Batch create (Excel import)
POST /api/v1/diamonds/batch
Headers: { Authorization: Bearer <token> }
Body: { user_id: number, diamonds: DiamondData[] }

// Update diamond
PUT /api/v1/diamonds/{diamond_id}
Headers: { Authorization: Bearer <token> }
Body: DiamondUpdateRequest

// Delete diamond
DELETE /api/v1/delete_stone/{diamond_id}
Headers: { Authorization: Bearer <token> }
Query: { user_id: number }
```

#### 3. Search System
```typescript
// Search with filters
GET /api/v1/get_search_results
Query: {
  shape?, color?, clarity?, weight_min?, weight_max?,
  price_min?, price_max?, cut?, polish?, symmetry?,
  fluorescence?, user_id: number
}

// Get result count
GET /api/v1/get_search_results_count
Query: { same as above }
```

#### 4. Payment Processing (CardCom)
```typescript
POST /api/v1/payment_request
Headers: { Authorization: Bearer <token> }
Body: {
  user_id: number,
  amount: number,
  currency: string,
  description: string,
  return_url: string,
  notify_url: string
}
Response: {
  payment_url: string,
  transaction_id: string
}
```

### Error Handling
```typescript
// CRITICAL: Show user-friendly messages on API failures
try {
  const response = await fetch(endpoint);
  if (!response.ok) {
    if (response.status === 404) {
      toast.error("Diamond not found");
    } else if (response.status === 403) {
      toast.error("Permission denied");
    } else {
      toast.error("Operation failed. Please try again.");
    }
  }
} catch (error) {
  toast.error("Network error. Check your connection.");
}
```

---

## FEATURE SPECIFICATIONS

### 1. INVENTORY MANAGEMENT

#### Diamond List View (`/inventory`)
- **Display**: Grid layout (responsive: 1 col mobile, 2 cols tablet, 3+ cols desktop)
- **Card Components**:
  - Diamond image with fallback
  - Stock number (clickable → detail view)
  - Shape, Carat, Color, Clarity
  - Price (formatted: $X,XXX per carat)
  - Status badge (Available=green, Reserved=yellow, Sold=red)
  - Quick actions: Edit, Delete, Share
- **Filters**: Shape, Color, Clarity, Weight range, Price range, Cut, Polish, Symmetry
- **Sort Options**: Stock#, Carat, Price, Date Added
- **Bulk Actions**: Select multiple → Delete, Export, Update status
- **Empty State**: "No diamonds yet. Add your first one!" with CTA button

#### Add/Edit Diamond Form
```typescript
interface DiamondFormData {
  // REQUIRED FIELDS
  stockNumber: string; // Unique identifier
  shape: string; // Dropdown: Round, Princess, Emerald, etc.
  carat: number; // Min: 0.01, Max: 50, Step: 0.01
  color: string; // Dropdown: D-Z
  clarity: string; // Dropdown: FL, IF, VVS1-I3
  
  // GRADING (Optional)
  cut?: string; // Excellent, Very Good, Good, Poor
  polish?: string;
  symmetry?: string;
  fluorescence?: string; // None, Faint, Medium, Strong, Very Strong
  
  // CERTIFICATE (Optional)
  lab?: string; // GIA, AGS, IGI, etc.
  certificateNumber?: string;
  certificateUrl?: string;
  certificateComment?: string;
  
  // MEASUREMENTS (Optional)
  length?: number;
  width?: number;
  depth?: number;
  ratio?: number;
  tablePercentage?: number;
  depthPercentage?: number;
  gridle?: string;
  culet?: string;
  
  // BUSINESS (Required)
  price: number; // Price per carat
  pricePerCarat?: number; // Auto-calculated
  status: string; // Available, Reserved, Sold, On Hold
  storeVisible?: boolean; // Public visibility toggle
  
  // MEDIA (Optional)
  picture?: string; // URL or base64
  videoUrl?: string;
  v360Url?: string;
}
```

**Validation Rules**:
- Stock number: Alphanumeric, max 50 chars, unique per user
- Carat: 0.01-50.00, 2 decimal places
- Price: Positive integer, max 9,999,999
- All dropdowns: Only allow predefined values (no free text)

**Excel Import** (`/inventory/import`):
- **Format**: `.xlsx` or `.csv`
- **Required Columns**: Stock Number, Shape, Carat, Color, Clarity, Price Per Carat
- **Optional Columns**: All other fields
- **Validation**: 
  - Show row-by-row errors before import
  - Highlight duplicates (stock numbers)
  - Skip invalid rows option
- **API Call**: `POST /api/v1/diamonds/batch` with array of diamonds
- **Feedback**: "✅ 45 diamonds imported, ⚠️ 3 skipped (errors)"

**Excel Export**:
- **Button**: "Export to Excel" on inventory page
- **Columns**: All diamond fields
- **Filename**: `diamonds_export_YYYY-MM-DD.xlsx`
- **Library**: `xlsx` package

### 2. DIAMOND SHARING SYSTEM

#### Deep Link Generation
```typescript
// Format: https://t.me/YOUR_BOT_USERNAME?start=diamond_STOCKNUMBER
function generateDiamondLink(stockNumber: string): string {
  const botUsername = "your_bot_username"; // From env or config
  return `https://t.me/${botUsername}?start=diamond_${stockNumber}`;
}
```

#### Share Flow
1. User clicks "Share" on diamond card
2. Check share quota via `use_share_quota()` function
3. If quota exceeded → Show upgrade prompt
4. If admin → Bypass quota check
5. Generate deep link + public URL
6. Show share options:
   - **Telegram Groups**: `WebApp.switchInlineQuery(message, ['groups'])`
   - **Copy Link**: Copy to clipboard with toast confirmation
   - **Open in Telegram**: Direct to chat list

#### Public Diamond View (`/diamond/:stockNumber`)
- **URL**: `yourapp.com/diamond/ABC123`
- **No Auth Required**: Anyone can view via link
- **Data Fetching**: 
  ```typescript
  // Check if shared via Telegram (start_param)
  const startParam = WebApp.initDataUnsafe.start_param;
  if (startParam?.startsWith('diamond_')) {
    const stockNumber = startParam.replace('diamond_', '');
    // Fetch from API
  }
  ```
- **Components**:
  - Hero image carousel (if multiple images)
  - Key specs: Shape, Carat, Color, Clarity, Cut
  - Certificate info (lab, number, PDF link)
  - Price (formatted with currency)
  - "Make Offer" button → Opens offer dialog
  - Owner info (name, contact if public)
  - Similar diamonds section
- **Analytics Tracking**: 
  - Insert to `diamond_share_analytics` table
  - Track: viewer_telegram_id, device_type, time_spent, session_id

### 3. OFFER SYSTEM

#### Make Offer Dialog
```typescript
interface OfferFormData {
  offeredPrice: number; // Required
  message?: string; // Optional message to seller
  buyerName?: string; // Pre-filled from Telegram
  buyerContact?: string; // Telegram username or phone
}
```

**Flow**:
1. User clicks "Make Offer" on public diamond view
2. Show dialog with form
3. Validate: offered_price must be > 0
4. Submit to `diamond_offers` table
5. Send Telegram notification to diamond owner via bot
6. Show confirmation: "✅ Offer sent! The seller will respond via Telegram."

#### Manage Offers (Seller View) (`/offers`)
- **Display**: List of all received offers
- **Filters**: Status (pending/accepted/rejected), Date range
- **Card Components**:
  - Diamond image + stock number
  - Buyer name + contact
  - Offered price vs. listed price (show % difference)
  - Message from buyer
  - Action buttons: Accept, Reject, Counter Offer
  - Status badge
- **Actions**:
  - **Accept**: Updates status → Sends Telegram message to buyer
  - **Reject**: Updates status → Optional rejection message
  - **Counter**: Opens dialog to propose new price

### 4. KESHETT (B2B CONTRACT) SYSTEM

#### Create Keshett Agreement
```typescript
POST /keshett-agreements
Body: {
  seller_telegram_id: number,
  buyer_telegram_id: number,
  diamond_stock_number: string,
  agreed_price: number,
  expiry_at: timestamp, // Default: 48 hours from now
  terms: {
    payment_method: string,
    delivery_terms: string,
    inspection_period_hours: number
  }
}
```

**Flow**:
1. Seller navigates to `/keshett/new`
2. Selects diamond from dropdown
3. Enters buyer Telegram username or ID
4. Sets agreed price
5. Optional: Custom terms
6. System generates unique agreement ID
7. Sends Telegram link to buyer: `https://t.me/bot?start=keshett_AGREEMENT_ID`

#### Buyer Acceptance Flow
1. Buyer clicks Telegram link → Opens mini app
2. Shows agreement details:
   - Diamond full specs
   - Agreed price
   - Terms & conditions
   - Expiry countdown timer
3. "Accept Agreement" button
4. On accept:
   - Status → 'active'
   - Sends confirmation to both parties
   - Creates payment request via CardCom
5. On expiry: Auto-update status to 'expired'

#### Active Agreements View (`/keshett`)
- **Display**: Table with columns:
  - Agreement ID
  - Diamond (stock#, image)
  - Counterparty name
  - Price
  - Status
  - Expires in / Completed at
  - Actions
- **Actions**: View Details, Cancel (if pending), Mark Complete (if active)

### 5. SEARCH & MATCHING

#### Search Interface (`/search`)
- **Filter Panel** (collapsible on mobile):
  ```typescript
  interface SearchCriteria {
    shape?: string[];
    color?: string[]; // Range: D-Z
    clarity?: string[]; // Range: FL-I3
    weight_min?: number;
    weight_max?: number;
    price_min?: number;
    price_max?: number;
    cut?: string[];
    polish?: string[];
    symmetry?: string[];
    fluorescence?: string[];
  }
  ```
- **Results Display**:
  - Count: "Found 23 diamonds"
  - Grid layout (same as inventory)
  - Pagination (50 per page)
- **Save Search**: Button to save criteria for notifications
- **API**: `GET /api/v1/get_search_results` with query params

#### B2B Matching Notifications
- **Trigger**: When new diamond added matching saved search criteria
- **Notification Method**: Telegram bot message
- **Message Format**:
  ```
  🔔 New Match Found!
  
  Stock: ABC123
  Shape: Round, 1.25ct, F, VS1
  Price: $8,500/ct
  
  [View Diamond] [Contact Seller]
  ```
- **Table**: `match_notifications` (track sent matches)

### 6. ADMIN PANEL (`/admin`)

**Access Control**:
```typescript
// Check admin role before rendering admin routes
const isAdmin = check_is_admin_role(user.telegram_id);
if (!isAdmin) {
  return <Navigate to="/" />;
}
```

#### Dashboard (`/admin/dashboard`)
- **Metrics Cards**:
  - Total Users (count from `user_profiles`)
  - Total Diamonds (count from `inventory`)
  - Active Offers (count where status='pending')
  - Shares Used Today (count from `user_share_quotas`)
- **Charts**:
  - User Growth (line chart, last 30 days)
  - Diamond Additions (bar chart, weekly)
  - Most Shared Diamonds (top 10 list)
- **Recent Activity Feed**:
  - New user registrations
  - Diamond additions/deletions
  - Offer activities

#### User Management (`/admin/users`)
- **Table Columns**:
  - Telegram ID
  - Name
  - Username
  - Join Date
  - Last Active
  - Diamond Count
  - Shares Remaining
  - Actions (View, Block, Grant Shares)
- **Actions**:
  - **Grant Shares**: Update `shares_remaining` field
  - **Block User**: Insert to `blocked_users` table
  - **View Details**: Shows full profile + activity

#### Analytics (`/admin/analytics`)
- **Bot Usage Stats** (from `bot_usage_analytics`):
  - Messages per day (line chart)
  - Command usage breakdown (pie chart)
  - Active users trend
- **Share Analytics** (from `diamond_share_analytics`):
  - Most viewed diamonds
  - Average time spent per view
  - Conversion rate (view → offer)
- **Export**: CSV download of all analytics data

#### Admin Roles Management (`/admin/roles`)
- **Only Super Admins Can Access**
- **Table**: List of all admins
- **Actions**: Add Admin, Remove Admin, Promote to Super Admin
- **Audit Log**: Track all role changes

### 7. PAYMENT INTEGRATION (CardCom)

#### Configuration
```typescript
const CARDCOM_CONFIG = {
  terminal: process.env.CARDCOM_TERMINAL,
  username: process.env.CARDCOM_USERNAME,
  apiName: process.env.CARDCOM_API_NAME,
  lowProfileCode: process.env.CARDCOM_LOW_PROFILE_CODE,
  apiEndpoint: "https://secure.cardcom.solutions/api/v11/"
};
```

#### Payment Flow
1. **Initiate Payment**:
   ```typescript
   POST /api/v1/payment_request
   Body: {
     user_id: number,
     amount: number,
     currency: "ILS",
     description: "Diamond Purchase - Stock ABC123",
     return_url: "https://yourapp.com/payment/success",
     notify_url: "https://api.mazalbot.com/api/v1/payment_webhook"
   }
   Response: {
     payment_url: string, // Redirect user here
     transaction_id: string
   }
   ```

2. **User Redirects to CardCom**: Opens payment_url in WebView or external browser

3. **Payment Success**: CardCom redirects to return_url with query params:
   ```
   ?transaction_id=XXX&status=success&amount=1000
   ```

4. **Webhook Handler** (FastAPI backend):
   ```python
   @router.post("/payment_webhook")
   async def handle_payment_webhook(data: PaymentWebhookData):
       # Verify signature
       # Update payment status in database
       # Send confirmation to user via Telegram bot
       # Update diamond status if applicable
   ```

5. **Display Confirmation**: Show success page with transaction details

### 8. AI CHAT ASSISTANT (`/chat`)

**Purpose**: Help users find diamonds via conversational interface

**Technology**: Edge function calling OpenAI GPT-4 or Gemini

**Flow**:
1. User types: "I need a 1 carat round diamond, color F, clarity VS1, budget $8000"
2. AI extracts:
   ```json
   {
     "shape": "Round",
     "weight_min": 0.95,
     "weight_max": 1.05,
     "color": "F",
     "clarity": "VS1",
     "price_max": 8000
   }
   ```
3. Call search API with extracted params
4. Return results to user with formatted response
5. Allow refinement: "Show me cheaper options"

**Implementation**:
- Use Supabase Edge Function `chat-diamond-assistant`
- Store conversation history in `chat_conversations` + `chat_conversation_messages`
- Show typing indicator during AI processing
- Render diamond cards inline in chat

---

## NAVIGATION STRUCTURE

```
/ (Home)
├── /inventory (My Diamonds)
│   ├── /inventory/add
│   ├── /inventory/edit/:id
│   ├── /inventory/import (Excel Upload)
│   └── /inventory/:stockNumber (Detail View)
├── /search (Find Diamonds)
├── /offers (Manage Offers)
│   ├── /offers/received
│   └── /offers/sent
├── /keshett (B2B Contracts)
│   ├── /keshett/new
│   └── /keshett/:id
├── /diamond/:stockNumber (Public View - No Auth)
├── /chat (AI Assistant)
├── /analytics (My Stats)
└── /admin (Admin Only)
    ├── /admin/dashboard
    ├── /admin/users
    ├── /admin/analytics
    └── /admin/roles
```

**Bottom Navigation Bar** (Telegram Mini App style):
```typescript
const navItems = [
  { icon: Home, label: "Home", path: "/" },
  { icon: Gem, label: "Inventory", path: "/inventory" },
  { icon: Search, label: "Search", path: "/search" },
  { icon: MessageSquare, label: "Offers", path: "/offers" },
  { icon: User, label: "Profile", path: "/profile" }
];
```

---

## STYLING & DESIGN SYSTEM

### Theme Configuration (`index.css`)
```css
:root {
  /* Use Telegram theme params when available */
  --background: hsl(var(--tg-theme-bg-color, 0 0% 100%));
  --foreground: hsl(var(--tg-theme-text-color, 222.2 84% 4.9%));
  --primary: 222 47% 31%; /* Deep blue */
  --primary-foreground: 210 40% 98%;
  --secondary: 210 40% 96.1%;
  --accent: 210 40% 96.1%;
  --destructive: 0 84.2% 60.2%;
  --border: 214.3 31.8% 91.4%;
  --radius: 0.5rem;
}

[dir="rtl"] {
  direction: rtl;
  text-align: right;
}
```

### Typography
- **Primary Font**: Heebo (Hebrew support)
- **Headings**: font-heebo font-bold
- **Body**: font-heebo font-normal
- **Sizes**: text-sm (mobile), text-base (desktop)

### Component Patterns
```typescript
// Button variants
<Button variant="default">Primary Action</Button>
<Button variant="outline">Secondary</Button>
<Button variant="destructive">Delete</Button>
<Button variant="ghost">Subtle</Button>

// Card layout
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Subtitle</CardDescription>
  </CardHeader>
  <CardContent>
    {/* Content */}
  </CardContent>
  <CardFooter>
    {/* Actions */}
  </CardFooter>
</Card>

// Toast notifications (use sonner)
import { toast } from "sonner";
toast.success("Diamond added successfully!");
toast.error("Failed to delete diamond");
toast.loading("Processing...");
```

### Mobile Optimizations
- **Viewport**: `<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">`
- **Touch Targets**: Minimum 44x44px for all buttons
- **Bottom Navigation**: Fixed position with `pb-safe` for notch devices
- **Swipe Gestures**: Implement on diamond cards (swipe left → delete, swipe right → share)
- **Pull to Refresh**: On main inventory list

---

## CRITICAL BUSINESS LOGIC

### Dynamic Pricing (CARDCOM_MULTIPLIER)
```typescript
function calculatePaymentAmount(userCount: number): number {
  const CARDCOM_MULTIPLIER_USD = 2.5;
  
  if (userCount <= 100) {
    // First 100 users: $100/user
    return 100 * CARDCOM_MULTIPLIER_USD;
  } else {
    // After 100: $50/user
    const over100 = userCount - 100;
    return (100 * 100 + over100 * 50) * CARDCOM_MULTIPLIER_USD;
  }
}
```

### Share Quota System
- **Default**: 5 shares per user
- **Admin**: Unlimited shares (bypasses quota check)
- **Reset**: Manual by admin or monthly cron job
- **Upgrade Prompt**: Show when quota exhausted, link to payment

### Certificate Validation
```typescript
function validateCertificate(certNumber: string, lab: string): boolean {
  // GIA format: 7-10 digits
  if (lab === "GIA" && !/^\d{7,10}$/.test(certNumber)) {
    return false;
  }
  // Add other lab validations
  return true;
}
```

---

## PERFORMANCE REQUIREMENTS

### Bundle Size Targets
- Initial Load: < 500KB (gzipped)
- Code Splitting: Lazy load admin routes, analytics charts
- Image Optimization: Use WebP format, lazy loading, CDN

### Database Optimization
- **Indexes**:
  ```sql
  CREATE INDEX idx_inventory_user_id ON inventory(user_id) WHERE deleted_at IS NULL;
  CREATE INDEX idx_inventory_stock_number ON inventory(stock_number);
  CREATE INDEX idx_diamond_offers_owner ON diamond_offers(diamond_owner_telegram_id);
  ```
- **Query Limits**: Always paginate (LIMIT 50, OFFSET N)
- **Caching**: Use React Query with 5-minute stale time for inventory lists

### Telegram-Specific
- **Load Time**: App must render within 2 seconds on 3G
- **Haptic Feedback**: Must trigger within 50ms of user action
- **Theme Sync**: Update CSS variables on theme change event

---

## SECURITY CHECKLIST

### Authentication
- ✅ Validate Telegram initData hash on backend
- ✅ Store JWT in localStorage (NOT in URL params)
- ✅ Check token expiry on every API call
- ✅ Implement token refresh mechanism

### Authorization
- ✅ Use RLS policies on ALL Supabase tables
- ✅ Never trust client-side user_id (always get from JWT)
- ✅ Admin checks via database function, not client-side
- ✅ Rate limiting on API endpoints (10 req/sec per user)

### Data Validation
- ✅ Zod schemas for all form inputs
- ✅ Sanitize user input before display (prevent XSS)
- ✅ Validate file uploads (size, type, content)
- ✅ Parameterized queries (prevent SQL injection)

### Privacy
- ✅ Encrypt sensitive data in localStorage
- ✅ GDPR-compliant data deletion
- ✅ User consent for analytics tracking
- ✅ Secure payment redirect (HTTPS only)

---

## DEPLOYMENT CONFIGURATION

### Environment Variables
```env
# Supabase
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your_anon_key

# FastAPI Backend
VITE_API_BASE_URL=https://api.mazalbot.com
VITE_FASTAPI_BEARER_TOKEN=your_secret_token

# Telegram
VITE_TELEGRAM_BOT_USERNAME=your_bot_username
VITE_TELEGRAM_BOT_TOKEN=your_bot_token

# CardCom (Server-side only)
CARDCOM_TERMINAL=your_terminal
CARDCOM_USERNAME=your_username
CARDCOM_API_NAME=your_api_name
CARDCOM_LOW_PROFILE_CODE=your_code
```

### Build Settings
```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0"
  }
}
```

### Supabase Edge Functions
- **Required**: `sign-in`, `diamond-search`, `payment-webhook`, `chat-diamond-assistant`
- **Deploy**: Auto-deploy via Supabase CLI on git push

---

## TESTING REQUIREMENTS

### Manual Testing Checklist
- [ ] Sign in via Telegram (bot link)
- [ ] Add diamond (form validation)
- [ ] Edit diamond (data persistence)
- [ ] Delete diamond (confirmation dialog)
- [ ] Excel import (valid + invalid data)
- [ ] Excel export (file download)
- [ ] Share diamond (deep link works)
- [ ] Make offer (notification sent)
- [ ] Accept/reject offer (status updates)
- [ ] Search diamonds (filters work)
- [ ] Create Keshett (expiry timer)
- [ ] Payment flow (CardCom redirect)
- [ ] Admin access (role check)
- [ ] Theme switch (light/dark)
- [ ] RTL layout (Hebrew UI)

### Automated Tests (Recommended)
```typescript
// Example: Diamond form validation
describe('Diamond Form', () => {
  it('should require stock number', () => {
    // Test form validation
  });
  
  it('should validate carat range', () => {
    // Test min/max validation
  });
  
  it('should submit to API', () => {
    // Mock API call
  });
});
```

---

## KNOWN ISSUES & FIXES

### Issue 1: Console Logs in Production
**Problem**: 1,164+ console.log statements
**Fix**: 
```typescript
// Create logger utility
const logger = {
  info: (msg: string, data?: any) => {
    if (import.meta.env.DEV) console.log(msg, data);
  },
  error: (msg: string, error?: any) => {
    // Always log errors, send to Sentry in production
    console.error(msg, error);
  }
};
```

### Issue 2: TypeScript `any` Types
**Problem**: 551 instances of `any`
**Fix**: Enable `strict: true` in tsconfig.json, replace with proper interfaces

### Issue 3: Bundle Size
**Problem**: 1.5MB initial load
**Fix**: 
- Code split routes: `React.lazy(() => import('./AdminPanel'))`
- Tree-shake unused libraries
- Use dynamic imports for heavy components (3D viewer, Excel parser)

### Issue 4: No Error Boundaries
**Fix**:
```typescript
<ErrorBoundary fallback={<ErrorFallback />}>
  <App />
</ErrorBoundary>
```

---

## DELIVERABLES

When you build this app, ensure:

1. ✅ **Telegram Mini App SDK fully integrated** (@twa-dev/sdk)
2. ✅ **Authentication via Telegram initData**
3. ✅ **All database tables created with RLS policies**
4. ✅ **FastAPI endpoints connected** (with error handling)
5. ✅ **Excel import/export working**
6. ✅ **Diamond sharing with deep links**
7. ✅ **Offer system functional**
8. ✅ **Keshett B2B contracts**
9. ✅ **CardCom payment integration**
10. ✅ **Admin panel with role-based access**
11. ✅ **Search & matching system**
12. ✅ **AI chat assistant**
13. ✅ **RTL support for Hebrew**
14. ✅ **Mobile-optimized UI**
15. ✅ **Toast notifications for all actions**

---

## FINAL NOTES

This is a **production-grade specification**. Do not cut corners on:
- Security (RLS, JWT validation, admin checks)
- Error handling (every API call must handle failures)
- User feedback (toasts, loading states, confirmations)
- Mobile UX (touch targets, bottom nav, haptics)
- Data validation (Zod schemas, backend validation)

The app MUST work flawlessly as a Telegram Mini App. Test thoroughly with actual Telegram bot integration before considering it complete.

**Success Criteria**: A user should be able to open the bot, authenticate, add diamonds via Excel, share them in Telegram groups, receive offers, and complete payments—all without leaving Telegram.
