'use client';

import { AgentMetadata } from '@/app/lib/agentMetadata';
import type { AgentStats } from '@/app/lib/agentStats';
import { AgentAvatar } from './AgentAvatar';
import type { AgentType } from './AgentAvatar';

interface AgentCardProps {
  agent: AgentMetadata & { stats: AgentStats };
  isSelected?: boolean;
  onClick?: () => void;
}

export function AgentCard({ agent, isSelected = false, onClick }: AgentCardProps) {
  const agentType = agent.id as AgentType;

  return (
    <div
      onClick={onClick}
      className={`
        transition-all duration-200 cursor-pointer
        bg-card border rounded-lg overflow-hidden
        hover:border-primary/50 hover:shadow-md
        ${
          isSelected
            ? 'border-primary ring-2 ring-primary/30 shadow-lg'
            : 'border-border'
        }
      `}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          onClick?.();
        }
      }}
    >
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <AgentAvatar agent={agentType} size="md" />
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-foreground truncate">{agent.name}</h3>
              <p className="text-xs text-muted-foreground truncate">{agent.tagline}</p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-muted/30 rounded p-2 text-center">
            <div className="text-sm font-semibold text-foreground">
              {agent.stats.conversationCount}
            </div>
            <div className="text-xs text-muted-foreground">Conversations</div>
          </div>
          <div className="bg-muted/30 rounded p-2 text-center">
            <div className="text-sm font-semibold text-foreground">{agent.stats.messageCount}</div>
            <div className="text-xs text-muted-foreground">Messages</div>
          </div>
          <div className="bg-muted/30 rounded p-2 text-center">
            <div className="text-sm font-semibold text-foreground">
              {formatTokens(agent.stats.totalTokens)}
            </div>
            <div className="text-xs text-muted-foreground">Tokens</div>
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
