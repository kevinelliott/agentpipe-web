import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { ConversationStatus } from '@prisma/client';

/**
 * POST /api/search
 * Full-text search across conversations and messages
 *
 * Request Body:
 * {
 *   query: string,
 *   filters: {
 *     status?: ConversationStatus[],
 *     agentTypes?: string[],
 *     models?: string[],
 *     startDate?: string,
 *     endDate?: string,
 *     minCost?: number,
 *     maxCost?: number,
 *     minTokens?: number,
 *     maxTokens?: number
 *   },
 *   page?: number,
 *   limit?: number,
 *   sort?: string,
 *   order?: 'asc' | 'desc'
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      query,
      filters = {},
      page = 1,
      limit = 20,
      sort = 'createdAt',
      order = 'desc',
    } = body;

    // Build where clause
    const where: any = {};

    // Full-text search in initial prompt or messages
    if (query) {
      where.OR = [
        { initialPrompt: { contains: query, mode: 'insensitive' } },
        {
          messages: {
            some: {
              content: { contains: query, mode: 'insensitive' },
            },
          },
        },
      ];
    }

    // Status filter
    if (filters.status && filters.status.length > 0) {
      where.status = { in: filters.status };
    }

    // Date range filter
    if (filters.startDate || filters.endDate) {
      where.createdAt = {};
      if (filters.startDate) where.createdAt.gte = new Date(filters.startDate);
      if (filters.endDate) where.createdAt.lte = new Date(filters.endDate);
    }

    // Cost filter
    if (filters.minCost !== undefined || filters.maxCost !== undefined) {
      where.totalCost = {};
      if (filters.minCost !== undefined) where.totalCost.gte = filters.minCost;
      if (filters.maxCost !== undefined) where.totalCost.lte = filters.maxCost;
    }

    // Tokens filter
    if (filters.minTokens !== undefined || filters.maxTokens !== undefined) {
      where.totalTokens = {};
      if (filters.minTokens !== undefined) where.totalTokens.gte = filters.minTokens;
      if (filters.maxTokens !== undefined) where.totalTokens.lte = filters.maxTokens;
    }

    // Agent type or model filter
    if (filters.agentTypes?.length > 0 || filters.models?.length > 0) {
      where.participants = {
        some: {
          ...(filters.agentTypes?.length > 0 && { agentType: { in: filters.agentTypes } }),
          ...(filters.models?.length > 0 && { model: { in: filters.models } }),
        },
      };
    }

    // Pagination
    const skip = (page - 1) * limit;
    const orderBy: any = {};
    orderBy[sort] = order;

    // Execute search
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
              model: true,
            },
          },
          messages: {
            take: 3, // Include first 3 messages for preview
            orderBy: {
              timestamp: 'asc',
            },
            select: {
              id: true,
              agentName: true,
              content: true,
              timestamp: true,
            },
          },
        },
      }),
      prisma.conversation.count({ where }),
    ]);

    // Format results
    const results = conversations.map((conv) => ({
      id: conv.id,
      createdAt: conv.createdAt,
      status: conv.status,
      mode: conv.mode,
      initialPrompt: conv.initialPrompt.substring(0, 200), // Truncate for preview
      totalMessages: conv.totalMessages,
      totalTokens: conv.totalTokens,
      totalCost: conv.totalCost,
      totalDuration: conv.totalDuration,
      participants: conv.participants,
      messagePreview: conv.messages,
    }));

    return NextResponse.json({
      results,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error searching conversations:', error);
    return NextResponse.json(
      { error: 'Search failed' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/search/agents
 * Get list of unique agent types across all conversations
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    if (type === 'agents') {
      const agents = await prisma.conversationAgent.groupBy({
        by: ['agentType'],
        _count: {
          agentType: true,
        },
      });

      return NextResponse.json({
        agents: agents.map((a) => ({
          type: a.agentType,
          count: a._count.agentType,
        })),
      });
    }

    if (type === 'models') {
      const models = await prisma.conversationAgent.groupBy({
        by: ['model'],
        _count: {
          model: true,
        },
        where: {
          model: {
            not: null,
          },
        },
      });

      return NextResponse.json({
        models: models.map((m) => ({
          model: m.model,
          count: m._count.model,
        })),
      });
    }

    return NextResponse.json(
      { error: 'Invalid type parameter' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error fetching search metadata:', error);
    return NextResponse.json(
      { error: 'Failed to fetch metadata' },
      { status: 500 }
    );
  }
}
