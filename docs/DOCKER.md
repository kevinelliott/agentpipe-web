# Docker Setup Guide

This guide explains how to run AgentPipe Web using Docker and Docker Compose.

## Prerequisites

- Docker (version 20.10 or later)
- Docker Compose (version 2.0 or later)

## Quick Start

### 1. Set up environment variables

Copy the example environment file:

```bash
cp .env.example .env
```

Edit `.env` and update any necessary values. For local Docker development, the defaults should work fine.

### 2. Start the services

```bash
docker-compose up -d
```

This will:
- Start a PostgreSQL database container
- Build and start the Next.js application container
- Run database migrations automatically
- Expose the application on http://localhost:3000

### 3. View logs

```bash
# View all logs
docker-compose logs -f

# View only web app logs
docker-compose logs -f web

# View only database logs
docker-compose logs -f db
```

### 4. Stop the services

```bash
docker-compose down
```

To stop and remove volumes (this will delete all data):

```bash
docker-compose down -v
```

## Development Workflow

### Rebuilding the application

If you make changes to the code:

```bash
docker-compose up -d --build web
```

### Running database migrations

```bash
docker-compose exec web npx prisma migrate dev
```

### Accessing the database

```bash
docker-compose exec db psql -U postgres -d agentpipe
```

Or use a database client with these connection details:
- Host: localhost
- Port: 5432
- Database: agentpipe
- Username: postgres
- Password: postgres

### Running Prisma Studio

```bash
docker-compose exec web npx prisma studio
```

Then visit http://localhost:5555

## Architecture

### Services

1. **db** (PostgreSQL 16)
   - Stores conversation data, messages, and events
   - Data persisted in Docker volume `postgres_data`
   - Health checks ensure database is ready before starting web app

2. **web** (Next.js Application)
   - Runs the AgentPipe Web interface
   - Has access to Docker socket for spawning AgentPipe containers
   - Automatically runs migrations on startup

### Volumes

- `postgres_data`: Persistent storage for PostgreSQL data

### Networking

- All services run on the same Docker network
- The web app connects to the database using the service name `db`
- The Docker socket is mounted to allow spawning AgentPipe containers

## Spawning AgentPipe Containers

The web application can spawn AgentPipe containers via the mounted Docker socket. When you create a new conversation:

1. The web app creates a database record
2. It executes `docker run` to spawn an AgentPipe container
3. The container is labeled with the conversation ID
4. The container runs in detached mode and auto-removes when stopped

### Requirements

For AgentPipe containers to work:
1. The `agentpipe/agentpipe:latest` image must be available
2. Any required API keys should be passed as environment variables
3. The containers need network access to AI provider APIs

## Production Considerations

### Security

1. Change database password in production:
   ```yaml
   environment:
     POSTGRES_PASSWORD: <strong-password>
   ```

2. Set strong API keys in `.env`:
   ```
   AGENTPIPE_BRIDGE_API_KEY=<your-secure-key>
   ```

3. Consider using Docker secrets for sensitive data

### Performance

1. Increase database resources if handling many conversations:
   ```yaml
   deploy:
     resources:
       limits:
         cpus: '2'
         memory: 4G
   ```

2. Use a reverse proxy (nginx, traefik) for SSL/TLS termination

3. Set up database backups:
   ```bash
   docker-compose exec db pg_dump -U postgres agentpipe > backup.sql
   ```

### Monitoring

1. Add health checks:
   ```bash
   docker-compose ps
   ```

2. Monitor container logs:
   ```bash
   docker-compose logs --tail=100 -f
   ```

3. Check resource usage:
   ```bash
   docker stats
   ```

## Troubleshooting

### Database connection errors

If the web app can't connect to the database:

```bash
# Check if database is healthy
docker-compose ps db

# View database logs
docker-compose logs db

# Restart the database
docker-compose restart db
```

### Docker socket permission issues

If you get permission errors when spawning AgentPipe containers:

```bash
# On Linux, add the nextjs user to the docker group
# This may require modifying the Dockerfile
```

### Port conflicts

If port 3000 or 5432 is already in use:

```yaml
# Change in docker-compose.yaml
ports:
  - "3001:3000"  # Map to different host port
```

### Clean slate

To completely reset everything:

```bash
docker-compose down -v
docker-compose up -d --build
```

## Additional Commands

### Access web container shell

```bash
docker-compose exec web sh
```

### View running containers

```bash
docker ps
```

### View AgentPipe containers spawned by the app

```bash
docker ps --filter "label=agentpipe.conversation.id"
```

### Stop all AgentPipe containers

```bash
docker stop $(docker ps -q --filter "label=agentpipe.conversation.id")
```
