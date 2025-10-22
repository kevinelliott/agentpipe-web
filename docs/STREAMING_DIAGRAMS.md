# AgentPipe Streaming - Visual Diagrams

This document contains detailed visual diagrams of the streaming architecture.

## Table of Contents

1. [System Architecture](#1-system-architecture)
2. [Real-time Event Flow](#2-real-time-event-flow)
3. [Historical Upload Flow](#3-historical-upload-flow)
4. [Database Schema](#4-database-schema)
5. [Security Flow](#5-security-flow)
6. [SSE Connection Lifecycle](#6-sse-connection-lifecycle)
7. [Error Handling Flow](#7-error-handling-flow)
8. [Deployment Architecture](#8-deployment-architecture)

---

## 1. System Architecture

### High-Level Component View

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                          │
│                         AGENTPIPE CLI (Go)                               │
│                                                                          │
│  ┌────────────────┐      ┌──────────────┐      ┌──────────────────┐   │
│  │  Orchestrator  │─────▶│ Event Emit   │─────▶│ Streaming Client │   │
│  │                │      │              │      │  (HTTP POST)     │   │
│  └────────────────┘      └──────────────┘      └────────┬─────────┘   │
│                                                           │              │
└───────────────────────────────────────────────────────────┼──────────────┘
                                                            │
                                                            │ HTTPS
                                                            │ Authorization: Bearer <api-key>
                                                            │
┌───────────────────────────────────────────────────────────▼──────────────┐
│                                                                          │
│                    AGENTPIPE WEB (Next.js 15)                            │
│                                                                          │
│  ┌────────────────────────────────────────────────────────────────────┐ │
│  │                        API LAYER                                   │ │
│  │                                                                    │ │
│  │  ┌─────────────────┐  ┌──────────────────┐  ┌─────────────────┐  │ │
│  │  │ POST /ingest    │  │ POST /upload     │  │ GET /stream     │  │ │
│  │  │ (Real-time)     │  │ (Historical)     │  │ (SSE)           │  │ │
│  │  └────────┬────────┘  └────────┬─────────┘  └────────▲────────┘  │ │
│  │           │                    │                     │            │ │
│  └───────────┼────────────────────┼─────────────────────┼────────────┘ │
│              │                    │                     │              │
│              ▼                    ▼                     │              │
│  ┌────────────────────────────────────────────┐        │              │
│  │         Authentication Middleware          │        │              │
│  │  - Validate API Key                        │        │              │
│  │  - Rate Limiting                           │        │              │
│  │  - Request Validation (Zod)                │        │              │
│  └────────────────┬───────────────────────────┘        │              │
│                   │                                     │              │
│                   ▼                                     │              │
│  ┌────────────────────────────────────────────┐        │              │
│  │           Business Logic Layer             │        │              │
│  │  - Event Handlers                          │        │              │
│  │  - Session Upload                          │        │              │
│  │  - Data Transformation                     │        │              │
│  └────────────────┬───────────────────────────┘        │              │
│                   │                                     │              │
│                   ▼                                     │              │
│  ┌─────────────────────────────┐  ┌────────────────────┼──────────┐   │
│  │     Database Layer          │  │   Event Manager    │          │   │
│  │     (Prisma ORM)            │  │   (In-Memory)      │          │   │
│  │                             │  │                    │          │   │
│  │  - Conversations            │  │  - Global Listeners│          │   │
│  │  - Messages                 │  │  - Conversation    │          │   │
│  │  - ConversationAgents       │  │    Listeners       │          │   │
│  │  - Events                   │  │  - SSE Broadcast   │──────────┘   │
│  └─────────────┬───────────────┘  └────────────────────┘              │
│                │                                                       │
│                ▼                                                       │
│  ┌─────────────────────────────┐                                      │
│  │     PostgreSQL Database     │                                      │
│  │  - Persistent Storage       │                                      │
│  │  - Indexed Queries          │                                      │
│  │  - ACID Transactions        │                                      │
│  └─────────────────────────────┘                                      │
│                                                                        │
└────────────────────────────────────────┬───────────────────────────────┘
                                         │
                                         │ Server-Sent Events
                                         │ (text/event-stream)
                                         │
┌────────────────────────────────────────▼───────────────────────────────┐
│                                                                         │
│                      WEB BROWSER (React)                                │
│                                                                         │
│  ┌────────────────┐      ┌──────────────┐      ┌──────────────────┐  │
│  │ EventSource    │─────▶│ React Hook   │─────▶│ UI Components    │  │
│  │ API            │      │ (useRealtime)│      │ (Live Updates)   │  │
│  └────────────────┘      └──────────────┘      └──────────────────┘  │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Real-time Event Flow

### Sequence Diagram: conversation.started → message.created → conversation.completed

```
CLI                API Gateway        Ingest Handler      Database        EventManager       SSE Clients
 │                      │                   │                │                 │                  │
 │ 1. Start Conv        │                   │                │                 │                  │
 ├─────────────────────▶│                   │                │                 │                  │
 │ POST /api/ingest     │                   │                │                 │                  │
 │ {type: "conversation.started", ...}      │                │                 │                  │
 │                      │                   │                │                 │                  │
 │                      │ 2. Auth & Validate│                │                 │                  │
 │                      ├──────────────────▶│                │                 │                  │
 │                      │                   │                │                 │                  │
 │                      │                   │ 3. Create Conv │                 │                  │
 │                      │                   ├───────────────▶│                 │                  │
 │                      │                   │                │                 │                  │
 │                      │                   │ 4. Conv Created│                 │                  │
 │                      │                   │◀───────────────┤                 │                  │
 │                      │                   │                │                 │                  │
 │                      │                   │ 5. Emit Event  │                 │                  │
 │                      │                   ├────────────────────────────────▶│                  │
 │                      │                   │                │                 │                  │
 │                      │                   │                │                 │ 6. Broadcast     │
 │                      │                   │                │                 ├─────────────────▶│
 │                      │                   │                │                 │ SSE: conv.started│
 │                      │                   │                │                 │                  │
 │ 7. Response          │                   │                │                 │                  │
 │◀─────────────────────┤                   │                │                 │                  │
 │ {conversationId}     │                   │                │                 │                  │
 │                      │                   │                │                 │                  │
 │                      │                   │                │                 │                  │
 │ 8. Send Message      │                   │                │                 │                  │
 ├─────────────────────▶│                   │                │                 │                  │
 │ POST /api/ingest     │                   │                │                 │                  │
 │ {type: "message.created", ...}           │                │                 │                  │
 │                      │                   │                │                 │                  │
 │                      │ 9. Auth & Validate│                │                 │                  │
 │                      ├──────────────────▶│                │                 │                  │
 │                      │                   │                │                 │                  │
 │                      │                   │ 10. Insert Msg │                 │                  │
 │                      │                   ├───────────────▶│                 │                  │
 │                      │                   │                │                 │                  │
 │                      │                   │ 11. Update Agg │                 │                  │
 │                      │                   ├───────────────▶│                 │                  │
 │                      │                   │                │                 │                  │
 │                      │                   │ 12. Emit Event │                 │                  │
 │                      │                   ├────────────────────────────────▶│                  │
 │                      │                   │                │                 │                  │
 │                      │                   │                │                 │ 13. Broadcast    │
 │                      │                   │                │                 ├─────────────────▶│
 │                      │                   │                │                 │ SSE: msg.created │
 │                      │                   │                │                 │                  │
 │ 14. Response         │                   │                │                 │                  │
 │◀─────────────────────┤                   │                │                 │                  │
 │ {messageId}          │                   │                │                 │                  │
 │                      │                   │                │                 │                  │
 │ ...repeat steps 8-14 for each message... │                │                 │                  │
 │                      │                   │                │                 │                  │
 │ 15. Complete Conv    │                   │                │                 │                  │
 ├─────────────────────▶│                   │                │                 │                  │
 │ POST /api/ingest     │                   │                │                 │                  │
 │ {type: "conversation.completed", ...}    │                │                 │                  │
 │                      │                   │                │                 │                  │
 │                      │ 16. Auth & Validate│               │                 │                  │
 │                      ├──────────────────▶│                │                 │                  │
 │                      │                   │                │                 │                  │
 │                      │                   │ 17. Update Conv│                │                  │
 │                      │                   ├───────────────▶│                 │                  │
 │                      │                   │ status=COMPLETED│               │                  │
 │                      │                   │                │                 │                  │
 │                      │                   │ 18. Emit Event │                 │                  │
 │                      │                   ├────────────────────────────────▶│                  │
 │                      │                   │                │                 │                  │
 │                      │                   │                │                 │ 19. Broadcast    │
 │                      │                   │                │                 ├─────────────────▶│
 │                      │                   │                │                 │ SSE: conv.done   │
 │                      │                   │                │                 │                  │
 │ 20. Response         │                   │                │                 │                  │
 │◀─────────────────────┤                   │                │                 │                  │
 │ {success: true}      │                   │                │                 │                  │
 │                      │                   │                │                 │                  │
```

---

## 3. Historical Upload Flow

### Sequence Diagram: Bulk Session Upload

```
CLI                API Gateway      Upload Handler      Database (Transaction)
 │                      │                   │                    │
 │ 1. Upload Session    │                   │                    │
 ├─────────────────────▶│                   │                    │
 │ POST /api/sessions/upload                │                    │
 │ {session, participants, messages[]}      │                    │
 │                      │                   │                    │
 │                      │ 2. Auth & Validate│                    │
 │                      ├──────────────────▶│                    │
 │                      │                   │                    │
 │                      │                   │ 3. Validate Schema │
 │                      │                   │ (Zod)              │
 │                      │                   │                    │
 │                      │                   │ 4. Check Duplicate │
 │                      │                   ├───────────────────▶│
 │                      │                   │ WHERE metadata->>  │
 │                      │                   │   'originalId' = ? │
 │                      │                   │                    │
 │                      │                   │ 5. Not Found       │
 │                      │                   │◀───────────────────┤
 │                      │                   │                    │
 │                      │                   │ 6. BEGIN TRANSACTION
 │                      │                   ├───────────────────▶│
 │                      │                   │                    │
 │                      │                   │ 7. INSERT Conv     │
 │                      │                   ├───────────────────▶│
 │                      │                   │                    │
 │                      │                   │ 8. INSERT Parts    │
 │                      │                   ├───────────────────▶│
 │                      │                   │ (createMany)       │
 │                      │                   │                    │
 │                      │                   │ 9. INSERT Messages │
 │                      │                   ├───────────────────▶│
 │                      │                   │ (batch 1000)       │
 │                      │                   │                    │
 │                      │                   │ 10. COMMIT         │
 │                      │                   ├───────────────────▶│
 │                      │                   │                    │
 │                      │                   │ 11. Success        │
 │                      │                   │◀───────────────────┤
 │                      │                   │                    │
 │ 12. Response         │                   │                    │
 │◀─────────────────────┤                   │                    │
 │ {conversationId,     │                   │                    │
 │  messagesCreated,    │                   │                    │
 │  participantsCreated}│                   │                    │
 │                      │                   │                    │
```

### Error Handling in Upload

```
                         Upload Handler              Database
                               │                         │
                               │ 1. BEGIN TRANSACTION    │
                               ├────────────────────────▶│
                               │                         │
                               │ 2. INSERT Conversation  │
                               ├────────────────────────▶│
                               │                         │
                               │ 3. INSERT Participants  │
                               ├────────────────────────▶│
                               │                         │
                               │ 4. INSERT Messages      │
                               ├────────────────────────▶│
                               │                         │
                               │ 5. ERROR (constraint)   │
                               │◀────────────────────────┤
                               │                         │
                               │ 6. ROLLBACK             │
                               ├────────────────────────▶│
                               │                         │
                               │ 7. All Changes Undone   │
                               │◀────────────────────────┤
                               │                         │
                               ▼
                         Return 400 Error
                    {error: "Validation failed"}
```

---

## 4. Database Schema

### Entity Relationship Diagram

```
┌──────────────────────────────────────────────────────────────────┐
│                         Conversation                              │
├──────────────────────────────────────────────────────────────────┤
│ PK  id                    String (CUID)                          │
│     createdAt             DateTime                               │
│     updatedAt             DateTime                               │
│     startedAt             DateTime                               │
│     completedAt           DateTime?                              │
│     status                ConversationStatus                     │
│     name                  String                                 │
│     mode                  String (round-robin|reactive|...)      │
│     maxTurns              Int?                                   │
│     initialPrompt         Text                                   │
│     totalMessages         Int                                    │
│     totalTokens           Int                                    │
│     totalCost             Float                                  │
│     totalDuration         Int                                    │
│     metadata              Json?                                  │
│                                                                   │
│ Indexes:                                                          │
│   - createdAt                                                     │
│   - status                                                        │
│   - mode                                                          │
└───────────────────┬───────────────────┬───────────────────────────┘
                    │                   │
                    │ 1:N               │ 1:N
                    │                   │
       ┌────────────▼────────┐   ┌──────▼─────────────────────────┐
       │      Message        │   │    ConversationAgent           │
       ├─────────────────────┤   ├────────────────────────────────┤
       │ PK  id              │   │ PK  id                         │
       │ FK  conversationId  │   │ FK  conversationId             │
       │     agentId         │   │     agentId                    │
       │     agentName       │   │     agentType                  │
       │     agentType       │   │     agentName                  │
       │     agentVersion    │   │     agentVersion               │
       │     content         │   │     model                      │
       │     role            │   │     prompt                     │
       │     timestamp       │   │     announcement               │
       │     duration        │   │     settings (Json)            │
       │     inputTokens     │   │                                │
       │     outputTokens    │   │ Indexes:                       │
       │     totalTokens     │   │   - agentType                  │
       │     model           │   │   - model                      │
       │     cost            │   │   - agentVersion               │
       │                     │   │                                │
       │ Indexes:            │   │ Unique:                        │
       │   - conversationId, │   │   - (conversationId, agentId)  │
       │     timestamp       │   │                                │
       │   - agentType       │   └────────────────────────────────┘
       │   - model           │
       │   - timestamp       │
       └─────────────────────┘

┌─────────────────────────────┐
│          Event              │
├─────────────────────────────┤
│ PK  id                      │
│     createdAt               │
│     type                    │
│     conversationId?         │
│     data (Json)             │
│     errorMessage            │
│     errorStack              │
│                             │
│ Indexes:                    │
│   - createdAt               │
│   - type                    │
│   - conversationId          │
└─────────────────────────────┘
```

### Key Relationships

```
Conversation ──1:N──▶ Message
                      (A conversation has many messages)

Conversation ──1:N──▶ ConversationAgent
                      (A conversation has many participants)

Message.agentId ════▶ ConversationAgent.agentId
                      (Messages reference agents, but not enforced FK)

Conversation ──1:N──▶ Event
                      (Optional: Events can reference conversations)
```

---

## 5. Security Flow

### API Key Authentication Flow

```
┌─────────────┐
│   CLI/Web   │
└──────┬──────┘
       │
       │ 1. HTTP Request
       │    Authorization: Bearer ap_live_k9j8h7g6f5d4s3a2...
       │
       ▼
┌────────────────────────────┐
│   Middleware: validateApiKey│
└──────┬─────────────────────┘
       │
       │ 2. Extract Token
       │    token = header.replace('Bearer ', '')
       │
       ▼
┌────────────────────────────┐
│   Hash & Compare           │
│                            │
│   providedHash = SHA256(token)
│   expectedHash = SHA256(env.API_KEY)
│                            │
│   if (providedHash === expectedHash)
└──────┬─────────────────────┘
       │
       ├─── MATCH ───────────────────────┐
       │                                  │
       ▼                                  ▼
┌────────────────┐            ┌──────────────────┐
│  Continue to   │            │  Return 401      │
│  Rate Limit    │            │  Unauthorized    │
└────────┬───────┘            └──────────────────┘
         │
         │ 3. Check Rate Limit
         │
         ▼
┌────────────────────────────┐
│   Rate Limiter             │
│                            │
│   identifier = "api:"+key  │
│   count = redis.get(id)    │
│                            │
│   if (count < limit)       │
└──────┬─────────────────────┘
       │
       ├─── ALLOWED ─────────────────────┐
       │                                  │
       ▼                                  ▼
┌────────────────┐            ┌──────────────────┐
│  Continue to   │            │  Return 429      │
│  Handler       │            │  Rate Limited    │
└────────┬───────┘            └──────────────────┘
         │
         │ 4. Validate Payload (Zod)
         │
         ▼
┌────────────────────────────┐
│   Schema Validation        │
│                            │
│   const event =            │
│     schema.parse(payload)  │
└──────┬─────────────────────┘
       │
       ├─── VALID ───────────────────────┐
       │                                  │
       ▼                                  ▼
┌────────────────┐            ┌──────────────────┐
│  Process       │            │  Return 400      │
│  Request       │            │  Bad Request     │
└────────────────┘            └──────────────────┘
```

---

## 6. SSE Connection Lifecycle

### Connection Management

```
Browser                     Next.js Server              EventManager
  │                              │                           │
  │ 1. Open Connection          │                           │
  │ new EventSource('/api/realtime/stream')                 │
  ├────────────────────────────▶│                           │
  │                              │                           │
  │                              │ 2. Create Stream          │
  │                              │ new ReadableStream()      │
  │                              │                           │
  │                              │ 3. Subscribe              │
  │                              ├──────────────────────────▶│
  │                              │ subscribe(listener)       │
  │                              │                           │
  │                              │ 4. Listener Added         │
  │                              │◀──────────────────────────┤
  │                              │                           │
  │ 5. Connection Established    │                           │
  │◀─────────────────────────────┤                           │
  │ data: {"type":"connected"}   │                           │
  │                              │                           │
  │                              │ 6. Start Heartbeat        │
  │                              │ setInterval(30s)          │
  │                              │                           │
  │ 7. Heartbeat                 │                           │
  │◀─────────────────────────────┤                           │
  │ :heartbeat                   │                           │
  │                              │                           │
  │ ... (connection stays open) ...                          │
  │                              │                           │
  │                              │◀──────────────────────────┤
  │                              │ 8. Event Emitted          │
  │                              │                           │
  │ 9. Event Pushed              │                           │
  │◀─────────────────────────────┤                           │
  │ data: {"type":"message.created", ...}                    │
  │                              │                           │
  │                              │                           │
  │ 10. Client Closes            │                           │
  │ eventSource.close()          │                           │
  ├────────────────────────────▶│                           │
  │                              │                           │
  │                              │ 11. Unsubscribe           │
  │                              ├──────────────────────────▶│
  │                              │ unsubscribe()             │
  │                              │                           │
  │                              │ 12. Listener Removed      │
  │                              │◀──────────────────────────┤
  │                              │                           │
  │                              │ 13. Stop Heartbeat        │
  │                              │ clearInterval()           │
  │                              │                           │
```

### Auto-Reconnection on Failure

```
Browser                     Network                      Server
  │                            │                            │
  │ 1. Connected              │                            │
  ├──────────────────────────▶│───────────────────────────▶│
  │                            │                            │
  │ 2. Network Failure        │                            │
  │                            ✗                            │
  │                                                         │
  │ 3. onerror Triggered      │                            │
  │                            │                            │
  │ 4. Auto-Reconnect (3s)    │                            │
  │ new EventSource()          │                            │
  ├──────────────────────────▶│                            │
  │                            │                            │
  │ 5. Connection Failed      │                            │
  │                            ✗                            │
  │                            │                            │
  │ 6. Retry with Backoff (6s)│                            │
  ├──────────────────────────▶│                            │
  │                            │                            │
  │ 7. Connection Failed      │                            │
  │                            ✗                            │
  │                            │                            │
  │ 8. Retry (12s)            │                            │
  ├──────────────────────────▶│───────────────────────────▶│
  │                            │                            │
  │ 9. Connection Restored    │                            │
  │◀──────────────────────────┤◀───────────────────────────┤
  │ data: {"type":"connected"}│                            │
  │                            │                            │
```

---

## 7. Error Handling Flow

### Validation Error Handling

```
Request ──▶ Zod Schema ──▶ Validation
                │
                ├─── PASS ───▶ Continue Processing
                │
                └─── FAIL ───▶ Extract Error Details
                                      │
                                      ▼
                               ┌────────────────┐
                               │ Format Error   │
                               │                │
                               │ {              │
                               │   error,       │
                               │   field,       │
                               │   message,     │
                               │   details[]    │
                               │ }              │
                               └────────┬───────┘
                                        │
                                        ▼
                                 Return 400
                                 Bad Request
```

### Database Error Handling

```
Database Operation
        │
        ├─── SUCCESS ──▶ Return Result
        │
        ├─── CONSTRAINT VIOLATION ──▶ Return 409 Conflict
        │                              "Duplicate entry"
        │
        ├─── NOT FOUND ──▶ Return 404 Not Found
        │                  "Resource not found"
        │
        ├─── TIMEOUT ──▶ Return 504 Gateway Timeout
        │                "Database timeout"
        │
        └─── OTHER ERROR ──▶ Log Error
                             Return 500 Internal Error
                             (Don't expose details)
```

### CLI Retry Logic

```
CLI ──▶ Send Request
            │
            ├─── 2xx Success ──▶ Return Result
            │
            ├─── 4xx Client Error ──▶ Don't Retry
            │                          Return Error
            │
            ├─── 5xx Server Error ──▶ Retry Logic
            │                              │
            │                              ▼
            │                       Attempt 1 (delay 1s)
            │                              │
            │                              ├─── Success ──▶ Return
            │                              │
            │                              └─── Fail ──▶ Attempt 2 (delay 2s)
            │                                               │
            │                                               ├─── Success ──▶ Return
            │                                               │
            │                                               └─── Fail ──▶ Attempt 3 (delay 4s)
            │                                                                │
            │                                                                ├─── Success ──▶ Return
            │                                                                │
            │                                                                └─── Fail ──▶ Return Error
            │
            └─── Network Error ──▶ Retry with Exponential Backoff
```

---

## 8. Deployment Architecture

### Production Deployment (Vercel + Supabase)

```
┌─────────────────────────────────────────────────────────────────┐
│                        INTERNET                                  │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            │ HTTPS
                            │
┌───────────────────────────▼─────────────────────────────────────┐
│                      CDN / Edge Network                          │
│                      (Vercel Edge)                               │
│                                                                   │
│  - SSL Termination                                               │
│  - DDoS Protection                                               │
│  - Geographic Distribution                                       │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            │
┌───────────────────────────▼─────────────────────────────────────┐
│                    Load Balancer                                 │
│                    (Vercel)                                      │
│                                                                   │
│  - Request Routing                                               │
│  - Health Checks                                                 │
│  - Auto-Scaling                                                  │
└─────────────┬────────────────────────────┬──────────────────────┘
              │                            │
              │                            │
┌─────────────▼──────────┐    ┌───────────▼─────────────┐
│   Next.js Instance 1   │    │  Next.js Instance 2     │   ... N instances
│   (Serverless)         │    │  (Serverless)           │
│                        │    │                         │
│  - API Routes          │    │  - API Routes           │
│  - SSE Handling        │    │  - SSE Handling         │
│  - Event Management    │    │  - Event Management     │
└────────┬───────────────┘    └───────────┬─────────────┘
         │                                 │
         │                                 │
         └────────────┬────────────────────┘
                      │
                      │ Connection Pooling
                      │
┌─────────────────────▼────────────────────────────────────────────┐
│                    Database Layer                                 │
│                                                                   │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │              PgBouncer (Connection Pooler)                 │  │
│  │  - Connection Pooling                                      │  │
│  │  - Load Distribution                                       │  │
│  └───────────────────────────┬───────────────────────────────┘  │
│                               │                                   │
│  ┌────────────────────────────▼──────────────────────────────┐  │
│  │         PostgreSQL Primary (Supabase)                      │  │
│  │  - ACID Transactions                                       │  │
│  │  - Point-in-Time Recovery                                  │  │
│  │  - Automated Backups                                       │  │
│  └────────────────────────────┬──────────────────────────────┘  │
│                               │                                   │
│                               │ Replication                       │
│                               │                                   │
│  ┌────────────────────────────▼──────────────────────────────┐  │
│  │         PostgreSQL Replicas (Read-Only)                    │  │
│  │  - Read Scaling                                            │  │
│  │  - High Availability                                       │  │
│  └────────────────────────────────────────────────────────────┘  │
└───────────────────────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────────────────────┐
│                    Redis Layer (Upstash)                           │
│                                                                    │
│  - Rate Limiting                                                   │
│  - Session Caching                                                 │
│  - Distributed Locks                                               │
└───────────────────────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────────────────────┐
│                  Monitoring & Logging                              │
│                                                                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐   │
│  │   Vercel     │  │   Sentry     │  │   DataDog/NewRelic   │   │
│  │   Logs       │  │   Errors     │  │   Metrics            │   │
│  └──────────────┘  └──────────────┘  └──────────────────────┘   │
└───────────────────────────────────────────────────────────────────┘
```

### Self-Hosted Deployment (Docker)

```
┌─────────────────────────────────────────────────────────────────┐
│                        INTERNET                                  │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            │ HTTPS
                            │
┌───────────────────────────▼─────────────────────────────────────┐
│                    Nginx (Reverse Proxy)                         │
│                                                                   │
│  - SSL Termination                                               │
│  - Load Balancing                                                │
│  - Rate Limiting                                                 │
│  - Static Asset Caching                                          │
└─────────────┬────────────────────────────┬──────────────────────┘
              │                            │
              │                            │
┌─────────────▼──────────┐    ┌───────────▼─────────────┐
│  Next.js Container 1   │    │  Next.js Container 2    │   ...
│  (Docker)              │    │  (Docker)               │
│                        │    │                         │
│  - Node.js 20          │    │  - Node.js 20           │
│  - API Routes          │    │  - API Routes           │
│  - SSE Handling        │    │  - SSE Handling         │
└────────┬───────────────┘    └───────────┬─────────────┘
         │                                 │
         │                                 │
         └────────────┬────────────────────┘
                      │
┌─────────────────────▼────────────────────────────────────────────┐
│                 PostgreSQL Container                              │
│                                                                   │
│  - PostgreSQL 16                                                  │
│  - Persistent Volume                                              │
│  - Automated Backups                                              │
│  - WAL Archiving                                                  │
└───────────────────────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────────────────────┐
│                    Redis Container                                 │
│                                                                    │
│  - Redis 7                                                         │
│  - Persistent Volume (AOF)                                         │
│  - Rate Limiting Data                                              │
│  - Cache Data                                                      │
└───────────────────────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────────────────────┐
│                  Monitoring Stack                                  │
│                                                                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐   │
│  │  Prometheus  │  │   Grafana    │  │   Loki (Logs)        │   │
│  │  (Metrics)   │  │  (Dashboard) │  │                      │   │
│  └──────────────┘  └──────────────┘  └──────────────────────┘   │
└───────────────────────────────────────────────────────────────────┘
```

---

## Summary

These diagrams provide visual representations of:

1. **System Architecture** - Overall component structure
2. **Real-time Event Flow** - Sequence of operations for streaming
3. **Historical Upload Flow** - Bulk upload process
4. **Database Schema** - Entity relationships
5. **Security Flow** - Authentication and validation
6. **SSE Connection Lifecycle** - WebSocket-like connection management
7. **Error Handling** - Error propagation and retry logic
8. **Deployment Architecture** - Production infrastructure

Use these diagrams as references during implementation and when communicating architecture to team members.

---

**Document Version**: 1.0
**Last Updated**: 2025-10-20
