# AgentPipe Web

<div align="center">

[![Node.js Version](https://img.shields.io/badge/node-22.x-brightgreen?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Next.js](https://img.shields.io/badge/next.js-15.5+-black?logo=next.js&logoColor=white)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/typescript-5.9+-blue?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/react-19-61dafb?logo=react&logoColor=white)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/tailwind-4.1-38b2ac?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![PostgreSQL](https://img.shields.io/badge/postgresql-16-336791?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![CI Workflow](https://github.com/kevinelliott/agentpipe-web/actions/workflows/ci.yml/badge.svg)](https://github.com/kevinelliott/agentpipe-web/actions)
[![License: MIT](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

The official website and realtime dashboard for [AgentPipe](https://github.com/kevinelliott/agentpipe) - a multi-agent AI orchestration platform.

[Features](#features) • [Quick Start](#quick-start) • [Architecture](#architecture) • [Documentation](#documentation) • [Contributing](#contributing)

</div>

---

## About

AgentPipe Web is a **Next.js 15 + React 19 + TypeScript** application that serves as both the marketing website for AgentPipe and a **realtime dashboard** for monitoring multi-agent AI conversations. It provides live session monitoring, historical search, analytics, and seamless integration with local [AgentPipe CLI](https://github.com/kevinelliott/agentpipe) installations.

**Privacy-First Design**: Data collection is completely opt-in. AgentPipe Web never collects API keys, configuration files, or sensitive data without explicit user consent.

## Features

### 🎯 Dashboard & Realtime Monitoring
- **Live Conversations**: Real-time monitoring of multi-agent conversations using Server-Sent Events (SSE)
- **Conversation Cards**: View active sessions with agent participants, status badges, and message counts
- **View Modes**: Compact and expanded view modes for flexible UI layouts
- **WebSocket Status**: Visual indicator of real-time connection status

### 📊 Analytics & Metrics
- **Metrics Overview**: Total conversations, active agents, token usage, and cost tracking
- **Message Stream**: Real-time message feeds with agent identification and timestamps
- **Performance Metrics**: Track per-message tokens, costs, and processing duration
- **AI Summaries**: Automatic AI-generated conversation summaries with token/cost metadata
  - Full summary cards on detailed session pages
  - 2-line preview summaries on conversation lists
  - Graceful fallback to initial prompts when unavailable

### 🔍 Search & Filtering
- **Full-Text Search**: Search conversations by title, initial prompt, and agent names
- **Historical Sessions**: Browse and analyze past conversations with detailed metrics
- **Advanced Filtering**: Filter by status (active, completed, interrupted, error)

### 🎨 Design & UX
- **Modern Dark/Light Theme**: Comprehensive theme system with CSS variables and Tailwind CSS v4
- **Agent Showcase**: Dedicated `/agents` page discovering all 14 supported AI agents with metadata, statistics, and links
- **Agent-Specific Colors**: Visual theming for 14+ agent types (Claude, Codex, Copilot, Cursor, Factory, Gemini, Groq, Kimi, Crush, Qwen, Qoder, Amp, OpenCode, Ollama)
- **Improved Conversations**: Enhanced conversation cards showing prompt as title, agent avatars positioned on right, metrics in footer
- **Responsive Design**: Fully responsive layouts for desktop, tablet, and mobile
- **Component Library**: Reusable design system components with consistent styling
- **Agent Logos**: Professional SVG logos for all supported agents used throughout the application

### 🔗 Integration & APIs
- **AgentPipe CLI Integration**: Seamless opt-in bridge for local AgentPipe installations
- **REST API**: Fully documented API for conversations, messages, metrics, and search
- **Server-Sent Events (SSE)**: Efficient real-time streaming with 30-second heartbeats
- **Docker Support**: Multi-architecture Docker builds (linux/amd64, linux/arm64)

### ⚙️ Advanced Features
- **Settings Management**: Configurable application and per-user settings with validation
- **Event Tracking**: System event logging and error monitoring
- **Container Orchestration**: Docker container spawning and management for AgentPipe sessions
- **Prisma ORM**: Type-safe database operations with automatic migrations

## Tech Stack

| Layer | Technologies |
|-------|---------------|
| **Frontend** | Next.js 15, React 19, TypeScript 5.9, Tailwind CSS 4.1 |
| **Backend** | Next.js API Routes (Node.js 22), Prisma 6.18 ORM |
| **Database** | PostgreSQL 16 (Supabase or self-hosted) |
| **Realtime** | Server-Sent Events (SSE), EventSource API |
| **Containerization** | Docker (multi-arch: amd64, arm64), docker-compose |
| **Registry** | GitHub Container Registry (ghcr.io) |
| **Package Manager** | npm 10+ with package-lock.json |
| **Code Quality** | ESLint 9, TypeScript strict mode |
| **Deployment** | Docker, Vercel, Railway, self-hosted |

## Quick Start

### Prerequisites

- **Node.js 22.x** (or use `.nvmrc` with `nvm use`)
- **npm 10+** (comes with Node.js 22)
- **PostgreSQL 16+** (local, Docker, or Supabase cloud)
- **Git** for cloning the repository
- **Docker** (optional, for container deployment)

> ℹ️ This project requires **Node.js 22 LTS**. Previous versions are not supported due to Tailwind CSS v4 and Next.js 15 compatibility.

### Installation

#### 1️⃣ Clone the repository
```bash
git clone https://github.com/kevinelliott/agentpipe-web.git
cd agentpipe-web
```

#### 2️⃣ Set up Node.js version
```bash
# Using nvm (recommended)
nvm use  # Automatically uses Node.js 22 from .nvmrc

# Or manually
node --version  # Should be v22.x.x
```

#### 3️⃣ Install dependencies
```bash
npm ci  # Clean install (recommended for reproducibility)
# or
npm install
```

#### 4️⃣ Configure environment variables
```bash
cp .env.example .env
```

Edit `.env` and choose your database setup:

<details>
<summary><b>Option A: Local PostgreSQL (Development)</b></summary>

```bash
# Local PostgreSQL (default dev setup)
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/agentpipe
DIRECT_URL=postgresql://postgres:postgres@localhost:5432/agentpipe

# Generate a test API key for AgentPipe bridge
AGENTPIPE_BRIDGE_API_KEY=ap_test_$(node -e "console.log(require('crypto').randomBytes(24).toString('base64url'))")
```

Start PostgreSQL:
```bash
# macOS (Homebrew)
brew services start postgresql@16

# Ubuntu/Debian
sudo systemctl start postgresql

# Or with Docker
docker run -d --name postgres -e POSTGRES_PASSWORD=postgres -p 5432:5432 postgres:16
createdb -h localhost -U postgres agentpipe
```

</details>

<details>
<summary><b>Option B: Supabase (Production)</b></summary>

1. Create account at [supabase.com](https://supabase.com)
2. Create new project and get connection strings from Settings → Database
3. Configure `.env`:

```bash
# From Supabase project dashboard
DATABASE_URL=postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true
DIRECT_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres

# Generate a secure API key
AGENTPIPE_BRIDGE_API_KEY=ap_test_$(node -e "console.log(require('crypto').randomBytes(24).toString('base64url'))")
```

See [docs/SUPABASE_SETUP.md](docs/SUPABASE_SETUP.md) for complete setup.

</details>

#### 5️⃣ Set up the database
```bash
# Generate Prisma Client and run migrations
npm run db:generate     # Generate Prisma client
npm run db:migrate      # Run migrations interactively

# Or use the helper script
npm run migrate
```

#### 6️⃣ Start development server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Common Development Commands

```bash
# Development
npm run dev              # Start development server with hot reload

# Building & Deployment
npm run build            # Production build
npm start               # Start production server

# Code Quality
npm run lint            # ESLint checks
npx tsc --noEmit       # TypeScript type checking

# Database
npm run db:generate     # Generate Prisma Client
npm run db:migrate      # Interactive migration
npm run db:studio       # Open Prisma Studio (GUI)
npm run db:reset        # ⚠️ Reset database (deletes all data)

# Testing
npm test                # Run tests
```

See [Makefile](Makefile) for additional commands including Docker operations.

## Project Structure

```
agentpipe-web/
├── app/
│   ├── api/                      # API Route Handlers (Next.js server-side)
│   │   ├── conversations/        # Conversation CRUD endpoints
│   │   ├── messages/            # Message retrieval & search
│   │   ├── metrics/             # Analytics aggregation
│   │   ├── realtime/            # SSE streaming endpoint
│   │   ├── ingest/              # Webhook for AgentPipe bridge
│   │   ├── search/              # Full-text search
│   │   ├── settings/            # Application settings API
│   │   ├── agents/              # Agent information endpoints
│   │   └── debug/               # Debug and diagnostic endpoints
│   │
│   ├── components/              # React Components (organized by category)
│   │   ├── ui/                 # Base UI components (Button, Card, Input, Badge, etc.)
│   │   ├── agent/              # Agent components (Avatar, Badge, MessageBubble)
│   │   ├── conversation/       # Conversation cards and lists
│   │   ├── metrics/            # Analytics display components
│   │   ├── status/             # Status indicators, skeletons, empty states
│   │   ├── theme/              # Theme provider and toggler
│   │   ├── layout/             # Header, footer, navigation
│   │   └── marketing/          # Landing page components
│   │
│   ├── lib/                     # Business Logic & Utilities
│   │   ├── prisma.ts           # Prisma client singleton
│   │   ├── docker.ts           # Docker container management
│   │   ├── eventManager.ts     # In-memory pub/sub for SSE
│   │   ├── environment.ts      # Environment detection
│   │   ├── formatters.ts       # Data transformers
│   │   ├── agentMetadata.ts    # Agent configuration & metadata
│   │   ├── agentStats.ts       # Agent statistics aggregation service
│   │   └── settings.ts         # Settings service with validation
│   │
│   ├── types/                   # TypeScript definitions
│   │   ├── settings.ts         # Settings type definitions
│   │   └── index.ts            # Common types
│   │
│   ├── hooks/                   # Custom React hooks
│   │   ├── useRealtimeEvents.ts # SSE real-time event listener
│   │   ├── useDebounce.ts      # Debounce hook
│   │   └── useTheme.ts         # Theme context hook
│   │
│   ├── [pages]/               # Next.js page routes
│   │   ├── page.tsx           # Landing/dashboard (/)
│   │   ├── dashboard/         # Live conversations dashboard
│   │   ├── agents/            # Agent showcase page with metadata & statistics
│   │   ├── conversations/     # All conversations list & detail pages
│   │   ├── settings/          # Application settings page
│   │   ├── debug/             # Debug tools page
│   │   └── diagnostics/       # System diagnostics page
│   │
│   ├── layout.tsx              # Root layout with theme provider
│   ├── globals.css             # Global styles & design system
│   └── favicon.ico
│
├── prisma/
│   ├── schema.prisma           # Database schema (5 models)
│   └── migrations/             # Database migration history
│
├── .github/workflows/          # GitHub Actions CI/CD
│   ├── ci.yml                 # Lint, test, build checks
│   ├── docker-build.yml       # Multi-arch Docker image builds
│   └── release.yml            # Release automation
│
├── docs/                        # Project documentation
│   ├── ARCHITECTURE.md
│   ├── AGENTPIPE_INTEGRATION.md
│   ├── STREAMING_ARCHITECTURE.md
│   ├── REALTIME_DEBUGGING.md
│   ├── DEPLOYMENT.md
│   └── ...
│
├── public/                      # Static assets (images, fonts, logos, etc.)
│   ├── logos/                   # SVG logos for all 14 supported agents
├── .nvmrc                       # Node.js version (22.11.0)
├── Dockerfile                   # Multi-stage production Docker build
├── docker-compose.yml           # Local development environment
├── Makefile                     # Development command shortcuts
├── package.json                 # Dependencies & scripts
├── package-lock.json            # Locked dependency versions
├── tsconfig.json                # TypeScript configuration
├── eslint.config.mjs            # ESLint configuration (flat config)
├── next.config.ts               # Next.js configuration
├── tailwind.config.ts           # Tailwind CSS configuration
└── README.md
```

## Architecture

### Real-Time Data Flow (SSE)

```
AgentPipe CLI
    │
    ├─ HTTP POST /api/ingest (Bearer token)
    │
    ▼
EventManager (in-memory pub/sub)
    │
    ├─ Broadcasts to SSE subscribers
    │
    ├─ Persists to PostgreSQL (Prisma)
    │
    ▼
Browser SSE Client (GET /api/realtime/stream)
    │
    ▼
Dashboard Updates (Real-time event rendering)
```

### Database Schema

**5 Core Models:**

1. **Conversation** - Multi-agent session with status, metrics, container tracking
2. **Message** - Individual agent responses with tokens, cost, performance metrics
3. **ConversationAgent** - Participant configuration (many-to-many bridge)
4. **Event** - System events and error logging
5. **Setting** - Application and per-user configuration settings

### Key Architectural Patterns

- **Prisma Client Singleton**: Prevents connection pool exhaustion in serverless environments
- **Event Manager**: Decouples SSE clients from database writes for performance
- **Denormalized Aggregates**: Stores totals (tokens, cost, messages) in Conversation for fast queries
- **Server-Sent Events**: Efficient real-time streaming with 30-second heartbeats (no WebSocket required)
- **Docker Container Orchestration**: Can spawn and manage AgentPipe containers on demand

## Database Setup

### Local PostgreSQL

Install PostgreSQL locally:

```bash
# macOS (Homebrew)
brew install postgresql@16
brew services start postgresql@16

# Ubuntu/Debian
sudo apt-get install postgresql-16
sudo systemctl start postgresql

# Create database
createdb agentpipe
```

### Supabase (Production)

For production deployments, we recommend Supabase:

1. Create account at [supabase.com](https://supabase.com)
2. Create new project
3. Get connection strings from Settings → Database
4. Follow [docs/SUPABASE_SETUP.md](docs/SUPABASE_SETUP.md) for complete setup

### Database Schema

The application uses Prisma with PostgreSQL and includes:

- **Conversation**: Metadata and configuration for multi-agent conversations
- **Message**: Individual messages from agents with metrics
- **ConversationAgent**: Participant information for each conversation
- **Event**: System events and error tracking
- **Setting**: Application and user settings

See `prisma/schema.prisma` for the complete schema.

### Database Commands

```bash
# Interactive migration helper
npm run migrate

# Specific operations
npm run db:generate          # Generate Prisma Client
npm run db:push             # Push schema to database (quick)
npm run db:migrate          # Create migration (dev)
npm run db:migrate:deploy   # Deploy migrations (production)
npm run db:migrate:status   # Check migration status
npm run db:studio          # Open Prisma Studio (database GUI)
npm run db:reset           # Reset database (⚠️ deletes all data)
```

## API Documentation

### REST API Endpoints

#### Conversations
- `GET /api/conversations` - List conversations with pagination, filtering, sorting
- `GET /api/conversations/:id` - Get conversation details with participants and messages
- `POST /api/conversations` - Create new conversation (spawn AgentPipe container)
- `GET /api/conversations/:id/messages` - Get messages in conversation

#### Messages & Search
- `GET /api/messages/recent` - Get recent messages across all conversations
- `POST /api/search` - Full-text search conversations and messages
- `GET /api/search?q=query` - Query-based conversation search

#### Metrics & Analytics
- `GET /api/metrics/summary` - Get aggregate metrics (total conversations, agents, tokens, cost)

#### Settings
- `GET /api/settings` - Get application settings
- `POST /api/settings/:key` - Update a setting
- `POST /api/settings/validate` - Validate a setting value

#### Agents & System
- `GET /api/agents/available` - List available agent types
- `GET /api/agents/doctor` - System health check and diagnostics

### Real-Time API (Server-Sent Events)

Connect to `GET /api/realtime/stream` for live updates:

```javascript
const eventSource = new EventSource('/api/realtime/stream');

eventSource.addEventListener('conversation.started', (event) => {
  const data = JSON.parse(event.data);
  console.log('New conversation:', data);
});

eventSource.addEventListener('message.created', (event) => {
  const data = JSON.parse(event.data);
  console.log('New message:', data);
});

eventSource.addEventListener('conversation.completed', (event) => {
  const data = JSON.parse(event.data);
  console.log('Conversation completed:', data);
});
```

**Features:**
- No WebSocket required (uses standard HTTP with Server-Sent Events)
- Automatic reconnection on connection loss
- 30-second heartbeats to keep connection alive
- Per-conversation event filtering support

### Webhook API (AgentPipe Bridge)

`POST /api/ingest` - Receive real-time events from AgentPipe CLI

**Authentication:** Bearer token in `Authorization` header
```bash
curl -X POST http://localhost:3000/api/ingest \
  -H "Authorization: Bearer ap_test_xxxxx" \
  -H "Content-Type: application/json" \
  -d '{"type":"conversation.started","data":{...}}'
```

See [docs/AGENTPIPE_INTEGRATION.md](docs/AGENTPIPE_INTEGRATION.md) for complete webhook documentation.

## AgentPipe Integration

**⚠️ Privacy First**: AgentPipe Web operates on an **opt-in model**. No data is collected unless you explicitly enable the bridge feature in your AgentPipe configuration.

To enable realtime data delivery from AgentPipe:

1. Build and configure the bridge component in AgentPipe (see `docs/agentpipe-integration.md`)
2. Set the bridge URL to point to your AgentPipe Web instance
3. Configure authentication with the API key

What's shared: Conversation metadata, messages, performance metrics
What's NOT shared: Config files, API keys, file system data, analytics (when disabled)

See `docs/opt-in-design.md` for complete privacy information.

## Development Workflow

### Code Quality Gates

Before pushing code, ensure all checks pass:

```bash
# Run full CI pipeline locally
make ci-test

# Or run individually:
npm run lint           # ESLint checks (flat config)
npx tsc --noEmit      # TypeScript type checking
npm run build          # Full production build
npm test              # Run tests
```

All PRs require passing CI checks. The CI pipeline runs automatically on:
- Every pull request to `main` or `develop`
- Every push to `main` or `develop`
- Manual workflow dispatch

### Making Changes

1. **Create a feature branch:**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make changes and test locally:**
   ```bash
   npm run dev              # Development server with hot reload
   npm run lint             # Check for lint errors
   npx tsc --noEmit        # Check for type errors
   ```

3. **Commit with a clear message:**
   ```bash
   git add .
   git commit -m "Add feature: description of changes"
   ```

4. **Push and create a Pull Request:**
   ```bash
   git push origin feature/your-feature-name
   ```

### Database Migrations

When updating the Prisma schema:

```bash
# Create a new migration
npm run db:migrate -- --name describe_your_change

# This:
# - Creates migration SQL in prisma/migrations/
# - Applies migration to your local database
# - Regenerates Prisma Client types

# Deploy migrations in production
npm run db:migrate:deploy
```

## Deployment

### Docker (Recommended for Production)

The project includes a multi-stage Dockerfile optimized for production:

```bash
# Build Docker image (multi-arch: amd64, arm64)
docker build -t agentpipe-web:latest .

# Run container
docker run -d \
  -p 3000:3000 \
  -e DATABASE_URL="postgresql://..." \
  -e AGENTPIPE_BRIDGE_API_KEY="ap_test_..." \
  agentpipe-web:latest
```

**Docker Hub / GitHub Container Registry:**

Images are automatically built and published on version tags:

```bash
# GitHub Container Registry (ghcr.io)
docker pull ghcr.io/kevinelliott/agentpipe-web:latest
docker pull ghcr.io/kevinelliott/agentpipe-web:v0.0.13

# Multi-architecture support
# - linux/amd64 (Intel, AMD)
# - linux/arm64 (Apple Silicon, ARM servers)
```

### Vercel (For Next.js Hosting)

1. Connect your GitHub repository to Vercel
2. Vercel automatically detects Next.js and configures build settings
3. Set environment variables in Vercel dashboard:
   - `DATABASE_URL`
   - `DIRECT_URL`
   - `AGENTPIPE_BRIDGE_API_KEY`
4. Deploy on every push to `main`

```bash
# Or use Vercel CLI
npm i -g vercel
vercel
```

### Railway, Netlify, or Self-Hosted

See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for platform-specific deployment guides.

## Contributing

Contributions are welcome! Here's how to contribute:

1. **Report Issues**: Open an issue for bugs, feature requests, or questions
2. **Fork & Branch**: Create a feature branch from `develop`
3. **Code Standards**:
   - Follow the existing code style (ESLint enforces this)
   - Add types for new code (TypeScript strict mode)
   - Write clear commit messages
4. **Test Your Changes**:
   - Run `npm run lint` to check code quality
   - Run `npx tsc --noEmit` to check types
   - Run `npm run build` to verify production build works
5. **Open a Pull Request**: Submit PR against `develop` branch

All PRs must pass CI checks before merging.

## License

MIT License © 2024 Kevin Elliott

See [LICENSE](LICENSE) file for details.

## Documentation

### Quick References
- [Architecture](docs/ARCHITECTURE.md) - System design, data flow, and patterns
- [Realtime Streaming](docs/STREAMING_ARCHITECTURE.md) - SSE implementation details
- [AgentPipe Integration](docs/AGENTPIPE_INTEGRATION.md) - Bridge setup and webhook API
- [Realtime Debugging](docs/REALTIME_DEBUGGING.md) - Troubleshoot SSE connection issues
- [Deployment Guide](docs/DEPLOYMENT.md) - Deploy to various platforms
- [Supabase Setup](docs/SUPABASE_SETUP.md) - Production database setup

### External Resources
- [AgentPipe GitHub](https://github.com/kevinelliott/agentpipe) - Multi-agent AI orchestration CLI
- [Next.js Docs](https://nextjs.org/docs) - React framework
- [Prisma Docs](https://www.prisma.io/docs) - ORM & database toolkit
- [Tailwind CSS](https://tailwindcss.com/docs) - Utility-first CSS framework
- [PostgreSQL Docs](https://www.postgresql.org/docs/) - Database
- [Docker Docs](https://docs.docker.com/) - Containerization

## Support

### Getting Help
- 📖 Check the [docs](docs/) directory for detailed guides
- 🐛 Search existing [GitHub Issues](https://github.com/kevinelliott/agentpipe-web/issues)
- 💬 Ask questions in [GitHub Discussions](https://github.com/kevinelliott/agentpipe-web/discussions)
- 🔗 See [AgentPipe main repo](https://github.com/kevinelliott/agentpipe) for CLI support

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for version history and release notes.
