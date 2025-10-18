# AgentPipe

The official website and dashboard for AgentPipe at [agentpipe.ai](https://agentpipe.ai) - a multi-agent AI orchestration platform.

This Next.js 15+ application serves as both the main website introducing AgentPipe and a realtime dashboard for displaying multi-agent conversations from [AgentPipe](https://github.com/kevinelliott/agentpipe) installations.

## Features

- **Marketing Hero**: Beautiful landing page introducing AgentPipe with GitHub CTA
- **Realtime Dashboard**: View active multi-agent conversations as they happen
- **Historical Search**: Search and filter through past conversations
- **Metrics & Analytics**: Track token usage, costs, and agent performance
- **API Documentation**: Well-documented REST and WebSocket APIs
- **AgentPipe Integration**: Seamless opt-in integration with local AgentPipe installations
- **Design System**: Comprehensive design system with agent-specific colors and components

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: PostgreSQL (Supabase)
- **Realtime**: WebSocket / Server-Sent Events
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 20+
- npm or yarn
- PostgreSQL database (or Supabase account)
- AgentPipe installed and configured

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd agentpipe-web
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` and add your configuration:
- Supabase credentials
- Database URL
- AgentPipe bridge API key

4. Set up the database:
```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev --name init
```

5. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
agentpipe-web/
├── app/
│   ├── api/             # API routes
│   ├── components/      # React components
│   ├── lib/            # Utility libraries (Prisma, Supabase)
│   ├── types/          # TypeScript type definitions
│   ├── layout.tsx      # Root layout
│   ├── page.tsx        # Home page (realtime dashboard)
│   └── globals.css     # Global styles
├── docs/               # Documentation
│   ├── ARCHITECTURE.md
│   ├── AGENTPIPE_INTEGRATION.md
│   ├── AGENT_VERSION_TRACKING.md
│   └── PROJECT_SUMMARY.md
├── prisma/
│   └── schema.prisma   # Database schema
├── public/             # Static assets
└── package.json
```

## Database Schema

The application uses Prisma with PostgreSQL and includes the following models:

- **Conversation**: Metadata and configuration for multi-agent conversations
- **Message**: Individual messages from agents with metrics
- **ConversationAgent**: Participant information for each conversation
- **Event**: System events and error tracking

See `prisma/schema.prisma` for the complete schema.

## API Documentation

### REST API

- `GET /api/conversations` - List conversations with filters
- `GET /api/conversations/:id` - Get conversation details
- `POST /api/search` - Search conversations and messages
- `GET /api/metrics/summary` - Get aggregate metrics

### WebSocket API

Connect to `/api/realtime/ws` for live updates:

- `conversation.started` - New conversation started
- `message.created` - New message in conversation
- `conversation.completed` - Conversation finished

See `docs/architecture.md` for complete API documentation.

## AgentPipe Integration

**⚠️ Privacy First**: AgentPipe Web operates on an **opt-in model**. No data is collected unless you explicitly enable the bridge feature in your AgentPipe configuration.

To enable realtime data delivery from AgentPipe:

1. Build and configure the bridge component in AgentPipe (see `docs/agentpipe-integration.md`)
2. Set the bridge URL to point to your AgentPipe Web instance
3. Configure authentication with the API key

What's shared: Conversation metadata, messages, performance metrics
What's NOT shared: Config files, API keys, file system data, analytics (when disabled)

See `docs/opt-in-design.md` for complete privacy information.

## Development

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint

# Generate Prisma client
npx prisma generate

# Create a new migration
npx prisma migrate dev --name <migration-name>

# Open Prisma Studio (database GUI)
npx prisma studio
```

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import the project in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### Docker

The easiest way to run AgentPipe Web is using Docker Compose:

```bash
# Start all services (web app + database)
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
```

See [docker.md](docs/docker.md) for complete Docker setup and usage guide.

## Contributing

Contributions are welcome! Please read the contributing guidelines before submitting PRs.

## License

[Your License]

## Documentation

- [Architecture Guide](docs/architecture.md) - Complete system architecture and design
- [AgentPipe Integration](docs/agentpipe-integration.md) - Bridge implementation guide
- [Agent Version Tracking](docs/agent-version-tracking.md) - How agent and model versions are tracked
- [Project Summary](docs/project-summary.md) - Current status and next steps

## Links

- [AgentPipe GitHub](https://github.com/kevinelliott/agentpipe)
- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Supabase Documentation](https://supabase.com/docs)
