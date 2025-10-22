# Migration Guide

## v0.0.2 - Adding Conversation Summary Fields

### Issue
The production database doesn't have the new summary columns that were added in v0.0.2.

### Migration Created
A migration file has been created at:
```
prisma/migrations/20251022150000_add_conversation_summary/migration.sql
```

This migration adds 10 new columns to the `conversations` table:
- `summaryText` (TEXT) - AI-generated summary text
- `summaryAgentType` (TEXT) - Type of agent that generated summary
- `summaryModel` (TEXT) - AI model used for summary
- `summaryInputTokens` (INTEGER) - Input tokens used
- `summaryOutputTokens` (INTEGER) - Output tokens used
- `summaryTotalTokens` (INTEGER) - Total tokens used
- `summaryCost` (DOUBLE PRECISION) - Cost of summary generation
- `summaryDuration` (INTEGER) - Time taken to generate summary (ms)
- `summaryGeneratedAt` (TIMESTAMP) - When summary was generated
- `summaryData` (JSONB) - Full summary JSON object

### Deployment

The migration has been deployed to production via Vercel. The build process automatically runs:
```bash
prisma migrate deploy
```

### Manual Deployment (if needed)

If you need to run the migration manually:

#### Option 1: Via Vercel CLI
```bash
vercel --prod
```

The build script includes `prisma migrate deploy` which will automatically apply pending migrations.

#### Option 2: Direct Database Migration
If you have direct access to the production database:

```bash
# Set your production DATABASE_URL
export DATABASE_URL="postgresql://..."

# Run migrations
npx prisma migrate deploy
```

#### Option 3: Via Migration Script
Use the interactive migration script:

```bash
npm run migrate
# Select option 2: Deploy migrations (production)
```

### Verification

To verify the migration was successful:

1. **Check Prisma Migration Status**:
   ```bash
   npx prisma migrate status
   ```

2. **Check Database Schema**:
   Connect to your database and verify the columns exist:
   ```sql
   SELECT column_name, data_type
   FROM information_schema.columns
   WHERE table_name = 'conversations'
   AND column_name LIKE 'summary%';
   ```

3. **Test the API**:
   Send a `conversation.completed` event with a summary to the ingest endpoint:
   ```bash
   curl -X POST https://your-app.vercel.app/api/ingest \
     -H "Authorization: Bearer YOUR_API_KEY" \
     -H "Content-Type: application/json" \
     -d '{
       "type": "conversation.completed",
       "timestamp": "2025-10-22T16:00:00Z",
       "data": {
         "conversation_id": "test-123",
         "status": "completed",
         "summary": {
           "text": "Test summary",
           "agent_type": "gemini",
           "model": "gemini-2.0-flash",
           "input_tokens": 100,
           "output_tokens": 50,
           "total_tokens": 150,
           "cost": 0.001,
           "duration_ms": 1000
         }
       }
     }'
   ```

### Rollback (if needed)

If you need to rollback this migration:

```sql
ALTER TABLE "conversations" DROP COLUMN IF EXISTS "summaryText";
ALTER TABLE "conversations" DROP COLUMN IF EXISTS "summaryAgentType";
ALTER TABLE "conversations" DROP COLUMN IF EXISTS "summaryModel";
ALTER TABLE "conversations" DROP COLUMN IF EXISTS "summaryInputTokens";
ALTER TABLE "conversations" DROP COLUMN IF EXISTS "summaryOutputTokens";
ALTER TABLE "conversations" DROP COLUMN IF EXISTS "summaryTotalTokens";
ALTER TABLE "conversations" DROP COLUMN IF EXISTS "summaryCost";
ALTER TABLE "conversations" DROP COLUMN IF EXISTS "summaryDuration";
ALTER TABLE "conversations" DROP COLUMN IF EXISTS "summaryGeneratedAt";
ALTER TABLE "conversations" DROP COLUMN IF EXISTS "summaryData";
```

### Troubleshooting

**Error: "The column conversations.summaryText does not exist"**
- The migration hasn't been applied to the production database yet
- Run `npx prisma migrate deploy` or redeploy the application

**Error: "Drift detected"**
- This happens when the database schema doesn't match the migration history
- Run `npx prisma migrate resolve --applied 20251022150000_add_conversation_summary` to mark the migration as applied

**Error: Migration already applied**
- The migration has already been successfully applied
- No action needed

### Related Files

- Migration: `prisma/migrations/20251022150000_add_conversation_summary/migration.sql`
- Schema: `prisma/schema.prisma` (lines 59-69)
- Ingest API: `app/api/ingest/route.ts` (lines 174-186)
- Types: `app/types/index.ts` (lines 31-40, 82-92)
- Validation: `app/lib/schemas/streaming.ts` (lines 64-74, 88)

### Status

- ✅ Migration file created
- ✅ Migration committed to repository
- ✅ Migration pushed to GitHub
- ✅ Deployed to Vercel production
- ⏳ Waiting for build to complete

The migration will be automatically applied during the next build on Vercel.
