# AgentPipe Streaming Architecture

## Executive Summary

This document defines the technical architecture for real-time session streaming and historical session uploads between AgentPipe CLI (Go-based) and AgentPipe Web (Next.js 15 + PostgreSQL).

**Key Decisions:**
- **Real-time Communication**: Server-Sent Events (SSE) for web clients, HTTP POST for CLI ingestion
- **Authentication**: API key-based authentication with optional per-user token support
- **Data Format**: JSON-based event payloads with strict schema validation
- **Database**: Existing Prisma schema already supports the use case (minimal changes needed)

---

## 1. Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                         AgentPipe CLI (Go)                          │
│                                                                      │
│  ┌──────────────────┐      ┌──────────────────┐                    │
│  │  Session Runner  │──────│  Event Emitter   │                    │
│  └──────────────────┘      └──────────────────┘                    │
│                                     │                               │
│                                     │ HTTP POST (Real-time Events)  │
│                                     ▼                               │
│                            ┌─────────────────┐                      │
│                            │  HTTP Client    │                      │
│                            └─────────────────┘                      │
└─────────────────────────────────────│───────────────────────────────┘
                                      │
                                      │ HTTPS
                                      │ Bearer Token Auth
                                      │
┌─────────────────────────────────────▼───────────────────────────────┐
│                       AgentPipe Web (Next.js)                       │
│                                                                      │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │                    API Layer (Route Handlers)                  │  │
│  │                                                                 │  │
│  │  ┌────────────────────┐         ┌─────────────────────┐       │  │
│  │  │  POST /api/ingest  │         │ GET /api/sessions   │       │  │
│  │  │  (CLI → Web)       │         │ POST /api/sessions  │       │  │
│  │  │                    │         │ (Historical Upload) │       │  │
│  │  └────────┬───────────┘         └──────────────────── ┘       │  │
│  │           │                                                     │  │
│  │           │ Validate & Store                                   │  │
│  │           ▼                                                     │  │
│  │  ┌─────────────────────┐       ┌──────────────────────┐       │  │
│  │  │   EventManager      │──────▶│   SSE Broadcaster    │       │  │
│  │  │   (In-Memory)       │       └──────────────────────┘       │  │
│  │  └─────────────────────┘                  │                    │  │
│  └───────────────────────────────────────────│────────────────────┘  │
│                                              │                       │
│  ┌───────────────────────────────────────────▼────────────────────┐  │
│  │                  Database Layer (Prisma ORM)                   │  │
│  │                                                                 │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌────────────────────┐   │  │
│  │  │Conversations │  │   Messages   │  │ ConversationAgents │   │  │
│  │  └──────────────┘  └──────────────┘  └────────────────────┘   │  │
│  └─────────────────────────────────────────────────────────────── ┘  │
│                                                                      │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │              PostgreSQL Database (Persistent Store)            │  │
│  └───────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────▲───────────────────────────┘
                                           │
                                           │ SSE Stream
                                           │ (text/event-stream)
                                           │
┌──────────────────────────────────────────┴───────────────────────────┐
│                      Web Browser (React Client)                      │
│                                                                       │
│  ┌────────────────────┐     ┌──────────────────────────────┐        │
│  │  EventSource API   │────▶│  Real-time UI Updates         │        │
│  └────────────────────┘     └──────────────────────────────┘        │
└───────────────────────────────────────────────────────────────────────┘
```

### Architecture Rationale

**Why Server-Sent Events (SSE) instead of WebSockets?**

1. **Unidirectional Flow**: CLI → Web is a one-way data stream. SSE is optimized for this pattern.
2. **Simplicity**: No WebSocket server management, works with standard HTTP/HTTPS
3. **Auto-Reconnection**: Built-in browser reconnection on network failures
4. **HTTP/2 Multiplexing**: Can handle many SSE connections efficiently
5. **Firewall/Proxy Friendly**: Works through standard HTTP infrastructure
6. **Already Implemented**: The existing `/api/realtime/stream` endpoint uses SSE

**Why separate ingestion endpoint?**

- **Decoupling**: CLI doesn't need to know about SSE implementation
- **Security**: Different auth requirements for CLI (write) vs browsers (read)
- **Batching**: Can batch events before broadcasting
- **Validation**: Centralized event validation before database writes

---

## 2. Database Schema

The existing Prisma schema is well-designed and requires **NO changes** for this feature. Here's how it maps:

### Current Schema (Already Supports Streaming)

```prisma
// prisma/schema.prisma

enum ConversationStatus {
  ACTIVE      // Streaming in progress
  COMPLETED   // Stream finished successfully
  INTERRUPTED // Stream stopped/cancelled
  ERROR       // Stream failed
}

model Conversation {
  id              String               @id @default(cuid())
  createdAt       DateTime             @default(now())
  updatedAt       DateTime             @updatedAt
  startedAt       DateTime             @default(now())
  completedAt     DateTime?
  status          ConversationStatus   @default(ACTIVE)

  // Configuration
  name            String
  mode            String               // "round-robin", "reactive", "free-form"
  maxTurns        Int?
  initialPrompt   String               @db.Text

  // Source tracking (new field - optional enhancement)
  source          String?              // "cli", "web", "api"
  sourceVersion   String?              // CLI version for tracking

  // Aggregate metrics (updated incrementally during streaming)
  totalMessages   Int                  @default(0)
  totalTokens     Int                  @default(0)
  totalCost       Float                @default(0)
  totalDuration   Int                  @default(0)

  // Relations
  messages        Message[]
  participants    ConversationAgent[]

  // Flexible metadata
  metadata        Json?

  @@index([createdAt])
  @@index([status])
  @@index([source])  // New index for filtering CLI vs Web sessions
}

model Message {
  id              String       @id @default(cuid())
  conversationId  String
  conversation    Conversation @relation(fields: [conversationId], references: [id], onDelete: Cascade)

  // Agent info
  agentId         String
  agentName       String
  agentType       String
  agentVersion    String?

  // Message content
  content         String       @db.Text
  role            String       // "agent", "user", "system"
  timestamp       DateTime     @default(now())

  // Performance metrics
  duration        Int?
  inputTokens     Int?
  outputTokens    Int?
  totalTokens     Int?
  model           String?
  cost            Float?

  // Sequence tracking (important for streaming order)
  sequenceNumber  Int?         // Order within conversation

  @@index([conversationId, timestamp])
  @@index([conversationId, sequenceNumber])  // New index for ordered retrieval
  @@index([agentType])
  @@index([timestamp])
}

model ConversationAgent {
  id              String       @id @default(cuid())
  conversationId  String
  conversation    Conversation @relation(fields: [conversationId], references: [id], onDelete: Cascade)

  // Agent configuration
  agentId         String
  agentType       String
  agentName       String
  agentVersion    String?
  model           String?
  prompt          String?      @db.Text
  announcement    String?
  settings        Json?

  @@unique([conversationId, agentId])
  @@index([agentType])
}

model Event {
  id              String       @id @default(cuid())
  createdAt       DateTime     @default(now())
  type            String
  conversationId  String?
  data            Json
  errorMessage    String?      @db.Text
  errorStack      String?      @db.Text

  @@index([createdAt])
  @@index([type])
  @@index([conversationId])
}
```

### Optional Schema Enhancements

If you want to add source tracking (recommended but not required):

```prisma
// Add to Conversation model
source          String?              // "cli", "web", "api"
sourceVersion   String?              // CLI version
cliMetadata     Json?                // CLI-specific metadata

// Add to Message model
sequenceNumber  Int?                 // Explicit ordering

// Migration
npx prisma migrate dev --name add_source_tracking
```

---

## 3. API Specifications

### 3.1 Real-time Ingestion API (CLI → Web)

**Endpoint**: `POST /api/ingest`

**Purpose**: Receive real-time events from AgentPipe CLI and broadcast to connected clients

**Authentication**: Bearer token (environment variable `AGENTPIPE_BRIDGE_API_KEY`)

**Headers**:
```http
POST /api/ingest HTTP/1.1
Host: agentpipe-web.example.com
Content-Type: application/json
Authorization: Bearer <AGENTPIPE_BRIDGE_API_KEY>
```

**Event Types & Payloads**:

#### 3.1.1 `conversation.started`

Sent when CLI starts a new conversation.

```json
{
  "type": "conversation.started",
  "timestamp": "2025-10-20T14:30:00.000Z",
  "data": {
    "name": "Product Brainstorm Session",
    "mode": "round-robin",
    "maxTurns": 10,
    "initialPrompt": "Let's brainstorm product ideas for Q4",
    "participants": [
      {
        "agentId": "agent-1",
        "agentType": "claude",
        "agentName": "Product Manager",
        "agentVersion": "1.2.0",
        "model": "claude-sonnet-4",
        "prompt": "You are a product manager...",
        "announcement": "Hi, I'm the PM",
        "settings": {
          "temperature": 0.7
        }
      },
      {
        "agentId": "agent-2",
        "agentType": "gpt",
        "agentName": "Engineer",
        "agentVersion": "1.2.0",
        "model": "gpt-4-turbo",
        "prompt": "You are a senior engineer..."
      }
    ],
    "metadata": {
      "cliVersion": "1.5.0",
      "platform": "darwin",
      "user": "kevin"
    }
  }
}
```

**Response**:
```json
{
  "conversationId": "cm1a2b3c4d5e6f7g8h9i0",
  "status": "created"
}
```

#### 3.1.2 `message.created`

Sent for each message in the conversation.

```json
{
  "type": "message.created",
  "timestamp": "2025-10-20T14:30:05.123Z",
  "data": {
    "conversationId": "cm1a2b3c4d5e6f7g8h9i0",
    "message": {
      "agentId": "agent-1",
      "agentName": "Product Manager",
      "agentType": "claude",
      "agentVersion": "1.2.0",
      "content": "Let's focus on AI-powered productivity tools...",
      "role": "agent",
      "timestamp": "2025-10-20T14:30:05.100Z",
      "sequenceNumber": 1,
      "metrics": {
        "duration": 2340,
        "inputTokens": 150,
        "outputTokens": 85,
        "totalTokens": 235,
        "model": "claude-sonnet-4",
        "cost": 0.00047
      }
    }
  }
}
```

**Response**:
```json
{
  "messageId": "cm2a3b4c5d6e7f8g9h0i1",
  "status": "created"
}
```

#### 3.1.3 `conversation.completed`

Sent when conversation finishes normally.

```json
{
  "type": "conversation.completed",
  "timestamp": "2025-10-20T14:35:00.000Z",
  "data": {
    "conversationId": "cm1a2b3c4d5e6f7g8h9i0",
    "totalMessages": 20,
    "totalTokens": 4500,
    "totalCost": 0.0089,
    "totalDuration": 45000,
    "completionReason": "max_turns_reached"
  }
}
```

#### 3.1.4 `conversation.interrupted`

Sent when conversation is stopped/cancelled.

```json
{
  "type": "conversation.interrupted",
  "timestamp": "2025-10-20T14:33:00.000Z",
  "data": {
    "conversationId": "cm1a2b3c4d5e6f7g8h9i0",
    "reason": "user_cancelled",
    "totalMessages": 12,
    "totalTokens": 2700,
    "totalCost": 0.0054,
    "totalDuration": 27000
  }
}
```

#### 3.1.5 `error.occurred`

Sent when an error occurs during conversation.

```json
{
  "type": "error.occurred",
  "timestamp": "2025-10-20T14:32:00.000Z",
  "data": {
    "conversationId": "cm1a2b3c4d5e6f7g8h9i0",
    "error": "API rate limit exceeded",
    "errorCode": "RATE_LIMIT",
    "agentId": "agent-1",
    "details": {
      "retryAfter": 60,
      "limit": 100,
      "remaining": 0
    }
  }
}
```

**Error Responses**:

```json
// 401 Unauthorized
{
  "error": "Unauthorized",
  "message": "Invalid or missing API key"
}

// 400 Bad Request
{
  "error": "Invalid event format",
  "message": "Missing required field: conversationId",
  "field": "data.conversationId"
}

// 500 Internal Server Error
{
  "error": "Database error",
  "message": "Failed to create message"
}
```

---

### 3.2 Historical Upload API (CLI → Web)

**Endpoint**: `POST /api/sessions/upload`

**Purpose**: Upload entire historical session data in bulk

**Authentication**: Bearer token (same as ingestion)

**Headers**:
```http
POST /api/sessions/upload HTTP/1.1
Host: agentpipe-web.example.com
Content-Type: application/json
Authorization: Bearer <AGENTPIPE_BRIDGE_API_KEY>
```

**Request Body**:

```json
{
  "session": {
    "name": "Historical Product Discussion",
    "mode": "round-robin",
    "maxTurns": 15,
    "initialPrompt": "Discuss Q3 product roadmap",
    "status": "COMPLETED",
    "startedAt": "2025-10-15T10:00:00.000Z",
    "completedAt": "2025-10-15T10:45:00.000Z",
    "totalDuration": 2700000,
    "metadata": {
      "cliVersion": "1.4.0",
      "importedFrom": "local_storage",
      "originalId": "local-session-123"
    }
  },
  "participants": [
    {
      "agentId": "agent-1",
      "agentType": "claude",
      "agentName": "PM",
      "agentVersion": "1.1.0",
      "model": "claude-sonnet-3.5",
      "prompt": "You are a PM..."
    },
    {
      "agentId": "agent-2",
      "agentType": "gpt",
      "agentName": "Designer",
      "model": "gpt-4"
    }
  ],
  "messages": [
    {
      "agentId": "agent-1",
      "agentName": "PM",
      "agentType": "claude",
      "agentVersion": "1.1.0",
      "content": "Let's start with user research findings...",
      "role": "agent",
      "timestamp": "2025-10-15T10:01:00.000Z",
      "sequenceNumber": 1,
      "metrics": {
        "duration": 2100,
        "inputTokens": 120,
        "outputTokens": 95,
        "totalTokens": 215,
        "model": "claude-sonnet-3.5",
        "cost": 0.00043
      }
    },
    {
      "agentId": "agent-2",
      "agentName": "Designer",
      "agentType": "gpt",
      "content": "I agree, let's look at the user personas...",
      "role": "agent",
      "timestamp": "2025-10-15T10:02:00.000Z",
      "sequenceNumber": 2,
      "metrics": {
        "duration": 1800,
        "totalTokens": 180,
        "model": "gpt-4",
        "cost": 0.0036
      }
    }
  ]
}
```

**Response** (Success):
```json
{
  "success": true,
  "conversationId": "cm3a4b5c6d7e8f9g0h1i2",
  "messagesCreated": 15,
  "participantsCreated": 2,
  "totalTokens": 4200,
  "totalCost": 0.0084
}
```

**Response** (Error):
```json
{
  "error": "Validation failed",
  "details": [
    {
      "field": "messages[3].agentId",
      "message": "agentId not found in participants"
    }
  ]
}
```

**Implementation Notes**:
- Use database transaction to ensure atomicity
- Validate all agentIds exist in participants array
- Calculate aggregate metrics from messages
- Preserve original timestamps
- Handle duplicate uploads (idempotency via metadata.originalId)

---

### 3.3 Real-time SSE Stream (Web Client ← Web Server)

**Endpoint**: `GET /api/realtime/stream`

**Purpose**: Subscribe to real-time events for web UI

**Authentication**: Optional (can be public or session-based)

**Query Parameters**:
- `conversationId` (optional): Filter events for specific conversation

**Usage**:
```javascript
// Subscribe to all events
const eventSource = new EventSource('/api/realtime/stream');

// Subscribe to specific conversation
const eventSource = new EventSource('/api/realtime/stream?conversationId=cm1a2b3c4d5e6f7g8h9i0');

eventSource.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('Event:', data.type, data);
};

eventSource.addEventListener('conversation.started', (event) => {
  const data = JSON.parse(event.data);
  // Handle conversation started
});

eventSource.addEventListener('message.created', (event) => {
  const data = JSON.parse(event.data);
  // Handle new message
});
```

**Event Stream Format**:
```
HTTP/1.1 200 OK
Content-Type: text/event-stream
Cache-Control: no-cache, no-transform
Connection: keep-alive

data: {"type":"connected","timestamp":"2025-10-20T14:30:00.000Z","message":"Subscribed to all events"}

data: {"type":"conversation.started","timestamp":"2025-10-20T14:30:05.000Z","data":{"conversationId":"cm1a2b3c4d5e6f7g8h9i0",...}}

data: {"type":"message.created","timestamp":"2025-10-20T14:30:10.000Z","data":{"conversationId":"cm1a2b3c4d5e6f7g8h9i0","message":{...}}}

:heartbeat

data: {"type":"message.created","timestamp":"2025-10-20T14:30:15.000Z","data":{...}}
```

---

### 3.4 Session Retrieval APIs

#### 3.4.1 List Sessions

**Endpoint**: `GET /api/sessions`

**Query Parameters**:
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20, max: 100)
- `status`: Filter by status (ACTIVE, COMPLETED, INTERRUPTED, ERROR)
- `source`: Filter by source (cli, web, api)
- `agentType`: Filter by agent type
- `startDate`: Filter by start date (ISO 8601)
- `endDate`: Filter by end date (ISO 8601)
- `sort`: Sort field (createdAt, totalCost, totalTokens)
- `order`: Sort order (asc, desc)

**Response**:
```json
{
  "data": [
    {
      "id": "cm1a2b3c4d5e6f7g8h9i0",
      "name": "Product Brainstorm",
      "status": "COMPLETED",
      "mode": "round-robin",
      "createdAt": "2025-10-20T14:30:00.000Z",
      "completedAt": "2025-10-20T14:35:00.000Z",
      "totalMessages": 20,
      "totalTokens": 4500,
      "totalCost": 0.0089,
      "totalDuration": 45000,
      "participantCount": 2,
      "participantTypes": ["claude", "gpt"]
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

#### 3.4.2 Get Session Details

**Endpoint**: `GET /api/sessions/:id`

**Query Parameters**:
- `includeMessages`: Include all messages (default: false)
- `messageLimit`: Limit messages returned (default: 100)

**Response**:
```json
{
  "id": "cm1a2b3c4d5e6f7g8h9i0",
  "name": "Product Brainstorm",
  "status": "COMPLETED",
  "mode": "round-robin",
  "maxTurns": 10,
  "initialPrompt": "Let's brainstorm...",
  "createdAt": "2025-10-20T14:30:00.000Z",
  "startedAt": "2025-10-20T14:30:00.000Z",
  "completedAt": "2025-10-20T14:35:00.000Z",
  "totalMessages": 20,
  "totalTokens": 4500,
  "totalCost": 0.0089,
  "totalDuration": 45000,
  "metadata": {
    "cliVersion": "1.5.0",
    "source": "cli"
  },
  "participants": [
    {
      "id": "cma1b2c3d4e5f6g7h8i9j0",
      "agentId": "agent-1",
      "agentType": "claude",
      "agentName": "Product Manager",
      "agentVersion": "1.2.0",
      "model": "claude-sonnet-4",
      "prompt": "You are a PM..."
    }
  ],
  "messages": [
    {
      "id": "cm2a3b4c5d6e7f8g9h0i1",
      "agentId": "agent-1",
      "agentName": "Product Manager",
      "agentType": "claude",
      "content": "Let's focus on...",
      "role": "agent",
      "timestamp": "2025-10-20T14:30:05.000Z",
      "sequenceNumber": 1,
      "metrics": {
        "duration": 2340,
        "totalTokens": 235,
        "cost": 0.00047
      }
    }
  ]
}
```

---

## 4. Data Format Specifications

### 4.1 TypeScript Interfaces

```typescript
// Event wrapper (for both ingest and SSE)
export interface AgentPipeEvent<T = any> {
  type: EventType;
  timestamp: string; // ISO 8601
  data: T;
}

export enum EventType {
  CONVERSATION_STARTED = 'conversation.started',
  MESSAGE_CREATED = 'message.created',
  CONVERSATION_COMPLETED = 'conversation.completed',
  CONVERSATION_INTERRUPTED = 'conversation.interrupted',
  ERROR_OCCURRED = 'error.occurred',
  TURN_STARTED = 'turn.started',
  TURN_COMPLETED = 'turn.completed',
}

// Conversation started event
export interface ConversationStartedPayload {
  name?: string;
  mode: 'round-robin' | 'reactive' | 'free-form';
  maxTurns?: number;
  initialPrompt: string;
  participants: ParticipantConfig[];
  metadata?: Record<string, any>;
}

export interface ParticipantConfig {
  agentId: string;
  agentType: string;
  agentName: string;
  agentVersion?: string;
  model?: string;
  prompt?: string;
  announcement?: string;
  settings?: Record<string, any>;
}

// Message created event
export interface MessageCreatedPayload {
  conversationId: string;
  message: MessageData;
}

export interface MessageData {
  agentId: string;
  agentName: string;
  agentType: string;
  agentVersion?: string;
  content: string;
  role: 'agent' | 'user' | 'system';
  timestamp: string; // ISO 8601
  sequenceNumber?: number;
  metrics?: ResponseMetrics;
}

export interface ResponseMetrics {
  duration?: number;        // milliseconds
  inputTokens?: number;
  outputTokens?: number;
  totalTokens?: number;
  model?: string;
  cost?: number;            // USD
}

// Conversation completed event
export interface ConversationCompletedPayload {
  conversationId: string;
  totalMessages: number;
  totalTokens: number;
  totalCost: number;
  totalDuration: number;    // milliseconds
  completionReason?: string;
}

// Conversation interrupted event
export interface ConversationInterruptedPayload {
  conversationId: string;
  reason?: string;
  totalMessages?: number;
  totalTokens?: number;
  totalCost?: number;
  totalDuration?: number;
}

// Error event
export interface ErrorOccurredPayload {
  conversationId?: string;
  error: string;
  errorCode?: string;
  agentId?: string;
  details?: Record<string, any>;
}

// Historical upload format
export interface SessionUploadRequest {
  session: SessionMetadata;
  participants: ParticipantConfig[];
  messages: MessageData[];
}

export interface SessionMetadata {
  name: string;
  mode: string;
  maxTurns?: number;
  initialPrompt: string;
  status: 'ACTIVE' | 'COMPLETED' | 'INTERRUPTED' | 'ERROR';
  startedAt: string;
  completedAt?: string;
  totalDuration?: number;
  metadata?: Record<string, any>;
}
```

### 4.2 Zod Validation Schemas

```typescript
import { z } from 'zod';

// Message metrics schema
const responseMetricsSchema = z.object({
  duration: z.number().int().positive().optional(),
  inputTokens: z.number().int().nonnegative().optional(),
  outputTokens: z.number().int().nonnegative().optional(),
  totalTokens: z.number().int().nonnegative().optional(),
  model: z.string().optional(),
  cost: z.number().nonnegative().optional(),
});

// Participant schema
const participantSchema = z.object({
  agentId: z.string().min(1),
  agentType: z.string().min(1),
  agentName: z.string().min(1),
  agentVersion: z.string().optional(),
  model: z.string().optional(),
  prompt: z.string().optional(),
  announcement: z.string().optional(),
  settings: z.record(z.any()).optional(),
});

// Message schema
const messageSchema = z.object({
  agentId: z.string().min(1),
  agentName: z.string().min(1),
  agentType: z.string().min(1),
  agentVersion: z.string().optional(),
  content: z.string().min(1),
  role: z.enum(['agent', 'user', 'system']),
  timestamp: z.string().datetime(),
  sequenceNumber: z.number().int().nonnegative().optional(),
  metrics: responseMetricsSchema.optional(),
});

// Event schemas
const conversationStartedSchema = z.object({
  type: z.literal('conversation.started'),
  timestamp: z.string().datetime(),
  data: z.object({
    name: z.string().optional(),
    mode: z.enum(['round-robin', 'reactive', 'free-form']),
    maxTurns: z.number().int().positive().optional(),
    initialPrompt: z.string().min(1),
    participants: z.array(participantSchema).min(1),
    metadata: z.record(z.any()).optional(),
  }),
});

const messageCreatedSchema = z.object({
  type: z.literal('message.created'),
  timestamp: z.string().datetime(),
  data: z.object({
    conversationId: z.string().min(1),
    message: messageSchema,
  }),
});

const conversationCompletedSchema = z.object({
  type: z.literal('conversation.completed'),
  timestamp: z.string().datetime(),
  data: z.object({
    conversationId: z.string().min(1),
    totalMessages: z.number().int().nonnegative(),
    totalTokens: z.number().int().nonnegative(),
    totalCost: z.number().nonnegative(),
    totalDuration: z.number().int().nonnegative(),
    completionReason: z.string().optional(),
  }),
});

const conversationInterruptedSchema = z.object({
  type: z.literal('conversation.interrupted'),
  timestamp: z.string().datetime(),
  data: z.object({
    conversationId: z.string().min(1),
    reason: z.string().optional(),
    totalMessages: z.number().int().nonnegative().optional(),
    totalTokens: z.number().int().nonnegative().optional(),
    totalCost: z.number().nonnegative().optional(),
    totalDuration: z.number().int().nonnegative().optional(),
  }),
});

const errorOccurredSchema = z.object({
  type: z.literal('error.occurred'),
  timestamp: z.string().datetime(),
  data: z.object({
    conversationId: z.string().optional(),
    error: z.string().min(1),
    errorCode: z.string().optional(),
    agentId: z.string().optional(),
    details: z.record(z.any()).optional(),
  }),
});

// Union type for all events
export const agentPipeEventSchema = z.discriminatedUnion('type', [
  conversationStartedSchema,
  messageCreatedSchema,
  conversationCompletedSchema,
  conversationInterruptedSchema,
  errorOccurredSchema,
]);

// Session upload schema
export const sessionUploadSchema = z.object({
  session: z.object({
    name: z.string().min(1),
    mode: z.enum(['round-robin', 'reactive', 'free-form']),
    maxTurns: z.number().int().positive().optional(),
    initialPrompt: z.string().min(1),
    status: z.enum(['ACTIVE', 'COMPLETED', 'INTERRUPTED', 'ERROR']),
    startedAt: z.string().datetime(),
    completedAt: z.string().datetime().optional(),
    totalDuration: z.number().int().nonnegative().optional(),
    metadata: z.record(z.any()).optional(),
  }),
  participants: z.array(participantSchema).min(1),
  messages: z.array(messageSchema),
}).refine(
  (data) => {
    // Validate all message agentIds exist in participants
    const participantIds = new Set(data.participants.map(p => p.agentId));
    return data.messages.every(m => participantIds.has(m.agentId));
  },
  {
    message: 'All message agentIds must exist in participants array',
  }
);
```

---

## 5. AgentPipe CLI Integration

### 5.1 Go HTTP Client Implementation

```go
// cli/pkg/streaming/client.go

package streaming

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"time"
)

// Config holds streaming client configuration
type Config struct {
	BaseURL    string        // e.g., "https://agentpipe-web.example.com"
	APIKey     string        // Bearer token
	Timeout    time.Duration // HTTP timeout (default: 30s)
	RetryCount int           // Number of retries on failure
}

// Client sends events to AgentPipe Web
type Client struct {
	config     Config
	httpClient *http.Client
}

// NewClient creates a streaming client
func NewClient(config Config) *Client {
	if config.Timeout == 0 {
		config.Timeout = 30 * time.Second
	}
	if config.RetryCount == 0 {
		config.RetryCount = 3
	}

	return &Client{
		config: config,
		httpClient: &http.Client{
			Timeout: config.Timeout,
		},
	}
}

// Event represents a generic event
type Event struct {
	Type      string      `json:"type"`
	Timestamp time.Time   `json:"timestamp"`
	Data      interface{} `json:"data"`
}

// SendEvent sends an event to the ingestion endpoint
func (c *Client) SendEvent(event Event) error {
	// Set timestamp if not provided
	if event.Timestamp.IsZero() {
		event.Timestamp = time.Now()
	}

	// Marshal event to JSON
	payload, err := json.Marshal(event)
	if err != nil {
		return fmt.Errorf("failed to marshal event: %w", err)
	}

	// Create request
	url := fmt.Sprintf("%s/api/ingest", c.config.BaseURL)
	req, err := http.NewRequest("POST", url, bytes.NewBuffer(payload))
	if err != nil {
		return fmt.Errorf("failed to create request: %w", err)
	}

	// Set headers
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", c.config.APIKey))

	// Send request with retries
	var lastErr error
	for i := 0; i < c.config.RetryCount; i++ {
		resp, err := c.httpClient.Do(req)
		if err != nil {
			lastErr = err
			time.Sleep(time.Second * time.Duration(i+1)) // Exponential backoff
			continue
		}
		defer resp.Body.Close()

		// Check response status
		if resp.StatusCode >= 200 && resp.StatusCode < 300 {
			return nil // Success
		}

		// Read error response
		body, _ := io.ReadAll(resp.Body)
		lastErr = fmt.Errorf("HTTP %d: %s", resp.StatusCode, string(body))

		// Don't retry on 4xx errors (client errors)
		if resp.StatusCode >= 400 && resp.StatusCode < 500 {
			break
		}

		time.Sleep(time.Second * time.Duration(i+1))
	}

	return fmt.Errorf("failed to send event after %d retries: %w", c.config.RetryCount, lastErr)
}

// ConversationStarted sends a conversation.started event
func (c *Client) ConversationStarted(data ConversationStartedData) (string, error) {
	event := Event{
		Type: "conversation.started",
		Data: data,
	}

	err := c.SendEvent(event)
	if err != nil {
		return "", err
	}

	// In a real implementation, parse the response to get conversationId
	// For now, return empty string
	return "", nil
}

// MessageCreated sends a message.created event
func (c *Client) MessageCreated(conversationID string, message MessageData) error {
	event := Event{
		Type: "message.created",
		Data: map[string]interface{}{
			"conversationId": conversationID,
			"message":        message,
		},
	}

	return c.SendEvent(event)
}

// ConversationCompleted sends a conversation.completed event
func (c *Client) ConversationCompleted(data ConversationCompletedData) error {
	event := Event{
		Type: "conversation.completed",
		Data: data,
	}

	return c.SendEvent(event)
}

// ConversationInterrupted sends a conversation.interrupted event
func (c *Client) ConversationInterrupted(conversationID, reason string) error {
	event := Event{
		Type: "conversation.interrupted",
		Data: map[string]interface{}{
			"conversationId": conversationID,
			"reason":         reason,
		},
	}

	return c.SendEvent(event)
}

// ErrorOccurred sends an error.occurred event
func (c *Client) ErrorOccurred(conversationID, errorMsg string, details map[string]interface{}) error {
	event := Event{
		Type: "error.occurred",
		Data: map[string]interface{}{
			"conversationId": conversationID,
			"error":          errorMsg,
			"details":        details,
		},
	}

	return c.SendEvent(event)
}

// Data structures matching the API spec

type ConversationStartedData struct {
	Name          string                 `json:"name,omitempty"`
	Mode          string                 `json:"mode"`
	MaxTurns      int                    `json:"maxTurns,omitempty"`
	InitialPrompt string                 `json:"initialPrompt"`
	Participants  []ParticipantConfig    `json:"participants"`
	Metadata      map[string]interface{} `json:"metadata,omitempty"`
}

type ParticipantConfig struct {
	AgentID       string                 `json:"agentId"`
	AgentType     string                 `json:"agentType"`
	AgentName     string                 `json:"agentName"`
	AgentVersion  string                 `json:"agentVersion,omitempty"`
	Model         string                 `json:"model,omitempty"`
	Prompt        string                 `json:"prompt,omitempty"`
	Announcement  string                 `json:"announcement,omitempty"`
	Settings      map[string]interface{} `json:"settings,omitempty"`
}

type MessageData struct {
	AgentID        string          `json:"agentId"`
	AgentName      string          `json:"agentName"`
	AgentType      string          `json:"agentType"`
	AgentVersion   string          `json:"agentVersion,omitempty"`
	Content        string          `json:"content"`
	Role           string          `json:"role"`
	Timestamp      time.Time       `json:"timestamp"`
	SequenceNumber int             `json:"sequenceNumber,omitempty"`
	Metrics        *ResponseMetrics `json:"metrics,omitempty"`
}

type ResponseMetrics struct {
	Duration     int     `json:"duration,omitempty"`     // milliseconds
	InputTokens  int     `json:"inputTokens,omitempty"`
	OutputTokens int     `json:"outputTokens,omitempty"`
	TotalTokens  int     `json:"totalTokens,omitempty"`
	Model        string  `json:"model,omitempty"`
	Cost         float64 `json:"cost,omitempty"`
}

type ConversationCompletedData struct {
	ConversationID   string  `json:"conversationId"`
	TotalMessages    int     `json:"totalMessages"`
	TotalTokens      int     `json:"totalTokens"`
	TotalCost        float64 `json:"totalCost"`
	TotalDuration    int     `json:"totalDuration"` // milliseconds
	CompletionReason string  `json:"completionReason,omitempty"`
}
```

### 5.2 CLI Configuration

```yaml
# ~/.agentpipe/config.yaml

# AgentPipe Web streaming configuration
streaming:
  enabled: true
  base_url: "https://agentpipe-web.example.com"
  api_key: "${AGENTPIPE_API_KEY}"  # Environment variable
  timeout: 30s
  retry_count: 3

  # Optional: Batch events before sending
  batch_size: 1  # Send immediately (1), or batch multiple events
  batch_timeout: 1s  # Max time to wait before sending batch

# Historical upload
upload:
  auto_upload_on_completion: false
  storage_path: "~/.agentpipe/sessions"
```

### 5.3 CLI Usage Example

```go
// Example: Streaming from CLI orchestrator

package main

import (
	"fmt"
	"log"
	"os"

	"github.com/yourusername/agentpipe/pkg/streaming"
)

func main() {
	// Initialize streaming client
	client := streaming.NewClient(streaming.Config{
		BaseURL: os.Getenv("AGENTPIPE_WEB_URL"),
		APIKey:  os.Getenv("AGENTPIPE_API_KEY"),
	})

	// Start conversation
	conversationID, err := client.ConversationStarted(streaming.ConversationStartedData{
		Name:          "Product Brainstorm",
		Mode:          "round-robin",
		MaxTurns:      10,
		InitialPrompt: "Let's brainstorm product ideas",
		Participants: []streaming.ParticipantConfig{
			{
				AgentID:   "agent-1",
				AgentType: "claude",
				AgentName: "Product Manager",
				Model:     "claude-sonnet-4",
			},
		},
		Metadata: map[string]interface{}{
			"cliVersion": "1.5.0",
			"user":       os.Getenv("USER"),
		},
	})
	if err != nil {
		log.Fatalf("Failed to start conversation: %v", err)
	}

	fmt.Printf("Conversation started: %s\n", conversationID)

	// Send messages as they're created
	err = client.MessageCreated(conversationID, streaming.MessageData{
		AgentID:   "agent-1",
		AgentName: "Product Manager",
		AgentType: "claude",
		Content:   "Let's focus on AI-powered tools...",
		Role:      "agent",
		Metrics: &streaming.ResponseMetrics{
			Duration:    2340,
			TotalTokens: 235,
			Cost:        0.00047,
		},
	})
	if err != nil {
		log.Printf("Failed to send message: %v", err)
	}

	// Complete conversation
	err = client.ConversationCompleted(streaming.ConversationCompletedData{
		ConversationID: conversationID,
		TotalMessages:  20,
		TotalTokens:    4500,
		TotalCost:      0.0089,
		TotalDuration:  45000,
	})
	if err != nil {
		log.Printf("Failed to complete conversation: %v", err)
	}
}
```

---

## 6. Security Architecture

### 6.1 Authentication & Authorization

**API Key Management**:

1. **Environment Variable** (Recommended for CLI):
   ```bash
   export AGENTPIPE_API_KEY="ap_live_abc123..."
   ```

2. **Key Format**:
   - Prefix: `ap_live_` (production) or `ap_test_` (development)
   - Random: 32-character alphanumeric string
   - Example: `ap_live_k9j8h7g6f5d4s3a2w1q0p9o8i7u6y5t4`

3. **Key Storage** (Web):
   ```env
   # .env.local
   AGENTPIPE_BRIDGE_API_KEY=ap_live_k9j8h7g6f5d4s3a2w1q0p9o8i7u6y5t4
   ```

4. **Optional: Per-User API Keys** (Future Enhancement):
   ```prisma
   model ApiKey {
     id          String   @id @default(cuid())
     createdAt   DateTime @default(now())
     updatedAt   DateTime @updatedAt

     key         String   @unique  // Hashed
     name        String              // User-friendly name
     userId      String?             // Optional user association

     // Permissions
     canIngest   Boolean  @default(true)
     canUpload   Boolean  @default(true)
     canRead     Boolean  @default(false)

     // Usage tracking
     lastUsedAt  DateTime?
     usageCount  Int      @default(0)

     // Expiration
     expiresAt   DateTime?
     revoked     Boolean  @default(false)

     @@index([userId])
     @@index([key])
   }
   ```

### 6.2 Request Validation

```typescript
// app/lib/auth.ts

import { NextRequest } from 'next/server';
import crypto from 'crypto';

export class AuthError extends Error {
  constructor(message: string, public statusCode: number = 401) {
    super(message);
    this.name = 'AuthError';
  }
}

/**
 * Validate API key from request headers
 */
export function validateApiKey(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization');
  if (!authHeader) {
    throw new AuthError('Missing Authorization header', 401);
  }

  const match = authHeader.match(/^Bearer (.+)$/);
  if (!match) {
    throw new AuthError('Invalid Authorization format. Expected: Bearer <token>', 401);
  }

  const providedKey = match[1];
  const expectedKey = process.env.AGENTPIPE_BRIDGE_API_KEY;

  if (!expectedKey) {
    throw new AuthError('API key not configured on server', 500);
  }

  // Constant-time comparison to prevent timing attacks
  const providedHash = crypto.createHash('sha256').update(providedKey).digest('hex');
  const expectedHash = crypto.createHash('sha256').update(expectedKey).digest('hex');

  if (providedHash !== expectedHash) {
    throw new AuthError('Invalid API key', 401);
  }

  return providedKey;
}

/**
 * Validate request origin (CORS)
 */
export function validateOrigin(request: NextRequest): void {
  const allowedOrigins = (process.env.ALLOWED_ORIGINS || '').split(',');
  const origin = request.headers.get('origin');

  if (origin && allowedOrigins.length > 0 && !allowedOrigins.includes(origin)) {
    throw new AuthError('Origin not allowed', 403);
  }
}

/**
 * Rate limiting helper (simple in-memory implementation)
 * For production, use Redis or a dedicated rate limiting service
 */
class RateLimiter {
  private requests: Map<string, number[]> = new Map();
  private windowMs: number;
  private maxRequests: number;

  constructor(windowMs: number = 60000, maxRequests: number = 100) {
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;
  }

  check(identifier: string): boolean {
    const now = Date.now();
    const windowStart = now - this.windowMs;

    // Get or initialize request timestamps
    const timestamps = this.requests.get(identifier) || [];

    // Filter out old requests
    const recentRequests = timestamps.filter(ts => ts > windowStart);

    if (recentRequests.length >= this.maxRequests) {
      return false; // Rate limit exceeded
    }

    // Add current request
    recentRequests.push(now);
    this.requests.set(identifier, recentRequests);

    return true;
  }

  reset(identifier: string): void {
    this.requests.delete(identifier);
  }
}

export const rateLimiter = new RateLimiter(60000, 100); // 100 requests per minute
```

### 6.3 Rate Limiting

**Recommended Limits**:

- **Ingestion API**: 100 requests/minute per API key
- **Upload API**: 10 requests/minute per API key (larger payloads)
- **SSE Stream**: 50 concurrent connections per IP
- **Session Retrieval**: 1000 requests/hour per API key

**Implementation** (with Redis for production):

```typescript
// app/lib/rateLimit.ts

import { Redis } from '@upstash/redis'; // Or ioredis

const redis = new Redis({
  url: process.env.REDIS_URL,
  token: process.env.REDIS_TOKEN,
});

export async function checkRateLimit(
  identifier: string,
  limit: number,
  windowSeconds: number
): Promise<{ allowed: boolean; remaining: number; resetAt: number }> {
  const key = `ratelimit:${identifier}`;
  const now = Date.now();
  const windowStart = now - windowSeconds * 1000;

  // Remove old entries and count recent requests
  const multi = redis.multi();
  multi.zremrangebyscore(key, '-inf', windowStart);
  multi.zadd(key, { score: now, member: now.toString() });
  multi.zcard(key);
  multi.expire(key, windowSeconds);

  const results = await multi.exec();
  const count = results[2] as number;

  const allowed = count <= limit;
  const remaining = Math.max(0, limit - count);
  const resetAt = now + windowSeconds * 1000;

  return { allowed, remaining, resetAt };
}
```

### 6.4 Input Validation & Sanitization

```typescript
// app/lib/validation.ts

import { z } from 'zod';
import DOMPurify from 'isomorphic-dompurify';

/**
 * Sanitize user-provided content to prevent XSS
 */
export function sanitizeContent(content: string): string {
  return DOMPurify.sanitize(content, {
    ALLOWED_TAGS: [], // Strip all HTML tags
    ALLOWED_ATTR: [],
  });
}

/**
 * Validate and sanitize event payload
 */
export function validateEvent<T extends z.ZodTypeAny>(
  schema: T,
  data: unknown
): z.infer<T> {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.errors[0];
      throw new Error(
        `Validation failed: ${firstError.path.join('.')} - ${firstError.message}`
      );
    }
    throw error;
  }
}

/**
 * Validate conversation ID format
 */
export function validateConversationId(id: string): boolean {
  // CUID format: c[a-z0-9]{24}
  return /^c[a-z0-9]{24}$/.test(id);
}

/**
 * Sanitize metadata object
 */
export function sanitizeMetadata(metadata: Record<string, any>): Record<string, any> {
  const sanitized: Record<string, any> = {};

  for (const [key, value] of Object.entries(metadata)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitizeContent(value);
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeMetadata(value);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
}
```

### 6.5 Security Best Practices

1. **HTTPS Only**: All communication must use HTTPS in production
2. **API Key Rotation**: Support key rotation without downtime
3. **Audit Logging**: Log all ingestion attempts (success/failure)
4. **Content Size Limits**:
   - Message content: 100KB max
   - Total event payload: 1MB max
   - Historical upload: 50MB max
5. **SQL Injection Protection**: Prisma ORM provides automatic protection
6. **CORS Configuration**: Restrict origins in production
7. **Error Messages**: Don't leak sensitive information in error responses

---

## 7. Performance Optimization

### 7.1 Database Optimization

**Indexing Strategy** (already in schema):
```prisma
// Key indexes for performance
@@index([conversationId, timestamp])  // Message retrieval
@@index([conversationId, sequenceNumber])  // Ordered messages
@@index([status])  // Filter active conversations
@@index([createdAt])  // List recent sessions
@@index([source])  // Filter by source (cli/web)
```

**Query Optimization**:

```typescript
// Efficient message retrieval with cursor-based pagination
async function getMessages(conversationId: string, cursor?: string, limit = 50) {
  return prisma.message.findMany({
    where: { conversationId },
    take: limit,
    skip: cursor ? 1 : 0,
    cursor: cursor ? { id: cursor } : undefined,
    orderBy: { timestamp: 'asc' },
  });
}

// Efficient conversation list with aggregates
async function listConversations(page = 1, limit = 20) {
  const [conversations, total] = await Promise.all([
    prisma.conversation.findMany({
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { messages: true, participants: true },
        },
      },
    }),
    prisma.conversation.count(),
  ]);

  return { conversations, total };
}
```

### 7.2 Message Batching (CLI Side)

```go
// cli/pkg/streaming/batcher.go

package streaming

import (
	"sync"
	"time"
)

// Batcher batches events before sending
type Batcher struct {
	client      *Client
	batchSize   int
	batchTime   time.Duration
	events      []Event
	mu          sync.Mutex
	timer       *time.Timer
	stopCh      chan struct{}
}

// NewBatcher creates a batching client
func NewBatcher(client *Client, batchSize int, batchTime time.Duration) *Batcher {
	b := &Batcher{
		client:    client,
		batchSize: batchSize,
		batchTime: batchTime,
		events:    make([]Event, 0, batchSize),
		stopCh:    make(chan struct{}),
	}

	go b.run()
	return b
}

// Add adds an event to the batch
func (b *Batcher) Add(event Event) {
	b.mu.Lock()
	defer b.mu.Unlock()

	b.events = append(b.events, event)

	// Flush if batch is full
	if len(b.events) >= b.batchSize {
		b.flush()
	} else if b.timer == nil {
		// Start timer for batch timeout
		b.timer = time.AfterFunc(b.batchTime, func() {
			b.mu.Lock()
			defer b.mu.Unlock()
			b.flush()
		})
	}
}

// flush sends all batched events
func (b *Batcher) flush() {
	if len(b.events) == 0 {
		return
	}

	// Send events
	for _, event := range b.events {
		go b.client.SendEvent(event) // Send async
	}

	// Clear batch
	b.events = b.events[:0]

	// Reset timer
	if b.timer != nil {
		b.timer.Stop()
		b.timer = nil
	}
}

// Close flushes and stops the batcher
func (b *Batcher) Close() {
	b.mu.Lock()
	defer b.mu.Unlock()

	b.flush()
	close(b.stopCh)
}

func (b *Batcher) run() {
	ticker := time.NewTicker(b.batchTime)
	defer ticker.Stop()

	for {
		select {
		case <-ticker.C:
			b.mu.Lock()
			b.flush()
			b.mu.Unlock()
		case <-b.stopCh:
			return
		}
	}
}
```

### 7.3 SSE Connection Management

```typescript
// app/lib/sseManager.ts

class SSEConnectionManager {
  private connections: Map<string, Set<ReadableStreamDefaultController>> = new Map();
  private maxConnectionsPerConversation = 100;
  private maxTotalConnections = 1000;

  addConnection(conversationId: string | null, controller: ReadableStreamDefaultController): boolean {
    // Check global limit
    const totalConnections = Array.from(this.connections.values())
      .reduce((sum, set) => sum + set.size, 0);

    if (totalConnections >= this.maxTotalConnections) {
      return false;
    }

    // Check per-conversation limit
    const key = conversationId || 'global';
    const connections = this.connections.get(key) || new Set();

    if (connections.size >= this.maxConnectionsPerConversation) {
      return false;
    }

    connections.add(controller);
    this.connections.set(key, connections);
    return true;
  }

  removeConnection(conversationId: string | null, controller: ReadableStreamDefaultController) {
    const key = conversationId || 'global';
    const connections = this.connections.get(key);

    if (connections) {
      connections.delete(controller);
      if (connections.size === 0) {
        this.connections.delete(key);
      }
    }
  }

  getStats() {
    return {
      totalConnections: Array.from(this.connections.values())
        .reduce((sum, set) => sum + set.size, 0),
      conversationCount: this.connections.size,
    };
  }
}

export const sseManager = new SSEConnectionManager();
```

### 7.4 Caching Strategy

```typescript
// Cache conversation metadata (Redis/Upstash)
async function getCachedConversation(id: string) {
  const cached = await redis.get(`conversation:${id}`);
  if (cached) {
    return JSON.parse(cached);
  }

  const conversation = await prisma.conversation.findUnique({
    where: { id },
    include: { participants: true },
  });

  if (conversation) {
    await redis.setex(`conversation:${id}`, 3600, JSON.stringify(conversation));
  }

  return conversation;
}

// Invalidate cache on updates
async function updateConversation(id: string, data: any) {
  await prisma.conversation.update({ where: { id }, data });
  await redis.del(`conversation:${id}`);
}
```

---

## 8. Implementation Plan

### Phase 1: Core Infrastructure (Week 1)

**Priority**: Critical

1. **Database Migration** (if adding optional fields)
   ```bash
   cd agentpipe-web
   npx prisma migrate dev --name add_streaming_enhancements
   ```

2. **Update Type Definitions** (`app/types/index.ts`)
   - Add sequenceNumber to Message interface
   - Add source/sourceVersion to Conversation interface
   - Add all event payload interfaces

3. **Create Validation Schemas** (`app/lib/validation.ts`)
   - Implement Zod schemas for all events
   - Add sanitization utilities

4. **Enhance Authentication** (`app/lib/auth.ts`)
   - Implement validateApiKey()
   - Add rate limiting (in-memory or Redis)

### Phase 2: Web API Implementation (Week 1-2)

**Priority**: Critical

1. **Enhance Ingestion Endpoint** (`app/api/ingest/route.ts`)
   - Add Zod validation
   - Add rate limiting
   - Handle sequenceNumber in messages
   - Better error responses

2. **Create Upload Endpoint** (`app/api/sessions/upload/route.ts`)
   - Implement bulk upload with transaction
   - Validate participant references
   - Calculate aggregates
   - Handle idempotency

3. **Enhance SSE Endpoint** (`app/api/realtime/stream/route.ts`)
   - Add connection limits
   - Improve error handling
   - Add typed event names

4. **Update Session Endpoints** (`app/api/sessions/route.ts`, `app/api/sessions/[id]/route.ts`)
   - Add source filtering
   - Add pagination
   - Optimize queries

### Phase 3: CLI Integration (Week 2-3)

**Priority**: Critical

1. **Create Streaming Package** (`cli/pkg/streaming/`)
   - Implement HTTP client (client.go)
   - Implement batcher (batcher.go)
   - Add configuration (config.go)

2. **Integrate with Orchestrator**
   - Hook conversation start
   - Hook message creation
   - Hook conversation completion/interruption
   - Hook error events

3. **Add CLI Commands**
   ```bash
   agentpipe stream enable/disable
   agentpipe stream status
   agentpipe upload <session-file>
   ```

4. **Configuration Management**
   - Add streaming config to `~/.agentpipe/config.yaml`
   - Support environment variables
   - Validate configuration

### Phase 4: Testing & Documentation (Week 3-4)

**Priority**: High

1. **Unit Tests**
   - Test validation schemas
   - Test authentication
   - Test event handlers

2. **Integration Tests**
   - Test end-to-end streaming flow
   - Test historical upload
   - Test error scenarios

3. **Load Testing**
   - Test concurrent SSE connections
   - Test high-frequency message ingestion
   - Test database performance

4. **Documentation**
   - API documentation
   - CLI usage guide
   - Deployment guide
   - Troubleshooting guide

### Phase 5: Advanced Features (Week 4+)

**Priority**: Medium

1. **Advanced Security**
   - Per-user API keys
   - API key dashboard
   - Audit logging

2. **Advanced Performance**
   - Redis caching
   - Message compression
   - Database sharding (if needed)

3. **Monitoring & Observability**
   - Prometheus metrics
   - Grafana dashboards
   - Alert rules

4. **Enhanced Features**
   - Resume interrupted streams
   - Replay historical events
   - Export sessions to various formats

---

## 9. Testing Strategy

### 9.1 Unit Tests (Web)

```typescript
// app/api/ingest/__tests__/route.test.ts

import { POST } from '../route';
import { prisma } from '@/app/lib/prisma';

describe('POST /api/ingest', () => {
  beforeEach(async () => {
    await prisma.conversation.deleteMany();
    await prisma.message.deleteMany();
  });

  it('should create conversation on conversation.started event', async () => {
    const request = new Request('http://localhost/api/ingest', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.AGENTPIPE_BRIDGE_API_KEY}`,
      },
      body: JSON.stringify({
        type: 'conversation.started',
        timestamp: new Date().toISOString(),
        data: {
          name: 'Test Conversation',
          mode: 'round-robin',
          initialPrompt: 'Test prompt',
          participants: [
            {
              agentId: 'agent-1',
              agentType: 'claude',
              agentName: 'Test Agent',
            },
          ],
        },
      }),
    });

    const response = await POST(request as any);
    expect(response.status).toBe(201);

    const data = await response.json();
    expect(data.conversationId).toBeDefined();

    // Verify database
    const conversation = await prisma.conversation.findUnique({
      where: { id: data.conversationId },
      include: { participants: true },
    });

    expect(conversation).toBeDefined();
    expect(conversation?.participants).toHaveLength(1);
  });

  it('should reject invalid API key', async () => {
    const request = new Request('http://localhost/api/ingest', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer invalid-key',
      },
      body: JSON.stringify({
        type: 'conversation.started',
        data: {},
      }),
    });

    const response = await POST(request as any);
    expect(response.status).toBe(401);
  });

  it('should validate event schema', async () => {
    const request = new Request('http://localhost/api/ingest', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.AGENTPIPE_BRIDGE_API_KEY}`,
      },
      body: JSON.stringify({
        type: 'conversation.started',
        data: {
          // Missing required fields
        },
      }),
    });

    const response = await POST(request as any);
    expect(response.status).toBe(400);
  });
});
```

### 9.2 Integration Tests (CLI)

```go
// cli/pkg/streaming/client_test.go

package streaming_test

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/yourusername/agentpipe/pkg/streaming"
)

func TestClient_ConversationStarted(t *testing.T) {
	// Mock server
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Verify request
		if r.Method != "POST" {
			t.Errorf("Expected POST, got %s", r.Method)
		}

		if r.Header.Get("Authorization") != "Bearer test-key" {
			t.Errorf("Invalid authorization header")
		}

		// Return success
		w.WriteHeader(http.StatusCreated)
		w.Write([]byte(`{"conversationId": "test-123"}`))
	}))
	defer server.Close()

	// Create client
	client := streaming.NewClient(streaming.Config{
		BaseURL: server.URL,
		APIKey:  "test-key",
	})

	// Send event
	_, err := client.ConversationStarted(streaming.ConversationStartedData{
		Mode:          "round-robin",
		InitialPrompt: "Test",
		Participants: []streaming.ParticipantConfig{
			{
				AgentID:   "agent-1",
				AgentType: "claude",
				AgentName: "Test",
			},
		},
	})

	if err != nil {
		t.Fatalf("Failed to send event: %v", err)
	}
}

func TestClient_Retry(t *testing.T) {
	attempts := 0

	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		attempts++
		if attempts < 3 {
			w.WriteHeader(http.StatusServiceUnavailable)
			return
		}
		w.WriteHeader(http.StatusCreated)
	}))
	defer server.Close()

	client := streaming.NewClient(streaming.Config{
		BaseURL:    server.URL,
		APIKey:     "test-key",
		RetryCount: 3,
	})

	err := client.MessageCreated("test-conv", streaming.MessageData{
		AgentID:   "agent-1",
		AgentName: "Test",
		AgentType: "claude",
		Content:   "Test message",
		Role:      "agent",
	})

	if err != nil {
		t.Fatalf("Expected success after retries, got error: %v", err)
	}

	if attempts != 3 {
		t.Errorf("Expected 3 attempts, got %d", attempts)
	}
}
```

### 9.3 Load Testing

```javascript
// k6 load test script

import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '1m', target: 50 },  // Ramp up to 50 concurrent users
    { duration: '3m', target: 50 },  // Stay at 50 users
    { duration: '1m', target: 0 },   // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests should be below 500ms
    http_req_failed: ['rate<0.01'],   // Less than 1% failures
  },
};

const API_KEY = __ENV.AGENTPIPE_API_KEY;
const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

export default function () {
  // 1. Start conversation
  const conversationRes = http.post(
    `${BASE_URL}/api/ingest`,
    JSON.stringify({
      type: 'conversation.started',
      timestamp: new Date().toISOString(),
      data: {
        name: 'Load Test',
        mode: 'round-robin',
        initialPrompt: 'Test',
        participants: [
          {
            agentId: 'agent-1',
            agentType: 'claude',
            agentName: 'Test',
          },
        ],
      },
    }),
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${API_KEY}`,
      },
    }
  );

  check(conversationRes, {
    'conversation created': (r) => r.status === 201,
  });

  const conversationId = conversationRes.json('conversationId');

  // 2. Send messages
  for (let i = 0; i < 10; i++) {
    const messageRes = http.post(
      `${BASE_URL}/api/ingest`,
      JSON.stringify({
        type: 'message.created',
        timestamp: new Date().toISOString(),
        data: {
          conversationId,
          message: {
            agentId: 'agent-1',
            agentName: 'Test',
            agentType: 'claude',
            content: `Message ${i}`,
            role: 'agent',
            timestamp: new Date().toISOString(),
          },
        },
      }),
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${API_KEY}`,
        },
      }
    );

    check(messageRes, {
      'message created': (r) => r.status === 201,
    });

    sleep(0.1); // 100ms between messages
  }

  // 3. Complete conversation
  const completeRes = http.post(
    `${BASE_URL}/api/ingest`,
    JSON.stringify({
      type: 'conversation.completed',
      timestamp: new Date().toISOString(),
      data: {
        conversationId,
        totalMessages: 10,
        totalTokens: 1000,
        totalCost: 0.01,
        totalDuration: 5000,
      },
    }),
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${API_KEY}`,
      },
    }
  );

  check(completeRes, {
    'conversation completed': (r) => r.status === 200,
  });
}
```

**Run load test**:
```bash
k6 run --env API_KEY=$AGENTPIPE_API_KEY --env BASE_URL=https://agentpipe-web.com load-test.js
```

---

## 10. Deployment Guide

### 10.1 Environment Variables

```env
# .env.production

# Database
DATABASE_URL="postgresql://user:password@host:5432/agentpipe_prod?schema=public"

# API Authentication
AGENTPIPE_BRIDGE_API_KEY="ap_live_k9j8h7g6f5d4s3a2w1q0p9o8i7u6y5t4"

# Optional: Redis for rate limiting and caching
REDIS_URL="redis://default:password@host:6379"
REDIS_TOKEN="your-upstash-token"  # If using Upstash

# CORS (comma-separated origins)
ALLOWED_ORIGINS="https://agentpipe.com,https://app.agentpipe.com"

# Rate Limiting
RATE_LIMIT_WINDOW_SECONDS=60
RATE_LIMIT_MAX_REQUESTS=100

# SSE Configuration
SSE_MAX_CONNECTIONS=1000
SSE_HEARTBEAT_INTERVAL=30000  # milliseconds

# Monitoring (optional)
SENTRY_DSN="https://..."
```

### 10.2 Vercel Deployment

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod

# Set environment variables
vercel env add DATABASE_URL production
vercel env add AGENTPIPE_BRIDGE_API_KEY production
```

### 10.3 Docker Deployment

```dockerfile
# Dockerfile

FROM node:20-alpine AS base

# Dependencies
FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# Builder
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build Next.js
RUN npm run build

# Runner
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000

CMD ["node", "server.js"]
```

```yaml
# docker-compose.yml

version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: agentpipe
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: agentpipe_prod
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

  web:
    build: .
    ports:
      - "3000:3000"
    environment:
      DATABASE_URL: "postgresql://agentpipe:${DB_PASSWORD}@postgres:5432/agentpipe_prod"
      REDIS_URL: "redis://redis:6379"
      AGENTPIPE_BRIDGE_API_KEY: ${AGENTPIPE_API_KEY}
    depends_on:
      - postgres
      - redis

volumes:
  postgres_data:
  redis_data:
```

---

## 11. Monitoring & Observability

### 11.1 Metrics to Track

**Application Metrics**:
- Ingestion rate (events/second)
- SSE connection count
- Message processing latency
- Database query duration
- API error rate
- Rate limit hits

**Business Metrics**:
- Active conversations
- Total messages processed
- Average conversation duration
- Top agent types

### 11.2 Prometheus Metrics (Optional)

```typescript
// app/lib/metrics.ts

import { Counter, Histogram, Gauge } from 'prom-client';

export const metrics = {
  ingestEvents: new Counter({
    name: 'agentpipe_ingest_events_total',
    help: 'Total number of ingested events',
    labelNames: ['type', 'status'],
  }),

  ingestDuration: new Histogram({
    name: 'agentpipe_ingest_duration_seconds',
    help: 'Event ingestion duration',
    labelNames: ['type'],
    buckets: [0.001, 0.01, 0.05, 0.1, 0.5, 1],
  }),

  sseConnections: new Gauge({
    name: 'agentpipe_sse_connections',
    help: 'Number of active SSE connections',
  }),

  activeConversations: new Gauge({
    name: 'agentpipe_active_conversations',
    help: 'Number of active conversations',
  }),
};

// Expose metrics endpoint
// app/api/metrics/route.ts
import { register } from 'prom-client';

export async function GET() {
  return new Response(await register.metrics(), {
    headers: { 'Content-Type': register.contentType },
  });
}
```

### 11.3 Health Check Endpoint

```typescript
// app/api/health/route.ts

import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';

export async function GET() {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    checks: {
      database: 'unknown',
      redis: 'unknown',
      sse: 'unknown',
    },
  };

  try {
    // Check database
    await prisma.$queryRaw`SELECT 1`;
    health.checks.database = 'healthy';
  } catch (error) {
    health.checks.database = 'unhealthy';
    health.status = 'degraded';
  }

  // Check Redis (if configured)
  if (process.env.REDIS_URL) {
    try {
      // Ping Redis
      health.checks.redis = 'healthy';
    } catch (error) {
      health.checks.redis = 'unhealthy';
      health.status = 'degraded';
    }
  }

  // Check SSE manager
  health.checks.sse = 'healthy';

  return NextResponse.json(health, {
    status: health.status === 'healthy' ? 200 : 503,
  });
}
```

---

## 12. Troubleshooting Guide

### Common Issues

**Issue**: Events not appearing in web UI

**Solution**:
1. Check API key configuration
2. Verify network connectivity
3. Check browser console for SSE errors
4. Verify conversation ID matches

**Issue**: Rate limit errors

**Solution**:
1. Reduce message frequency
2. Implement batching
3. Request higher rate limits

**Issue**: SSE connection drops

**Solution**:
1. Implement auto-reconnection in client
2. Check network stability
3. Increase timeout settings

**Issue**: Database slow queries

**Solution**:
1. Check index usage with `EXPLAIN ANALYZE`
2. Add missing indexes
3. Implement caching
4. Consider read replicas

---

## 13. Summary

This architecture provides:

1. **Scalable Real-time Streaming**: SSE-based approach that scales to thousands of concurrent connections
2. **Robust Data Persistence**: Existing Prisma schema with minimal changes
3. **Secure Communication**: API key authentication with rate limiting
4. **Flexible Integration**: Clean API contracts for CLI integration
5. **Performance Optimized**: Batching, caching, and efficient database queries
6. **Production Ready**: Complete testing, monitoring, and deployment strategy

**Next Steps**:
1. Review and approve architecture
2. Begin Phase 1 implementation (database + types)
3. Implement Web APIs (Phase 2)
4. Integrate with CLI (Phase 3)
5. Test and deploy (Phase 4)

---

**Document Version**: 1.0
**Last Updated**: 2025-10-20
**Authors**: Claude (AI Assistant)
**Status**: Proposed Architecture
