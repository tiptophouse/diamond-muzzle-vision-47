# 🔧 Telegram Webhook Setup Guide

## Problem
Auction buttons show "Username not found" because Telegram doesn't know where to send button clicks.

## Solution
Configure the Telegram webhook to point to your edge function.

## Quick Setup (Copy & Paste)

### Option 1: Using Terminal/Command Line

Replace `YOUR_BOT_TOKEN` with your actual bot token, then run:

```bash
curl -X POST "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://uhhljqgxhdhbbhpohxll.supabase.co/functions/v1/telegram-webhook",
    "allowed_updates": ["message", "callback_query"],
    "drop_pending_updates": true
  }'
```

### Option 2: Using Browser/Postman

Send a POST request to:
```
https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook
```

With JSON body:
```json
{
  "url": "https://uhhljqgxhdhbbhpohxll.supabase.co/functions/v1/telegram-webhook",
  "allowed_updates": ["message", "callback_query"],
  "drop_pending_updates": true
}
```

## Verify Setup

Check webhook status:
```bash
curl "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getWebhookInfo"
```

You should see:
```json
{
  "ok": true,
  "result": {
    "url": "https://uhhljqgxhdhbbhpohxll.supabase.co/functions/v1/telegram-webhook",
    "has_custom_certificate": false,
    "pending_update_count": 0,
    "last_error_date": 0,
    "max_connections": 40,
    "ip_address": "..."
  }
}
```

## After Setup

1. ✅ All auction buttons will work
2. ✅ Bids will be processed automatically
3. ✅ Users will receive confirmation messages
4. ✅ Real-time price updates in groups

## Troubleshooting

**Still getting "Username not found"?**
- Wait 1-2 minutes after setup
- Clear webhook: `https://api.telegram.org/bot<YOUR_BOT_TOKEN>/deleteWebhook`
- Re-run setup command

**Check logs:**
- Go to: https://supabase.com/dashboard/project/uhhljqgxhdhbbhpohxll/functions/telegram-webhook/logs
- Click any button in Telegram
- You should see logs appearing

---

**Need help?** Contact @YourUsername
