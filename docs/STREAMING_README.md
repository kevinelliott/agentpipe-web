# AgentPipe Streaming Architecture - Documentation Index

This directory contains complete technical documentation for the AgentPipe streaming architecture, which enables real-time session streaming and historical session uploads between AgentPipe CLI (Go) and AgentPipe Web (Next.js 15).

## Quick Navigation

### Getting Started (Start Here!)

1. **[Quick Start Guide](STREAMING_QUICK_START.md)** - Get streaming working in 30 minutes
   - Prerequisites and setup
   - Test real-time streaming
   - Test historical uploads
   - CLI integration basics

### Architecture & Design

2. **[Technical Architecture](STREAMING_ARCHITECTURE.md)** - Complete system design
   - Architecture overview with diagrams
   - Technology choices and rationale
   - Database schema design
   - API specifications (REST + SSE)
   - Data format specifications
   - Security architecture
   - Performance optimization strategies
   - Implementation plan

### Implementation

3. **[Implementation Examples](IMPLEMENTATION_EXAMPLES.md)** - Production-ready code
   - Complete validation schemas (Zod)
   - Enhanced API route handlers
   - Session upload endpoint
   - Authentication middleware
   - Rate limiting implementation
   - Go CLI client (complete)
   - React hooks for SSE
   - Database migrations

### Deployment

4. **[Deployment Checklist](STREAMING_DEPLOYMENT_CHECKLIST.md)** - Production deployment guide
   - Pre-deployment checklist (security, database, infrastructure)
   - Step-by-step deployment process
   - Post-deployment monitoring
   - Rollback procedures
   - Troubleshooting common issues
   - Performance benchmarks

---

## Architecture Overview

```
┌─────────────────┐
│  AgentPipe CLI  │ (Go)
│   (Streaming)   │
└────────┬────────┘
         │ HTTPS POST
         │ Bearer Auth
         │
         ▼
┌──────────────────────────────────────┐
│         AgentPipe Web (Next.js)      │
│                                      │
│  ┌────────────────────────────────┐ │
│  │  POST /api/ingest              │ │
│  │  POST /api/sessions/upload     │ │
│  │  GET  /api/realtime/stream     │ │
│  └────────────────┬───────────────┘ │
│                   │                  │
│                   ▼                  │
│  ┌────────────────────────────────┐ │
│  │  PostgreSQL + Prisma ORM       │ │
│  └────────────────────────────────┘ │
│                   │                  │
│                   ▼                  │
│  ┌────────────────────────────────┐ │
│  │  SSE Event Manager             │ │
│  │  (In-Memory Broadcasting)      │ │
│  └────────────────────────────────┘ │
└──────────────────┬───────────────────┘
                   │
                   │ SSE Stream
                   ▼
         ┌──────────────────┐
         │  Web Browsers    │
         │  (EventSource)   │
         └──────────────────┘
```

---

## Key Features

### Real-time Streaming
- **Server-Sent Events (SSE)** for unidirectional CLI → Web streaming
- **Event-driven architecture** with in-memory broadcasting
- **Live updates** in web UI as CLI runs conversations
- **Low latency** with minimal overhead

### Historical Upload
- **Bulk upload** of completed sessions
- **Transactional** database writes for data integrity
- **Idempotency** to prevent duplicate uploads
- **Validation** of all data before persistence

### Security
- **API key authentication** with Bearer tokens
- **Rate limiting** (100 req/min ingestion, 10 req/min upload)
- **Input validation** with Zod schemas
- **HTTPS-only** communication in production
- **CORS** protection

### Performance
- **Efficient database queries** with proper indexing
- **Connection pooling** for database
- **Message batching** in CLI (optional)
- **Caching** for read-heavy endpoints
- **Scales to 1000+ concurrent SSE connections**

### Reliability
- **Auto-retry** with exponential backoff (CLI)
- **Graceful error handling** with detailed error messages
- **Health checks** for monitoring
- **Transactional uploads** for data consistency

---

## API Endpoints

### Ingestion (CLI → Web)

**POST `/api/ingest`** - Receive real-time events from CLI
- Authentication: Bearer token
- Events: `conversation.started`, `message.created`, `conversation.completed`, `conversation.interrupted`, `error.occurred`
- Rate limit: 100 requests/minute

### Historical Upload (CLI → Web)

**POST `/api/sessions/upload`** - Bulk upload complete sessions
- Authentication: Bearer token
- Payload: Full session data (metadata + participants + messages)
- Rate limit: 10 requests/minute
- Max size: 10,000 messages per upload

### Real-time Streaming (Web Client ← Web Server)

**GET `/api/realtime/stream`** - SSE endpoint for live updates
- Query param: `conversationId` (optional, filters to specific conversation)
- Events: All ingestion events broadcast in real-time
- Auto-reconnection supported by browsers
- Heartbeat every 30 seconds

### Session Retrieval

**GET `/api/sessions`** - List all sessions with pagination
**GET `/api/sessions/:id`** - Get specific session with messages

---

## Event Types

All events follow this structure:

```typescript
{
  type: string;           // Event type
  timestamp: string;      // ISO 8601 timestamp
  data: {                 // Event-specific data
    // ...
  }
}
```

### Event Types:

1. **conversation.started** - New conversation begins
2. **message.created** - New message in conversation
3. **conversation.completed** - Conversation finishes successfully
4. **conversation.interrupted** - Conversation stopped/cancelled
5. **error.occurred** - Error during conversation

See [STREAMING_ARCHITECTURE.md](STREAMING_ARCHITECTURE.md#31-real-time-ingestion-api-cli--web) for complete event schemas.

---

## Data Flow

### Real-time Flow (CLI → Web → Browser)

```
1. CLI runs conversation
   ↓
2. CLI sends events to POST /api/ingest
   ↓
3. Web validates & stores in PostgreSQL
   ↓
4. Web broadcasts to in-memory EventManager
   ↓
5. EventManager pushes to all SSE clients
   ↓
6. Browser receives & displays in real-time
```

### Historical Upload Flow (CLI → Web)

```
1. CLI completes conversation
   ↓
2. CLI prepares session data (metadata + participants + messages)
   ↓
3. CLI sends to POST /api/sessions/upload
   ↓
4. Web validates all data
   ↓
5. Web creates conversation, participants, messages in transaction
   ↓
6. Web returns confirmation
   ↓
7. Browser can view historical session via GET /api/sessions
```

---

## Database Schema

The existing Prisma schema supports streaming with minimal changes:

### Core Models

- **Conversation** - Session metadata and aggregates
- **Message** - Individual messages in conversation
- **ConversationAgent** - Participants in conversation
- **Event** - Error events and audit log

### Optional Enhancements

- `source` field on Conversation (track CLI vs web)
- `sequenceNumber` field on Message (explicit ordering)

See [STREAMING_ARCHITECTURE.md](STREAMING_ARCHITECTURE.md#2-database-schema) for complete schema.

---

## Implementation Status

### Existing Infrastructure (Already Implemented ✅)

The following are **already implemented** in the current codebase:

- ✅ Database schema (Conversations, Messages, ConversationAgents)
- ✅ Prisma ORM setup
- ✅ Basic ingestion endpoint (`/api/ingest`)
- ✅ SSE streaming endpoint (`/api/realtime/stream`)
- ✅ EventManager for broadcasting
- ✅ Type definitions for events

### New Components (To Be Implemented)

The following need to be added for complete streaming:

- [ ] Enhanced validation schemas (Zod)
- [ ] Session upload endpoint (`/api/sessions/upload`)
- [ ] Authentication middleware improvements
- [ ] Rate limiting (in-memory or Redis)
- [ ] Go CLI streaming client
- [ ] React hooks for SSE (frontend)
- [ ] Database migrations (optional enhancements)

**Estimated Implementation Time**: 2-3 weeks (per Phase 1-3 in architecture doc)

---

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL 14+
- Go 1.21+ (for CLI)
- Next.js 15 knowledge
- Prisma ORM familiarity

### Quick Setup (5 minutes)

1. **Generate API Key**
   ```bash
   node -e "console.log('ap_live_' + require('crypto').randomBytes(24).toString('base64url'))"
   ```

2. **Configure Environment**
   ```bash
   echo "AGENTPIPE_BRIDGE_API_KEY=your-generated-key" >> .env.local
   ```

3. **Start Development Server**
   ```bash
   npm run dev
   ```

4. **Test Ingestion**
   ```bash
   curl -X POST http://localhost:3000/api/ingest \
     -H "Authorization: Bearer your-generated-key" \
     -H "Content-Type: application/json" \
     -d '{"type":"conversation.started","data":{...}}'
   ```

For complete step-by-step instructions, see [STREAMING_QUICK_START.md](STREAMING_QUICK_START.md).

---

## CLI Integration

### Go Client

The streaming architecture includes a complete Go HTTP client for CLI integration:

```go
import "github.com/yourusername/agentpipe/pkg/streaming"

client := streaming.NewClient(streaming.Config{
    BaseURL: "https://agentpipe-web.com",
    APIKey:  os.Getenv("AGENTPIPE_API_KEY"),
})

// Start conversation
conversationID, _ := client.ConversationStarted(...)

// Send messages
client.MessageCreated(conversationID, message)

// Complete conversation
client.ConversationCompleted(...)
```

See [IMPLEMENTATION_EXAMPLES.md](IMPLEMENTATION_EXAMPLES.md#5-go-cli-client-complete) for complete implementation.

---

## Frontend Integration

### React SSE Hook

```typescript
import { useRealtimeEvents } from '@/app/hooks/useRealtimeEvents';

function LiveView({ conversationId }: { conversationId: string }) {
  const { events, isConnected } = useRealtimeEvents({
    conversationId,
    onEvent: (event) => console.log('New event:', event.type),
  });

  return (
    <div>
      Status: {isConnected ? 'Live' : 'Disconnected'}
      {events.map(event => <EventCard key={event.timestamp} event={event} />)}
    </div>
  );
}
```

See [IMPLEMENTATION_EXAMPLES.md](IMPLEMENTATION_EXAMPLES.md#6-react-hooks-for-sse) for complete hook.

---

## Security Considerations

### Authentication
- **API keys** with Bearer token format
- **Constant-time comparison** to prevent timing attacks
- **Key rotation** support

### Rate Limiting
- **100 requests/minute** for ingestion
- **10 requests/minute** for uploads
- **Redis-based** for distributed systems (recommended)

### Input Validation
- **Zod schemas** for all event types
- **Content size limits** (100KB per message, 1MB per event)
- **SQL injection protection** via Prisma ORM

### Network Security
- **HTTPS-only** in production
- **CORS protection** with allowed origins
- **HSTS headers** recommended

---

## Performance Benchmarks

### Target Metrics (Production)

| Metric | Target |
|--------|--------|
| API Response Time (p95) | < 200ms |
| API Response Time (p99) | < 500ms |
| Error Rate | < 0.1% |
| Concurrent SSE Connections | 1000+ |
| Events Ingested/Second | 100+ |

### Optimization Strategies

- Database indexing on hot paths
- Connection pooling (PgBouncer)
- Redis caching for reads
- Message batching in CLI
- Efficient SSE connection management

See [STREAMING_ARCHITECTURE.md](STREAMING_ARCHITECTURE.md#7-performance-optimization) for details.

---

## Monitoring & Observability

### Key Metrics to Track

1. **Ingestion Rate** - Events/second
2. **SSE Connections** - Active count
3. **Database Performance** - Query duration
4. **Error Rate** - Percentage of failed requests
5. **Resource Usage** - CPU, memory, disk

### Health Checks

- `GET /api/health` - Overall system health
- Database connectivity
- Redis connectivity (if applicable)
- SSE manager statistics

### Logging

- Structured JSON logging
- Request/response logging
- Error tracking with Sentry
- Audit logging for security events

---

## Troubleshooting

### Common Issues

**Problem**: 401 Unauthorized
- **Solution**: Verify API key matches in .env.local and CLI export

**Problem**: SSE connection drops
- **Solution**: Check network, verify heartbeat, review proxy settings

**Problem**: Validation errors
- **Solution**: Check event format against Zod schema

**Problem**: Rate limit exceeded
- **Solution**: Wait 60 seconds or reduce request frequency

See [STREAMING_DEPLOYMENT_CHECKLIST.md](STREAMING_DEPLOYMENT_CHECKLIST.md#troubleshooting-common-issues) for complete troubleshooting guide.

---

## Deployment

### Production Checklist

Before deploying to production:

- [ ] Generate production API key
- [ ] Configure HTTPS with valid certificate
- [ ] Set up PostgreSQL with backups
- [ ] Configure Redis for rate limiting
- [ ] Set up monitoring and alerting
- [ ] Run load tests
- [ ] Create runbook for incidents
- [ ] Train team on new system

See [STREAMING_DEPLOYMENT_CHECKLIST.md](STREAMING_DEPLOYMENT_CHECKLIST.md) for complete checklist.

### Deployment Steps

1. Run database migrations
2. Set environment variables
3. Deploy application (Vercel/Docker)
4. Run smoke tests
5. Monitor for 24 hours

---

## Testing

### Unit Tests

```bash
npm test
```

### Integration Tests

```bash
npm run test:integration
```

### Load Tests

```bash
k6 run load-test.js
```

See [STREAMING_ARCHITECTURE.md](STREAMING_ARCHITECTURE.md#9-testing-strategy) for test examples.

---

## Contributing

When making changes to the streaming architecture:

1. Update relevant documentation
2. Add/update tests
3. Verify backward compatibility
4. Update API version if breaking changes
5. Update changelog

---

## Support

### Documentation

- Architecture: [STREAMING_ARCHITECTURE.md](STREAMING_ARCHITECTURE.md)
- Quick Start: [STREAMING_QUICK_START.md](STREAMING_QUICK_START.md)
- Implementation: [IMPLEMENTATION_EXAMPLES.md](IMPLEMENTATION_EXAMPLES.md)
- Deployment: [STREAMING_DEPLOYMENT_CHECKLIST.md](STREAMING_DEPLOYMENT_CHECKLIST.md)

### Getting Help

- Check troubleshooting sections in docs
- Review GitHub issues
- Contact the development team

---

## Roadmap

### Phase 1 (Weeks 1-2) - Core Implementation
- Enhanced validation
- Session upload endpoint
- CLI client implementation

### Phase 2 (Weeks 2-3) - Testing & Documentation
- Comprehensive testing
- Load testing
- Documentation completion

### Phase 3 (Weeks 3-4) - Deployment & Monitoring
- Production deployment
- Monitoring setup
- Performance tuning

### Phase 4 (Future) - Advanced Features
- Per-user API keys
- Resume interrupted streams
- Session replay
- Advanced analytics

---

## License

Same as AgentPipe project.

---

## Changelog

### Version 1.0.0 (2025-10-20)
- Initial architecture design
- Complete technical documentation
- Implementation examples
- Deployment guide
- Quick start guide

---

**Last Updated**: 2025-10-20
**Maintained By**: AgentPipe Team
**Status**: Architecture Approved, Implementation Pending
