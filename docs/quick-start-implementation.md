# Quick Start: Implementation Guide

**Get started building session streaming & upload in 30 minutes**

---

## Overview

This guide helps you start implementing the session streaming and upload features immediately. Read this first, then dive into the full PRD for details.

---

## What You Need to Know

### The Big Picture

We're adding two features:

1. **Real-time streaming:** AgentPipe → HTTP → Web UI (via SSE)
2. **Historical upload:** .log files → Parser → Database → Search

### Current State

**Already Built (✅):**
- Database schema (Prisma)
- `/api/ingest` endpoint
- SSE streaming infrastructure
- Basic conversation/message models
- Some UI components (badges, cards, etc.)

**Need to Build (🔨):**
- AgentPipe bridge component (Go)
- Log file parser
- Upload API and UI
- Dashboard UI for real-time
- Search/filter UI improvements

---

## Quick Start by Role

### Backend Engineer: Start Here

**Your First Task: Log File Parser**

1. **Understand the format:**
   ```bash
   cat ~/.agentpipe/chats/chat_2025-09-11_18-00-33.log
   ```

2. **Create the parser:**
   ```typescript
   // app/lib/logParser.ts
   export interface ParsedConversation {
     startedAt: Date;
     completedAt?: Date;
     messages: Array<{
       agentName: string;
       role: 'agent' | 'user' | 'system';
       content: string;
       timestamp: Date;
     }>;
     participants: Array<{
       agentName: string;
       role: string;
     }>;
   }

   export async function parseLogFile(
     fileContent: string
   ): Promise<ParsedConversation> {
     // TODO: Implement parser
     // 1. Extract header: "Started: YYYY-MM-DD HH:MM:SS"
     // 2. Parse messages: "[HH:MM:SS] Name (role): Content"
     // 3. Extract participants from join messages
     // 4. Extract end time: "Ended: YYYY-MM-DD HH:MM:SS"
     // 5. Return structured data
   }
   ```

3. **Test it:**
   ```typescript
   // app/lib/logParser.test.ts
   import { parseLogFile } from './logParser';

   test('parses basic log file', async () => {
     const content = `
   === AgentPipe Chat Log ===
   Started: 2025-09-11 18:00:33
   =====================================

   [18:00:33] Alice (agent): Hello!
   [18:00:35] Bob (agent): Hi there!

   === Chat Ended ===
   Ended: 2025-09-11 18:00:40
     `;

     const result = await parseLogFile(content);
     expect(result.messages).toHaveLength(2);
     expect(result.messages[0].agentName).toBe('Alice');
   });
   ```

4. **Next tasks:**
   - Create upload API endpoint
   - Add API key endpoints
   - Integration testing

**Reference:**
- Log format example: `~/.agentpipe/chats/*.log`
- Prisma schema: `/Users/kevin/Cloud/Dropbox/work/ai/agentpipe-web/prisma/schema.prisma`
- Existing ingest API: `/Users/kevin/Cloud/Dropbox/work/ai/agentpipe-web/app/api/ingest/route.ts`

---

### Frontend Engineer: Start Here

**Your First Task: Dashboard Components**

1. **Set up component structure:**
   ```bash
   mkdir -p app/components/dashboard
   mkdir -p app/components/upload
   mkdir -p app/components/search
   mkdir -p app/hooks
   ```

2. **Create a live conversation card:**
   ```typescript
   // app/components/dashboard/ConversationCard.tsx
   'use client';

   import { Conversation, Message } from '@/app/types';
   import { Badge } from '@/app/components/ui/Badge';
   import { Card } from '@/app/components/ui/Card';

   interface ConversationCardProps {
     conversation: Conversation;
     messages: Message[];
     isActive: boolean;
   }

   export function ConversationCard({
     conversation,
     messages,
     isActive
   }: ConversationCardProps) {
     return (
       <Card className="p-4">
         {/* Header */}
         <div className="flex items-center justify-between mb-3">
           <h3 className="font-semibold text-lg">
             {conversation.name}
           </h3>
           <Badge variant={isActive ? 'success' : 'default'}>
             {conversation.status}
           </Badge>
         </div>

         {/* Participants */}
         <div className="flex gap-2 mb-3">
           {conversation.participants?.map(p => (
             <Badge key={p.id} variant="outline">
               {p.agentType}
             </Badge>
           ))}
         </div>

         {/* Metrics */}
         <div className="grid grid-cols-3 gap-2 text-sm">
           <div>
             <span className="text-muted">Messages</span>
             <div className="font-semibold">
               {conversation.totalMessages}
             </div>
           </div>
           <div>
             <span className="text-muted">Tokens</span>
             <div className="font-semibold">
               {conversation.totalTokens.toLocaleString()}
             </div>
           </div>
           <div>
             <span className="text-muted">Cost</span>
             <div className="font-semibold">
               ${conversation.totalCost.toFixed(4)}
             </div>
           </div>
         </div>

         {/* Recent messages */}
         <div className="mt-3 space-y-2">
           {messages.slice(-3).map(msg => (
             <div key={msg.id} className="text-sm">
               <span className="font-medium">{msg.agentName}:</span>{' '}
               <span className="text-muted-foreground">
                 {msg.content.slice(0, 60)}...
               </span>
             </div>
           ))}
         </div>
       </Card>
     );
   }
   ```

3. **Create SSE hook:**
   ```typescript
   // app/hooks/useSSE.ts
   'use client';

   import { useEffect, useState } from 'react';

   export function useSSE<T>(url: string) {
     const [data, setData] = useState<T | null>(null);
     const [error, setError] = useState<Error | null>(null);
     const [status, setStatus] = useState<
       'connecting' | 'connected' | 'disconnected'
     >('connecting');

     useEffect(() => {
       const eventSource = new EventSource(url);

       eventSource.onopen = () => {
         setStatus('connected');
       };

       eventSource.onmessage = (event) => {
         try {
           const parsed = JSON.parse(event.data);
           setData(parsed);
         } catch (e) {
           setError(e as Error);
         }
       };

       eventSource.onerror = (e) => {
         setStatus('disconnected');
         setError(new Error('SSE connection failed'));
       };

       return () => {
         eventSource.close();
       };
     }, [url]);

     return { data, error, status };
   }
   ```

4. **Next tasks:**
   - Build upload UI with drag-and-drop
   - Build search/filter components
   - Create conversation detail page

**Reference:**
- Existing components: `/Users/kevin/Cloud/Dropbox/work/ai/agentpipe-web/app/components/`
- Design system: `/Users/kevin/Cloud/Dropbox/work/ai/agentpipe-web/docs/design-system-summary.md`
- Types: `/Users/kevin/Cloud/Dropbox/work/ai/agentpipe-web/app/types/index.ts`

---

### AgentPipe Team: Start Here

**Your First Task: Bridge Component**

1. **Create bridge package:**
   ```bash
   # In AgentPipe repo
   mkdir -p pkg/bridge
   touch pkg/bridge/bridge.go
   touch pkg/bridge/bridge_test.go
   ```

2. **Implement HTTP bridge:**
   ```go
   // pkg/bridge/bridge.go
   package bridge

   import (
       "bytes"
       "encoding/json"
       "net/http"
       "time"
   )

   type BridgeConfig struct {
       Enabled bool   `yaml:"enabled"`
       URL     string `yaml:"url"`
       Token   string `yaml:"token"`
   }

   type Event struct {
       Type      string      `json:"type"`
       Timestamp time.Time   `json:"timestamp"`
       Data      interface{} `json:"data"`
   }

   type Bridge struct {
       config     BridgeConfig
       httpClient *http.Client
   }

   func NewBridge(config BridgeConfig) *Bridge {
       return &Bridge{
           config: config,
           httpClient: &http.Client{
               Timeout: 10 * time.Second,
           },
       }
   }

   func (b *Bridge) EmitEvent(event Event) error {
       if !b.config.Enabled {
           return nil
       }

       payload, err := json.Marshal(event)
       if err != nil {
           return err
       }

       req, err := http.NewRequest(
           "POST",
           b.config.URL,
           bytes.NewBuffer(payload),
       )
       if err != nil {
           return err
       }

       req.Header.Set("Content-Type", "application/json")
       req.Header.Set("Authorization", "Bearer "+b.config.Token)

       resp, err := b.httpClient.Do(req)
       if err != nil {
           return err
       }
       defer resp.Body.Close()

       if resp.StatusCode != 200 {
           return fmt.Errorf("bridge returned status %d", resp.StatusCode)
       }

       return nil
   }
   ```

3. **Integrate with orchestrator:**
   ```go
   // In orchestrator.go
   func (o *Orchestrator) Run(ctx context.Context) error {
       // Emit conversation started
       o.bridge.EmitEvent(bridge.Event{
           Type:      "conversation.started",
           Timestamp: time.Now(),
           Data: map[string]interface{}{
               "conversationId": o.conversationID,
               "mode":          o.config.Mode,
               "participants":  o.getParticipants(),
           },
       })

       // ... existing orchestration logic ...

       // Emit message for each agent response
       o.bridge.EmitEvent(bridge.Event{
           Type:      "message.created",
           Timestamp: time.Now(),
           Data: map[string]interface{}{
               "conversationId": o.conversationID,
               "message":        message,
           },
       })

       // ... rest of orchestration ...
   }
   ```

4. **Add config support:**
   ```yaml
   # config.yaml
   bridge:
     enabled: true
     url: http://localhost:3000/api/ingest
     token: your-api-key-here
   ```

5. **Next tasks:**
   - Add retry logic
   - Add all event types
   - Integration testing with AgentPipe Web

**Reference:**
- Event schema: `/Users/kevin/Cloud/Dropbox/work/ai/agentpipe-web/docs/agentpipe-integration.md`
- Existing orchestrator: Check AgentPipe repo
- API endpoint: `/Users/kevin/Cloud/Dropbox/work/ai/agentpipe-web/app/api/ingest/route.ts`

---

## Essential Files to Review

### Backend Engineers

1. **Database Schema:**
   ```bash
   cat /Users/kevin/Cloud/Dropbox/work/ai/agentpipe-web/prisma/schema.prisma
   ```
   - Understand Conversation, Message, ConversationAgent models
   - Note indexes and relationships

2. **Existing Ingest API:**
   ```bash
   cat /Users/kevin/Cloud/Dropbox/work/ai/agentpipe-web/app/api/ingest/route.ts
   ```
   - See how events are currently processed
   - Understand validation and storage logic

3. **Type Definitions:**
   ```bash
   cat /Users/kevin/Cloud/Dropbox/work/ai/agentpipe-web/app/types/index.ts
   ```
   - All TypeScript interfaces
   - Event types and enums

4. **Sample Log Files:**
   ```bash
   ls -la ~/.agentpipe/chats/
   cat ~/.agentpipe/chats/chat_*.log | head -50
   ```
   - Understand log file format
   - See real examples

### Frontend Engineers

1. **Existing Components:**
   ```bash
   ls -la /Users/kevin/Cloud/Dropbox/work/ai/agentpipe-web/app/components/
   ```
   - Badge, Button, Card components
   - Agent avatars and badges
   - Status indicators

2. **Design System:**
   ```bash
   cat /Users/kevin/Cloud/Dropbox/work/ai/agentpipe-web/docs/design-system-summary.md
   ```
   - Color schemes for agents
   - Typography and spacing
   - Component patterns

3. **Tailwind Config:**
   ```bash
   cat /Users/kevin/Cloud/Dropbox/work/ai/agentpipe-web/tailwind.config.ts
   ```
   - Theme tokens
   - Custom colors
   - Breakpoints

### AgentPipe Team

1. **Event Schema:**
   ```bash
   cat /Users/kevin/Cloud/Dropbox/work/ai/agentpipe-web/docs/agentpipe-integration.md
   ```
   - Complete bridge specification
   - All event types and payloads
   - Configuration examples

2. **Ingest Endpoint:**
   ```bash
   cat /Users/kevin/Cloud/Dropbox/work/ai/agentpipe-web/app/api/ingest/route.ts
   ```
   - Expected request format
   - Authentication requirements
   - Error responses

---

## Testing Your Work

### Backend: Test Upload API

1. **Create test file:**
   ```bash
   cp ~/.agentpipe/chats/chat_2025-09-11_18-00-33.log /tmp/test.log
   ```

2. **Test upload:**
   ```bash
   curl -X POST http://localhost:3000/api/upload \
     -H "Authorization: Bearer test-key" \
     -F "file=@/tmp/test.log"
   ```

3. **Verify in database:**
   ```bash
   npx prisma studio
   # Check conversations and messages tables
   ```

### Frontend: Test Dashboard

1. **Start dev server:**
   ```bash
   npm run dev
   ```

2. **Send mock event:**
   ```bash
   curl -X POST http://localhost:3000/api/ingest \
     -H "Authorization: Bearer test-key" \
     -H "Content-Type: application/json" \
     -d '{
       "type": "conversation.started",
       "timestamp": "2025-10-20T15:00:00Z",
       "data": {
         "conversationId": "test-123",
         "mode": "round-robin",
         "participants": [
           {"agentName": "Alice", "agentType": "claude"},
           {"agentName": "Bob", "agentType": "gpt"}
         ]
       }
     }'
   ```

3. **Check dashboard:**
   - Open http://localhost:3000
   - Should see conversation appear
   - Check SSE connection status

### AgentPipe: Test Bridge

1. **Add bridge config:**
   ```yaml
   # ~/.agentpipe/config.yaml
   bridge:
     enabled: true
     url: http://localhost:3000/api/ingest
     token: test-key
   ```

2. **Run conversation:**
   ```bash
   agentpipe run --config ~/.agentpipe/config.yaml
   ```

3. **Verify in web UI:**
   - Open http://localhost:3000
   - Should see conversation streaming live
   - Check messages appear in real-time

---

## Common Issues

### Issue: "CORS error when testing"

**Solution:**
```typescript
// app/api/ingest/route.ts
export async function OPTIONS(request: Request) {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
```

### Issue: "SSE connection keeps dropping"

**Solution:**
```typescript
// app/hooks/useSSE.ts
// Add reconnection logic:
useEffect(() => {
  let reconnectTimer: NodeJS.Timeout;

  const connect = () => {
    const eventSource = new EventSource(url);

    eventSource.onerror = () => {
      eventSource.close();
      reconnectTimer = setTimeout(connect, 5000); // Retry after 5s
    };

    return eventSource;
  };

  const eventSource = connect();

  return () => {
    clearTimeout(reconnectTimer);
    eventSource.close();
  };
}, [url]);
```

### Issue: "Log parser fails on certain files"

**Solution:**
```typescript
// Add robust error handling:
export async function parseLogFile(content: string): Promise<ParsedConversation> {
  try {
    // Validate header
    if (!content.includes('=== AgentPipe Chat Log ===')) {
      throw new Error('Invalid log file: Missing header');
    }

    // Parse with try/catch around each section
    const messages = [];
    const lines = content.split('\n');

    for (const line of lines) {
      try {
        const match = line.match(/\[(\d{2}:\d{2}:\d{2})\] (\w+) \((\w+)\): (.+)/);
        if (match) {
          messages.push({
            timestamp: parseTime(match[1]),
            agentName: match[2],
            role: match[3],
            content: match[4],
          });
        }
      } catch (e) {
        console.warn('Failed to parse line:', line, e);
        // Continue parsing other lines
      }
    }

    return { messages, /* ... */ };
  } catch (e) {
    throw new Error(`Failed to parse log file: ${e.message}`);
  }
}
```

---

## Getting Help

### Read the Docs

- **Full PRD:** `/Users/kevin/Cloud/Dropbox/work/ai/agentpipe-web/docs/prd-session-integration.md`
- **Summary:** `/Users/kevin/Cloud/Dropbox/work/ai/agentpipe-web/docs/prd-session-integration-summary.md`
- **Roadmap:** `/Users/kevin/Cloud/Dropbox/work/ai/agentpipe-web/docs/implementation-roadmap.md`
- **Architecture:** `/Users/kevin/Cloud/Dropbox/work/ai/agentpipe-web/docs/architecture.md`
- **Bridge Spec:** `/Users/kevin/Cloud/Dropbox/work/ai/agentpipe-web/docs/agentpipe-integration.md`

### Ask Questions

- Slack channel: #agentpipe-web
- Daily standup: 10am
- Product owner: [Email]

---

## Next Steps

### Today (Day 1)

**Backend:**
- [ ] Review log file format
- [ ] Start log parser
- [ ] Write first test

**Frontend:**
- [ ] Review design system
- [ ] Set up component folders
- [ ] Create ConversationCard component

**AgentPipe:**
- [ ] Review event schema
- [ ] Create bridge package
- [ ] Implement basic HTTP POST

### This Week (Days 1-5)

**Backend:**
- [ ] Complete log parser
- [ ] Build upload API
- [ ] Start API key endpoints

**Frontend:**
- [ ] Build dashboard components
- [ ] Connect to SSE
- [ ] Create upload UI mockup

**AgentPipe:**
- [ ] Complete bridge component
- [ ] Integrate with orchestrator
- [ ] Test with local web instance

### Next Week (Days 6-10)

**Backend:**
- [ ] Complete API key management
- [ ] Integration testing
- [ ] Performance optimization

**Frontend:**
- [ ] Complete dashboard
- [ ] Build upload UI
- [ ] Start search UI

**AgentPipe:**
- [ ] Add retry logic
- [ ] Add all event types
- [ ] Write documentation

---

## Quick Reference

### Important Paths

```bash
# Backend
/Users/kevin/Cloud/Dropbox/work/ai/agentpipe-web/app/api/
/Users/kevin/Cloud/Dropbox/work/ai/agentpipe-web/app/lib/
/Users/kevin/Cloud/Dropbox/work/ai/agentpipe-web/prisma/

# Frontend
/Users/kevin/Cloud/Dropbox/work/ai/agentpipe-web/app/components/
/Users/kevin/Cloud/Dropbox/work/ai/agentpipe-web/app/hooks/
/Users/kevin/Cloud/Dropbox/work/ai/agentpipe-web/app/types/

# Docs
/Users/kevin/Cloud/Dropbox/work/ai/agentpipe-web/docs/

# Sample Data
~/.agentpipe/chats/
```

### Useful Commands

```bash
# Development
npm run dev                    # Start dev server
npx prisma studio             # View database
npx prisma migrate dev        # Run migrations

# Testing
npm test                       # Run tests
npm run test:watch            # Watch mode

# Database
npx prisma generate           # Generate Prisma client
npx prisma db push            # Sync schema to DB

# Linting
npm run lint                   # Run ESLint
npm run lint:fix              # Fix auto-fixable issues
```

---

**Ready to code? Pick your track and start building!** 🚀

Questions? See the full PRD or ask in #agentpipe-web Slack channel.
