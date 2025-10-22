# PgBouncer Prepared Statement Error Fix

## The Problem

When using Supabase's connection pooling (PgBouncer on port 6543), you may encounter this error:

```
Error occurred during query execution:
ConnectorError(ConnectorError {
  kind: QueryError(PostgresError {
    code: "42P05",
    message: "prepared statement \"s8\" already exists"
  })
})
```

## Why This Happens

1. **PgBouncer** reuses PostgreSQL connections across different clients
2. **Prisma** creates prepared statements for queries
3. When a connection is reused, Prisma tries to create a prepared statement that already exists
4. PostgreSQL throws an error

## The Solution

Add `connection_limit=1` to your `DATABASE_URL` to force Prisma to use a single connection.

### For Vercel (Production)

Update your **DATABASE_URL** environment variable in Vercel:

**Before:**
```
postgresql://postgres.PROJECT-REF:PASSWORD@aws-0-region.pooler.supabase.com:6543/postgres?pgbouncer=true
```

**After:**
```
postgresql://postgres.PROJECT-REF:PASSWORD@aws-0-region.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1
```

### Steps to Fix

1. Go to **Vercel Dashboard** → Your Project → **Settings** → **Environment Variables**

2. Edit `DATABASE_URL` and add `&connection_limit=1` at the end:
   ```
   postgresql://postgres.pfciaeqjmnhlvshismqt:PASSWORD@aws-0-region.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1
   ```

3. **Redeploy** your application:
   ```bash
   # Via CLI
   vercel --prod

   # Or in Vercel Dashboard
   # Deployments → ... → Redeploy
   ```

### For Local .env

If testing production database locally:

```bash
DATABASE_URL="postgresql://postgres.pfciaeqjmnhlvshismqt:PASSWORD@aws-0-region.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"
DIRECT_URL="postgresql://postgres:PASSWORD@db.pfciaeqjmnhlvshismqt.supabase.co:5432/postgres"
```

## Alternative Solutions

### Option 1: Use Transaction Pooling Instead

Supabase offers two pooling modes:

- **Transaction mode** (port 6543) - Current setup, has prepared statement issues
- **Session mode** (port 5432) - Direct connection, no pooling issues

If you're not getting high traffic, you can use session mode for `DATABASE_URL`:

```bash
# Use session mode for both (no pooling)
DATABASE_URL="postgresql://postgres:PASSWORD@db.pfciaeqjmnhlvshismqt.supabase.co:5432/postgres"
DIRECT_URL="postgresql://postgres:PASSWORD@db.pfciaeqjmnhlvshismqt.supabase.co:5432/postgres"
```

**Pros**: No prepared statement errors
**Cons**: Fewer concurrent connections (300 max on free tier)

### Option 2: Upgrade to Supabase Pro

Supabase Pro tier has better connection pooling and can handle more concurrent connections, reducing the likelihood of this error.

## Verify It's Fixed

After updating and redeploying, test your app:

1. Visit your production URL
2. Navigate to a session detail page
3. Check Vercel logs - should see no more `42P05` errors

## Performance Impact

Adding `connection_limit=1` means:
- ✅ **Fixes** prepared statement errors
- ✅ **Stable** database connections
- ⚠️ **May reduce** connection pool benefits
- ⚠️ **Still handles** serverless well (each function instance gets 1 connection)

For most Next.js serverless deployments on Vercel, this is fine because:
- Each serverless function is isolated
- Vercel scales by creating more function instances
- Each instance gets its own database connection

## Additional Resources

- [Prisma Connection Pooling](https://www.prisma.io/docs/guides/performance-and-optimization/connection-management)
- [Supabase Connection Pooling](https://supabase.com/docs/guides/database/connecting-to-postgres#connection-pooler)
- [PgBouncer Documentation](https://www.pgbouncer.org/config.html)
