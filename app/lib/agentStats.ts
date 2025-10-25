/**
 * Agent Statistics Service
 * Aggregates and caches statistics for all agents from the database
 * Implements in-memory caching with 5-minute TTL
 */

import { prisma } from './prisma';

export interface AgentStats {
  agentType: string;
  conversationCount: number;
  participantCount: number;
  messageCount: number;
  totalTokens: number;
  totalCost: number;
  averageTokensPerConversation: number;
  averageCostPerConversation: number;
  lastActivityAt: Date | null;
}

export interface AggregatedStats {
  agents: AgentStats[];
  summary: {
    totalConversations: number;
    totalAgents: number;
    totalMessages: number;
    totalTokens: number;
    totalCost: number;
  };
  timestamp: Date;
}

interface CacheEntry {
  data: AggregatedStats;
  expiresAt: number;
}

// In-memory cache with 5-minute TTL (300,000 ms)
const CACHE_TTL = 5 * 60 * 1000;
let statsCache: CacheEntry | null = null;

/**
 * Check if cache is still valid
 */
function isCacheValid(): boolean {
  if (!statsCache) return false;
  return Date.now() < statsCache.expiresAt;
}

/**
 * Clear the cache (called when new data is ingested)
 */
export function invalidateStatsCache(): void {
  statsCache = null;
}

/**
 * Get statistics for all agents (cached)
 */
export async function getAggregatedAgentStats(): Promise<AggregatedStats> {
  // Return cached data if valid
  if (isCacheValid() && statsCache) {
    return statsCache.data;
  }

  // Fetch fresh data from database
  const data = await fetchAggregatedAgentStats();

  // Cache the result
  statsCache = {
    data,
    expiresAt: Date.now() + CACHE_TTL,
  };

  return data;
}

/**
 * Fetch aggregated statistics from database (without cache)
 */
async function fetchAggregatedAgentStats(): Promise<AggregatedStats> {
  try {
    // Get all unique agent types from conversations
    const agentTypes = await prisma.conversationAgent.findMany({
      select: { agentType: true },
      distinct: ['agentType'],
    });

    // Aggregate stats for each agent type
    const agentStats: AgentStats[] = [];
    let totalConversations = 0;
    let totalMessages = 0;
    let totalTokens = 0;
    let totalCost = 0;

    for (const { agentType } of agentTypes) {
      const stats = await getAgentStatsForType(agentType);
      if (stats) {
        agentStats.push(stats);
        totalConversations += stats.conversationCount;
        totalMessages += stats.messageCount;
        totalTokens += stats.totalTokens;
        totalCost += stats.totalCost;
      }
    }

    return {
      agents: agentStats.sort((a, b) => b.conversationCount - a.conversationCount),
      summary: {
        totalConversations,
        totalAgents: agentTypes.length,
        totalMessages,
        totalTokens,
        totalCost,
      },
      timestamp: new Date(),
    };
  } catch (error) {
    console.error('Error fetching aggregated agent stats:', error);
    return {
      agents: [],
      summary: {
        totalConversations: 0,
        totalAgents: 0,
        totalMessages: 0,
        totalTokens: 0,
        totalCost: 0,
      },
      timestamp: new Date(),
    };
  }
}

/**
 * Get statistics for a specific agent type
 */
async function getAgentStatsForType(agentType: string): Promise<AgentStats | null> {
  try {
    // Get all conversations where this agent participated
    const conversationIds = await prisma.conversationAgent.findMany({
      where: { agentType },
      select: { conversationId: true },
      distinct: ['conversationId'],
    });

    if (conversationIds.length === 0) {
      return null;
    }

    const conversationIdList = conversationIds.map((c) => c.conversationId);

    // Get conversation stats
    const conversations = await prisma.conversation.findMany({
      where: { id: { in: conversationIdList } },
      select: {
        id: true,
        totalTokens: true,
        totalCost: true,
        startedAt: true,
        updatedAt: true,
        messages: {
          select: { id: true },
        },
      },
    });

    const totalTokens = conversations.reduce((sum, c) => sum + (c.totalTokens || 0), 0);
    const totalCost = conversations.reduce((sum, c) => sum + (c.totalCost || 0), 0);
    const totalMessages = conversations.reduce((sum, c) => sum + c.messages.length, 0);
    const lastActivityAt = conversations.length
      ? new Date(Math.max(...conversations.map((c) => c.updatedAt.getTime())))
      : null;

    return {
      agentType,
      conversationCount: conversations.length,
      participantCount: conversationIds.length,
      messageCount: totalMessages,
      totalTokens,
      totalCost,
      averageTokensPerConversation:
        conversations.length > 0 ? Math.round(totalTokens / conversations.length) : 0,
      averageCostPerConversation:
        conversations.length > 0 ? Number((totalCost / conversations.length).toFixed(4)) : 0,
      lastActivityAt,
    };
  } catch (error) {
    console.error(`Error fetching stats for agent type ${agentType}:`, error);
    return null;
  }
}

/**
 * Get detailed stats for a specific agent (includes recent conversations)
 */
export async function getDetailedAgentStats(agentType: string, limit: number = 10) {
  try {
    const baseStats = await getAgentStatsForType(agentType);
    if (!baseStats) return null;

    // Get recent conversations with this agent
    const recentConversations = await prisma.conversation.findMany({
      where: {
        participants: {
          some: { agentType },
        },
      },
      select: {
        id: true,
        name: true,
        status: true,
        startedAt: true,
        totalMessages: true,
        totalTokens: true,
        totalCost: true,
      },
      orderBy: { startedAt: 'desc' },
      take: limit,
    });

    return {
      ...baseStats,
      recentConversations,
    };
  } catch (error) {
    console.error(`Error fetching detailed stats for agent type ${agentType}:`, error);
    return null;
  }
}
