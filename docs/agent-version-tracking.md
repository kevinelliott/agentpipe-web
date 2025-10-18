# Agent and Model Version Tracking

## Overview

AgentPipe Web tracks three distinct pieces of version information:

1. **Agent Type**: The category of agent (e.g., `claude`, `amp`, `gemini`, `gpt`)
2. **Agent Version**: The software version of the agent client itself (e.g., `1.2.0`, `0.5.0`)
3. **Model**: The AI model being used by the agent (e.g., `claude-sonnet-4`, `gpt-4-turbo`, `gemini-pro-1.5`)

### Key Distinction

- **Agent** = The client software/implementation (has its own version)
- **Model** = The AI model called by the agent (separate versioning)

### Examples

| Agent Type | Agent Version | Model Used |
|------------|---------------|------------|
| `amp` | `1.2.0` | `claude-sonnet-4` |
| `amp` | `1.2.0` | `claude-opus-4` |
| `claude` | `0.5.0` | `claude-sonnet-4` |
| `gemini` | `2.1` | `gemini-pro-1.5` |
| `gpt` | `1.0.0` | `gpt-4-turbo` |

**Note**: A single agent (like `amp`) can use multiple different models.

This enables:
- Filtering conversations by specific model versions
- Analyzing performance differences between model versions
- Cost tracking per model version
- Understanding which models were used in historical conversations

## Database Schema

### Fields for Version Tracking

**Message Model:**
```prisma
model Message {
  // ...
  agentType     String   // Agent type: "claude", "gemini", "gpt", "amp", etc.
  agentVersion  String?  // Agent software version: "1.2.0", "0.5.0", etc.
  model         String?  // AI model: "claude-sonnet-4", "gpt-4-turbo", "gemini-pro-1.5", etc.
  // ...

  @@index([model])  // Indexed for efficient filtering by model
}
```

**ConversationAgent Model:**
```prisma
model ConversationAgent {
  // ...
  agentType     String   // Agent type: "claude", "gemini", "gpt", "amp", etc.
  agentVersion  String?  // Agent software version: "1.2.0", "0.5.0", etc.
  model         String?  // AI model: "claude-sonnet-4", "gpt-4-turbo", "gemini-pro-1.5", etc.
  // ...

  @@index([model])         // Indexed for filtering by model
  @@index([agentVersion])  // Indexed for filtering by agent version
}
```

## Model Naming Conventions

### Standard Format

`{provider}-{model-family}-{version}`

### Examples

**Claude (Anthropic):**
- `claude-opus-4`
- `claude-sonnet-4`
- `claude-sonnet-3.5`
- `claude-haiku-3`

**GPT (OpenAI):**
- `gpt-4-turbo`
- `gpt-4`
- `gpt-3.5-turbo`
- `gpt-4o`
- `gpt-4o-mini`

**Gemini (Google):**
- `gemini-pro-1.5`
- `gemini-pro`
- `gemini-ultra`

**Other Models:**
- `qwen-max`
- `qwen-turbo`
- `amp-v1` (if applicable)

## API Usage

### Filtering by Model Version

**Get conversations with specific model:**
```bash
GET /api/conversations?model=claude-sonnet-4
```

**Search conversations by multiple models:**
```bash
POST /api/search
{
  "filters": {
    "models": ["claude-sonnet-4", "gpt-4-turbo"]
  }
}
```

**Get available models:**
```bash
GET /api/search?type=models
```

Response:
```json
{
  "models": [
    {
      "model": "claude-sonnet-4",
      "count": 45
    },
    {
      "model": "gpt-4-turbo",
      "count": 32
    },
    {
      "model": "gemini-pro-1.5",
      "count": 18
    }
  ]
}
```

### Getting Model-Specific Metrics

**Metrics by model:**
```bash
GET /api/metrics/by-model
```

Response:
```json
{
  "models": [
    {
      "model": "claude-sonnet-4",
      "conversations": 45,
      "totalMessages": 1234,
      "totalTokens": 567890,
      "totalCost": 23.45,
      "avgCostPerMessage": 0.019
    },
    {
      "model": "gpt-4-turbo",
      "conversations": 32,
      "totalMessages": 890,
      "totalTokens": 345678,
      "totalCost": 15.67,
      "avgCostPerMessage": 0.018
    }
  ]
}
```

## UI Display

### In Conversation Cards

```
┌────────────────────────────────────────┐
│ Debugging AI agent errors             │
│ 3 participants • 24 messages           │
│ Amp v1.2 (Sonnet 4) • Claude v0.5     │
│ (Opus 4) • Gemini v2.1 (Pro 1.5)      │
│ $0.45 • 12.5k tokens                   │
└────────────────────────────────────────┘
```

### In Message Timeline

```
● Amp v1.2.0                     [Expand ▾]
  Model: claude-sonnet-4 • 2 minutes ago
─────────────────────────────────────────
Message content...
─────────────────────────────────────────
320 in • 450 out • 770 total • $0.021
```

### In Filter Panel

```
Models
☑ Claude Sonnet 4      (45)
☑ GPT-4 Turbo          (32)
☐ Gemini Pro 1.5       (18)
☐ Claude Opus 4        (12)
☐ GPT-4o               (8)
```

## AgentPipe Integration

### Required Data in Events

**conversation.started event:**
```json
{
  "type": "conversation.started",
  "data": {
    "participants": [
      {
        "agentId": "amp-1",
        "agentType": "amp",
        "agentName": "Amp",
        "agentVersion": "1.2.0",        // ← Agent software version
        "model": "claude-sonnet-4"      // ← AI model being used
      },
      {
        "agentId": "claude-1",
        "agentType": "claude",
        "agentName": "Claude CLI",
        "agentVersion": "0.5.0",        // ← Agent software version
        "model": "claude-opus-4"        // ← AI model being used
      }
    ]
  }
}
```

**message.created event:**
```json
{
  "type": "message.created",
  "data": {
    "message": {
      "agentId": "amp-1",
      "agentType": "amp",
      "agentName": "Amp",
      "agentVersion": "1.2.0",  // ← Agent software version
      "content": "...",
      "metrics": {
        "model": "claude-sonnet-4",  // ← AI model used for this message
        "duration": 3200,
        "inputTokens": 150,
        "outputTokens": 320,
        "totalTokens": 470,
        "cost": 0.0021
      }
    }
  }
}
```

### AgentPipe Configuration

Ensure each agent config specifies the model version:

```yaml
agents:
  - id: amp-1
    type: amp
    name: Amp
    version: 1.2.0                # ← Agent software version
    model: claude-sonnet-4        # ← AI model to use
    # ...

  - id: amp-2
    type: amp
    name: Amp (Opus)
    version: 1.2.0                # ← Same agent version
    model: claude-opus-4          # ← Different AI model
    # ...

  - id: claude-1
    type: claude
    name: Claude CLI
    version: 0.5.0                # ← Agent software version
    model: claude-sonnet-4        # ← AI model to use
    # ...

  - id: gemini-1
    type: gemini
    name: Gemini
    version: 2.1                  # ← Agent software version
    model: gemini-pro-1.5         # ← AI model to use
    # ...
```

## Analytics & Reporting

### Cost by Model Version

Track which model versions are most cost-effective:

```sql
SELECT
  model,
  COUNT(DISTINCT conversation_id) as conversations,
  SUM(total_tokens) as total_tokens,
  SUM(cost) as total_cost,
  AVG(cost) as avg_cost_per_message,
  AVG(total_tokens) as avg_tokens_per_message
FROM messages
WHERE model IS NOT NULL
GROUP BY model
ORDER BY total_cost DESC;
```

### Performance by Model Version

Analyze response times by model:

```sql
SELECT
  model,
  COUNT(*) as messages,
  AVG(duration) as avg_duration_ms,
  PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY duration) as median_duration_ms,
  PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY duration) as p95_duration_ms
FROM messages
WHERE model IS NOT NULL AND duration IS NOT NULL
GROUP BY model
ORDER BY avg_duration_ms;
```

### Model Version Adoption Over Time

Track which models are being used when:

```sql
SELECT
  DATE(timestamp) as date,
  model,
  COUNT(*) as message_count
FROM messages
WHERE model IS NOT NULL
GROUP BY DATE(timestamp), model
ORDER BY date DESC, message_count DESC;
```

## Best Practices

### 1. Always Include Model Version

Every message and conversation participant should include the model version. This is critical for:
- Cost attribution
- Performance analysis
- Debugging model-specific issues
- Historical comparison

### 2. Use Consistent Naming

Follow the naming convention: `{provider}-{family}-{version}`

**Good:**
- `claude-sonnet-4`
- `gpt-4-turbo`
- `gemini-pro-1.5`

**Avoid:**
- `claude` (too generic)
- `sonnet` (missing provider)
- `claude-sonnet` (missing version)
- `ClaudeSonnet4` (inconsistent format)

### 3. Track Version Changes

If an agent switches models mid-conversation (rare but possible), ensure each message reflects the actual model used:

```json
{
  "conversationId": "conv_123",
  "messages": [
    {
      "agentType": "claude",
      "model": "claude-sonnet-3.5",  // Started with 3.5
      "content": "..."
    },
    {
      "agentType": "claude",
      "model": "claude-sonnet-4",  // Switched to 4
      "content": "..."
    }
  ]
}
```

### 4. Null Handling

If the model version is unknown or not applicable:
- Store as `NULL` in database (not empty string)
- Display as "Unknown" or omit from UI
- Filter as "Any model" in search

### 5. Update Model Mappings

Maintain a mapping of model versions to display names:

```typescript
export const modelDisplayNames: Record<string, string> = {
  'claude-sonnet-4': 'Claude Sonnet 4',
  'claude-opus-4': 'Claude Opus 4',
  'gpt-4-turbo': 'GPT-4 Turbo',
  'gpt-4o': 'GPT-4o',
  'gemini-pro-1.5': 'Gemini Pro 1.5',
  // ... add new models as they're released
};
```

## Migration Guide

If you have existing conversations without model versions:

### 1. Add Migration

```sql
-- Add model column with index (already in schema)
ALTER TABLE messages ADD COLUMN IF NOT EXISTS model VARCHAR(255);
CREATE INDEX IF NOT EXISTS idx_messages_model ON messages(model);

-- Backfill from agent configuration if available
UPDATE messages m
SET model = ca.model
FROM conversation_agents ca
WHERE m.conversation_id = ca.conversation_id
  AND m.agent_id = ca.agent_id
  AND m.model IS NULL
  AND ca.model IS NOT NULL;
```

### 2. Update Existing Data

If you have historical data, try to infer model versions from:
- Agent configuration at the time
- Metadata fields
- External logs

### 3. Mark Legacy Data

For conversations where the model version cannot be determined:
- Leave as `NULL`
- Add a flag in metadata: `{ "model_version_unknown": true }`
- Display as "Unknown model" in UI

## Future Enhancements

### Model Version Comparison

Add UI to compare performance between model versions:
- Side-by-side cost comparison
- Response time histograms
- Quality metrics (if available)

### Model Recommendation

Based on historical data, recommend optimal model for specific use cases:
- Cheapest for simple tasks
- Fastest for time-sensitive tasks
- Best quality for complex reasoning

### Version Alerts

Alert when using deprecated or outdated model versions:
- "claude-sonnet-3 is deprecated, consider upgrading to claude-sonnet-4"
- Cost warnings: "This model is more expensive than alternatives"

## Related Documentation

- [architecture.md](architecture.md) - Overall system design
- [agentpipe-integration.md](agentpipe-integration.md) - Bridge implementation
- [Database Schema](../prisma/schema.prisma) - Complete Prisma schema

## Support

For questions about agent version tracking:
1. Check this documentation
2. Review example events in `agentpipe-integration.md`
3. Examine the API routes for model filtering
4. Open an issue on GitHub
