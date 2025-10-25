/**
 * Agent Showcase API
 * GET /api/agents/showcase
 * Returns all agents with metadata and statistics
 */

import { NextResponse } from 'next/server';
import { getAllAgentsMetadata } from '@/app/lib/agentMetadata';
import { getAggregatedAgentStats } from '@/app/lib/agentStats';

export async function GET() {
  try {
    // Get metadata for all agents
    const agents = getAllAgentsMetadata();

    // Get aggregated statistics for all agents
    const stats = await getAggregatedAgentStats();

    // Combine metadata with statistics
    const agentsWithStats = agents.map((agent) => {
      const agentStats = stats.agents.find((s) => s.agentType === agent.id);
      return {
        ...agent,
        stats: agentStats || {
          agentType: agent.id,
          conversationCount: 0,
          participantCount: 0,
          messageCount: 0,
          totalTokens: 0,
          totalCost: 0,
          averageTokensPerConversation: 0,
          averageCostPerConversation: 0,
          lastActivityAt: null,
        },
      };
    });

    // Return response with caching headers
    return NextResponse.json(
      {
        agents: agentsWithStats,
        summary: stats.summary,
        timestamp: stats.timestamp,
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600', // 5 min cache, 10 min stale
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Error fetching agent showcase:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch agent showcase',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
