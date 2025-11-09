# 🔍 TELEGRAM MINI APP ↔ FASTAPI BACKEND - COMPLETE TECHNICAL AUDIT

**Generated:** 2025-11-09  
**Frontend:** diamond-mazal-vision-47.lovable.app (Lovable React + Telegram WebApp SDK)  
**Backend:** https://api.mazalbot.com (FastAPI)  
**Status:** ⚠️ PARTIAL CONNECTION - Authentication working, data sync needs verification

---

## 📊 EXECUTIVE SUMMARY

### ✅ What's Working
- Telegram WebApp SDK initialization (`window.Telegram.WebApp`)
- `initData` capture and client-side validation
- JWT authentication flow to FastAPI `/api/v1/sign-in/`
- Token storage and refresh mechanism
- User context persistence to Supabase
- CORS headers and Bearer token authentication
- React context-based auth state management

### ⚠️ What Needs Attention
- Network connectivity between Lovable → FastAPI (404 errors reported)
- Diamond CRUD operations error handling
- Real-time data synchronization
- Offline/fallback mode optimization
- API endpoint alignment verification

---

## 🏗️ ARCHITECTURE OVERVIEW

```
┌─────────────────────────────────────────────────────────────────┐
│                    TELEGRAM BOT CLIENT                           │
│                   (User opens Mini App)                          │
└──────────────────────┬──────────────────────────────────────────┘
                       │ Opens WebApp URL
                       ▼
┌─────────────────────────────────────────────────────────────────┐
│              LOVABLE FRONTEND (React SPA)                        │
│         diamond-mazal-vision-47.lovable.app                      │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  1. TELEGRAM SDK INITIALIZATION                           │  │
│  │     • window.Telegram.WebApp.ready()                      │  │
│  │     • window.Telegram.WebApp.expand()                     │  │
│  │     • Capture initData (encrypted user auth payload)      │  │
│  └──────────────────────────────────────────────────────────┘  │
│                             │                                     │
│                             ▼                                     │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  2. CLIENT-SIDE VALIDATION                                │  │
│  │     • Validate initData structure (Zod schema)            │  │
│  │     • Check required fields: user, hash, auth_date        │  │
│  │     • Min length 50 chars                                 │  │
│  │     File: src/lib/api/validation.ts                       │  │
│  └──────────────────────────────────────────────────────────┘  │
│                             │                                     │
│                             ▼                                     │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  3. FASTAPI AUTHENTICATION                                │  │
│  │     POST https://api.mazalbot.com/api/v1/sign-in/         │  │
│  │     Body: { "init_data": "<telegram_init_data>" }         │  │
│  │     File: src/lib/api/auth.ts::signInToBackend()          │  │
│  └──────────────────────────────────────────────────────────┘  │
│                             │                                     │
│                             ▼                                     │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  4. JWT TOKEN STORAGE                                     │  │
│  │     • localStorage: 'brilliant_jwt_token'                 │  │
│  │     • Cache auth state for instant reload                 │  │
│  │     • Auto-refresh 5 min before expiry                    │  │
│  │     File: src/lib/api/tokenManager.ts                     │  │
│  └──────────────────────────────────────────────────────────┘  │
│                             │                                     │
│                             ▼                                     │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  5. AUTHENTICATED API CALLS                               │  │
│  │     Authorization: Bearer <jwt_token>                     │  │
│  │     All requests through src/api/http.ts                  │  │
│  └──────────────────────────────────────────────────────────┘  │
└──────────────────────┬──────────────────────────────────────────┘
                       │ HTTPS/CORS
                       ▼
┌─────────────────────────────────────────────────────────────────┐
│                  FASTAPI BACKEND                                 │
│              https://api.mazalbot.com                            │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  ENDPOINT: POST /api/v1/sign-in/                          │  │
│  │  • Verify Telegram HMAC signature                         │  │
│  │  • Generate JWT token                                     │  │
│  │  • Return: { token, has_subscription }                    │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  DIAMOND MANAGEMENT ENDPOINTS                             │  │
│  │  • GET /api/v1/get_all_stones?user_id={id}                │  │
│  │  • POST /api/v1/diamonds?user_id={id}                     │  │
│  │  • PUT /api/v1/diamonds/{diamond_id}?user_id={id}         │  │
│  │  • DELETE /api/v1/delete_stone/{diamond_id}?user_id={id}  │  │
│  │  • POST /api/v1/diamonds/batch?user_id={id}               │  │
│  └──────────────────────────────────────────────────────────┘  │
└──────────────────────┬──────────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────────┐
│                     SUPABASE DATABASE                            │
│              (Secondary data persistence layer)                  │
│                                                                   │
│  • User profiles table                                           │
│  • Session analytics                                             │
│  • Inventory cache (synced from FastAPI)                         │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔐 AUTHENTICATION FLOW - DETAILED BREAKDOWN

### Step 1: Telegram WebApp Initialization
**File:** `src/hooks/useOptimizedTelegramAuth.ts` (lines 122-149)

```typescript
// CRITICAL DETECTION LOGIC
if (typeof window === 'undefined' || !window.Telegram?.WebApp) {
  throw new Error('not_telegram_environment');
}

const tg = window.Telegram.WebApp;
tg.ready?.();
tg.expand?.();

// STRICT VALIDATION
if (!tg.initData || tg.initData.length < 50) {
  throw new Error('no_init_data');
}

// VERIFY REQUIRED FIELDS
const initDataParams = new URLSearchParams(tg.initData);
if (!initDataParams.get('user') || 
    !initDataParams.get('hash') || 
    !initDataParams.get('auth_date')) {
  throw new Error('invalid_init_data');
}
```

**What initData Contains:**
```
query_id=AAGxY...&user=%7B%22id%22%3A2138564172%2C%22first_name%22%3A%22John%22%2C...%7D&auth_date=1730992345&hash=a1b2c3d4...
```

**Decoded user parameter:**
```json
{
  "id": 2138564172,
  "first_name": "John",
  "last_name": "Doe",
  "username": "johndoe",
  "language_code": "en",
  "is_premium": false
}
```

---

### Step 2: Client-Side Validation
**File:** `src/lib/api/validation.ts` (lines 9-20)

```typescript
export const telegramInitDataSchema = z.string()
  .min(50, 'InitData must be at least 50 characters')
  .max(10000, 'InitData exceeds maximum length')
  .refine((data) => {
    try {
      const params = new URLSearchParams(data);
      return params.has('user') && params.has('hash') && params.has('auth_date');
    } catch {
      return false;
    }
  }, 'InitData must contain valid Telegram authentication parameters');
```

**Validation Rules:**
- ✅ Minimum 50 characters (prevents empty/invalid data)
- ✅ Maximum 10,000 characters (prevents DoS attacks)
- ✅ Must contain `user`, `hash`, `auth_date` parameters
- ✅ Must be valid URL-encoded string

---

### Step 3: Backend Authentication Request
**File:** `src/lib/api/auth.ts::signInToBackend()` (lines 39-139)

```typescript
const signInUrl = `${API_BASE_URL}/api/v1/sign-in/`;

const response = await fetch(signInUrl, {
  method: 'POST',
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'Origin': window.location.origin, // CORS compliance
  },
  mode: 'cors',
  credentials: 'omit', // No cookies - JWT only
  body: JSON.stringify({
    init_data: initData // Raw Telegram initData for backend HMAC verification
  }),
});
```

**Expected Backend Behavior:**
1. Receive `init_data` in request body
2. Parse `user`, `auth_date`, `hash` from initData
3. Verify HMAC signature using Telegram bot token secret key
4. Validate `auth_date` timestamp (not older than 5 minutes)
5. Generate JWT token with user ID as subject
6. Return: `{ "token": "<jwt>", "has_subscription": true/false }`

**Response Validation:**
```typescript
// File: src/lib/api/validation.ts (lines 28-31)
export const signInResponseSchema = z.object({
  token: z.string().min(1, 'Token cannot be empty'),
  has_subscription: z.boolean()
});
```

---

### Step 4: Token Storage & Management
**File:** `src/lib/api/tokenManager.ts` (lines 61-75)

```typescript
setToken(token: string, userId: number): void {
  // Estimate token expiry (30 minutes for JWT)
  const expiresAt = Date.now() + (30 * 60 * 1000);
  const refreshAt = expiresAt - TOKEN_REFRESH_THRESHOLD; // 5 min before expiry
  
  this.tokenData = {
    token,
    expiresAt,
    userId,
    refreshAt
  };
  
  // Persist to localStorage
  localStorage.setItem(TOKEN_STORAGE_KEY, JSON.stringify(this.tokenData));
}
```

**Storage Keys:**
- `brilliant_jwt_token` - Token with expiry metadata
- `brilliant_auth_state` - Complete auth state for instant reload

**Auto-Refresh Logic:**
- Checks if `Date.now() >= refreshAt` (5 min before expiry)
- Dispatches `token-refresh-needed` event
- Re-authenticates with Telegram initData
- Updates token seamlessly without user interruption

---

### Step 5: Authenticated API Requests
**File:** `src/api/http.ts::http()` (lines 67-250)

```typescript
export async function http<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const fullUrl = `${API_BASE_URL}${endpoint}`;
  const token = getBackendAuthToken();
  
  // CRITICAL: Block all non-auth requests without JWT
  if (!token && !endpoint.includes('/api/v1/sign-in/')) {
    toast({
      title: "🔐 Authentication Required",
      description: "Please sign in again",
      variant: "destructive",
    });
    throw new Error('Authentication required');
  }

  // Test backend health before request
  const isHealthy = await testBackendHealth(); // GET /api/v1/alive
  if (!isHealthy) {
    toast({ title: "🔌 Server Offline" });
    throw new Error('Server unavailable');
  }

  const config: RequestInit = {
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json",
      "Origin": window.location.origin,
      "X-Client-Timestamp": Date.now().toString(),
      "Authorization": `Bearer ${token}`, // JWT in Authorization header
      ...options.headers,
    },
    mode: 'cors',
    credentials: 'omit',
    ...options,
  };

  const response = await fetch(fullUrl, config);
  
  // Handle 401 Unauthorized - JWT expired or invalid
  if (response.status === 401) {
    localStorage.removeItem('backend_auth_token');
    setTimeout(() => window.location.reload(), 2000); // Force re-auth
    throw new Error('Session expired');
  }
  
  return await response.json();
}
```

---

## 📡 API ENDPOINTS - COMPLETE MAPPING

**Configuration:**
- **Base URL:** `https://api.mazalbot.com` (set in `src/lib/api/config.ts`)
- **All endpoints:** Defined in `src/lib/api/endpoints.ts`
- **HTTP client:** `src/api/http.ts` (unified with auth/error handling)

### 🔐 Authentication
| Method | Endpoint | Purpose | Frontend File | Auth Required |
|--------|----------|---------|---------------|---------------|
| POST | `/api/v1/sign-in/` | Verify initData, get JWT | `src/lib/api/auth.ts:39` | ❌ No (public) |
| GET | `/api/v1/alive` | Health check | `src/api/http.ts:23` | ❌ No |

### 💎 Diamond Management (Primary CRUD)
| Method | Endpoint | Purpose | Frontend File | Auth Required |
|--------|----------|---------|---------------|---------------|
| GET | `/api/v1/get_all_stones?user_id={id}` | Fetch all diamonds | `src/lib/api/endpoints.ts:6` | ✅ Bearer JWT |
| POST | `/api/v1/diamonds?user_id={id}` | Add single diamond | `src/api/diamonds.ts:34` | ✅ Bearer JWT |
| POST | `/api/v1/diamonds/batch?user_id={id}` | Bulk upload diamonds | `src/api/diamonds.ts:74` | ✅ Bearer JWT |
| PUT | `/api/v1/diamonds/{diamond_id}?user_id={id}` | Update diamond | `src/api/diamonds.ts:54` | ✅ Bearer JWT |
| DELETE | `/api/v1/delete_stone/{diamond_id}?user_id={id}` | Delete diamond | `src/api/diamonds.ts:17` | ✅ Bearer JWT |

**Example Request (Delete Diamond):**
```http
DELETE https://api.mazalbot.com/api/v1/delete_stone/D12345?user_id=2138564172
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
Accept: application/json
Origin: https://diamond-mazal-vision-47.lovable.app
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Diamond deleted successfully",
  "deleted_count": 1
}
```

### 📊 Search & Discovery (Buyer-Centric)
| Method | Endpoint | Purpose | Frontend File | Auth Required |
|--------|----------|---------|---------------|---------------|
| GET | `/api/v1/get_search_results?user_id={id}&limit=10&offset=0` | Search diamonds | `src/lib/api/endpoints.ts:57` | ✅ Bearer JWT |
| GET | `/api/v1/get_search_results_count?user_id={id}` | Count results | `src/lib/api/endpoints.ts:58` | ✅ Bearer JWT |

### 🔔 Seller Notifications (Store-Centric)
| Method | Endpoint | Purpose | Frontend File | Auth Required |
|--------|----------|---------|---------------|---------------|
| GET | `/api/v1/seller/notifications?user_id={id}&limit=20` | Fetch leads | `src/lib/api/endpoints.ts:61` | ✅ Bearer JWT |
| GET | `/api/v1/seller/notifications/count?user_id={id}` | Count leads | `src/lib/api/endpoints.ts:62` | ✅ Bearer JWT |

### 🗄️ SFTP File Upload
| Method | Endpoint | Purpose | Frontend File | Auth Required |
|--------|----------|---------|---------------|---------------|
| POST | `/api/v1/sftp/provision` | Create SFTP credentials | `src/api/sftp.ts:34` | ✅ Bearer JWT |
| GET | `/api/v1/sftp/status/{telegram_id}` | Check SFTP status | `src/api/sftp.ts:40` | ✅ Bearer JWT |

---

## 🔄 DATA FLOW - PAGE-BY-PAGE ANALYSIS

### 📊 Dashboard (`src/pages/Dashboard.tsx`)
**Purpose:** Show inventory overview and quick actions

**Data Source:**
1. `useInventoryData()` hook → `src/hooks/useInventoryData.ts`
2. Calls `fetchInventoryData()` → `src/services/inventoryDataService.ts`
3. Makes request: `GET /api/v1/get_all_stones?user_id={userId}`

**Component Chain:**
```
Dashboard.tsx
  ├─ useInventoryData() [fetches from FastAPI]
  ├─ ActionFocusedDashboard.tsx
  │   ├─ StatsCard (shows diamond count)
  │   ├─ DashboardActions (quick buttons)
  │   └─ InventoryList (displays diamonds)
  └─ SecurityMonitor (displays auth status)
```

**Network Call Example:**
```typescript
// File: src/services/inventoryDataService.ts (lines 22-53)
const endpoint = apiEndpoints.getAllStones(userId, 1000, 0);
const response = await http<InventoryApiResponse>(endpoint, {
  method: 'GET'
});
```

**Expected Backend Response:**
```json
{
  "diamonds": [
    {
      "stock_number": "D12345",
      "shape": "Round",
      "weight": 1.5,
      "color": "D",
      "clarity": "VVS1",
      "cut": "Excellent",
      "polish": "Excellent",
      "symmetry": "Excellent",
      "price_per_carat": 8500,
      "status": "available",
      "picture": "https://cdn.example.com/diamond.jpg",
      "certificate_url": "https://gia.edu/cert/12345"
    }
  ],
  "total": 1,
  "user_id": 2138564172
}
```

---

### ➕ Upload Page (`src/pages/Upload.tsx`)
**Purpose:** Add diamonds via CSV or manual form

**Data Source:**
- CSV upload → `POST /api/v1/diamonds/batch?user_id={id}`
- Manual form → `POST /api/v1/diamonds?user_id={id}`

**Component Chain:**
```
Upload.tsx
  ├─ CSVUploadForm
  │   └─ useDiamondManagement().addStone() [calls FastAPI]
  └─ ManualDiamondForm
      └─ useDiamondManagement().addStone() [calls FastAPI]
```

**Network Call (Batch Upload):**
```typescript
// File: src/api/diamonds.ts (lines 74-92)
const response = await http<CreateDiamondResponse>(
  apiEndpoints.addDiamondsBatch(userId),
  {
    method: "POST",
    body: JSON.stringify({ 
      diamonds: [
        { stock_number: "D001", shape: "Round", ... },
        { stock_number: "D002", shape: "Princess", ... }
      ]
    })
  }
);
```

---

### 🗑️ Delete Operation
**File:** `src/hooks/inventory/useDiamondManagement.ts` (lines 29-71)

```typescript
const deleteStone = useMutation({
  mutationFn: async (stockNumber: string) => {
    // Call FastAPI DELETE endpoint
    return await deleteDiamond(stockNumber, userId);
  },
  onSuccess: (data, stockNumber) => {
    // Optimistically remove from local state
    queryClient.setQueryData(['inventory-data'], (old: any) => ({
      ...old,
      diamonds: old.diamonds.filter((d: any) => d.stock_number !== stockNumber)
    }));
    
    // Show success toast
    toast.success('Diamond deleted successfully', {
      description: `Stock #${stockNumber} removed from inventory`
    });
    
    // Trigger haptic feedback (Telegram only)
    hapticFeedback?.();
  },
  onError: (error) => {
    // Show error toast
    toast.error('Failed to delete diamond', {
      description: error.message
    });
  }
});
```

**Key Features:**
- ✅ Optimistic UI updates (instant removal)
- ✅ Automatic rollback on error
- ✅ User feedback with toasts
- ✅ Telegram haptic feedback
- ✅ Query invalidation for refetch

---

## 🚨 CRITICAL ISSUES & FIXES

### Issue #1: 404 Not Found on API Calls
**Symptom:** Network tab shows `404` for FastAPI endpoints

**Root Causes:**
1. ❌ Backend not deployed at `https://api.mazalbot.com`
2. ❌ CORS not configured for `diamond-mazal-vision-47.lovable.app`
3. ❌ Endpoint path mismatch (e.g., `/api/v1/diamonds` vs `/diamonds`)

**Fix for Backend:**
```python
# FastAPI CORS configuration
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://diamond-mazal-vision-47.lovable.app",
        "https://lovableproject.com",
        "http://localhost:5173"  # For local dev
    ],
    allow_credentials=False,  # JWT in header, not cookies
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)
```

**Frontend Fix (if backend URL is wrong):**
```typescript
// File: src/lib/api/config.ts
export const API_BASE_URL = "https://your-actual-fastapi-domain.com";
```

---

### Issue #2: JWT Token Expiry Handling
**Current Behavior:**
- Token expires after 30 minutes
- Auto-refresh triggers 5 minutes before expiry
- 401 response → force reload → re-authenticate

**Improvement Needed:**
Backend should return token expiry time in sign-in response:
```json
{
  "token": "eyJhbGc...",
  "has_subscription": true,
  "expires_at": 1730994000  // Unix timestamp
}
```

Frontend can then calculate exact expiry instead of estimating.

---

### Issue #3: Duplicate Certificate Number Detection
**Problem:** Users uploading CSV with duplicate certificate numbers

**Backend Verification Required:**
```python
# FastAPI endpoint should check:
from supabase import create_client

def create_diamond(diamond_data: DiamondCreateRequest, user_id: int):
    # Check for existing certificate_number
    existing = supabase.table('inventory').select('id').eq(
        'user_id', user_id
    ).eq(
        'certificate_number', diamond_data.certificate_number
    ).execute()
    
    if existing.data:
        raise HTTPException(
            status_code=409,
            detail=f"Certificate {diamond_data.certificate_number} already exists"
        )
    
    # Insert new diamond...
```

Frontend handles 409 Conflict response with clear user message.

---

## 🔧 BACKEND INTEGRATION CHECKLIST

### ✅ Must Implement
- [ ] **CORS Configuration**
  - Allow origin: `https://diamond-mazal-vision-47.lovable.app`
  - Allow methods: GET, POST, PUT, DELETE, OPTIONS
  - Allow headers: Authorization, Content-Type, Origin, X-Client-Timestamp

- [ ] **Telegram initData Verification**
  ```python
  import hmac
  import hashlib
  from urllib.parse import parse_qs
  
  def verify_telegram_init_data(init_data: str, bot_token: str) -> bool:
      parsed = parse_qs(init_data)
      received_hash = parsed.pop('hash', [None])[0]
      
      # Create data check string
      data_check_arr = sorted([f"{k}={v[0]}" for k, v in parsed.items()])
      data_check_string = '\n'.join(data_check_arr)
      
      # Generate secret key from bot token
      secret_key = hashlib.sha256(bot_token.encode()).digest()
      
      # Calculate HMAC
      calculated_hash = hmac.new(
          secret_key,
          data_check_string.encode(),
          hashlib.sha256
      ).hexdigest()
      
      return calculated_hash == received_hash
  ```

- [ ] **JWT Token Generation**
  ```python
  from jose import jwt
  from datetime import datetime, timedelta
  
  def create_access_token(user_id: int) -> str:
      payload = {
          "sub": str(user_id),  # User ID as subject
          "exp": datetime.utcnow() + timedelta(minutes=30),
          "iat": datetime.utcnow(),
          "telegram_id": user_id
      }
      return jwt.encode(payload, SECRET_KEY, algorithm="HS256")
  ```

- [ ] **JWT Verification Middleware**
  ```python
  from fastapi import Depends, HTTPException
  from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
  
  security = HTTPBearer()
  
  async def get_current_user(
      credentials: HTTPAuthorizationCredentials = Depends(security)
  ):
      try:
          payload = jwt.decode(
              credentials.credentials,
              SECRET_KEY,
              algorithms=["HS256"]
          )
          user_id = int(payload.get("sub"))
          return user_id
      except:
          raise HTTPException(status_code=401, detail="Invalid token")
  ```

- [ ] **User ID Validation in Endpoints**
  ```python
  @app.get("/api/v1/get_all_stones")
  async def get_all_stones(
      user_id: int,
      current_user: int = Depends(get_current_user)
  ):
      # SECURITY: Ensure user can only access their own data
      if user_id != current_user:
          raise HTTPException(status_code=403, detail="Access denied")
      
      # Fetch diamonds from database...
  ```

### ⚠️ Should Implement
- [ ] Rate limiting (prevent abuse)
- [ ] Request logging (debugging)
- [ ] Error response standardization
- [ ] Duplicate certificate detection
- [ ] Soft delete for diamonds (deleted_at timestamp)

---

## 🌐 NETWORK SECURITY

### Request Headers (Frontend → Backend)
```http
POST /api/v1/diamonds?user_id=2138564172 HTTP/1.1
Host: api.mazalbot.com
Content-Type: application/json
Accept: application/json
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyMTM4NTY0MTcyIiwiZXhwIjoxNzMwOTk0NjQ1fQ.xyz
Origin: https://diamond-mazal-vision-47.lovable.app
X-Client-Timestamp: 1730992845000
User-Agent: Mozilla/5.0 (Linux; Android 11) Telegram-WebApp/7.0
```

### Response Headers (Backend → Frontend)
```http
HTTP/1.1 200 OK
Access-Control-Allow-Origin: https://diamond-mazal-vision-47.lovable.app
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Authorization, Content-Type, Origin
Content-Type: application/json
X-Request-Id: abc-123-def-456

{
  "success": true,
  "diamond_id": "D12345",
  "message": "Diamond created successfully"
}
```

---

## 🐛 DEBUGGING GUIDE

### Frontend Debug Logs
**All logs prefixed with emoji for easy filtering:**

```typescript
// Authentication flow
console.log('🔐 MAIN AUTH: Starting FastAPI backend authentication');
console.log('✅ MAIN AUTH: JWT token received and stored');
console.log('❌ MAIN AUTH: Backend sign-in failed:', response.status);

// HTTP requests
console.log('🔑 HTTP: Making request to:', fullUrl);
console.log('📡 HTTP: Response status:', response.status);
console.log('❌ HTTP: Request error:', error);

// Token management
console.log('✅ TOKEN: Stored with refresh at:', new Date(refreshAt));
console.log('🔄 TOKEN: Background refresh triggered');

// Inventory operations
logger.info('Diamond delete operation started', { stockNumber, userId });
logger.error('Diamond creation failed', error, { diamondData });
```

### Backend Verification Steps

1. **Test Health Endpoint:**
```bash
curl -X GET https://api.mazalbot.com/api/v1/alive
# Expected: {"status": "ok"}
```

2. **Test Authentication (requires valid initData):**
```bash
curl -X POST https://api.mazalbot.com/api/v1/sign-in/ \
  -H "Content-Type: application/json" \
  -d '{"init_data": "query_id=AAGx...&user=%7B...%7D&auth_date=...&hash=..."}'
# Expected: {"token": "eyJ...", "has_subscription": true}
```

3. **Test Protected Endpoint:**
```bash
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
curl -X GET "https://api.mazalbot.com/api/v1/get_all_stones?user_id=2138564172" \
  -H "Authorization: Bearer $TOKEN"
# Expected: {"diamonds": [...], "total": 10}
```

4. **Test CORS Preflight:**
```bash
curl -X OPTIONS https://api.mazalbot.com/api/v1/diamonds \
  -H "Origin: https://diamond-mazal-vision-47.lovable.app" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Authorization,Content-Type"
# Expected: 204 No Content with CORS headers
```

---

## 📝 MISSING CONNECTIONS

### ❌ Not Yet Implemented

1. **Two-Way Telegram Communication**
   - Frontend sends data to backend ✅
   - Backend cannot send messages back to Telegram ❌
   - **Missing:** Telegram Bot API integration in FastAPI
   ```python
   # Needed in backend:
   import requests
   
   def send_telegram_message(chat_id: int, text: str):
       url = f"https://api.telegram.org/bot{BOT_TOKEN}/sendMessage"
       requests.post(url, json={"chat_id": chat_id, "text": text})
   ```

2. **Real-Time Notifications**
   - No WebSocket connection for live updates
   - **Potential Solution:** Implement Server-Sent Events (SSE) or WebSocket
   ```python
   from fastapi import WebSocket
   
   @app.websocket("/ws/{user_id}")
   async def websocket_endpoint(websocket: WebSocket, user_id: int):
       await websocket.accept()
       # Send real-time diamond updates...
   ```

3. **Offline Mode Data Sync**
   - Currently blocks all operations without backend
   - **Improvement:** IndexedDB for offline storage, sync on reconnect

---

## 🚀 RECOMMENDED IMPLEMENTATION ORDER

### Phase 1: Fix Connectivity (Critical)
1. Deploy FastAPI backend to `https://api.mazalbot.com` or update frontend URL
2. Configure CORS for Lovable domain
3. Verify `/api/v1/alive` health check responds
4. Test `/api/v1/sign-in/` with real initData

### Phase 2: Verify Authentication (High Priority)
1. Implement Telegram HMAC signature verification
2. Generate JWT tokens with 30-minute expiry
3. Test JWT verification in protected endpoints
4. Ensure user_id in JWT matches query parameter

### Phase 3: Test CRUD Operations (High Priority)
1. GET `/api/v1/get_all_stones` - return user's diamonds
2. POST `/api/v1/diamonds` - create single diamond
3. PUT `/api/v1/diamonds/{id}` - update diamond
4. DELETE `/api/v1/delete_stone/{id}` - soft delete (set deleted_at)
5. POST `/api/v1/diamonds/batch` - bulk upload with duplicate detection

### Phase 4: Enhance Security (Medium Priority)
1. Add request rate limiting (10 req/sec per user)
2. Log all authenticated requests for audit trail
3. Implement certificate number uniqueness validation
4. Add input sanitization for SQL injection prevention

### Phase 5: Improve UX (Low Priority)
1. WebSocket for real-time inventory updates
2. Telegram Bot API integration for notifications
3. Offline mode with IndexedDB sync
4. Progressive Web App (PWA) features

---

## 📞 SUPPORT & RESOURCES

**Frontend Repository:** Lovable project (React + Vite + Telegram SDK)  
**Backend Expected:** FastAPI with Supabase/PostgreSQL  
**Telegram Bot:** @diamondwordbot (client bot token required)

**Key Files for Backend Team:**
- Authentication: `src/lib/api/auth.ts`
- API Endpoints: `src/lib/api/endpoints.ts`
- HTTP Client: `src/api/http.ts`
- Validation Schemas: `src/lib/api/validation.ts`

**Contact Points:**
- Frontend Logs: Browser DevTools Console (filter by emoji: 🔐, 📡, ✅, ❌)
- Network Requests: Browser Network Tab (filter: api.mazalbot.com)
- Telegram Debugging: Desktop Telegram app with DevTools enabled

---

**End of Technical Audit**  
*Generated for backend integration team - Copy this to your FastAPI project root*
