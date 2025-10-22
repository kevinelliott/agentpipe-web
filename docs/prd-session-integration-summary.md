# PRD Summary: Session Streaming & Upload

**Quick Reference Guide for Implementation Teams**

---

## TL;DR

Add two major features to AgentPipe Web:

1. **Real-Time Streaming:** AgentPipe CLI sessions stream live to web dashboard
2. **Historical Upload:** Past .log files can be uploaded and analyzed

**Target Users:** Developers using AgentPipe CLI who want better monitoring and analytics

**Business Value:** Enable real-time monitoring, historical analysis, cost tracking, and debugging

**Timeline:** 4-5 weeks for MVP

---

## What We're Building

### Feature 1: Real-Time Streaming

**User Story:**
As a developer running AgentPipe, I want to watch conversations unfold in a web dashboard instead of watching terminal output.

**How It Works:**
1. User enables bridge in AgentPipe config (opt-in)
2. AgentPipe sends events to AgentPipe Web via HTTP
3. Web stores data in PostgreSQL
4. Web broadcasts updates to dashboard via SSE
5. Dashboard shows live conversation with real-time metrics

**Key Components:**
- AgentPipe bridge component (Go) - **NEW**
- `/api/ingest` endpoint - **EXISTING**
- SSE streaming - **EXISTING**
- Live dashboard UI - **NEW**

---

### Feature 2: Historical Upload

**User Story:**
As a developer with past AgentPipe sessions, I want to upload .log files to search and analyze historical conversations.

**How It Works:**
1. User navigates to upload page in web UI
2. Drags .log files into upload zone
3. Files parsed and stored in database
4. Uploaded conversations immediately searchable
5. Full timeline and metrics available

**Key Components:**
- Upload UI with drag-and-drop - **NEW**
- Log file parser - **NEW**
- `/api/upload` endpoint - **NEW**
- Search and filter UI - **PARTIALLY EXISTS**

---

## Priority Breakdown

### Must Have (MVP - P0)

**Real-Time Streaming:**
- ✅ Bridge component in AgentPipe (Go)
- ✅ API key authentication
- ✅ Live dashboard UI
- ✅ Connection status indicator
- ✅ Real-time metrics display

**Historical Upload:**
- ✅ Web UI file upload
- ✅ Log file parser
- ✅ Upload endpoint
- ✅ Progress indication

**Search:**
- ✅ Full-text search
- ✅ Date/agent/status filters
- ✅ Conversation detail view

**Privacy:**
- ✅ Opt-in setup guide
- ✅ API key management
- ✅ Privacy documentation

**Timeline:** 4-5 weeks

---

### Should Have (P1)

- CLI upload command
- Advanced filters (cost, tokens, model)
- Export (JSON, Markdown, CSV)
- Conversation deletion
- Bulk operations

**Timeline:** +2-3 weeks

---

### Could Have (P2)

- Analytics dashboard
- Agent/model comparison
- Team collaboration
- Saved searches

**Timeline:** +4-6 weeks

---

## Implementation Tracks

### Track 1: AgentPipe Bridge (Go)

**Owner:** AgentPipe repository maintainer

**Tasks:**
1. Create `pkg/bridge/bridge.go` package
2. Implement HTTP POST bridge
3. Add event emission to orchestrator
4. Update config schema
5. Add tests
6. Documentation

**Deliverables:**
- Bridge component that sends events to `/api/ingest`
- Configuration example
- Integration tests

**Estimate:** 4-6 hours

**Dependencies:** None (can start immediately)

---

### Track 2: Log File Parser (Backend)

**Owner:** Backend engineer

**Tasks:**
1. Study AgentPipe log format
2. Write parser for .log files
3. Extract conversation metadata
4. Extract messages with timestamps
5. Handle malformed logs
6. Add tests

**Deliverables:**
- Parser function: `parseLogFile(file) => Conversation`
- Error handling for invalid files
- Unit tests

**Estimate:** 1-2 days

**Dependencies:** Sample .log files (already available)

---

### Track 3: Upload API & UI (Full Stack)

**Owner:** Full stack engineer

**Tasks:**

**Backend:**
1. Create `POST /api/upload` endpoint
2. Integrate log file parser
3. Store in database via Prisma
4. Handle file validation
5. Return success/error responses

**Frontend:**
1. Create upload page (`/upload`)
2. Build drag-and-drop zone
3. Implement file picker
4. Show upload progress
5. Display results with links

**Deliverables:**
- Working upload endpoint
- Upload UI with progress tracking
- Error handling

**Estimate:** 3-4 days

**Dependencies:** Log file parser (Track 2)

---

### Track 4: Dashboard UI (Frontend)

**Owner:** Frontend engineer

**Tasks:**
1. Create live conversation feed
2. Build conversation cards
3. Connect to SSE stream
4. Display real-time messages
5. Show live metrics
6. Add connection status
7. Empty state with setup guide

**Deliverables:**
- Live dashboard at `/`
- Real-time updates working
- Connection indicators
- Setup guide modal

**Estimate:** 4-5 days

**Dependencies:** Bridge component (Track 1) for testing

---

### Track 5: Search & Filters (Frontend)

**Owner:** Frontend engineer

**Tasks:**
1. Enhance search UI
2. Add filter panel
3. Build conversation list
4. Create detail page
5. Implement pagination

**Deliverables:**
- Search page at `/history`
- Working filters
- Detail view with timeline

**Estimate:** 3-4 days

**Dependencies:** Upload API (Track 3) for test data

---

### Track 6: Privacy & Setup (Frontend)

**Owner:** Frontend engineer

**Tasks:**
1. Create API key management page
2. Build setup guide modal
3. Write privacy documentation
4. Create configuration generator
5. Add opt-in messaging

**Deliverables:**
- `/settings/api-keys` page
- Setup guide component
- Privacy policy page

**Estimate:** 2-3 days

**Dependencies:** API key endpoints (backend)

---

## Critical User Flows

### Flow 1: First-Time Setup (5 minutes)

1. User visits AgentPipe Web
2. Sees empty dashboard with "Enable Streaming" CTA
3. Clicks CTA → Setup modal opens
4. Generates API key (one click)
5. Copies bridge config snippet
6. Pastes into `~/.agentpipe/config.yaml`
7. Runs test conversation
8. Sees conversation in dashboard

**Success Criteria:** >90% setup success rate

---

### Flow 2: Real-Time Monitoring (<1 second latency)

1. User starts conversation in CLI
2. Conversation appears in web UI (<500ms)
3. Messages stream as agents respond (<100ms per message)
4. Metrics update in real-time
5. User can expand for full timeline
6. Conversation completes → Status updates

**Success Criteria:** <500ms CLI-to-Web latency

---

### Flow 3: Upload Historical Sessions (2 minutes for 100 files)

1. User navigates to `/upload`
2. Drags 100 .log files into drop zone
3. Sees progress bars for each file
4. 95+ succeed, ~5 fail with clear errors
5. Clicks "View" on successful upload
6. Sees full conversation timeline
7. Can immediately search uploaded conversations

**Success Criteria:** >95% upload success rate

---

### Flow 4: Search & Analyze (<2 seconds)

1. User navigates to `/history`
2. Enters search query
3. Results appear (<2s)
4. Applies filters (date, agent, cost)
5. Results filter down
6. Clicks conversation → Detail view
7. Reviews timeline and metrics
8. Exports as Markdown

**Success Criteria:** <2s search response time

---

## Data Schema Quick Reference

### Conversation Table
```typescript
{
  id: string (CUID)
  startedAt: DateTime
  completedAt?: DateTime
  status: ACTIVE | COMPLETED | INTERRUPTED | ERROR
  mode: 'round-robin' | 'reactive' | 'free-form'
  initialPrompt: string
  totalMessages: number
  totalTokens: number
  totalCost: number (USD)
  totalDuration: number (ms)
}
```

### Message Table
```typescript
{
  id: string (CUID)
  conversationId: string
  agentName: string
  agentType: string (claude, gpt, gemini, etc.)
  content: string
  role: 'agent' | 'user' | 'system'
  timestamp: DateTime
  duration?: number (ms)
  totalTokens?: number
  cost?: number (USD)
  model?: string
}
```

---

## API Quick Reference

### POST /api/ingest
**Purpose:** Receive events from AgentPipe bridge
**Auth:** Bearer token (API key)
**Payload:** Event object with type and data
**Response:** 200 success, 401 auth error, 429 rate limit

### GET /api/realtime/stream
**Purpose:** SSE stream for dashboard
**Auth:** Optional
**Response:** Server-Sent Events stream

### POST /api/upload
**Purpose:** Upload .log files
**Auth:** Required
**Payload:** multipart/form-data with files
**Response:** Array of success/failure per file

### POST /api/search
**Purpose:** Search conversations with filters
**Auth:** Optional
**Payload:** Query string + filters
**Response:** Paginated conversation list

### GET /api/conversations/:id
**Purpose:** Get conversation details
**Auth:** Optional
**Response:** Full conversation with messages

---

## Success Metrics

**Adoption:**
- 50%+ opt-in rate within 30 days
- 90%+ setup success rate
- <10 min time to first stream

**Quality:**
- 95%+ streaming success rate
- 95%+ upload success rate
- <500ms streaming latency
- <2s search response time

**Engagement:**
- 70%+ weekly retention
- 10+ conversations viewed per user per week
- 5+ searches per user per week

---

## Technical Requirements

### Performance
- Real-time latency: <500ms CLI → Web
- Message latency: <100ms per message
- Search response: <2s for 10k conversations
- Upload speed: 100 files in <2 minutes

### Reliability
- 95%+ success rate for streaming
- 95%+ success rate for uploads
- Graceful degradation when web unavailable
- Non-blocking bridge (errors don't stop CLI)

### Security
- API key authentication (Bearer token)
- Rate limiting (1000 req/min ingest, 100 req/min upload)
- HTTPS required in production
- Input validation and XSS prevention
- Opt-in by default (privacy first)

---

## Risk Mitigation

### Risk 1: High Latency Kills UX
**Mitigation:**
- Set strict performance budgets (<500ms)
- Monitor latency in real-time
- Optimize database queries with indexes
- Use connection pooling
- Add caching where appropriate

### Risk 2: Poor Setup Experience → Low Adoption
**Mitigation:**
- Clear step-by-step setup guide
- One-click API key generation
- Copy-paste config snippets
- Test connection button
- Helpful error messages

### Risk 3: Log Parser Fails on Edge Cases
**Mitigation:**
- Test with diverse .log files
- Graceful error handling
- Clear error messages
- Option to report parsing failures
- Fallback to partial import

### Risk 4: Bridge Failures Frustrate Users
**Mitigation:**
- Non-blocking design (CLI continues on error)
- Retry logic with exponential backoff
- Clear logging of bridge errors
- Fallback to local log files
- Status indicator in dashboard

---

## Open Questions for Team Review

1. **Performance:** Is 500ms latency acceptable or should we target lower?
   - **Recommendation:** Start with 500ms, optimize to <200ms if feedback demands

2. **Storage:** Should we keep original .log files or just parsed data?
   - **Recommendation:** Parsed data only for MVP, add S3 backup in enterprise version

3. **Multi-user:** Do we need authentication in MVP?
   - **Recommendation:** No, single-user (self-hosted) is fine for MVP

4. **Export formats:** Which formats are must-have vs. nice-to-have?
   - **Recommendation:** JSON (P0), Markdown (P1), CSV (P2)

5. **Rate limits:** Are proposed limits appropriate?
   - **Recommendation:** Start conservative, adjust based on usage patterns

---

## Getting Started

### For Backend Engineers
1. Read full PRD: `/docs/prd-session-integration.md`
2. Review existing APIs: `/app/api/`
3. Study Prisma schema: `/prisma/schema.prisma`
4. Start with Track 2 (Log Parser) or Track 3 (Upload API)

### For Frontend Engineers
1. Read full PRD: `/docs/prd-session-integration.md`
2. Review design system: `/docs/design-system-summary.md`
3. Study existing components: `/app/components/`
4. Start with Track 4 (Dashboard) or Track 5 (Search)

### For AgentPipe Team
1. Read full PRD: `/docs/prd-session-integration.md`
2. Review bridge spec: `/docs/agentpipe-integration.md`
3. Examine event schema in PRD Appendix A
4. Start Track 1 (Bridge Component)

---

## Questions?

- **Full Details:** See `/docs/prd-session-integration.md`
- **Architecture:** See `/docs/architecture.md`
- **Integration:** See `/docs/agentpipe-integration.md`
- **Contact:** [Product Owner]

**Ready to build? Let's ship this!** 🚀
