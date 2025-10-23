import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { ConversationStatus } from '@prisma/client';
import { spawnAgentPipeContainer, type AgentConfig } from '@/app/lib/docker';

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

    // Pagination (support both 'limit' and 'pageSize' parameters)
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('pageSize') || searchParams.get('limit') || '20')));
    const skip = (page - 1) * limit;

    // Filters
    const status = searchParams.get('status') as ConversationStatus | null;
    const mode = searchParams.get('mode');
    const source = searchParams.get('source');
    const agentType = searchParams.get('agentType');
    const model = searchParams.get('model');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Sorting (support both 'sort'/'order' and 'sortBy'/'sortOrder' parameters)
    const sort = searchParams.get('sortBy') || searchParams.get('sort') || 'createdAt';
    const order = searchParams.get('sortOrder') || searchParams.get('order') || 'desc';

    // Build where clause
    const where: any = {};

    if (status && Object.values(ConversationStatus).includes(status)) {
      where.status = status;
    }

    if (mode) {
      where.mode = mode;
    }

    if (source) {
      where.source = source;
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

    // Format response to match frontend expectations
    const formattedConversations = conversations.map((conv) => ({
      id: conv.id,
      name: conv.name,
      mode: conv.mode,
      status: conv.status,
      source: conv.source,
      startedAt: conv.startedAt.toISOString(),
      completedAt: conv.completedAt?.toISOString() || null,
      initialPrompt: conv.initialPrompt,
      summaryText: conv.summaryText,
      summaryAgentType: conv.summaryAgentType,
      summaryModel: conv.summaryModel,
      totalMessages: conv.totalMessages,
      totalTokens: conv.totalTokens,
      totalCost: conv.totalCost,
      totalDuration: conv.totalDuration,
      errorMessage: conv.errorMessage,
      participants: conv.participants,
      messageCount: conv._count.messages,
    }));

    return NextResponse.json({
      conversations: formattedConversations,
      pagination: {
        page,
        pageSize: limit,
        totalCount: total,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page < Math.ceil(total / limit),
        hasPreviousPage: page > 1,
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
 * Create a new conversation and spawn an AgentPipe Docker container
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.name || !body.mode || !body.initialPrompt) {
      return NextResponse.json(
        { error: 'Missing required fields: name, mode, initialPrompt' },
        { status: 400 }
      );
    }

    // Validate mode
    const validModes = ['round-robin', 'reactive', 'free-form'];
    if (!validModes.includes(body.mode)) {
      return NextResponse.json(
        { error: 'Invalid mode. Must be one of: round-robin, reactive, free-form' },
        { status: 400 }
      );
    }

    // Create conversation in database
    const conversation = await prisma.conversation.create({
      data: {
        name: body.name,
        mode: body.mode,
        maxTurns: body.maxTurns || 10, // Default to 10 if not specified
        initialPrompt: body.initialPrompt,
        status: 'ACTIVE',
        containerStatus: 'starting',
        metadata: body.metadata || {},
        participants: {
          create: body.participants?.map((p: any, index: number) => ({
            agentId: p.agentId || `agent-${index}`,
            agentType: p.agentType || p.type,
            agentName: p.agentName || p.name || `${p.type}-${index}`,
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

    // Prepare agents for Docker spawn
    const agents: AgentConfig[] = (body.participants || []).map((p: any) => ({
      type: p.agentType || p.type,
      model: p.model,
      name: p.agentName || p.name,
      prompt: p.prompt,
    }));

    // Spawn Docker container with AgentPipe
    const dockerResult = await spawnAgentPipeContainer(conversation.id, {
      mode: body.mode,
      maxTurns: body.maxTurns,
      initialPrompt: body.initialPrompt,
      agents,
    });

    // Update conversation with container information
    const updatedConversation = await prisma.conversation.update({
      where: { id: conversation.id },
      data: {
        containerId: dockerResult.containerId || null,
        containerStatus: dockerResult.success ? 'running' : 'error',
        status: dockerResult.success ? 'ACTIVE' : 'ERROR',
        errorMessage: dockerResult.error || null,
        errorStack: dockerResult.errorStack || null,
      },
      include: {
        participants: true,
      },
    });

    // Log event
    await prisma.event.create({
      data: {
        type: 'conversation.created',
        conversationId: conversation.id,
        data: {
          conversationId: conversation.id,
          mode: body.mode,
          agentCount: agents.length,
          containerSuccess: dockerResult.success,
        },
        errorMessage: dockerResult.error || null,
        errorStack: dockerResult.errorStack || null,
      },
    });

    return NextResponse.json(
      {
        conversation: updatedConversation,
        success: dockerResult.success,
        error: dockerResult.error,
      },
      { status: dockerResult.success ? 201 : 500 }
    );
  } catch (error) {
    console.error('Error creating conversation:', error);

    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : undefined;

    // Try to log error event (don't throw if this fails)
    try {
      await prisma.event.create({
        data: {
          type: 'conversation.error',
          data: {
            error: errorMessage,
          },
          errorMessage,
          errorStack,
        },
      });
    } catch (eventError) {
      console.error('Failed to log error event:', eventError);
    }

    return NextResponse.json(
      {
        error: 'Failed to create conversation',
        details: errorMessage,
      },
      { status: 500 }
    );
  }
}
