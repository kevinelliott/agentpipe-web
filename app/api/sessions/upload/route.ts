import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { sessionUploadSchema } from '@/app/lib/schemas/streaming';
import crypto from 'crypto';

/**
 * POST /api/sessions/upload
 * Bulk upload endpoint for historical AgentPipe sessions
 *
 * This endpoint accepts complete session data (conversation + agents + messages)
 * and stores it in the database as a single transaction.
 *
 * Authentication: Bearer token (AGENTPIPE_BRIDGE_API_KEY)
 * Rate Limit: 10 requests/minute
 */
export async function POST(request: NextRequest) {
  try {
    // Authenticate request
    const authHeader = request.headers.get('authorization');
    const expectedToken = process.env.AGENTPIPE_BRIDGE_API_KEY;

    if (!authHeader || !expectedToken) {
      return NextResponse.json(
        { error: 'Unauthorized', details: 'Missing or invalid authorization header' },
        { status: 401 }
      );
    }

    const token = authHeader.replace('Bearer ', '');

    // Constant-time comparison to prevent timing attacks
    const expectedBuffer = Buffer.from(expectedToken);
    const tokenBuffer = Buffer.from(token);
    const isValid = expectedBuffer.length === tokenBuffer.length &&
                   crypto.timingSafeEqual(expectedBuffer, tokenBuffer);

    if (!isValid) {
      return NextResponse.json(
        { error: 'Unauthorized', details: 'Invalid API key' },
        { status: 401 }
      );
    }

    // Parse and validate request body
    const body = await request.json();

    // Validate session upload structure
    const validationResult = sessionUploadSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Invalid session format',
          details: validationResult.error.issues
        },
        { status: 400 }
      );
    }

    const sessionData = validationResult.data;
    const { conversation, agents, messages } = sessionData;

    // Generate conversation ID if not provided
    const conversationId = conversation.id || crypto.randomUUID();

    // Create conversation, agents, and messages in a single transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create conversation
      const createdConversation = await tx.conversation.create({
        data: {
          id: conversationId,
          name: conversation.name,
          mode: conversation.mode,
          maxTurns: conversation.max_turns ?? null,
          initialPrompt: conversation.initial_prompt,
          status: conversation.status,
          source: 'cli-upload',
          startedAt: new Date(conversation.started_at),
          completedAt: conversation.completed_at ? new Date(conversation.completed_at) : null,
          totalMessages: conversation.total_messages ?? messages.length,
          totalTokens: conversation.total_tokens ??
            messages.reduce((sum, m) => sum + (m.tokens_used || 0), 0),
          totalCost: conversation.total_cost ??
            messages.reduce((sum, m) => sum + (m.cost || 0), 0),
          totalDuration: conversation.total_duration ??
            messages.reduce((sum, m) => sum + (m.duration_ms || 0), 0),
          // System information (optional for bulk uploads)
          agentpipeVersion: conversation.system_info?.agentpipe_version,
          systemOS: conversation.system_info?.os,
          systemOSVersion: conversation.system_info?.os_version,
          systemGoVersion: conversation.system_info?.go_version,
          systemArchitecture: conversation.system_info?.architecture,
        },
      });

      // Create agents
      const createdAgents = await Promise.all(
        agents.map((agent) =>
          tx.conversationAgent.create({
            data: {
              conversationId,
              agentId: `${conversationId}-${agent.agent_type}`,
              agentType: agent.agent_type,
              agentName: agent.agent_name,
              agentVersion: agent.agent_version ?? null,
              model: agent.model,
              prompt: agent.prompt,
              cliVersion: agent.cli_version,
            },
          })
        )
      );

      // Create messages
      const createdMessages = await Promise.all(
        messages.map((message, index) =>
          tx.message.create({
            data: {
              conversationId,
              agentId: `${conversationId}-${message.agent_type}`,
              agentName: message.agent_name,
              agentType: message.agent_type,
              agentVersion: message.agent_version ?? null,
              content: message.content,
              role: message.role || 'agent',
              timestamp: new Date(message.timestamp),
              sequenceNumber: message.sequence_number ?? index + 1,
              turnNumber: message.turn_number,
              duration: message.duration_ms,
              inputTokens: message.input_tokens,
              outputTokens: message.output_tokens,
              totalTokens: message.tokens_used,
              model: message.model,
              cost: message.cost,
            },
          })
        )
      );

      return {
        conversation: createdConversation,
        agents: createdAgents,
        messages: createdMessages,
      };
    });

    return NextResponse.json(
      {
        conversation_id: result.conversation.id,
        message_count: result.messages.length,
        agent_count: result.agents.length,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error uploading session:', error);

    // Handle specific Prisma errors
    if (error instanceof Error) {
      // Unique constraint violation (duplicate conversation ID)
      if (error.message.includes('Unique constraint')) {
        return NextResponse.json(
          {
            error: 'Duplicate session',
            details: 'A session with this ID already exists'
          },
          { status: 409 }
        );
      }

      // Foreign key constraint violation
      if (error.message.includes('Foreign key constraint')) {
        return NextResponse.json(
          {
            error: 'Invalid reference',
            details: 'Referenced conversation or agent does not exist'
          },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Failed to upload session' },
      { status: 500 }
    );
  }
}
