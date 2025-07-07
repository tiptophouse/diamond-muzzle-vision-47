# 🚨 CRITICAL: API Endpoint Configuration

## Current Issue
The app is configured to use `https://api.mazalbot.com` but this endpoint is returning **404 Not Found** errors.

## Quick Fix Required
**Update the API_BASE_URL in `/src/lib/api/config.ts` to point to your working FastAPI backend.**

```typescript
// REPLACE THIS URL WITH YOUR ACTUAL WORKING FASTAPI ENDPOINT
export const API_BASE_URL = "https://your-actual-api-domain.com";
```

## Common FastAPI Deployment URLs
- **Railway**: `https://your-app.railway.app`
- **Render**: `https://your-app.onrender.com` 
- **Heroku**: `https://your-app.herokuapp.com`
- **DigitalOcean**: `https://your-app.ondigitalocean.app`
- **AWS**: `https://your-api-gateway-url.amazonaws.com`
- **Local Development**: `http://localhost:8000`

## Required FastAPI Endpoints
Your FastAPI backend must support these endpoints:

### Diamond Management
- `POST /api/v1/diamonds?user_id={user_id}` - Add diamond
- `PUT /api/v1/diamonds/{diamond_id}?user_id={user_id}` - Update diamond  
- `DELETE /api/v1/delete_stone/{diamond_id}?user_id={user_id}&diamond_id={diamond_id}` - Delete diamond
- `GET /api/v1/get_all_stones?user_id={user_id}` - Get all diamonds

### Health Check
- `GET /api/v1/alive` - Health check

## Current Fallback Behavior
Until you fix the API endpoint:
- ✅ **Adding stones**: Saves locally with user notification
- ✅ **Deleting stones**: Removes locally with user notification  
- ✅ **User feedback**: Clear success/failure messages
- ✅ **Mobile responsive**: Works perfectly on Telegram mini app
- ✅ **Offline mode indicator**: Shows when API is unavailable

## Test Your API
1. Update the `API_BASE_URL` in `config.ts`
2. Try adding a diamond
3. Check browser Network tab for successful API calls
4. Verify data appears in your backend database

## Need Help?
If you don't have a working FastAPI backend, you'll need to:
1. Deploy your FastAPI application to a cloud provider
2. Update the `API_BASE_URL` to point to your deployed backend
3. Ensure CORS is properly configured for your domain