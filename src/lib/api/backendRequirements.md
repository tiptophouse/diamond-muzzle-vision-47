
# Backend API Requirements for Diamond Muzzle

## Diamond Deletion Endpoint

### DELETE /api/v1/delete_stone/{stock_number}

**Purpose**: Delete a diamond from the user's inventory

**Headers Required**:
```
Authorization: Bearer {BACKEND_ACCESS_TOKEN}
Content-Type: application/json
```

**Request Body**:
```json
{
  "user_id": 123456789
}
```

**Success Response** (200 OK):
```json
{
  "success": true,
  "message": "Diamond deleted successfully",
  "stock_number": "ABC123"
}
```

**Error Responses**:

Not Found (404):
```json
{
  "success": false,
  "error": "Diamond not found",
  "stock_number": "ABC123"
}
```

Unauthorized (403):
```json
{
  "success": false,
  "error": "Not authorized to delete this diamond"
}
```

Server Error (500):
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

## User Profile Endpoints (Future Implementation)

### GET /api/v1/user/profile/{telegram_id}
**Purpose**: Get user profile information

### PUT /api/v1/user/profile/{telegram_id}
**Purpose**: Update user profile information

**Request Body**:
```json
{
  "first_name": "John",
  "last_name": "Doe",
  "email": "john@example.com",
  "phone_number": "+1234567890",
  "company": "Diamond Co",
  "website": "https://example.com",
  "bio": "Diamond dealer with 10+ years experience",
  "timezone": "America/New_York"
}
```

---

## Notes for Backend Developer

1. **Authentication**: All endpoints should validate the `BACKEND_ACCESS_TOKEN`
2. **User Authorization**: Ensure users can only delete/modify their own diamonds
3. **Database Consistency**: Make sure deleted diamonds are actually removed from the database
4. **Error Handling**: Return appropriate HTTP status codes and error messages
5. **Logging**: Log all deletion attempts for audit purposes

## Testing Endpoints

You can test the deletion endpoint with:

```bash
curl -X DELETE "https://api.mazalbot.com/api/v1/delete_stone/TEST123" \
  -H "Authorization: Bearer ifj9ov1rh20fslfp" \
  -H "Content-Type: application/json" \
  -d '{"user_id": 123456789}'
```
