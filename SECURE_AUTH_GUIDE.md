# 🔐 Secure Authentication Guide

## Production Authentication (Telegram)

### How It Works
1. User opens app in Telegram Mini App
2. Telegram provides `initData` (cryptographically signed)
3. App sends `initData` to FastAPI `/api/v1/sign-in/`
4. FastAPI validates signature and returns JWT token
5. All API requests use Bearer token authentication

### Security Features
✅ Telegram signature validation (bot token verification)
✅ Timestamp verification (prevents replay attacks)
✅ JWT token for API authentication
✅ No credentials stored client-side
✅ Row-Level Security (RLS) in Supabase

---

## Development Mode (Lovable Preview)

### Secure Testing
For testing outside Telegram, use the **secure development mode**:

```
https://your-app.lovableproject.com/?dev_user_id=123456
```

### Optional Parameters
- `dev_user_id=123456` (required, numeric only)
- `dev_name=John` (optional, default: "Developer")
- `dev_lastname=Doe` (optional, default: "Mode")
- `dev_username=johndoe` (optional, default: "dev")

### Security Restrictions
- ⚠️ Only works on:
  - `localhost`
  - `*.lovableproject.com`
  - `*.lovable.app`
- ❌ **WILL NOT WORK** on custom production domains
- ✅ Creates secure RLS context in Supabase
- ✅ Sets proper user_id for all operations

---

## Testing CRUD Operations

### 1. Enable Development Mode
```
https://your-app.lovableproject.com/?dev_user_id=123456
```

### 2. Test Diamond Operations
- ➕ **Add Diamond**: Go to upload page and create
- ✏️ **Update Diamond**: Edit existing diamond
- 🗑️ **Delete Diamond**: Remove from inventory

### 3. Verify API Calls
Open browser DevTools → Network tab:
- Check requests to `https://api.mazalbot.com`
- Verify `Authorization: Bearer <token>` header
- Confirm `user_id` in query parameters

---

## API Endpoint Configuration

### Current Setup
```typescript
API_BASE_URL = "https://api.mazalbot.com"
```

### Required Endpoints
According to your OpenAPI spec:

```
POST   /api/v1/sign-in/              // Authentication
GET    /api/v1/get_all_stones        // List diamonds (Bearer auth)
POST   /api/v1/diamonds               // Create diamond (Bearer auth)
PUT    /api/v1/diamonds/{id}          // Update diamond (Bearer auth)
DELETE /api/v1/delete_stone/{id}      // Delete diamond (Bearer auth)
```

### Important Note
⚠️ Your DELETE endpoint accepts `diamond_id` as **INTEGER**
- If it's database ID: ✅ Current implementation correct
- If it's stock_number (string): ❌ Needs adjustment

---

## Troubleshooting

### "User not authenticated" Error
**Solution**: Add `?dev_user_id=123456` to URL

### Operations Not Working
1. Check console for API errors
2. Verify `https://api.mazalbot.com` is accessible
3. Confirm Bearer token in Network tab
4. Check FastAPI logs for validation errors

### 404 Errors from API
- Verify `API_BASE_URL` is correct
- Check endpoint paths match FastAPI routes
- Confirm FastAPI server is running

---

## Security Best Practices

### ✅ What We Do
- Client-side initData validation
- Server-side signature verification
- JWT token with expiration
- HTTPS only communication
- RLS policies in Supabase
- No hardcoded credentials

### ❌ What We Don't Do
- Store passwords client-side
- Use localStorage for tokens (uses memory)
- Bypass authentication in production
- Accept unsigned requests
- Trust client-side user IDs without verification

---

## For Production Deployment

### Checklist
- [ ] Remove development bypass code
- [ ] Verify all endpoints use Bearer auth
- [ ] Test with real Telegram Mini App
- [ ] Enable CORS for your domain
- [ ] Set up proper error monitoring
- [ ] Review RLS policies
- [ ] Test all CRUD operations

### Environment Variables
Make sure FastAPI has:
```env
TELEGRAM_BOT_TOKEN=your_bot_token
JWT_SECRET_KEY=your_secret_key
DATABASE_URL=your_database_url
```

---

## Need Help?

If operations still not working:
1. Check browser console logs
2. Check FastAPI server logs  
3. Verify API endpoint URLs
4. Test with `?dev_user_id=123456`
5. Confirm Bearer token is being sent
