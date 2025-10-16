# AgentPipe Web

A Next.js 15+ application for displaying realtime and historical multi-agent conversations from [AgentPipe](https://github.com/kevinelliott/agentpipe).

## Features

- **Realtime Dashboard**: View active multi-agent conversations as they happen
- **Historical Search**: Search and filter through past conversations
- **Metrics & Analytics**: Track token usage, costs, and agent performance
- **API Documentation**: Well-documented REST and WebSocket APIs
- **AgentPipe Integration**: Seamless integration with AgentPipe via bridge component

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
├── prisma/
│   └── schema.prisma   # Database schema
├── public/             # Static assets
├── ARCHITECTURE.md     # Detailed architecture documentation
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

See `ARCHITECTURE.md` for complete API documentation.

## AgentPipe Integration

To enable realtime data delivery from AgentPipe:

1. Build and configure the bridge component in AgentPipe (see `ARCHITECTURE.md`)
2. Set the bridge URL to point to your AgentPipe Web instance
3. Configure authentication with the API key

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

```bash
# Build image
docker build -t agentpipe-web .

# Run container
docker run -p 3000:3000 --env-file .env agentpipe-web
```

## Contributing

Contributions are welcome! Please read the contributing guidelines before submitting PRs.

## License

[Your License]

## Links

- [AgentPipe GitHub](https://github.com/kevinelliott/agentpipe)
- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Supabase Documentation](https://supabase.com/docs)
