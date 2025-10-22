# AgentPipe Streaming - Production Deployment Checklist

This checklist ensures a safe, secure, and performant deployment of the streaming architecture.

## Pre-Deployment Checklist

### Security

- [ ] **Generate Production API Key**
  ```bash
  node -e "console.log('ap_live_' + require('crypto').randomBytes(32).toString('base64url'))"
  ```
  Store securely in environment variables, not in code

- [ ] **Configure HTTPS Only**
  - [ ] SSL/TLS certificate installed
  - [ ] HTTP → HTTPS redirect configured
  - [ ] HSTS headers enabled

- [ ] **Set ALLOWED_ORIGINS**
  ```env
  ALLOWED_ORIGINS=https://yourapp.com,https://www.yourapp.com
  ```

- [ ] **Enable Rate Limiting**
  - [ ] Redis configured for distributed rate limiting
  - [ ] Appropriate limits set per endpoint
  - [ ] Monitor rate limit violations

- [ ] **Input Validation**
  - [ ] Zod schemas in place for all endpoints
  - [ ] Content size limits enforced
  - [ ] SQL injection protection verified (Prisma)

- [ ] **API Key Rotation Plan**
  - [ ] Process documented
  - [ ] Support for multiple active keys (future)

### Database

- [ ] **Production Database Ready**
  - [ ] PostgreSQL 14+ installed
  - [ ] Connection pooling configured (PgBouncer recommended)
  - [ ] Backup strategy in place
  - [ ] Point-in-time recovery enabled

- [ ] **Run Migrations**
  ```bash
  npx prisma migrate deploy
  ```

- [ ] **Database Indexes**
  - [ ] All indexes from schema applied
  - [ ] Query performance tested with EXPLAIN ANALYZE
  - [ ] Slow query log enabled

- [ ] **Connection Limits**
  - [ ] Max connections set appropriately
  - [ ] Connection timeout configured
  - [ ] Idle connection cleanup enabled

### Infrastructure

- [ ] **Server Resources**
  - [ ] CPU: 2+ cores minimum
  - [ ] RAM: 2GB+ minimum (4GB+ recommended)
  - [ ] Disk: 20GB+ with auto-scaling
  - [ ] Network: Low latency to database

- [ ] **Redis (Recommended for Production)**
  - [ ] Redis 6+ installed
  - [ ] Persistence enabled (AOF or RDB)
  - [ ] Memory limit configured
  - [ ] Backup strategy in place

- [ ] **Load Balancer (if applicable)**
  - [ ] Session affinity configured for SSE
  - [ ] Health check endpoints configured
  - [ ] WebSocket/SSE support enabled
  - [ ] Timeout values appropriate for long-lived connections

- [ ] **CDN Configuration (if applicable)**
  - [ ] `/api/*` routes bypassed (not cached)
  - [ ] Static assets cached
  - [ ] CORS headers preserved

### Monitoring & Logging

- [ ] **Application Logging**
  - [ ] Structured logging implemented (JSON)
  - [ ] Log levels configured (INFO in prod)
  - [ ] Sensitive data not logged (API keys, etc.)
  - [ ] Log aggregation service configured (Datadog, CloudWatch, etc.)

- [ ] **Error Tracking**
  - [ ] Sentry or similar configured
  - [ ] Error notifications set up
  - [ ] PII data scrubbing enabled

- [ ] **Health Checks**
  - [ ] `/api/health` endpoint responding
  - [ ] Database connectivity checked
  - [ ] Redis connectivity checked (if applicable)

- [ ] **Metrics**
  - [ ] Prometheus metrics exposed (optional)
  - [ ] Key metrics tracked:
    - [ ] Ingestion rate (events/second)
    - [ ] SSE connection count
    - [ ] Database query duration
    - [ ] API error rate
    - [ ] Rate limit hits

- [ ] **Alerting**
  - [ ] High error rate alert
  - [ ] Database connection failures
  - [ ] High memory usage
  - [ ] Disk space low
  - [ ] Rate limit threshold exceeded

### Performance

- [ ] **Caching Strategy**
  - [ ] Redis caching implemented for read-heavy endpoints
  - [ ] Cache TTL configured appropriately
  - [ ] Cache invalidation on writes

- [ ] **Database Optimization**
  - [ ] Query performance tested under load
  - [ ] Index usage verified
  - [ ] Connection pooling configured
  - [ ] Read replicas considered (if high read load)

- [ ] **SSE Connection Management**
  - [ ] Max connections limit set
  - [ ] Connection cleanup on client disconnect
  - [ ] Heartbeat interval configured (30s recommended)

- [ ] **Message Batching (CLI Side)**
  - [ ] Batch size configured
  - [ ] Batch timeout configured
  - [ ] Balance between latency and throughput

### Testing

- [ ] **Unit Tests Pass**
  ```bash
  npm test
  ```

- [ ] **Integration Tests Pass**
  - [ ] Event ingestion flow
  - [ ] SSE streaming
  - [ ] Historical upload
  - [ ] Error scenarios

- [ ] **Load Testing Completed**
  ```bash
  k6 run load-test.js
  ```
  - [ ] Target: 100 concurrent users
  - [ ] Target: 1000 events/minute
  - [ ] Target: 50 concurrent SSE connections
  - [ ] 95th percentile latency < 500ms
  - [ ] Error rate < 1%

- [ ] **Stress Testing**
  - [ ] Maximum capacity identified
  - [ ] Graceful degradation verified
  - [ ] Recovery after overload tested

### Documentation

- [ ] **API Documentation Updated**
  - [ ] Event schemas documented
  - [ ] Example requests/responses
  - [ ] Error codes documented

- [ ] **Runbook Created**
  - [ ] Common issues and solutions
  - [ ] Escalation procedures
  - [ ] Emergency contacts

- [ ] **Architecture Diagrams**
  - [ ] Current architecture documented
  - [ ] Data flow diagrams
  - [ ] Infrastructure diagram

---

## Deployment Steps

### Phase 1: Database

1. **Backup Current Database**
   ```bash
   pg_dump -U postgres -d agentpipe_prod > backup_$(date +%Y%m%d_%H%M%S).sql
   ```

2. **Run Migrations**
   ```bash
   npx prisma migrate deploy
   ```

3. **Verify Indexes**
   ```sql
   SELECT tablename, indexname FROM pg_indexes
   WHERE schemaname = 'public'
   ORDER BY tablename, indexname;
   ```

### Phase 2: Environment Configuration

1. **Set Environment Variables**
   ```bash
   # Vercel
   vercel env add AGENTPIPE_BRIDGE_API_KEY production

   # Or Docker
   docker-compose up -d
   ```

2. **Verify Configuration**
   ```bash
   curl https://your-app.com/api/health
   ```

### Phase 3: Deployment

1. **Deploy Application**
   ```bash
   # Vercel
   vercel --prod

   # Or Docker
   docker-compose up -d

   # Or manual
   npm run build
   npm start
   ```

2. **Verify Deployment**
   ```bash
   curl https://your-app.com/api/health
   ```

### Phase 4: Smoke Tests

1. **Test Ingestion Endpoint**
   ```bash
   curl -X POST https://your-app.com/api/ingest \
     -H "Authorization: Bearer $AGENTPIPE_API_KEY" \
     -H "Content-Type: application/json" \
     -d '{"type":"conversation.started","data":{...}}'
   ```

2. **Test SSE Stream**
   ```bash
   curl -N https://your-app.com/api/realtime/stream
   ```

3. **Test Upload**
   ```bash
   curl -X POST https://your-app.com/api/sessions/upload \
     -H "Authorization: Bearer $AGENTPIPE_API_KEY" \
     -H "Content-Type: application/json" \
     -d '{...}'
   ```

4. **Verify Database**
   ```sql
   SELECT COUNT(*) FROM conversations;
   SELECT COUNT(*) FROM messages;
   SELECT COUNT(*) FROM events;
   ```

### Phase 5: Monitor

1. **Watch Logs**
   ```bash
   # Vercel
   vercel logs --follow

   # Docker
   docker-compose logs -f web
   ```

2. **Monitor Metrics**
   - Check error rate
   - Check response times
   - Check resource usage

3. **Test from CLI**
   ```bash
   # Update CLI config to production URL
   export AGENTPIPE_WEB_URL=https://your-app.com
   agentpipe run ...
   ```

---

## Post-Deployment

### First 24 Hours

- [ ] **Monitor error rates** (should be < 1%)
- [ ] **Check performance** (p95 latency < 500ms)
- [ ] **Verify SSE connections** are stable
- [ ] **Review logs** for unexpected errors
- [ ] **Test CLI integration** from real devices
- [ ] **Verify backups** are running

### First Week

- [ ] **Analyze usage patterns**
  - Peak traffic times
  - Average session size
  - Popular agent types

- [ ] **Optimize based on metrics**
  - Add indexes if needed
  - Adjust cache TTLs
  - Tune rate limits

- [ ] **Gather user feedback**
  - CLI integration experience
  - Real-time updates reliability
  - Upload performance

### First Month

- [ ] **Review capacity planning**
  - Database growth rate
  - Storage usage trends
  - Connection pool usage

- [ ] **Security audit**
  - Review access logs
  - Check for suspicious activity
  - Verify rate limiting effectiveness

- [ ] **Performance tuning**
  - Optimize slow queries
  - Adjust caching strategy
  - Consider read replicas if needed

---

## Environment Variables Reference

### Required

```env
# Database
DATABASE_URL=postgresql://user:password@host:5432/database

# Authentication
AGENTPIPE_BRIDGE_API_KEY=ap_live_...

# Application
NODE_ENV=production
```

### Recommended

```env
# Redis (for rate limiting and caching)
REDIS_URL=redis://...
REDIS_TOKEN=...  # If using Upstash

# Security
ALLOWED_ORIGINS=https://app.com,https://www.app.com

# Rate Limiting
RATE_LIMIT_WINDOW_SECONDS=60
RATE_LIMIT_MAX_REQUESTS=100

# SSE Configuration
SSE_MAX_CONNECTIONS=1000
SSE_HEARTBEAT_INTERVAL=30000

# Monitoring
SENTRY_DSN=https://...
```

### Optional

```env
# Logging
LOG_LEVEL=info
LOG_FORMAT=json

# Performance
DATABASE_POOL_MIN=2
DATABASE_POOL_MAX=10
DATABASE_TIMEOUT=30000

# Features
ENABLE_METRICS=true
METRICS_PORT=9090
```

---

## Rollback Plan

If issues occur after deployment:

### Quick Rollback (Vercel)

```bash
# List deployments
vercel ls

# Rollback to previous
vercel rollback <deployment-url>
```

### Database Rollback

```bash
# Restore from backup
psql -U postgres -d agentpipe_prod < backup_20251020_143000.sql

# Rollback migration (if needed)
npx prisma migrate resolve --rolled-back <migration-name>
```

### Docker Rollback

```bash
# Use previous image
docker-compose down
docker pull your-registry/agentpipe-web:previous-tag
docker-compose up -d
```

---

## Performance Benchmarks

### Target Metrics (Production)

| Metric | Target | Alert Threshold |
|--------|--------|----------------|
| API Response Time (p95) | < 200ms | > 500ms |
| API Response Time (p99) | < 500ms | > 1000ms |
| Error Rate | < 0.1% | > 1% |
| Database Query Time (p95) | < 50ms | > 200ms |
| SSE Connection Stability | > 99.9% | < 99% |
| Concurrent SSE Connections | 1000+ | N/A |
| Events Ingested/Second | 100+ | N/A |
| Upload Success Rate | > 99% | < 98% |

### Resource Usage Targets

| Resource | Normal | Alert Threshold |
|----------|--------|----------------|
| CPU Usage | < 50% | > 80% |
| Memory Usage | < 70% | > 85% |
| Disk Usage | < 70% | > 85% |
| Database Connections | < 50% of max | > 80% of max |
| Redis Memory | < 70% | > 85% |

---

## Monitoring Dashboard (Recommended)

### Key Metrics to Display

1. **Application Health**
   - Uptime
   - Error rate (last hour)
   - Request rate (req/min)
   - Response time (p95, p99)

2. **Ingestion**
   - Events ingested/min
   - Event type breakdown
   - Ingestion latency
   - Failed events

3. **SSE Streaming**
   - Active connections
   - Connection duration
   - Broadcast latency
   - Dropped connections

4. **Database**
   - Query performance
   - Connection pool usage
   - Table sizes
   - Index usage

5. **Infrastructure**
   - CPU usage
   - Memory usage
   - Disk I/O
   - Network bandwidth

---

## Security Incident Response

### If API Key Compromised

1. **Immediately rotate key**
   ```bash
   # Generate new key
   NEW_KEY=$(node -e "console.log('ap_live_' + require('crypto').randomBytes(32).toString('base64url'))")

   # Update environment
   vercel env add AGENTPIPE_BRIDGE_API_KEY production
   ```

2. **Redeploy application**
   ```bash
   vercel --prod
   ```

3. **Notify CLI users**
   - Send email with new key
   - Update documentation
   - Monitor for old key usage

4. **Audit access logs**
   - Review recent requests with old key
   - Check for suspicious activity
   - Document findings

### If Database Breach Detected

1. **Immediately isolate**
   - Block external access
   - Enable IP whitelist

2. **Assess damage**
   - What data was accessed?
   - Was data modified?
   - When did breach occur?

3. **Notify stakeholders**
   - Security team
   - Legal team
   - Affected users

4. **Remediate**
   - Patch vulnerability
   - Restore from backup if needed
   - Reset credentials

5. **Post-mortem**
   - Document incident
   - Improve security measures
   - Update runbook

---

## Troubleshooting Common Issues

### High Error Rate

**Symptoms**: Error rate > 1%

**Diagnosis**:
```bash
# Check error logs
vercel logs --filter=error

# Check database connectivity
curl https://your-app.com/api/health
```

**Solutions**:
- Check database connection
- Verify API key configuration
- Review recent code changes
- Scale resources if needed

### SSE Connections Dropping

**Symptoms**: Clients frequently reconnecting

**Diagnosis**:
```bash
# Check server logs for connection errors
# Monitor network connectivity
# Check load balancer timeout settings
```

**Solutions**:
- Increase timeout values
- Check network stability
- Verify heartbeat is working
- Review proxy/CDN settings

### Slow Database Queries

**Symptoms**: Query time > 200ms

**Diagnosis**:
```sql
-- Check slow queries
SELECT query, calls, mean_exec_time, max_exec_time
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 10;

-- Check missing indexes
EXPLAIN ANALYZE <slow-query>;
```

**Solutions**:
- Add missing indexes
- Optimize query
- Enable query caching
- Consider read replicas

### High Memory Usage

**Symptoms**: Memory > 85%

**Diagnosis**:
```bash
# Check process memory
ps aux | grep node

# Check for memory leaks
node --inspect server.js
```

**Solutions**:
- Identify memory leak
- Optimize SSE connection storage
- Increase server memory
- Enable garbage collection tuning

---

## Success Criteria

Deployment is successful when:

- [ ] All health checks passing
- [ ] Error rate < 1%
- [ ] Response time p95 < 500ms
- [ ] No critical alerts firing
- [ ] CLI integration working
- [ ] SSE streaming stable
- [ ] Database performing well
- [ ] Zero security vulnerabilities
- [ ] Monitoring dashboards populated
- [ ] Team trained on new system

---

**Document Version**: 1.0
**Last Updated**: 2025-10-20
**Review Date**: 2025-11-20
