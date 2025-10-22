# AgentPipe CLI Implementation Prompt for Claude Code

Use this prompt with Claude Code when working on the agentpipe CLI codebase to implement real-time session streaming to AgentPipe Web.

---

## Objective

Implement a streaming bridge in agentpipe CLI (Go) that sends real-time conversation events to AgentPipe Web via HTTP POST, enabling users to view live multi-agent conversations in their browser.

---

## Context

**What AgentPipe Does:**
- CLI tool written in Go that orchestrates multi-agent conversations
- Runs agents (Claude, Gemini, GPT, etc.) and manages message flow between them
- Currently saves conversations to local log files

**What We Need:**
Add an **optional** streaming bridge that:
1. Sends conversation events in real-time to AgentPipe Web via HTTP
2. Is opt-in (disabled by default) to respect user privacy
3. Is non-blocking (doesn't slow down conversations)
4. Handles failures gracefully (retries, fallback to local-only)

**Architecture Overview:**
```
Orchestrator
    ├─> Local Logging (existing)
    └─> HTTP Bridge (NEW)
            ↓ POST /api/ingest
        AgentPipe Web
            ↓ Store in PostgreSQL
            ↓ Broadcast via SSE
        Browser Dashboard (real-time view)
```

---

## Implementation Requirements

### 1. Create New Package: `pkg/streaming`

Create a new Go package for streaming functionality with these files:

**`pkg/streaming/client.go`** - HTTP client for sending events
**`pkg/streaming/types.go`** - Event type definitions
**`pkg/streaming/config.go`** - Configuration management

### 2. Event Types to Implement

The bridge must send these events:

#### Event: `conversation.started`
```json
{
  "type": "conversation.started",
  "timestamp": "2025-10-20T10:30:00Z",
  "data": {
    "conversation_id": "conv_abc123",
    "mode": "round-robin",
    "initial_prompt": "Design a web scraper",
    "max_turns": 10,
    "agents": [
      {
        "agent_type": "claude",
        "model": "claude-sonnet-4",
        "name": "Claude",
        "prompt": "You are an expert developer"
      }
    ]
  }
}
```

#### Event: `message.created`
```json
{
  "type": "message.created",
  "timestamp": "2025-10-20T10:30:15Z",
  "data": {
    "conversation_id": "conv_abc123",
    "message_id": "msg_xyz789",
    "agent_type": "claude",
    "agent_name": "Claude",
    "content": "I'll help you design a web scraper...",
    "sequence_number": 1,
    "turn_number": 1,
    "tokens_used": 150,
    "cost": 0.0025
  }
}
```

#### Event: `conversation.completed`
```json
{
  "type": "conversation.completed",
  "timestamp": "2025-10-20T10:35:00Z",
  "data": {
    "conversation_id": "conv_abc123",
    "status": "completed",
    "total_messages": 12,
    "total_turns": 6,
    "total_tokens": 3500,
    "total_cost": 0.045,
    "duration_seconds": 300
  }
}
```

#### Event: `conversation.error`
```json
{
  "type": "conversation.error",
  "timestamp": "2025-10-20T10:32:00Z",
  "data": {
    "conversation_id": "conv_abc123",
    "error_message": "API rate limit exceeded",
    "error_type": "rate_limit_error",
    "agent_type": "claude"
  }
}
```

### 3. HTTP Client Implementation

**Key Requirements:**

**Authentication:**
```go
// Add Authorization header with Bearer token
req.Header.Set("Authorization", "Bearer " + config.APIKey)
```

**Retry Logic:**
- Retry up to 3 times with exponential backoff
- Backoff delays: 1s, 2s, 4s
- Don't retry on 4xx errors (client errors)
- Do retry on 5xx errors and network failures

**Non-Blocking:**
- Send events asynchronously (use goroutines)
- Don't block the main conversation flow
- Buffer events in memory (queue size: 100)
- Drop oldest events if queue full (log warning)

**Error Handling:**
- Log errors but don't fail the conversation
- Provide clear error messages
- Track success/failure metrics

### 4. Configuration

**Environment Variables:**
```bash
# Enable streaming (opt-in)
AGENTPIPE_BRIDGE_ENABLED=true

# API endpoint
AGENTPIPE_BRIDGE_URL=https://agentpipe.example.com

# API key for authentication
AGENTPIPE_BRIDGE_API_KEY=ap_live_xxx

# Timeout for HTTP requests (default: 5s)
AGENTPIPE_BRIDGE_TIMEOUT=5s

# Batch size for message batching (default: 1, no batching)
AGENTPIPE_BRIDGE_BATCH_SIZE=5

# Batch timeout (send when timeout reached, default: 2s)
AGENTPIPE_BRIDGE_BATCH_TIMEOUT=2s
```

**Config File Support (optional):**
```yaml
# ~/.agentpipe/config.yaml
bridge:
  enabled: true
  url: https://agentpipe.example.com
  api_key: ap_live_xxx
  timeout: 5s
  batch_size: 5
  batch_timeout: 2s
```

### 5. Integration Points

**Where to Integrate:**

1. **Orchestrator Initialization:**
   - Check if bridge is enabled
   - Initialize HTTP client if enabled
   - Validate configuration (API key, URL)

2. **Conversation Start:**
   - Generate unique conversation_id (UUID)
   - Send `conversation.started` event
   - Include all initial metadata

3. **Message Creation:**
   - After each agent response
   - Send `message.created` event
   - Include tokens, cost if available

4. **Conversation End:**
   - On successful completion
   - On error/interruption
   - On user cancellation
   - Send `conversation.completed` or `conversation.error`

5. **Error Handling:**
   - On API errors
   - On network errors
   - On rate limiting
   - Send `conversation.error` event

### 6. Code Structure Example

```go
// pkg/streaming/client.go

package streaming

import (
    "bytes"
    "context"
    "encoding/json"
    "fmt"
    "net/http"
    "time"
)

type Client struct {
    config     *Config
    httpClient *http.Client
    eventQueue chan Event
}

func NewClient(config *Config) *Client {
    return &Client{
        config: config,
        httpClient: &http.Client{
            Timeout: config.Timeout,
        },
        eventQueue: make(chan Event, 100),
    }
}

func (c *Client) Start(ctx context.Context) {
    go c.processEvents(ctx)
}

func (c *Client) SendEvent(event Event) error {
    select {
    case c.eventQueue <- event:
        return nil
    default:
        return fmt.Errorf("event queue full")
    }
}

func (c *Client) processEvents(ctx context.Context) {
    for {
        select {
        case event := <-c.eventQueue:
            c.sendEventWithRetry(ctx, event)
        case <-ctx.Done():
            return
        }
    }
}

func (c *Client) sendEventWithRetry(ctx context.Context, event Event) {
    maxRetries := 3
    for attempt := 0; attempt < maxRetries; attempt++ {
        err := c.sendEvent(ctx, event)
        if err == nil {
            return
        }

        // Exponential backoff
        backoff := time.Duration(1<<uint(attempt)) * time.Second
        time.Sleep(backoff)
    }
}

func (c *Client) sendEvent(ctx context.Context, event Event) error {
    data, err := json.Marshal(event)
    if err != nil {
        return err
    }

    req, err := http.NewRequestWithContext(
        ctx,
        "POST",
        c.config.URL+"/api/ingest",
        bytes.NewBuffer(data),
    )
    if err != nil {
        return err
    }

    req.Header.Set("Content-Type", "application/json")
    req.Header.Set("Authorization", "Bearer "+c.config.APIKey)

    resp, err := c.httpClient.Do(req)
    if err != nil {
        return err
    }
    defer resp.Body.Close()

    if resp.StatusCode >= 400 {
        return fmt.Errorf("HTTP %d", resp.StatusCode)
    }

    return nil
}
```

### 7. Testing Requirements

**Unit Tests:**
- Test event serialization (JSON format)
- Test retry logic with mock HTTP server
- Test queue overflow behavior
- Test authentication header

**Integration Tests:**
- Test against local AgentPipe Web instance
- Test full conversation flow
- Test error scenarios (network failure, auth failure)
- Test graceful degradation (bridge fails, conversation continues)

**Manual Testing:**
1. Run agentpipe with bridge enabled
2. Verify events appear in AgentPipe Web dashboard
3. Verify conversation works when bridge is disabled
4. Verify conversation works when bridge fails

### 8. CLI Commands

**Setup Command:**
```bash
# Interactive setup wizard
agentpipe bridge setup

# Prompts:
# - Enable bridge? (y/n)
# - AgentPipe Web URL: https://agentpipe.example.com
# - Generate API key? (y/n)
# - Test connection? (y/n)

# Non-interactive
agentpipe bridge setup \
  --url https://agentpipe.example.com \
  --api-key ap_live_xxx \
  --enable
```

**Status Command:**
```bash
# Show bridge status
agentpipe bridge status

# Output:
# Bridge: Enabled
# URL: https://agentpipe.example.com
# API Key: ap_live_***xxx (masked)
# Last Event: 2 minutes ago
# Success Rate: 98.5%
# Total Events Sent: 1,234
```

**Test Command:**
```bash
# Test bridge connection
agentpipe bridge test

# Output:
# Testing connection to https://agentpipe.example.com...
# ✓ API key valid
# ✓ Connection successful
# ✓ Ingest endpoint responsive
```

### 9. Privacy and Security

**Privacy First:**
- Bridge disabled by default
- Clear opt-in process
- Explain what data is sent
- Easy to disable

**User Communication:**
```
$ agentpipe run --mode round-robin

⚠️  Bridge Not Configured

  To view conversations in your browser, enable the AgentPipe bridge:

  $ agentpipe bridge setup

  This will send conversation data to your AgentPipe Web instance.
  The bridge is completely optional and disabled by default.

  Learn more: https://docs.agentpipe.com/bridge
```

**Security:**
- Require HTTPS in production
- Validate API key format
- Sanitize sensitive data (optional)
- Rate limit client-side (max 100 req/min)

### 10. Performance Optimization

**Message Batching (Optional P1):**
```go
// Instead of sending each message individually,
// batch up to 5 messages or 2 seconds (whichever comes first)

type Batcher struct {
    messages []Event
    timer    *time.Timer
    maxSize  int
    timeout  time.Duration
}

func (b *Batcher) Add(event Event) {
    b.messages = append(b.messages, event)

    if len(b.messages) >= b.maxSize {
        b.Flush()
    } else if b.timer == nil {
        b.timer = time.AfterFunc(b.timeout, b.Flush)
    }
}

func (b *Batcher) Flush() {
    if len(b.messages) == 0 {
        return
    }

    // Send batched events
    client.SendBatch(b.messages)

    b.messages = nil
    b.timer = nil
}
```

**Connection Pooling:**
- Reuse HTTP connections
- Keep-alive enabled
- Connection pool size: 5

### 11. Metrics and Monitoring

**Track These Metrics:**
- Events sent (counter)
- Events failed (counter)
- HTTP request duration (histogram)
- Queue size (gauge)
- Success rate (percentage)

**Logging:**
```go
log.Info("Bridge event sent",
    "type", event.Type,
    "conversation_id", event.Data.ConversationID,
    "duration_ms", duration,
)

log.Error("Bridge event failed",
    "type", event.Type,
    "error", err,
    "attempt", attempt,
)
```

### 12. Error Messages

**Helpful Error Messages:**

❌ **Bad:**
```
Error: HTTP 401
```

✅ **Good:**
```
Bridge authentication failed (HTTP 401)

Your API key is invalid or expired.

To fix this:
  1. Generate a new API key in AgentPipe Web
  2. Update your configuration:
     $ agentpipe bridge setup --api-key <new-key>
  3. Test the connection:
     $ agentpipe bridge test

Alternatively, disable the bridge:
  $ agentpipe bridge disable
```

---

## Implementation Checklist

### Phase 1: Core Infrastructure (2-3 hours)
- [ ] Create `pkg/streaming` package
- [ ] Implement `types.go` (Event structs)
- [ ] Implement `config.go` (Config loading)
- [ ] Implement `client.go` (HTTP client with retry)
- [ ] Add unit tests for event serialization

### Phase 2: Orchestrator Integration (2-3 hours)
- [ ] Add bridge initialization to orchestrator
- [ ] Send `conversation.started` event
- [ ] Send `message.created` events
- [ ] Send `conversation.completed` event
- [ ] Send `conversation.error` events
- [ ] Add integration tests

### Phase 3: CLI Commands (1-2 hours)
- [ ] Implement `bridge setup` command
- [ ] Implement `bridge status` command
- [ ] Implement `bridge test` command
- [ ] Implement `bridge disable` command
- [ ] Add command tests

### Phase 4: Polish (1-2 hours)
- [ ] Add helpful error messages
- [ ] Add documentation (README update)
- [ ] Add example configuration
- [ ] Test end-to-end with AgentPipe Web
- [ ] Add metrics/logging

**Total Estimated Time:** 6-10 hours

---

## Testing Against AgentPipe Web

### Local Development Setup

1. **Start AgentPipe Web:**
```bash
cd /path/to/agentpipe-web
npm run dev
# Web app runs on http://localhost:3000
```

2. **Generate API Key:**
```bash
# In AgentPipe Web, run:
node -e "console.log('ap_live_' + require('crypto').randomBytes(24).toString('base64url'))"
# Output: ap_live_xxxxxxxxxxxxx
```

3. **Configure AgentPipe CLI:**
```bash
export AGENTPIPE_BRIDGE_ENABLED=true
export AGENTPIPE_BRIDGE_URL=http://localhost:3000
export AGENTPIPE_BRIDGE_API_KEY=ap_live_xxxxxxxxxxxxx
```

4. **Run Test Conversation:**
```bash
agentpipe run \
  --mode round-robin \
  --prompt "Write a hello world program" \
  --agents claude,gemini
```

5. **Verify in Browser:**
- Open http://localhost:3000/sessions
- Should see live conversation appearing in real-time

### Production Testing

1. **Use Production URL:**
```bash
export AGENTPIPE_BRIDGE_URL=https://agentpipe.example.com
export AGENTPIPE_BRIDGE_API_KEY=ap_live_prod_xxx
```

2. **Test Connection:**
```bash
agentpipe bridge test
```

3. **Run Production Conversation:**
```bash
agentpipe run --mode round-robin --prompt "Test prompt"
```

---

## Files to Create/Modify

### New Files (Create)
- `pkg/streaming/client.go` - HTTP client implementation
- `pkg/streaming/types.go` - Event type definitions
- `pkg/streaming/config.go` - Configuration management
- `pkg/streaming/client_test.go` - Unit tests
- `cmd/agentpipe/bridge.go` - Bridge CLI commands
- `docs/bridge.md` - Bridge documentation

### Existing Files (Modify)
- `cmd/agentpipe/run.go` - Add bridge initialization
- `pkg/orchestrator/orchestrator.go` - Add event sending
- `README.md` - Add bridge section
- `.env.example` - Add bridge environment variables

---

## Example Usage

After implementation, users will be able to:

```bash
# One-time setup
$ agentpipe bridge setup
? Enable bridge? Yes
? AgentPipe Web URL: https://agentpipe.example.com
? Generate API key? Yes
  Visit: https://agentpipe.example.com/settings/api-keys

? Enter API key: ap_live_xxxxxxxxxxxxx
? Test connection? Yes
  ✓ Connection successful!

Bridge configured successfully!

# Run conversation (streams to web automatically)
$ agentpipe run --mode round-robin --prompt "Build a CLI tool"
Starting conversation...
  Bridge: Enabled (agentpipe.example.com)

Turn 1: Claude is thinking...
Turn 1: Claude responded (247 tokens)
Turn 2: Gemini is thinking...
...

# View in browser
Open: https://agentpipe.example.com/sessions
(See conversation in real-time)

# Check bridge status
$ agentpipe bridge status
Bridge: Enabled
URL: https://agentpipe.example.com
Last Event: 10 seconds ago
Success Rate: 100%
Total Events: 45

# Disable bridge
$ agentpipe bridge disable
Bridge disabled.
```

---

## Success Criteria

Implementation is complete when:

- [ ] Events successfully sent to AgentPipe Web during conversations
- [ ] Conversations appear in web dashboard in real-time (<2s latency)
- [ ] Bridge failures don't break conversations (graceful degradation)
- [ ] CLI commands work (`bridge setup`, `status`, `test`, `disable`)
- [ ] Clear error messages for all failure scenarios
- [ ] Unit tests pass with >80% coverage
- [ ] Integration tests pass against local web instance
- [ ] Documentation updated with bridge setup instructions
- [ ] User can complete full flow: setup → run → view in browser

---

## Additional Resources

**AgentPipe Web API Documentation:**
- Ingest endpoint: `POST /api/ingest`
- Authentication: Bearer token in `Authorization` header
- Rate limit: 100 requests/minute
- Request format: See event types above

**AgentPipe Web Repository:**
- `/Users/kevin/Cloud/Dropbox/work/ai/agentpipe-web`
- API route: `app/api/ingest/route.ts`
- Types: `app/types/index.ts`

**Architecture Documents:**
- `/Users/kevin/Cloud/Dropbox/work/ai/agentpipe-web/docs/STREAMING_ARCHITECTURE.md`
- `/Users/kevin/Cloud/Dropbox/work/ai/agentpipe-web/docs/STREAMING_README.md`

---

## Questions or Issues?

If you encounter any issues or have questions:

1. Check AgentPipe Web logs: `npm run dev` shows request logs
2. Test endpoint manually: `curl -X POST http://localhost:3000/api/ingest -H "Authorization: Bearer xxx" -d '{...}'`
3. Verify API key is valid
4. Check network connectivity (firewall, proxy)

---

**Good luck implementing the bridge! 🚀**
