# 🎯 EXECUTIVE AI AGENTS - MCP INTEGRATION SPECIFICATION

## What I Need From You (Backend/MCP)

I've just created **3 specialized AI agents** for admin management:
- 👨‍💻 **CTO Agent**: Technical/system analysis
- 📊 **CEO Agent**: Business/revenue insights  
- 📱 **Marketing Agent**: User engagement analysis

## Critical Data Requirements

### 1. FastAPI Diamond Data Access
**MOST IMPORTANT**: I need the backend to provide authenticated access to:
```
GET https://api.mazalbot.com/api/v1/get_all_stones
```

**Current Issue**: 
- Frontend gets `403 Forbidden` without authentication
- Agents need to analyze ALL 27,000+ diamonds for accurate insights

**What I Need**:
```typescript
// FastAPI should accept Bearer token from Supabase Edge Function
Authorization: Bearer ${FASTAPI_BEARER_TOKEN}

// Response format expected:
[
  {
    id: string,
    stock_number: string,
    weight: number,
    price_per_carat: number,
    color: string,
    clarity: string,
    shape: string,
    status: string,
    user_id: number,
    // ... other fields
  }
]
```

### 2. Log Analysis Requirements

**CTO Agent Needs**:
- Error logs with frequency analysis
- API response times (avg, p95, p99)
- Database query performance
- System uptime metrics
- Failed requests by endpoint

**CEO Agent Needs**:
- User count (total, active, premium)
- Revenue vs costs breakdown
- Customer LTV (lifetime value)
- Churn rate calculations
- Diamond inventory value from FastAPI

**Marketing Agent Needs**:
- Diamond view counts & durations
- Share analytics (social sharing)
- Conversion rates (view → contact)
- Campaign effectiveness metrics
- Re-engagement opportunities

### 3. Real-Time Context Tracking

**What I'm Currently Sending**:
```json
{
  "message": "User question",
  "user_id": 2138564172,
  "agent_type": "cto" | "ceo" | "marketing",
  "conversation_history": [...],
  "context": {
    "fastapi_url": "https://api.mazalbot.com/api/v1/get_all_stones",
    "include_logs": true,
    "include_analytics": true,
    "include_realtime_data": true
  }
}
```

**What I Need Back**:
```json
{
  "response": "AI-generated insights based on real data",
  "agent_used": "cto",
  "metrics": {
    "data_sources_analyzed": ["fastapi", "supabase_logs", "analytics"],
    "diamond_count": 27453,
    "error_count": 12,
    "revenue": 125000,
    // ... relevant metrics
  },
  "timestamp": "2025-10-30T16:56:21Z"
}
```

### 4. Enhanced Batch Endpoint (From Previous MCP Doc)

**New Requirement for Executive Agents**:
```
POST /api/v1/batch/executive_context?user_id={admin_telegram_id}
```

**Should return in ONE request**:
```json
{
  "diamonds": {
    "total_count": 27453,
    "total_value": 12500000,
    "by_status": {"Available": 25000, "Sold": 2453},
    "avg_price": 5500,
    "premium_count": 3200
  },
  "system_health": {
    "errors_24h": 12,
    "avg_response_time_ms": 245,
    "uptime_percentage": 99.8,
    "slow_queries": 5
  },
  "business_metrics": {
    "users_total": 1250,
    "users_active_7d": 320,
    "revenue_mtd": 45000,
    "costs_mtd": 12000,
    "profit_mtd": 33000
  },
  "engagement": {
    "views_24h": 4500,
    "shares_24h": 120,
    "avg_session_duration_sec": 180,
    "conversion_rate": 0.15
  }
}
```

## Implementation Priorities

### Phase 1: Critical (Immediate)
1. ✅ **Enable FastAPI authentication for Edge Function**
   - Add `FASTAPI_BEARER_TOKEN` to allowed callers
   - Return full diamond array (not paginated for admin)
   - Include all fields (price, status, user_id, etc.)

2. ✅ **Create batch endpoint for executive context**
   - Single endpoint returns all necessary metrics
   - Cached for 5 minutes to reduce load
   - Admin-only access

### Phase 2: Enhanced Analytics (Next)
3. **Pre-calculate common metrics**
   - Daily revenue/cost totals
   - Diamond inventory value by user
   - Error frequency by type
   - User engagement scores

4. **Real-time log streaming**
   - WebSocket for live error feed
   - System health status endpoint
   - Performance monitoring dashboard

### Phase 3: Advanced Insights (Future)
5. **AI-powered recommendations**
   - Anomaly detection in metrics
   - Predictive analytics (churn, revenue)
   - Automated alerts for critical issues

## Current Edge Function

I've deployed: `supabase/functions/executive-agents/index.ts`

**It currently fetches**:
- Supabase error_reports
- Supabase bot_usage_analytics  
- Supabase user_analytics
- FastAPI diamonds (if authenticated)

**What's working**:
✅ Supabase data fetching
✅ AI response generation via Lovable AI Gateway
✅ Agent-specific prompts (CTO/CEO/Marketing)

**What needs FastAPI help**:
❌ Diamond data (getting 403 error)
❌ Batch metrics endpoint
❌ Real-time system health

## Testing Endpoints

**Test FastAPI Access**:
```bash
curl -X GET "https://api.mazalbot.com/api/v1/get_all_stones" \
  -H "Authorization: Bearer ${FASTAPI_BEARER_TOKEN}"
```

**Test Executive Agent**:
```bash
curl -X POST "https://YOUR_SUPABASE_URL/functions/v1/executive-agents" \
  -H "Authorization: Bearer ${SUPABASE_ANON_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Analyze our diamond inventory value",
    "user_id": 2138564172,
    "agent_type": "ceo",
    "context": {
      "fastapi_url": "https://api.mazalbot.com/api/v1/get_all_stones",
      "include_logs": true
    }
  }'
```

## Expected Performance

With proper MCP integration:
- **Agent response time**: < 3 seconds
- **Data freshness**: Real-time (no caching)
- **Concurrent agents**: 3+ can run simultaneously
- **Insights accuracy**: 95%+ (based on real data)

## Questions for Backend Team

1. **Can you whitelist the Supabase Edge Function IP for FastAPI access?**
   - Edge function needs to call `/api/v1/get_all_stones`
   - Should I send a special header for authentication?

2. **Is there an existing batch metrics endpoint?**
   - Or should I create one in FastAPI?
   - What's the preferred caching strategy?

3. **How are logs currently structured?**
   - Are they in database or file-based?
   - Can I query them via API?

4. **What's the rate limit for admin API calls?**
   - Agents might make multiple requests per analysis
   - Should I implement request batching?

5. **Do you track user actions in real-time?**
   - Last page visited
   - Current session duration
   - Active users right now

## Integration Checklist

Frontend (✅ DONE):
- [x] Executive agents hook created
- [x] Dashboard component built
- [x] Quick prompts for each agent type
- [x] Edge function deployed
- [x] Route added to App.tsx
- [x] Admin navigation updated

Backend (❓ NEEDS MCP):
- [ ] FastAPI authentication for Edge Function
- [ ] Batch executive context endpoint
- [ ] Diamond data API accessible
- [ ] Log analysis endpoints
- [ ] Real-time metrics API
- [ ] Error frequency calculations
- [ ] Revenue/cost aggregations

## Success Criteria

When properly integrated:
1. CTO agent can analyze 27K+ diamonds and identify optimization opportunities
2. CEO agent provides accurate revenue/profit analysis
3. Marketing agent shows real user engagement patterns
4. All insights update in < 3 seconds
5. Agents maintain conversation context
6. Data is verifiable against raw sources

---

**Next Steps**: Please review this document and let me know:
1. Which endpoints need to be created?
2. What authentication method should I use?
3. Any existing APIs I should leverage?
4. Timeline for MCP integration?
