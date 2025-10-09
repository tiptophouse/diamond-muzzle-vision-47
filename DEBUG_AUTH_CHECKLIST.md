# 🔍 Authentication Debug Checklist

## Problem Location
**File:** `src/hooks/useOptimizedTelegramAuth.ts` - Line 120  
**Issue:** `signInToBackend(initData)` might be returning `null`

---

## 🚨 Common Issues with FastAPI `/api/v1/sign-in/` Endpoint

### 1. **Backend Not Running**
```bash
# Check if backend is accessible
curl https://api.mazalbot.com/api/v1/alive
# Expected: 200 OK
```

### 2. **Wrong Request Format**
The backend might expect different field names. Check if it expects:
- ❓ `init_data` (what we're sending)
- ❓ `initData` (camelCase)
- ❓ `telegram_init_data`
- ❓ Different structure

### 3. **CORS Issues**
Backend must allow:
- Origin: `https://lovable.dev` or your domain
- Method: `POST`
- Headers: `Content-Type: application/json`

### 4. **HMAC Signature Validation Failing**
Backend validates Telegram signature. Issues:
- ✅ Bot token not configured
- ✅ Signature expired (>24 hours old)
- ✅ InitData tampered with
- ✅ Wrong bot token on backend

### 5. **Response Format Mismatch**
We expect: `{ token: "eyJhbGc..." }`  
Backend might return: `{ access_token: "..." }` or different format

---

## 🔧 Enhanced Logging Added

### In `src/lib/api/auth.ts`:
```typescript
✅ Log request payload structure
✅ Log initData sample (first 100 chars)
✅ Log response status and headers
✅ Parse and show error JSON/text
✅ Show user-friendly toast notifications
```

### In `src/hooks/useOptimizedTelegramAuth.ts`:
```typescript
✅ Log initData availability and length
✅ Log signInToBackend call
✅ Log whether token was received or null
✅ Log initData sample on failure
```

---

## 🧪 Testing Steps

### Step 1: Open Browser Console
1. Open app in Telegram
2. Open Chrome DevTools (F12)
3. Go to Console tab

### Step 2: Look for These Logs
```
🔐 MAIN AUTH: Starting FastAPI backend authentication
🔐 MAIN AUTH: InitData length: XXX
🔐 MAIN AUTH: Sign-in URL: https://api.mazalbot.com/api/v1/sign-in/
🔐 MAIN AUTH: Request payload keys: ["init_data"]
🔐 MAIN AUTH: InitData sample (first 100 chars): ...
🔐 MAIN AUTH: Response status: XXX
🔐 MAIN AUTH: Response ok: true/false
```

### Step 3: Check Response Status
- **200**: ✅ Success - check if token exists in response
- **400**: ❌ Bad Request - check request format
- **401**: ❌ Unauthorized - HMAC validation failed
- **403**: ❌ Forbidden - backend policy issue
- **404**: ❌ Not Found - wrong endpoint URL
- **422**: ❌ Validation Error - missing required fields
- **500**: ❌ Server Error - backend crashed

### Step 4: Check Network Tab
1. Go to Network tab in DevTools
2. Filter: `sign-in`
3. Click the request
4. Check **Headers** tab:
   - Request URL
   - Request Method
   - Request Headers
   - Request Payload
5. Check **Response** tab:
   - Response Body
   - Response Headers

---

## 🔍 What to Check Based on Error

### Error: `backend_auth_failed`
**Meaning:** `signInToBackend()` returned `null`

**Check:**
1. Console logs for response status
2. Network tab for actual response
3. Backend logs for server-side errors

**Common Causes:**
- Backend not responding (timeout)
- Wrong response format (no `token` field)
- Backend threw error (4xx/5xx status)

### Error: `no_init_data`
**Meaning:** `window.Telegram.WebApp.initData` is empty

**Check:**
1. App opened in Telegram?
2. Telegram SDK loaded?
3. Bot configuration correct?

### Error: `invalid_user_data`
**Meaning:** JWT decode failed or user data missing

**Check:**
1. JWT format correct?
2. User ID in JWT?
3. JWT expiry valid?

---

## 🛠️ Backend Integration Issues (Fiverr Developer)

### Possible Backend Problems:

#### 1. **Endpoint Expects Different Payload**
```python
# Backend might expect:
class SignInRequest(BaseModel):
    initData: str  # ❌ camelCase instead of init_data
    
# Or:
class SignInRequest(BaseModel):
    telegram_init_data: str  # ❌ different field name
```

**Fix:** Ask backend developer for exact API specification

#### 2. **Backend Returns Wrong Field**
```python
# Backend might return:
{
    "access_token": "...",  # ❌ instead of "token"
    "token_type": "bearer"
}
```

**Fix:** Update frontend to check for `access_token` OR ask backend to change

#### 3. **CORS Not Configured**
```python
# Backend needs:
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://lovable.dev", "https://your-domain.com"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

#### 4. **Bot Token Not Set**
Backend needs `TELEGRAM_BOT_TOKEN` environment variable to verify HMAC

#### 5. **Signature Validation Too Strict**
Backend might reject initData that's >1 minute old (should allow 24h)

---

## 📞 Questions for Backend Developer

1. **What exact JSON structure does `/api/v1/sign-in/` expect?**
   ```json
   {
     "init_data": "...",  // ← Is this correct?
     // OR
     "initData": "...",
     // OR
     "telegram_init_data": "..."
   }
   ```

2. **What exact JSON structure does it return?**
   ```json
   {
     "token": "...",  // ← Is this the field name?
     // OR
     "access_token": "...",
     // OR something else?
   }
   ```

3. **Is CORS properly configured for:**
   - `https://lovable.dev`
   - `https://lovableproject.com`
   - Your production domain

4. **What status codes are returned on:**
   - Success: 200?
   - Invalid signature: 401?
   - Missing fields: 422?
   - Server error: 500?

5. **How long is initData valid? (24 hours recommended)**

6. **Is `TELEGRAM_BOT_TOKEN` environment variable set on backend?**

7. **Are there any additional headers required?**

---

## 🔐 Test Backend Directly

### Using cURL:
```bash
# Replace with actual initData from Telegram
curl -X POST "https://api.mazalbot.com/api/v1/sign-in/" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{
    "init_data": "query_id=AAH...&user=%7B%22id%22..."
  }'
```

### Expected Response:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

## 📝 Next Steps

1. **Run the app** and check console logs
2. **Copy exact error** from console
3. **Check Network tab** for actual request/response
4. **Test backend directly** with cURL
5. **Contact backend developer** with exact error details

---

## 🆘 If Still Failing

### Temporary Workaround (Development Only):
```typescript
// In src/lib/api/auth.ts - FOR TESTING ONLY
export async function signInToBackend(initData: string): Promise<string | null> {
  console.log('⚠️ MOCK AUTH: Using mock token for testing');
  return 'mock_jwt_token_for_testing'; // ← Remove in production!
}
```

This will let you test the rest of the app while fixing backend auth.

---

**Created:** 2025-10-04  
**Status:** Awaiting console logs from user
