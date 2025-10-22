import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { eventManager } from '@/app/lib/eventManager';
import { streamingEventSchema } from '@/app/lib/schemas/streaming';
import crypto from 'crypto';

/**
 * POST /api/ingest
 * Webhook endpoint for AgentPipe bridge to send realtime events
 *
 * This endpoint receives events from the AgentPipe bridge component
 * and stores them in the database while broadcasting to SSE clients.
 *
 * Authentication: Bearer token (AGENTPIPE_BRIDGE_API_KEY)
 * Rate Limit: 100 requests/minute per conversation
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

    // Validate event structure
    const validationResult = streamingEventSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Invalid event format',
          details: validationResult.error.issues
        },
        { status: 400 }
      );
    }

    const event = validationResult.data;
    const { type, data } = event;

    // Handle different event types
    switch (type) {
      case 'conversation.started': {
        // Support both 'participants' (new) and 'agents' (old) field names
        const agentList = data.participants || data.agents;

        // This should never happen due to Zod validation, but TypeScript needs the check
        if (!agentList) {
          return NextResponse.json(
            { error: 'Invalid event format', details: 'Missing participants or agents field' },
            { status: 400 }
          );
        }

        // Create conversation in database
        const conversation = await prisma.conversation.create({
          data: {
            id: data.conversation_id, // Use CLI-provided ID for consistency
            name: `Conversation ${new Date().toLocaleString()}`,
            mode: data.mode,
            maxTurns: data.max_turns ?? null,
            initialPrompt: data.initial_prompt,
            status: 'ACTIVE',
            source: 'cli-stream',
            startedAt: new Date(event.timestamp),
            // System information
            agentpipeVersion: data.system_info.agentpipe_version,
            systemOS: data.system_info.os,
            systemOSVersion: data.system_info.os_version,
            systemGoVersion: data.system_info.go_version,
            systemArchitecture: data.system_info.architecture,
            participants: {
              create: agentList.map((agent: any) => ({
                agentId: `${data.conversation_id}-${agent.agent_type}`,
                agentType: agent.agent_type,
                agentName: agent.name || agent.agent_type,
                agentVersion: agent.agent_version ?? null,
                model: agent.model,
                prompt: agent.prompt,
                cliVersion: agent.cli_version,
              })),
            },
          },
          include: {
            participants: true,
          },
        });

        // Broadcast original event with full data
        eventManager.emit({
          type: 'conversation.started',
          timestamp: new Date(event.timestamp),
          data: event.data, // Broadcast the original raw data from CLI
        });

        return NextResponse.json({ conversation_id: conversation.id }, { status: 201 });
      }

      case 'message.created': {
        // Create message in database
        const message = await prisma.message.create({
          data: {
            id: data.message_id,
            conversationId: data.conversation_id,
            agentId: `${data.conversation_id}-${data.agent_type}`,
            agentName: data.agent_name || data.agent_type,
            agentType: data.agent_type,
            agentVersion: data.agent_version ?? null,
            content: data.content,
            role: data.role || 'agent',
            timestamp: new Date(event.timestamp),
            sequenceNumber: data.sequence_number ?? null,
            turnNumber: data.turn_number ?? null,
            duration: data.duration_ms ?? null,
            inputTokens: data.input_tokens ?? null,
            outputTokens: data.output_tokens ?? null,
            totalTokens: data.tokens_used ?? null,
            model: data.model ?? null,
            cost: data.cost ?? null,
          },
        });

        // Update conversation aggregates
        await prisma.conversation.update({
          where: { id: data.conversation_id },
          data: {
            totalMessages: { increment: 1 },
            totalTokens: { increment: data.tokens_used || 0 },
            totalCost: { increment: data.cost || 0 },
            totalDuration: { increment: data.duration_ms || 0 },
          },
        });

        // Broadcast original event with full data
        eventManager.emit({
          type: 'message.created',
          timestamp: new Date(event.timestamp),
          data: event.data, // Broadcast the original raw data from CLI
        });

        return NextResponse.json({ message_id: message.id }, { status: 201 });
      }

      case 'conversation.completed': {
        // Map status to Prisma enum
        const statusMap = {
          'completed': 'COMPLETED',
          'interrupted': 'INTERRUPTED',
          'error': 'ERROR'
        } as const;

        // Update conversation status
        await prisma.conversation.update({
          where: { id: data.conversation_id },
          data: {
            status: statusMap[data.status],
            completedAt: new Date(event.timestamp),
            totalMessages: data.total_messages ?? undefined,
            totalTokens: data.total_tokens ?? undefined,
            totalCost: data.total_cost ?? undefined,
            totalDuration: data.duration_seconds ? data.duration_seconds * 1000 : undefined,
          },
        });

        // Broadcast original event with full data
        eventManager.emit({
          type: 'conversation.completed',
          timestamp: new Date(event.timestamp),
          data: event.data, // Broadcast the original raw data from CLI
        });

        return NextResponse.json({ success: true });
      }

      case 'conversation.error': {
        // Log error event
        await prisma.event.create({
          data: {
            type: 'conversation.error',
            conversationId: data.conversation_id,
            data: {
              error_message: data.error_message,
              error_type: data.error_type,
              agent_type: data.agent_type,
            },
            errorMessage: data.error_message,
          },
        });

        // Update conversation status to ERROR
        await prisma.conversation.update({
          where: { id: data.conversation_id },
          data: {
            status: 'ERROR',
            errorMessage: data.error_message,
          },
        });

        // Broadcast original event with full data
        eventManager.emit({
          type: 'conversation.error',
          timestamp: new Date(event.timestamp),
          data: event.data, // Broadcast the original raw data from CLI
        });

        return NextResponse.json({ success: true });
      }

      case 'bridge.test': {
        // Bridge connectivity test event
        console.log('Bridge test event received:', {
          timestamp: event.timestamp,
          message: data.message,
          system_info: data.system_info,
        });

        // Broadcast test event to SSE clients
        eventManager.emit({
          type: 'bridge.test',
          timestamp: new Date(event.timestamp),
          data: {
            message: data.message || 'Bridge test successful',
            system_info: data.system_info,
          },
        });

        return NextResponse.json({
          success: true,
          message: 'Bridge test successful',
          received_at: new Date().toISOString(),
        });
      }

      default:
        return NextResponse.json(
          { error: 'Unknown event type' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error processing ingest event:', error);
    return NextResponse.json(
      { error: 'Failed to process event' },
      { status: 500 }
    );
  }
}
