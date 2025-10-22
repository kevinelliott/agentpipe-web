# Real-Time Event Debugging Guide

## Issue

The dashboard is not receiving real-time updates despite the SSE infrastructure being fully functional.

## Investigation Results

### ✅ Server-Side Components (WORKING)

1. **EventManager** - Fully functional
   - Singleton pattern working correctly
   - Event buffering working (last 100 events)
   - Broadcasting to all connected listeners
   - Conversation-specific and global subscriptions working

2. **SSE Endpoint** (`/api/stream`) - Fully functional
   - Accepting connections
   - Sending connection.established event
   - Replaying buffered events to new subscribers
   - Broadcasting live events as they occur
   - Heartbeat keeping connections alive

3. **Ingest API** (`/api/ingest`) - Fully functional
   - Receiving events from AgentPipe CLI
   - Validating with Zod schemas
   - Storing in database
   - Emitting events to EventManager

### ❌ Client-Side Connection (NOT WORKING)

The dashboard page (`/dashboard`) is **not establishing an SSE connection** to `/api/stream`.

**Evidence:**
- EventManager shows 0 listeners when dashboard is accessed via HTTP
- No `[SSE] New client connected` logs when dashboard page loads
- Events are emitted but not delivered because no clients are listening

## Diagnostic Tools

### 1. Check SSE Status
```bash
curl http://localhost:3000/api/debug/sse-status
```

Returns:
- Current number of connected SSE clients
- Buffered events
- EventManager statistics

**Expected when working:**
```json
{
  "eventManager": {
    "globalListeners": 1,  // Should be > 0 when dashboard is open
    "totalListeners": 1
  }
}
```

### 2. Test Event Emission
```bash
curl http://localhost:3000/api/test/emit-event
```

Manually emits a test event. If SSE clients are connected, they should receive it.

### 3. Test SSE Connection Manually
```bash
curl -N http://localhost:3000/api/stream
```

Should immediately show:
```
data: {"type":"connection.established","timestamp":"...","data":{...}}
```

Then replay any buffered events, then stream live events.

## Root Cause Analysis

The issue is that **the client-side JavaScript is not executing the SSE connection** in the `useRealtimeEvents` hook.

Possible causes:

### 1. JavaScript Error (Most Likely)
Check browser console for errors when loading `/dashboard`:
- TypeError in component rendering
- Uncaught exception preventing hook execution
- Module loading failure

**How to check:**
1. Open browser DevTools (F12)
2. Go to Console tab
3. Navigate to `/dashboard`
4. Look for red error messages

### 2. EventSource Not Available
Some browsers or environments might not support `EventSource`.

**How to check:**
```javascript
console.log('EventSource available:', typeof EventSource !== 'undefined');
```

### 3. Component Not Mounting
The dashboard page might be server-rendering but not hydrating on the client.

**How to check:**
Look for `[SSE Client] useEffect triggered` in browser console (not server logs).

### 4. Production Environment Issues
In production (Vercel), additional factors:
- Edge network might be terminating SSE connections
- Serverless function timeouts
- Cold starts

## Testing Procedure

### Local Development

1. **Start dev server:**
   ```bash
   npm run dev
   ```

2. **Open browser to dashboard:**
   ```
   http://localhost:3000/dashboard
   ```

3. **Check browser console** for:
   ```
   [SSE Client] useEffect triggered, conversationId: null
   [SSE Client] Attempting to connect to: /api/stream
   [SSE Client] Connection established (onopen fired)
   ```

4. **Check server logs** for:
   ```
   [SSE] New client connected (global stream)
   [SSE] EventManager stats AFTER subscribe: {..., globalListeners: 1}
   ```

5. **Send test event:**
   ```bash
   curl http://localhost:3000/api/test/emit-event
   ```

6. **Verify event received** in browser console:
   ```
   [SSE Client] Message received: ...
   [SSE Client] Parsed event type: test.event
   ```

### Production (Vercel)

1. **Check SSE status:**
   ```bash
   curl https://your-app.vercel.app/api/debug/sse-status
   ```

2. **If `globalListeners: 0`:**
   - SSE connection not established
   - Check browser console for errors
   - Check Vercel function logs for SSE connection attempts

3. **Send test conversation:**
   ```bash
   curl -X POST https://your-app.vercel.app/api/ingest \
     -H "Authorization: Bearer YOUR_API_KEY" \
     -H "Content-Type: application/json" \
     -d '{
       "type": "conversation.started",
       "timestamp": "2025-10-22T18:00:00Z",
       "data": {
         "conversation_id": "test-123",
         "mode": "round-robin",
         "initial_prompt": "Test",
         "participants": [{"agent_type": "claude", "name": "Claude"}],
         "system_info": {"agentpipe_version": "1.0.0", "os": "linux", "os_version": "5.0", "go_version": "1.21", "architecture": "amd64"}
       }
     }'
   ```

4. **Check if event buffered:**
   ```bash
   curl https://your-app.vercel.app/api/debug/sse-status
   ```
   Should show event in `bufferedEvents` array.

## Common Fixes

### Fix 1: Hard Refresh Browser
Sometimes cached JavaScript causes issues:
1. Open dashboard
2. Press `Cmd+Shift+R` (Mac) or `Ctrl+Shift+R` (Windows/Linux)
3. Check if SSE connection establishes

### Fix 2: Check for JavaScript Errors
1. Open DevTools Console
2. Clear console
3. Reload dashboard
4. Fix any errors that appear

### Fix 3: Verify EventSource Support
Add to `useRealtimeEvents` hook temporarily:
```typescript
if (typeof EventSource === 'undefined') {
  console.error('[SSE Client] EventSource not supported in this environment!');
  return;
}
```

### Fix 4: Add Error Boundary
Wrap dashboard in error boundary to catch rendering errors:
```typescript
<ErrorBoundary fallback={<div>Error loading dashboard</div>}>
  <Dashboard />
</ErrorBoundary>
```

### Fix 5: Disable Ad Blockers
Some ad blockers interfere with EventSource connections.

## Expected Behavior

### When Working Correctly

**Server Logs:**
```
[SSE] New client connected (global stream)
[SSE] EventManager stats AFTER subscribe: { globalListeners: 1, ... }
[SSE] Subscription complete
[EventManager] Emitting event: conversation.started, listeners: 1, buffer: 0/100
[SSE] Broadcasting event to client: conversation.started
```

**Browser Console:**
```
[SSE Client] useEffect triggered, conversationId: null
[SSE Client] Attempting to connect to: /api/stream
[SSE Client] EventSource created, readyState: 0
[SSE Client] Connection established (onopen fired), readyState: 1
[SSE Client] Message received: {"type":"connection.established",...}
[SSE Client] Parsed event type: connection.established
[SSE Client] Message received: {"type":"conversation.started",...}
[SSE Client] Parsed event type: conversation.started
```

**Dashboard UI:**
- WebSocket status shows "Connected" (green dot)
- New conversations appear automatically
- Recent messages update in real-time
- Metrics refresh when events arrive

## Next Steps

1. **If local development works but production doesn't:**
   - Check Vercel function logs
   - Verify environment variables are set
   - Check for CORS issues
   - Test with Vercel CLI: `vercel dev`

2. **If neither works:**
   - Check browser console for JavaScript errors
   - Verify EventSource is supported
   - Test with different browser
   - Check network tab for failed requests

3. **If SSE connects but events don't arrive:**
   - Check EventManager has listeners: `/api/debug/sse-status`
   - Verify events are being emitted from ingest API
   - Check event buffer: buffered events should be delivered on connection

## Reference

- SSE Endpoint: `app/api/stream/route.ts`
- EventManager: `app/lib/eventManager.ts`
- SSE Hook: `app/hooks/useRealtimeEvents.ts`
- Dashboard: `app/dashboard/page.tsx`
- Ingest API: `app/api/ingest/route.ts`

## Support

If issues persist after following this guide:
1. Check browser console for errors (screenshot if possible)
2. Check `/api/debug/sse-status` output
3. Check server logs for connection attempts
4. Test with `/api/test/emit-event` to verify pipeline
