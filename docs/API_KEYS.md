# AgentPipe Bridge API Keys

## Overview

The AgentPipe bridge uses Bearer token authentication to secure the webhook endpoints:
- `/api/ingest` - Real-time streaming events
- `/api/sessions/upload` - Bulk session uploads

## Current Testing Key

For local development and testing, use this API key:

```
ap_test_ZPrbXZVeMrST9JlTp3-Ys8FvgUC3baLa
```

This key is already configured in `.env` and can be used immediately for testing.

## Key Format

AgentPipe API keys follow this format:

- **Testing/Development**: `ap_test_*` (e.g., `ap_test_ZPrbXZVeMrST9JlTp3-Ys8FvgUC3baLa`)
- **Production**: `ap_live_*` (e.g., `ap_live_k9j8h7g6f5d4s3a2w1q0p9o8i7u6y5t4`)

## Generating New Keys

### For Testing/Development

```bash
node -e "console.log('ap_test_' + require('crypto').randomBytes(24).toString('base64url'))"
```

### For Production

```bash
node -e "console.log('ap_live_' + require('crypto').randomBytes(32).toString('base64url'))"
```

## Configuration

### Local Development (.env)

```bash
AGENTPIPE_BRIDGE_API_KEY=ap_test_ZPrbXZVeMrST9JlTp3-Ys8FvgUC3baLa
```

### Production (Vercel/Railway/etc.)

Set the environment variable via your platform's dashboard or CLI:

```bash
# Vercel
vercel env add AGENTPIPE_BRIDGE_API_KEY production

# Railway
railway variables set AGENTPIPE_BRIDGE_API_KEY=ap_live_YOUR_KEY

# Heroku
heroku config:set AGENTPIPE_BRIDGE_API_KEY=ap_live_YOUR_KEY
```

### Docker Compose

Update `docker-compose.yaml` or create a `.env` file:

```yaml
environment:
  AGENTPIPE_BRIDGE_API_KEY: ${AGENTPIPE_BRIDGE_API_KEY:-ap_test_ZPrbXZVeMrST9JlTp3-Ys8FvgUC3baLa}
```

## Using the API Key

### CLI Configuration

When running AgentPipe CLI with streaming enabled:

```bash
# Set as environment variable
export AGENTPIPE_BRIDGE_API_KEY=ap_test_ZPrbXZVeMrST9JlTp3-Ys8FvgUC3baLa

# Or pass directly via flag
agentpipe run --stream \
  --stream-url="http://localhost:3000" \
  --stream-api-key="ap_test_ZPrbXZVeMrST9JlTp3-Ys8FvgUC3baLa" \
  "Hello agents"
```

### HTTP Requests

Include the key in the `Authorization` header:

```bash
curl -X POST http://localhost:3000/api/ingest \
  -H "Authorization: Bearer ap_test_ZPrbXZVeMrST9JlTp3-Ys8FvgUC3baLa" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "conversation.started",
    "timestamp": "2025-01-21T10:00:00Z",
    "data": {
      "conversation_id": "test-123",
      "mode": "multi-agent",
      "initial_prompt": "Test message",
      "agents": [],
      "system_info": {
        "agentpipe_version": "0.2.4",
        "os": "darwin",
        "os_version": "macOS 14.1",
        "go_version": "go1.21.5",
        "architecture": "arm64"
      }
    }
  }'
```

## Security Best Practices

### Development
- ✅ Use `ap_test_*` prefix for testing keys
- ✅ Commit `.env.example` with placeholder (NOT actual keys)
- ✅ Keep `.env` in `.gitignore` (it is by default)
- ✅ Use the provided testing key for local development

### Production
- ✅ Generate unique `ap_live_*` keys for each environment
- ✅ Use longer keys (32+ bytes) for production
- ✅ Store keys securely in environment variables
- ✅ Never commit production keys to git
- ✅ Rotate keys periodically
- ✅ Use different keys for staging and production

### Key Rotation

If you need to rotate a key:

1. Generate a new key using the commands above
2. Update the environment variable in your deployment
3. Update the AgentPipe CLI configuration
4. Test with the new key
5. Once confirmed working, revoke the old key

## Troubleshooting

### 401 Unauthorized

**Error**: `Unauthorized`, `Missing or invalid authorization header`

**Solutions**:
- Check that `Authorization` header is included
- Verify header format: `Authorization: Bearer YOUR_KEY`
- Confirm key matches `AGENTPIPE_BRIDGE_API_KEY` env var
- Restart the server after changing `.env`

### Invalid API Key

**Error**: `Invalid API key`

**Solutions**:
- Verify the key hasn't been truncated (keys can be long)
- Check for extra spaces or line breaks in the key
- Confirm the key in CLI matches the key in the server
- Regenerate both keys to ensure they match

## Testing the Connection

Test that your API key is working:

```bash
# Test with correct key
curl -X POST http://localhost:3000/api/ingest \
  -H "Authorization: Bearer ap_test_ZPrbXZVeMrST9JlTp3-Ys8FvgUC3baLa" \
  -H "Content-Type: application/json" \
  -d '{"type":"test"}' \
  -v

# Should return 400 (invalid event format) not 401 (auth error)
```

If you get a `401` status, the key is wrong. If you get `400`, authentication worked!

## Reference

- **Ingest API**: `app/api/ingest/route.ts`
- **Upload API**: `app/api/sessions/upload/route.ts`
- **Authentication**: Uses constant-time comparison to prevent timing attacks
