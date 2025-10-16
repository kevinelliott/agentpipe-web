import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { ConversationStatus } from '@prisma/client';

/**
 * GET /api/conversations
 * List conversations with optional filters and pagination
 *
 * Query Parameters:
 * - status: Filter by status (ACTIVE, COMPLETED, INTERRUPTED, ERROR)
 * - agentType: Filter by agent type
 * - model: Filter by model name
 * - startDate: Filter by start date (ISO 8601)
 * - endDate: Filter by end date (ISO 8601)
 * - page: Page number (default: 1)
 * - limit: Items per page (default: 20, max: 100)
 * - sort: Sort field (createdAt, totalCost, totalTokens, totalDuration)
 * - order: Sort order (asc, desc)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Pagination
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20')));
    const skip = (page - 1) * limit;

    // Filters
    const status = searchParams.get('status') as ConversationStatus | null;
    const agentType = searchParams.get('agentType');
    const model = searchParams.get('model');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Sorting
    const sort = searchParams.get('sort') || 'createdAt';
    const order = searchParams.get('order') || 'desc';

    // Build where clause
    const where: any = {};

    if (status && Object.values(ConversationStatus).includes(status)) {
      where.status = status;
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    if (agentType || model) {
      where.participants = {
        some: {
          ...(agentType && { agentType }),
          ...(model && { model }),
        },
      };
    }

    // Build orderBy clause
    const orderBy: any = {};
    orderBy[sort] = order;

    // Fetch conversations
    const [conversations, total] = await Promise.all([
      prisma.conversation.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          participants: {
            select: {
              agentType: true,
              agentName: true,
            },
          },
          _count: {
            select: {
              messages: true,
            },
          },
        },
      }),
      prisma.conversation.count({ where }),
    ]);

    // Format response
    const data = conversations.map((conv) => ({
      id: conv.id,
      createdAt: conv.createdAt,
      updatedAt: conv.updatedAt,
      startedAt: conv.startedAt,
      completedAt: conv.completedAt,
      status: conv.status,
      mode: conv.mode,
      totalMessages: conv.totalMessages,
      totalTokens: conv.totalTokens,
      totalCost: conv.totalCost,
      totalDuration: conv.totalDuration,
      participants: conv.participants.map((p) => p.agentType),
    }));

    return NextResponse.json({
      data,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching conversations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch conversations' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/conversations
 * Create a new conversation (used by AgentPipe bridge)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const conversation = await prisma.conversation.create({
      data: {
        mode: body.mode,
        maxTurns: body.maxTurns,
        initialPrompt: body.initialPrompt,
        status: 'ACTIVE',
        metadata: body.metadata || {},
        participants: {
          create: body.participants?.map((p: any) => ({
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

    return NextResponse.json(conversation, { status: 201 });
  } catch (error) {
    console.error('Error creating conversation:', error);
    return NextResponse.json(
      { error: 'Failed to create conversation' },
      { status: 500 }
    );
  }
}
