'use client';

import { useState } from 'react';
import { AgentMetadata } from '@/app/lib/agentMetadata';
import type { AgentStats } from '@/app/lib/agentStats';
import { AgentCard } from './AgentCard';
import { AgentDetails } from './AgentDetails';

interface AgentsPageClientProps {
  agents: (AgentMetadata & { stats: AgentStats })[];
  stats: {
    totalConversations: number;
    totalAgents: number;
    totalMessages: number;
    totalTokens: number;
    totalCost: number;
  };
}

export function AgentsPageClient({ agents, stats }: AgentsPageClientProps) {
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);

  const selectedAgent = selectedAgentId
    ? agents.find((a) => a.id === selectedAgentId)
    : null;

  // Group agents by category
  const commercialAgents = agents.filter((a) => a.category === 'commercial');
  const openSourceAgents = agents.filter((a) => a.category === 'open-source');

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
        {/* Header */}
        <div className="mb-12 max-w-3xl">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-foreground mb-4">
            Explore All Agents
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            AgentPipe supports 14 different AI agents from leading providers. Click on any agent to
            learn more about its capabilities, see real-world statistics, and find the links to get
            started.
          </p>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="text-2xl sm:text-3xl font-bold text-primary">
              {stats.totalAgents}
            </div>
            <div className="text-sm text-muted-foreground">Active Agents</div>
          </div>
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="text-2xl sm:text-3xl font-bold text-primary">
              {stats.totalConversations}
            </div>
            <div className="text-sm text-muted-foreground">Total Conversations</div>
          </div>
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="text-2xl sm:text-3xl font-bold text-primary">
              {formatTokens(stats.totalTokens)}
            </div>
            <div className="text-sm text-muted-foreground">Total Tokens</div>
          </div>
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="text-2xl sm:text-3xl font-bold text-primary">
              ${stats.totalCost.toFixed(2)}
            </div>
            <div className="text-sm text-muted-foreground">Total Cost</div>
          </div>
        </div>

        {/* Main Layout: Grid + Side Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Agent Cards */}
          <div className="lg:col-span-2 space-y-12">
            {/* Commercial Agents */}
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-6">Commercial Agents</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {commercialAgents.map((agent) => (
                  <AgentCard
                    key={agent.id}
                    agent={agent}
                    isSelected={selectedAgentId === agent.id}
                    onClick={() => setSelectedAgentId(agent.id)}
                  />
                ))}
              </div>
            </div>

            {/* Open Source Agents */}
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-6">Open Source Agents</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {openSourceAgents.map((agent) => (
                  <AgentCard
                    key={agent.id}
                    agent={agent}
                    isSelected={selectedAgentId === agent.id}
                    onClick={() => setSelectedAgentId(agent.id)}
                  />
                ))}
              </div>
            </div>

            {/* Integration Note - Mobile */}
            <div className="lg:hidden bg-muted/30 border border-border rounded-lg p-6">
              <h3 className="font-semibold text-foreground mb-2">Want to integrate more agents?</h3>
              <p className="text-sm text-muted-foreground mb-4">
                AgentPipe is open source and extensible. You can add support for additional AI
                agents by contributing to the project.
              </p>
              <a
                href="https://github.com/kevinelliott/agentpipe"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-primary hover:underline text-sm font-medium"
              >
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v 3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
                View on GitHub
              </a>
            </div>
          </div>

          {/* Right Column: Details Panel */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 lg:border border-border lg:rounded-lg lg:overflow-hidden lg:bg-card">
              {/* Mobile: Show as sheet/drawer below on small screens */}
              {selectedAgent ? (
                <div className="lg:h-full">
                  <AgentDetails agent={selectedAgent} onClose={() => setSelectedAgentId(null)} />
                </div>
              ) : (
                <div className="hidden lg:flex lg:h-full">
                  <AgentDetails agent={null} />
                </div>
              )}

              {/* Integration Note - Desktop */}
              {!selectedAgent && (
                <div className="hidden lg:block absolute bottom-0 left-0 right-0 bg-muted/30 border-t border-border p-6">
                  <h3 className="font-semibold text-foreground mb-2">Want to integrate more?</h3>
                  <p className="text-xs text-muted-foreground mb-3">
                    AgentPipe is open source and extensible.
                  </p>
                  <a
                    href="https://github.com/kevinelliott/agentpipe"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-primary hover:underline text-xs font-medium"
                  >
                    <svg
                      className="w-3 h-3"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v 3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                    </svg>
                    GitHub
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Format tokens with K/M suffixes
 */
function formatTokens(tokens: number): string {
  if (tokens >= 1_000_000) {
    return `${(tokens / 1_000_000).toFixed(1)}M`;
  }
  if (tokens >= 1_000) {
    return `${(tokens / 1_000).toFixed(1)}K`;
  }
  return tokens.toString();
}
