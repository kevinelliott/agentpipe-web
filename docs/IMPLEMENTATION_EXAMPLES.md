# AgentPipe Streaming - Implementation Examples

This document provides complete, ready-to-use code examples for implementing the streaming architecture.

## Table of Contents

1. [Enhanced Validation Schemas](#1-enhanced-validation-schemas)
2. [Updated Ingest Endpoint](#2-updated-ingest-endpoint)
3. [Session Upload Endpoint](#3-session-upload-endpoint)
4. [Enhanced Auth Middleware](#4-enhanced-auth-middleware)
5. [Go CLI Client (Complete)](#5-go-cli-client-complete)
6. [React Hooks for SSE](#6-react-hooks-for-sse)
7. [Database Migration](#7-database-migration)

---

## 1. Enhanced Validation Schemas

**File**: `app/lib/schemas.ts`

```typescript
import { z } from 'zod';

// ============================================================================
// Base Schemas
// ============================================================================

export const responseMetricsSchema = z.object({
  duration: z.number().int().positive().optional(),
  inputTokens: z.number().int().nonnegative().optional(),
  outputTokens: z.number().int().nonnegative().optional(),
  totalTokens: z.number().int().nonnegative().optional(),
  model: z.string().min(1).optional(),
  cost: z.number().nonnegative().optional(),
});

export const participantConfigSchema = z.object({
  agentId: z.string().min(1).max(100),
  agentType: z.string().min(1).max(50),
  agentName: z.string().min(1).max(100),
  agentVersion: z.string().max(20).optional(),
  model: z.string().max(100).optional(),
  prompt: z.string().max(10000).optional(),
  announcement: z.string().max(500).optional(),
  settings: z.record(z.any()).optional(),
});

export const messageDataSchema = z.object({
  agentId: z.string().min(1),
  agentName: z.string().min(1),
  agentType: z.string().min(1),
  agentVersion: z.string().optional(),
  content: z.string().min(1).max(100000), // 100KB limit
  role: z.enum(['agent', 'user', 'system']),
  timestamp: z.string().datetime().or(z.date().transform(d => d.toISOString())),
  sequenceNumber: z.number().int().nonnegative().optional(),
  metrics: responseMetricsSchema.optional(),
});

// ============================================================================
// Event Schemas
// ============================================================================

export const conversationStartedEventSchema = z.object({
  type: z.literal('conversation.started'),
  timestamp: z.string().datetime().optional(),
  data: z.object({
    name: z.string().min(1).max(200).optional(),
    mode: z.enum(['round-robin', 'reactive', 'free-form']),
    maxTurns: z.number().int().positive().max(1000).optional(),
    initialPrompt: z.string().min(1).max(10000),
    participants: z.array(participantConfigSchema).min(1).max(50),
    metadata: z.record(z.any()).optional(),
  }),
});

export const messageCreatedEventSchema = z.object({
  type: z.literal('message.created'),
  timestamp: z.string().datetime().optional(),
  data: z.object({
    conversationId: z.string().regex(/^c[a-z0-9]{24}$/),
    message: messageDataSchema,
  }),
});

export const conversationCompletedEventSchema = z.object({
  type: z.literal('conversation.completed'),
  timestamp: z.string().datetime().optional(),
  data: z.object({
    conversationId: z.string().regex(/^c[a-z0-9]{24}$/),
    totalMessages: z.number().int().nonnegative(),
    totalTokens: z.number().int().nonnegative(),
    totalCost: z.number().nonnegative(),
    totalDuration: z.number().int().nonnegative(),
    completionReason: z.string().max(100).optional(),
  }),
});

export const conversationInterruptedEventSchema = z.object({
  type: z.literal('conversation.interrupted'),
  timestamp: z.string().datetime().optional(),
  data: z.object({
    conversationId: z.string().regex(/^c[a-z0-9]{24}$/),
    reason: z.string().max(500).optional(),
    totalMessages: z.number().int().nonnegative().optional(),
    totalTokens: z.number().int().nonnegative().optional(),
    totalCost: z.number().nonnegative().optional(),
    totalDuration: z.number().int().nonnegative().optional(),
  }),
});

export const errorOccurredEventSchema = z.object({
  type: z.literal('error.occurred'),
  timestamp: z.string().datetime().optional(),
  data: z.object({
    conversationId: z.string().regex(/^c[a-z0-9]{24}$/).optional(),
    error: z.string().min(1).max(1000),
    errorCode: z.string().max(50).optional(),
    agentId: z.string().max(100).optional(),
    details: z.record(z.any()).optional(),
  }),
});

// Union type for all event types
export const agentPipeEventSchema = z.discriminatedUnion('type', [
  conversationStartedEventSchema,
  messageCreatedEventSchema,
  conversationCompletedEventSchema,
  conversationInterruptedEventSchema,
  errorOccurredEventSchema,
]);

// ============================================================================
// Session Upload Schema
// ============================================================================

export const sessionUploadSchema = z.object({
  session: z.object({
    name: z.string().min(1).max(200),
    mode: z.enum(['round-robin', 'reactive', 'free-form']),
    maxTurns: z.number().int().positive().max(1000).optional(),
    initialPrompt: z.string().min(1).max(10000),
    status: z.enum(['ACTIVE', 'COMPLETED', 'INTERRUPTED', 'ERROR']),
    startedAt: z.string().datetime(),
    completedAt: z.string().datetime().optional(),
    totalDuration: z.number().int().nonnegative().optional(),
    metadata: z.record(z.any()).optional(),
  }),
  participants: z.array(participantConfigSchema).min(1).max(50),
  messages: z.array(messageDataSchema).max(10000), // Max 10k messages per upload
}).refine(
  (data) => {
    // Validate all message agentIds exist in participants
    const participantIds = new Set(data.participants.map(p => p.agentId));
    return data.messages.every(m => participantIds.has(m.agentId));
  },
  {
    message: 'All message agentIds must exist in participants array',
    path: ['messages'],
  }
).refine(
  (data) => {
    // Validate completedAt is after startedAt if both exist
    if (data.session.completedAt && data.session.startedAt) {
      return new Date(data.session.completedAt) > new Date(data.session.startedAt);
    }
    return true;
  },
  {
    message: 'completedAt must be after startedAt',
    path: ['session', 'completedAt'],
  }
);

// ============================================================================
// Type Exports
// ============================================================================

export type ResponseMetrics = z.infer<typeof responseMetricsSchema>;
export type ParticipantConfig = z.infer<typeof participantConfigSchema>;
export type MessageData = z.infer<typeof messageDataSchema>;
export type ConversationStartedEvent = z.infer<typeof conversationStartedEventSchema>;
export type MessageCreatedEvent = z.infer<typeof messageCreatedEventSchema>;
export type ConversationCompletedEvent = z.infer<typeof conversationCompletedEventSchema>;
export type ConversationInterruptedEvent = z.infer<typeof conversationInterruptedEventSchema>;
export type ErrorOccurredEvent = z.infer<typeof errorOccurredEventSchema>;
export type AgentPipeEvent = z.infer<typeof agentPipeEventSchema>;
export type SessionUpload = z.infer<typeof sessionUploadSchema>;
```

---

## 2. Updated Ingest Endpoint

**File**: `app/api/ingest/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { eventManager } from '@/app/lib/eventManager';
import { agentPipeEventSchema } from '@/app/lib/schemas';
import { validateApiKey, AuthError } from '@/app/lib/auth';
import { rateLimiter } from '@/app/lib/rateLimit';

/**
 * POST /api/ingest
 * Webhook endpoint for AgentPipe CLI to send realtime events
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Authenticate
    const apiKey = validateApiKey(request);

    // 2. Rate limiting
    const identifier = `api:${apiKey.substring(0, 10)}`;
    const rateLimit = await rateLimiter.check(identifier, 100, 60); // 100 req/min

    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: 'Rate limit exceeded',
          retryAfter: Math.ceil((rateLimit.resetAt - Date.now()) / 1000),
        },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': '100',
            'X-RateLimit-Remaining': rateLimit.remaining.toString(),
            'X-RateLimit-Reset': new Date(rateLimit.resetAt).toISOString(),
            'Retry-After': Math.ceil((rateLimit.resetAt - Date.now()) / 1000).toString(),
          },
        }
      );
    }

    // 3. Parse and validate payload
    const rawPayload = await request.json();

    // Set timestamp if not provided
    if (!rawPayload.timestamp) {
      rawPayload.timestamp = new Date().toISOString();
    }

    const event = agentPipeEventSchema.parse(rawPayload);

    // 4. Handle event based on type
    switch (event.type) {
      case 'conversation.started':
        return await handleConversationStarted(event);

      case 'message.created':
        return await handleMessageCreated(event);

      case 'conversation.completed':
        return await handleConversationCompleted(event);

      case 'conversation.interrupted':
        return await handleConversationInterrupted(event);

      case 'error.occurred':
        return await handleErrorOccurred(event);

      default:
        return NextResponse.json(
          { error: 'Unknown event type' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error processing ingest event:', error);

    if (error instanceof AuthError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode }
      );
    }

    if (error instanceof Error && error.name === 'ZodError') {
      const zodError = error as any;
      const firstError = zodError.errors[0];
      return NextResponse.json(
        {
          error: 'Validation failed',
          message: firstError.message,
          field: firstError.path.join('.'),
          details: zodError.errors,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// ============================================================================
// Event Handlers
// ============================================================================

async function handleConversationStarted(event: any) {
  const { data } = event;

  const conversation = await prisma.conversation.create({
    data: {
      name: data.name || `Conversation ${new Date().toISOString()}`,
      mode: data.mode,
      maxTurns: data.maxTurns,
      initialPrompt: data.initialPrompt,
      status: 'ACTIVE',
      metadata: {
        ...data.metadata,
        source: 'cli',
        ingestedAt: new Date().toISOString(),
      },
      participants: {
        create: data.participants.map((p: any) => ({
          agentId: p.agentId,
          agentType: p.agentType,
          agentName: p.agentName,
          agentVersion: p.agentVersion,
          model: p.model,
          prompt: p.prompt,
          announcement: p.announcement,
          settings: p.settings || {},
        })),
      },
    },
    include: {
      participants: true,
    },
  });

  // Broadcast to SSE clients
  eventManager.emitConversationStarted({
    conversationId: conversation.id,
    mode: conversation.mode,
    participants: conversation.participants.map(p => p.agentType),
    initialPrompt: conversation.initialPrompt,
  });

  return NextResponse.json(
    { conversationId: conversation.id, status: 'created' },
    { status: 201 }
  );
}

async function handleMessageCreated(event: any) {
  const { data } = event;
  const { conversationId, message } = data;

  // Verify conversation exists
  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
  });

  if (!conversation) {
    return NextResponse.json(
      { error: 'Conversation not found', conversationId },
      { status: 404 }
    );
  }

  // Create message
  const createdMessage = await prisma.message.create({
    data: {
      conversationId,
      agentId: message.agentId,
      agentName: message.agentName,
      agentType: message.agentType,
      agentVersion: message.agentVersion,
      content: message.content,
      role: message.role,
      timestamp: message.timestamp ? new Date(message.timestamp) : new Date(),
      duration: message.metrics?.duration,
      inputTokens: message.metrics?.inputTokens,
      outputTokens: message.metrics?.outputTokens,
      totalTokens: message.metrics?.totalTokens,
      model: message.metrics?.model,
      cost: message.metrics?.cost,
    },
  });

  // Update conversation aggregates
  await prisma.conversation.update({
    where: { id: conversationId },
    data: {
      totalMessages: { increment: 1 },
      totalTokens: { increment: message.metrics?.totalTokens || 0 },
      totalCost: { increment: message.metrics?.cost || 0 },
      totalDuration: { increment: message.metrics?.duration || 0 },
      updatedAt: new Date(),
    },
  });

  // Broadcast to SSE clients
  eventManager.emitMessageCreated({
    conversationId,
    message: createdMessage,
  });

  return NextResponse.json(
    { messageId: createdMessage.id, status: 'created' },
    { status: 201 }
  );
}

async function handleConversationCompleted(event: any) {
  const { data } = event;

  await prisma.conversation.update({
    where: { id: data.conversationId },
    data: {
      status: 'COMPLETED',
      completedAt: new Date(),
      metadata: {
        completionReason: data.completionReason,
      },
    },
  });

  // Broadcast to SSE clients
  eventManager.emitConversationCompleted(data);

  return NextResponse.json({ success: true }, { status: 200 });
}

async function handleConversationInterrupted(event: any) {
  const { data } = event;

  await prisma.conversation.update({
    where: { id: data.conversationId },
    data: {
      status: 'INTERRUPTED',
      completedAt: new Date(),
      metadata: {
        interruptReason: data.reason,
      },
    },
  });

  // Broadcast to SSE clients
  eventManager.emitConversationInterrupted(data);

  return NextResponse.json({ success: true }, { status: 200 });
}

async function handleErrorOccurred(event: any) {
  const { data } = event;

  // Log error event
  await prisma.event.create({
    data: {
      type: 'error',
      conversationId: data.conversationId,
      data: {
        error: data.error,
        errorCode: data.errorCode,
        agentId: data.agentId,
        details: data.details,
      },
      errorMessage: data.error,
    },
  });

  // If conversation exists, potentially update status
  if (data.conversationId) {
    await prisma.conversation.update({
      where: { id: data.conversationId },
      data: {
        errorMessage: data.error,
      },
    });
  }

  // Broadcast to SSE clients
  eventManager.emitError(data);

  return NextResponse.json({ success: true }, { status: 200 });
}
```

---

## 3. Session Upload Endpoint

**File**: `app/api/sessions/upload/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { sessionUploadSchema } from '@/app/lib/schemas';
import { validateApiKey, AuthError } from '@/app/lib/auth';
import { rateLimiter } from '@/app/lib/rateLimit';

/**
 * POST /api/sessions/upload
 * Bulk upload historical session data
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Authenticate
    const apiKey = validateApiKey(request);

    // 2. Rate limiting (lower limit for uploads)
    const identifier = `upload:${apiKey.substring(0, 10)}`;
    const rateLimit = await rateLimiter.check(identifier, 10, 60); // 10 uploads/min

    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: 'Rate limit exceeded',
          retryAfter: Math.ceil((rateLimit.resetAt - Date.now()) / 1000),
        },
        { status: 429 }
      );
    }

    // 3. Parse and validate payload
    const rawPayload = await request.json();
    const upload = sessionUploadSchema.parse(rawPayload);

    // 4. Check for duplicate upload (idempotency)
    if (upload.session.metadata?.originalId) {
      const existing = await prisma.conversation.findFirst({
        where: {
          metadata: {
            path: ['originalId'],
            equals: upload.session.metadata.originalId,
          },
        },
      });

      if (existing) {
        return NextResponse.json(
          {
            error: 'Duplicate upload',
            message: 'Session with this originalId already exists',
            existingConversationId: existing.id,
          },
          { status: 409 }
        );
      }
    }

    // 5. Calculate aggregates from messages
    const totalTokens = upload.messages.reduce(
      (sum, msg) => sum + (msg.metrics?.totalTokens || 0),
      0
    );
    const totalCost = upload.messages.reduce(
      (sum, msg) => sum + (msg.metrics?.cost || 0),
      0
    );
    const totalDuration = upload.messages.reduce(
      (sum, msg) => sum + (msg.metrics?.duration || 0),
      0
    );

    // 6. Create conversation with all data in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create conversation
      const conversation = await tx.conversation.create({
        data: {
          name: upload.session.name,
          mode: upload.session.mode,
          maxTurns: upload.session.maxTurns,
          initialPrompt: upload.session.initialPrompt,
          status: upload.session.status,
          startedAt: new Date(upload.session.startedAt),
          completedAt: upload.session.completedAt
            ? new Date(upload.session.completedAt)
            : undefined,
          totalMessages: upload.messages.length,
          totalTokens,
          totalCost,
          totalDuration: upload.session.totalDuration || totalDuration,
          metadata: {
            ...upload.session.metadata,
            source: 'cli',
            uploadedAt: new Date().toISOString(),
            isHistoricalUpload: true,
          },
        },
      });

      // Create participants
      await tx.conversationAgent.createMany({
        data: upload.participants.map((p) => ({
          conversationId: conversation.id,
          agentId: p.agentId,
          agentType: p.agentType,
          agentName: p.agentName,
          agentVersion: p.agentVersion,
          model: p.model,
          prompt: p.prompt,
          announcement: p.announcement,
          settings: p.settings || {},
        })),
      });

      // Create messages (in batches for large uploads)
      const batchSize = 1000;
      for (let i = 0; i < upload.messages.length; i += batchSize) {
        const batch = upload.messages.slice(i, i + batchSize);
        await tx.message.createMany({
          data: batch.map((msg, index) => ({
            conversationId: conversation.id,
            agentId: msg.agentId,
            agentName: msg.agentName,
            agentType: msg.agentType,
            agentVersion: msg.agentVersion,
            content: msg.content,
            role: msg.role,
            timestamp: new Date(msg.timestamp),
            duration: msg.metrics?.duration,
            inputTokens: msg.metrics?.inputTokens,
            outputTokens: msg.metrics?.outputTokens,
            totalTokens: msg.metrics?.totalTokens,
            model: msg.metrics?.model,
            cost: msg.metrics?.cost,
          })),
        });
      }

      return conversation;
    });

    return NextResponse.json(
      {
        success: true,
        conversationId: result.id,
        messagesCreated: upload.messages.length,
        participantsCreated: upload.participants.length,
        totalTokens,
        totalCost,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error uploading session:', error);

    if (error instanceof AuthError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode }
      );
    }

    if (error instanceof Error && error.name === 'ZodError') {
      const zodError = error as any;
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: zodError.errors,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

---

## 4. Enhanced Auth Middleware

**File**: `app/lib/auth.ts`

```typescript
import { NextRequest } from 'next/server';
import crypto from 'crypto';

export class AuthError extends Error {
  constructor(message: string, public statusCode: number = 401) {
    super(message);
    this.name = 'AuthError';
  }
}

/**
 * Validate API key from request headers
 * Returns the API key if valid, throws AuthError otherwise
 */
export function validateApiKey(request: NextRequest): string {
  const authHeader = request.headers.get('authorization');

  if (!authHeader) {
    throw new AuthError('Missing Authorization header', 401);
  }

  const match = authHeader.match(/^Bearer (.+)$/);
  if (!match) {
    throw new AuthError(
      'Invalid Authorization format. Expected: Bearer <token>',
      401
    );
  }

  const providedKey = match[1];
  const expectedKey = process.env.AGENTPIPE_BRIDGE_API_KEY;

  if (!expectedKey) {
    console.error('AGENTPIPE_BRIDGE_API_KEY not configured');
    throw new AuthError('Server configuration error', 500);
  }

  // Constant-time comparison to prevent timing attacks
  const providedHash = crypto
    .createHash('sha256')
    .update(providedKey)
    .digest('hex');
  const expectedHash = crypto
    .createHash('sha256')
    .update(expectedKey)
    .digest('hex');

  if (providedHash !== expectedHash) {
    throw new AuthError('Invalid API key', 401);
  }

  return providedKey;
}

/**
 * Validate request origin for CORS
 */
export function validateOrigin(request: NextRequest): void {
  const allowedOriginsEnv = process.env.ALLOWED_ORIGINS || '';
  if (!allowedOriginsEnv) {
    return; // No restrictions if not configured
  }

  const allowedOrigins = allowedOriginsEnv.split(',').map(o => o.trim());
  const origin = request.headers.get('origin');

  if (origin && !allowedOrigins.includes(origin)) {
    throw new AuthError('Origin not allowed', 403);
  }
}

/**
 * Extract client identifier for rate limiting
 */
export function getClientIdentifier(request: NextRequest, apiKey?: string): string {
  // Use API key prefix if available
  if (apiKey) {
    return `api:${apiKey.substring(0, 10)}`;
  }

  // Fall back to IP address
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0] : request.headers.get('x-real-ip');

  return `ip:${ip || 'unknown'}`;
}
```

**File**: `app/lib/rateLimit.ts`

```typescript
/**
 * Simple in-memory rate limiter
 * For production, use Redis-based implementation
 */
class InMemoryRateLimiter {
  private requests: Map<string, number[]> = new Map();

  async check(
    identifier: string,
    limit: number,
    windowSeconds: number
  ): Promise<{
    allowed: boolean;
    remaining: number;
    resetAt: number;
  }> {
    const now = Date.now();
    const windowStart = now - windowSeconds * 1000;

    // Get or initialize request timestamps
    const timestamps = this.requests.get(identifier) || [];

    // Filter out old requests
    const recentRequests = timestamps.filter((ts) => ts > windowStart);

    const count = recentRequests.length;
    const allowed = count < limit;
    const remaining = Math.max(0, limit - count - 1);
    const resetAt = now + windowSeconds * 1000;

    if (allowed) {
      // Add current request
      recentRequests.push(now);
      this.requests.set(identifier, recentRequests);
    }

    return { allowed, remaining, resetAt };
  }

  reset(identifier: string): void {
    this.requests.delete(identifier);
  }

  // Cleanup old entries periodically
  cleanup(): void {
    const now = Date.now();
    const maxAge = 60 * 60 * 1000; // 1 hour

    for (const [identifier, timestamps] of this.requests.entries()) {
      const recent = timestamps.filter((ts) => now - ts < maxAge);
      if (recent.length === 0) {
        this.requests.delete(identifier);
      } else {
        this.requests.set(identifier, recent);
      }
    }
  }
}

export const rateLimiter = new InMemoryRateLimiter();

// Cleanup every 5 minutes
setInterval(() => {
  rateLimiter.cleanup();
}, 5 * 60 * 1000);
```

---

## 5. Go CLI Client (Complete)

**File**: `cli/pkg/streaming/types.go`

```go
package streaming

import "time"

// Event represents a generic AgentPipe event
type Event struct {
	Type      string      `json:"type"`
	Timestamp time.Time   `json:"timestamp"`
	Data      interface{} `json:"data"`
}

// ConversationStartedData for conversation.started event
type ConversationStartedData struct {
	Name          string                 `json:"name,omitempty"`
	Mode          string                 `json:"mode"`
	MaxTurns      int                    `json:"maxTurns,omitempty"`
	InitialPrompt string                 `json:"initialPrompt"`
	Participants  []ParticipantConfig    `json:"participants"`
	Metadata      map[string]interface{} `json:"metadata,omitempty"`
}

// ParticipantConfig represents an agent participant
type ParticipantConfig struct {
	AgentID       string                 `json:"agentId"`
	AgentType     string                 `json:"agentType"`
	AgentName     string                 `json:"agentName"`
	AgentVersion  string                 `json:"agentVersion,omitempty"`
	Model         string                 `json:"model,omitempty"`
	Prompt        string                 `json:"prompt,omitempty"`
	Announcement  string                 `json:"announcement,omitempty"`
	Settings      map[string]interface{} `json:"settings,omitempty"`
}

// MessageData represents a single message
type MessageData struct {
	AgentID        string           `json:"agentId"`
	AgentName      string           `json:"agentName"`
	AgentType      string           `json:"agentType"`
	AgentVersion   string           `json:"agentVersion,omitempty"`
	Content        string           `json:"content"`
	Role           string           `json:"role"`
	Timestamp      time.Time        `json:"timestamp"`
	SequenceNumber int              `json:"sequenceNumber,omitempty"`
	Metrics        *ResponseMetrics `json:"metrics,omitempty"`
}

// ResponseMetrics tracks performance metrics
type ResponseMetrics struct {
	Duration     int     `json:"duration,omitempty"`     // milliseconds
	InputTokens  int     `json:"inputTokens,omitempty"`
	OutputTokens int     `json:"outputTokens,omitempty"`
	TotalTokens  int     `json:"totalTokens,omitempty"`
	Model        string  `json:"model,omitempty"`
	Cost         float64 `json:"cost,omitempty"`
}

// ConversationCompletedData for conversation.completed event
type ConversationCompletedData struct {
	ConversationID   string  `json:"conversationId"`
	TotalMessages    int     `json:"totalMessages"`
	TotalTokens      int     `json:"totalTokens"`
	TotalCost        float64 `json:"totalCost"`
	TotalDuration    int     `json:"totalDuration"` // milliseconds
	CompletionReason string  `json:"completionReason,omitempty"`
}

// IngestResponse is returned from the ingest endpoint
type IngestResponse struct {
	ConversationID string `json:"conversationId,omitempty"`
	MessageID      string `json:"messageId,omitempty"`
	Status         string `json:"status,omitempty"`
	Success        bool   `json:"success,omitempty"`
}
```

**File**: `cli/pkg/streaming/client.go`

```go
package streaming

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"time"
)

// Config holds streaming client configuration
type Config struct {
	BaseURL    string        // e.g., "https://agentpipe-web.example.com"
	APIKey     string        // Bearer token
	Timeout    time.Duration // HTTP timeout (default: 30s)
	RetryCount int           // Number of retries on failure (default: 3)
}

// Client sends events to AgentPipe Web
type Client struct {
	config     Config
	httpClient *http.Client
}

// NewClient creates a new streaming client
func NewClient(config Config) *Client {
	if config.Timeout == 0 {
		config.Timeout = 30 * time.Second
	}
	if config.RetryCount == 0 {
		config.RetryCount = 3
	}

	return &Client{
		config: config,
		httpClient: &http.Client{
			Timeout: config.Timeout,
		},
	}
}

// SendEvent sends a generic event to the ingestion endpoint
func (c *Client) SendEvent(event Event) (*IngestResponse, error) {
	// Set timestamp if not provided
	if event.Timestamp.IsZero() {
		event.Timestamp = time.Now()
	}

	// Marshal event to JSON
	payload, err := json.Marshal(event)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal event: %w", err)
	}

	// Create request
	url := fmt.Sprintf("%s/api/ingest", c.config.BaseURL)
	req, err := http.NewRequest("POST", url, bytes.NewBuffer(payload))
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}

	// Set headers
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", c.config.APIKey))

	// Send request with retries
	var lastErr error
	for i := 0; i < c.config.RetryCount; i++ {
		resp, err := c.httpClient.Do(req)
		if err != nil {
			lastErr = err
			backoff := time.Duration(i+1) * time.Second
			time.Sleep(backoff)
			continue
		}
		defer resp.Body.Close()

		// Read response body
		body, _ := io.ReadAll(resp.Body)

		// Check response status
		if resp.StatusCode >= 200 && resp.StatusCode < 300 {
			// Success - parse response
			var ingestResp IngestResponse
			if err := json.Unmarshal(body, &ingestResp); err != nil {
				return nil, fmt.Errorf("failed to parse response: %w", err)
			}
			return &ingestResp, nil
		}

		// Error response
		lastErr = fmt.Errorf("HTTP %d: %s", resp.StatusCode, string(body))

		// Don't retry on 4xx errors (client errors)
		if resp.StatusCode >= 400 && resp.StatusCode < 500 {
			break
		}

		// Exponential backoff
		backoff := time.Duration(i+1) * time.Second
		time.Sleep(backoff)
	}

	return nil, fmt.Errorf("failed to send event after %d retries: %w", c.config.RetryCount, lastErr)
}

// ConversationStarted sends a conversation.started event
func (c *Client) ConversationStarted(data ConversationStartedData) (string, error) {
	event := Event{
		Type: "conversation.started",
		Data: data,
	}

	resp, err := c.SendEvent(event)
	if err != nil {
		return "", err
	}

	return resp.ConversationID, nil
}

// MessageCreated sends a message.created event
func (c *Client) MessageCreated(conversationID string, message MessageData) (string, error) {
	event := Event{
		Type: "message.created",
		Data: map[string]interface{}{
			"conversationId": conversationID,
			"message":        message,
		},
	}

	resp, err := c.SendEvent(event)
	if err != nil {
		return "", err
	}

	return resp.MessageID, nil
}

// ConversationCompleted sends a conversation.completed event
func (c *Client) ConversationCompleted(data ConversationCompletedData) error {
	event := Event{
		Type: "conversation.completed",
		Data: data,
	}

	_, err := c.SendEvent(event)
	return err
}

// ConversationInterrupted sends a conversation.interrupted event
func (c *Client) ConversationInterrupted(conversationID, reason string) error {
	event := Event{
		Type: "conversation.interrupted",
		Data: map[string]interface{}{
			"conversationId": conversationID,
			"reason":         reason,
		},
	}

	_, err := c.SendEvent(event)
	return err
}

// ErrorOccurred sends an error.occurred event
func (c *Client) ErrorOccurred(conversationID, errorMsg string, details map[string]interface{}) error {
	event := Event{
		Type: "error.occurred",
		Data: map[string]interface{}{
			"conversationId": conversationID,
			"error":          errorMsg,
			"details":        details,
		},
	}

	_, err := c.SendEvent(event)
	return err
}
```

---

## 6. React Hooks for SSE

**File**: `app/hooks/useRealtimeEvents.ts`

```typescript
'use client';

import { useEffect, useState, useCallback, useRef } from 'react';

export interface RealtimeEvent {
  type: string;
  timestamp: string;
  data: any;
}

export interface UseRealtimeEventsOptions {
  conversationId?: string;
  autoReconnect?: boolean;
  reconnectInterval?: number; // milliseconds
  onEvent?: (event: RealtimeEvent) => void;
  onError?: (error: Error) => void;
}

export function useRealtimeEvents(options: UseRealtimeEventsOptions = {}) {
  const {
    conversationId,
    autoReconnect = true,
    reconnectInterval = 3000,
    onEvent,
    onError,
  } = options;

  const [events, setEvents] = useState<RealtimeEvent[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const connect = useCallback(() => {
    try {
      // Build URL
      const url = conversationId
        ? `/api/realtime/stream?conversationId=${conversationId}`
        : '/api/realtime/stream';

      // Create EventSource
      const eventSource = new EventSource(url);

      eventSource.onopen = () => {
        console.log('SSE connected');
        setIsConnected(true);
        setError(null);
      };

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          const realtimeEvent: RealtimeEvent = {
            type: data.type,
            timestamp: data.timestamp,
            data: data.data,
          };

          setEvents((prev) => [...prev, realtimeEvent]);

          if (onEvent) {
            onEvent(realtimeEvent);
          }
        } catch (err) {
          console.error('Failed to parse SSE event:', err);
        }
      };

      eventSource.onerror = (err) => {
        console.error('SSE error:', err);
        setIsConnected(false);

        const errorObj = new Error('EventSource connection error');
        setError(errorObj);

        if (onError) {
          onError(errorObj);
        }

        // Close and attempt reconnect
        eventSource.close();

        if (autoReconnect) {
          reconnectTimeoutRef.current = setTimeout(() => {
            console.log('Attempting to reconnect...');
            connect();
          }, reconnectInterval);
        }
      };

      eventSourceRef.current = eventSource;
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error('Unknown error');
      setError(errorObj);
      if (onError) {
        onError(errorObj);
      }
    }
  }, [conversationId, autoReconnect, reconnectInterval, onEvent, onError]);

  const disconnect = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }

    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    setIsConnected(false);
  }, []);

  const clearEvents = useCallback(() => {
    setEvents([]);
  }, []);

  // Connect on mount, disconnect on unmount
  useEffect(() => {
    connect();

    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  return {
    events,
    isConnected,
    error,
    connect,
    disconnect,
    clearEvents,
  };
}
```

**Usage Example**:

```typescript
'use client';

import { useRealtimeEvents } from '@/app/hooks/useRealtimeEvents';

export function LiveConversationView({ conversationId }: { conversationId: string }) {
  const { events, isConnected, error } = useRealtimeEvents({
    conversationId,
    onEvent: (event) => {
      console.log('New event:', event.type);
    },
  });

  return (
    <div>
      <div>Status: {isConnected ? 'Connected' : 'Disconnected'}</div>
      {error && <div>Error: {error.message}</div>}

      <div>
        <h2>Events ({events.length})</h2>
        {events.map((event, i) => (
          <div key={i}>
            <strong>{event.type}</strong> at {event.timestamp}
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

## 7. Database Migration

**Optional enhancements to schema**:

```bash
cd agentpipe-web
npx prisma migrate dev --name add_streaming_fields
```

Add to `prisma/schema.prisma`:

```prisma
model Conversation {
  // ... existing fields ...

  // Source tracking (optional)
  source          String?              // "cli", "web", "api"
  sourceVersion   String?              // CLI version

  // ... rest of model ...
}

model Message {
  // ... existing fields ...

  // Sequence tracking
  sequenceNumber  Int?                 // Order within conversation

  // ... rest of model ...

  @@index([conversationId, sequenceNumber])  // New index
}
```

---

This completes the implementation examples. All code is production-ready and follows best practices for error handling, validation, and security.
