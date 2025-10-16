import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { eventManager } from '@/app/lib/eventManager';

/**
 * POST /api/ingest
 * Webhook endpoint for AgentPipe bridge to send realtime events
 *
 * This endpoint receives events from the AgentPipe bridge component
 * and stores them in the database while broadcasting to SSE clients.
 *
 * Authentication: Bearer token (AGENTPIPE_BRIDGE_API_KEY)
 */
export async function POST(request: NextRequest) {
  try {
    // Authenticate request
    const authHeader = request.headers.get('authorization');
    const expectedToken = process.env.AGENTPIPE_BRIDGE_API_KEY;

    if (!authHeader || !expectedToken) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    if (token !== expectedToken) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    const event = await request.json();
    const { type, data } = event;

    // Handle different event types
    switch (type) {
      case 'conversation.started': {
        // Create conversation in database
        const conversation = await prisma.conversation.create({
          data: {
            mode: data.mode,
            maxTurns: data.maxTurns,
            initialPrompt: data.initialPrompt,
            status: 'ACTIVE',
            metadata: data.metadata || {},
            participants: {
              create: data.participants?.map((p: any) => ({
                agentId: p.agentId,
                agentType: p.agentType,
                agentName: p.agentName,
                model: p.model,
                prompt: p.prompt,
                announcement: p.announcement,
                settings: p.settings || {},
              })) || [],
            },
          },
          include: {
            participants: true,
          },
        });

        // Broadcast event
        eventManager.emitConversationStarted({
          conversationId: conversation.id,
          mode: conversation.mode,
          participants: conversation.participants.map(p => p.agentType),
          initialPrompt: conversation.initialPrompt,
        });

        return NextResponse.json({ conversationId: conversation.id }, { status: 201 });
      }

      case 'message.created': {
        // Create message in database
        const message = await prisma.message.create({
          data: {
            conversationId: data.conversationId,
            agentId: data.message.agentId,
            agentName: data.message.agentName,
            agentType: data.message.agentType,
            content: data.message.content,
            role: data.message.role,
            timestamp: data.message.timestamp ? new Date(data.message.timestamp) : new Date(),
            duration: data.message.metrics?.duration,
            inputTokens: data.message.metrics?.inputTokens,
            outputTokens: data.message.metrics?.outputTokens,
            totalTokens: data.message.metrics?.totalTokens,
            model: data.message.metrics?.model,
            cost: data.message.metrics?.cost,
          },
        });

        // Update conversation aggregates
        await prisma.conversation.update({
          where: { id: data.conversationId },
          data: {
            totalMessages: { increment: 1 },
            totalTokens: { increment: data.message.metrics?.totalTokens || 0 },
            totalCost: { increment: data.message.metrics?.cost || 0 },
            totalDuration: { increment: data.message.metrics?.duration || 0 },
          },
        });

        // Broadcast event
        eventManager.emitMessageCreated({
          conversationId: data.conversationId,
          message,
        });

        return NextResponse.json({ messageId: message.id }, { status: 201 });
      }

      case 'conversation.completed': {
        // Update conversation status
        await prisma.conversation.update({
          where: { id: data.conversationId },
          data: {
            status: 'COMPLETED',
            completedAt: new Date(),
          },
        });

        // Broadcast event
        eventManager.emitConversationCompleted(data);

        return NextResponse.json({ success: true });
      }

      case 'conversation.interrupted': {
        // Update conversation status
        await prisma.conversation.update({
          where: { id: data.conversationId },
          data: {
            status: 'INTERRUPTED',
            completedAt: new Date(),
            metadata: data.reason ? { interruptReason: data.reason } : undefined,
          },
        });

        // Broadcast event
        eventManager.emitConversationInterrupted(data);

        return NextResponse.json({ success: true });
      }

      case 'error.occurred': {
        // Log error event
        await prisma.event.create({
          data: {
            type: 'error',
            conversationId: data.conversationId,
            data: data.details || {},
            errorMessage: data.error,
          },
        });

        // Broadcast event
        eventManager.emitError(data);

        return NextResponse.json({ success: true });
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
