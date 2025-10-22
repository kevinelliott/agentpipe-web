# AgentPipe Web - Production Deployment Guide

This guide covers deploying AgentPipe Web to production hosting platforms.

## Prerequisites

- Supabase database set up (see [SUPABASE_SETUP.md](./SUPABASE_SETUP.md))
- Your code pushed to GitHub/GitLab
- Production API key generated

## Platform-Specific Guides

### Vercel (Recommended)

Vercel provides excellent Next.js support with zero configuration.

#### 1. Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy from your project directory
vercel

# Follow the prompts:
# - Link to existing project or create new
# - Select your framework preset (Next.js)
# - Deploy
```

Or use the Vercel Dashboard:
1. Go to [vercel.com](https://vercel.com)
2. Import your Git repository
3. Vercel auto-detects Next.js settings
4. Configure environment variables (see below)
5. Deploy

#### 2. Configure Environment Variables

In Vercel Dashboard → Settings → Environment Variables, add:

```bash
# Database (from Supabase)
DATABASE_URL=postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true
DIRECT_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres

# AgentPipe
AGENTPIPE_BRIDGE_API_KEY=ap_live_YOUR_SECURE_KEY

# Application
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://your-app.vercel.app
```

#### 3. Run Database Migration

After the first deployment, you need to run migrations:

```bash
# Set your production DATABASE_URL locally
export DIRECT_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"

# Run migration
npx prisma migrate deploy

# Or use db push for quick setup
npx prisma db push
```

**Tip**: You can also run migrations in Vercel by adding a `postbuild` script in `package.json`:

```json
{
  "scripts": {
    "postbuild": "prisma migrate deploy"
  }
}
```

### Netlify

#### 1. Deploy to Netlify

```bash
# Install Netlify CLI
npm i -g netlify-cli

# Deploy
netlify deploy --prod

# Or use Netlify Dashboard to import from Git
```

#### 2. Configure Environment Variables

In Netlify Dashboard → Site settings → Environment variables:

```bash
DATABASE_URL=postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true
DIRECT_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
AGENTPIPE_BRIDGE_API_KEY=ap_live_YOUR_SECURE_KEY
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://your-app.netlify.app
```

#### 3. Configure Build Settings

Netlify → Site settings → Build & deploy:

```
Build command: npm run build
Publish directory: .next
```

Add to `netlify.toml`:

```toml
[build]
  command = "npx prisma generate && npm run build"
  publish = ".next"

[[plugins]]
  package = "@netlify/plugin-nextjs"
```

### Railway

Railway provides easy deployment with built-in PostgreSQL.

#### 1. Create Railway Project

1. Go to [railway.app](https://railway.app)
2. Create new project
3. Connect your GitHub repository
4. Railway auto-detects Next.js

#### 2. Add PostgreSQL Database

1. In your Railway project, click "New"
2. Select "Database" → "PostgreSQL"
3. Railway creates a database and sets `DATABASE_URL` automatically

#### 3. Configure Additional Variables

```bash
AGENTPIPE_BRIDGE_API_KEY=ap_live_YOUR_SECURE_KEY
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://your-app.up.railway.app
```

#### 4. Run Migrations

Railway automatically runs migrations if you add this to `package.json`:

```json
{
  "scripts": {
    "build": "prisma generate && prisma migrate deploy && next build"
  }
}
```

### Docker Deployment

Deploy using Docker Compose (great for VPS/self-hosted):

#### 1. Update docker-compose.yml

Create `docker-compose.prod.yml`:

```yaml
version: '3.8'

services:
  web:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://postgres:${DB_PASSWORD}@db:5432/agentpipe
      - DIRECT_URL=postgresql://postgres:${DB_PASSWORD}@db:5432/agentpipe
      - AGENTPIPE_BRIDGE_API_KEY=${AGENTPIPE_API_KEY}
      - NODE_ENV=production
    depends_on:
      - db
    restart: unless-stopped

  db:
    image: postgres:16-alpine
    environment:
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=${DB_PASSWORD}
      - POSTGRES_DB=agentpipe
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

volumes:
  postgres_data:
```

#### 2. Create .env.prod

```bash
DB_PASSWORD=your_secure_db_password
AGENTPIPE_API_KEY=ap_live_YOUR_SECURE_KEY
```

#### 3. Deploy

```bash
# Build and start
docker-compose -f docker-compose.prod.yml --env-file .env.prod up -d

# Run migrations
docker-compose -f docker-compose.prod.yml exec web npx prisma migrate deploy
```

## Post-Deployment Checklist

After deploying to any platform:

- [ ] Database migrations applied successfully
- [ ] All tables created in database (check Supabase dashboard)
- [ ] Environment variables set correctly
- [ ] App builds without errors
- [ ] Homepage loads successfully
- [ ] API routes respond (test `/api/conversations`)
- [ ] Webhook endpoint accessible at `/api/ingest`
- [ ] SSE streaming works (`/api/stream`)
- [ ] HTTPS enabled (required for SSE)
- [ ] CORS configured if needed
- [ ] Monitoring/logging set up

## Testing Your Deployment

### 1. Test Basic Functionality

```bash
# Test homepage
curl https://your-app.com

# Test API health
curl https://your-app.com/api/conversations

# Test webhook endpoint (should return 401 without auth)
curl https://your-app.com/api/ingest
```

### 2. Test AgentPipe Integration

```bash
# Test bridge connection from AgentPipe CLI
agentpipe bridge test \
  --webhook-url https://your-app.com/api/ingest \
  --api-key ap_live_YOUR_SECURE_KEY
```

### 3. Test Real-Time Streaming

1. Open `https://your-app.com/debug` in browser
2. Check SSE connection status (should show "Connected")
3. Run an AgentPipe conversation with streaming enabled
4. Events should appear in the debug panel in real-time

## Environment Variables Reference

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection (pooled) | `postgresql://...` |
| `DIRECT_URL` | PostgreSQL direct connection | `postgresql://...` |
| `AGENTPIPE_BRIDGE_API_KEY` | API key for webhook auth | `ap_live_...` |
| `NODE_ENV` | Environment mode | `production` |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Public API URL | Auto-detected |
| `AGENTPIPE_BINARY_PATH` | Path to CLI | `agentpipe` |
| `AGENTPIPE_TIMEOUT_MS` | Command timeout | `60000` |

## Monitoring and Logging

### Vercel

- **Logs**: Vercel Dashboard → Deployments → View Function Logs
- **Monitoring**: Built-in analytics and Web Vitals

### Netlify

- **Logs**: Netlify Dashboard → Deploys → Function logs
- **Monitoring**: Third-party services (Sentry, LogRocket)

### Railway

- **Logs**: Railway Dashboard → Logs tab
- **Metrics**: CPU, memory, network usage

### Self-Hosted

Set up logging and monitoring:

```bash
# Using PM2 for process management
npm i -g pm2
pm2 start npm --name "agentpipe-web" -- start
pm2 logs agentpipe-web
pm2 monit
```

## Troubleshooting

### Database Connection Issues

**Error**: "Can't reach database server"

```bash
# Test connection
psql "postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"

# Check environment variables
echo $DATABASE_URL
echo $DIRECT_URL
```

### Build Failures

**Error**: "Prisma schema not found"

```bash
# Ensure prisma is in dependencies (not devDependencies)
npm install prisma @prisma/client

# Add to build command
prisma generate && npm run build
```

### Migration Failures

**Error**: "Too many connections"

```bash
# Use DIRECT_URL (port 5432, not 6543)
DIRECT_URL="postgresql://..." npx prisma migrate deploy
```

### SSE Not Working

**Error**: "EventSource failed"

- Ensure HTTPS is enabled (SSE requires secure connection)
- Check CORS settings if frontend/backend on different domains
- Verify `/api/stream` route is accessible

## Scaling Considerations

### Database

- **Free tier**: Good for development, ~500 MB storage
- **Pro tier**: Recommended for production, dedicated resources
- **Connection pooling**: Already configured with `?pgbouncer=true`

### Application

- **Vercel**: Auto-scales serverless functions
- **Railway**: Manual scaling in dashboard
- **Docker**: Use load balancer + multiple containers

### Monitoring

Track these metrics:
- Database connection pool usage
- API response times
- SSE connection count
- Memory/CPU usage

## Security Checklist

- [ ] Use `ap_live_*` API keys in production (not `ap_test_*`)
- [ ] Store secrets in environment variables (never commit)
- [ ] Enable HTTPS on all endpoints
- [ ] Rotate API keys periodically
- [ ] Set up database backups (Supabase auto-backups daily)
- [ ] Enable rate limiting on webhook endpoint
- [ ] Review Supabase RLS policies
- [ ] Set up monitoring and alerts

## Backup and Recovery

### Database Backups

Supabase automatically backs up your database:
- **Free tier**: Daily backups, 7-day retention
- **Pro tier**: Daily backups, custom retention

Manual backup:

```bash
# Export database
pg_dump "postgresql://..." > backup.sql

# Restore database
psql "postgresql://..." < backup.sql
```

### Application Code

- Keep Git repository up to date
- Tag releases: `git tag v1.0.0 && git push --tags`
- Document deployment procedures

## Additional Resources

- [Next.js Deployment Docs](https://nextjs.org/docs/deployment)
- [Supabase Platform Guides](https://supabase.com/docs/guides/platform)
- [Prisma Production Best Practices](https://www.prisma.io/docs/guides/deployment/deployment-guides)
