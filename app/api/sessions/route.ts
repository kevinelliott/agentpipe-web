import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { ConversationStatus } from '@prisma/client';

/**
 * GET /api/sessions
 * List all conversations with filtering, pagination, and sorting
 *
 * Query Parameters:
 * - page: number (default: 1)
 * - pageSize: number (default: 20, max: 100)
 * - status: ConversationStatus (filter by status)
 * - mode: string (filter by mode)
 * - source: string (filter by source: web, cli-stream, cli-upload)
 * - startDate: ISO datetime (filter conversations started after this date)
 * - endDate: ISO datetime (filter conversations started before this date)
 * - sortBy: string (createdAt, totalMessages, totalTokens, totalCost, default: createdAt)
 * - sortOrder: string (asc, desc, default: desc)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    // Pagination
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get('pageSize') || '20', 10)));
    const skip = (page - 1) * pageSize;

    // Filters
    const status = searchParams.get('status') as ConversationStatus | null;
    const mode = searchParams.get('mode');
    const source = searchParams.get('source');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Sorting
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

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
      where.startedAt = {};
      if (startDate) {
        where.startedAt.gte = new Date(startDate);
      }
      if (endDate) {
        where.startedAt.lte = new Date(endDate);
      }
    }

    // Build orderBy clause
    const orderBy: any = {};
    const validSortFields = ['createdAt', 'startedAt', 'totalMessages', 'totalTokens', 'totalCost', 'totalDuration'];
    if (validSortFields.includes(sortBy)) {
      orderBy[sortBy] = sortOrder === 'asc' ? 'asc' : 'desc';
    } else {
      orderBy.createdAt = 'desc';
    }

    // Execute queries in parallel
    const [conversations, totalCount] = await Promise.all([
      prisma.conversation.findMany({
        where,
        orderBy,
        skip,
        take: pageSize,
        include: {
          participants: {
            select: {
              agentId: true,
              agentType: true,
              agentName: true,
              model: true,
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

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalCount / pageSize);
    const hasNextPage = page < totalPages;
    const hasPreviousPage = page > 1;

    return NextResponse.json({
      conversations: conversations.map((conv) => ({
        id: conv.id,
        name: conv.name,
        mode: conv.mode,
        status: conv.status,
        source: conv.source,
        startedAt: conv.startedAt.toISOString(),
        completedAt: conv.completedAt?.toISOString() || null,
        initialPrompt: conv.initialPrompt,
        maxTurns: conv.maxTurns,
        totalMessages: conv.totalMessages,
        totalTokens: conv.totalTokens,
        totalCost: conv.totalCost,
        totalDuration: conv.totalDuration,
        errorMessage: conv.errorMessage,
        participants: conv.participants.map((p) => ({
          agentId: p.agentId,
          agentType: p.agentType,
          agentName: p.agentName,
          model: p.model,
        })),
        messageCount: conv._count.messages,
      })),
      pagination: {
        page,
        pageSize,
        totalCount,
        totalPages,
        hasNextPage,
        hasPreviousPage,
      },
    });
  } catch (error) {
    console.error('Error fetching sessions:', error);

    // Handle invalid date formats
    if (error instanceof Error && error.message.includes('Invalid Date')) {
      return NextResponse.json(
        { error: 'Invalid date format', details: 'Use ISO 8601 format for dates' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to fetch sessions' },
      { status: 500 }
    );
  }
}
