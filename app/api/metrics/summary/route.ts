import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';

/**
 * GET /api/metrics/summary
 * Get aggregate metrics summary
 *
 * Query Parameters:
 * - startDate: Filter by start date (ISO 8601)
 * - endDate: Filter by end date (ISO 8601)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Build date filter
    const dateFilter: any = {};
    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) dateFilter.createdAt.gte = new Date(startDate);
      if (endDate) dateFilter.createdAt.lte = new Date(endDate);
    }

    // Get conversation counts
    const [
      totalConversations,
      activeConversations,
      aggregates,
      topAgents,
    ] = await Promise.all([
      prisma.conversation.count({ where: dateFilter }),
      prisma.conversation.count({
        where: {
          ...dateFilter,
          status: 'ACTIVE',
        },
      }),
      prisma.conversation.aggregate({
        where: dateFilter,
        _sum: {
          totalMessages: true,
          totalTokens: true,
          totalCost: true,
          totalDuration: true,
        },
        _avg: {
          totalDuration: true,
        },
      }),
      prisma.conversationAgent.groupBy({
        by: ['agentType'],
        _count: {
          agentType: true,
        },
        _sum: {
          conversation: {
            _sum: {
              totalCost: true,
            },
          },
        },
        orderBy: {
          _count: {
            agentType: 'desc',
          },
        },
        take: 10,
      }),
    ]);

    // Calculate top agents with costs
    const topAgentsWithCosts = await Promise.all(
      topAgents.map(async (agent) => {
        const conversations = await prisma.conversation.findMany({
          where: {
            ...dateFilter,
            participants: {
              some: {
                agentType: agent.agentType,
              },
            },
          },
          select: {
            totalCost: true,
          },
        });

        const totalCost = conversations.reduce((sum, conv) => sum + conv.totalCost, 0);

        return {
          type: agent.agentType,
          count: agent._count.agentType,
          totalCost,
        };
      })
    );

    return NextResponse.json({
      totalConversations,
      activeConversations,
      totalMessages: aggregates._sum.totalMessages || 0,
      totalTokens: aggregates._sum.totalTokens || 0,
      totalCost: aggregates._sum.totalCost || 0,
      averageConversationDuration: Math.round(aggregates._avg.totalDuration || 0),
      topAgents: topAgentsWithCosts,
    });
  } catch (error) {
    console.error('Error fetching metrics summary:', error);
    return NextResponse.json(
      { error: 'Failed to fetch metrics' },
      { status: 500 }
    );
  }
}
