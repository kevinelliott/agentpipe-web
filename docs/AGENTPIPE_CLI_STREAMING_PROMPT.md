# AgentPipe CLI Real-Time Streaming Implementation

## Objective

Add **optional** real-time streaming capabilities to the agentpipe CLI to send conversation events to AgentPipe Web via HTTP API. This feature must be:
- **Opt-in only** (disabled by default)
- **Non-blocking** (streaming failures don't stop conversations)
- **Privacy-focused** (user explicitly enables, clear about what data is sent)
- **Production-ready** (proper error handling, retries, timeouts)

## Background

AgentPipe Web has implemented a streaming ingestion API at `/api/ingest` that accepts real-time conversation events. We need to implement the client-side in the agentpipe CLI to optionally stream events during conversations.

**Web API Endpoint**: `POST /api/ingest` (appended to base URL)
**Authentication**: Bearer token (user-provided API key)
**Rate Limit**: 100 requests/minute per conversation

## Requirements

### 1. Streaming Configuration

Users can enable streaming via (in order of precedence):

**CLI Flag** (highest priority):
```bash
agentpipe run --stream --stream-url="https://agentpipe.ai" \
  --stream-api-key="sk_xxx" "Hello agents"
```

**Environment Variables**:
```bash
export AGENTPIPE_STREAM_ENABLED=true
export AGENTPIPE_STREAM_URL=https://agentpipe.ai
export AGENTPIPE_STREAM_API_KEY=sk_your_api_key_here
```

**Config File** (`~/.agentpipe/config.yaml`):
```yaml
bridge:
  enabled: true
  url: "https://agentpipe.ai"  # Base URL only (no /api/ingest)
  api_key: "sk_your_api_key_here"
  timeout_ms: 10000
  retry_attempts: 3
  log_level: "debug"
```

**Build-Time Defaults**:
- Development builds: `http://localhost:3000`
- Production builds: `https://agentpipe.ai`
- User can always override with env var or flag
- **Important**: Store only base URLs, append `/api/ingest` in code

### 2. Event Types & Schemas

The CLI must emit 4 event types that match the web app's Zod validation schemas:

#### Event 1: `conversation.started`
Emitted when a conversation begins, before any agent messages.

```json
{
  "type": "conversation.started",
  "timestamp": "2025-01-15T10:30:00.123Z",
  "data": {
    "conversation_id": "conv_abc123xyz",
    "mode": "round-robin",
    "initial_prompt": "The user's initial prompt text",
    "max_turns": 10,
    "agents": [
      {
        "agent_type": "claude",
        "model": "claude-sonnet-4",
        "name": "Claude",
        "prompt": "You are a helpful assistant...",
        "cli_version": "1.2.0"
      },
      {
        "agent_type": "gemini",
        "model": "gemini-pro-1.5",
        "name": "Gemini",
        "prompt": "You are an expert researcher...",
        "cli_version": "0.5.0"
      }
    ],
    "system_info": {
      "agentpipe_version": "0.2.4",
      "os": "darwin",
      "os_version": "macOS 14.1",
      "go_version": "go1.21.5",
      "architecture": "arm64"
    }
  }
}
```

**Field Notes**:
- `conversation_id`: Generate a UUID for the conversation (use this same ID for all events)
- `timestamp`: ISO 8601 format with milliseconds
- `mode`: One of "round-robin", "reactive", "free-form"
- `agents`: Array of participating agents with their configuration
  - `cli_version`: Version of the individual agent CLI (e.g., claude-cli version)
- `system_info` (**REQUIRED**):
  - `agentpipe_version`: AgentPipe CLI version
  - `os`: OS name ("darwin", "linux", "windows")
  - `os_version`: Full OS version string
  - `go_version`: Go runtime version
  - `architecture`: CPU architecture ("amd64", "arm64", etc.)

#### Event 2: `message.created`
Emitted after each agent completes a message.

```json
{
  "type": "message.created",
  "timestamp": "2025-01-15T10:30:05.456Z",
  "data": {
    "conversation_id": "conv_abc123xyz",
    "message_id": "msg_def456uvw",
    "agent_type": "claude",
    "agent_name": "Claude",
    "content": "The complete message content from the agent...",
    "sequence_number": 1,
    "turn_number": 1,
    "tokens_used": 150,
    "input_tokens": 100,
    "output_tokens": 50,
    "cost": 0.0015,
    "model": "claude-sonnet-4",
    "duration_ms": 1234
  }
}
```

**Field Notes**:
- `message_id`: Generate a unique UUID for each message
- `sequence_number`: Overall message order in conversation (1, 2, 3...)
- `turn_number`: Which turn/round (1, 2, 3... increments after all agents respond)
- `tokens_used`: Total tokens (input + output)
- `cost`: Calculated cost in USD (can be 0 if unknown)
- `duration_ms`: Time taken to generate this message in milliseconds

#### Event 3: `conversation.completed`
Emitted when conversation ends normally or reaches max turns.

```json
{
  "type": "conversation.completed",
  "timestamp": "2025-01-15T10:35:00.789Z",
  "data": {
    "conversation_id": "conv_abc123xyz",
    "status": "completed",
    "total_messages": 20,
    "total_turns": 10,
    "total_tokens": 3000,
    "total_cost": 0.030,
    "duration_seconds": 300
  }
}
```

**Field Notes**:
- `status`: One of "completed" (normal), "interrupted" (user Ctrl+C), "error" (fatal error)
- `total_messages`: Count of all agent messages
- `total_turns`: Number of complete rounds
- `duration_seconds`: Total conversation duration in seconds (float)

#### Event 4: `conversation.error`
Emitted when an error occurs during the conversation.

```json
{
  "type": "conversation.error",
  "timestamp": "2025-01-15T10:32:00.123Z",
  "data": {
    "conversation_id": "conv_abc123xyz",
    "error_message": "API rate limit exceeded",
    "error_type": "rate_limit",
    "agent_type": "claude"
  }
}
```

**Field Notes**:
- `error_message`: Human-readable error description
- `error_type`: Error category (e.g., "rate_limit", "auth_error", "network_error", "api_error")
- `agent_type`: Which agent caused the error (optional)

### 3. HTTP Client Requirements

**Endpoint Construction**: Append `/api/ingest` to base URL
- Base URL from config: `https://agentpipe.ai`
- Full endpoint: `https://agentpipe.ai/api/ingest`

**Headers**:
```
Authorization: Bearer sk_your_api_key_here
Content-Type: application/json
```

**Request Body**: The event JSON (as shown above)

**Expected Responses**:
- `201 Created`: Event accepted
  ```json
  {
    "conversation_id": "conv_abc123xyz"
  }
  ```
- `400 Bad Request`: Invalid event format
  ```json
  {
    "error": "Invalid event format",
    "details": [...]
  }
  ```
- `401 Unauthorized`: Invalid or missing API key
  ```json
  {
    "error": "Unauthorized",
    "details": "Invalid API key"
  }
  ```
- `500 Internal Server Error`: Server error

**Client Behavior**:
- **Non-blocking**: Use goroutines to send events asynchronously
- **Timeout**: 10 seconds per request (configurable)
- **Retries**: 3 attempts with exponential backoff (1s, 2s, 4s)
- **Error Handling**: Log errors but NEVER stop the conversation
- **Graceful Degradation**: If streaming is unreachable, silently continue (with debug log)

### 4. CLI Commands

Implement new `bridge` subcommand group:

#### `agentpipe bridge setup`
Interactive setup wizard to configure streaming.

```bash
$ agentpipe bridge setup

╔══════════════════════════════════════════════════════════════╗
║         AgentPipe Web Streaming Setup                        ║
╚══════════════════════════════════════════════════════════════╝

This will configure real-time streaming of conversation data to
AgentPipe Web for visualization and analysis.

✓ What data is sent?
  • Conversation metadata (mode, participants, timing)
  • All agent messages and responses
  • Token usage and costs
  • System information (AgentPipe version, OS, architecture)
  • Error information

✓ Privacy Note:
  • Streaming is disabled by default
  • You can disable it anytime with: agentpipe bridge disable
  • Your API key is stored locally in ~/.agentpipe/config.yaml

Continue? (y/N): y

Enter AgentPipe Web URL [https://agentpipe.ai]: https://agentpipe.ai
Enter your API key: sk_***********************************

Testing connection... ✓ Success!

Bridge configuration saved to ~/.agentpipe/config.yaml
Streaming is now enabled.

To test streaming, run:
  agentpipe run "Hello agents"

To disable streaming:
  agentpipe bridge disable
```

#### `agentpipe bridge status`
Show current streaming configuration.

```bash
$ agentpipe bridge status

╔══════════════════════════════════════════════════════════════╗
║         AgentPipe Web Streaming Status                       ║
╚══════════════════════════════════════════════════════════════╝

Status:          Enabled ✓
URL:             https://agentpipe.ai
API Endpoint:    https://agentpipe.ai/api/ingest
API Key:         sk_***...xyz (configured)
Timeout:         10000ms
Retry Attempts:  3
Log Level:       info

System Information (collected for streaming):
  AgentPipe:     0.2.4
  OS:            darwin (macOS 14.1)
  Go:            go1.21.5
  Architecture:  arm64

Configuration source: ~/.agentpipe/config.yaml

To disable: agentpipe bridge disable
To test:    agentpipe bridge test
```

#### `agentpipe bridge test`
Test connection to AgentPipe Web.

```bash
$ agentpipe bridge test

Testing connection to https://agentpipe.ai/api/ingest...

[1/3] Checking endpoint availability... ✓
[2/3] Authenticating with API key... ✓
[3/3] Sending test event... ✓

Connection successful!
You're ready to stream conversations to AgentPipe Web.

Run a conversation with streaming:
  agentpipe run "Hello agents"
```

#### `agentpipe bridge disable`
Disable streaming.

```bash
$ agentpipe bridge disable

Streaming disabled.
Configuration preserved in ~/.agentpipe/config.yaml

To re-enable, run: agentpipe bridge setup
```

### 5. Go Implementation Guide

#### Package Structure

```
agentpipe/
├── cmd/
│   ├── run.go             # Update to add --stream flags
│   └── bridge.go          # New bridge subcommands
├── internal/
│   ├── bridge/
│   │   ├── client.go      # HTTP client for streaming
│   │   ├── config.go      # Bridge configuration
│   │   ├── emitter.go     # Event emitter interface
│   │   ├── events.go      # Event type definitions
│   │   └── sysinfo.go     # System information collector
│   ├── config/
│   │   └── config.go      # Update to include bridge config
│   └── orchestrator/
│       └── orchestrator.go # Update to emit events
```

#### Key Code Structures

**System Information Collector** (`internal/bridge/sysinfo.go`):
```go
package bridge

import (
	"fmt"
	"runtime"
)

type SystemInfo struct {
	AgentPipeVersion string `json:"agentpipe_version"`
	OS               string `json:"os"`
	OSVersion        string `json:"os_version"`
	GoVersion        string `json:"go_version"`
	Architecture     string `json:"architecture"`
}

func CollectSystemInfo(version string) SystemInfo {
	osVersion := getOSVersion() // Platform-specific implementation

	return SystemInfo{
		AgentPipeVersion: version,
		OS:               runtime.GOOS,
		OSVersion:        osVersion,
		GoVersion:        runtime.Version(),
		Architecture:     runtime.GOARCH,
	}
}

func getOSVersion() string {
	switch runtime.GOOS {
	case "darwin":
		return getMacOSVersion() // Execute `sw_vers -productVersion`
	case "linux":
		return getLinuxVersion() // Read /etc/os-release
	case "windows":
		return getWindowsVersion() // Execute `ver` or use syscall
	default:
		return "unknown"
	}
}

// Platform-specific helper functions
func getMacOSVersion() string {
	// Execute: sw_vers -productVersion
	// Return: "macOS 14.1"
}

func getLinuxVersion() string {
	// Read: /etc/os-release
	// Return: "Ubuntu 22.04" or similar
}

func getWindowsVersion() string {
	// Use syscall or execute: ver
	// Return: "Windows 11"
}
```

**Event Types** (`internal/bridge/events.go`):
```go
package bridge

import "time"

type EventType string

const (
	EventConversationStarted   EventType = "conversation.started"
	EventMessageCreated        EventType = "message.created"
	EventConversationCompleted EventType = "conversation.completed"
	EventConversationError     EventType = "conversation.error"
)

type Event struct {
	Type      EventType   `json:"type"`
	Timestamp time.Time   `json:"timestamp"`
	Data      interface{} `json:"data"`
}

type ConversationStartedData struct {
	ConversationID string            `json:"conversation_id"`
	Mode           string            `json:"mode"`
	InitialPrompt  string            `json:"initial_prompt"`
	MaxTurns       int               `json:"max_turns,omitempty"`
	Agents         []AgentParticipant `json:"agents"`
	SystemInfo     SystemInfo         `json:"system_info"`
}

type AgentParticipant struct {
	AgentType  string `json:"agent_type"`
	Model      string `json:"model,omitempty"`
	Name       string `json:"name,omitempty"`
	Prompt     string `json:"prompt,omitempty"`
	CLIVersion string `json:"cli_version,omitempty"`
}

type MessageCreatedData struct {
	ConversationID string  `json:"conversation_id"`
	MessageID      string  `json:"message_id"`
	AgentType      string  `json:"agent_type"`
	AgentName      string  `json:"agent_name,omitempty"`
	Content        string  `json:"content"`
	SequenceNumber int     `json:"sequence_number,omitempty"`
	TurnNumber     int     `json:"turn_number,omitempty"`
	TokensUsed     int     `json:"tokens_used,omitempty"`
	InputTokens    int     `json:"input_tokens,omitempty"`
	OutputTokens   int     `json:"output_tokens,omitempty"`
	Cost           float64 `json:"cost,omitempty"`
	Model          string  `json:"model,omitempty"`
	DurationMs     int64   `json:"duration_ms,omitempty"`
}

type ConversationCompletedData struct {
	ConversationID  string  `json:"conversation_id"`
	Status          string  `json:"status"` // "completed", "interrupted", "error"
	TotalMessages   int     `json:"total_messages,omitempty"`
	TotalTurns      int     `json:"total_turns,omitempty"`
	TotalTokens     int     `json:"total_tokens,omitempty"`
	TotalCost       float64 `json:"total_cost,omitempty"`
	DurationSeconds float64 `json:"duration_seconds,omitempty"`
}

type ConversationErrorData struct {
	ConversationID string `json:"conversation_id"`
	ErrorMessage   string `json:"error_message"`
	ErrorType      string `json:"error_type,omitempty"`
	AgentType      string `json:"agent_type,omitempty"`
}
```

**Configuration** (`internal/bridge/config.go`):
```go
package bridge

import (
	"fmt"
	"os"
	"strings"
	"time"
)

type Config struct {
	Enabled       bool
	URL           string // Base URL only, append /api/ingest in client
	APIKey        string
	TimeoutMs     int
	RetryAttempts int
	LogLevel      string
}

func LoadConfig() *Config {
	// Load from config file, env vars, and flags
	// Precedence: CLI flags > env vars > config file > defaults

	config := &Config{
		Enabled:       false, // Disabled by default
		URL:           getDefaultURL(),
		TimeoutMs:     10000,
		RetryAttempts: 3,
		LogLevel:      "info",
	}

	// Load from config file (~/.agentpipe/config.yaml)
	// Override with environment variables
	if enabled := os.Getenv("AGENTPIPE_STREAM_ENABLED"); enabled == "true" {
		config.Enabled = true
	}
	if url := os.Getenv("AGENTPIPE_STREAM_URL"); url != "" {
		config.URL = cleanBaseURL(url)
	}
	if apiKey := os.Getenv("AGENTPIPE_STREAM_API_KEY"); apiKey != "" {
		config.APIKey = apiKey
	}

	return config
}

func cleanBaseURL(url string) string {
	// Remove trailing /api/ingest if user accidentally included it
	url = strings.TrimSuffix(url, "/api/ingest")
	url = strings.TrimSuffix(url, "/")
	return url
}

func getDefaultURL() string {
	// Build-time constant or environment variable
	// Development: http://localhost:3000
	// Production: https://agentpipe.ai
	if os.Getenv("AGENTPIPE_ENV") == "production" {
		return "https://agentpipe.ai"
	}
	return "http://localhost:3000"
}
```

**HTTP Client** (`internal/bridge/client.go`):
```go
package bridge

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"time"
)

type Client struct {
	config     *Config
	httpClient *http.Client
}

func NewClient(config *Config) *Client {
	return &Client{
		config: config,
		httpClient: &http.Client{
			Timeout: time.Duration(config.TimeoutMs) * time.Millisecond,
		},
	}
}

func (c *Client) getEndpointURL() string {
	// Append /api/ingest to base URL
	return c.config.URL + "/api/ingest"
}

func (c *Client) SendEvent(event *Event) error {
	if !c.config.Enabled {
		return nil // Silently skip if disabled
	}

	// Serialize event to JSON
	body, err := json.Marshal(event)
	if err != nil {
		return fmt.Errorf("failed to marshal event: %w", err)
	}

	// Retry logic with exponential backoff
	var lastErr error
	for attempt := 0; attempt <= c.config.RetryAttempts; attempt++ {
		if attempt > 0 {
			// Exponential backoff: 1s, 2s, 4s
			backoff := time.Duration(1<<uint(attempt-1)) * time.Second
			time.Sleep(backoff)
		}

		err := c.sendRequest(body)
		if err == nil {
			return nil // Success
		}
		lastErr = err
	}

	// Log error but don't fail the conversation
	if c.config.LogLevel == "debug" || c.config.LogLevel == "info" {
		fmt.Fprintf(os.Stderr, "Warning: Failed to stream event after %d attempts: %v\n",
			c.config.RetryAttempts+1, lastErr)
	}
	return lastErr
}

func (c *Client) sendRequest(body []byte) error {
	url := c.getEndpointURL()

	req, err := http.NewRequest("POST", url, bytes.NewReader(body))
	if err != nil {
		return fmt.Errorf("failed to create request: %w", err)
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+c.config.APIKey)

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return fmt.Errorf("request failed: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode == http.StatusCreated || resp.StatusCode == http.StatusOK {
		return nil // Success
	}

	// Read error response
	bodyBytes, _ := io.ReadAll(resp.Body)
	return fmt.Errorf("server returned %d: %s", resp.StatusCode, string(bodyBytes))
}

// SendEventAsync sends event in a goroutine (non-blocking)
func (c *Client) SendEventAsync(event *Event) {
	go func() {
		if err := c.SendEvent(event); err != nil {
			// Log at debug level
			if c.config.LogLevel == "debug" {
				fmt.Fprintf(os.Stderr, "Debug: Stream event error: %v\n", err)
			}
		}
	}()
}
```

**Event Emitter** (`internal/bridge/emitter.go`):
```go
package bridge

import (
	"github.com/google/uuid"
	"time"
)

type Emitter struct {
	client         *Client
	conversationID string
	sequenceNumber int
	systemInfo     SystemInfo
}

func NewEmitter(config *Config, agentpipeVersion string) *Emitter {
	return &Emitter{
		client:         NewClient(config),
		conversationID: uuid.New().String(),
		sequenceNumber: 0,
		systemInfo:     CollectSystemInfo(agentpipeVersion),
	}
}

func (e *Emitter) EmitConversationStarted(
	mode string,
	initialPrompt string,
	maxTurns int,
	agents []AgentParticipant,
) {
	event := &Event{
		Type:      EventConversationStarted,
		Timestamp: time.Now(),
		Data: ConversationStartedData{
			ConversationID: e.conversationID,
			Mode:           mode,
			InitialPrompt:  initialPrompt,
			MaxTurns:       maxTurns,
			Agents:         agents,
			SystemInfo:     e.systemInfo,
		},
	}
	e.client.SendEventAsync(event)
}

func (e *Emitter) EmitMessageCreated(
	agentType, agentName, content, model string,
	turnNumber int,
	tokens, inputTokens, outputTokens int,
	cost float64,
	duration time.Duration,
) {
	e.sequenceNumber++
	event := &Event{
		Type:      EventMessageCreated,
		Timestamp: time.Now(),
		Data: MessageCreatedData{
			ConversationID: e.conversationID,
			MessageID:      uuid.New().String(),
			AgentType:      agentType,
			AgentName:      agentName,
			Content:        content,
			SequenceNumber: e.sequenceNumber,
			TurnNumber:     turnNumber,
			TokensUsed:     tokens,
			InputTokens:    inputTokens,
			OutputTokens:   outputTokens,
			Cost:           cost,
			Model:          model,
			DurationMs:     duration.Milliseconds(),
		},
	}
	e.client.SendEventAsync(event)
}

func (e *Emitter) EmitConversationCompleted(
	status string,
	totalMessages, totalTurns, totalTokens int,
	totalCost float64,
	duration time.Duration,
) {
	event := &Event{
		Type:      EventConversationCompleted,
		Timestamp: time.Now(),
		Data: ConversationCompletedData{
			ConversationID:  e.conversationID,
			Status:          status,
			TotalMessages:   totalMessages,
			TotalTurns:      totalTurns,
			TotalTokens:     totalTokens,
			TotalCost:       totalCost,
			DurationSeconds: duration.Seconds(),
		},
	}
	e.client.SendEventAsync(event)
}

func (e *Emitter) EmitConversationError(errorMessage, errorType, agentType string) {
	event := &Event{
		Type:      EventConversationError,
		Timestamp: time.Now(),
		Data: ConversationErrorData{
			ConversationID: e.conversationID,
			ErrorMessage:   errorMessage,
			ErrorType:      errorType,
			AgentType:      agentType,
		},
	}
	e.client.SendEventAsync(event)
}
```

### 6. Integration Points in Orchestrator

Update the orchestrator to emit events at key points. Also need to collect CLI versions for each agent:

```go
// In orchestrator.go or wherever the conversation loop runs

func (o *Orchestrator) RunConversation(initialPrompt string, maxTurns int) error {
	// Load bridge config
	bridgeConfig := bridge.LoadConfig()
	emitter := bridge.NewEmitter(bridgeConfig, Version) // Version = "0.2.4"

	startTime := time.Now()
	var totalMessages, totalTokens int
	var totalCost float64

	// Build agent participants for the event
	var agents []bridge.AgentParticipant
	for _, agent := range o.agents {
		cliVersion := agent.GetCLIVersion() // Get individual CLI version
		agents = append(agents, bridge.AgentParticipant{
			AgentType:  agent.Type,
			Model:      agent.Model,
			Name:       agent.Name,
			Prompt:     agent.SystemPrompt,
			CLIVersion: cliVersion,
		})
	}

	// Emit conversation started
	emitter.EmitConversationStarted(o.mode, initialPrompt, maxTurns, agents)

	// Run conversation loop
	for turn := 1; turn <= maxTurns; turn++ {
		for _, agent := range o.agents {
			msgStart := time.Now()

			// Generate message
			response, err := agent.Generate(context)
			if err != nil {
				// Emit error event
				emitter.EmitConversationError(
					err.Error(),
					"api_error",
					agent.Type,
				)
				return err
			}

			msgDuration := time.Since(msgStart)
			totalMessages++
			totalTokens += response.Tokens
			totalCost += response.Cost

			// Emit message created
			emitter.EmitMessageCreated(
				agent.Type,
				agent.Name,
				response.Content,
				response.Model,
				turn,
				response.Tokens,
				response.InputTokens,
				response.OutputTokens,
				response.Cost,
				msgDuration,
			)
		}
	}

	// Emit conversation completed
	duration := time.Since(startTime)
	emitter.EmitConversationCompleted(
		"completed",
		totalMessages,
		maxTurns,
		totalTokens,
		totalCost,
		duration,
	)

	return nil
}
```

### 7. CLI Flags for `run` Command

Update `cmd/run.go` to add streaming flags:

```go
var runCmd = &cobra.Command{
	Use:   "run [prompt]",
	Short: "Run a multi-agent conversation",
	Args:  cobra.ExactArgs(1),
	RunE: func(cmd *cobra.Command, args []string) error {
		// Get streaming flags
		streamEnabled, _ := cmd.Flags().GetBool("stream")
		streamURL, _ := cmd.Flags().GetString("stream-url")
		streamAPIKey, _ := cmd.Flags().GetString("stream-api-key")

		// Override config if flags provided
		if streamEnabled {
			// Set environment variables or pass to orchestrator
			if streamURL != "" {
				os.Setenv("AGENTPIPE_STREAM_URL", streamURL)
			}
			if streamAPIKey != "" {
				os.Setenv("AGENTPIPE_STREAM_API_KEY", streamAPIKey)
			}
			os.Setenv("AGENTPIPE_STREAM_ENABLED", "true")
		}

		// Run conversation
		return runConversation(args[0])
	},
}

func init() {
	runCmd.Flags().Bool("stream", false, "Enable real-time streaming to AgentPipe Web")
	runCmd.Flags().String("stream-url", "", "AgentPipe Web base URL (e.g., https://agentpipe.ai)")
	runCmd.Flags().String("stream-api-key", "", "API key for streaming authentication")
}
```

### 8. Build Configuration

Use build tags or ldflags to set default URLs:

**Option 1: Build Tags**
```bash
# Development build
go build -tags development -o agentpipe

# Production build
go build -tags production -o agentpipe
```

In code:
```go
//go:build development
// +build development

package bridge

const DefaultURL = "http://localhost:3000"
```

```go
//go:build production
// +build production

package bridge

const DefaultURL = "https://agentpipe.ai"
```

**Option 2: ldflags**
```bash
# Production build
go build -ldflags "-X main.defaultStreamURL=https://agentpipe.ai" -o agentpipe

# Development build
go build -ldflags "-X main.defaultStreamURL=http://localhost:3000" -o agentpipe
```

### 9. Testing

#### Unit Tests
```go
func TestEventSerialization(t *testing.T) {
	sysInfo := SystemInfo{
		AgentPipeVersion: "0.2.4",
		OS:               "darwin",
		OSVersion:        "macOS 14.1",
		GoVersion:        "go1.21.5",
		Architecture:     "arm64",
	}

	event := &Event{
		Type:      EventConversationStarted,
		Timestamp: time.Now(),
		Data: ConversationStartedData{
			ConversationID: "test-123",
			Mode:           "round-robin",
			InitialPrompt:  "Hello",
			SystemInfo:     sysInfo,
			Agents:         []AgentParticipant{},
		},
	}

	data, err := json.Marshal(event)
	if err != nil {
		t.Fatalf("Failed to marshal: %v", err)
	}

	// Verify JSON structure
	var parsed map[string]interface{}
	json.Unmarshal(data, &parsed)

	if parsed["type"] != "conversation.started" {
		t.Errorf("Expected type=conversation.started, got %v", parsed["type"])
	}

	// Verify system_info is present
	dataMap := parsed["data"].(map[string]interface{})
	if _, ok := dataMap["system_info"]; !ok {
		t.Error("Expected system_info in data")
	}
}
```

#### Integration Tests with Mock Server
```go
func TestStreamingWithMockServer(t *testing.T) {
	// Start mock HTTP server
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Verify endpoint path
		if r.URL.Path != "/api/ingest" {
			t.Errorf("Expected /api/ingest, got %s", r.URL.Path)
			w.WriteHeader(http.StatusNotFound)
			return
		}

		// Verify Authorization header
		auth := r.Header.Get("Authorization")
		if auth != "Bearer test-key" {
			w.WriteHeader(http.StatusUnauthorized)
			return
		}

		// Verify Content-Type
		if r.Header.Get("Content-Type") != "application/json" {
			w.WriteHeader(http.StatusBadRequest)
			return
		}

		// Parse event
		var event Event
		json.NewDecoder(r.Body).Decode(&event)

		// Verify system_info is present for conversation.started
		if event.Type == EventConversationStarted {
			data := event.Data.(ConversationStartedData)
			if data.SystemInfo.AgentPipeVersion == "" {
				t.Error("Expected agentpipe_version in system_info")
			}
		}

		// Return success
		w.WriteHeader(http.StatusCreated)
		json.NewEncoder(w).Encode(map[string]string{
			"conversation_id": "test-123",
		})
	}))
	defer server.Close()

	// Test with mock server
	config := &Config{
		Enabled:       true,
		URL:           server.URL, // Base URL
		APIKey:        "test-key",
		TimeoutMs:     5000,
		RetryAttempts: 3,
	}

	client := NewClient(config)
	sysInfo := SystemInfo{
		AgentPipeVersion: "0.2.4",
		OS:               "darwin",
		OSVersion:        "macOS 14.1",
		GoVersion:        "go1.21.5",
		Architecture:     "arm64",
	}

	event := &Event{
		Type:      EventConversationStarted,
		Timestamp: time.Now(),
		Data: ConversationStartedData{
			ConversationID: "test-123",
			Mode:           "round-robin",
			InitialPrompt:  "Test",
			SystemInfo:     sysInfo,
			Agents:         []AgentParticipant{},
		},
	}

	err := client.SendEvent(event)
	if err != nil {
		t.Fatalf("Failed to send event: %v", err)
	}
}
```

### 10. Documentation Updates

Update the following documentation:

**README.md**:
```markdown
## Real-Time Streaming

AgentPipe can optionally stream conversation data to AgentPipe Web for
visualization and analysis.

### Quick Setup

```bash
# Configure streaming
agentpipe bridge setup

# Test connection
agentpipe bridge test

# Run a conversation (streaming enabled automatically)
agentpipe run "Hello agents"

# Or run with explicit streaming flags
agentpipe run --stream --stream-url=https://agentpipe.ai \
  --stream-api-key=sk_your_key "Hello agents"
```

### Configuration

Streaming is **opt-in** and disabled by default. Enable via:

1. **Interactive setup**: `agentpipe bridge setup`
2. **Environment variables**:
   ```bash
   export AGENTPIPE_STREAM_ENABLED=true
   export AGENTPIPE_STREAM_URL=https://agentpipe.ai
   export AGENTPIPE_STREAM_API_KEY=sk_your_key
   ```
3. **Config file** (`~/.agentpipe/config.yaml`):
   ```yaml
   bridge:
     enabled: true
     url: "https://agentpipe.ai"
     api_key: "sk_your_key"
   ```
4. **CLI flags**: `agentpipe run --stream --stream-url=... --stream-api-key=...`

### What Data is Sent

When streaming is enabled, AgentPipe sends:
- Conversation metadata (mode, participants)
- All agent messages and responses
- Token usage and costs
- System information (AgentPipe version, OS, Go version, architecture)
- Error information

**No streaming occurs unless explicitly enabled.**

To disable: `agentpipe bridge disable`
```

### 11. Error Handling Principles

1. **Never fail conversations**: Streaming errors are logged but don't stop execution
2. **Graceful degradation**: If web app is unreachable, continue without streaming
3. **Clear error messages**: Help users diagnose configuration issues
4. **Security**: Never log API keys, even in debug mode
5. **User feedback**: Show clear status in `bridge status` and `bridge test` commands
6. **URL validation**: Strip trailing `/api/ingest` if user includes it in base URL

### 12. Implementation Checklist

- [ ] Create `internal/bridge/sysinfo.go` with system info collection
- [ ] Update `internal/bridge/events.go` to include SystemInfo and cli_version
- [ ] Update `internal/bridge/config.go` to handle base URLs properly
- [ ] Update `internal/bridge/client.go` to append `/api/ingest` to base URL
- [ ] Update `internal/bridge/emitter.go` to collect and send system info
- [ ] Add `--stream`, `--stream-url`, `--stream-api-key` flags to `cmd/run.go`
- [ ] Update `cmd/bridge.go` to show system info in status command
- [ ] Add method to collect individual agent CLI versions
- [ ] Integrate emitter into orchestrator with system info
- [ ] Implement build-time URL configuration (dev vs prod)
- [ ] Write unit tests for event serialization with system info
- [ ] Write integration tests with mock HTTP server
- [ ] Test URL handling (base URL + /api/ingest)
- [ ] Update documentation (README, configuration guide)
- [ ] Add privacy and security notes about system info collection
- [ ] Test error scenarios (network failure, auth failure, timeout)
- [ ] Verify non-blocking behavior (conversation continues on stream failure)

---

## Implementation Notes

Please implement this feature with the following principles:

1. **Opt-in First**: Streaming must be explicitly enabled. Never stream without user consent.

2. **Non-Intrusive**: The feature should integrate seamlessly without changing existing behavior when disabled.

3. **Production-Ready**: Proper error handling, retries, timeouts, and logging.

4. **Privacy-Focused**: Clear documentation about what data is sent (including system info). Never log sensitive information.

5. **User-Friendly**: Clear CLI commands, helpful error messages, easy setup process.

6. **Testable**: Comprehensive unit and integration tests.

7. **Maintainable**: Clean code structure, clear separation of concerns, good documentation.

8. **URL Handling**: Always store base URLs, append `/api/ingest` programmatically to avoid user confusion.

The web app's `/api/ingest` endpoint is already implemented and tested with full system info support. Focus on creating a robust, user-friendly client implementation that integrates smoothly with the existing agentpipe codebase.
