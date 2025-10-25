/**
 * Agent Showcase Page
 * Displays all 14 supported AI agents with metadata and statistics
 */

import { Metadata } from 'next';
import { AgentsPageClient } from '@/app/components/agent/AgentsPageClient';
import { getAllAgentsMetadata } from '@/app/lib/agentMetadata';
import { getAggregatedAgentStats } from '@/app/lib/agentStats';

export const metadata: Metadata = {
  title: 'AI Agents - AgentPipe',
  description:
    'Explore all 14 supported AI agents. Compare capabilities, statistics, and find the perfect agent for your workflow.',
  keywords: ['AI agents', 'Claude', 'Gemini', 'Copilot', 'code generation', 'agent comparison'],
  openGraph: {
    title: 'AI Agents - AgentPipe',
    description: 'Discover and compare all supported AI agents with real-time statistics',
    type: 'website',
  },
};

export const revalidate = 300; // ISR: Revalidate every 5 minutes

export default async function AgentsPage() {
  // Fetch agent metadata and statistics
  const agents = getAllAgentsMetadata();
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

  return <AgentsPageClient agents={agentsWithStats} stats={stats.summary} />;
}
