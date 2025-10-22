# Supabase Production Database Setup

This guide will help you set up Supabase as your production database for AgentPipe Web.

## Prerequisites

- A Supabase account ([sign up here](https://supabase.com))
- Node.js installed locally
- Prisma CLI (`npm install -g prisma` or use `npx prisma`)

## Step 1: Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com) and sign in
2. Click **"New Project"**
3. Fill in the project details:
   - **Name**: `agentpipe-web` (or your preferred name)
   - **Database Password**: Choose a strong password (SAVE THIS!)
   - **Region**: Select the region closest to your users
   - **Pricing Plan**: Free tier works for development/testing

4. Wait for the project to finish setting up (takes ~2 minutes)

## Step 2: Get Your Database Connection String

In your Supabase project dashboard:

1. Navigate to **Settings** → **Database**
2. Scroll down to **Connection String** section
3. Select the **URI** tab
4. You'll see a connection string like:
   ```
   postgresql://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres
   ```

5. **IMPORTANT**: Replace `[YOUR-PASSWORD]` with your actual database password from Step 1

### Connection String Format

Supabase provides two types of connection strings:

- **Session Mode** (Port 5432): Direct connection, better for migrations
  ```
  postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
  ```

- **Transaction Mode** (Port 6543): Connection pooling, better for serverless/production
  ```
  postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres
  ```

**For this setup, we'll use BOTH:**
- `DATABASE_URL`: Transaction mode (for the app)
- `DIRECT_URL`: Session mode (for migrations)

## Step 3: Configure Environment Variables

### Local Development (.env)

Create a `.env` file in your project root (copy from `.env.example`):

```bash
# Supabase Production Database
# Transaction mode (pooled connection for app runtime)
DATABASE_URL="postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true"

# Direct connection for migrations (session mode)
DIRECT_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"

# AgentPipe Bridge API Key
AGENTPIPE_BRIDGE_API_KEY="ap_live_YOUR_SECURE_KEY_HERE"

# Application Configuration
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://your-app-domain.com
```

**Replace the following:**
- `[PROJECT-REF]`: Your Supabase project reference (found in dashboard)
- `[PASSWORD]`: Your database password
- `YOUR_SECURE_KEY_HERE`: Generate with: `node -e "console.log('ap_live_' + require('crypto').randomBytes(24).toString('base64url'))"`
- `your-app-domain.com`: Your actual domain

### Production Deployment (Vercel/Netlify/etc.)

Add these environment variables in your hosting platform:

```
DATABASE_URL=postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true
DIRECT_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
AGENTPIPE_BRIDGE_API_KEY=ap_live_YOUR_SECURE_KEY_HERE
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://your-app-domain.com
```

## Step 4: Update Prisma Schema

Your Prisma schema already supports direct connections for migrations. Verify `prisma/schema.prisma` has:

```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}
```

If `directUrl` is missing, add it to enable migrations with connection pooling.

## Step 5: Run Database Migrations

### Option A: Push Schema (Quick Setup)

For quick setup without migration history:

```bash
npx prisma db push
```

This will:
- Create all tables in your Supabase database
- Sync your schema without creating migration files

### Option B: Create Migrations (Recommended for Production)

For proper migration tracking:

```bash
# Create the initial migration
npx prisma migrate dev --name init

# This will:
# 1. Create a migration file in prisma/migrations/
# 2. Apply it to your database
# 3. Generate Prisma Client
```

For production deployments:

```bash
npx prisma migrate deploy
```

## Step 6: Verify Database Setup

1. **Check in Supabase Dashboard:**
   - Go to **Table Editor** in your Supabase project
   - You should see tables: `conversations`, `messages`, `conversation_agents`, `events`, `settings`

2. **Test the Connection:**

```bash
npx prisma studio
```

This opens Prisma Studio where you can browse your database.

3. **Test from Your App:**

Start your development server:

```bash
npm run dev
```

Visit the dashboard and verify database connectivity.

## Step 7: Set Up Row Level Security (RLS) - Optional

For additional security, enable RLS in Supabase:

1. Go to **Authentication** → **Policies**
2. For each table, you can add policies
3. Since this app uses server-side API routes with service role, you might want to disable RLS or set up service role bypass

For now, you can disable RLS on all tables since authentication happens at the API layer:

```sql
-- Run this in Supabase SQL Editor
ALTER TABLE conversations DISABLE ROW LEVEL SECURITY;
ALTER TABLE messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_agents DISABLE ROW LEVEL SECURITY;
ALTER TABLE events DISABLE ROW LEVEL SECURITY;
ALTER TABLE settings DISABLE ROW LEVEL SECURITY;
```

## Common Issues

### Issue: Migration Fails with "prepared statement already exists"

**Solution**: Make sure you're using the direct connection URL (port 5432) for migrations:

```bash
DIRECT_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres" npx prisma migrate deploy
```

### Issue: "Too many connections"

**Solution**: Use the pooled connection (port 6543) for your app runtime, direct connection only for migrations.

### Issue: SSL Certificate Error

**Solution**: Add SSL mode to your connection string:

```
postgresql://...?sslmode=require
```

## Production Deployment Checklist

- [ ] Supabase project created and database password saved
- [ ] Environment variables set in hosting platform
- [ ] Migrations run successfully (`npx prisma migrate deploy`)
- [ ] Database tables visible in Supabase dashboard
- [ ] RLS configured or disabled as appropriate
- [ ] API key generated and secured
- [ ] Connection tested from deployed app

## Next Steps

1. **Set up backups**: Supabase automatically backs up your database
2. **Monitor usage**: Check your Supabase dashboard for usage stats
3. **Set up alerts**: Configure alerts for database errors in Supabase
4. **Scale if needed**: Upgrade to Pro plan if you exceed free tier limits

## Useful Commands

```bash
# Generate Prisma Client
npx prisma generate

# View database in browser
npx prisma studio

# Create new migration
npx prisma migrate dev --name migration_name

# Deploy migrations to production
npx prisma migrate deploy

# Reset database (CAREFUL! This deletes all data)
npx prisma migrate reset

# Push schema without migrations
npx prisma db push
```

## Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Prisma with Supabase Guide](https://www.prisma.io/docs/guides/database/supabase)
- [Prisma Connection Pooling](https://www.prisma.io/docs/guides/performance-and-optimization/connection-management)
