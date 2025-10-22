# AgentPipe Streaming - Quick Start Guide

This guide helps you get streaming up and running in 30 minutes.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Setup (5 minutes)](#setup-5-minutes)
3. [Test Real-time Streaming (10 minutes)](#test-real-time-streaming-10-minutes)
4. [Test Historical Upload (5 minutes)](#test-historical-upload-5-minutes)
5. [CLI Integration (10 minutes)](#cli-integration-10-minutes)
6. [Troubleshooting](#troubleshooting)

---

## Prerequisites

- AgentPipe Web running locally or deployed
- PostgreSQL database configured
- Node.js 20+ (for web)
- Go 1.21+ (for CLI)
- API key generated

---

## Setup (5 minutes)

### 1. Generate API Key

```bash
# Generate a secure random API key
node -e "console.log('ap_live_' + require('crypto').randomBytes(24).toString('base64url'))"
```

Example output: `ap_live_k9j8h7g6f5d4s3a2w1q0p9o8i7u6y5t4r3e2w1q`

### 2. Configure Environment

Add to `.env.local` (web):

```env
AGENTPIPE_BRIDGE_API_KEY=ap_live_k9j8h7g6f5d4s3a2w1q0p9o8i7u6y5t4r3e2w1q
```

Export for CLI:

```bash
export AGENTPIPE_API_KEY=ap_live_k9j8h7g6f5d4s3a2w1q0p9o8i7u6y5t4r3e2w1q
export AGENTPIPE_WEB_URL=http://localhost:3000
```

### 3. Install Dependencies

Web:
```bash
cd agentpipe-web
npm install
```

### 4. Run Migrations (Optional)

If you want source tracking:

```bash
npx prisma migrate dev --name add_streaming_fields
```

### 5. Start Development Server

```bash
npm run dev
```

---

## Test Real-time Streaming (10 minutes)

### Test 1: Start a Conversation

```bash
curl -X POST http://localhost:3000/api/ingest \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $AGENTPIPE_API_KEY" \
  -d '{
    "type": "conversation.started",
    "data": {
      "name": "Test Conversation",
      "mode": "round-robin",
      "initialPrompt": "Hello world",
      "participants": [
        {
          "agentId": "agent-1",
          "agentType": "claude",
          "agentName": "Test Agent"
        }
      ]
    }
  }'
```

Expected response:
```json
{
  "conversationId": "cm1a2b3c4d5e6f7g8h9i0",
  "status": "created"
}
```

Save the `conversationId` for next steps.

### Test 2: Send a Message

```bash
CONV_ID="cm1a2b3c4d5e6f7g8h9i0"  # Replace with actual ID

curl -X POST http://localhost:3000/api/ingest \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $AGENTPIPE_API_KEY" \
  -d "{
    \"type\": \"message.created\",
    \"data\": {
      \"conversationId\": \"$CONV_ID\",
      \"message\": {
        \"agentId\": \"agent-1\",
        \"agentName\": \"Test Agent\",
        \"agentType\": \"claude\",
        \"content\": \"Hello from the CLI!\",
        \"role\": \"agent\",
        \"timestamp\": \"$(date -u +%Y-%m-%dT%H:%M:%S.000Z)\",
        \"metrics\": {
          \"duration\": 1500,
          \"totalTokens\": 120,
          \"cost\": 0.00024
        }
      }
    }
  }"
```

### Test 3: Complete the Conversation

```bash
curl -X POST http://localhost:3000/api/ingest \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $AGENTPIPE_API_KEY" \
  -d "{
    \"type\": \"conversation.completed\",
    \"data\": {
      \"conversationId\": \"$CONV_ID\",
      \"totalMessages\": 1,
      \"totalTokens\": 120,
      \"totalCost\": 0.00024,
      \"totalDuration\": 1500
    }
  }"
```

### Test 4: Subscribe to SSE Stream

Open a new terminal:

```bash
curl -N http://localhost:3000/api/realtime/stream
```

You should see:
```
data: {"type":"connected","timestamp":"2025-10-20T14:30:00.000Z","message":"Subscribed to all events"}

:heartbeat

```

Leave this running and repeat Tests 1-3 in another terminal. You'll see events appear in real-time!

### Test 5: Subscribe to Specific Conversation

```bash
curl -N "http://localhost:3000/api/realtime/stream?conversationId=$CONV_ID"
```

---

## Test Historical Upload (5 minutes)

### Upload Complete Session

```bash
curl -X POST http://localhost:3000/api/sessions/upload \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $AGENTPIPE_API_KEY" \
  -d '{
    "session": {
      "name": "Historical Session",
      "mode": "round-robin",
      "initialPrompt": "Discuss product ideas",
      "status": "COMPLETED",
      "startedAt": "2025-10-15T10:00:00.000Z",
      "completedAt": "2025-10-15T10:30:00.000Z",
      "totalDuration": 1800000,
      "metadata": {
        "originalId": "local-session-001",
        "importedFrom": "local_storage"
      }
    },
    "participants": [
      {
        "agentId": "agent-1",
        "agentType": "claude",
        "agentName": "PM"
      },
      {
        "agentId": "agent-2",
        "agentType": "gpt",
        "agentName": "Engineer"
      }
    ],
    "messages": [
      {
        "agentId": "agent-1",
        "agentName": "PM",
        "agentType": "claude",
        "content": "Let'\''s brainstorm features...",
        "role": "agent",
        "timestamp": "2025-10-15T10:01:00.000Z",
        "metrics": {
          "duration": 2000,
          "totalTokens": 150,
          "cost": 0.0003
        }
      },
      {
        "agentId": "agent-2",
        "agentName": "Engineer",
        "agentType": "gpt",
        "content": "I suggest we start with...",
        "role": "agent",
        "timestamp": "2025-10-15T10:02:00.000Z",
        "metrics": {
          "duration": 1800,
          "totalTokens": 130,
          "cost": 0.00026
        }
      }
    ]
  }'
```

Expected response:
```json
{
  "success": true,
  "conversationId": "cm3a4b5c6d7e8f9g0h1i2",
  "messagesCreated": 2,
  "participantsCreated": 2,
  "totalTokens": 280,
  "totalCost": 0.00056
}
```

### Verify Upload

```bash
curl http://localhost:3000/api/sessions | jq
```

You should see the uploaded session in the list.

---

## CLI Integration (10 minutes)

### 1. Create Go Module (if not exists)

```bash
cd agentpipe-cli  # Your CLI directory
go mod init github.com/yourusername/agentpipe
```

### 2. Create Streaming Package

```bash
mkdir -p pkg/streaming
```

Copy files from `IMPLEMENTATION_EXAMPLES.md`:
- `pkg/streaming/types.go`
- `pkg/streaming/client.go`

### 3. Create Test File

**File**: `pkg/streaming/example.go`

```go
package main

import (
	"fmt"
	"log"
	"os"
	"time"

	"github.com/yourusername/agentpipe/pkg/streaming"
)

func main() {
	// Initialize client
	client := streaming.NewClient(streaming.Config{
		BaseURL: os.Getenv("AGENTPIPE_WEB_URL"),
		APIKey:  os.Getenv("AGENTPIPE_API_KEY"),
	})

	// Start conversation
	fmt.Println("Starting conversation...")
	conversationID, err := client.ConversationStarted(streaming.ConversationStartedData{
		Name:          "CLI Test Conversation",
		Mode:          "round-robin",
		InitialPrompt: "Test from Go CLI",
		Participants: []streaming.ParticipantConfig{
			{
				AgentID:   "agent-1",
				AgentType: "claude",
				AgentName: "Test Agent",
			},
		},
		Metadata: map[string]interface{}{
			"cliVersion": "1.0.0",
			"test":       true,
		},
	})
	if err != nil {
		log.Fatalf("Failed to start conversation: %v", err)
	}

	fmt.Printf("Conversation started: %s\n", conversationID)

	// Send messages
	for i := 1; i <= 3; i++ {
		fmt.Printf("Sending message %d...\n", i)

		messageID, err := client.MessageCreated(conversationID, streaming.MessageData{
			AgentID:   "agent-1",
			AgentName: "Test Agent",
			AgentType: "claude",
			Content:   fmt.Sprintf("Test message #%d from Go CLI", i),
			Role:      "agent",
			Timestamp: time.Now(),
			Metrics: &streaming.ResponseMetrics{
				Duration:    2000 + (i * 100),
				TotalTokens: 100 + (i * 10),
				Cost:        0.0002 * float64(i),
			},
		})
		if err != nil {
			log.Printf("Failed to send message: %v", err)
		} else {
			fmt.Printf("Message sent: %s\n", messageID)
		}

		time.Sleep(1 * time.Second)
	}

	// Complete conversation
	fmt.Println("Completing conversation...")
	err = client.ConversationCompleted(streaming.ConversationCompletedData{
		ConversationID: conversationID,
		TotalMessages:  3,
		TotalTokens:    330,
		TotalCost:      0.0012,
		TotalDuration:  6300,
	})
	if err != nil {
		log.Printf("Failed to complete conversation: %v", err)
	}

	fmt.Println("Done!")
}
```

### 4. Run Test

```bash
export AGENTPIPE_API_KEY=ap_live_...
export AGENTPIPE_WEB_URL=http://localhost:3000

go run pkg/streaming/example.go
```

Expected output:
```
Starting conversation...
Conversation started: cm4a5b6c7d8e9f0g1h2i3
Sending message 1...
Message sent: cm5a6b7c8d9e0f1g2h3i4
Sending message 2...
Message sent: cm6a7b8c9d0e1f2g3h4i5
Sending message 3...
Message sent: cm7a8b9c0d1e2f3g4h5i6
Completing conversation...
Done!
```

### 5. Watch in Real-time

While the Go program runs, watch the SSE stream:

```bash
curl -N http://localhost:3000/api/realtime/stream
```

You'll see events appearing as the CLI sends them!

---

## Troubleshooting

### Problem: 401 Unauthorized

**Solution**: Check API key matches in both `.env.local` and your export

```bash
# Web
cat .env.local | grep AGENTPIPE_BRIDGE_API_KEY

# CLI
echo $AGENTPIPE_API_KEY
```

They must match exactly!

### Problem: Validation errors

**Solution**: Check event format matches schema

```bash
# Enable verbose curl output
curl -v -X POST http://localhost:3000/api/ingest \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $AGENTPIPE_API_KEY" \
  -d '{"type":"conversation.started","data":{...}}'
```

### Problem: SSE connection drops

**Solution**:
1. Check if server is running
2. Verify no proxy/firewall blocking SSE
3. Check browser console for errors

```javascript
// In browser console
const es = new EventSource('/api/realtime/stream');
es.onerror = (e) => console.error('SSE error:', e);
es.onmessage = (e) => console.log('Event:', e.data);
```

### Problem: Rate limit errors

**Solution**: Wait 60 seconds or reduce request frequency

```bash
# Check rate limit headers
curl -v http://localhost:3000/api/ingest ... | grep X-RateLimit
```

### Problem: Database errors

**Solution**: Run migrations

```bash
cd agentpipe-web
npx prisma migrate dev
npx prisma generate
```

### Problem: CORS errors (in browser)

**Solution**: Add allowed origins to `.env.local`

```env
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
```

---

## Next Steps

1. **Integrate with Real Orchestrator**: Replace test script with actual AgentPipe orchestrator hooks
2. **Add Error Handling**: Implement retry logic and error recovery
3. **Configure Production**: Set up production API keys and URLs
4. **Add Monitoring**: Set up health checks and metrics
5. **Deploy**: Follow deployment guide in `STREAMING_ARCHITECTURE.md`

---

## Quick Reference

### Environment Variables

```bash
# Required
AGENTPIPE_API_KEY=ap_live_...
AGENTPIPE_WEB_URL=https://your-app.com

# Optional
ALLOWED_ORIGINS=https://app.com,https://other.com
RATE_LIMIT_WINDOW_SECONDS=60
RATE_LIMIT_MAX_REQUESTS=100
```

### API Endpoints

- **Ingest**: `POST /api/ingest` (CLI → Web)
- **Upload**: `POST /api/sessions/upload` (Bulk upload)
- **Stream**: `GET /api/realtime/stream` (Web SSE)
- **Sessions**: `GET /api/sessions` (List sessions)
- **Session Detail**: `GET /api/sessions/:id` (Get session)

### Event Types

- `conversation.started`
- `message.created`
- `conversation.completed`
- `conversation.interrupted`
- `error.occurred`

### Common cURL Commands

```bash
# Start conversation
curl -X POST $AGENTPIPE_WEB_URL/api/ingest \
  -H "Authorization: Bearer $AGENTPIPE_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"type":"conversation.started","data":{...}}'

# Send message
curl -X POST $AGENTPIPE_WEB_URL/api/ingest \
  -H "Authorization: Bearer $AGENTPIPE_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"type":"message.created","data":{...}}'

# Watch stream
curl -N $AGENTPIPE_WEB_URL/api/realtime/stream

# List sessions
curl $AGENTPIPE_WEB_URL/api/sessions | jq
```

---

**Document Version**: 1.0
**Last Updated**: 2025-10-20
