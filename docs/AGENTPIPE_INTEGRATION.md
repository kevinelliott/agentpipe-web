# AgentPipe Integration Guide

This document outlines the required changes to the AgentPipe Go application to enable realtime data delivery to AgentPipe Web.

## ⚠️ Important: Opt-In Only

**AgentPipe does NOT send data to AgentPipe Web by default.**

The bridge feature must be **explicitly enabled** in your configuration. No conversation data is collected or transmitted unless you choose to enable it.

### Why Enable Data Sharing?

✅ **Realtime Monitoring**: View conversations as they happen
✅ **Historical Search**: Search through past conversations
✅ **Performance Analytics**: Track costs, tokens, and response times
✅ **Agent Comparison**: Compare different AI models and agents
✅ **Team Collaboration**: Share insights with your team (optional)

### Privacy & Security

🔒 Data is only sent when bridge is enabled
🔒 You control what instances receive your data
🔒 API key authentication required
🔒 HTTPS encryption in transit
🔒 Data can be deleted at any time
🔒 Full transparency on what's collected

See the [Opt-In Design](OPT_IN_DESIGN.md) document for details on user privacy and data handling.

## Overview

AgentPipe Web receives realtime conversation and message events via HTTP webhooks sent to the `/api/ingest` endpoint. To enable this, AgentPipe needs a **Bridge Component** that captures events during orchestration and sends them to the web application.

## Architecture

```
┌─────────────────────────────────────────┐
│         AgentPipe (Go)                  │
│                                         │
│  ┌──────────────────────────────────┐  │
│  │      Orchestrator                │  │
│  │  - Manages conversations         │  │
│  │  - Coordinates agent turns       │  │
│  │  - Captures messages             │  │
│  └─────────────┬────────────────────┘  │
│                │                        │
│                │ Events                 │
│                ▼                        │
│  ┌──────────────────────────────────┐  │
│  │      Bridge Component (NEW)      │  │
│  │  - Captures orchestrator events  │  │
│  │  - Buffers events                │  │
│  │  - Sends to AgentPipe Web        │  │
│  └─────────────┬────────────────────┘  │
│                │                        │
└────────────────┼────────────────────────┘
                 │ HTTP POST
                 ▼
┌─────────────────────────────────────────┐
│      AgentPipe Web (Next.js)            │
│                                         │
│  POST /api/ingest                       │
│  - Receives events                      │
│  - Stores in PostgreSQL                 │
│  - Broadcasts via SSE                   │
└─────────────────────────────────────────┘
```

## Required Changes to AgentPipe

### 1. Create Bridge Package

**File:** `pkg/bridge/bridge.go`

```go
package bridge

import (
    "bytes"
    "encoding/json"
    "fmt"
    "net/http"
    "time"

    "github.com/kevinelliott/agentpipe/pkg/agent"
    "github.com/kevinelliott/agentpipe/pkg/log"
)

// BridgeConfig holds configuration for the bridge
type BridgeConfig struct {
    Enabled  bool   `yaml:"enabled"`
    Type     string `yaml:"type"` // "http", "websocket", "redis"
    URL      string `yaml:"url"`
    Auth     AuthConfig `yaml:"auth"`
    Timeout  time.Duration `yaml:"timeout"`
    RetryMax int    `yaml:"retry_max"`
}

type AuthConfig struct {
    Type  string `yaml:"type"` // "bearer", "basic", "none"
    Token string `yaml:"token"`
}

// Event types
const (
    EventConversationStarted    = "conversation.started"
    EventConversationCompleted  = "conversation.completed"
    EventConversationInterrupted = "conversation.interrupted"
    EventMessageCreated         = "message.created"
    EventTurnStarted           = "turn.started"
    EventTurnCompleted         = "turn.completed"
    EventErrorOccurred         = "error.occurred"
)

// Event represents a bridge event
type Event struct {
    Type      string      `json:"type"`
    Timestamp time.Time   `json:"timestamp"`
    Data      interface{} `json:"data"`
}

// ConversationStartedData represents data for conversation.started event
type ConversationStartedData struct {
    ConversationID string                 `json:"conversationId,omitempty"`
    Mode           string                 `json:"mode"`
    MaxTurns       int                    `json:"maxTurns,omitempty"`
    InitialPrompt  string                 `json:"initialPrompt"`
    Participants   []ParticipantData      `json:"participants"`
    Metadata       map[string]interface{} `json:"metadata,omitempty"`
}

// ParticipantData represents agent participant data
type ParticipantData struct {
    AgentID      string                 `json:"agentId"`
    AgentType    string                 `json:"agentType"`
    AgentName    string                 `json:"agentName"`
    Model        string                 `json:"model,omitempty"`
    Prompt       string                 `json:"prompt,omitempty"`
    Announcement string                 `json:"announcement,omitempty"`
    Settings     map[string]interface{} `json:"settings,omitempty"`
}

// MessageCreatedData represents data for message.created event
type MessageCreatedData struct {
    ConversationID string         `json:"conversationId"`
    Message        MessageData    `json:"message"`
}

// MessageData represents message data
type MessageData struct {
    AgentID   string                  `json:"agentId"`
    AgentName string                  `json:"agentName"`
    AgentType string                  `json:"agentType"`
    Content   string                  `json:"content"`
    Role      string                  `json:"role"`
    Timestamp time.Time               `json:"timestamp"`
    Metrics   *agent.ResponseMetrics  `json:"metrics,omitempty"`
}

// ConversationCompletedData represents data for conversation.completed event
type ConversationCompletedData struct {
    ConversationID string  `json:"conversationId"`
    TotalMessages  int     `json:"totalMessages"`
    TotalTokens    int     `json:"totalTokens"`
    TotalCost      float64 `json:"totalCost"`
    TotalDuration  int64   `json:"totalDuration"` // milliseconds
}

// Bridge interface defines bridge behavior
type Bridge interface {
    EmitEvent(event Event) error
    Close() error
}

// HTTPBridge sends events via HTTP POST
type HTTPBridge struct {
    config     BridgeConfig
    httpClient *http.Client
}

// NewHTTPBridge creates a new HTTP bridge
func NewHTTPBridge(config BridgeConfig) *HTTPBridge {
    timeout := config.Timeout
    if timeout == 0 {
        timeout = 10 * time.Second
    }

    return &HTTPBridge{
        config: config,
        httpClient: &http.Client{
            Timeout: timeout,
        },
    }
}

// EmitEvent sends an event to the HTTP endpoint
func (b *HTTPBridge) EmitEvent(event Event) error {
    if !b.config.Enabled {
        return nil
    }

    // Marshal event to JSON
    payload, err := json.Marshal(event)
    if err != nil {
        log.Error().Err(err).Msg("Failed to marshal bridge event")
        return fmt.Errorf("marshal event: %w", err)
    }

    // Create request
    req, err := http.NewRequest("POST", b.config.URL, bytes.NewBuffer(payload))
    if err != nil {
        log.Error().Err(err).Msg("Failed to create bridge request")
        return fmt.Errorf("create request: %w", err)
    }

    // Set headers
    req.Header.Set("Content-Type", "application/json")

    // Add authentication
    if b.config.Auth.Type == "bearer" && b.config.Auth.Token != "" {
        req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", b.config.Auth.Token))
    }

    // Send request with retries
    var lastErr error
    maxRetries := b.config.RetryMax
    if maxRetries == 0 {
        maxRetries = 3
    }

    for attempt := 0; attempt <= maxRetries; attempt++ {
        if attempt > 0 {
            // Exponential backoff
            backoff := time.Duration(attempt*attempt) * time.Second
            time.Sleep(backoff)
            log.Debug().
                Int("attempt", attempt).
                Dur("backoff", backoff).
                Msg("Retrying bridge request")
        }

        resp, err := b.httpClient.Do(req)
        if err != nil {
            lastErr = err
            log.Warn().
                Err(err).
                Int("attempt", attempt).
                Msg("Bridge request failed")
            continue
        }

        defer resp.Body.Close()

        if resp.StatusCode >= 200 && resp.StatusCode < 300 {
            log.Debug().
                Str("event_type", event.Type).
                Int("status", resp.StatusCode).
                Msg("Bridge event sent successfully")
            return nil
        }

        lastErr = fmt.Errorf("unexpected status code: %d", resp.StatusCode)
        log.Warn().
            Int("status", resp.StatusCode).
            Int("attempt", attempt).
            Msg("Bridge request returned error status")
    }

    return fmt.Errorf("failed after %d retries: %w", maxRetries, lastErr)
}

// Close closes the HTTP bridge
func (b *HTTPBridge) Close() error {
    // HTTP client doesn't need explicit cleanup
    return nil
}

// NewBridge creates a new bridge based on configuration
func NewBridge(config BridgeConfig) (Bridge, error) {
    if !config.Enabled {
        return &NoOpBridge{}, nil
    }

    switch config.Type {
    case "http", "":
        return NewHTTPBridge(config), nil
    default:
        return nil, fmt.Errorf("unsupported bridge type: %s", config.Type)
    }
}

// NoOpBridge is a bridge that does nothing
type NoOpBridge struct{}

func (b *NoOpBridge) EmitEvent(event Event) error { return nil }
func (b *NoOpBridge) Close() error                { return nil }
```

### 2. Update Configuration Schema

**File:** `pkg/config/config.go`

Add the bridge configuration to the main config struct:

```go
type Config struct {
    Version     string
    Agents      []AgentConfig
    Orchestrator OrchestratorConfig
    Logging     LoggingConfig
    Metrics     MetricsConfig
    Bridge      bridge.BridgeConfig `yaml:"bridge"` // NEW
}
```

### 3. Update Orchestrator to Emit Events

**File:** `pkg/orchestrator/orchestrator.go`

Add bridge field and emit events at key points:

```go
import (
    "github.com/kevinelliott/agentpipe/pkg/bridge"
)

type Orchestrator struct {
    // ... existing fields ...
    bridge         bridge.Bridge
    conversationID string
    startTime      time.Time
}

// NewOrchestrator creates a new orchestrator with bridge support
func NewOrchestrator(agents []agent.Agent, config *config.Config, brg bridge.Bridge) *Orchestrator {
    return &Orchestrator{
        agents:         agents,
        config:         config,
        bridge:         brg,
        conversationID: generateConversationID(), // NEW helper function
        // ... other initialization ...
    }
}

// Run executes the orchestration with bridge events
func (o *Orchestrator) Run(ctx context.Context) error {
    o.startTime = time.Now()

    // Emit conversation started event
    o.emitConversationStarted()

    // ... existing orchestration logic ...

    // On completion
    defer func() {
        if err := recover(); err != nil {
            o.emitConversationInterrupted(fmt.Sprintf("panic: %v", err))
            panic(err)
        } else {
            o.emitConversationCompleted()
        }
    }()

    // ... rest of Run method ...
}

// Helper methods to emit events

func (o *Orchestrator) emitConversationStarted() {
    participants := make([]bridge.ParticipantData, len(o.agents))
    for i, ag := range o.agents {
        config := ag.GetConfig() // Assume agents expose their config
        participants[i] = bridge.ParticipantData{
            AgentID:      ag.GetID(),
            AgentType:    ag.GetType(),
            AgentName:    ag.GetName(),
            Model:        ag.GetModel(),
            Prompt:       config.Prompt,
            Announcement: ag.Announce(),
        }
    }

    event := bridge.Event{
        Type:      bridge.EventConversationStarted,
        Timestamp: time.Now(),
        Data: bridge.ConversationStartedData{
            ConversationID: o.conversationID,
            Mode:           o.config.Orchestrator.Mode,
            MaxTurns:       o.config.Orchestrator.MaxTurns,
            InitialPrompt:  o.config.Orchestrator.InitialPrompt,
            Participants:   participants,
        },
    }

    if err := o.bridge.EmitEvent(event); err != nil {
        log.Warn().Err(err).Msg("Failed to emit conversation started event")
    }
}

func (o *Orchestrator) emitMessageCreated(msg agent.Message) {
    event := bridge.Event{
        Type:      bridge.EventMessageCreated,
        Timestamp: time.Now(),
        Data: bridge.MessageCreatedData{
            ConversationID: o.conversationID,
            Message: bridge.MessageData{
                AgentID:   msg.AgentID,
                AgentName: msg.AgentName,
                AgentType: msg.AgentType,
                Content:   msg.Content,
                Role:      msg.Role,
                Timestamp: time.Unix(msg.Timestamp, 0),
                Metrics:   msg.Metrics,
            },
        },
    }

    if err := o.bridge.EmitEvent(event); err != nil {
        log.Warn().Err(err).Msg("Failed to emit message created event")
    }
}

func (o *Orchestrator) emitConversationCompleted() {
    totalTokens := 0
    totalCost := 0.0
    for _, msg := range o.messages {
        if msg.Metrics != nil {
            totalTokens += msg.Metrics.TotalTokens
            totalCost += msg.Metrics.Cost
        }
    }

    duration := time.Since(o.startTime).Milliseconds()

    event := bridge.Event{
        Type:      bridge.EventConversationCompleted,
        Timestamp: time.Now(),
        Data: bridge.ConversationCompletedData{
            ConversationID: o.conversationID,
            TotalMessages:  len(o.messages),
            TotalTokens:    totalTokens,
            TotalCost:      totalCost,
            TotalDuration:  duration,
        },
    }

    if err := o.bridge.EmitEvent(event); err != nil {
        log.Warn().Err(err).Msg("Failed to emit conversation completed event")
    }
}

func (o *Orchestrator) emitConversationInterrupted(reason string) {
    event := bridge.Event{
        Type:      bridge.EventConversationInterrupted,
        Timestamp: time.Now(),
        Data: map[string]interface{}{
            "conversationId": o.conversationID,
            "reason":         reason,
        },
    }

    if err := o.bridge.EmitEvent(event); err != nil {
        log.Warn().Err(err).Msg("Failed to emit conversation interrupted event")
    }
}

// Update existing message processing to emit events
func (o *Orchestrator) processTurn(ctx context.Context, agent agent.Agent) error {
    // ... existing turn logic ...

    // After message is received from agent
    msg := agent.Message{
        AgentID:   agent.GetID(),
        AgentName: agent.GetName(),
        // ... populate message ...
    }

    o.messages = append(o.messages, msg)

    // Emit message created event
    o.emitMessageCreated(msg)

    return nil
}
```

### 4. Update Main Command to Initialize Bridge

**File:** `cmd/run.go`

```go
import (
    "github.com/kevinelliott/agentpipe/pkg/bridge"
)

func runConversation(cfg *config.Config) error {
    // ... existing agent initialization ...

    // Initialize bridge
    brg, err := bridge.NewBridge(cfg.Bridge)
    if err != nil {
        return fmt.Errorf("failed to initialize bridge: %w", err)
    }
    defer brg.Close()

    // Create orchestrator with bridge
    orch := orchestrator.NewOrchestrator(agents, cfg, brg)

    // ... rest of run logic ...
}
```

### 5. Configuration File Example

**File:** `examples/config-with-bridge.yaml`

```yaml
version: "1.0"

# Bridge configuration for realtime delivery to AgentPipe Web
bridge:
  enabled: true
  type: http
  url: http://localhost:3000/api/ingest
  auth:
    type: bearer
    token: your-secret-api-key-here
  timeout: 10s
  retry_max: 3

agents:
  - id: claude-1
    type: claude
    name: Claude
    model: claude-sonnet-4
    prompt: "You are a helpful AI assistant."
    # ... rest of agent config ...

  - id: gemini-1
    type: gemini
    name: Gemini
    model: gemini-pro
    prompt: "You are a creative AI assistant."
    # ... rest of agent config ...

orchestrator:
  mode: round-robin
  max_turns: 10
  initial_prompt: "Discuss the benefits of multi-agent systems"
  # ... rest of orchestrator config ...

logging:
  enabled: true
  # ... rest of logging config ...
```

### 6. Helper Function for Conversation ID

**File:** `pkg/orchestrator/helpers.go` (NEW)

```go
package orchestrator

import (
    "crypto/rand"
    "encoding/hex"
    "fmt"
    "time"
)

// generateConversationID generates a unique conversation ID
func generateConversationID() string {
    // Use timestamp + random bytes for uniqueness
    timestamp := time.Now().Unix()
    randomBytes := make([]byte, 8)
    rand.Read(randomBytes)
    randomHex := hex.EncodeToString(randomBytes)

    return fmt.Sprintf("conv_%d_%s", timestamp, randomHex)
}
```

## Event Flow Diagram

```
AgentPipe Conversation Lifecycle:

1. User runs: agentpipe run --config config.yaml
   ↓
2. Orchestrator.Run() starts
   ↓
3. Bridge emits: conversation.started
   → POST to AgentPipe Web /api/ingest
   → Web stores conversation in PostgreSQL
   → Web broadcasts to SSE clients
   ↓
4. For each turn:
   a. Agent processes message
   b. Orchestrator receives response
   c. Bridge emits: message.created
      → POST to AgentPipe Web /api/ingest
      → Web stores message in PostgreSQL
      → Web broadcasts to SSE clients
      → Web updates conversation aggregates
   ↓
5. Conversation ends (max turns or user interrupt)
   ↓
6. Bridge emits: conversation.completed or conversation.interrupted
   → POST to AgentPipe Web /api/ingest
   → Web updates conversation status
   → Web broadcasts final event
```

## Security Considerations

1. **API Key Authentication**
   - Generate a strong random API key
   - Store in environment variable or secure config
   - Rotate periodically

2. **HTTPS in Production**
   - Always use HTTPS for bridge URL in production
   - Validate SSL certificates

3. **Rate Limiting**
   - AgentPipe Web has rate limiting built-in
   - Configure appropriate limits for your use case

4. **Error Handling**
   - Bridge failures are non-blocking (logged as warnings)
   - Conversation continues even if bridge is down
   - Retries with exponential backoff

## Testing

### 1. Unit Tests

**File:** `pkg/bridge/bridge_test.go`

```go
package bridge_test

import (
    "net/http"
    "net/http/httptest"
    "testing"
    "time"

    "github.com/kevinelliott/agentpipe/pkg/bridge"
    "github.com/stretchr/testify/assert"
)

func TestHTTPBridge_EmitEvent(t *testing.T) {
    // Create test server
    server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        assert.Equal(t, "POST", r.Method)
        assert.Equal(t, "application/json", r.Header.Get("Content-Type"))
        assert.Equal(t, "Bearer test-token", r.Header.Get("Authorization"))
        w.WriteHeader(http.StatusOK)
    }))
    defer server.Close()

    // Create bridge
    config := bridge.BridgeConfig{
        Enabled: true,
        Type:    "http",
        URL:     server.URL,
        Auth: bridge.AuthConfig{
            Type:  "bearer",
            Token: "test-token",
        },
    }
    brg := bridge.NewHTTPBridge(config)

    // Emit event
    event := bridge.Event{
        Type:      bridge.EventConversationStarted,
        Timestamp: time.Now(),
        Data: bridge.ConversationStartedData{
            ConversationID: "test-conv-1",
            Mode:           "round-robin",
        },
    }

    err := brg.EmitEvent(event)
    assert.NoError(t, err)
}
```

### 2. Integration Test

Run AgentPipe with bridge enabled and verify events are received by AgentPipe Web:

```bash
# Terminal 1: Start AgentPipe Web
cd agentpipe-web
npm run dev

# Terminal 2: Run AgentPipe with bridge
cd agentpipe
go run main.go run --config examples/config-with-bridge.yaml

# Terminal 3: Monitor SSE stream
curl -N http://localhost:3000/api/realtime/stream

# You should see events streaming in real-time
```

## Deployment

### Development

1. Start AgentPipe Web locally:
   ```bash
   cd agentpipe-web
   npm run dev
   ```

2. Configure AgentPipe bridge to point to localhost:
   ```yaml
   bridge:
     enabled: true
     url: http://localhost:3000/api/ingest
     auth:
       token: dev-api-key-12345
   ```

3. Run AgentPipe:
   ```bash
   agentpipe run --config config.yaml
   ```

### Production

1. Deploy AgentPipe Web to Vercel/other host

2. Update AgentPipe bridge configuration:
   ```yaml
   bridge:
     enabled: true
     url: https://agentpipe-web.yourdomain.com/api/ingest
     auth:
       token: ${AGENTPIPE_WEB_API_KEY} # Use env var
   ```

3. Set environment variable:
   ```bash
   export AGENTPIPE_WEB_API_KEY="your-production-api-key"
   ```

4. Run AgentPipe with bridge enabled

## Troubleshooting

### Bridge Events Not Appearing in Web UI

1. Check AgentPipe logs for bridge errors:
   ```
   WARN Failed to emit conversation started event error="..."
   ```

2. Verify bridge configuration:
   - URL is correct and accessible
   - API key matches `AGENTPIPE_BRIDGE_API_KEY` in AgentPipe Web
   - Bridge is enabled (`enabled: true`)

3. Test connection manually:
   ```bash
   curl -X POST http://localhost:3000/api/ingest \
     -H "Authorization: Bearer your-api-key" \
     -H "Content-Type: application/json" \
     -d '{
       "type": "conversation.started",
       "timestamp": "2025-10-15T10:00:00Z",
       "data": {
         "mode": "round-robin",
         "initialPrompt": "test",
         "participants": []
       }
     }'
   ```

4. Check AgentPipe Web logs for ingest endpoint errors

### High Latency

1. Reduce retry attempts:
   ```yaml
   bridge:
     retry_max: 1
   ```

2. Increase timeout:
   ```yaml
   bridge:
     timeout: 30s
   ```

3. Consider using async queue (Redis) for high-volume scenarios

### Missing Events

1. Verify orchestrator is calling emit methods
2. Check that bridge is not disabled in config
3. Review AgentPipe logs for warnings
4. Ensure network connectivity between AgentPipe and Web

## Future Enhancements

1. **WebSocket Support**
   - Persistent connection for lower latency
   - Bidirectional communication

2. **Redis Queue**
   - Decouple event emission from HTTP calls
   - Better reliability for high-volume scenarios

3. **Batch Events**
   - Group multiple events into single request
   - Reduce HTTP overhead

4. **Compression**
   - Gzip compression for large payloads
   - Reduce bandwidth usage

5. **Event Replay**
   - Store events locally in case of network failure
   - Replay when connection restored

## Summary

This integration enables realtime delivery of AgentPipe conversations to AgentPipe Web through a bridge component. The implementation:

- ✅ Non-blocking: Bridge failures don't stop conversations
- ✅ Reliable: Automatic retries with exponential backoff
- ✅ Secure: Bearer token authentication
- ✅ Flexible: Configurable via YAML
- ✅ Extensible: Easy to add new bridge types (WebSocket, Redis)

**Estimated Implementation Time:** 4-6 hours

**Files to Create/Modify:**
- NEW: `pkg/bridge/bridge.go` (300 lines)
- NEW: `pkg/bridge/bridge_test.go` (100 lines)
- NEW: `pkg/orchestrator/helpers.go` (20 lines)
- MODIFY: `pkg/config/config.go` (1 line)
- MODIFY: `pkg/orchestrator/orchestrator.go` (100 lines)
- MODIFY: `cmd/run.go` (10 lines)
- NEW: `examples/config-with-bridge.yaml` (50 lines)
