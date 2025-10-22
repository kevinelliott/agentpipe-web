# Product Requirements Document: Session Streaming & Upload

**Document Version:** 1.0
**Last Updated:** 2025-10-20
**Status:** Ready for Implementation
**Owner:** Product Management

---

## Executive Summary

This PRD defines the requirements for integrating AgentPipe CLI sessions with AgentPipe Web through two primary capabilities: real-time session streaming and historical session upload. This integration will enable users to monitor active multi-agent conversations in real-time and retrospectively analyze past sessions through a web interface.

**Business Value:**
- Enable real-time monitoring of multi-agent conversations
- Provide searchable historical archive of all sessions
- Deliver cost and performance analytics across conversations
- Support debugging and optimization of agent configurations
- Create foundation for team collaboration features

**Success Metrics:**
- 50%+ of active AgentPipe users enable streaming within 30 days
- 90%+ of streamed sessions successfully captured without data loss
- <500ms latency from CLI event to web UI update
- Historical upload success rate >95%

---

## Table of Contents

1. [Problem Statement](#problem-statement)
2. [User Stories](#user-stories)
3. [Use Cases](#use-cases)
4. [Requirements Overview](#requirements-overview)
5. [Real-Time Streaming Requirements](#real-time-streaming-requirements)
6. [Historical Upload Requirements](#historical-upload-requirements)
7. [Data Requirements](#data-requirements)
8. [User Flow](#user-flow)
9. [API Design](#api-design)
10. [Security & Privacy](#security--privacy)
11. [Error Handling](#error-handling)
12. [Feature Prioritization](#feature-prioritization)
13. [Success Metrics](#success-metrics)
14. [Technical Dependencies](#technical-dependencies)
15. [Open Questions](#open-questions)

---

## Problem Statement

### Current State

AgentPipe is a powerful CLI tool for orchestrating multi-agent conversations, but users currently face several challenges:

1. **Limited Visibility**: Users can only monitor conversations through terminal output
2. **No Historical Analysis**: Past conversations are saved as plain text logs with no search or filtering
3. **Difficult Debugging**: No visual timeline or metrics to understand conversation performance
4. **No Cost Tracking**: Token usage and costs are visible per-message but not aggregated
5. **Isolated Experience**: No way to share or collaborate on conversation insights

### Desired State

Users should be able to:
- Watch conversations unfold in real-time through a modern web interface
- Search and filter through historical conversations
- Analyze performance metrics (tokens, costs, duration) across sessions
- Compare different agent configurations
- Export and share conversation data
- Debug issues by viewing detailed message timelines

### Impact of Not Solving

- Users continue to rely on terminal-based workflows, limiting adoption
- Valuable conversation data remains unstructured and difficult to analyze
- Teams cannot effectively collaborate on agent optimization
- Competitive disadvantage vs. platforms with built-in dashboards

---

## User Stories

### Epic 1: Real-Time Streaming

**As a** developer running AgentPipe conversations
**I want** to see my multi-agent conversations stream live to a web dashboard
**So that** I can monitor progress, debug issues, and track costs in real-time without watching terminal output

**Acceptance Criteria:**
- Conversation appears in web UI within 500ms of starting in CLI
- Messages display in web UI with <100ms latency after agent response
- Metrics (tokens, cost, duration) update in real-time
- Multiple concurrent conversations display correctly
- Connection status clearly indicated in UI
- Graceful handling of network interruptions

---

**As a** developer testing different agent configurations
**I want** to monitor multiple conversations simultaneously
**So that** I can compare different approaches side-by-side in real-time

**Acceptance Criteria:**
- Dashboard supports viewing 2+ active conversations
- Each conversation clearly identified (timestamp, mode, agents)
- Can filter view to specific agents or conversation modes
- Performance metrics displayed per conversation and aggregated
- No performance degradation with 5+ concurrent conversations

---

### Epic 2: Historical Upload

**As a** developer with existing AgentPipe conversations
**I want** to upload past session logs to the web interface
**So that** I can analyze historical data and build a complete conversation archive

**Acceptance Criteria:**
- Can select and upload single or multiple .log files
- Upload progress clearly indicated
- Successful uploads confirmed with conversation links
- Failed uploads show clear error messages
- Uploaded conversations appear in historical search immediately
- Supports both web upload and CLI-based bulk upload

---

**As a** data analyst reviewing agent performance
**I want** to search through uploaded historical conversations
**So that** I can identify patterns, costs, and optimization opportunities

**Acceptance Criteria:**
- Full-text search across all message content
- Filter by date range, agent type, conversation mode
- Sort by cost, duration, token count, message count
- Export filtered results to JSON/CSV
- Conversation detail view with complete message timeline
- Per-message and aggregate metrics visible

---

### Epic 3: Opt-In & Privacy

**As a** privacy-conscious developer
**I want** control over whether my conversations are streamed
**So that** I can ensure sensitive data isn't transmitted without explicit consent

**Acceptance Criteria:**
- Streaming disabled by default (opt-in required)
- Clear setup guide explaining what data is shared
- Easy enable/disable in CLI config
- API key management in web UI
- Ability to delete uploaded conversations
- Transparent privacy policy

---

## Use Cases

### Use Case 1: Real-Time Monitoring During Development

**Scenario:** Developer is testing a new multi-agent configuration to optimize cost

**Flow:**
1. Developer enables bridge in AgentPipe config with API key
2. Starts conversation: `agentpipe run --config experiment.yaml`
3. Opens AgentPipe Web dashboard
4. Watches conversation stream in real-time:
   - Sees each agent's response as it happens
   - Monitors token usage climbing
   - Notices one agent consuming 3x more tokens than expected
5. Stops conversation early after identifying issue
6. Adjusts agent configuration based on observed behavior
7. Re-runs with new config and compares metrics

**Value:** Immediate feedback enables rapid iteration and cost optimization

---

### Use Case 2: Debugging Failed Conversations

**Scenario:** Developer's conversation terminated unexpectedly

**Flow:**
1. Conversation fails with error in CLI
2. Developer opens web UI and sees conversation marked as "ERROR"
3. Reviews complete message timeline
4. Identifies the specific agent/message that caused failure
5. Views error details and response metrics
6. Downloads conversation JSON for bug report
7. Adjusts configuration and re-tests

**Value:** Visual timeline and detailed metrics accelerate debugging

---

### Use Case 3: Analyzing Historical Performance

**Scenario:** Team wants to compare different LLM models across 50 conversations

**Flow:**
1. Developer bulk uploads 50 historical .log files via CLI
2. Navigates to historical search
3. Filters conversations by date range (last 2 weeks)
4. Compares conversations using Claude vs GPT-4 vs Gemini
5. Sorts by total cost to identify most expensive model
6. Exports aggregate metrics to spreadsheet
7. Shares findings with team to inform model selection

**Value:** Data-driven decision making based on actual usage patterns

---

### Use Case 4: Team Collaboration

**Scenario:** Team member wants to share an interesting conversation outcome

**Flow:**
1. Developer runs conversation with streaming enabled
2. Conversation produces surprising result
3. Shares conversation URL with team
4. Team members review message timeline
5. Discuss agent behavior in team meeting
6. Export conversation as Markdown for documentation

**Value:** Easy sharing enables knowledge transfer and collaboration

---

### Use Case 5: Cost Tracking & Budgeting

**Scenario:** Manager wants to understand monthly AgentPipe costs

**Flow:**
1. All team members have streaming enabled
2. Manager opens metrics dashboard
3. Views aggregate costs across all conversations
4. Filters by team member to see individual usage
5. Identifies high-cost conversation patterns
6. Sets internal budgets/guidelines based on data
7. Exports monthly report for finance

**Value:** Visibility into costs enables budget planning and optimization

---

## Requirements Overview

### Functional Requirements

| ID | Requirement | Priority | Complexity |
|----|-------------|----------|------------|
| FR-1 | Real-time conversation streaming via HTTP bridge | P0 | High |
| FR-2 | Server-Sent Events for live dashboard updates | P0 | Medium |
| FR-3 | Historical session upload via web UI | P0 | Medium |
| FR-4 | Historical session upload via CLI command | P1 | Low |
| FR-5 | Full-text search across messages | P0 | Medium |
| FR-6 | Advanced filtering (date, agent, mode, cost, tokens) | P0 | Medium |
| FR-7 | Conversation detail view with timeline | P0 | Low |
| FR-8 | Real-time metrics display (cost, tokens, duration) | P0 | Medium |
| FR-9 | Export conversations (JSON, Markdown, CSV) | P1 | Low |
| FR-10 | API key generation and management | P0 | Low |
| FR-11 | Opt-in setup guide and configuration generator | P0 | Low |
| FR-12 | Multiple concurrent conversation support | P0 | Medium |
| FR-13 | Connection status indicators | P0 | Low |
| FR-14 | Conversation deletion | P1 | Low |
| FR-15 | Bulk upload progress tracking | P1 | Medium |

### Non-Functional Requirements

| ID | Requirement | Target | Priority |
|----|-------------|--------|----------|
| NFR-1 | Real-time latency (CLI → Web UI) | <500ms | P0 |
| NFR-2 | Message streaming latency | <100ms | P0 |
| NFR-3 | Upload success rate | >95% | P0 |
| NFR-4 | Concurrent user support | 100+ simultaneous | P1 |
| NFR-5 | Historical search response time | <2s for 10k conversations | P0 |
| NFR-6 | Database storage efficiency | <10MB per 100-message conversation | P1 |
| NFR-7 | Uptime/availability | 99.5% | P1 |
| NFR-8 | Browser compatibility | Chrome, Firefox, Safari, Edge (latest 2 versions) | P0 |
| NFR-9 | Mobile responsiveness | Full functionality on mobile | P1 |

---

## Real-Time Streaming Requirements

### AgentPipe CLI Changes (Bridge Component)

**Location:** AgentPipe repository (Go)

**Requirements:**

1. **Bridge Configuration**
   - Add `bridge` section to config.yaml
   - Support HTTP POST endpoint type
   - OAuth/Bearer token authentication
   - Configurable timeout and retry settings
   - Disabled by default (opt-in)

2. **Event Types to Emit**
   - `conversation.started` - When orchestrator begins
   - `message.created` - After each agent response
   - `conversation.completed` - When conversation ends normally
   - `conversation.interrupted` - When user cancels or error occurs
   - `error.occurred` - When agent or system error happens

3. **Event Payload Structure**
   ```yaml
   type: conversation.started | message.created | conversation.completed | conversation.interrupted | error.occurred
   timestamp: ISO 8601 timestamp
   data:
     conversationId: unique identifier
     # Event-specific fields (see Data Requirements)
   ```

4. **Reliability Requirements**
   - Non-blocking: Bridge failures don't stop conversation
   - Retry logic: 3 attempts with exponential backoff
   - Timeout: 10s default, configurable
   - Logging: Warn on failure, don't throw errors
   - Graceful degradation: Continue without bridge if unreachable

### AgentPipe Web Changes (Ingest & Streaming)

**Location:** AgentPipe Web repository (Next.js)

**Requirements:**

1. **Ingest Endpoint** (`/api/ingest`)
   - Accept POST requests from AgentPipe bridge
   - Validate API key via Bearer token
   - Parse and validate event payload
   - Store data in PostgreSQL via Prisma
   - Broadcast to SSE subscribers
   - Return 200 on success, 4xx/5xx on error

2. **SSE Streaming** (`/api/realtime/stream`)
   - Already implemented (existing requirement)
   - Emit events to connected clients
   - Support conversation-specific and global subscriptions
   - Heartbeat every 30s to keep connection alive

3. **Dashboard UI Components**
   - Live conversation feed
   - Real-time message updates
   - Active conversation cards with metrics
   - Connection status indicator
   - Empty state with setup guide CTA

### Data Flow

```
AgentPipe CLI
    ↓ (Bridge HTTP POST)
POST /api/ingest
    ↓ (Store in DB)
PostgreSQL via Prisma
    ↓ (Broadcast event)
SSE Event Manager
    ↓ (Push to clients)
Dashboard UI (EventSource)
    ↓ (Update state)
React Components
```

---

## Historical Upload Requirements

### Upload Mechanisms

#### 1. Web UI Upload

**Requirements:**

- File picker supporting .log files
- Multi-file selection (drag-and-drop + click)
- Client-side validation (file type, size <50MB per file)
- Upload progress bar (per file and overall)
- Concurrent uploads (max 5 at a time)
- Success/failure feedback with error messages
- Link to uploaded conversation on success

**UI Components:**
- Upload zone with drag-and-drop
- File list with individual progress bars
- Success confirmation with conversation links
- Error messages with retry option

#### 2. CLI Upload Command (Future)

**Requirements:**

- New CLI command: `agentpipe upload <files...>`
- Support glob patterns: `agentpipe upload ~/.agentpipe/chats/*.log`
- Batch upload with progress indicator
- API key configuration
- Dry-run mode to preview uploads
- Skip duplicates (detect by content hash)

**Implementation:** Lower priority, can be added post-MVP

### Upload Processing

**Requirements:**

1. **File Parsing**
   - Parse AgentPipe .log file format
   - Extract conversation metadata (started time, ended time, agents)
   - Parse individual messages with timestamps
   - Extract system messages (joins, announcements, errors)
   - Handle malformed logs gracefully

2. **Data Transformation**
   - Convert log format to Prisma models
   - Generate conversation ID (if not present)
   - Calculate aggregate metrics (total messages, duration)
   - Infer agent types from names/patterns
   - Set conversation status based on completion

3. **Database Storage**
   - Create Conversation record
   - Create ConversationAgent records for participants
   - Create Message records in batch
   - Create Event record for upload tracking
   - Transaction to ensure atomicity

4. **Validation**
   - Reject files >50MB
   - Validate log file format
   - Check for duplicate uploads (same file hash)
   - Verify conversation doesn't already exist
   - Sanitize message content (prevent XSS)

### Upload API

**Endpoint:** `POST /api/upload`

**Request:**
- Content-Type: multipart/form-data
- File field: `file` (or multiple files)
- Optional metadata fields

**Response:**
```json
{
  "success": true,
  "uploaded": [
    {
      "filename": "chat_2025-09-11_18-00-33.log",
      "conversationId": "clx...",
      "messageCount": 4,
      "url": "/conversation/clx..."
    }
  ],
  "failed": [
    {
      "filename": "invalid.log",
      "error": "Invalid file format"
    }
  ]
}
```

---

## Data Requirements

### Conversation Metadata

**Source:** Both real-time and upload

| Field | Type | Source | Required | Description |
|-------|------|--------|----------|-------------|
| id | CUID | Generated | Yes | Unique conversation ID |
| createdAt | DateTime | Auto | Yes | Record creation time |
| startedAt | DateTime | Event/log | Yes | Conversation start time |
| completedAt | DateTime | Event/log | No | Conversation end time |
| status | Enum | Event/log | Yes | ACTIVE, COMPLETED, INTERRUPTED, ERROR |
| mode | String | Event/log | Yes | round-robin, reactive, free-form |
| maxTurns | Int | Event | No | Configured max turns |
| initialPrompt | String | Event/log | Yes | Starting prompt |
| name | String | Generated | Yes | Display name (auto-generated or custom) |
| totalMessages | Int | Calculated | Yes | Count of messages |
| totalTokens | Int | Calculated | Yes | Sum of all message tokens |
| totalCost | Float | Calculated | Yes | Sum of all message costs |
| totalDuration | Int | Calculated | Yes | Milliseconds from start to end |
| metadata | JSON | Event | No | Additional flexible data |

### Message Data

**Source:** Both real-time and upload

| Field | Type | Source | Required | Description |
|-------|------|--------|----------|-------------|
| id | CUID | Generated | Yes | Unique message ID |
| conversationId | CUID | Reference | Yes | Parent conversation |
| agentId | String | Event/log | Yes | Agent identifier |
| agentName | String | Event/log | Yes | Display name |
| agentType | String | Event/log | Yes | claude, gpt, gemini, amp, etc. |
| agentVersion | String | Event | No | Agent software version |
| content | Text | Event/log | Yes | Message content |
| role | String | Event/log | Yes | agent, user, system |
| timestamp | DateTime | Event/log | Yes | Message creation time |
| duration | Int | Event | No | Response time in ms |
| inputTokens | Int | Event | No | Tokens in prompt |
| outputTokens | Int | Event | No | Tokens in response |
| totalTokens | Int | Event | No | Total tokens |
| model | String | Event | No | AI model used |
| cost | Float | Event | No | Estimated cost in USD |

### Participant Data

**Source:** Both real-time and upload

| Field | Type | Source | Required | Description |
|-------|------|--------|----------|-------------|
| id | CUID | Generated | Yes | Unique participant ID |
| conversationId | CUID | Reference | Yes | Parent conversation |
| agentId | String | Event/log | Yes | Agent identifier |
| agentType | String | Event/log | Yes | Agent type |
| agentName | String | Event/log | Yes | Display name |
| agentVersion | String | Event | No | Software version |
| model | String | Event | No | AI model |
| prompt | Text | Event | No | Agent's system prompt |
| announcement | String | Event/log | No | Join announcement |
| settings | JSON | Event | No | Agent-specific settings |

### Event Data (System)

**Source:** Both real-time and upload

| Field | Type | Source | Required | Description |
|-------|------|--------|----------|-------------|
| id | CUID | Generated | Yes | Unique event ID |
| createdAt | DateTime | Auto | Yes | Event time |
| type | String | Event | Yes | Event type |
| conversationId | CUID | Reference | No | Related conversation |
| data | JSON | Event | Yes | Event payload |
| errorMessage | Text | Event | No | Error if applicable |
| errorStack | Text | Event | No | Stack trace if error |

### Data Mapping: Log Files → Database

**Example Log Entry:**
```
[18:00:41] Alice (agent): I'd have to say Python...
```

**Mapped to Message:**
```json
{
  "agentName": "Alice",
  "role": "agent",
  "content": "I'd have to say Python...",
  "timestamp": "2025-09-11T18:00:41Z",
  // Inferred:
  "agentId": "alice",
  "agentType": "unknown" // or inferred from config
}
```

**Note:** Log files have limited metadata. Real-time events include richer data (tokens, costs, models).

---

## User Flow

### Flow 1: Enable Real-Time Streaming (First-Time Setup)

**User Goal:** Start streaming AgentPipe conversations to web dashboard

**Steps:**

1. User installs AgentPipe Web (or uses hosted version)
2. User navigates to AgentPipe Web homepage
3. Sees empty dashboard with prominent "Enable Streaming" CTA
4. Clicks "View Setup Guide"
5. Modal opens with step-by-step instructions:
   - **Step 1:** Generate API key (button in modal)
   - **Step 2:** Copy bridge configuration snippet
   - **Step 3:** Add to AgentPipe config.yaml
   - **Step 4:** Test connection
6. User clicks "Generate API Key" → Key displayed with copy button
7. User copies bridge config snippet
8. User opens `~/.agentpipe/config.yaml` in editor
9. User pastes bridge config, saves file
10. User runs test conversation: `agentpipe run --config config.yaml`
11. Conversation appears in web dashboard in real-time
12. User sees success confirmation in UI
13. Modal shows "Setup Complete!" message

**Success Criteria:**
- Time to complete: <5 minutes for technical user
- Conversion rate: >50% of users who open modal complete setup
- Error rate: <5% fail during first attempt

**Error Scenarios:**
- Invalid API key → Clear error message in CLI with link to regenerate
- Network unreachable → Warning in CLI, conversation continues
- Wrong URL → Error in CLI with suggestion to verify config

---

### Flow 2: Monitor Active Conversation

**User Goal:** Watch a multi-agent conversation in real-time

**Steps:**

1. User has streaming enabled (previous flow)
2. User starts conversation in CLI: `agentpipe run --config experiment.yaml`
3. Within 500ms, conversation appears in web dashboard
4. Dashboard shows:
   - Conversation card with status "Active"
   - Agent avatars/badges for participants
   - Initial prompt displayed
   - Metrics: 0 messages, $0.00 cost, 0 tokens
5. First agent responds:
   - Message bubble appears in conversation card
   - Metrics update: 1 message, $0.0021 cost, 470 tokens
   - Agent avatar highlights to show activity
6. Subsequent messages stream in with <100ms latency
7. User clicks conversation card → Expands to full view
8. Full view shows:
   - Complete message timeline
   - Per-message metrics (duration, tokens, cost)
   - Running totals
9. Conversation completes or user stops it
10. Status updates to "Completed"
11. Final metrics displayed
12. User can click "View Details" → Full detail page

**Success Criteria:**
- Perceived as "instant" by users
- No message ordering issues
- Metrics accurate to ±1%

---

### Flow 3: Upload Historical Sessions

**User Goal:** Import past conversations for analysis

**Steps:**

1. User navigates to "/upload" or clicks "Upload History" button
2. Upload page displays:
   - Drag-and-drop zone
   - "Select Files" button
   - List of uploadable file types (.log)
   - Example file shown
3. User drags 5 .log files from Finder onto drop zone
4. Files appear in upload queue with "Ready" status
5. User clicks "Upload All" button
6. Progress bars appear for each file:
   - File 1: Parsing → Uploading → Complete (✓)
   - File 2: Parsing → Uploading → Complete (✓)
   - File 3: Parsing → Error (Invalid format)
   - File 4: Parsing → Uploading → Complete (✓)
   - File 5: Parsing → Uploading → Complete (✓)
7. Summary shown:
   - 4 uploaded successfully
   - 1 failed with error details
8. Success entries show "View Conversation" links
9. User clicks link → Redirected to conversation detail page
10. Uploaded conversation displays full timeline from log file

**Success Criteria:**
- Upload 100 files in <2 minutes
- Clear progress indication throughout
- Helpful error messages for failures
- Uploaded conversations immediately searchable

**Error Scenarios:**
- Invalid file format → Specific error message with format requirements
- File too large → Clear size limit message
- Duplicate conversation → Option to skip or overwrite
- Network error during upload → Retry option

---

### Flow 4: Search Historical Conversations

**User Goal:** Find specific conversations based on criteria

**Steps:**

1. User navigates to "/history" (or "/search")
2. Search page displays:
   - Search bar with placeholder "Search messages..."
   - Filter panel (collapsed on mobile)
   - List of recent conversations (default: last 20)
3. User enters search query: "Python programming"
4. Results update in real-time (debounced 300ms)
5. Shows 12 conversations containing "Python programming"
6. User expands filter panel
7. User adds filters:
   - Date range: Last 7 days
   - Agent type: Claude
   - Min cost: $0.05
8. Results filter down to 3 conversations
9. User changes sort to "Cost (high to low)"
10. Results re-order
11. User clicks first result
12. Redirected to conversation detail page
13. Search query highlighted in messages

**Success Criteria:**
- Search response <2s for 10,000 conversations
- Accurate full-text search results
- Filters apply correctly
- Persistent URL state (can bookmark/share filtered view)

---

### Flow 5: Analyze Conversation Details

**User Goal:** Deep dive into a specific conversation

**Steps:**

1. User navigates to conversation detail page (from search or dashboard)
2. Page displays:
   - Header: Conversation metadata (date, mode, status, duration)
   - Sidebar: Participants, aggregate metrics
   - Main: Complete message timeline
3. User scrolls through messages:
   - Each message shows agent name, timestamp, content
   - Hover shows additional metrics (tokens, cost, duration)
4. User clicks "Expand Metrics" on a message
5. Detailed metrics panel opens:
   - Input tokens: 150
   - Output tokens: 320
   - Total tokens: 470
   - Model: claude-sonnet-4
   - Duration: 3.2s
   - Cost: $0.0021
6. User clicks "Export" button
7. Export modal shows format options:
   - JSON (full data)
   - Markdown (formatted)
   - CSV (metrics only)
8. User selects Markdown
9. File downloads: `conversation_2025-09-11_18-00-33.md`
10. User can share file with team

**Success Criteria:**
- Page loads <1s
- All data visible without horizontal scroll
- Export formats valid and usable

---

## API Design

### Real-Time APIs

#### POST /api/ingest

**Purpose:** Receive events from AgentPipe bridge

**Authentication:** Bearer token (API key)

**Request:**
```json
{
  "type": "message.created",
  "timestamp": "2025-10-20T15:30:45Z",
  "data": {
    "conversationId": "conv_1729437045_a3f2e9d1",
    "message": {
      "agentId": "claude-1",
      "agentName": "Claude",
      "agentType": "claude",
      "agentVersion": "1.2.0",
      "content": "I'd have to say Python...",
      "role": "agent",
      "timestamp": "2025-10-20T15:30:45Z",
      "metrics": {
        "duration": 3200,
        "inputTokens": 150,
        "outputTokens": 320,
        "totalTokens": 470,
        "model": "claude-sonnet-4",
        "cost": 0.0021
      }
    }
  }
}
```

**Response (Success):**
```json
{
  "success": true,
  "conversationId": "conv_1729437045_a3f2e9d1",
  "timestamp": "2025-10-20T15:30:45.123Z"
}
```

**Response (Error):**
```json
{
  "success": false,
  "error": "Invalid API key",
  "code": "AUTH_INVALID_KEY"
}
```

**Status Codes:**
- 200: Success
- 400: Invalid payload
- 401: Invalid/missing API key
- 429: Rate limited
- 500: Server error

**Rate Limits:**
- 1000 requests/minute per API key
- Burst: 100 requests/second

---

#### GET /api/realtime/stream

**Purpose:** Server-Sent Events stream for dashboard

**Authentication:** Optional (for multi-user scenarios)

**Query Parameters:**
- `conversationId` (optional): Filter to specific conversation

**Response:** SSE stream

```
event: conversation.started
data: {"conversationId":"conv_...","mode":"round-robin",...}

event: message.created
data: {"conversationId":"conv_...","message":{...}}

event: heartbeat
data: {"timestamp":"2025-10-20T15:30:00Z"}
```

**Event Types:**
- `conversation.started`
- `message.created`
- `conversation.completed`
- `conversation.interrupted`
- `error.occurred`
- `heartbeat` (every 30s)

---

### Historical Upload APIs

#### POST /api/upload

**Purpose:** Upload historical .log files

**Authentication:** Required (API key or session)

**Request:**
- Content-Type: multipart/form-data
- Body: One or more files

**Response:**
```json
{
  "success": true,
  "results": [
    {
      "filename": "chat_2025-09-11_18-00-33.log",
      "status": "success",
      "conversationId": "clx123abc",
      "messageCount": 4,
      "url": "/conversation/clx123abc"
    },
    {
      "filename": "invalid.log",
      "status": "failed",
      "error": "Invalid file format: Missing conversation header"
    }
  ],
  "summary": {
    "total": 2,
    "successful": 1,
    "failed": 1
  }
}
```

**Status Codes:**
- 200: Upload processed (check individual results)
- 400: Invalid request (no files, wrong content-type)
- 401: Unauthorized
- 413: File too large (>50MB)
- 500: Server error

**Rate Limits:**
- 100 files/hour per user
- 1GB total upload/day per user

---

### Search & Query APIs

#### GET /api/conversations

**Purpose:** List conversations with filters

**Authentication:** Optional (for multi-user scenarios)

**Query Parameters:**
```
?status=COMPLETED
&agentType=claude
&startDate=2025-10-01T00:00:00Z
&endDate=2025-10-20T23:59:59Z
&minCost=0.05
&maxCost=1.00
&page=1
&limit=20
&sort=totalCost
&order=desc
```

**Response:**
```json
{
  "data": [
    {
      "id": "clx123abc",
      "createdAt": "2025-10-20T15:00:00Z",
      "startedAt": "2025-10-20T15:00:00Z",
      "completedAt": "2025-10-20T15:05:00Z",
      "status": "COMPLETED",
      "mode": "round-robin",
      "name": "Conversation on 2025-10-20",
      "totalMessages": 12,
      "totalTokens": 5420,
      "totalCost": 0.0234,
      "totalDuration": 300000,
      "participants": [
        {"agentType": "claude", "agentName": "Claude"},
        {"agentType": "gpt", "agentName": "GPT"}
      ]
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 156,
    "pages": 8
  }
}
```

---

#### POST /api/search

**Purpose:** Full-text search with complex filters

**Authentication:** Optional

**Request:**
```json
{
  "query": "Python programming",
  "filters": {
    "status": ["COMPLETED"],
    "agentTypes": ["claude", "gpt"],
    "models": ["claude-sonnet-4"],
    "startDate": "2025-10-01T00:00:00Z",
    "endDate": "2025-10-20T23:59:59Z",
    "minCost": 0.05,
    "maxCost": 1.00
  },
  "page": 1,
  "limit": 20,
  "sort": "totalCost",
  "order": "desc"
}
```

**Response:** Same as GET /api/conversations

---

#### GET /api/conversations/:id

**Purpose:** Get detailed conversation with messages

**Authentication:** Optional

**Response:**
```json
{
  "id": "clx123abc",
  "createdAt": "2025-10-20T15:00:00Z",
  "startedAt": "2025-10-20T15:00:00Z",
  "completedAt": "2025-10-20T15:05:00Z",
  "status": "COMPLETED",
  "mode": "round-robin",
  "maxTurns": 10,
  "initialPrompt": "Discuss programming languages",
  "name": "Conversation on 2025-10-20",
  "totalMessages": 4,
  "totalTokens": 1234,
  "totalCost": 0.0056,
  "totalDuration": 89000,
  "messages": [
    {
      "id": "msg1",
      "agentId": "alice",
      "agentName": "Alice",
      "agentType": "claude",
      "agentVersion": "1.2.0",
      "content": "I'd have to say Python...",
      "role": "agent",
      "timestamp": "2025-10-20T15:00:41Z",
      "duration": 8000,
      "inputTokens": 50,
      "outputTokens": 150,
      "totalTokens": 200,
      "model": "claude-sonnet-4",
      "cost": 0.0012
    }
  ],
  "participants": [
    {
      "id": "part1",
      "agentId": "alice",
      "agentType": "claude",
      "agentName": "Alice",
      "agentVersion": "1.2.0",
      "model": "claude-sonnet-4",
      "announcement": "Alice has joined the conversation."
    }
  ]
}
```

---

### Management APIs

#### POST /api/keys/generate

**Purpose:** Generate new API key for bridge

**Authentication:** Required (user session)

**Request:**
```json
{
  "name": "Production Key",
  "expiresAt": "2026-10-20T00:00:00Z" // optional
}
```

**Response:**
```json
{
  "key": "sk_live_abc123def456...",
  "name": "Production Key",
  "createdAt": "2025-10-20T15:00:00Z",
  "expiresAt": "2026-10-20T00:00:00Z"
}
```

**Note:** Key only shown once, cannot be retrieved later

---

#### GET /api/keys

**Purpose:** List API keys (redacted)

**Authentication:** Required

**Response:**
```json
{
  "keys": [
    {
      "id": "key1",
      "name": "Production Key",
      "keyPrefix": "sk_live_abc...",
      "createdAt": "2025-10-20T15:00:00Z",
      "lastUsed": "2025-10-20T16:30:00Z",
      "usageCount": 145,
      "conversationCount": 12
    }
  ]
}
```

---

#### DELETE /api/keys/:id

**Purpose:** Revoke API key

**Authentication:** Required

**Response:**
```json
{
  "success": true,
  "message": "API key revoked"
}
```

---

## Security & Privacy

### Authentication & Authorization

**API Key Management:**
- Keys prefixed: `sk_live_...` (production) or `sk_test_...` (testing)
- Minimum 32 characters, cryptographically random
- Stored hashed in database (bcrypt or Argon2)
- Never logged in plaintext
- Rotation supported (generate new, revoke old)

**Authorization Levels:**
- Public: Read-only access to conversations (if feature enabled)
- API Key: Write access to ingest and upload endpoints
- User Session: Full access to management endpoints
- Admin: Access to all data and settings

**Rate Limiting:**
- Per API key: 1000 req/min for ingest, 100 req/min for uploads
- Per IP: 100 req/min for read endpoints
- Per user: 1000 req/min for authenticated endpoints
- Implement sliding window algorithm
- Return 429 with Retry-After header

### Data Privacy

**Opt-In Design:**
- Bridge disabled by default in AgentPipe config
- Explicit `enabled: true` required
- Clear documentation on what data is shared
- Setup guide explains privacy implications
- Easy to disable at any time

**Data Handling:**
- Message content stored as-is (no modification)
- No analytics tracking without consent
- No third-party data sharing
- Users can delete conversations at any time
- Export available in standard formats

**What is Collected (when opted in):**
- Conversation metadata (mode, timestamps, status)
- Message content and timestamps
- Agent configurations (types, models, prompts)
- Performance metrics (tokens, costs, durations)
- Error messages and stack traces

**What is NOT Collected:**
- AgentPipe configuration files
- API keys to AI services (Anthropic, OpenAI, etc.)
- Local file system data
- System environment variables
- Network configuration
- User's identity (unless authentication enabled)

### Transport Security

**HTTPS Required:**
- Production deployments must use HTTPS
- Development can use HTTP localhost
- Certificate validation enforced in bridge
- TLS 1.2 minimum

**CORS Configuration:**
- Restrict origins to known domains
- Allow credentials for authenticated requests
- Preflight cache for performance

### Input Validation & Sanitization

**API Inputs:**
- Validate all JSON payloads against schemas
- Reject oversized payloads (>10MB for ingest, >50MB for upload)
- Sanitize message content for XSS (before display)
- Validate timestamps, enums, numeric ranges
- SQL injection prevention via Prisma parameterization

**File Uploads:**
- Validate file extensions (.log only)
- Scan for malicious content (basic checks)
- Limit file size (50MB per file)
- Parse in sandboxed context
- Timeout long-running parsers (30s max)

### Security Headers

**Response Headers:**
```
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Strict-Transport-Security: max-age=31536000; includeSubDomains
Referrer-Policy: strict-origin-when-cross-origin
```

### Audit Logging

**Events to Log:**
- API key generation and revocation
- Conversation deletion
- Failed authentication attempts
- Rate limit violations
- Upload successes and failures
- Search queries (if compliance required)

**Log Storage:**
- Separate from application database
- Retention: 90 days minimum
- Access restricted to administrators

---

## Error Handling

### Real-Time Streaming Errors

#### Bridge Connection Failures

**Scenario:** AgentPipe cannot reach web instance

**CLI Behavior:**
- Log warning: "Failed to connect to AgentPipe Web at https://..."
- Display error: "Bridge connection failed, continuing without streaming"
- Retry 3 times with backoff (1s, 2s, 4s)
- After retries, disable bridge for session
- Conversation continues normally

**Web Behavior:**
- No action required (conversation never started in web)

**User Action:**
- Verify network connectivity
- Check bridge URL in config
- Verify web instance is running
- Check firewall settings

---

#### Authentication Errors

**Scenario:** Invalid or expired API key

**CLI Behavior:**
- Log error: "Invalid API key for AgentPipe Web"
- Display error with link to regenerate key
- Disable bridge for session
- Conversation continues

**Web Behavior:**
- Return 401 with clear error message
- Log failed attempt

**User Action:**
- Regenerate API key in web UI
- Update config.yaml with new key
- Re-run conversation

---

#### Network Interruptions During Streaming

**Scenario:** Connection drops mid-conversation

**CLI Behavior:**
- Detect connection loss
- Attempt reconnection (3 retries)
- If reconnection fails, disable bridge
- Continue conversation locally
- Save complete log file as fallback

**Web Behavior:**
- Conversation marked as "INTERRUPTED"
- Last received message shown
- Status indicator shows "Connection Lost"
- Option to "Refresh" or "Upload Log"

**User Action:**
- Wait for reconnection (automatic)
- If fails, manually upload log file later
- Check network stability

---

#### Message Ordering Issues

**Scenario:** Messages arrive out of order

**Web Behavior:**
- Store messages with sequence number (if provided)
- Sort by timestamp on display
- If duplicate detected (same messageId), skip
- Log warning for investigation

**Prevention:**
- Include sequence number in message events
- Use monotonic timestamps
- Implement idempotency keys

---

### Upload Errors

#### Invalid File Format

**Scenario:** User uploads non-.log file or corrupted log

**Web Behavior:**
- Validate file extension before parsing
- Attempt to parse header
- If parse fails, return clear error:
  ```json
  {
    "status": "failed",
    "error": "Invalid file format: Expected AgentPipe log file starting with '=== AgentPipe Chat Log ==='"
  }
  ```

**User Action:**
- Verify file is AgentPipe .log file
- Check file isn't corrupted
- Try re-exporting from AgentPipe

---

#### File Too Large

**Scenario:** User uploads >50MB file

**Web Behavior:**
- Reject before upload starts (client-side)
- Return 413 if client bypasses:
  ```json
  {
    "error": "File too large. Maximum size: 50MB",
    "code": "FILE_TOO_LARGE"
  }
  ```

**User Action:**
- Split large conversations (if possible)
- Contact support for enterprise limits

---

#### Duplicate Conversation

**Scenario:** User uploads same file twice

**Web Behavior:**
- Calculate file hash on upload
- Check if conversation with same hash exists
- Options:
  1. Skip duplicate (default)
  2. Allow duplicate with warning
  3. Overwrite existing

**Response:**
```json
{
  "status": "skipped",
  "reason": "Duplicate conversation already exists",
  "existingConversationId": "clx123abc",
  "url": "/conversation/clx123abc"
}
```

**User Action:**
- Review existing conversation
- Skip upload or force overwrite

---

#### Partial Upload Failure

**Scenario:** Parsing succeeds but database save fails

**Web Behavior:**
- Wrap in database transaction
- If any step fails, rollback entirely
- Don't create partial conversations
- Return clear error:
  ```json
  {
    "status": "failed",
    "error": "Database error: Unable to save conversation",
    "retryable": true
  }
  ```

**User Action:**
- Retry upload
- Contact support if persists

---

### Search & Query Errors

#### Search Timeout

**Scenario:** Complex query takes >30s

**Web Behavior:**
- Timeout at 30s
- Return 504 Gateway Timeout
- Suggest simplifying query
- Log slow query for optimization

**User Action:**
- Narrow date range
- Remove complex filters
- Contact support if needed

---

#### Invalid Filter Combination

**Scenario:** Contradictory filters (e.g., minCost > maxCost)

**Web Behavior:**
- Validate filters before query
- Return 400 with specific error:
  ```json
  {
    "error": "Invalid filter: minCost (1.00) cannot be greater than maxCost (0.50)",
    "code": "INVALID_FILTER_RANGE"
  }
  ```

**User Action:**
- Correct filter values
- Remove contradictory filters

---

### General Error Principles

1. **Fail Gracefully**
   - Non-blocking: Streaming errors don't stop conversations
   - Partial success: Upload batch can have some successes, some failures
   - Fallback: If web unavailable, save logs locally

2. **Clear Error Messages**
   - Explain what went wrong
   - Suggest corrective action
   - Include error codes for support
   - Link to documentation when helpful

3. **User Recovery Paths**
   - Retry buttons for transient errors
   - Alternative upload methods (CLI if web fails)
   - Manual fixes (regenerate keys, verify config)
   - Support contact for persistent issues

4. **Monitoring & Alerting**
   - Track error rates per endpoint
   - Alert on spike in 500 errors
   - Monitor failed authentication attempts
   - Dashboard for error trends

---

## Feature Prioritization

### MoSCoW Framework

#### Must Have (MVP - P0)

**Real-Time Streaming:**
- [ ] AgentPipe bridge component (Go implementation)
- [ ] `/api/ingest` endpoint with API key auth
- [ ] SSE streaming to dashboard (already exists)
- [ ] Live conversation feed UI
- [ ] Real-time message display
- [ ] Basic metrics display (cost, tokens, duration)
- [ ] Connection status indicator

**Historical Upload:**
- [ ] Web UI file upload (single & multi-file)
- [ ] Log file parser for AgentPipe format
- [ ] `/api/upload` endpoint
- [ ] Upload progress indication
- [ ] Error handling and retry

**Search & Discovery:**
- [ ] Full-text search across messages
- [ ] Filter by date range, agent type, status
- [ ] Sort by date, cost, tokens
- [ ] Conversation list view
- [ ] Conversation detail page with timeline

**Privacy & Security:**
- [ ] Opt-in setup guide
- [ ] API key generation and management
- [ ] Bearer token authentication
- [ ] Rate limiting per API key
- [ ] Clear privacy documentation

**Estimated Time:** 4-5 weeks

---

#### Should Have (Post-MVP - P1)

**Enhanced Upload:**
- [ ] CLI upload command: `agentpipe upload <files>`
- [ ] Bulk upload with progress tracking
- [ ] Duplicate detection and skip
- [ ] Upload history and logs

**Advanced Search:**
- [ ] Filter by model (claude-sonnet-4, gpt-4, etc.)
- [ ] Filter by cost range (min/max)
- [ ] Filter by token range
- [ ] Filter by message count
- [ ] Saved search presets

**Export & Sharing:**
- [ ] Export conversation as JSON
- [ ] Export conversation as Markdown
- [ ] Export conversation as CSV (metrics only)
- [ ] Share conversation link (if public mode enabled)

**Management:**
- [ ] Conversation deletion
- [ ] Bulk conversation deletion
- [ ] API key usage statistics
- [ ] Cost breakdown by agent/model

**Estimated Time:** 2-3 weeks

---

#### Could Have (Future - P2)

**Analytics:**
- [ ] Aggregate cost dashboard
- [ ] Agent performance comparison
- [ ] Model performance comparison
- [ ] Time-series cost charts
- [ ] Token usage trends

**Collaboration:**
- [ ] Multi-user authentication
- [ ] Team workspaces
- [ ] Conversation comments/notes
- [ ] Share conversations with team

**Advanced Features:**
- [ ] Conversation comparison (side-by-side)
- [ ] Diff tool for similar conversations
- [ ] Conversation replay/visualization
- [ ] Custom metadata tagging
- [ ] Webhooks for events

**Estimated Time:** 4-6 weeks

---

#### Won't Have (Out of Scope)

- Real-time collaboration (multiple users editing)
- Built-in agent configuration editor
- Direct integration with AI provider APIs
- Conversation generation from web UI
- Machine learning on conversation data
- Mobile native apps (responsive web only for now)

---

### Value vs. Effort Matrix

```
High Value / Low Effort (Do First):
- Web UI upload
- API key management
- Basic search and filters
- Conversation detail view
- Setup guide

High Value / High Effort (Do Second):
- Real-time streaming bridge
- SSE infrastructure
- Full-text search
- Advanced filters

Low Value / Low Effort (Do Later):
- Export to CSV
- Saved searches
- CLI upload command

Low Value / High Effort (Deprioritize):
- Team collaboration features
- Advanced analytics
- Conversation replay
```

---

### Release Plan

**MVP Release (v0.1.0) - Weeks 1-5**
- Real-time streaming functional
- Web UI upload functional
- Basic search and filters
- Conversation detail view
- API key management
- Documentation

**Goal:** Validate core value proposition with early users

---

**Enhancement Release (v0.2.0) - Weeks 6-8**
- CLI upload command
- Advanced filters (cost, tokens, model)
- Export functionality
- Conversation deletion
- Improved error handling

**Goal:** Address feedback from MVP users, add power-user features

---

**Analytics Release (v0.3.0) - Weeks 9-12**
- Cost dashboard
- Agent/model comparison
- Time-series charts
- Bulk operations

**Goal:** Enable data-driven decision making

---

**Collaboration Release (v1.0.0) - Weeks 13+**
- Multi-user support
- Team workspaces
- Sharing and permissions
- Advanced collaboration features

**Goal:** Enterprise readiness

---

## Success Metrics

### North Star Metric

**Active Streaming Users:** Number of unique users with ≥1 streamed conversation per week

**Target:** 100 active streaming users within 3 months of launch

---

### Product Metrics

#### Adoption Metrics

| Metric | Definition | Target | Measurement |
|--------|-----------|--------|-------------|
| Opt-In Rate | % of AgentPipe users who enable streaming | >50% within 30 days | Track API key generation vs. AgentPipe downloads |
| Setup Success Rate | % of users who complete setup without errors | >90% | Track setup guide completions |
| Time to First Stream | Median time from install to first streamed conversation | <10 minutes | Track timestamps |
| Retention Rate | % of users who stream ≥1 conversation per week | >70% | Weekly cohort analysis |

#### Usage Metrics

| Metric | Definition | Target | Measurement |
|--------|-----------|--------|-------------|
| Conversations Streamed | Total conversations streamed per day | 100+/day at scale | Count ingest events |
| Upload Volume | Historical conversations uploaded per day | 50+/day | Count upload successes |
| Search Queries | Searches performed per user per week | 5+ | Track search API calls |
| Active Users | Daily/Weekly/Monthly active users | DAU: 20, WAU: 50, MAU: 150 | Count unique users |

#### Quality Metrics

| Metric | Definition | Target | Measurement |
|--------|-----------|--------|-------------|
| Streaming Success Rate | % of started conversations that complete without errors | >95% | Track started vs. completed |
| Upload Success Rate | % of uploads that succeed | >95% | Track upload results |
| Search Response Time | P95 search query response time | <2s | Application monitoring |
| Streaming Latency | P95 time from CLI event to web UI update | <500ms | Timestamp comparison |

#### Engagement Metrics

| Metric | Definition | Target | Measurement |
|--------|-----------|--------|-------------|
| Conversations Viewed | Avg conversations viewed per user per week | 10+ | Track detail page views |
| Export Usage | % of users who export ≥1 conversation | >30% | Track export downloads |
| Search Usage | % of users who use search weekly | >60% | Track search engagement |
| Filter Usage | % of searches that use ≥1 filter | >40% | Analyze search payloads |

---

### Business Metrics

| Metric | Definition | Target | Measurement |
|--------|-----------|--------|-------------|
| User Satisfaction | NPS or CSAT score | >40 NPS | Survey quarterly |
| Support Tickets | Support requests per 100 users | <5/100 users | Support system |
| Cost per User | Infrastructure cost per active user | <$0.50/month | Cloud billing |
| Conversion Rate | % of free users who upgrade (if freemium) | >10% | Payment system |

---

### Leading Indicators (Early Signals)

**Positive Signals:**
- High API key generation rate
- Short time to first stream
- Low setup error rate
- Repeat weekly usage
- Positive qualitative feedback

**Negative Signals:**
- High setup abandonment rate
- Low streaming success rate
- High churn after first week
- Support tickets about setup
- Low engagement with historical search

---

### Measurement Plan

**Instrumentation:**
- Backend: Application logs, database queries, API metrics
- Frontend: Analytics events (setup started, upload initiated, search performed)
- Infrastructure: Server metrics, database performance, error rates

**Dashboards:**
1. **Adoption Dashboard:** Opt-in rate, setup success, time to first stream
2. **Usage Dashboard:** Daily conversations, uploads, searches, active users
3. **Quality Dashboard:** Success rates, latency, error rates
4. **Engagement Dashboard:** Conversation views, exports, search usage

**Review Cadence:**
- Daily: Quality metrics (error rates, latency)
- Weekly: Usage and engagement metrics
- Monthly: Adoption and business metrics
- Quarterly: User satisfaction surveys

---

## Technical Dependencies

### External Dependencies

| Dependency | Purpose | Version | Critical? |
|------------|---------|---------|-----------|
| PostgreSQL | Primary database | 14+ | Yes |
| Prisma | ORM | 6.17.1+ | Yes |
| Next.js | Web framework | 15.5.5+ | Yes |
| Node.js | Runtime | 22+ | Yes |
| Go | AgentPipe bridge | 1.21+ | Yes |
| React | UI library | 19+ | Yes |

### Internal Dependencies

| Component | Status | Owner | Blocker? |
|-----------|--------|-------|----------|
| Database schema | ✅ Complete | Backend | No |
| `/api/ingest` endpoint | ✅ Complete | Backend | No |
| SSE streaming | ✅ Complete | Backend | No |
| Event manager | ✅ Complete | Backend | No |
| Dashboard UI | ⏳ In progress | Frontend | Yes (for MVP) |
| Upload UI | ⏳ In progress | Frontend | Yes (for MVP) |
| Bridge component (Go) | ❌ Not started | AgentPipe team | Yes (for streaming) |
| Log file parser | ❌ Not started | Backend | Yes (for upload) |
| Search UI | ⏳ In progress | Frontend | Yes (for MVP) |

### Third-Party Services

| Service | Purpose | Required? | Alternative |
|---------|---------|-----------|-------------|
| Vercel | Hosting | No | Self-host, AWS, GCP |
| Supabase | PostgreSQL hosting | No | Self-host Postgres |
| Sentry | Error tracking | No | Self-host alternatives |
| PostHog | Analytics | No | Self-host, GA4 |

---

## Open Questions

### Product Questions

1. **Q:** Should we support WebSocket in addition to HTTP bridge for lower latency?
   **A:** Start with HTTP (simpler), add WebSocket if latency >500ms in practice

2. **Q:** Should uploaded conversations be editable/deletable?
   **A:** Deletable yes (privacy), editable no (data integrity)

3. **Q:** Do we need multi-user support in MVP?
   **A:** No, single-user (self-hosted) for MVP, multi-user in v0.3.0+

4. **Q:** Should we support non-.log file formats (JSON, CSV)?
   **A:** No for MVP, only AgentPipe .log format. Consider in v0.2.0

5. **Q:** How long should we retain conversations in database?
   **A:** User-controlled, no automatic deletion. Provide cleanup tools

6. **Q:** Should search support regex or fuzzy matching?
   **A:** Start with simple full-text, add fuzzy in v0.2.0 based on feedback

### Technical Questions

7. **Q:** What database indexes are critical for search performance?
   **A:** Full-text index on message.content, composite index on filters

8. **Q:** Should we implement message pagination for large conversations?
   **A:** Yes, paginate at 100 messages per page in detail view

9. **Q:** How do we handle conversations with 1000+ messages?
   **A:** Virtual scrolling in UI, pagination in API, warn users about performance

10. **Q:** Should we store log files in addition to parsed data?
    **A:** No for MVP (storage cost), consider S3 backup in enterprise version

11. **Q:** What's the expected database growth rate?
    **A:** Estimate: 100 conversations/day × 20 messages × 1KB = 2MB/day = 60MB/month

12. **Q:** Do we need a queue for upload processing?
    **A:** No for MVP (synchronous is fine), add queue if uploads >100/hour

### Business Questions

13. **Q:** Is this a free feature or paid/premium?
    **A:** Free for self-hosted, consider hosted SaaS with freemium model

14. **Q:** Do we need SOC2/GDPR compliance?
    **A:** Not for MVP (self-hosted), yes for hosted SaaS version

15. **Q:** Should we offer a hosted version of AgentPipe Web?
    **A:** Not in MVP scope, evaluate after validating self-hosted usage

16. **Q:** What's the estimated infrastructure cost at scale?
    **A:** At 1000 users: ~$500/month (DB: $200, hosting: $200, bandwidth: $100)

---

## Appendices

### Appendix A: Event Schema Reference

See `/docs/agentpipe-integration.md` for complete event schema definitions.

### Appendix B: Log File Format Specification

**AgentPipe Log Format:**
```
=== AgentPipe Chat Log ===
Started: YYYY-MM-DD HH:MM:SS
=====================================

[HH:MM:SS] AgentName (role): Message content

[HH:MM:SS] System (system): System message

=== Chat Ended ===
Ended: YYYY-MM-DD HH:MM:SS
```

**Parsing Rules:**
- First line must be `=== AgentPipe Chat Log ===`
- Extract start time from `Started:` line
- Parse messages matching pattern: `[HH:MM:SS] Name (role): Content`
- Extract end time from `Ended:` line
- Infer conversation status from end marker

### Appendix C: API Rate Limits

| Endpoint | Limit | Window | Scope |
|----------|-------|--------|-------|
| POST /api/ingest | 1000 | 1 minute | Per API key |
| POST /api/upload | 100 | 1 hour | Per user |
| GET /api/conversations | 100 | 1 minute | Per IP |
| POST /api/search | 50 | 1 minute | Per IP |
| GET /api/realtime/stream | 10 | 1 minute | Per IP |

### Appendix D: Database Sizing Estimates

**Per Conversation:**
- Conversation record: ~500 bytes
- Message (avg): ~1KB × 20 messages = 20KB
- Participants: ~500 bytes × 2 agents = 1KB
- **Total:** ~22KB per conversation

**Scaling:**
- 1,000 conversations: 22MB
- 10,000 conversations: 220MB
- 100,000 conversations: 2.2GB
- 1,000,000 conversations: 22GB

**Recommendations:**
- Start with shared Postgres (Supabase free tier)
- Migrate to dedicated instance at 100k conversations
- Consider archiving conversations >1 year old

### Appendix E: Browser Compatibility Matrix

| Browser | Version | SSE Support | Upload Support | Notes |
|---------|---------|-------------|----------------|-------|
| Chrome | 90+ | ✅ | ✅ | Recommended |
| Firefox | 88+ | ✅ | ✅ | Recommended |
| Safari | 14+ | ✅ | ✅ | Recommended |
| Edge | 90+ | ✅ | ✅ | Recommended |
| Chrome Mobile | Latest | ✅ | ✅ | Full support |
| Safari iOS | 14+ | ✅ | ✅ | Full support |

**Not Supported:**
- Internet Explorer (any version)
- Browsers with JavaScript disabled

---

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-10-20 | Product Management | Initial PRD |

---

## Approvals

| Role | Name | Date | Signature |
|------|------|------|-----------|
| Product Manager | [Name] | [Date] | [Signature] |
| Engineering Lead | [Name] | [Date] | [Signature] |
| Design Lead | [Name] | [Date] | [Signature] |
| Stakeholder | [Name] | [Date] | [Signature] |

---

**Next Steps:**

1. Review PRD with engineering and design teams
2. Validate technical feasibility and estimates
3. Create implementation tickets in project tracker
4. Assign owners to each component
5. Begin Phase 1: AgentPipe Bridge Component
6. Begin Phase 2: Web UI Upload Components (parallel track)
7. Schedule weekly progress reviews

**Questions or Feedback?** Contact: [Product Owner Email]
