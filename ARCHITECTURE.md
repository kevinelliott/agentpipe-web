# AgentPipe-Web Architecture

## Overview

AgentPipe-Web is a Next.js 15+ application that displays realtime and historical multi-agent conversations from AgentPipe. The application prioritizes realtime data display while providing comprehensive historical search and discovery capabilities.

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         AgentPipe (Go)                          │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────────────┐   │
│  │ Orchestrator │  │   Metrics    │  │  State Files       │   │
│  │              │  │   Server     │  │  (JSON)            │   │
│  │ Message Flow │──│ /metrics     │  │  ~/.agentpipe/     │   │
│  └──────┬───────┘  └──────────────┘  └────────────────────┘   │
│         │                                                        │
└─────────┼────────────────────────────────────────────────────────┘
          │
          │ NEW: WebSocket/HTTP Bridge
          ▼
┌─────────────────────────────────────────────────────────────────┐
│                    AgentPipe-Web Backend                        │
│                      (Next.js 15 API)                           │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              Real-time Ingest Layer                      │  │
│  │  ┌────────────────┐  ┌─────────────────────────────┐    │  │
│  │  │ WebSocket      │  │ File System Watcher         │    │  │
│  │  │ Receiver       │  │ (FSNotify for state files)  │    │  │
│  │  │ (from AgentP)  │  │                             │    │  │
│  │  └───────┬────────┘  └──────────┬──────────────────┘    │  │
│  │          │                      │                        │  │
│  │          └──────────┬───────────┘                        │  │
│  │                     ▼                                    │  │
│  │          ┌──────────────────────┐                       │  │
│  │          │  Message Queue       │                       │  │
│  │          │  (Redis/In-Memory)   │                       │  │
│  │          └──────────┬───────────┘                       │  │
│  └─────────────────────┼──────────────────────────────────┘  │
│                        │                                      │
│  ┌─────────────────────┼──────────────────────────────────┐  │
│  │              Persistence Layer                         │  │
│  │                     ▼                                  │  │
│  │  ┌──────────────────────────────────────────────┐     │  │
│  │  │         PostgreSQL + Prisma ORM              │     │  │
│  │  │                                              │     │  │
│  │  │  Tables:                                     │     │  │
│  │  │  - conversations (metadata, config)          │     │  │
│  │  │  - messages (content, metrics, timestamps)   │     │  │
│  │  │  - agents (participant data)                 │     │  │
│  │  │  - events (system events, errors)            │     │  │
│  │  └──────────────────────────────────────────────┘     │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                                │
│  ┌────────────────────────────────────────────────────────┐  │
│  │                  API Layer (REST)                      │  │
│  │                                                         │  │
│  │  /api/conversations                                    │  │
│  │    - GET    /                (list with filters)       │  │
│  │    - GET    /:id             (get details)             │  │
│  │    - GET    /:id/messages    (paginated messages)      │  │
│  │                                                         │  │
│  │  /api/search                                           │  │
│  │    - POST   /                (full-text search)        │  │
│  │    - GET    /agents          (filter by agent type)    │  │
│  │    - GET    /models          (filter by model)         │  │
│  │                                                         │  │
│  │  /api/metrics                                          │  │
│  │    - GET    /summary         (aggregate stats)         │  │
│  │    - GET    /costs           (cost breakdown)          │  │
│  │    - GET    /agents          (agent performance)       │  │
│  │                                                         │  │
│  │  /api/realtime (WebSocket/SSE)                         │  │
│  │    - WS     /conversations/:id  (live updates)         │  │
│  │    - SSE    /stream             (all live events)      │  │
│  └────────────────────────────────────────────────────────┘  │
└────────────────────────────┬───────────────────────────────────┘
                             │
                             │ REST + WebSocket
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    AgentPipe-Web Frontend                       │
│                   (Next.js 15 App Router)                       │
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐    │
│  │              Realtime Dashboard (/)                    │    │
│  │                                                         │    │
│  │  ┌─────────────────────────────────────────────┐      │    │
│  │  │  Live Conversation Feed (Primary View)      │      │    │
│  │  │  - Active conversations with status         │      │    │
│  │  │  - Real-time message streaming              │      │    │
│  │  │  - Agent activity indicators                │      │    │
│  │  │  - Token/cost metrics (live)                │      │    │
│  │  └─────────────────────────────────────────────┘      │    │
│  │                                                         │    │
│  │  ┌─────────────────────────────────────────────┐      │    │
│  │  │  Metrics Overview (Secondary Panel)         │      │    │
│  │  │  - Total conversations today                │      │    │
│  │  │  - Active agents                            │      │    │
│  │  │  - Total tokens/costs                       │      │    │
│  │  │  - Agent performance charts                 │      │    │
│  │  └─────────────────────────────────────────────┘      │    │
│  └────────────────────────────────────────────────────────┘    │
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐    │
│  │          Historical View (/history)                    │    │
│  │                                                         │    │
│  │  ┌─────────────────────────────────────────────┐      │    │
│  │  │  Search & Filter Bar                        │      │    │
│  │  │  - Full-text search                         │      │    │
│  │  │  - Filter by: date, agent type, model       │      │    │
│  │  │  - Sort by: date, cost, tokens, duration    │      │    │
│  │  └─────────────────────────────────────────────┘      │    │
│  │                                                         │    │
│  │  ┌─────────────────────────────────────────────┐      │    │
│  │  │  Conversation List                          │      │    │
│  │  │  - Card view with metadata preview          │      │    │
│  │  │  - Infinite scroll / pagination             │      │    │
│  │  │  - Quick stats per conversation             │      │    │
│  │  └─────────────────────────────────────────────┘      │    │
│  └────────────────────────────────────────────────────────┘    │
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐    │
│  │     Conversation Detail (/conversation/:id)            │    │
│  │                                                         │    │
│  │  - Full message timeline                               │    │
│  │  - Agent-specific styling/colors                       │    │
│  │  - Per-message metrics                                 │    │
│  │  - Export options (JSON, Markdown, HTML)               │    │
│  │  - Share conversation link                             │    │
│  └────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
```

## Technology Stack

### Frontend
- **Framework**: Next.js 15+ (App Router)
- **Language**: TypeScript
- **UI Components**: Tailwind CSS + Shadcn/ui
- **State Management**: React Context + SWR for data fetching
- **Realtime**: WebSocket client / EventSource (SSE)
- **Charts**: Recharts or Chart.js
- **Code Highlighting**: Prism.js or Shiki

### Backend (Next.js API Routes)
- **Runtime**: Node.js 20+
- **Database**: PostgreSQL 16+
- **ORM**: Prisma
- **Realtime**: Socket.io or native WebSockets
- **Queue**: Redis (optional, for scaling)
- **API Docs**: OpenAPI/Swagger via next-swagger-doc

### Infrastructure
- **Deployment**: Vercel (recommended) or Docker
- **Database Hosting**: Vercel Postgres, Supabase, or Railway
- **Monitoring**: Vercel Analytics + custom metrics dashboard

## Data Flow

### Realtime Flow
1. AgentPipe conversation starts
2. AgentPipe sends messages to WebSocket bridge (NEW component to build)
3. Bridge forwards to Next.js WebSocket server
4. Server persists to PostgreSQL
5. Server broadcasts to connected clients via WebSocket
6. Frontend updates UI in real-time

### Historical Flow
1. User navigates to /history
2. Frontend fetches paginated conversations via REST API
3. User applies filters/search
4. API queries PostgreSQL with Prisma
5. Results returned and displayed
6. User clicks conversation for detail view

## Database Schema (Prisma)

```prisma
model Conversation {
  id              String    @id @default(cuid())
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  startedAt       DateTime
  completedAt     DateTime?
  status          ConversationStatus
  mode            String    // "round-robin", "reactive", "free-form"
  maxTurns        Int?
  initialPrompt   String
  totalMessages   Int       @default(0)
  totalTokens     Int       @default(0)
  totalCost       Float     @default(0)
  totalDuration   Int       @default(0) // milliseconds

  messages        Message[]
  participants    ConversationAgent[]
  metadata        Json?

  @@index([createdAt])
  @@index([status])
}

model Message {
  id              String    @id @default(cuid())
  conversationId  String
  conversation    Conversation @relation(fields: [conversationId], references: [id], onDelete: Cascade)

  agentId         String
  agentName       String
  agentType       String
  content         String    @db.Text
  role            String    // "agent", "user", "system"
  timestamp       DateTime

  // Metrics
  duration        Int?      // milliseconds
  inputTokens     Int?
  outputTokens    Int?
  totalTokens     Int?
  model           String?
  cost            Float?

  @@index([conversationId, timestamp])
  @@index([agentType])
}

model ConversationAgent {
  id              String    @id @default(cuid())
  conversationId  String
  conversation    Conversation @relation(fields: [conversationId], references: [id], onDelete: Cascade)

  agentId         String
  agentType       String
  agentName       String
  model           String?
  prompt          String?   @db.Text
  announcement    String?

  @@unique([conversationId, agentId])
  @@index([agentType])
}

enum ConversationStatus {
  ACTIVE
  COMPLETED
  INTERRUPTED
  ERROR
}
```

## API Documentation

### REST Endpoints

#### GET /api/conversations
List conversations with optional filters.

**Query Parameters:**
- `status`: Filter by status (active, completed, interrupted, error)
- `agentType`: Filter by agent type (claude, amp, gemini, etc.)
- `model`: Filter by model name
- `startDate`: Filter by start date (ISO 8601)
- `endDate`: Filter by end date (ISO 8601)
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20, max: 100)
- `sort`: Sort field (createdAt, totalCost, totalTokens, totalDuration)
- `order`: Sort order (asc, desc)

**Response:**
```json
{
  "data": [
    {
      "id": "clx...",
      "createdAt": "2025-10-15T10:30:00Z",
      "status": "completed",
      "mode": "round-robin",
      "totalMessages": 12,
      "totalTokens": 5420,
      "totalCost": 0.0234,
      "totalDuration": 45000,
      "participants": ["claude", "gemini", "amp"]
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

#### GET /api/conversations/:id
Get detailed conversation including all messages.

**Response:**
```json
{
  "id": "clx...",
  "createdAt": "2025-10-15T10:30:00Z",
  "status": "completed",
  "mode": "round-robin",
  "initialPrompt": "Discuss the future of AI...",
  "totalMessages": 12,
  "totalTokens": 5420,
  "totalCost": 0.0234,
  "messages": [
    {
      "id": "msg1",
      "agentName": "Claude",
      "agentType": "claude",
      "content": "I think AI will...",
      "timestamp": "2025-10-15T10:30:15Z",
      "role": "agent",
      "duration": 3200,
      "inputTokens": 150,
      "outputTokens": 320,
      "model": "claude-sonnet-4",
      "cost": 0.0021
    }
  ],
  "participants": [
    {
      "agentId": "agent1",
      "agentType": "claude",
      "agentName": "Claude",
      "model": "claude-sonnet-4"
    }
  ]
}
```

#### POST /api/search
Full-text search across conversations and messages.

**Request Body:**
```json
{
  "query": "search terms",
  "filters": {
    "agentTypes": ["claude", "gemini"],
    "models": ["claude-sonnet-4"],
    "startDate": "2025-10-01T00:00:00Z",
    "endDate": "2025-10-15T23:59:59Z"
  },
  "page": 1,
  "limit": 20
}
```

#### GET /api/metrics/summary
Aggregate metrics summary.

**Response:**
```json
{
  "totalConversations": 156,
  "activeConversations": 3,
  "totalMessages": 2340,
  "totalTokens": 1250000,
  "totalCost": 45.67,
  "averageConversationDuration": 38500,
  "topAgents": [
    {"type": "claude", "count": 89, "totalCost": 23.45},
    {"type": "gemini", "count": 67, "totalCost": 12.34}
  ]
}
```

### WebSocket Events

#### Client → Server

**`subscribe`**: Subscribe to conversation updates
```json
{
  "type": "subscribe",
  "conversationId": "clx..."
}
```

**`unsubscribe`**: Unsubscribe from updates
```json
{
  "type": "unsubscribe",
  "conversationId": "clx..."
}
```

#### Server → Client

**`conversation.started`**: New conversation started
```json
{
  "type": "conversation.started",
  "data": {
    "conversationId": "clx...",
    "mode": "round-robin",
    "participants": ["claude", "gemini"],
    "timestamp": "2025-10-15T10:30:00Z"
  }
}
```

**`message.created`**: New message in conversation
```json
{
  "type": "message.created",
  "data": {
    "conversationId": "clx...",
    "message": {
      "id": "msg1",
      "agentName": "Claude",
      "content": "...",
      "timestamp": "2025-10-15T10:30:15Z",
      "metrics": {
        "duration": 3200,
        "tokens": 470,
        "cost": 0.0021
      }
    }
  }
}
```

**`conversation.completed`**: Conversation finished
```json
{
  "type": "conversation.completed",
  "data": {
    "conversationId": "clx...",
    "totalMessages": 12,
    "totalTokens": 5420,
    "totalCost": 0.0234,
    "timestamp": "2025-10-15T10:35:00Z"
  }
}
```

## Required Changes to AgentPipe

To enable realtime delivery, the following changes need to be made to AgentPipe:

1. **WebSocket/HTTP Bridge Component** (NEW)
   - Create a new package `pkg/bridge` that sends events to external systems
   - Support multiple output targets (WebSocket, HTTP POST, Redis)
   - Configurable via `config.yaml`

2. **Event Emission Points**
   - Conversation started/completed/interrupted
   - Message created (with full metrics)
   - Turn started/completed
   - Error occurred

3. **Configuration Schema Updates**
   ```yaml
   bridge:
     enabled: true
     type: "websocket"  # or "http", "redis"
     url: "ws://localhost:3000/api/ingest"
     auth:
       type: "bearer"
       token: "secret-token"
   ```

4. **Message Format Standardization**
   - Ensure all events follow a consistent JSON schema
   - Include conversation metadata with each message
   - Add event types and timestamps

## Implementation Phases

### Phase 1: Foundation (Week 1)
- Initialize Next.js 15 project with TypeScript
- Set up Prisma with PostgreSQL
- Create database schema and migrations
- Implement basic REST API endpoints
- Set up Tailwind CSS + Shadcn/ui

### Phase 2: Historical View (Week 2)
- Build conversation list page with pagination
- Implement search and filtering
- Create conversation detail view
- Add export functionality
- Implement API documentation

### Phase 3: Realtime Infrastructure (Week 3)
- Implement WebSocket server in Next.js
- Create file system watcher for state files
- Build message ingestion pipeline
- Test end-to-end data flow

### Phase 4: Realtime UI (Week 4)
- Build live dashboard with WebSocket client
- Implement real-time message streaming
- Add activity indicators and live metrics
- Create responsive layouts for mobile

### Phase 5: AgentPipe Integration (Week 5)
- Design and implement bridge component in Go
- Add event emission to orchestrator
- Test integration with agentpipe-web
- Document configuration and deployment

### Phase 6: Polish & Deploy (Week 6)
- Performance optimization
- Error handling and edge cases
- Comprehensive testing
- Deployment to production
- User documentation

## Security Considerations

1. **Authentication**: Implement API key authentication for AgentPipe bridge
2. **Rate Limiting**: Protect API endpoints from abuse
3. **Data Validation**: Sanitize all inputs from AgentPipe
4. **CORS**: Configure proper CORS for API endpoints
5. **WebSocket Authentication**: Validate connections before subscribing to events

## Monitoring & Observability

1. **Application Metrics**
   - API response times
   - WebSocket connection count
   - Database query performance
   - Message processing throughput

2. **Business Metrics**
   - Conversations per day
   - Average conversation duration
   - Total costs tracked
   - Agent usage distribution

3. **Error Tracking**
   - Failed message ingestion
   - WebSocket disconnections
   - Database errors
   - AgentPipe bridge failures
