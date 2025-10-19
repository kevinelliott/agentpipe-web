# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AgentPipe Web is a Next.js 15 application that serves as both a marketing website and realtime dashboard for AgentPipe - a multi-agent AI orchestration platform. It displays live conversations between multiple AI agents (Claude, GPT-4, Gemini, etc.) and provides historical search and analytics.

**Key Characteristics:**
- Privacy-first: Opt-in data collection model - never collects API keys, config files, or sensitive data
- Realtime monitoring via Server-Sent Events (SSE), not WebSocket
- Can spawn and manage AgentPipe Docker containers
- Tracks token costs, performance metrics, and agent/model versions

## Development Workflow

**IMPORTANT: All changes must pass quality checks before committing or merging:**

### Required Checks
Before any code change is considered complete, the following must pass:

1. **Linting**: Code must pass ESLint checks
   ```bash
   make lint
   npm run lint
   ```

2. **Type Checking**: TypeScript must compile without errors
   ```bash
   npx tsc --noEmit
   ```

3. **Build**: Production build must succeed
   ```bash
   make build
   npm run build
   ```

4. **Tests**: All tests must pass (when test suite exists)
   ```bash
   npm test
   ```

### CI Pipeline
The CI pipeline (`.github/workflows/ci.yml`) automatically runs all these checks on:
- Every pull request
- Every push to `main` or `develop` branches

**Pull requests cannot be merged if CI checks fail.**

### Quick Check All
Run all CI checks locally before pushing:
```bash
make ci-test  # Runs: install + lint + build
```

## Common Commands

### Development
```bash
make dev              # Start development server (npm run dev)
make build            # Build for production
make install          # Install dependencies (npm ci)
make lint             # Run ESLint
```

### Database Operations
```bash
make db-generate      # Generate Prisma client
make db-migrate       # Run database migrations
make db-push          # Push schema to database (development)
make db-studio        # Open Prisma Studio GUI
make db-reset         # Reset database (WARNING: deletes all data)
```

### Docker
```bash
make up               # Start all services (docker-compose up -d)
make down             # Stop all services
make logs             # View logs (docker-compose logs -f)
make docker-build     # Build Docker image
make shell            # Open shell in web container
make db-shell         # Open PostgreSQL shell
```

### Testing & Quality
```bash
make ci-test          # Run all CI checks (install + lint + build)
npx tsc --noEmit      # Type check without building
```

## Architecture

### Tech Stack
- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS v4
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: PostgreSQL 16 (via Supabase or self-hosted)
- **Realtime**: Server-Sent Events (SSE)
- **Containerization**: Docker with multi-stage builds

### Directory Structure
```
app/
├── api/                    # API Route Handlers
│   ├── conversations/      # CRUD operations for conversations
│   ├── ingest/            # Webhook for AgentPipe bridge events
│   ├── metrics/           # Analytics aggregation
│   ├── realtime/          # SSE streaming endpoints
│   └── search/            # Full-text search
├── components/            # React components (organized by category)
│   ├── ui/               # Base components (Button, Card, Input, etc.)
│   ├── agent/            # Agent-specific components with color theming
│   ├── conversation/     # Conversation cards and lists
│   ├── metrics/          # Analytics displays
│   ├── status/           # Indicators, skeletons, empty states
│   ├── theme/            # Dark/light mode system
│   ├── layout/           # Header, Footer
│   └── marketing/        # Landing page components
├── lib/                   # Business logic
│   ├── prisma.ts         # Database client singleton
│   ├── docker.ts         # Docker container orchestration
│   ├── eventManager.ts   # In-memory pub/sub for SSE
│   └── supabase.ts       # Supabase client factories
├── types/                 # TypeScript definitions
├── dashboard/            # Dashboard page
├── conversations/new/    # Create conversation form
└── globals.css           # Design system with 50+ CSS variables

prisma/
└── schema.prisma         # Database schema (4 core models)
```

### Database Schema

**4 Core Models:**

1. **Conversation**: Multi-agent session with status, metrics, Docker container tracking
2. **Message**: Individual agent responses with tokens, cost, duration
3. **ConversationAgent**: Participant configuration (many-to-many bridge)
4. **Event**: System events and error logging

**Key Pattern**: Denormalized aggregates (`totalTokens`, `totalCost`, etc.) stored in Conversation for fast queries.

### Data Flow

**Inbound (AgentPipe → Dashboard):**
```
AgentPipe Instance
  ↓ POST /api/ingest (Bearer token auth)
EventManager (broadcasts to SSE clients)
  ↓
Prisma (persists to PostgreSQL)
```

**Outbound (Dashboard → User):**
```
Browser
  ↓ GET /api/realtime/stream
ReadableStream (SSE with 30s heartbeats)
  ↓
eventManager.subscribe()
  ↓
Live updates as SSE data frames
```

**Container Spawning:**
```
User creates conversation
  ↓ POST /api/conversations
app/lib/docker.ts spawns container
  ↓
Docker CLI: docker run kevinelliott/agentpipe:latest
  ↓
Container ID stored in Conversation.containerId
```

## Critical Implementation Details

### Prisma Client Singleton Pattern
```typescript
// app/lib/prisma.ts - Prevents connection pool exhaustion
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };
export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
```

Always import from `@/app/lib/prisma`, never create new PrismaClient instances.

### Event Manager for SSE Broadcasting
```typescript
// app/lib/eventManager.ts
// Decouples SSE clients from database operations
eventManager.subscribe(listener)              // Global events
eventManager.subscribeToConversation(id, listener)  // Conversation-specific
eventManager.emit(event)                     // Broadcast to subscribers
```

Used in `/api/ingest` to broadcast database writes to all connected SSE clients.

### Agent Color System
Each agent type has dedicated CSS variables in `app/globals.css`:
- `--agent-claude`, `--agent-claude-bg`, `--agent-claude-border`, etc.
- `--agent-gpt`, `--agent-gemini`, `--agent-amp`, `--agent-o1`, `--agent-default`
- Status colors: `--status-active`, `--status-completed`, `--status-error`, etc.

Components use Tailwind classes like `bg-agent-claude` or `text-status-active`.

### Tailwind CSS v4 Configuration
Uses `@tailwindcss/postcss` v4 - configuration is in CSS, not JavaScript:
```css
/* app/globals.css */
@import "tailwindcss";

@theme {
  --color-agent-claude: var(--agent-claude);
  /* ... maps to Tailwind utilities */
}
```

**No `tailwind.config.ts` needed** - it's intentionally absent.

### Docker Container Management
`app/lib/docker.ts` provides functions to:
- `spawnAgentPipeContainer()` - Spawns container with CLI args
- `getContainerStatus()` - Checks if container is running
- `stopContainer()` - Stops a container
- `getContainerLogs()` - Retrieves container logs

The Docker socket must be mounted in docker-compose.yaml:
```yaml
volumes:
  - /var/run/docker.sock:/var/run/docker.sock
```

### API Authentication
- **Bridge Webhook**: Bearer token via `AGENTPIPE_BRIDGE_API_KEY` env var
- **Future User Auth**: Supabase client prepared but not yet implemented

### Environment Variables
Required for production (see `.env.example`):
```bash
DATABASE_URL=postgresql://postgres:postgres@db:5432/agentpipe
AGENTPIPE_BRIDGE_API_KEY=your_secure_key
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://your-domain.com
```

Optional (if using Supabase):
```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

## Working with Components

### Component Organization
Components are **exported centrally** from `app/components/index.ts`:
```typescript
// Good
import { Button, Card, AgentAvatar } from '@/app/components';

// Avoid
import { Button } from '@/app/components/ui/Button';
```

### Agent Components
Use `AgentAvatar` and `AgentBadge` with proper typing:
```typescript
import { AgentAvatar } from '@/app/components';

<AgentAvatar
  agent="claude"  // Type: AgentType from @/app/types
  size="md"       // 'sm' | 'md' | 'lg'
/>
```

### Theme System
Theme toggling is handled by `ThemeProvider` and `ThemeToggle`:
```typescript
// app/layout.tsx wraps everything in ThemeProvider
// Individual components use ThemeToggle button
import { useTheme } from '@/app/components/theme/ThemeProvider';
const { theme, toggleTheme } = useTheme();
```

## API Route Patterns

### Standard Response Format
```typescript
// Success
return NextResponse.json({ data: result }, { status: 200 });

// Error
return NextResponse.json(
  { error: 'Error message', details: errorDetails },
  { status: 500 }
);
```

### Pagination Pattern
```typescript
const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20')));
const skip = (page - 1) * limit;

const [data, total] = await Promise.all([
  prisma.model.findMany({ skip, take: limit }),
  prisma.model.count()
]);

return NextResponse.json({
  data,
  pagination: { page, limit, total, pages: Math.ceil(total / limit) }
});
```

### SSE Stream Pattern
```typescript
// app/api/realtime/stream/route.ts
const stream = new ReadableStream({
  start(controller) {
    const listener = (event) => {
      controller.enqueue(`data: ${JSON.stringify(event)}\n\n`);
    };
    eventManager.subscribe(listener);

    // Heartbeat to keep connection alive
    const heartbeat = setInterval(() => {
      controller.enqueue(': heartbeat\n\n');
    }, 30000);
  }
});

return new Response(stream, {
  headers: {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
  }
});
```

## Database Migrations

### Creating Migrations
```bash
# Development
npx prisma migrate dev --name describe_your_change

# Production
npx prisma migrate deploy
```

### Schema Changes
1. Edit `prisma/schema.prisma`
2. Run `npx prisma migrate dev --name your_change`
3. Prisma generates migration SQL in `prisma/migrations/`
4. Generated TypeScript types update automatically
5. Commit both schema and migration files

### Accessing Generated Types
```typescript
import { Conversation, ConversationStatus } from '@prisma/client';
import { prisma } from '@/app/lib/prisma';

const conversation: Conversation = await prisma.conversation.findUnique({
  where: { id },
  include: { participants: true, messages: true }
});
```

## Testing & CI/CD

### GitHub Workflows
- **CI** (`.github/workflows/ci.yml`): Runs on PRs and pushes
  - Lint, type check, build, test, security audit
- **Docker Build** (`.github/workflows/docker-build.yml`): Multi-arch images
  - Builds for linux/amd64 and linux/arm64
  - Pushes to Docker Hub on main branch
- **Release** (`.github/workflows/release.yml`): Triggered on version tags
  - Creates GitHub release with changelog
  - Builds and publishes Docker images
  - Updates Docker Hub description

### Creating Releases
```bash
make release VERSION=1.2.3
# This creates git tag v1.2.3 and pushes it
# GitHub Actions handles the rest
```

## Documentation

Key documentation files in `docs/`:
- `architecture.md` - Complete system design
- `docker.md` - Docker setup and troubleshooting
- `agentpipe-integration.md` - Bridge implementation guide
- `project-summary.md` - Current status and roadmap

## Troubleshooting

### Build Errors
```bash
# Clean and rebuild
make clean
make install
make build
```

### Database Connection Issues
```bash
# Check if database is running
docker-compose ps db

# View database logs
docker-compose logs db

# Reset database (WARNING: deletes all data)
make db-reset
```

### Prisma Client Issues
```bash
# Regenerate Prisma client
make db-generate

# If types are out of sync
rm -rf node_modules/.prisma
npx prisma generate
```

### Docker Socket Permission Errors
If container spawning fails with permission errors:
```bash
# On Linux, add user to docker group
sudo usermod -aG docker $USER
newgrp docker

# Verify
docker ps
```

## Next.js-Specific Notes

### Server vs Client Components
- **Server Components** (default): Can access database, environment variables
- **Client Components** (with `'use client'`): Can use hooks, browser APIs

Most components in `app/components/` are client components because they use `useState`, `useEffect`, etc.

### Route Handlers
API routes in `app/api/` are Server Components by default - they can:
- Access Prisma directly
- Read environment variables
- Execute Node.js code (like Docker CLI)

### Dynamic Routes
```
app/api/conversations/[id]/route.ts
app/api/conversations/[id]/messages/route.ts
```

Access params via:
```typescript
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;
}
```

### Standalone Build Mode
`next.config.ts` has `output: 'standalone'` - this creates a minimal production build in `.next/standalone/` for Docker deployment.

## Design System

The design system is defined entirely in CSS variables (`app/globals.css`):
- **Colors**: Agent-specific, semantic, and status colors
- **Spacing**: Standard spacing scale
- **Typography**: Font sizes and weights
- **Transitions**: Animation durations (--duration-fast, --duration-base, --duration-slow)
- **Shadows**: Elevation system

All Tailwind utilities automatically map to these variables via `@theme` directive.

## Code Style

- **Imports**: Use path alias `@/app/*` instead of relative paths
- **TypeScript**: Strict mode enabled - no implicit `any`
- **Components**: Export from category index files
- **API Routes**: Return NextResponse.json() consistently
- **Async/Await**: Prefer over promises.then()
- **Error Handling**: Always wrap Prisma operations in try/catch

## Support

For questions or issues:
- Check `docs/` for architecture details
- Review API routes in `app/api/` for implementation patterns
- See Makefile for available commands
- Refer to AgentPipe repo: https://github.com/kevinelliott/agentpipe
