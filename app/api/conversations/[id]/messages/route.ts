import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';

/**
 * GET /api/conversations/:id/messages
 * Get paginated messages for a conversation
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);

    // Pagination
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '50')));
    const skip = (page - 1) * limit;

    const [messages, total] = await Promise.all([
      prisma.message.findMany({
        where: { conversationId: id },
        skip,
        take: limit,
        orderBy: {
          timestamp: 'asc',
        },
      }),
      prisma.message.count({
        where: { conversationId: id },
      }),
    ]);

    return NextResponse.json({
      data: messages,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/conversations/:id/messages
 * Add a new message to a conversation (used by AgentPipe bridge)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Create message
    const message = await prisma.message.create({
      data: {
        conversationId: id,
        agentId: body.agentId,
        agentName: body.agentName,
        agentType: body.agentType,
        content: body.content,
        role: body.role,
        timestamp: body.timestamp ? new Date(body.timestamp) : new Date(),
        duration: body.metrics?.duration,
        inputTokens: body.metrics?.inputTokens,
        outputTokens: body.metrics?.outputTokens,
        totalTokens: body.metrics?.totalTokens,
        model: body.metrics?.model,
        cost: body.metrics?.cost,
      },
    });

    // Update conversation aggregates
    await prisma.conversation.update({
      where: { id },
      data: {
        totalMessages: { increment: 1 },
        totalTokens: { increment: body.metrics?.totalTokens || 0 },
        totalCost: { increment: body.metrics?.cost || 0 },
        totalDuration: { increment: body.metrics?.duration || 0 },
      },
    });

    return NextResponse.json(message, { status: 201 });
  } catch (error) {
    console.error('Error creating message:', error);
    return NextResponse.json(
      { error: 'Failed to create message' },
      { status: 500 }
    );
  }
}
