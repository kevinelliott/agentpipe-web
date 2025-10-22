import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';

/**
 * GET /api/messages/recent
 * Get recent messages across all conversations
 *
 * Query Parameters:
 * - limit: number (default: 10, max: 50) - Number of messages to return
 * - status: ConversationStatus (default: ACTIVE) - Filter by conversation status
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    // Parse query parameters
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '10', 10)));
    const status = searchParams.get('status') || 'ACTIVE';

    // Fetch recent messages with conversation and participant info
    const messages = await prisma.message.findMany({
      where: {
        conversation: {
          status: status as any,
        },
      },
      orderBy: {
        timestamp: 'desc',
      },
      take: limit,
      include: {
        conversation: {
          select: {
            id: true,
            name: true,
            status: true,
          },
        },
      },
    });

    // Transform to response format
    const formattedMessages = messages.map((msg) => ({
      id: msg.id,
      conversationId: msg.conversationId,
      conversationName: msg.conversation.name,
      conversationStatus: msg.conversation.status,
      agentId: msg.agentId,
      agentName: msg.agentName,
      agentType: msg.agentType,
      agentVersion: msg.agentVersion,
      content: msg.content,
      role: msg.role,
      timestamp: msg.timestamp.toISOString(),
      sequenceNumber: msg.sequenceNumber,
      turnNumber: msg.turnNumber,
      duration: msg.duration,
      inputTokens: msg.inputTokens,
      outputTokens: msg.outputTokens,
      totalTokens: msg.totalTokens,
      model: msg.model,
      cost: msg.cost,
    }));

    return NextResponse.json({
      messages: formattedMessages,
      count: formattedMessages.length,
    });
  } catch (error) {
    console.error('Error fetching recent messages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch recent messages' },
      { status: 500 }
    );
  }
}
